import { useState } from 'react';
import { UI } from '@/content/ui';
import { toggleSpeak } from '@/speech/speak';
import { cx } from '../cx';
import styles from './Answer.module.css';
import { Keypad } from './Keypad';

/** Ganze Zahl: Zahlenstrahl 0–10 zum Antippen (Stufe 1) oder Tastatur (docs/09 7). */
export function NumberEntry({
  mode,
  max,
  readOnTap,
  onChange,
}: {
  mode: 'numberline' | 'keypad';
  max: number;
  readOnTap: boolean;
  onChange: (value: number | null) => void;
}) {
  const [text, setText] = useState('');
  const set = (next: string) => {
    setText(next);
    onChange(next === '' ? null : Number(next));
  };

  if (mode === 'numberline') {
    return (
      <div>
        <p className={styles.big} aria-live="polite">
          {text}
        </p>
        <div className={styles.line} role="group" aria-label={UI.money.number}>
          {Array.from({ length: 11 }, (_, n) => (
            <button
              key={n}
              type="button"
              className={cx(styles.key, text === String(n) && styles.active)}
              aria-pressed={text === String(n)}
              onClick={() => {
                if (readOnTap) toggleSpeak(String(n));
                set(String(n));
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.big} aria-live="polite" aria-label={UI.money.number}>
        {text}
      </p>
      <Keypad
        onDigit={(digit) => {
          const next = text === '0' ? digit : text + digit;
          if (Number(next) <= max) set(next);
        }}
        onDelete={() => {
          set(text.slice(0, -1));
        }}
      />
    </div>
  );
}
