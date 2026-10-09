// Perle als Belohnung (docs/09). viewBox 0 0 40 40.
export function Pearl({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      data-pearl=""
    >
      <circle
        cx={20}
        cy={20}
        r={16}
        fill="var(--ill-pearl)"
        stroke="var(--stroke)"
        strokeWidth={3}
      />
      <circle cx={14} cy={14} r={4} fill="var(--ill-white)" />
    </svg>
  );
}
