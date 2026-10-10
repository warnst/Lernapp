import { useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { STUFEN } from '@/config/levels';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { UI } from '@/content/ui';
import type { PracticeTopicId, Profile, Stufe } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { hasTopic, shiftStufe } from '@/practice/round';
import { TOPIC_FALLBACK, TOPIC_ICON, TOPIC_ORDER } from '@/practice/topics';
import { toggleSpeak } from '@/speech/speak';
import { autoReadOf } from '@/state/progress';
import { useAppState } from '@/state/context';
import styles from './Practice.module.css';

type Shift = -1 | 0 | 1;

const SHIFTS: { shift: Shift; label: string }[] = [
  { shift: -1, label: UI.practice.easier },
  { shift: 0, label: UI.practice.right },
  { shift: 1, label: UI.practice.harder },
];

function availableTopics(stufe: Stufe): PracticeTopicId[] {
  const own = STUFEN[stufe].practiceTopics;
  return TOPIC_ORDER.filter((topic) => own.includes(topic) && hasTopic(topic, stufe));
}

function initialTopic(profile: Profile, requested: string | null): PracticeTopicId | undefined {
  const topics = availableTopics(profile.stufe);
  const asked = TOPIC_ORDER.find((t) => t === requested);
  if (asked) {
    if (topics.includes(asked)) return asked;
    const fallback = TOPIC_FALLBACK[asked];
    if (fallback && topics.includes(fallback)) return fallback;
  }
  const last = profile.practice.last?.topic;
  return last && topics.includes(last) ? last : topics[0];
}

/** Üben: Thema, „Wie schwer?“, Anzahl, Los (docs/01 5.7). */
export function Practice({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(useSearch());
  const readAloud = autoReadOf(profile);
  const short = profile.stufe <= 2;
  const topics = availableTopics(profile.stufe);
  const [topic, setTopic] = useState(() => initialTopic(profile, params.get('thema')));
  const [shift, setShift] = useState<Shift>(profile.practice.last?.shift ?? 0);
  const [count, setCount] = useState<5 | 10>(profile.practice.last?.count ?? 5);

  // „leichter“ auf Stufe 1 bzw. „schwerer“ auf Stufe 4 gibt es nicht
  const possible = (s: Shift) => {
    const target = shiftStufe(profile.stufe, s);
    return topic !== undefined && (s === 0 || target !== profile.stufe) && hasTopic(topic, target);
  };
  const effectiveShift = possible(shift) ? shift : 0;

  const start = () => {
    if (!topic) return;
    dispatch({
      type: 'set-practice-last',
      id: profile.id,
      last: { topic, shift: effectiveShift, count },
    });
    navigate(
      `/ueben/spiel?thema=${topic}&schwer=${String(effectiveShift)}&anzahl=${String(count)}`,
    );
  };

  return (
    <Screen title={UI.practice.title} withNav>
      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.practice.what}</h2>
        <div className={styles.topics}>
          {topics.map((id) => {
            const label = short ? UI.practice.shortTopics[id] : UI.practice.topics[id];
            return (
              <button
                key={id}
                type="button"
                className={styles.topic}
                aria-pressed={topic === id}
                onClick={() => {
                  if (readAloud) toggleSpeak(label);
                  setTopic(id);
                }}
              >
                <ItemIcon itemId={TOPIC_ICON[id]} size={48} />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.practice.how}</h2>
        <div className={styles.levels}>
          {SHIFTS.map((option) => (
            <button
              key={option.shift}
              type="button"
              className={styles.level}
              aria-pressed={effectiveShift === option.shift}
              disabled={!possible(option.shift)}
              onClick={() => {
                setShift(option.shift);
              }}
            >
              {option.label}
              {!possible(option.shift) && (
                <span className={styles.note}>{UI.practice.notHere}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.practice.count}</h2>
        <div className={styles.toggle}>
          {([5, 10] as const).map((n) => (
            <button
              key={n}
              type="button"
              className={styles.level}
              aria-pressed={count === n}
              onClick={() => {
                setCount(n);
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.startBar}>
        <Button block disabled={topic === undefined} onClick={start}>
          {UI.practice.start}
        </Button>
      </div>
    </Screen>
  );
}
