import type { KikoSlot } from '@/domain/types';
import { Kiko } from './Kiko';
import { SLOT_VIEWBOX } from './KikoItems';

/** Ein Teil als Vorschaubild für den Kleiderschrank: Kiko trägt es, gezeigt wird nur der Ausschnitt. */
export function KikoItemIcon({
  id,
  slot,
  size = 56,
}: {
  id: string;
  slot: KikoSlot;
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox={SLOT_VIEWBOX[slot]}
      data-kiko-item={id}
    >
      <Kiko pose="hallo" outfit={{ [slot]: id }} />
    </svg>
  );
}
