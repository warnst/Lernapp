import type { ReactNode } from 'react';
import { starPath } from './star-path';

// Sachen-Icons, Teil B: Strand, Spielzeug, Piraten (docs/02, 6.3). viewBox 0 0 64 64.

export const ITEM_DRAWINGS_B = new Map<string, ReactNode>([
  [
    'muschel',
    <g key="muschel">
      <path d="M27 50 L23 56 L41 56 L37 50 Z" fill="var(--ill-shell)" />
      <path d="M32 52 L11 32 C9 18 20 9 32 9 C44 9 55 18 53 32 Z" fill="var(--ill-shell)" />
      <path
        d="M32 52 L21 14 M32 52 L32 10 M32 52 L43 14 M32 52 L14 25 M32 52 L50 25"
        fill="none"
        strokeWidth={2.5}
      />
    </g>,
  ],
  [
    'seil',
    <g key="seil">
      <path d="M44 46 C52 48 58 52 54 59" fill="none" />
      <circle cx={30} cy={33} r={21} fill="var(--ill-wood)" />
      <circle cx={30} cy={33} r={14} fill="none" strokeWidth={2.5} />
      <circle cx={30} cy={33} r={7} fill="var(--ill-wood-dark)" />
      <path
        d="M12 25 L17 28 M44 15 L41 20 M47 41 L42 38 M20 50 L22 45"
        fill="none"
        strokeWidth={2}
      />
    </g>,
  ],
  [
    'postkarte',
    <g key="postkarte">
      <rect x={5} y={13} width={54} height={38} rx={3} fill="var(--ill-white)" />
      <rect x={43} y={18} width={11} height={13} rx={1} fill="var(--ill-coral)" strokeWidth={2} />
      <path d="M32 17 V47 M36 38 H54 M36 44 H50" fill="none" strokeWidth={2} />
      <circle cx={18} cy={27} r={6} fill="var(--ill-sun)" />
      <path d="M9 42 Q13 38 17 42 Q21 46 25 42 Q27 40 29 42" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  [
    'muschelkette',
    <g key="muschelkette">
      <path d="M10 8 C10 40 22 50 32 50 C42 50 54 40 54 8" fill="none" strokeWidth={2.5} />
      <circle cx={12} cy={29} r={4.5} fill="var(--ill-water)" />
      <circle cx={52} cy={29} r={4.5} fill="var(--ill-water)" />
      <circle cx={17} cy={41} r={4.5} fill="var(--ill-shell)" />
      <circle cx={47} cy={41} r={4.5} fill="var(--ill-shell)" />
      <path
        d="M32 62 L22 52 C21 46 26 44 32 44 C38 44 43 46 42 52 Z M32 62 L28 47 M32 62 L36 47"
        fill="var(--ill-shell)"
      />
    </g>,
  ],
  [
    'muschelarmband',
    <g key="muschelarmband">
      <circle cx={32} cy={33} r={20} fill="none" />
      <path d="M32 18 L24 9 C24 5 28 3 32 3 C36 3 40 5 40 9 Z" fill="var(--ill-shell)" />
      <circle cx={51} cy={27} r={5} fill="var(--ill-water)" />
      <circle cx={44} cy={49} r={5} fill="var(--ill-shell)" />
      <circle cx={20} cy={49} r={5} fill="var(--ill-water)" />
      <circle cx={13} cy={27} r={5} fill="var(--ill-shell)" />
    </g>,
  ],
  [
    'vogelpfeife',
    <g key="vogelpfeife">
      <path d="M14 32 H4 V40 H14" fill="var(--ill-wood)" />
      <path
        d="M12 36 C12 26 20 20 30 21 C32 14 44 13 47 20 L56 23 L47 27 C49 36 45 49 30 50 C18 50 12 44 12 36 Z"
        fill="var(--ill-water)"
      />
      <path d="M20 36 C25 29 34 30 37 37 C31 42 25 42 20 36 Z" fill="var(--ill-purse)" />
      <circle cx={41} cy={21} r={2} fill="var(--stroke)" />
      <path d="M56 32 Q60 36 56 40 M52 36 Q54 38 52 41" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  [
    'streichhoelzer',
    <g key="streichhoelzer">
      <path d="M22 32 V14 M32 32 V11 M42 32 V15" fill="none" />
      <circle cx={22} cy={12} r={3.5} fill="var(--ill-coral)" />
      <circle cx={32} cy={9} r={3.5} fill="var(--ill-coral)" />
      <circle cx={42} cy={13} r={3.5} fill="var(--ill-coral)" />
      <rect x={8} y={28} width={48} height={28} rx={3} fill="var(--ill-sun)" />
      <rect x={8} y={47} width={48} height={9} rx={3} fill="var(--ill-coconut)" />
    </g>,
  ],
  [
    'strandball',
    <g key="strandball">
      <circle cx={32} cy={32} r={24} fill="var(--ill-white)" />
      <path d="M32 8 C17 13 11 38 19 52 C22 36 25 20 32 8 Z" fill="var(--ill-coral)" />
      <path d="M32 8 C47 13 53 38 45 52 C42 36 39 20 32 8 Z" fill="var(--ill-water)" />
      <path d="M32 8 C28 24 28 44 32 56 C36 44 36 24 32 8 Z" fill="var(--ill-sun)" />
      <circle cx={32} cy={11} r={3.5} fill="var(--ill-white)" />
    </g>,
  ],
  [
    'ball',
    <g key="ball">
      <circle cx={32} cy={32} r={23} fill="var(--ill-coral)" />
      <path d={starPath(32, 33, 11, 5)} fill="var(--ill-sun)" strokeWidth={2} />
      <path d="M17 24 C18 20 21 16 25 14" fill="none" stroke="var(--ill-white)" />
    </g>,
  ],
  [
    'stickerheft',
    <g key="stickerheft">
      <rect x={12} y={7} width={42} height={52} rx={4} fill="var(--ill-water)" />
      <path d="M20 7 V59" fill="none" />
      <path d={starPath(37, 25, 10, 4.5)} fill="var(--ill-sun)" strokeWidth={2} />
      <rect x={26} y={41} width={22} height={10} rx={2} fill="var(--ill-white)" />
    </g>,
  ],
  [
    'sonnencreme',
    <g key="sonnencreme">
      <path d="M16 6 H48 L43 46 H21 Z" fill="var(--ill-white)" />
      <rect x={21} y={46} width={22} height={13} rx={3} fill="var(--ill-coral)" />
      <circle cx={32} cy={24} r={7} fill="var(--ill-sun)" />
      <path
        d="M32 11 V13 M32 35 V37 M19 24 H21 M43 24 H45 M23 15 L24.5 16.5 M41 15 L39.5 16.5"
        fill="none"
        strokeWidth={2}
      />
    </g>,
  ],
  [
    'seifenblasen',
    <g key="seifenblasen">
      <rect x={8} y={30} width={20} height={28} rx={5} fill="var(--ill-water)" />
      <rect x={11} y={23} width={14} height={8} rx={2} fill="var(--ill-coral)" />
      <circle cx={42} cy={20} r={13} fill="var(--ill-glass)" />
      <circle cx={52} cy={45} r={7} fill="var(--ill-glass)" />
      <circle cx={37} cy={48} r={4} fill="var(--ill-glass)" />
      <path d="M35 15 C36 12 38 10 41 10" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  [
    'schatzkaestchen',
    <g key="schatzkaestchen">
      <rect x={9} y={30} width={46} height={24} rx={3} fill="var(--ill-wood)" />
      <path
        d="M9 30 V25 C9 18 14 14 21 14 H43 C50 14 55 18 55 25 V30 Z"
        fill="var(--ill-wood-dark)"
      />
      <path d="M21 14 V54 M43 14 V54" fill="none" />
      <rect x={27} y={26} width={10} height={12} rx={2} fill="var(--ill-gold)" />
      <path d="M32 31 V34" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'piratenhut',
    <g key="piratenhut">
      <path
        d="M4 42 C10 30 16 16 32 16 C48 16 54 30 60 42 C46 46 18 46 4 42 Z"
        fill="var(--ill-dark)"
      />
      <path d="M4 42 C18 46 46 46 60 42 L58 48 C44 52 20 52 6 48 Z" fill="var(--ill-gold)" />
      <path d="M24 38 L40 30 M24 30 L40 38" fill="none" stroke="var(--ill-white)" />
      <circle cx={32} cy={27} r={6} fill="var(--ill-white)" strokeWidth={2} />
      <path d="M29.5 26.5 H29.6 M34.4 26.5 H34.5" fill="none" strokeWidth={3} />
    </g>,
  ],
  [
    'augenklappe',
    <g key="augenklappe">
      <path d="M4 14 L17 28 M47 28 L60 14" fill="none" strokeWidth={2.5} />
      <path d="M16 27 H48 C48 42 40 52 32 52 C24 52 16 42 16 27 Z" fill="var(--ill-dark)" />
      <path d="M22 33 C23 39 26 43 29 45" fill="none" stroke="var(--ill-white)" strokeWidth={2.5} />
    </g>,
  ],
  [
    'kopftuch',
    <g key="kopftuch">
      <path d="M10 18 L2 10 L4 24 Z" fill="var(--ill-coral)" />
      <path d="M6 18 H58 L32 54 Z" fill="var(--ill-coral)" />
      <path d="M8 18 Q32 26 56 18" fill="none" strokeWidth={2} />
      <circle cx={22} cy={28} r={3} fill="var(--ill-white)" strokeWidth={1.5} />
      <circle cx={42} cy={28} r={3} fill="var(--ill-white)" strokeWidth={1.5} />
      <circle cx={32} cy={40} r={3} fill="var(--ill-white)" strokeWidth={1.5} />
    </g>,
  ],
  [
    'kompass',
    <g key="kompass">
      <circle cx={32} cy={7} r={4} fill="var(--ill-gold)" />
      <circle cx={32} cy={34} r={24} fill="var(--ill-wood)" />
      <circle cx={32} cy={34} r={18} fill="var(--ill-white)" />
      <path d="M32 18 L37 34 H27 Z" fill="var(--ill-coral)" />
      <path d="M32 50 L37 34 H27 Z" fill="var(--ill-rock)" />
      <circle cx={32} cy={34} r={2.5} fill="var(--stroke)" />
    </g>,
  ],
  [
    'karte',
    <g key="karte">
      <path d="M6 14 L22 8 L42 14 L58 8 V50 L42 56 L22 50 L6 56 Z" fill="var(--ill-sand)" />
      <path d="M22 8 V50 M42 14 V56" fill="none" strokeWidth={2} />
      <path
        d="M12 46 C18 38 26 42 30 32 C34 24 40 30 44 26"
        fill="none"
        strokeWidth={2.5}
        strokeDasharray="1 5"
      />
      <path d="M45 16 L53 24 M53 16 L45 24" fill="none" stroke="var(--ill-coral)" strokeWidth={4} />
    </g>,
  ],
]);
