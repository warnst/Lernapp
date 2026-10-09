// Neutrales Paket-Icon für unbekannte Icon-IDs (docs/02, 6.3: nie ein leerer Platz).
export function PaketIcon({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      data-icon="paket"
    >
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 22 L32 12 L54 22 L54 46 L32 56 L10 46 Z" fill="var(--ill-wood)" />
        <path d="M32 32 L54 22 L54 46 L32 56 Z" fill="var(--ill-wood-dark)" />
        <path d="M10 22 L32 32 L54 22" fill="none" />
        <path d="M21 17 L43 27 L43 36" fill="none" />
      </g>
    </svg>
  );
}
