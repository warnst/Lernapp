import { UI } from '@/content/ui';
import { formatMoney } from '@/domain/money';
import type { Cents } from '@/domain/types';
import styles from './Game.module.css';

/** Holzschild mit Preis; ohne Preis „? €“ (docs/04, Hinweis zu 8.5 und 9.2). */
export function PriceTag({ price, format }: { price?: Cents; format?: 'eur' }) {
  return (
    <span className={styles.tag}>
      {price === undefined ? UI.scene.unknownPrice : formatMoney(price, format ?? 'auto')}
    </span>
  );
}
