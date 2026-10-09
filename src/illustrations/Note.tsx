import { formatMoney } from '@/domain/money';
import type { NoteValue } from '@/domain/types';

// Spielgeld-Scheine (docs/02, 6.2): 120 × 64, Wert groß in der Mitte, Wellenlinie. Keine echten Motive.

const FILL: Record<NoteValue, string> = {
  500: 'var(--ill-note-5)',
  1000: 'var(--ill-note-10)',
  2000: 'var(--ill-note-20)',
  5000: 'var(--ill-note-50)',
};

export function Note({
  value,
  width = 120,
  className,
}: {
  value: NoteValue;
  width?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={width}
      height={(width * 64) / 120}
      viewBox="0 0 120 64"
      className={className}
      data-note={value}
    >
      <g stroke="var(--stroke)" strokeLinecap="round" strokeLinejoin="round">
        <rect x={1.5} y={1.5} width={117} height={61} rx={8} fill={FILL[value]} strokeWidth={3} />
        <path
          d="M8 12 Q18 6 28 12 T48 12 T68 12 T88 12 T108 12 M12 52 Q22 46 32 52 T52 52 T72 52 T92 52 T112 52"
          fill="none"
          strokeWidth={2}
          opacity={0.55}
        />
        <ellipse cx={60} cy={32} rx={38} ry={18} fill="var(--ill-white)" strokeWidth={2} />
      </g>
      <text
        x={60}
        y={40}
        textAnchor="middle"
        fontSize={24}
        fill="var(--ink-900)"
        style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}
      >
        {formatMoney(value)}
      </text>
    </svg>
  );
}
