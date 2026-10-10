import type { ReactNode } from 'react';

// Sachen-Icons, Teil D: Gemüse, Obst, Fahrzeuge, Werkzeuge, Kleidung, Tiere und Himmel
// für „Was passt nicht?“ und Schattenrätsel (docs/12 3.3, 3.4). Jede Form ist auch als
// schwarze Silhouette eindeutig. viewBox 0 0 64 64, höchstens 6 Formen.

export const ITEM_DRAWINGS_D = new Map<string, ReactNode>([
  // Gemüse
  [
    'moehre',
    <g key="moehre">
      <path d="M30 19 C24 14 20 8 21 3 C27 5 31 11 32 19 Z" fill="var(--ill-leaf)" />
      <path d="M34 19 C38 12 44 8 49 8 C47 14 41 18 34 19 Z" fill="var(--ill-leaf)" />
      <path d="M31 19 C31 12 32 6 35 2 C38 8 36 14 33 19 Z" fill="var(--ill-leaf)" />
      <path d="M18 21 Q32 15 46 21 Q41 44 32 61 Q23 44 18 21 Z" fill="var(--ill-carrot)" />
      <path d="M23 30 H28 M36 37 H41 M27 46 H31" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'gurke',
    <g key="gurke">
      <g transform="rotate(-35 32 32)">
        <rect x={5} y={22} width={50} height={20} rx={10} fill="var(--ill-turtle-shell)" />
        <rect x={54} y={29} width={6} height={6} rx={2} fill="var(--ill-leaf)" strokeWidth={2} />
        <path d="M14 28 H38" fill="none" stroke="var(--ill-turtle)" strokeWidth={3} />
        <path d="M18 36 H18.1 M28 35 H28.1 M38 36 H38.1 M46 30 H46.1" fill="none" />
      </g>
    </g>,
  ],
  [
    'tomate',
    <g key="tomate">
      <path
        d="M32 18 C18 18 7 26 7 39 C7 51 18 59 32 59 C46 59 57 51 57 39 C57 26 46 18 32 18 Z"
        fill="var(--ill-tomato)"
      />
      <path
        d="M32 23 L23 18 L30 16 L28 9 L34 14 L40 9 L38 16 L45 18 Z"
        fill="var(--ill-leaf)"
        strokeWidth={2.5}
      />
      <path d="M32 14 V6" fill="none" />
      <path d="M15 34 C16 30 19 27 23 26" fill="none" stroke="var(--ill-white)" />
    </g>,
  ],
  [
    'paprika',
    <g key="paprika">
      <path
        d="M18 22 C9 24 9 40 13 50 C15 57 23 59 27 55 C29 59 35 59 37 55 C41 59 49 57 51 50 C55 40 55 24 46 22 C40 20 36 24 32 24 C28 24 24 20 18 22 Z"
        fill="var(--ill-seahorse)"
      />
      <path d="M27 54 C25 44 25 34 28 28 M37 54 C39 44 39 34 36 28" fill="none" strokeWidth={2} />
      <path d="M24 23 C28 19 36 19 40 23 C36 27 28 27 24 23 Z" fill="var(--ill-leaf)" />
      <path d="M30 21 C30 15 32 10 38 6 L41 9 C36 12 34 16 34 21 Z" fill="var(--ill-leaf)" />
    </g>,
  ],
  [
    'brokkoli',
    <g key="brokkoli">
      <path
        d="M27 59 C28 52 28 46 26 41 L18 34 L22 30 L30 37 L30 29 L34 29 L34 37 L42 30 L46 34 L38 41 C36 46 36 52 37 59 Z"
        fill="var(--ill-turtle)"
      />
      <circle cx={16} cy={27} r={11} fill="var(--ill-leaf)" />
      <circle cx={48} cy={27} r={11} fill="var(--ill-leaf)" />
      <circle cx={32} cy={18} r={13} fill="var(--ill-leaf)" />
      <path
        d="M12 26 H12.1 M20 30 H20.1 M28 14 H28.1 M36 20 H36.1 M46 24 H46.1 M51 30 H51.1"
        fill="none"
      />
    </g>,
  ],
  // Obst
  [
    'birne',
    <g key="birne">
      <path
        d="M32 14 C27 14 25 20 25 26 C25 32 13 36 13 46 C13 54 21 59 32 59 C43 59 51 54 51 46 C51 36 39 32 39 26 C39 20 37 14 32 14 Z"
        fill="var(--ill-bamboo)"
      />
      <path d="M32 14 C32 10 33 7 35 4" fill="none" />
      <path d="M34 10 C38 3 45 3 48 6 C44 11 38 12 34 10 Z" fill="var(--ill-leaf)" />
      <path d="M19 45 C19 41 21 38 24 37" fill="none" stroke="var(--ill-white)" />
    </g>,
  ],
  [
    'erdbeere',
    <g key="erdbeere">
      <path
        d="M32 59 C19 51 9 39 11 27 C12 21 20 19 32 21 C44 19 52 21 53 27 C55 39 45 51 32 59 Z"
        fill="var(--ill-tomato)"
      />
      <path
        d="M21 30 H21.1 M31 32 H31.1 M42 30 H42.1 M25 40 H25.1 M37 41 H37.1 M31 49 H31.1"
        fill="none"
        stroke="var(--ill-bg-sun)"
        strokeWidth={3.5}
      />
      <path
        d="M18 23 L22 13 L28 18 L32 8 L36 18 L42 13 L46 23 C37 27 27 27 18 23 Z"
        fill="var(--ill-leaf)"
      />
    </g>,
  ],
  [
    'kirschen',
    <g key="kirschen">
      <path d="M19 37 C21 26 28 15 36 8 M45 39 C43 28 40 17 36 8" fill="none" />
      <path d="M36 8 C42 2 52 4 55 8 C49 13 42 13 36 8 Z" fill="var(--ill-leaf)" />
      <circle cx={19} cy={47} r={11} fill="var(--ill-cherry)" />
      <circle cx={45} cy={49} r={11} fill="var(--ill-cherry)" />
      <path
        d="M13 45 C13 43 14 41 16 40 M39 47 C39 45 40 43 42 42"
        fill="none"
        stroke="var(--ill-white)"
      />
    </g>,
  ],
  [
    'zitrone',
    <g key="zitrone">
      <path
        d="M5 36 C5 32 9 30 11 28 C17 18 43 18 49 28 C51 30 55 32 55 36 C55 40 51 42 49 44 C43 54 17 54 11 44 C9 42 5 40 5 36 Z"
        fill="var(--ill-lemon)"
      />
      <path d="M40 22 C42 13 51 10 58 12 C56 19 48 24 40 22 Z" fill="var(--ill-leaf)" />
      <path d="M17 32 C19 28 23 26 27 25" fill="none" stroke="var(--ill-white)" />
      <path d="M44 42 H44.1 M38 45 H38.1 M46 36 H46.1" fill="none" strokeWidth={2} />
    </g>,
  ],
  // Fahrzeuge
  [
    'auto',
    <g key="auto">
      <path
        d="M5 43 V35 C5 32 7 30 11 30 H17 L23 18 C24 16 26 15 28 15 H42 C44 15 46 16 47 18 L52 30 C56 30 59 32 59 36 V43 C59 45 58 46 56 46 H8 C6 46 5 45 5 43 Z"
        fill="var(--ill-purse)"
      />
      <path d="M26 20 H43 L47 30 H22 Z" fill="var(--ill-glass)" />
      <path d="M34 20 V30 M30 36 H36" fill="none" strokeWidth={2.5} />
      <circle cx={18} cy={46} r={7} fill="var(--ill-dark)" />
      <circle cx={46} cy={46} r={7} fill="var(--ill-dark)" />
      <path d="M53 34 H58" fill="none" stroke="var(--ill-sun)" strokeWidth={4} />
    </g>,
  ],
  [
    'fahrrad',
    <g key="fahrrad">
      <circle cx={14} cy={42} r={11} fill="none" />
      <circle cx={50} cy={42} r={11} fill="none" />
      <path
        d="M14 42 H30 L24 24 Z M30 42 L44 26 H25 M44 26 L50 42 M44 26 L41 16 H48"
        fill="none"
        strokeWidth={6}
      />
      <path
        d="M14 42 H30 L24 24 Z M30 42 L44 26 H25 M44 26 L50 42 M44 26 L41 16 H48"
        fill="none"
        stroke="var(--ill-coral)"
        strokeWidth={2.5}
      />
      <path d="M18 21 H29" fill="none" strokeWidth={5} />
      <circle cx={30} cy={42} r={3} fill="var(--ill-dark)" strokeWidth={2} />
    </g>,
  ],
  [
    'zug',
    <g key="zug">
      <rect x={6} y={26} width={34} height={20} rx={4} fill="var(--ill-tomato)" />
      <path d="M11 26 V14 H21 V26" fill="var(--ill-dark)" />
      <rect x={36} y={12} width={22} height={34} rx={3} fill="var(--ill-purse)" />
      <rect x={41} y={17} width={12} height={10} rx={2} fill="var(--ill-glass)" />
      <path
        d="M10 50 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 Z M24 50 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 Z M42 50 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 Z"
        fill="var(--ill-dark)"
      />
      <path d="M2 58 H62" fill="none" />
    </g>,
  ],
  [
    'flugzeug',
    <g key="flugzeug">
      <g transform="rotate(45 32 32)">
        <path
          d="M32 3 C35 3 36 7 36 12 V25 L59 38 V44 L36 37 V50 L45 56 V61 L32 58 L19 61 V56 L28 50 V37 L5 44 V38 L28 25 V12 C28 7 29 3 32 3 Z"
          fill="var(--ill-white)"
        />
        <path
          d="M30 11 C30 9 31 8 32 8 C33 8 34 9 34 11 Z"
          fill="var(--ill-water)"
          strokeWidth={2}
        />
        <path
          d="M36 30 L52 39 M28 30 L12 39"
          fill="none"
          stroke="var(--ill-coral)"
          strokeWidth={3}
        />
      </g>
    </g>,
  ],
  [
    'rakete',
    <g key="rakete">
      <path d="M26 46 C26 53 29 57 32 62 C35 57 38 53 38 46 Z" fill="var(--ill-sun)" />
      <path
        d="M22 34 L11 48 L13 55 L22 47 Z M42 34 L53 48 L51 55 L42 47 Z"
        fill="var(--ill-coral)"
      />
      <path d="M32 3 C43 11 45 26 42 47 H22 C19 26 21 11 32 3 Z" fill="var(--ill-white)" />
      <path d="M26 11 C29 8 35 8 38 11" fill="none" stroke="var(--ill-coral)" strokeWidth={4} />
      <circle cx={32} cy={25} r={6} fill="var(--ill-water)" />
      <path d="M32 47 V40" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  // Werkzeuge
  [
    'hammer',
    <g key="hammer">
      <g transform="rotate(-30 32 32)">
        <rect x={28} y={22} width={8} height={38} rx={3} fill="var(--ill-wood)" />
        <path
          d="M12 10 H40 C46 10 52 12 56 18 L52 21 C50 19 47 18 44 19 V26 H12 C10 26 9 25 9 23 V13 C9 11 10 10 12 10 Z"
          fill="var(--ill-metal)"
        />
        <path d="M28 46 H36 M28 51 H36" fill="none" strokeWidth={2} />
      </g>
    </g>,
  ],
  [
    'schere',
    <g key="schere">
      <path d="M39 42 L18 5 C22 5 27 9 37 28 L43 38 Z" fill="var(--ill-metal)" />
      <path d="M25 42 L46 5 C42 5 37 9 27 28 L21 38 Z" fill="var(--ill-metal)" />
      <path
        d="M10 49 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 Z M15 49 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 Z"
        fill="var(--ill-coral)"
        fillRule="evenodd"
      />
      <path
        d="M34 49 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 Z M39 49 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 Z"
        fill="var(--ill-coral)"
        fillRule="evenodd"
      />
      <circle cx={32} cy={31} r={2.5} fill="var(--ill-dark)" strokeWidth={2} />
    </g>,
  ],
  [
    'saege',
    <g key="saege">
      <path
        d="M22 18 L60 27 L59 34 L55 37.5 L52 35.7 L49 39.2 L46 37.3 L43 40.9 L40 39 L37 42.5 L34 40.7 L31 44.2 L28 42.3 L25 45.9 L22 44 Z"
        fill="var(--ill-metal)"
      />
      <path
        d="M4 20 C4 16 8 13 12 13 H24 V49 H12 C8 49 4 47 4 43 Z M10 23 H18 V39 H10 Z"
        fill="var(--ill-wood-dark)"
        fillRule="evenodd"
      />
      <path d="M28 24 H28.1 M28 34 H28.1" fill="none" strokeWidth={3.5} />
    </g>,
  ],
  [
    'schraubenzieher',
    <g key="schraubenzieher">
      <g transform="rotate(35 32 32)">
        <rect x={30} y={8} width={4} height={30} fill="var(--ill-metal)" strokeWidth={2.5} />
        <path d="M29 9 L30 3 H34 L35 9 Z" fill="var(--ill-metal)" strokeWidth={2.5} />
        <rect x={23} y={34} width={18} height={27} rx={7} fill="var(--ill-sun)" />
        <path d="M28 40 V55 M32 40 V55 M36 40 V55" fill="none" strokeWidth={2} />
      </g>
    </g>,
  ],
  [
    'pinsel',
    <g key="pinsel">
      <g transform="rotate(30 32 32)">
        <path d="M29 33 H35 L34 59 C34 61 30 61 30 59 Z" fill="var(--ill-trunk)" />
        <rect x={24} y={22} width={16} height={11} rx={2} fill="var(--ill-metal)" />
        <path d="M24 22 V11 C24 7 28 4 32 4 C36 4 40 7 40 11 V22 Z" fill="var(--ill-dark)" />
        <path
          d="M24 14 V11 C24 7 28 4 32 4 C36 4 40 7 40 11 V14 C36 12 28 12 24 14 Z"
          fill="var(--ill-purse)"
        />
      </g>
    </g>,
  ],
  // Kleidung
  [
    'pullover',
    <g key="pullover">
      <path
        d="M22 8 L12 11 C7 13 5 17 5 23 L4 54 H14 L16 30 H18 V58 H46 V30 H48 L50 54 H60 L59 23 C59 17 57 13 52 11 L42 8 C40 13 36 15 32 15 C28 15 24 13 22 8 Z"
        fill="var(--ill-purse)"
      />
      <path d="M18 30 H46 V37 H18 Z" fill="var(--ill-sun)" strokeWidth={2.5} />
      <path d="M18 52 H46 M4.2 49 H14.3 M49.7 49 H59.8" fill="none" strokeWidth={2} />
      <path d="M22 8 C24 12 28 15 32 15 C36 15 40 12 42 8" fill="none" />
    </g>,
  ],
  [
    'socke',
    <g key="socke">
      <path
        d="M20 6 H38 V33 C38 36 39 38 42 39.5 L50 44 C58 48 56 60 46 58 L24 51 C18 49 16 45 17 40 L20 32 Z"
        fill="var(--ill-white)"
      />
      <path d="M20 6 H38 V16 H20 Z" fill="var(--ill-coral)" />
      <path d="M20 22 H38 M20 27 H38" fill="none" stroke="var(--ill-coral)" strokeWidth={3} />
      <path
        d="M46 41.5 L50 44 C58 48 56 60 46 58 L44 57.4 C49 53 50 47 46 41.5 Z"
        fill="var(--ill-coral)"
      />
      <path d="M17.4 39 C22 40 25 44 24 51 C18 49 16 45 17.4 39 Z" fill="var(--ill-coral)" />
    </g>,
  ],
  [
    'hose',
    <g key="hose">
      <path d="M15 6 H49 L53 58 H36 L32 25 L28 58 H11 Z" fill="var(--ill-jeans)" />
      <path d="M15 6 H49 V13 H15 Z" fill="var(--ill-jeans)" />
      <path
        d="M32 13 V25 M19 13 C19 18 22 20 26 20 M45 13 C45 18 42 20 38 20"
        fill="none"
        strokeWidth={2}
      />
      <path d="M13 52 H28 M36 52 H52" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'muetze',
    <g key="muetze">
      <path d="M10 46 C10 27 20 17 32 17 C44 17 54 27 54 46 Z" fill="var(--ill-coral)" />
      <rect x={7} y={42} width={50} height={14} rx={5} fill="var(--ill-sun)" />
      <path
        d="M15 45 V53 M23 45 V53 M32 45 V53 M41 45 V53 M49 45 V53"
        fill="none"
        strokeWidth={2}
      />
      <circle cx={32} cy={12} r={8} fill="var(--ill-white)" />
      <path d="M20 34 C24 32 28 32 32 34 C36 32 40 32 44 34" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'schuh',
    <g key="schuh">
      <rect x={3} y={42} width={58} height={11} rx={5} fill="var(--ill-white)" />
      <path
        d="M5 44 V27 C5 21 10 19 15 21 L22 25 C26 27 30 25 32 21 C40 29 52 33 57 37 C60 39 61 42 60 44 Z"
        fill="var(--ill-coral)"
      />
      <path d="M30 29 L36 25 M34 33 L40 29 M39 36 L45 32" fill="none" strokeWidth={2.5} />
      <path d="M5 34 C10 36 16 36 20 33" fill="none" strokeWidth={2} />
    </g>,
  ],
  // Tiere
  [
    'eule',
    <g key="eule">
      <path d="M28 54 L32 62 L36 54 Z" fill="var(--ill-coconut)" strokeWidth={2.5} />
      <path d="M4 58 H60 M26 53 V57 M38 53 V57" fill="none" strokeWidth={4} />
      <path
        d="M19 12 L24 18 C29 16 35 16 40 18 L45 12 C48 16 49 21 47 25 C57 34 55 55 32 55 C9 55 7 34 17 25 C15 21 16 16 19 12 Z"
        fill="var(--ill-trunk)"
      />
      <path d="M14 36 C14 44 18 50 24 52 M50 36 C50 44 46 50 40 52" fill="none" strokeWidth={2} />
      <path
        d="M16 30 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z M32 30 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z"
        fill="var(--ill-white)"
      />
      <path d="M24 30 H24.1 M40 30 H40.1" fill="none" strokeWidth={7} />
      <path d="M29 37 H35 L32 43 Z" fill="var(--ill-seahorse)" strokeWidth={2.5} />
    </g>,
  ],
  [
    'ente',
    <g key="ente">
      <path
        d="M7 41 C7 33 15 31 23 33 H39 C45 33 50 29 57 23 C59 34 55 51 37 53 H21 C11 53 7 47 7 41 Z"
        fill="var(--ill-sun)"
      />
      <circle cx={22} cy={22} r={11} fill="var(--ill-sun)" />
      <path d="M12 20 C7 20 3 22 3 25 C5 28 9 28 13 27 Z" fill="var(--ill-carrot)" />
      <circle cx={20} cy={19} r={2} fill="var(--stroke)" />
      <path d="M26 40 C30 47 41 47 46 39" fill="none" />
    </g>,
  ],
  [
    'huhn',
    <g key="huhn">
      <path d="M28 51 V59 M38 51 V59 M24 59 H31 M35 59 H42" fill="none" strokeWidth={2.5} />
      <path
        d="M9 27 C9 20 14 15 20 15 C26 15 29 20 29 26 C29 30 34 32 42 28 L45 11 L50 20 L56 11 C60 28 57 52 34 52 C20 52 9 43 9 27 Z"
        fill="var(--ill-white)"
      />
      <path
        d="M14 16 C13 10 17 8 19 12 C20 7 26 7 25 12 C28 11 30 15 27 17 C23 15 18 15 14 16 Z"
        fill="var(--ill-tomato)"
      />
      <path d="M10 22 L3 26 L10 29 Z" fill="var(--ill-carrot)" strokeWidth={2.5} />
      <circle cx={18} cy={22} r={2} fill="var(--stroke)" />
      <path d="M24 38 C28 45 40 45 45 36" fill="none" />
    </g>,
  ],
  [
    'hund',
    <g key="hund">
      <path d="M50 36 C56 32 59 26 57 19" fill="none" strokeWidth={5} />
      <path d="M20 31 H45 C50 31 52 34 52 38 V57 H45 V46 H27 V57 H20 Z" fill="var(--ill-wood)" />
      <path
        d="M5 21 C5 14 12 9 20 9 C27 9 32 14 32 21 C32 28 28 33 20 33 H11 C7 33 5 31 5 28 Z"
        fill="var(--ill-wood)"
      />
      <path d="M22 11 C29 9 33 14 31 27 C26 27 21 21 22 11 Z" fill="var(--ill-coconut)" />
      <circle cx={6} cy={21} r={3} fill="var(--stroke)" strokeWidth={1.5} />
      <circle cx={16} cy={18} r={2} fill="var(--stroke)" />
    </g>,
  ],
  [
    'katze',
    <g key="katze">
      <path d="M45 55 C56 55 60 44 56 35" fill="none" strokeWidth={5} />
      <path d="M18 59 C13 50 15 38 22 33 H42 C49 38 51 50 46 59 Z" fill="var(--ill-seal)" />
      <path
        d="M15 23 L13 5 L26 14 C30 13 34 13 38 14 L51 5 L49 23 C49 33 42 37 32 37 C22 37 15 33 15 23 Z"
        fill="var(--ill-seal)"
      />
      <path d="M26 21 V25 M38 21 V25" fill="none" strokeWidth={3.5} />
      <path d="M30 28 H34 L32 31 Z" fill="var(--ill-flamingo)" strokeWidth={2} />
      <path
        d="M8 27 L22 29 M8 33 L22 31 M56 27 L42 29 M56 33 L42 31"
        fill="none"
        strokeWidth={1.5}
      />
    </g>,
  ],
  [
    'schnecke',
    <g key="schnecke">
      <path d="M13 28 L9 14 M18 28 L21 14" fill="none" strokeWidth={2.5} />
      <path d="M9 14 H9.1 M21 14 H21.1" fill="none" strokeWidth={6} />
      <path
        d="M5 53 C5 41 9 30 15 28 C20 27 22 32 22 38 V45 H54 C59 45 61 51 58 55 H7 C6 55 5 54 5 53 Z"
        fill="var(--ill-shell)"
      />
      <circle cx={39} cy={31} r={16} fill="var(--ill-honey)" />
      <path
        d="M39 31 C42 31 43 34 41 36 C38 39 32 37 32 32 C32 26 40 23 45 27 C50 31 49 40 42 43"
        fill="none"
        strokeWidth={2.5}
      />
      <circle cx={14} cy={35} r={1.8} fill="var(--stroke)" />
    </g>,
  ],
  [
    'schmetterling',
    <g key="schmetterling">
      <path
        d="M30 30 C22 10 5 6 5 19 C5 29 16 33 30 32 Z M34 30 C42 10 59 6 59 19 C59 29 48 33 34 32 Z"
        fill="var(--ill-flamingo)"
      />
      <path
        d="M30 33 C18 33 10 40 13 49 C16 56 26 52 30 40 Z M34 33 C46 33 54 40 51 49 C48 56 38 52 34 40 Z"
        fill="var(--ill-octopus)"
      />
      <path d="M16 20 H16.1 M48 20 H48.1 M20 45 H20.1 M44 45 H44.1" fill="none" strokeWidth={5} />
      <rect x={29} y={17} width={6} height={34} rx={3} fill="var(--ill-dark)" />
      <path d="M31 17 C29 11 26 8 22 7 M33 17 C35 11 38 8 42 7" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  // Himmel und Natur
  [
    'regenschirm',
    <g key="regenschirm">
      <path d="M32 31 V52 C32 59 23 59 23 52" fill="none" strokeWidth={4} />
      <path
        d="M4 32 C4 16 18 6 32 6 C46 6 60 16 60 32 C56 28 50 28 46 32 C42 28 36 28 32 32 C28 28 22 28 18 32 C14 28 8 28 4 32 Z"
        fill="var(--ill-coral)"
      />
      <path
        d="M32 6 C26 14 22 22 18 32 C22 28 28 28 32 32 C36 28 42 28 46 32 C42 22 38 14 32 6 Z"
        fill="var(--ill-sun)"
      />
      <path d="M32 6 V2" fill="none" />
    </g>,
  ],
  [
    'sonne',
    <g key="sonne">
      <path
        d="M32 4 V13 M32 51 V60 M4 32 H13 M51 32 H60 M12.2 12.2 L18.6 18.6 M45.4 45.4 L51.8 51.8 M51.8 12.2 L45.4 18.6 M12.2 51.8 L18.6 45.4"
        fill="none"
        strokeWidth={4}
      />
      <circle cx={32} cy={32} r={14} fill="var(--ill-sun)" />
      <path d="M27 29 H27.1 M37 29 H37.1" fill="none" strokeWidth={3.5} />
      <path d="M26 35 C29 39 35 39 38 35" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  [
    'wolke',
    <g key="wolke">
      <path
        d="M14 48 C5 48 3 37 10 33 C8 24 18 18 25 22 C27 11 43 9 47 20 C55 18 61 27 56 34 C62 38 59 48 52 48 Z"
        fill="var(--ill-white)"
      />
      <path d="M12 41 C16 43 20 43 23 41" fill="none" strokeWidth={2} />
      <path d="M33 21 C36 18 40 18 42 21" fill="none" stroke="var(--ill-glass)" strokeWidth={3} />
    </g>,
  ],
  [
    'mond',
    <g key="mond">
      <path
        d="M40 5 C25 8 15 20 15 34 C15 48 27 59 42 59 C48 59 52 57 57 52 C38 55 25 42 27 26 C28 16 33 10 40 5 Z"
        fill="var(--ill-lemon)"
      />
      <path d="M18 31 C20 33 22 33 24 31" fill="none" strokeWidth={2.5} />
      <path d="M20 41 C22 43 25 43 27 41" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'baum',
    <g key="baum">
      <path d="M12 60 H52" fill="none" />
      <path d="M27 60 L28 38 H36 L37 60 Z" fill="var(--ill-trunk)" />
      <path
        d="M32 3 C42 3 48 10 46 16 C54 18 57 30 51 35 C53 43 43 48 37 44 C33 48 25 48 23 44 C15 46 8 38 12 32 C6 27 10 17 18 17 C16 9 24 3 32 3 Z"
        fill="var(--ill-leaf)"
      />
      <path d="M22 26 C24 30 28 32 32 31 M38 22 C40 25 42 26 45 26" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'blume',
    <g key="blume">
      <path d="M32 32 V61" fill="none" />
      <path d="M32 52 C37 44 45 43 50 45 C46 53 38 55 32 52 Z" fill="var(--ill-leaf)" />
      <path
        d="M25 11 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M34 16 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M34 27 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M25 32 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M16 27 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M16 16 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z"
        fill="var(--ill-flamingo)"
      />
      <circle cx={32} cy={21.5} r={6.5} fill="var(--ill-sun)" />
    </g>,
  ],
]);
