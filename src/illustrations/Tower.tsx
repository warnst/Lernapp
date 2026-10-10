import { BEACON_FLOOR } from '@/domain/tower';

// Kikos Rätselturm (docs/12 4): ein Leuchtturm, der mit jeder Etage wächst. Die Fenster der obersten
// Etage sind die Lampen, die gerade angezündet werden. Gezeigt werden höchstens 3 fertige Etagen.

const FLOOR_H = 34;
const LANTERN_H = 64;
const BASE_H = 34;
const MAX_DONE_SHOWN = 3;

function Windows({
  y,
  count,
  lit,
  width,
}: {
  y: number;
  count: number;
  lit: number;
  width: number;
}) {
  const gap = Math.min(18, (width - 20) / count);
  const start = 100 - ((count - 1) * gap) / 2;
  const r = Math.min(5.5, gap / 2 - 0.8);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const cx = start + i * gap;
        const on = i < lit;
        return (
          <g key={i} data-lamp={on ? 'an' : 'aus'}>
            {on && (
              <circle
                cx={cx}
                cy={y}
                r={r + 3.5}
                fill="var(--sun-400)"
                opacity={0.35}
                stroke="none"
              />
            )}
            <circle cx={cx} cy={y} r={r} fill={on ? 'var(--sun-400)' : 'var(--ill-dark)'} />
          </g>
        );
      })}
    </g>
  );
}

export function Tower({
  floors,
  lit,
  size,
  width = 220,
  className,
}: {
  /** fertige Etagen */
  floors: number;
  /** Lampen in der Etage, die gerade gefüllt wird */
  lit: number;
  size: number;
  width?: number;
  className?: string;
}) {
  const shown = Math.min(floors, MAX_DONE_SHOWN);
  const rows = shown + 1; // oben die Etage, die gerade gefüllt wird
  const height = LANTERN_H + rows * FLOOR_H + BASE_H;
  const beacon = floors >= BEACON_FLOOR;
  const half = (row: number) => 42 + row * 6; // der Turm wird nach unten breiter
  const bottomY = LANTERN_H + rows * FLOOR_H;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 200 ${String(height)}`}
      width={width}
      height={(width * height) / 200}
      className={className}
      data-floors={floors}
    >
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
        {/* Lichtstrahlen des Leuchtfeuers */}
        {beacon && (
          <g fill="var(--sun-400)" opacity={0.45} stroke="none">
            <path d="M100 30 L4 10 L4 50 Z" />
            <path d="M100 30 L196 10 L196 50 Z" />
          </g>
        )}
        {/* Laterne mit Dach */}
        <path d="M76 22 L100 4 L124 22 Z" fill="var(--coral-400)" />
        <rect
          x={80}
          y={22}
          width={40}
          height={24}
          rx={3}
          fill={beacon ? 'var(--sun-400)' : 'var(--ill-surf)'}
        />
        <path d="M93 22 V46 M107 22 V46" fill="none" strokeWidth={2} />
        <rect x={70} y={46} width={60} height={8} rx={2} fill="var(--white)" />
        <path
          d="M74 54 V60 M84 54 V60 M94 54 V60 M106 54 V60 M116 54 V60 M126 54 V60"
          fill="none"
          strokeWidth={2}
        />
        {/* Etagen von oben nach unten */}
        {Array.from({ length: rows }, (_, row) => {
          const y = LANTERN_H + row * FLOOR_H;
          const top = half(row);
          const bottom = half(row + 1);
          // Streifen wechseln mit der echten Etagennummer, damit sie beim Wachsen nicht springen
          const number = floors - row + 1;
          const stripe = number % 2 === 0 ? 'var(--coral-400)' : 'var(--white)';
          const current = row === 0;
          return (
            <g key={row}>
              <path
                d={`M${String(100 - top)} ${String(y)} H${String(100 + top)} L${String(100 + bottom)} ${String(y + FLOOR_H)} H${String(100 - bottom)} Z`}
                fill={stripe}
              />
              <Windows
                y={y + FLOOR_H / 2}
                count={current ? size : 3}
                lit={current ? lit : 3}
                width={top * 2}
              />
            </g>
          );
        })}
        {/* Tür, Felsen und Meer */}
        <path
          d={`M92 ${String(bottomY)} V${String(bottomY - 20)} A8 8 0 0 1 108 ${String(bottomY - 20)} V${String(bottomY)} Z`}
          fill="var(--ill-wood)"
        />
        <path
          d={`M30 ${String(bottomY)} H170 L184 ${String(bottomY + 18)} H16 Z`}
          fill="var(--ill-rock)"
        />
        <path
          d={`M0 ${String(bottomY + 20)} Q25 ${String(bottomY + 12)} 50 ${String(bottomY + 20)} T100 ${String(bottomY + 20)} T150 ${String(bottomY + 20)} T200 ${String(bottomY + 20)} V${String(height)} H0 Z`}
          fill="var(--ill-sea)"
          strokeWidth={2.5}
        />
      </g>
    </svg>
  );
}
