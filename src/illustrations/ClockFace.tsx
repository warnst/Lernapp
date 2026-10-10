import { handAngles } from '@/domain/clock';
import type { ClockTime } from '@/domain/types';

// Zeigeruhr (docs/13): Zahlen 1–12, Minutenstriche, kurzer dicker Stundenzeiger (Koralle) und
// langer dünner Minutenzeiger (Meer). Ohne `time` ohne Zeiger (zum Einzeichnen im Druck).

const C = 50;

export function ClockFace({
  time,
  size = 160,
  className,
}: {
  time?: ClockTime;
  size?: number;
  className?: string;
}) {
  const angles = time ? handAngles(time) : null;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      data-time={time ? `${String(time.hour)}:${String(time.minute)}` : undefined}
    >
      <circle cx={C} cy={C} r={46} fill="var(--white)" stroke="var(--stroke)" strokeWidth={3.5} />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const a = (i * 6 * Math.PI) / 180;
        const r1 = big ? 37 : 40;
        return (
          <line
            key={i}
            x1={C + r1 * Math.sin(a)}
            y1={C - r1 * Math.cos(a)}
            x2={C + 43 * Math.sin(a)}
            y2={C - 43 * Math.cos(a)}
            stroke="var(--stroke)"
            strokeWidth={big ? 2 : 0.8}
          />
        );
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = (n * 30 * Math.PI) / 180;
        return (
          <text
            key={n}
            x={C + 29 * Math.sin(a)}
            y={C - 29 * Math.cos(a) + 4}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="var(--ink-900)"
            fontFamily="var(--font-heading)"
          >
            {n}
          </text>
        );
      })}
      {angles && (
        <g strokeLinecap="round">
          <line
            x1={C}
            y1={C}
            x2={C}
            y2={C - 21}
            stroke="var(--coral-400)"
            strokeWidth={6}
            transform={`rotate(${String(angles.hour)} ${String(C)} ${String(C)})`}
            data-hand="stunde"
          />
          <line
            x1={C}
            y1={C}
            x2={C}
            y2={C - 35}
            stroke="var(--sea-700)"
            strokeWidth={3.5}
            transform={`rotate(${String(angles.minute)} ${String(C)} ${String(C)})`}
            data-hand="minute"
          />
        </g>
      )}
      <circle cx={C} cy={C} r={3.5} fill="var(--stroke)" />
    </svg>
  );
}
