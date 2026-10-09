import { UI } from '@/content/ui';
import type { MoneyPiece } from '@/domain/types';
import styles from './Answer.module.css';
import { MoneyPieceView } from './MoneyPieceView';

/** Bereits gemerkte Möglichkeiten bei pay-variants. */
export function FoundVariants({ found }: { found: readonly MoneyPiece[][] }) {
  if (found.length === 0) return null;
  return (
    <ol className={styles.variants}>
      {found.map((pieces, i) => (
        <li key={i} className={styles.variant}>
          <strong>{UI.coins.variant(i + 1)}</strong>
          {pieces.map((piece, j) => (
            <MoneyPieceView key={j} value={piece} scale={40} />
          ))}
        </li>
      ))}
    </ol>
  );
}
