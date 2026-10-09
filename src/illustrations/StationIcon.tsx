import type { ReactNode } from 'react';
import { PaketIcon } from './PaketIcon';

// Stations-Icons (docs/02, 6.3 und 6.4). Quadratisch, viewBox 0 0 64 64.

const SCALLOP = (
  <g>
    <path d="M27 50 L23 56 L41 56 L37 50 Z" fill="var(--ill-shell)" />
    <path d="M32 52 L11 32 C9 18 20 9 32 9 C44 9 55 18 53 32 Z" fill="var(--ill-shell)" />
    <path d="M32 52 L21 14 M32 52 L32 10 M32 52 L43 14 M32 52 L14 25 M32 52 L50 25" fill="none" />
  </g>
);

const ICONS = new Map<string, ReactNode>([
  ['station-muschel', SCALLOP],
  [
    'station-markt',
    <g key="markt">
      <path d="M14 30 V54 M50 30 V54" fill="none" />
      <rect x={10} y={40} width={44} height={14} rx={2} fill="var(--ill-wood)" />
      <circle cx={22} cy={36} r={4} fill="var(--ill-sun)" />
      <circle cx={32} cy={36} r={4} fill="var(--ill-coral)" />
      <circle cx={42} cy={36} r={4} fill="var(--ill-leaf)" />
      <path d="M8 22 L14 10 H50 L56 22 Z" fill="var(--ill-white)" />
      <path d="M20 10 L18 22 M32 10 V22 M44 10 L46 22" fill="none" />
      <path
        d="M8 22 Q11 28 14 22 Q17 28 20 22 Q23 28 26 22 Q29 28 32 22 Q35 28 38 22 Q41 28 44 22 Q47 28 50 22 Q53 28 56 22"
        fill="var(--ill-coral)"
      />
    </g>,
  ],
  [
    'station-kiosk',
    <g key="kiosk">
      <rect x={14} y={24} width={36} height={30} rx={2} fill="var(--ill-wood)" />
      <rect x={20} y={30} width={24} height={12} rx={2} fill="var(--ill-water)" />
      <path d="M8 26 L32 8 L56 26 Z" fill="var(--ill-sun)" />
      <path d="M14 44 H50" fill="none" />
      <circle cx={32} cy={38} r={7} fill="var(--ill-coconut)" />
      <circle cx={30} cy={36} r={1} fill="var(--stroke)" />
      <circle cx={34} cy={36} r={1} fill="var(--stroke)" />
      <circle cx={32} cy={40} r={1} fill="var(--stroke)" />
    </g>,
  ],
  [
    'station-geldboerse',
    <g key="geldboerse">
      <circle cx={42} cy={16} r={8} fill="var(--ill-gold)" />
      <path d="M42 12 V20" fill="none" strokeWidth={2.5} />
      <rect x={10} y={22} width={44} height={32} rx={8} fill="var(--ill-purse)" />
      <path d="M10 32 C10 26 14 22 20 22 H44 C50 22 54 26 54 32 L32 40 Z" fill="var(--ill-water)" />
      <circle cx={32} cy={40} r={4} fill="var(--ill-gold)" />
    </g>,
  ],
  [
    'station-laden',
    <g key="laden">
      <rect x={12} y={26} width={40} height={28} fill="var(--ill-wood)" />
      <path d="M8 28 L14 14 H50 L56 28 Z" fill="var(--ill-coral)" />
      <rect x={26} y={36} width={12} height={18} rx={2} fill="var(--ill-wood-dark)" />
      <rect x={16} y={34} width={7} height={7} rx={1} fill="var(--ill-water)" />
      <rect x={41} y={34} width={7} height={7} rx={1} fill="var(--ill-water)" />
      {/* Vogelschild */}
      <path d="M26 14 V8 M38 14 V8" fill="none" strokeWidth={2} />
      <rect x={22} y={2} width={20} height={9} rx={3} fill="var(--ill-white)" />
      <path
        d="M27 8 C27 4 33 4 34 6 L37 6 L34 8 C33 9 28 9 27 8 Z"
        fill="var(--kiko-body)"
        strokeWidth={1.5}
      />
    </g>,
  ],
  [
    'station-bruecke',
    <g key="bruecke">
      <path d="M4 44 Q32 58 60 44 L60 50 Q32 64 4 50 Z" fill="var(--ill-wood)" />
      <path
        d="M14 48 L14 55 M24 51 L24 58 M34 52 L34 59 M44 51 L44 58 M52 48 L52 55"
        fill="none"
        strokeWidth={2}
      />
      <path d="M8 16 V48 M56 16 V48" fill="none" />
      <path d="M8 18 Q32 42 56 18" fill="none" strokeWidth={2.5} />
      <path d="M18 28 V48 M32 33 V52 M46 28 V48" fill="none" strokeWidth={2} />
      <circle cx={8} cy={14} r={3} fill="var(--ill-wood-dark)" />
      <circle cx={56} cy={14} r={3} fill="var(--ill-wood-dark)" />
    </g>,
  ],
  [
    'station-leuchtturm',
    <g key="leuchtturm">
      <path
        d="M8 18 L18 22 M8 30 L18 26 M56 18 L46 22 M56 30 L46 26"
        fill="none"
        strokeWidth={2.5}
      />
      <path d="M22 58 L26 22 H38 L42 58 Z" fill="var(--ill-white)" />
      <path d="M24.8 34 H39.2 L40.2 44 H23.8 Z" fill="var(--ill-coral)" />
      <path d="M22.4 54 H41.6 L42 58 H22 Z" fill="var(--ill-coral)" />
      <rect x={25} y={14} width={14} height={9} rx={2} fill="var(--ill-sun)" />
      <path d="M23 14 L32 6 L41 14 Z" fill="var(--ill-coral)" />
      <path d="M16 58 H48" fill="none" />
    </g>,
  ],
  [
    'station-hoehle',
    <g key="hoehle">
      <path d="M4 56 C4 36 12 16 30 12 C46 9 58 26 60 56 Z" fill="var(--ill-rock)" />
      <path d="M20 56 C20 42 26 32 32 32 C38 32 44 42 44 56 Z" fill="var(--ill-cave)" />
      <path d="M14 30 L20 26 M44 22 L50 28" fill="none" strokeWidth={2.5} />
      <path d="M2 56 H62" fill="none" />
    </g>,
  ],
  [
    'station-truhe',
    <g key="truhe">
      <rect x={8} y={30} width={48} height={24} rx={3} fill="var(--ill-wood)" />
      <path
        d="M8 30 V24 C8 16 14 12 22 12 H42 C50 12 56 16 56 24 V30 Z"
        fill="var(--ill-wood-dark)"
      />
      <path d="M20 12 V54 M44 12 V54" fill="none" />
      <rect x={27} y={26} width={10} height={12} rx={2} fill="var(--ill-gold)" />
      <path d="M32 31 V34" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'station-muschelufer',
    <g key="muschelufer">
      <path d="M2 40 Q16 32 32 38 T62 34 V62 H2 Z" fill="var(--ill-sand)" />
      <path d="M2 18 Q10 14 18 18 T34 18 T50 18 T62 18" fill="none" stroke="var(--ill-water)" />
      <path d="M2 28 Q10 24 18 28 T34 28 T50 28 T62 28" fill="none" stroke="var(--ill-water)" />
      <path d="M32 56 L20 44 C19 37 25 33 32 33 C39 33 45 37 44 44 Z" fill="var(--ill-shell)" />
      <path d="M32 56 L26 35 M32 56 V33 M32 56 L38 35" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'station-muenzquelle',
    <g key="muenzquelle">
      <ellipse cx={32} cy={48} rx={26} ry={10} fill="var(--ill-rock)" />
      <ellipse cx={32} cy={46} rx={18} ry={6} fill="var(--ill-water)" />
      <path
        d="M32 40 C32 30 26 24 20 22 M32 40 C32 30 38 24 44 22 M32 40 V20"
        fill="none"
        stroke="var(--ill-water)"
        strokeWidth={4}
      />
      <circle cx={32} cy={14} r={8} fill="var(--ill-gold)" />
      <path d="M32 10 V18" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  [
    'station-kikos-laden',
    <g key="kikos-laden">
      <rect x={14} y={28} width={36} height={26} rx={2} fill="var(--ill-wood)" />
      <path d="M10 30 L16 18 H48 L54 30 Z" fill="var(--kiko-body)" />
      <path d="M24 18 L22 30 M32 18 V30 M40 18 L42 30" fill="none" />
      <rect x={20} y={36} width={24} height={10} rx={2} fill="var(--ill-white)" />
      <circle cx={27} cy={41} r={2.5} fill="var(--ill-sun)" strokeWidth={2} />
      <circle cx={37} cy={41} r={2.5} fill="var(--ill-coral)" strokeWidth={2} />
      <path
        d="M32 18 C30 12 30 8 32 6 C34 8 34 12 32 18 Z"
        fill="var(--ill-coral)"
        strokeWidth={2}
      />
    </g>,
  ],
  [
    'station-kruemels-wippe',
    <g key="kruemels-wippe">
      <path d="M32 36 L22 54 H42 Z" fill="var(--ill-wood-dark)" />
      <rect
        x={4}
        y={32}
        width={56}
        height={7}
        rx={3.5}
        fill="var(--ill-wood)"
        transform="rotate(-12 32 35.5)"
      />
      <circle cx={12} cy={34} r={5} fill="var(--ill-coral)" />
      <path d="M14 54 H50" fill="none" />
    </g>,
  ],
  [
    'station-muscheltruhe',
    <g key="muscheltruhe">
      <rect x={12} y={34} width={40} height={20} rx={3} fill="var(--ill-wood)" />
      <path
        d="M12 34 V30 C12 24 16 20 22 20 H42 C48 20 52 24 52 30 V34 Z"
        fill="var(--ill-wood-dark)"
      />
      <rect x={28} y={31} width={8} height={9} rx={2} fill="var(--ill-gold)" />
      <path
        d="M32 18 L24 10 C24 5 28 3 32 3 C36 3 40 5 40 10 Z"
        fill="var(--ill-shell)"
        strokeWidth={2.5}
      />
    </g>,
  ],
]);

export function StationIcon({
  icon,
  size = 48,
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
