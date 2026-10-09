import type { ReactNode } from 'react';
import { PaketIcon } from './PaketIcon';

// Stufen-Icons (docs/02, 6.4): Muschel, Seestern, Krebs, Oktopus. viewBox 0 0 64 64.

const ICONS = new Map<string, ReactNode>([
  [
    'stufe-muschel',
    <g key="muschel">
      <path d="M26 50 L22 56 L42 56 L38 50 Z" fill="var(--ill-shell)" />
      <path d="M32 52 L10 31 C8 17 20 8 32 8 C44 8 56 17 54 31 Z" fill="var(--ill-shell)" />
      <path
        d="M32 52 L20 13 M32 52 L32 9 M32 52 L44 13 M32 52 L13 24 M32 52 L51 24"
        fill="none"
        strokeWidth={2.5}
      />
    </g>,
  ],
  [
    'stufe-seestern',
    <g key="seestern">
      <path
        d="M32 6 C35 6 36 16 38 22 C44 22 58 22 58 26 C58 30 48 35 43 38 C45 44 50 56 46 58 C42 60 36 51 32 47 C28 51 22 60 18 58 C14 56 19 44 21 38 C16 35 6 30 6 26 C6 22 20 22 26 22 C28 16 29 6 32 6 Z"
        fill="var(--ill-starfish)"
      />
      <g fill="var(--ill-white)" stroke="none">
        <circle cx={32} cy={20} r={1.8} />
        <circle cx={24} cy={28} r={1.8} />
        <circle cx={40} cy={28} r={1.8} />
        <circle cx={27} cy={40} r={1.8} />
        <circle cx={37} cy={40} r={1.8} />
        <circle cx={32} cy={31} r={2.2} />
      </g>
    </g>,
  ],
  [
    'stufe-krebs',
    <g key="krebs">
      <path
        d="M14 40 L6 44 M14 46 L8 52 M50 40 L58 44 M50 46 L56 52"
        fill="none"
        strokeWidth={2.5}
      />
      <path d="M22 30 L16 22 M42 30 L48 22" fill="none" />
      <path d="M8 18 C6 10 14 6 18 10 L14 14 L20 16 C20 22 12 24 8 18 Z" fill="var(--ill-coral)" />
      <path
        d="M56 18 C58 10 50 6 46 10 L50 14 L44 16 C44 22 52 24 56 18 Z"
        fill="var(--ill-coral)"
      />
      <ellipse cx={32} cy={42} rx={20} ry={13} fill="var(--ill-coral)" />
      <path d="M27 30 V24 M37 30 V24" fill="none" strokeWidth={2.5} />
      <circle cx={27} cy={22} r={4} fill="var(--ill-white)" strokeWidth={2.5} />
      <circle cx={37} cy={22} r={4} fill="var(--ill-white)" strokeWidth={2.5} />
      <circle cx={27} cy={22} r={1.8} fill="var(--stroke)" stroke="none" />
      <circle cx={37} cy={22} r={1.8} fill="var(--stroke)" stroke="none" />
      <path d="M27 44 Q32 48 37 44" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  [
    'stufe-oktopus',
    <g key="oktopus">
      <path
        d="M14 34 C14 18 22 8 32 8 C42 8 50 18 50 34 C54 40 58 46 56 52 C52 50 50 46 46 42 C46 50 46 56 42 58 C38 56 38 48 36 44 C34 50 34 56 32 58 C30 56 30 50 28 44 C26 48 26 56 22 58 C18 56 18 50 18 42 C14 46 12 50 8 52 C6 46 10 40 14 34 Z"
        fill="var(--ill-octopus)"
      />
      <circle cx={26} cy={28} r={5} fill="var(--ill-white)" strokeWidth={2.5} />
      <circle cx={38} cy={28} r={5} fill="var(--ill-white)" strokeWidth={2.5} />
      <circle cx={26.5} cy={29} r={2.2} fill="var(--stroke)" stroke="none" />
      <circle cx={38.5} cy={29} r={2.2} fill="var(--stroke)" stroke="none" />
      <path d="M28 37 Q32 40 36 37" fill="none" strokeWidth={2.5} />
    </g>,
  ],
]);

export function StufeIcon({
  icon,
  size = 40,
  className,
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  const art = ICONS.get(icon);
  if (art === undefined) return <PaketIcon size={size} className={className} />;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      data-icon={icon}
    >
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        {art}
      </g>
    </svg>
  );
}
