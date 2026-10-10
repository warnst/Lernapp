import { useState } from 'react';
import { UI } from '@/content/ui';
import { cx } from '../cx';
import styles from './Riddle.module.css';

/**
 * Ordnungshilfe für „Wer hat am meisten?“ (docs/10 3): eine leere Treppe, auf die das Kind die
 * Kinder stellen kann (oben = am meisten). Sie wird nicht geprüft und ist nur zum Denken.
 */
export function OrderHelper({ names }: { names: readonly string[] }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [steps, setSteps] = useState<(string | null)[]>(() => names.map(() => null));
  const waiting = names.filter((name) => !steps.includes(name));

  const place = (index: number) => {
    const current = steps[index] ?? null;
    if (chosen === null) {
      // ein Kind von der Stufe wieder herunternehmen
      if (current !== null) setSteps(steps.map((s, i) => (i === index ? null : s)));
      return;
    }
    setSteps(steps.map((s, i) => (i === index ? chosen : s === chosen ? null : s)));
    setChosen(null);
  };

  return (
    <section className={styles.helper} aria-label={UI.riddle.stairs}>
      <p className={styles.helperText}>{UI.riddle.stairs}</p>
      <div className={styles.helperNames}>
        {waiting.map((name) => (
          <button
            key={name}
            type="button"
            className={cx(styles.nameChip, chosen === name && styles.chosen)}
            aria-pressed={chosen === name}
            onClick={() => {
              setChosen(chosen === name ? null : name);
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <div className={styles.stairs}>
        {steps.map((name, i) => (
          <button
            key={i}
            type="button"
            className={styles.step}
            style={{ height: `${String(48 + i * 28)}px` }}
            aria-label={`${UI.riddle.step(i + 1)}: ${name ?? UI.riddle.stepEmpty}`}
            onClick={() => {
              place(i);
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  );
}
