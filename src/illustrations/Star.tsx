import { starPath } from './star-path';

// Belohnungsstern (docs/02): gefüllt in Sonnengelb, leer nur als gestrichelte Kontur. viewBox 0 0 48 48.

const STAR = starPath(24, 25.5, 21, 10.5);

export function Star({
  size = 40,
  filled = true,
  className,
}: {
  size?: number;
  filled?: boolean;
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
      data-star={filled ? 'filled' : 'empty'}
    >
      <path
        d={STAR}
        fill={filled ? 'var(--ill-sun)' : 'none'}
        stroke={filled ? 'var(--stroke)' : 'var(--ink-600)'}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={filled ? undefined : '4 5'}
      />
    </svg>
  );
}
