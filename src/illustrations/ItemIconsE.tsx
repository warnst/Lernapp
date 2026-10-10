import type { ReactNode } from 'react';

// Sachen-Icons, Teil E: Bilder für die Üben-Themen ohne Geld (docs/13). viewBox 0 0 64 64.

export const ITEM_DRAWINGS_E = new Map<string, ReactNode>([
  [
    'wecker',
    <g key="wecker">
      <path d="M14 18 a8 8 0 0 1 12 -6 M50 18 a8 8 0 0 0 -12 -6" fill="var(--sun-400)" />
      <path d="M18 56 L22 50 M46 56 L42 50" fill="none" />
      <circle cx={32} cy={34} r={20} fill="var(--coral-400)" />
      <circle cx={32} cy={34} r={15} fill="var(--white)" />
      <path d="M32 34 V23 M32 34 L40 38" fill="none" strokeWidth={3.5} />
      <circle cx={32} cy={34} r={1.8} fill="var(--stroke)" />
    </g>,
  ],
  [
    'kalender',
    <g key="kalender">
      <rect x={9} y={13} width={46} height={42} rx={5} fill="var(--white)" />
      <path d="M9 18 a5 5 0 0 1 5 -5 H50 a5 5 0 0 1 5 5 V25 H9 Z" fill="var(--coral-400)" />
      <path d="M21 8 V17 M43 8 V17" fill="none" strokeWidth={4} />
      <path
        d="M17 32 h6 M29 32 h6 M41 32 h6 M17 40 h6 M29 40 h6 M41 40 h6 M17 48 h6 M29 48 h6"
        fill="none"
        strokeWidth={3.5}
      />
      <circle cx={44} cy={48} r={4.5} fill="var(--sun-400)" strokeWidth={2} />
    </g>,
  ],
  [
    'formen',
    <g key="formen">
      <path d="M18 8 L32 32 H4 Z" fill="var(--sun-400)" />
      <circle cx={45} cy={20} r={12} fill="var(--sea-500)" />
      <rect x={8} y={38} width={20} height={20} fill="var(--coral-400)" />
      <path d="M46 36 L57 43 L53 56 H39 L35 43 Z" fill="var(--palm-600)" />
    </g>,
  ],
  [
    'zahlenstrahl',
    <g key="zahlenstrahl">
      <rect x={4} y={22} width={56} height={22} rx={3} fill="var(--sun-400)" />
      <path
        d="M10 22 V32 M18 22 V28 M26 22 V32 M34 22 V28 M42 22 V32 M50 22 V28"
        fill="none"
        strokeWidth={2.5}
      />
      <path d="M8 50 H56 M50 45 L57 50 L50 55" fill="none" strokeWidth={3} />
    </g>,
  ],
]);
