import { useState } from 'react';
import { pieceLabel, UI } from '@/content/ui';
import { formatMoney, sumPieces } from '@/domain/money';
import type { MoneyPiece } from '@/domain/types';
import styles from './Answer.module.css';
import { MoneyPieceView } from './MoneyPieceView';

const TRAY_MAX = 15;

/**
 * Kikos Tablett und die Palette darunter (docs/01 6.2): Antippen in der Palette legt eine Münze
 * aufs Tablett, Antippen auf dem Tablett nimmt sie zurück. Sortiert, größte zuerst.
 */
export function CoinTray({
  palette,
  showTotal,
  onChange,
}: {
  palette: readonly MoneyPiece[];
  showTotal: boolean;
  onChange: (pieces: MoneyPiece[]) => void;
}) {
  const [pieces, setPieces] = useState<MoneyPiece[]>([]);
  const [full, setFull] = useState(false);
  const total = formatMoney(sumPieces(pieces));

  const update = (next: MoneyPiece[]) => {
    const sorted = [...next].sort((a, b) => b - a);
    setPieces(sorted);
    onChange(sorted);
  };

  return (
    <div>
      <div
        className={styles.tray}
        role="group"
        aria-label={UI.coins.trayLabel(pieces.length, total)}
      >
        <div className={styles.trayCoins}>
          {pieces.map((piece, i) => (
            <button
              key={`${String(piece)}-${String(i)}`}
              type="button"
              className={styles.coinButton}
              aria-label={pieceLabel(piece)}
              onClick={() => {
                setFull(false);
                update(pieces.filter((_, j) => j !== i));
              }}
            >
              <MoneyPieceView value={piece} scale={56} />
            </button>
          ))}
        </div>
        <p className={styles.trayText} aria-live="polite">
          {full
            ? UI.coins.trayFull
            : pieces.length === 0
              ? UI.coins.trayEmpty
              : showTotal
                ? UI.coins.trayTotal(total)
                : ''}
        </p>
      </div>
      <div className={styles.palette} role="group" aria-label={UI.coins.palette}>
        {[...palette]
          .sort((a, b) => a - b)
          .map((piece) => (
            <button
              key={piece}
              type="button"
              className={styles.coinButton}
              aria-label={pieceLabel(piece)}
              onClick={() => {
                if (pieces.length >= TRAY_MAX) {
                  setFull(true);
                  return;
                }
                update([...pieces, piece]);
              }}
            >
              <MoneyPieceView value={piece} />
            </button>
          ))}
      </div>
    </div>
  );
}
