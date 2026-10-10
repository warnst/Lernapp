import { UI } from '@/content/ui';
import styles from './NumberLine.module.css';

/** Zahlenstrahl mit Strichen; `null` ist die gesuchte Zahl (Kästchen mit „?“), docs/13. */
export function NumberLineScene({
  from,
  step,
  labels,
}: {
  from: number;
  step: number;
  labels: readonly (number | null)[];
}) {
  const last = from + step * (labels.length - 1);
  return (
    <div
      className={styles.line}
      role="img"
      aria-label={UI.newTopics.numberLine(
        from,
        last,
        labels.map((l) => (l === null ? '?' : String(l))).join(', '),
      )}
    >
      <svg
        viewBox={`0 0 ${String(labels.length * 40 + 20)} 70`}
        aria-hidden="true"
        className={styles.svg}
      >
        <line
          x1={6}
          y1={30}
          x2={labels.length * 40 + 14}
          y2={30}
          stroke="var(--stroke)"
          strokeWidth={3}
        />
        <path
          d={`M${String(labels.length * 40 + 6)} 23 L${String(labels.length * 40 + 16)} 30 L${String(labels.length * 40 + 6)} 37`}
          fill="none"
          stroke="var(--stroke)"
          strokeWidth={3}
        />
        {labels.map((label, i) => {
          const x = 20 + i * 40;
          return (
            <g key={i}>
              <line x1={x} y1={20} x2={x} y2={40} stroke="var(--stroke)" strokeWidth={3} />
              {label === null ? (
                <g>
                  <rect
                    x={x - 16}
                    y={44}
                    width={32}
                    height={22}
                    rx={5}
                    fill="var(--sun-400)"
                    stroke="var(--stroke)"
                    strokeWidth={2}
                  />
                  <text
                    x={x}
                    y={61}
                    textAnchor="middle"
                    fontSize={16}
                    fontWeight={700}
                    fill="var(--ink-900)"
                  >
                    ?
                  </text>
                </g>
              ) : (
                <text
                  x={x}
                  y={62}
                  textAnchor="middle"
                  fontSize={label >= 100 ? 13 : 16}
                  fontWeight={700}
                  fill="var(--ink-900)"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
