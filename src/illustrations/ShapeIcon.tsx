import type { ShapeKind } from '@/domain/types';

// Formen (docs/13) in kräftigen Farben aus dem Designsystem; Farbe ist nie die einzige Information.

const SHAPE_COLORS = [
  'var(--coral-400)',
  'var(--sea-500)',
  'var(--sun-400)',
  'var(--palm-600)',
  'var(--kiko-pink)',
] as const;

const round1 = (n: number) => Math.round(n * 10) / 10;

function polygon(corners: number, r = 40): string {
  return Array.from({ length: corners }, (_, i) => {
    const a = (2 * Math.PI * i) / corners - Math.PI / 2;
    return `${String(round1(50 + r * Math.cos(a)))},${String(round1(52 + r * Math.sin(a)))}`;
  }).join(' ');
}

export function ShapeIcon({
  shape,
  color = 0,
  size = 56,
}: {
  shape: ShapeKind;
  color?: number;
  size?: number;
}) {
  const fill = SHAPE_COLORS[color % SHAPE_COLORS.length];
  const common = {
    fill,
    stroke: 'var(--stroke)',
    strokeWidth: 4,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      data-shape={shape}
    >
      {shape === 'kreis' && <circle cx={50} cy={50} r={40} {...common} />}
      {shape === 'quadrat' && <rect x={14} y={14} width={72} height={72} {...common} />}
      {shape === 'rechteck' && <rect x={6} y={26} width={88} height={48} {...common} />}
      {shape === 'dreieck' && <polygon points={polygon(3, 46)} {...common} />}
      {shape === 'fuenfeck' && <polygon points={polygon(5)} {...common} />}
      {shape === 'sechseck' && <polygon points={polygon(6)} {...common} />}
    </svg>
  );
}
