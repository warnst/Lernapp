import type { SceneItem } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { cx } from '../cx';
import styles from './Game.module.css';
import { PriceTag } from './PriceTag';

function Body({ item, showPrice }: { item: SceneItem; showPrice: boolean }) {
  const count = item.quantity ?? 1;
  return (
    <>
      <span className={styles.itemIcons} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <ItemIcon key={i} itemId={item.itemId} size={count > 1 ? 48 : 64} />
        ))}
      </span>
      <span>{item.label}</span>
      {showPrice && <PriceTag price={item.price} format={item.priceFormat} />}
    </>
  );
}

/** Sache mit Icon, Name und Preisschild. Mit onToggle wird sie zur Auswahlkarte. */
export function ItemCard({
  item,
  showPrice = true,
  selected,
  number,
  onToggle,
}: {
  item: SceneItem;
  showPrice?: boolean;
  selected?: boolean;
  number?: number;
  onToggle?: () => void;
}) {
  if (!onToggle) {
    return (
      <div className={styles.item}>
        <Body item={item} showPrice={showPrice} />
      </div>
    );
  }
  return (
    <button
      type="button"
      className={cx(styles.item, styles.relative)}
      aria-pressed={selected}
      onClick={onToggle}
    >
      <Body item={item} showPrice={showPrice} />
      {number !== undefined && (
        <span className={styles.badge} aria-hidden="true">
          {number}
        </span>
      )}
      {selected === true && number === undefined && (
        <span className={styles.badge} aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  );
}
