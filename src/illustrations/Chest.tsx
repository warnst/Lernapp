// Schatztruhe (docs/02, 6.3): zu mit 0–5 Schlössern oder offen mit Licht und Münzen. viewBox 0 0 160 160.
// Der Deckel ist eine eigene Gruppe (`lidClassName`), damit die Oberfläche ihn per CSS kippen kann.

const MAX_LOCKS = 5;
const LOCK_GAP = 22;

export function Chest({
  open = false,
  locks = 0,
  size = 160,
  className,
  lidClassName,
}: {
  open?: boolean;
  locks?: number;
  size?: number;
  className?: string;
  lidClassName?: string;
}) {
  const lockCount = open ? 0 : Math.max(0, Math.min(MAX_LOCKS, Math.round(locks)));
  const firstLock = 80 - ((lockCount - 1) * LOCK_GAP) / 2;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={className}
      data-chest={open ? 'open' : 'closed'}
      data-locks={lockCount}
    >
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <g
          className={lidClassName}
          data-lid={open ? 'open' : 'closed'}
          style={{ transformBox: 'view-box', transformOrigin: '80px 72px' }}
        >
          {open ? (
            <>
              <path d="M20 72 L30 30 H130 L140 72 Z" fill="var(--ill-wood-dark)" />
              <path
                d="M58 30 L56 72 M102 30 L104 72"
                fill="none"
                stroke="var(--ill-gold)"
                strokeWidth={6}
              />
              <path d="M30 30 H130" fill="none" />
            </>
          ) : (
            <>
              <path
                d="M18 72 V58 C18 40 30 32 46 32 H114 C130 32 142 40 142 58 V72 Z"
                fill="var(--ill-wood-dark)"
              />
              <path
                d="M54 33 V72 M106 33 V72"
                fill="none"
                stroke="var(--ill-gold)"
                strokeWidth={6}
              />
              <path
                d="M18 72 V58 C18 40 30 32 46 32 H114 C130 32 142 40 142 58 V72 Z"
                fill="none"
              />
            </>
          )}
        </g>
        {open && (
          // Licht strahlt aus der Truhe (ohne Verlauf)
          <path
            d="M70 50 L52 12 M80 46 L80 6 M90 50 L108 12 M62 56 L26 26 M98 56 L134 26 M58 64 L10 50 M102 64 L150 50"
            fill="none"
            stroke="var(--ill-sun)"
            strokeWidth={5}
          />
        )}
        {open && (
          <>
            <path d="M20 72 L26 62 H134 L140 72 Z" fill="var(--ill-cave)" />
            <circle cx={60} cy={66} r={11} fill="var(--ill-gold)" />
            <circle cx={100} cy={66} r={11} fill="var(--ill-gold)" />
            <circle cx={80} cy={62} r={12} fill="var(--ill-gold)" />
            <path
              d="M76 58 L80 54 M56 63 L59 60 M96 63 L99 60"
              fill="none"
              stroke="var(--ill-white)"
            />
          </>
        )}
        {/* Truhenkörper mit Goldbeschlägen */}
        <rect x={18} y={72} width={124} height={68} rx={6} fill="var(--ill-wood)" />
        <path d="M18 92 H142" fill="none" strokeWidth={2} />
        <path d="M54 72 V140 M106 72 V140" fill="none" stroke="var(--ill-gold)" strokeWidth={6} />
        <path d="M18 72 H142" fill="none" />
        <rect x={18} y={72} width={124} height={68} rx={6} fill="none" />
        {lockCount === 0 && !open && (
          <>
            <rect x={70} y={66} width={20} height={20} rx={4} fill="var(--ill-gold)" />
            <path d="M80 74 V80" fill="none" strokeWidth={2.5} />
          </>
        )}
        {Array.from({ length: lockCount }, (_, i) => {
          const x = String(firstLock + i * LOCK_GAP);
          return (
            <g key={i} transform={`translate(${x} 0)`} strokeWidth={2.5}>
              <path d="M-5 104 V98 C-5 91 5 91 5 98 V104" fill="none" />
              <rect x={-8} y={102} width={16} height={14} rx={3} fill="var(--ill-gold)" />
              <path d="M0 107 V111" fill="none" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
