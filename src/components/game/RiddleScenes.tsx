import { UI, pieceLabel } from '@/content/ui';
import { formatMoney } from '@/domain/money';
import { renderText } from '@/domain/text';
import type { BalanceSide, Clue, SeqItem } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { cx } from '../cx';
import { MoneyPieceView } from './MoneyPieceView';
import styles from './Riddle.module.css';

// Bühnen für Muster, Waage und Zahlenschloss (docs/10 3).

function SeqCard({ item }: { item: SeqItem }) {
  switch (item.kind) {
    case 'number':
      return <span className={styles.seqCard}>{item.value}</span>;
    case 'money':
      return <span className={styles.seqCard}>{formatMoney(item.cents)}</span>;
    case 'icon':
      return (
        <span className={styles.seqCard}>
          <ItemIcon itemId={item.icon} size={48} />
        </span>
      );
    case 'objects':
      return (
        <span
          className={cx(styles.seqCard, styles.seqObjects)}
          role="img"
          aria-label={String(item.count)}
        >
          {Array.from({ length: item.count }, (_, i) => (
            <ItemIcon key={i} itemId={item.itemId} size={22} />
          ))}
        </span>
      );
    case 'blank':
      return (
        <span className={cx(styles.seqCard, styles.blank)} aria-label={UI.scene.blank}>
          ?
        </span>
      );
  }
}

/** Muster: die Reihe als große Karten, das gesuchte Feld gestrichelt mit „?“. */
export function SequenceScene({ items }: { items: readonly SeqItem[] }) {
  return (
    <div className={styles.sequence}>
      {items.map((item, i) => (
        <SeqCard key={i} item={item} />
      ))}
    </div>
  );
}

/** Bekannter Wert einer Schale: Cent der Münzen bzw. Anzahl der Dinge. */
function known(side: BalanceSide): number {
  const pieces = side.pieces?.reduce((sum, piece) => sum + piece, 0) ?? 0;
  return pieces + (side.objects?.count ?? 0);
}

function Pan({ side, label }: { side: BalanceSide; label: string }) {
  return (
    <div className={styles.pan} role="group" aria-label={label}>
      <div className={styles.panContent}>
        {side.pieces?.map((piece, i) => (
          <span key={i} role="img" aria-label={pieceLabel(piece)}>
            <MoneyPieceView value={piece} />
          </span>
        ))}
        {side.objects &&
          Array.from({ length: side.objects.count }, (_, i) => (
            <ItemIcon key={i} itemId={side.objects?.itemId ?? ''} size={28} />
          ))}
        {Array.from({ length: side.unknown ?? 0 }, (_, i) => (
          <span key={`u${String(i)}`} className={styles.unknown} aria-label={UI.scene.unknown}>
            ?
          </span>
        ))}
      </div>
      <div className={styles.panBowl} />
    </div>
  );
}

/** Waage: eine Holzwippe mit zwei Schalen; die schwerere Seite (ohne „?“) liegt tiefer. */
export function BalanceScene({ left, right }: { left: BalanceSide; right: BalanceSide }) {
  const diff = known(left) - known(right);
  const tilt = diff > 0 ? 'links' : diff < 0 ? 'rechts' : 'gerade';
  return (
    <div className={styles.balance} role="img" aria-label={UI.scene.balance(tilt)}>
      <div className={cx(styles.beam, styles[tilt])}>
        <Pan side={left} label={UI.scene.left} />
        <Pan side={right} label={UI.scene.right} />
      </div>
      <div className={styles.fulcrum} />
    </div>
  );
}

function Dots({ count }: { count: number }) {
  // ein Kästchen je Summand; bei 0 bleibt es leer („3 + 0“)
  return <span className={styles.dots}>{'●'.repeat(count)}</span>;
}

/** Zahlenschloss: kleine Rätselkarten mit Symbol; auf Stufe 1 als Punktebild („●● + ●“). */
export function CluesScene({ clues }: { clues: readonly Clue[] }) {
  return (
    <div className={styles.clues}>
      {clues.map((clue) => (
        <div key={clue.symbol} className={styles.clue}>
          <ItemIcon itemId={clue.symbol} size={36} />
          {clue.dots ? (
            <span
              className={styles.clueText}
              role="img"
              aria-label={UI.scene.dots(clue.dots[0], clue.dots[1])}
            >
              <Dots count={clue.dots[0]} /> + <Dots count={clue.dots[1]} />
            </span>
          ) : (
            <span className={styles.clueText}>{renderText(clue.text)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
