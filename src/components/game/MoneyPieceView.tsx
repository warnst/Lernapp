import { pieceLabel } from '@/content/ui';
import type { CoinValue, MoneyPiece } from '@/domain/types';
import { Coin } from '@/illustrations/Coin';
import { Note } from '@/illustrations/Note';

function isCoin(value: MoneyPiece): value is CoinValue {
  return value <= 200;
}

/** Münze (echte Größe) oder Schein, mit Namen für Screenreader. */
export function MoneyPieceView({ value, scale = 72 }: { value: MoneyPiece; scale?: number }) {
  return (
    <span role="img" aria-label={pieceLabel(value)} style={{ display: 'inline-flex' }}>
      {isCoin(value) ? (
        <Coin value={value} size={scale} />
      ) : (
        <Note value={value} width={scale * 1.6} />
      )}
    </span>
  );
}
