import { useState } from 'react';
import type { OrderAnswer, OrderEntry } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { cx } from '../cx';
import styles from './Answer.module.css';
import game from './Game.module.css';
import { MoneyPieceView } from './MoneyPieceView';
import { PriceTag } from './PriceTag';

function EntryBody({ entry }: { entry: OrderEntry }) {
  if (entry.piece !== undefined) return <MoneyPieceView value={entry.piece} />;
  if (entry.objects) {
    return (
      <span className={styles.mini}>
        {Array.from({ length: entry.objects.count }, (_, i) => (
          <ItemIcon key={i} itemId={entry.objects?.itemId ?? ''} size={28} />
        ))}
      </span>
    );
  }
  return (
    <>
      <ItemIcon itemId={entry.itemId ?? ''} size={48} />
      <span>{entry.label}</span>
      <PriceTag price={entry.value} />
    </>
  );
}

/**
 * Karten der Reihe nach antippen; sie bekommen Nummern. Erneutes Antippen der letzten Karte
 * nimmt die Nummer zurück (docs/01 6.2).
 */
export function OrderView({
  answer,
  onChange,
}: {
  answer: OrderAnswer;
  onChange: (ids: string[] | null) => void;
}) {
  const [order, setOrder] = useState<string[]>([]);
  const tap = (id: string) => {
    const index = order.indexOf(id);
    if (index !== -1 && index !== order.length - 1) return;
    const next = index === -1 ? [...order, id] : order.slice(0, -1);
    setOrder(next);
    onChange(next.length === answer.entries.length ? next : null);
  };
  return (
    <div className={cx(styles.cards, styles.four)}>
      {answer.entries.map((entry) => {
        const position = order.indexOf(entry.id);
        return (
          <button
            key={entry.id}
            type="button"
            className={cx(styles.card, styles.textCard)}
            aria-label={position === -1 ? entry.label : `${entry.label}: ${String(position + 1)}`}
            aria-pressed={position !== -1}
            onClick={() => {
              tap(entry.id);
            }}
          >
            <EntryBody entry={entry} />
            {position !== -1 && (
              <span className={game.badge} aria-hidden="true">
                {position + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
