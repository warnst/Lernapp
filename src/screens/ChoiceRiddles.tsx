import { useCallback, useMemo, useState } from 'react';
import { Screen } from '@/components/Screen';
import { STUFEN } from '@/config/levels';
import { QUIZ, QUIZ_TOPICS } from '@/content/quiz';
import type { QuizTopic } from '@/content/quiz/types';
import { UI } from '@/content/ui';
import type { Profile, Task, TowerType } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import {
  oddRound,
  quizPool,
  quizRound,
  quizTask,
  shadowRound,
} from '@/practice/tower/choice-riddles';
import { toggleSpeak } from '@/speech/speak';
import { autoReadOf } from '@/state/progress';
import { useAppState } from '@/state/context';
import { towerOf } from '@/state/reducer';
import styles from './ChoiceRiddles.module.css';
import { Game } from './Game';
import { TowerDone } from './TowerDone';

// Was passt nicht?, Schattenrätsel und Wissensfragen (docs/12 3.3, 3.4, 3.10).

/** Rätsel je Runde (eine Runde = eine Lampe) */
const PER_ROUND = 3;
/** Wissenskarten für den Doktorhut (docs/12 4.1) */
const DOCTOR_FACTS = 20;

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

/** Spielt eine Runde Aufgaben und zeigt danach den Turm. */
function Round({
  profile,
  kind,
  makeTasks,
  onFinished,
}: {
  profile: Profile;
  kind: TowerType;
  makeTasks: (seed: number) => Task[];
  onFinished?: (tasks: Task[]) => void;
}) {
  const { dispatch } = useAppState();
  const [seed, setSeed] = useState(newSeed);
  const [before, setBefore] = useState<number | null>(null);
  const tasks = useMemo(() => makeTasks(seed), [makeTasks, seed]);
  const onFinish = useCallback(() => {
    setBefore(towerOf(profile).lamps);
    onFinished?.(tasks);
    dispatch({ type: 'tower-solved', id: profile.id, kind });
  }, [dispatch, kind, onFinished, profile, tasks]);

  if (before !== null) {
    return (
      <TowerDone
        profile={profile}
        before={before}
        onAgain={() => {
          setBefore(null);
          setSeed(newSeed());
        }}
      />
    );
  }
  return (
    <Game key={seed} profile={profile} tasks={tasks} progressStyle="shells" onFinish={onFinish} />
  );
}

/** Adresse `/raetsel/was-passt-nicht` */
export function Odd({ profile }: { profile: Profile }) {
  const cfg = STUFEN[profile.stufe].tower.odd;
  const makeTasks = useCallback(
    (seed: number) => oddRound(cfg, profile.stufe, PER_ROUND, seed),
    [cfg, profile.stufe],
  );
  return <Round profile={profile} kind="odd" makeTasks={makeTasks} />;
}

/** Adresse `/raetsel/schatten` */
export function Shadow({ profile }: { profile: Profile }) {
  const cfg = STUFEN[profile.stufe].tower.shadow;
  const makeTasks = useCallback((seed: number) => shadowRound(cfg, PER_ROUND, seed), [cfg]);
  return <Round profile={profile} kind="shadow" makeTasks={makeTasks} />;
}

/** Adresse `/raetsel/wissensfragen`: Thema wählen, dann 5 Fragen. */
export function Quiz({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const cfg = STUFEN[profile.stufe];
  const stored = towerOf(profile).facts;
  const facts = useMemo(() => stored ?? [], [stored]);
  const [topic, setTopic] = useState<QuizTopic | null | undefined>(undefined);
  const makeTasks = useCallback(
    (seed: number) =>
      quizRound(profile.stufe, topic ?? null, facts, cfg.tower.quiz.questions, seed).map(quizTask),
    // facts nur beim Start einer Runde lesen
    // eslint-disable-next-line react-hooks/exhaustive-deps -- neue Karten sollen die Runde nicht neu mischen
    [profile.stufe, topic, cfg.tower.quiz.questions],
  );
  const onFinished = useCallback(
    (tasks: Task[]) => {
      const learned = new Set(facts);
      for (const t of tasks) {
        const id = t.id.replace(/^quiz-/, '');
        learned.add(id);
        dispatch({ type: 'fact-learned', id: profile.id, factId: id });
      }
      if (learned.size >= DOCTOR_FACTS) {
        dispatch({ type: 'wardrobe-grant', id: profile.id, itemId: 'doktorhut' });
      }
    },
    [dispatch, facts, profile.id],
  );

  if (topic !== undefined) {
    return <Round profile={profile} kind="quiz" makeTasks={makeTasks} onFinished={onFinished} />;
  }
  const choose = (next: QuizTopic | null, name: string) => {
    if (autoReadOf(profile)) toggleSpeak(name);
    setTopic(next);
  };
  return (
    <Screen title={UI.choiceRiddles.quizTitle}>
      <h2 className={styles.heading}>{UI.choiceRiddles.quizWhat}</h2>
      <div className={styles.topics}>
        {QUIZ_TOPICS.map((t) => {
          const pool = quizPool(profile.stufe, t.id);
          const have = pool.filter((q) => facts.includes(q.id)).length;
          return (
            <button
              key={t.id}
              type="button"
              className={styles.topic}
              onClick={() => {
                choose(t.id, t.name);
              }}
            >
              <ItemIcon itemId={t.icon} size={48} />
              <span className={styles.name}>{t.name}</span>
              <span className={styles.count}>{UI.choiceRiddles.quizCards(have, pool.length)}</span>
            </button>
          );
        })}
        <button
          type="button"
          className={styles.topic}
          onClick={() => {
            choose(null, UI.choiceRiddles.quizMixed);
          }}
        >
          <ItemIcon itemId="schatzkaestchen" size={48} />
          <span className={styles.name}>{UI.choiceRiddles.quizMixed}</span>
        </button>
      </div>
    </Screen>
  );
}

/** Wissensbuch in den Schätzen (`/schaetze/wissen`): gesammelte Karten nach Thema. */
export function KnowledgeBook({ profile }: { profile: Profile }) {
  const facts = towerOf(profile).facts ?? [];
  const cards = QUIZ.filter((q) => facts.includes(q.id));
  return (
    <Screen title={UI.choiceRiddles.knowledgeBook} withNav>
      {cards.length === 0 && <p className={styles.muted}>{UI.choiceRiddles.knowledgeEmpty}</p>}
      {QUIZ_TOPICS.map((t) => {
        const mine = cards.filter((q) => q.topic === t.id);
        if (mine.length === 0) return null;
        return (
          <section key={t.id} className={styles.page}>
            <h2 className={styles.pageTitle}>
              <ItemIcon itemId={t.icon} size={36} /> {t.name}
            </h2>
            <ul className={styles.cards}>
              {mine.map((q) => (
                <li key={q.id} className={styles.card}>
                  <p className={styles.question}>{q.question}</p>
                  <p>{q.fact}</p>
                  <button
                    type="button"
                    className={styles.read}
                    onClick={() => {
                      toggleSpeak(`${q.question} ${q.fact}`);
                    }}
                  >
                    {UI.choiceRiddles.read}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Screen>
  );
}
