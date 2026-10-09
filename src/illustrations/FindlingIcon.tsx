import { FINDLING_DRAWINGS } from './findling-drawings';
import { PaketIcon } from './PaketIcon';

// Fundstücke (docs/02, 6.3). Noch nicht gefunden: graue Silhouette mit „?“ (docs/01, Schätze).
export function FindlingIcon({
  id,
  size = 96,
  found = true,
  className,
}: {
  id: string;
  size?: number;
  found?: boolean;
  className?: string;
}) {
  const drawing = FINDLING_DRAWINGS.get(id);
  if (drawing === undefined) return <PaketIcon size={size} className={className} />;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={className}
      data-findling={id}
      data-found={found}
    >
      <g
        stroke={found ? 'var(--stroke)' : 'var(--ill-silhouette)'}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform={drawing.transform}>
          {drawing.body.map((shape) => (
            <path
              key={shape.d}
              d={shape.d}
              fill={found || shape.fill === 'none' ? shape.fill : 'var(--ill-silhouette)'}
              fillRule={shape.evenOdd === true ? 'evenodd' : undefined}
            />
          ))}
          {found && drawing.details}
        </g>
      </g>
      {!found && (
        <text
          x={48}
          y={66}
          fontSize={52}
          textAnchor="middle"
          fill="var(--ink-600)"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
        >
          ?
        </text>
      )}
    </svg>
  );
}
