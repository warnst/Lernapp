// Nebelwolke über noch nicht erreichten Orten (docs/02, 6.3). Halbtransparent, ohne harte Kontur.
export function Fog({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size * 0.6}
      viewBox="0 0 120 72"
      className={className}
    >
      <g opacity={0.88}>
        <path
          d="M24 64 C8 64 4 48 16 42 C12 26 30 18 40 26 C44 10 68 6 76 22 C86 13 104 20 102 36 C116 38 118 62 100 64 Z"
          fill="var(--ill-fog)"
        />
        <path
          d="M18 56 C30 60 50 58 60 56 C72 59 92 60 108 54 C108 60 104 64 100 64 H24 C21 64 19 61 18 56 Z"
          fill="var(--ill-fog-shade)"
        />
      </g>
    </svg>
  );
}
