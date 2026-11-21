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
  // Erstlese- & Silben-Illustrationen
  [
    'mama',
    <g key="mama">
      <path d="M15 30 C13 13 21 8 32 8 C43 8 51 13 49 30 L52 44 H12 Z" fill="var(--ill-trunk)" />
      <circle cx={32} cy={30} r={14} fill="var(--ill-shell)" />
      <path d="M18 56 C19 46 25 43 32 43 C39 43 45 46 46 56 Z" fill="var(--ill-jam)" />
      <circle cx={27} cy={29} r={2} fill="var(--stroke)" />
      <circle cx={37} cy={29} r={2} fill="var(--stroke)" />
      <path d="M27 35 Q32 39 37 35" fill="none" strokeWidth={2.2} />
    </g>,
  ],
  [
    'oma',
    <g key="oma">
      <circle cx={32} cy={12} r={7} fill="var(--ill-pearl)" />
      <circle cx={32} cy={29} r={15} fill="var(--ill-pearl)" />
      <circle cx={32} cy={31} r={13} fill="var(--ill-shell)" />
      <path d="M18 56 C19 46 25 44 32 44 C39 44 45 46 46 56 Z" fill="var(--ill-octopus)" />
      <circle cx={26.5} cy={30} r={4} fill="none" strokeWidth={2} />
      <circle cx={37.5} cy={30} r={4} fill="none" strokeWidth={2} />
      <path d="M30.5 30 H33.5 M27 37 Q32 41 37 37" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'papa',
    <g key="papa">
      <path d="M18 26 C18 14 24 10 32 10 C40 10 46 14 46 26 Z" fill="var(--ill-coconut)" />
      <circle cx={32} cy={30} r={14} fill="var(--ill-shell)" />
      <path d="M17 56 C18 46 24 43 32 43 C40 43 46 46 47 56 Z" fill="var(--ill-jeans)" />
      <circle cx={27} cy={28} r={2} fill="var(--stroke)" />
      <circle cx={37} cy={28} r={2} fill="var(--stroke)" />
      <path d="M26 35 Q32 39 38 35" fill="none" strokeWidth={2.2} />
    </g>,
  ],
  [
    'lama',
    <g key="lama">
      <path d="M22 10 L26 20 M33 10 L31 20" fill="none" strokeWidth={3.5} />
      <path
        d="M21 20 C21 17 34 17 34 23 V35 H47 C51 35 53 39 53 45 V56 H46 V48 H28 V56 H21 Z"
        fill="var(--ill-sand)"
      />
      <circle cx={26} cy={25} r={2} fill="var(--stroke)" />
      <path d="M18 27 Q21 29 24 27" fill="none" strokeWidth={2} />
      <path d="M31 35 H45" fill="none" stroke="var(--coral-400)" strokeWidth={4} />
    </g>,
  ],
  [
    'limo',
    <g key="limo">
      <path d="M38 24 L45 7 H52" fill="none" strokeWidth={3} />
      <path d="M17 18 L21 56 H43 L47 18 Z" fill="var(--ill-glass)" />
      <path d="M19 28 L21 54 H43 L45 28 Z" fill="var(--ill-lemon)" />
      <circle cx={29} cy={38} r={2.5} fill="var(--ill-white)" strokeWidth={1.5} />
      <circle cx={36} cy={45} r={2} fill="var(--ill-white)" strokeWidth={1.5} />
      <circle cx={34} cy={34} r={1.8} fill="var(--ill-white)" strokeWidth={1.5} />
    </g>,
  ],
  [
    'sofa',
    <g key="sofa">
      <rect x={12} y={18} width={40} height={20} rx={7} fill="var(--coral-400)" />
      <rect x={7} y={29} width={10} height={21} rx={4} fill="var(--coral-400)" />
      <rect x={47} y={29} width={10} height={21} rx={4} fill="var(--coral-400)" />
      <rect x={15} y={34} width={34} height={15} rx={4} fill="var(--ill-sun)" />
      <path d="M14 50 V56 M50 50 V56" fill="none" strokeWidth={4} />
    </g>,
  ],
  [
    'nase',
    <g key="nase">
      <circle cx={32} cy={32} r={22} fill="var(--ill-shell)" />
      <path
        d="M32 16 C35 28 42 35 40 42 C38 47 26 47 24 42 C23 39 26 36 29 37"
        fill="var(--ill-bg-sand)"
        strokeWidth={3}
      />
      <circle cx={29} cy={42} r={1.8} fill="var(--stroke)" />
      <circle cx={35} cy={42} r={1.8} fill="var(--stroke)" />
    </g>,
  ],
  [
    'rose',
    <g key="rose">
      <path d="M32 34 V58" fill="none" strokeWidth={3.5} />
      <path d="M32 46 C22 44 18 39 18 39 C22 50 28 50 32 48 Z" fill="var(--ill-leaf)" />
      <path d="M32 44 C42 42 46 37 46 37 C42 48 36 48 32 46 Z" fill="var(--ill-leaf)" />
      <circle cx={32} cy={22} r={14} fill="var(--ill-tomato)" />
      <path
        d="M25 22 C25 16 39 16 38 23 C37 28 28 28 29 22 C30 19 34 20 33 23"
        fill="none"
        strokeWidth={2.2}
      />
    </g>,
  ],
  [
    'dose',
    <g key="dose">
      <rect x={15} y={14} width={34} height={42} rx={5} fill="var(--ill-metal)" />
      <ellipse cx={32} cy={14} rx={17} ry={5} fill="var(--ill-white)" />
      <rect x={15} y={24} width={34} height={20} fill="var(--sea-500)" />
      <circle cx={32} cy={34} r={6} fill="var(--ill-sun)" />
    </g>,
  ],
  [
    'kino',
    <g key="kino">
      <rect x={8} y={14} width={48} height={34} rx={4} fill="var(--ill-dark)" />
      <rect x={13} y={19} width={38} height={24} rx={2} fill="var(--ill-sky)" />
      <polygon points="28,25 28,37 39,31" fill="var(--ill-sun)" />
      <path d="M12 54 H52" fill="none" strokeWidth={4} />
    </g>,
  ],
  [
    'salami',
    <g key="salami">
      <circle cx={32} cy={32} r={22} fill="var(--ill-cherry)" />
      <circle cx={32} cy={32} r={18} fill="var(--ill-tomato)" strokeWidth={1.5} />
      <circle cx={24} cy={25} r={3} fill="var(--ill-sand)" stroke="none" />
      <circle cx={39} cy={24} r={2.5} fill="var(--ill-sand)" stroke="none" />
      <circle cx={34} cy={34} r={3.2} fill="var(--ill-sand)" stroke="none" />
      <circle cx={24} cy={39} r={2.5} fill="var(--ill-sand)" stroke="none" />
      <circle cx={41} cy={38} r={2.8} fill="var(--ill-sand)" stroke="none" />
    </g>,
  ],
  [
    'buch',
    <g key="buch">
      <path
        d="M8 14 C16 10 26 11 32 16 C38 11 48 10 56 14 V50 C48 46 38 47 32 52 C26 47 16 46 8 50 Z"
        fill="var(--ill-white)"
      />
      <path d="M32 16 V52" fill="none" strokeWidth={2.5} />
      <path
        d="M14 24 H26 M14 32 H26 M14 40 H24"
        fill="none"
        stroke="var(--syllable-a)"
        strokeWidth={2.5}
      />
      <path
        d="M38 24 H50 M38 32 H50 M38 40 H48"
        fill="none"
        stroke="var(--syllable-b)"
        strokeWidth={2.5}
      />
    </g>,
  ],
]);
