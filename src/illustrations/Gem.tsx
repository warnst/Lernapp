// Glitzerstein (docs/09, 10): facettierter Edelstein, nicht gefunden nur als gestrichelter Umriss. viewBox 0 0 48 48.

const OUTLINE = 'M8 20 L16 10 H32 L40 20 L24 42 Z';

export function Gem({
  size = 32,
  found = true,
  className,
}: {
  size?: number;
  found?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      data-gem=""
      data-found={found}
    >
      <g strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        {found ? (
          <g stroke="var(--stroke)">
            <path d={OUTLINE} fill="var(--ill-gem)" />
            <path d="M8 20 H40 L24 42 Z" fill="var(--ill-gem-dark)" strokeWidth={2} />
            <path d="M16 10 L20 20 L24 10 L28 20 L32 10" fill="var(--ill-bg-sea)" strokeWidth={2} />
            <path d="M20 20 L24 42 L28 20" fill="none" strokeWidth={2} />
            <path d={OUTLINE} fill="none" />
            <path
              d="M42 4 V10 M39 7 H45 M5 32 L8 35"
              fill="none"
              stroke="var(--ill-sun)"
              strokeWidth={2.5}
            />
          </g>
        ) : (
          <path d={OUTLINE} fill="none" stroke="var(--ink-600)" strokeDasharray="4 5" />
        )}
      </g>
    </svg>
  );
}
