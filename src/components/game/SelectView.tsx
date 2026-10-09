import { useState } from 'react';
import type { SelectAnswer } from '@/domain/types';
import styles from './Answer.module.css';
import { ItemCard } from './ItemCard';

/** Sachen mit Preisschild an- und abwählen (docs/01 6.2). */
export function SelectView({
  answer,
  onChange,
}: {
  answer: SelectAnswer;
  onChange: (itemIds: string[] | null) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className={styles.items}>
      {answer.items.map((item) => (
        <ItemCard
          key={item.itemId}
          item={item}
          selected={selected.includes(item.itemId)}
          onToggle={() => {
            const next = selected.includes(item.itemId)
              ? selected.filter((id) => id !== item.itemId)
              : [...selected, item.itemId];
            setSelected(next);
            onChange(next.length === 0 ? null : next);
          }}
        />
      ))}
    </div>
  );
}
