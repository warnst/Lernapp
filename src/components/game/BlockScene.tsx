import { NumberBlock } from '@/illustrations/NumberBlock';
import styles from './Game.module.css';

export function BlockScene({
  mode,
  blocks,
  result,
}: {
  mode: 'combine' | 'split' | 'mirror' | 'stairs';
  blocks: readonly number[];
  result?: number | '?' | undefined;
}) {
  if (mode === 'stairs') {
    return (
      <div
        className={styles.blockRow}
        role="img"
        aria-label={`Zahlenblock-Treppe: ${blocks.join(', ')}`}
      >
        {blocks.map((val, i) => (
          <NumberBlock key={i} value={val} size={76} />
        ))}
        {result !== undefined && (
          <NumberBlock value={result === '?' ? 1 : result} mystery={result === '?'} size={76} />
        )}
      </div>
    );
  }

  if (mode === 'mirror') {
    const val = blocks[0] ?? 1;
    return (
      <div
        className={styles.blockRow}
        role="img"
        aria-label={`Zahlenblock ${String(val)} vor dem Zauberspiegel`}
      >
        <NumberBlock value={val} size={84} />
        <span className={styles.blockOperator} aria-hidden="true">
          +
        </span>
        <div className={styles.mirrorFrame}>
          <NumberBlock value={val} size={84} />
        </div>
        {result !== undefined && (
          <>
            <span className={styles.blockOperator} aria-hidden="true">
              =
            </span>
            <NumberBlock
              value={result === '?' ? val * 2 : result}
              mystery={result === '?'}
              size={84}
            />
          </>
        )}
      </div>
    );
  }

  const symbol = mode === 'split' ? '−' : '+';
  return (
    <div
      className={styles.blockRow}
      role="img"
      aria-label={`Zahlenblöcke: ${blocks.join(` ${symbol} `)}`}
    >
      {blocks.map((val, i) => (
        <span key={i} className={styles.blockRow}>
          {i > 0 && (
            <span className={styles.blockOperator} aria-hidden="true">
              {symbol}
            </span>
          )}
          <NumberBlock value={val} size={84} />
        </span>
      ))}
      {result !== undefined && (
        <>
          <span className={styles.blockOperator} aria-hidden="true">
            =
          </span>
          <NumberBlock value={result === '?' ? 4 : result} mystery={result === '?'} size={84} />
        </>
      )}
    </div>
  );
}
