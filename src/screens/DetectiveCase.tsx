import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { cx } from '@/components/cx';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { CASES, DETECTIVE_LINES, type DetectiveCase, type Suspect } from '@/content/cases';
import { CASE_LETTER } from '@/content/cipher';
import { UI } from '@/content/ui';
import type { KikoPose } from '@/domain/hints';
import { hashSeed, mulberry32, pick } from '@/domain/random';
import type { CaseSave, Profile } from '@/domain/types';
import { AvatarIllustration } from '@/illustrations/AvatarIllustration';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { buildRound } from '@/practice/round';
import { stopSpeaking, toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { towerOf } from '@/state/reducer';
import { CipherPuzzle } from './Cipher';
import styles from './DetectiveCase.module.css';
import { Game } from './Game';
import { TowerDone } from './TowerDone';

// Detektivfall (docs/12 3.9): Fallakte, Verdächtige, Hinweistafel, Rätsel, „Ich weiß es!“.

const FIRST_CASE_ITEMS = ['detektivhut', 'lupe'];

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

function SuspectPicture({ suspect, size }: { suspect: Suspect; size: number }) {
  switch (suspect.animal) {
    case 'moewe':
    case 'krebs':
    case 'seestern':
      return <ItemIcon itemId={suspect.animal} size={size} />;
    default:
      return <AvatarIllustration avatar={suspect.animal} size={size} />;
  }
}

function SuspectCard({
  suspect,
  cleared,
  onTap,
}: {
  suspect: Suspect;
  cleared: boolean;
  onTap?: () => void;
}) {
  const label = UI.case.suspectLabel(suspect.name, suspect.trait, cleared);
  const body = (
    <>
      <SuspectPicture suspect={suspect} size={56} />
      <span className={styles.name}>{suspect.name}</span>
      <span className={styles.trait}>{suspect.trait}</span>
      {cleared && (
        <span className={styles.cleared} aria-hidden="true">
          {UI.case.cleared}
        </span>
      )}
    </>
  );
  return onTap ? (
    <button
      type="button"
      className={cx(styles.suspect, cleared && styles.out)}
      aria-label={label}
      onClick={onTap}
    >
      {body}
    </button>
  ) : (
    <div className={cx(styles.suspect, cleared && styles.out)} role="img" aria-label={label}>
      {body}
    </div>
  );
}

/** Ein Rätsel im Fall: Muster & Co. der Stufe; beim Geheimbrief ist das letzte die Botschaft. */
function CaseRiddle({
  profile,
  detective,
  save,
  onSolved,
}: {
  profile: Profile;
  detective: DetectiveCase;
  save: CaseSave;
  onSolved: () => void;
}) {
  const cfg = STUFEN[profile.stufe];
  const lastStep = save.solved === cfg.tower.case.riddles - 1;
  const letter = detective.id === 'geheimbrief' && lastStep && cfg.tower.types.includes('cipher');
  const tasks = useMemo(
    () => buildRound('raetsel', profile.stufe, 1, hashSeed(save.seed, save.solved)),
    [profile.stufe, save.seed, save.solved],
  );
  const onFinish = useCallback(() => {
    onSolved();
  }, [onSolved]);
  if (letter) {
    return (
      <CipherPuzzle
        profile={profile}
        message={CASE_LETTER}
        seed={hashSeed(save.seed, 'brief')}
        onSolved={onSolved}
      />
    );
  }
  return <Game profile={profile} tasks={tasks} progressStyle="locks" onFinish={onFinish} />;
}

function Investigation({
  profile,
  detective,
  save,
  onSolved,
  onLeave,
}: {
  profile: Profile;
  detective: DetectiveCase;
  save: CaseSave;
  onSolved: (firstCase: boolean) => void;
  onLeave: () => void;
}) {
  const { dispatch } = useAppState();
  const cfg = STUFEN[profile.stufe];
  const { riddles, suspects: suspectCount } = cfg.tower.case;
  const suspects = detective.suspects.slice(0, suspectCount);
  const clues = detective.clues.slice(0, riddles);
  const pinned = clues.slice(0, save.solved);
  const cleared = new Set(pinned.flatMap((clue) => clue.excludes));
  const [riddle, setRiddle] = useState(false);
  const [pose, setPose] = useState<KikoPose>('hallo');
  const [line, setLine] = useState(save.solved === 0 ? detective.intro : UI.case.resumeLine);
  const ready = save.solved >= clues.length;

  const say = (text: string, nextPose: KikoPose = 'hallo') => {
    setLine(text);
    setPose(nextPose);
    if (cfg.autoRead) {
      stopSpeaking();
      toggleSpeak(text);
    }
  };

  const clueText = (index: number) => {
    const clue = clues[index];
    if (!clue) return '';
    return profile.stufe <= 2 ? clue.short : clue.text;
  };

  const onRiddleSolved = useCallback(() => {
    const next = { ...save, solved: save.solved + 1 };
    dispatch({ type: 'case-save', id: profile.id, save: next });
    setRiddle(false);
    const text = clueText(save.solved);
    const detectiveLine = pick(mulberry32(hashSeed(save.seed, save.solved)), DETECTIVE_LINES);
    say(`${detectiveLine} ${UI.case.pinned(text)}`, 'freut-sich');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- say und clueText hängen nur an save
  }, [dispatch, profile.id, save]);

  if (riddle) {
    return (
      <CaseRiddle profile={profile} detective={detective} save={save} onSolved={onRiddleSolved} />
    );
  }

  const accuse = (suspect: Suspect) => {
    if (suspect.id === detective.culprit) {
      const first = (towerOf(profile).cases ?? []).length === 0;
      dispatch({ type: 'case-solved', id: profile.id, caseId: detective.id });
      dispatch({ type: 'tower-solved', id: profile.id, kind: 'case' });
      if (first) {
        for (const itemId of FIRST_CASE_ITEMS)
          dispatch({ type: 'wardrobe-grant', id: profile.id, itemId });
      }
      onSolved(first);
      return;
    }
    const why = clues.find((clue) => clue.excludes.includes(suspect.id));
    const index = why ? clues.indexOf(why) : 0;
    say(UI.case.notThis(clueText(index)), 'zeigt');
  };

  return (
    <Screen title={detective.title}>
      <SpeechBubble pose={pose} kikoSize={52}>
        {line}
      </SpeechBubble>
      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.case.suspects}</h2>
        <div className={styles.suspects}>
          {suspects.map((suspect) => (
            <SuspectCard
              key={suspect.id}
              suspect={suspect}
              cleared={cleared.has(suspect.id)}
              {...(ready
                ? {
                    onTap: () => {
                      accuse(suspect);
                    },
                  }
                : {})}
            />
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.case.board}</h2>
        <ol className={styles.board}>
          {clues.map((clue, index) => (
            <li key={clue.id} className={cx(styles.note, index < save.solved && styles.pinnedNote)}>
              {index < save.solved ? (
                <>
                  <ItemIcon itemId={clue.icon} size={40} />
                  <span>{clueText(index)}</span>
                </>
              ) : (
                <span className={styles.missing} aria-label={UI.case.clueMissing}>
                  ?
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>
      {ready ? (
        <p className={styles.iKnow}>{UI.case.iKnow}</p>
      ) : (
        <Button
          block
          onClick={() => {
            setRiddle(true);
          }}
        >
          {UI.case.next}
        </Button>
      )}
      <Button variant="ghost" block onClick={onLeave}>
        {UI.case.toTower}
      </Button>
    </Screen>
  );
}

function Resolution({
  detective,
  firstCase,
  onNext,
}: {
  detective: DetectiveCase;
  firstCase: boolean;
  onNext: () => void;
}) {
  return (
    <Screen title={detective.title}>
      <div className={styles.resolution}>
        <span className={styles.stamp}>{UI.case.solved}</span>
        <SpeechBubble pose="freut-sich" kikoSize={72}>
          {detective.resolution}
        </SpeechBubble>
        {firstCase && <p className={styles.reward}>{UI.case.firstHat}</p>}
        <Button block onClick={onNext}>
          {UI.play.next}
        </Button>
      </div>
    </Screen>
  );
}

/** Adresse `/raetsel/detektivfall` */
export function Detective({ profile, onLeave }: { profile: Profile; onLeave: () => void }) {
  const { dispatch } = useAppState();
  const cfg = STUFEN[profile.stufe];
  const tower = towerOf(profile);
  const solvedCases = tower.cases ?? [];
  const save = tower.caseSave;
  const [openCase, setOpenCase] = useState<string | null>(null);
  const [result, setResult] = useState<{ caseId: string; first: boolean; before: number } | null>(
    null,
  );
  const [done, setDone] = useState(false);

  if (result && done) {
    return (
      <TowerDone
        profile={profile}
        before={result.before}
        praise={UI.case.done}
        onAgain={() => {
          setResult(null);
          setDone(false);
          setOpenCase(null);
        }}
      />
    );
  }
  if (result) {
    const detective = CASES.find((c) => c.id === result.caseId);
    if (detective) {
      return (
        <Resolution
          detective={detective}
          firstCase={result.first}
          onNext={() => {
            setDone(true);
          }}
        />
      );
    }
  }
  const active = openCase !== null && save?.caseId === openCase ? save : null;
  const detective = CASES.find((c) => c.id === openCase);
  if (detective && active) {
    return (
      <Investigation
        key={detective.id}
        profile={profile}
        detective={detective}
        save={active}
        onSolved={(first) => {
          setResult({ caseId: detective.id, first, before: tower.lamps });
        }}
        onLeave={onLeave}
      />
    );
  }

  const start = (caseId: string) => {
    if (save?.caseId !== caseId) {
      dispatch({ type: 'case-save', id: profile.id, save: { caseId, solved: 0, seed: newSeed() } });
    }
    setOpenCase(caseId);
  };
  const saved = save ? CASES.find((c) => c.id === save.caseId) : undefined;

  return (
    <Screen title={UI.case.title}>
      {saved && (
        <div className={styles.resume}>
          <SpeechBubble pose="zeigt" kikoSize={52}>
            {UI.case.resumeLine}
          </SpeechBubble>
          <Button
            block
            onClick={() => {
              start(saved.id);
            }}
          >
            {UI.case.resume}: {saved.title}
          </Button>
        </div>
      )}
      <h2 className={styles.heading}>{UI.case.choose}</h2>
      <div className={styles.files}>
        {CASES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.file}
            onClick={() => {
              if (cfg.autoRead) toggleSpeak(c.title);
              start(c.id);
            }}
          >
            <span className={styles.secret} aria-hidden="true">
              {solvedCases.includes(c.id) ? UI.case.solvedStamp : UI.case.secret}
            </span>
            <ItemIcon itemId={c.sceneIcon} size={48} />
            <span className={styles.fileTitle}>{c.title}</span>
          </button>
        ))}
      </div>
      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.case.book}</h2>
        {solvedCases.length === 0 ? (
          <p className={styles.muted}>{UI.case.bookEmpty}</p>
        ) : (
          <ul className={styles.book}>
            {CASES.filter((c) => solvedCases.includes(c.id)).map((c) => (
              <li key={c.id}>
                <strong>{c.title}</strong> {c.bookLine}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Screen>
  );
}
