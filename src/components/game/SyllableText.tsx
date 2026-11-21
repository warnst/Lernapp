import { cx } from '@/components/cx';
import { speakSyllable } from '@/content/worlds/lesen/phonics';
import { speakNow } from '@/speech/speak';
import styles from './SyllableText.module.css';

function SyllableArc() {
  return (
    <svg className={styles.arc} viewBox="0 0 40 12" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M2 2 Q20 12 38 2"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Zweifarbige Silbenschrift (Schul-Blau / Warm-Rot) mit Silbenbögen darunter (Barrierefreiheit).
 * Im interaktiven Modus kann das Kind jede einzelne Silbe zum Vorlesen antippen.
 */
export function SyllableText({
  syllables,
  uppercase = false,
  interactive = false,
  speakSyllables,
  size = 'lg',
  className,
}: {
  syllables: readonly string[];
  uppercase?: boolean;
  interactive?: boolean;
  speakSyllables?: readonly string[];
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const show = (text: string) => (uppercase ? text.toUpperCase() : text);

  return (
    <span className={cx(styles.word, styles[size], className)}>
      {syllables.map((syl, index) => {
        const display = show(syl);
        const colorClass = index % 2 === 0 ? styles.colorA : styles.colorB;
        const spoken = speakSyllables?.[index] ?? speakSyllable(syl);

        if (interactive) {
          return (
            <button
              key={`${syl}-${String(index)}`}
              type="button"
              className={cx(styles.syllable, styles.interactive, colorClass)}
              aria-label={`Silbe ${display} anhören`}
              onClick={() => {
                speakNow(spoken);
              }}
            >
              <span>{display}</span>
              <SyllableArc />
            </button>
          );
        }

        return (
          <span key={`${syl}-${String(index)}`} className={cx(styles.syllable, colorClass)}>
            <span>{display}</span>
            <SyllableArc />
          </span>
        );
      })}
    </span>
  );
}
