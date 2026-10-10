import { useState } from 'react';
import { UI } from '@/content/ui';
import { addMinutes, timeWords, wrapHour } from '@/domain/clock';
import type { ClockTime } from '@/domain/types';
import { ClockFace } from '@/illustrations/ClockFace';
import styles from './ClockEntry.module.css';

/**
 * Uhr stellen (docs/13): Kleiner Zeiger springt um eine Stunde, großer Zeiger um `step` Minuten.
 * Bei vollen Stunden (step 60) gibt es nur den kleinen Zeiger. Die Uhr startet auf 12 Uhr,
 * deshalb fragen die Vorlagen nie nach 12 Uhr.
 */
export function ClockEntry({
  step,
  onChange,
}: {
  step: number;
  onChange: (time: ClockTime) => void;
}) {
  // Start auf 12 Uhr; „Prüfen“ wird erst aktiv, wenn ein Zeiger gedreht wurde
  const [time, setTime] = useState<ClockTime>({ hour: 12, minute: 0 });
  const set = (next: ClockTime) => {
    setTime(next);
    onChange(next);
  };

  const hour = (d: 1 | -1) => {
    set({ ...time, hour: wrapHour(time.hour + d) });
  };
  const minute = (d: 1 | -1) => {
    // nur der große Zeiger bewegt sich; die Stunde stellt das Kind selbst
    const next = addMinutes({ hour: 12, minute: time.minute }, d * step);
    set({ ...time, minute: next.minute });
  };

  return (
    <div className={styles.wrap}>
      <ClockFace time={time} size={200} />
      <p className={styles.now} aria-live="polite">
        <span className={styles.hidden}>{UI.newTopics.clockNow(timeWords(time))}</span>
      </p>
      <div className={styles.controls}>
        <div className={styles.row}>
          <span className={styles.label}>
            <span className={styles.hourDot} aria-hidden="true" />
            {UI.newTopics.hourHand}
          </span>
          <button
            type="button"
            className={styles.turn}
            aria-label={UI.newTopics.hourBack}
            onClick={() => {
              hour(-1);
            }}
          >
            ↺
          </button>
          <button
            type="button"
            className={styles.turn}
            aria-label={UI.newTopics.hourForward}
            onClick={() => {
              hour(1);
            }}
          >
            ↻
          </button>
        </div>
        {step < 60 && (
          <div className={styles.row}>
            <span className={styles.label}>
              <span className={styles.minuteDot} aria-hidden="true" />
              {UI.newTopics.minuteHand}
            </span>
            <button
              type="button"
              className={styles.turn}
              aria-label={UI.newTopics.minuteBack}
              onClick={() => {
                minute(-1);
              }}
            >
              ↺
            </button>
            <button
              type="button"
              className={styles.turn}
              aria-label={UI.newTopics.minuteForward}
              onClick={() => {
                minute(1);
              }}
            >
              ↻
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
