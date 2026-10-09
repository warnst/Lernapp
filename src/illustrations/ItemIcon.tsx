import { ITEM_DRAWINGS } from './item-drawings';
import { PaketIcon } from './PaketIcon';

// Sachen-Icons (docs/02, 6.3). Unbekannte IDs zeigen das neutrale Paket-Icon.
export function ItemIcon({
  itemId,
  size = 64,
  className,
}: {
  itemId: string;
  size?: number;
  className?: string;
}) {
  const art = ITEM_DRAWINGS.get(itemId);
  if (art === undefined) return <PaketIcon size={size} className={className} />;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      data-icon={itemId}
    >
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        {art}
      </g>
    </svg>
  );
}
