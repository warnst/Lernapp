import type { ReactNode } from 'react';
import { starPath } from './star-path';

// Sachen-Icons, Teil C: Laden-Sachen, kleine Bucht und Symbole (docs/02, 6.3 und 6.4).

export const ITEM_DRAWINGS_C = new Map<string, ReactNode>([
  [
    'hut',
    <g key="hut">
      <ellipse cx={32} cy={42} rx={28} ry={10} fill="var(--ill-wood)" />
      <path d="M18 42 C18 24 22 17 32 17 C42 17 46 24 46 42 Z" fill="var(--ill-wood)" />
      <path d="M18.4 33 H45.6 L45.9 40 H18.1 Z" fill="var(--ill-coral)" />
      <circle cx={40} cy={36.5} r={4} fill="var(--ill-sun)" strokeWidth={2} />
      <path d="M18 42 C24 45 40 45 46 42" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'fernglas',
    <g key="fernglas">
      <rect x={24} y={22} width={16} height={12} rx={2} fill="var(--ill-dark)" />
      <circle cx={17} cy={38} r={14} fill="var(--ill-dark)" />
      <circle cx={47} cy={38} r={14} fill="var(--ill-dark)" />
      <circle cx={17} cy={38} r={8} fill="var(--ill-water)" />
      <circle cx={47} cy={38} r={8} fill="var(--ill-water)" />
      <path
        d="M13 35 C14 33 15 32 17 32 M43 35 C44 33 45 32 47 32"
        fill="none"
        stroke="var(--ill-white)"
        strokeWidth={2.5}
      />
    </g>,
  ],
  [
    'federstift',
    <g key="federstift">
      <rect x={32} y={44} width={24} height={14} rx={3} fill="var(--ill-dark)" />
      <path d="M54 4 C34 6 20 22 21 42 L26 38 C40 34 54 20 54 4 Z" fill="var(--ill-white)" />
      <path d="M54 4 L20 46" fill="none" strokeWidth={2} />
      <path d="M22 42 L14 56 L27 47 Z" fill="var(--ill-dark)" />
    </g>,
  ],
  [
    'feder',
    <g key="feder">
      <path d="M16 52 C14 30 30 10 54 8 C54 30 40 46 18 50 Z" fill="var(--ill-coral)" />
      <path d="M8 58 L46 18" fill="none" />
      <path d="M30 22 L32 30 M40 26 L36 32 M24 34 L28 38" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'eimer',
    <g key="eimer">
      <path d="M13 24 C13 4 51 4 51 24" fill="none" />
      <path d="M15 24 L21 57 H43 L49 24 Z" fill="var(--ill-sun)" />
      <rect x={11} y={20} width={42} height={8} rx={4} fill="var(--ill-coral)" />
      <path d="M18 40 H46" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'decke',
    <g key="decke">
      <rect x={6} y={14} width={52} height={36} rx={6} fill="var(--ill-octopus)" />
      <rect x={6} y={22} width={52} height={6} fill="var(--ill-white)" strokeWidth={2} />
      <rect x={6} y={36} width={52} height={6} fill="var(--ill-white)" strokeWidth={2} />
      <path
        d="M12 50 V56 M20 50 V56 M28 50 V56 M36 50 V56 M44 50 V56 M52 50 V56"
        fill="none"
        strokeWidth={2}
      />
    </g>,
  ],
  [
    'kerze',
    <g key="kerze">
      <path d="M12 54 C12 50 52 50 52 54 C52 59 12 59 12 54 Z" fill="var(--ill-wood)" />
      <rect x={24} y={22} width={16} height={32} rx={2} fill="var(--ill-white)" />
      <path d="M32 22 V16" fill="none" strokeWidth={2} />
      <path d="M32 3 C38 9 38 15 32 17 C26 15 26 9 32 3 Z" fill="var(--ill-sun)" />
      <path d="M28 22 V30" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'laterne',
    <g key="laterne">
      <path d="M25 10 C25 3 39 3 39 10" fill="none" />
      <rect x={20} y={18} width={24} height={30} rx={2} fill="var(--ill-glass)" />
      <path d="M32 25 C37 30 37 37 32 39 C27 37 27 30 32 25 Z" fill="var(--ill-sun)" />
      <path d="M18 18 L24 10 H40 L46 18 Z" fill="var(--ill-dark)" />
      <rect x={17} y={48} width={30} height={7} rx={2} fill="var(--ill-dark)" />
    </g>,
  ],
  [
    'lampenoel',
    <g key="lampenoel">
      <path d="M40 34 L56 20" fill="none" strokeWidth={5} />
      <path d="M17 26 L23 15 H33 L39 26 Z" fill="var(--ill-coral)" />
      <rect x={12} y={26} width={32} height={31} rx={4} fill="var(--ill-coral)" />
      <path
        d="M56 28 C53 32 53 36 56 36 C59 36 59 32 56 28 Z"
        fill="var(--ill-honey)"
        strokeWidth={2}
      />
      <path
        d="M28 34 C24 40 22 44 28 48 C34 44 32 40 28 34 Z"
        fill="var(--ill-sun)"
        strokeWidth={2}
      />
    </g>,
  ],
  [
    'krebs',
    <g key="krebs">
      <path d="M14 42 L5 46 M15 48 L8 55 M50 42 L59 46 M49 48 L56 55" fill="none" />
      <path
        d="M14 32 C5 28 5 15 13 12 L16 20 L20 16 C23 24 21 31 14 32 Z M50 32 C59 28 59 15 51 12 L48 20 L44 16 C41 24 43 31 50 32 Z"
        fill="var(--ill-coral)"
      />
      <path
        d="M12 42 C12 32 22 28 32 28 C42 28 52 32 52 42 C52 50 42 54 32 54 C22 54 12 50 12 42 Z"
        fill="var(--ill-coral)"
      />
      <path
        d="M22 26 A5 5 0 1 0 32 26 A5 5 0 1 0 22 26 Z M32 26 A5 5 0 1 0 42 26 A5 5 0 1 0 32 26 Z"
        fill="var(--ill-white)"
        strokeWidth={2.5}
      />
      <path d="M27.5 26 H27.6 M36.5 26 H36.6" fill="none" strokeWidth={4} />
      <path d="M27 42 Q32 46 37 42" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  [
    'stein',
    <g key="stein">
      <path
        d="M9 46 C7 34 18 22 32 22 C46 22 57 32 55 44 C53 53 13 55 9 46 Z"
        fill="var(--ill-rock)"
      />
      <path d="M21 33 C23 30 27 28 31 28" fill="none" stroke="var(--ill-white)" strokeWidth={2.5} />
      <path d="M40 42 L44 40 M36 47 L39 46" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'moewe',
    <g key="moewe">
      <path d="M26 46 V54 M34 46 V54" fill="none" strokeWidth={2.5} />
      <path
        d="M6 36 C14 30 24 30 32 32 C34 23 45 21 49 27 L49 34 C49 44 36 48 22 46 C14 45 9 41 6 36 Z"
        fill="var(--ill-white)"
      />
      <path d="M48 27 L58 30 L48 33 Z" fill="var(--ill-sun)" />
      <path d="M16 36 C22 29 33 31 38 38 C30 43 21 42 16 36 Z" fill="var(--ill-rock)" />
      <circle cx={43} cy={27} r={2} fill="var(--stroke)" />
    </g>,
  ],
  [
    'boot',
    <g key="boot">
      <path d="M32 42 V8" fill="none" />
      <path d="M35 10 L53 36 H35 Z" fill="var(--ill-white)" />
      <path d="M29 15 L15 36 H29 Z" fill="var(--ill-coral)" />
      <path d="M7 40 H57 L49 52 H15 Z" fill="var(--ill-wood)" />
      <path
        d="M4 57 Q10 53 16 57 Q22 61 28 57 Q34 53 40 57 Q46 61 52 57 Q56 55 60 57"
        fill="none"
        strokeWidth={2.5}
      />
    </g>,
  ],
  [
    'murmel',
    <g key="murmel">
      <circle cx={32} cy={32} r={20} fill="var(--ill-water)" />
      <path
        d="M16 35 C22 26 30 39 40 30 C44 27 47 28 48 30 C46 39 38 45 30 41 C24 38 20 39 16 35 Z"
        fill="var(--ill-sun)"
        strokeWidth={2}
      />
      <path d="M22 21 C25 18 28 17 31 17" fill="none" stroke="var(--ill-white)" strokeWidth={3} />
    </g>,
  ],
  [
    'sticker',
    <g key="sticker">
      <path
        d="M18 10 H46 C50 10 54 14 54 18 V40 L40 54 H18 C14 54 10 50 10 46 V18 C10 14 14 10 18 10 Z"
        fill="var(--ill-white)"
      />
      <path d="M54 40 L40 54 C40 46 46 40 54 40 Z" fill="var(--ill-rock)" />
      <path d={starPath(31, 31, 15, 7)} fill="var(--ill-starfish)" />
    </g>,
  ],
  [
    'seestern',
    <g key="seestern">
      <path
        d="M32 6 C35 6 36 16 38 22 C44 22 58 22 58 26 C58 30 48 35 43 38 C45 44 50 56 46 58 C42 60 36 51 32 47 C28 51 22 60 18 58 C14 56 19 44 21 38 C16 35 6 30 6 26 C6 22 20 22 26 22 C28 16 29 6 32 6 Z"
        fill="var(--ill-starfish)"
      />
      <path d="M28.5 30 H28.6 M35.4 30 H35.5" fill="none" strokeWidth={4} />
      <path d="M29 36 Q32 39 35 36" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'stern',
    <g key="stern">
      <path d={starPath(32, 34, 27, 12)} fill="var(--ill-sun)" />
      <path d="M22 28 L26 25" fill="none" stroke="var(--ill-white)" strokeWidth={2.5} />
    </g>,
  ],
  [
    'anker',
    <g key="anker" strokeWidth={4}>
      <circle cx={32} cy={10} r={5} fill="none" />
      <path d="M32 15 V55 M21 23 H43" fill="none" />
      <path d="M10 37 C11 49 21 56 32 56 C43 56 53 49 54 37" fill="none" />
      <path d="M5 43 L10 36 L16 41 M59 43 L54 36 L48 41" fill="none" />
    </g>,
  ],
]);
