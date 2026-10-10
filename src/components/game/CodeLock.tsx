import { type PointerEvent, useRef, useState } from 'react';
import { UI } from '@/content/ui';
import type { ClueSymbol } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import styles from './Riddle.module.css';

const SWIPE_PX = 24;

function Wheel({
  symbol,
  digit,
  onTurn,
}: {
  symbol: ClueSymbol;
  digit: number;
  onTurn: (step: 1 | -1) => void;
}) {
  const start = useRef<number | null>(null);
  const name = UI.riddle.symbols[symbol];
  const onPointerDown = (event: PointerEvent) => {
    start.current = event.clientY;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (start.current === null) return;
    const delta = event.clientY - start.current;
    start.current = null;
    if (delta < -SWIPE_PX) onTurn(1);
    else if (delta > SWIPE_PX) onTurn(-1);
  };
  return (
    <div className={styles.wheel}>
      <ItemIcon itemId={symbol} size={40} />
      <button
        type="button"
        className={styles.wheelButton}
        aria-label={UI.riddle.up(name)}
        onClick={() => {
          onTurn(1);
        }}
      >
        ▲
      </button>
      <span
        className={styles.digit}
        aria-live="polite"
        aria-label={UI.riddle.wheel(name, digit)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {digit}
      </span>
      <button
        type="button"
        className={styles.wheelButton}
        aria-label={UI.riddle.down(name)}
        onClick={() => {
          onTurn(-1);
        }}
      >
        ▼
      </button>
    </div>
  );
}

/** Zahlenschloss (docs/10 3): ein Rad je Rätselkarte, Ziffern 0–9, ▲/▼ oder Wischen. */
export function CodeLock({
  symbols,
  onChange,
}: {
  symbols: readonly ClueSymbol[];
  onChange: (digits: number[]) => void;
}) {
  const [digits, setDigits] = useState<number[]>(() => symbols.map(() => 0));
  return (
    <div className={styles.lock} role="group" aria-label={UI.riddle.lock}>
      {symbols.map((symbol, i) => (
        <Wheel
          key={symbol}
          symbol={symbol}
          digit={digits[i] ?? 0}
          onTurn={(step) => {
            const next = digits.map((d, j) => (j === i ? (d + step + 10) % 10 : d));
            setDigits(next);
            onChange(next);
          }}
        />
      ))}
    </div>
  );
}
