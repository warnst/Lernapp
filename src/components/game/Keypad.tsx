import { UI } from '@/content/ui';
import styles from './Answer.module.css';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Eigene Zifferntastatur 3 × 4: Ziffern, ⌫ und optional → (docs/01 6.2). */
export function Keypad({
  onDigit,
  onDelete,
  onNext,
}: {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onNext?: () => void;
}) {
  return (
    <div className={styles.keypad}>
      {DIGITS.map((digit) => (
        <button
          key={digit}
          type="button"
          className={styles.key}
          onClick={() => {
            onDigit(digit);
          }}
        >
          {digit}
        </button>
      ))}
      <button type="button" className={styles.key} aria-label={UI.money.delete} onClick={onDelete}>
        ⌫
      </button>
      <button
        type="button"
        className={styles.key}
        onClick={() => {
          onDigit('0');
        }}
      >
        0
      </button>
      {onNext ? (
        <button type="button" className={styles.key} aria-label={UI.money.toCent} onClick={onNext}>
          →
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
