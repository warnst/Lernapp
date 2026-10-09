import type { ReactNode } from 'react';

// Sachen-Icons, Teil A: Essen und Trinken (docs/02, 6.3). viewBox 0 0 64 64, höchstens 6 Formen.

const APPLE_SMALL =
  'M0 -11 C-5 -15 -15 -13 -15 -2 C-15 9 -8 15 0 14 C8 15 15 9 15 -2 C15 -13 5 -15 0 -11 Z';

export const ITEM_DRAWINGS_A = new Map<string, ReactNode>([
  [
    'kokosnuss',
    <g key="kokosnuss">
      <circle cx={32} cy={35} r={21} fill="var(--ill-coconut)" />
      <path d="M16 42 L21 40 M42 48 L47 45 M44 26 L49 28" fill="none" strokeWidth={2} />
      <circle cx={26} cy={25} r={3} fill="var(--ill-cave)" strokeWidth={1.5} />
      <circle cx={36} cy={24} r={3} fill="var(--ill-cave)" strokeWidth={1.5} />
      <circle cx={31} cy={33} r={3} fill="var(--ill-cave)" strokeWidth={1.5} />
    </g>,
  ],
  [
    'eis',
    <g key="eis">
      <path d="M20 30 L32 59 L44 30 Z" fill="var(--ill-wood)" />
      <path d="M25 36 L36 47 M33 34 L40 41 M39 36 L28 47" fill="none" strokeWidth={2} />
      <path
        d="M19 27 C17 18 24 11 32 11 C40 11 47 18 45 27 C43 31 40 28 38 31 C35 34 30 30 27 32 C24 33 20 31 19 27 Z"
        fill="var(--ill-flamingo)"
      />
      <circle cx={33} cy={8} r={4} fill="var(--ill-coral)" />
    </g>,
  ],
  [
    'saft',
    <g key="saft">
      <path d="M38 30 L44 6 H51" fill="none" />
      <path d="M17 16 L21 57 H43 L47 16 Z" fill="var(--ill-glass)" />
      <path d="M18.3 28 L21 55 H43 L45.7 28 Z" fill="var(--ill-seahorse)" />
      <circle cx={19} cy={16} r={8} fill="var(--ill-sun)" />
      <path d="M19 10 V22 M13 16 H25" fill="none" strokeWidth={1.5} />
    </g>,
  ],
  [
    'keks',
    <g key="keks">
      <circle cx={32} cy={32} r={22} fill="var(--ill-wood)" />
      <circle cx={24} cy={25} r={3.5} fill="var(--ill-coconut)" strokeWidth={1.5} />
      <circle cx={39} cy={23} r={3.5} fill="var(--ill-coconut)" strokeWidth={1.5} />
      <circle cx={41} cy={39} r={3.5} fill="var(--ill-coconut)" strokeWidth={1.5} />
      <circle cx={25} cy={41} r={3.5} fill="var(--ill-coconut)" strokeWidth={1.5} />
      <circle cx={32} cy={32} r={2.5} fill="var(--ill-coconut)" strokeWidth={1.5} />
    </g>,
  ],
  [
    'kekse',
    <g key="kekse">
      <path d="M13 20 H51 L47 58 H17 Z" fill="var(--ill-purse)" />
      <path
        d="M13 20 L15 8 L19 11 L23 8 L27 11 L32 8 L37 11 L41 8 L45 11 L49 8 L51 20 Z"
        fill="var(--ill-white)"
      />
      <circle cx={32} cy={39} r={12} fill="var(--ill-wood)" />
      <circle cx={28} cy={35} r={2.5} fill="var(--ill-coconut)" strokeWidth={1.5} />
      <circle cx={36} cy={42} r={2.5} fill="var(--ill-coconut)" strokeWidth={1.5} />
      <circle cx={28} cy={44} r={2.5} fill="var(--ill-coconut)" strokeWidth={1.5} />
    </g>,
  ],
  [
    'kokoskeks',
    <g key="kokoskeks">
      <rect x={8} y={42} width={48} height={12} rx={6} fill="var(--ill-wood)" />
      <path
        d="M12 46 C10 28 20 14 32 14 C44 14 54 28 52 46 C46 49 18 49 12 46 Z"
        fill="var(--ill-white)"
      />
      <path
        d="M22 28 L25 26 M33 22 L36 24 M41 32 L44 30 M26 38 L29 36 M37 40 L40 41"
        fill="none"
        strokeWidth={2.5}
      />
      <path
        d="M27 17 C30 15 34 15 37 17 C35 19 29 19 27 17 Z"
        fill="var(--ill-trunk)"
        strokeWidth={2}
      />
    </g>,
  ],
  [
    'bananenbrot',
    <g key="bananenbrot">
      <path
        d="M8 30 C8 24 12 22 20 22 H44 C52 22 56 24 56 30 V50 C56 53 54 55 51 55 H13 C10 55 8 53 8 50 Z"
        fill="var(--ill-trunk)"
      />
      <path d="M14 30 C22 34 42 34 50 30" fill="none" strokeWidth={2} />
      <circle cx={21} cy={20} r={6} fill="var(--ill-bg-sun)" />
      <circle cx={32} cy={18} r={6} fill="var(--ill-bg-sun)" />
      <circle cx={43} cy={20} r={6} fill="var(--ill-bg-sun)" />
      <path d="M21 20 H21.1 M32 18 H32.1 M43 20 H43.1" fill="none" strokeWidth={2.5} />
    </g>,
  ],
  [
    'brot',
    <g key="brot">
      <path
        d="M6 40 C6 24 20 16 32 16 C44 16 58 24 58 40 C58 49 50 53 32 53 C14 53 6 49 6 40 Z"
        fill="var(--ill-trunk)"
      />
      <path d="M17 26 L23 38 M29 22 L35 36 M41 24 L47 37" fill="none" />
      <path d="M12 44 C20 48 44 48 52 44" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'banane',
    <g key="banane">
      <path
        d="M14 18 C14 42 34 56 54 46 C57 44 56 40 53 40 C38 45 23 36 22 18 Z"
        fill="var(--ill-sun)"
      />
      <path d="M18 22 C20 38 32 46 47 44" fill="none" strokeWidth={2} />
      <path d="M14 18 L13 10 L21 9 L22 18 Z" fill="var(--ill-trunk)" />
    </g>,
  ],
  [
    'apfel',
    <g key="apfel">
      <path
        d="M32 20 C24 14 10 16 10 32 C10 46 20 56 32 54 C44 56 54 46 54 32 C54 16 40 14 32 20 Z"
        fill="var(--ill-coral)"
      />
      <path d="M32 20 C32 14 33 10 35 7" fill="none" />
      <path d="M35 13 C40 6 48 7 51 10 C46 16 40 16 35 13 Z" fill="var(--ill-leaf)" />
      <path d="M18 30 C18 26 20 24 23 23" fill="none" stroke="var(--ill-white)" />
    </g>,
  ],
  [
    'aepfel',
    <g key="aepfel">
      <g transform="translate(42 27)">
        <path d={APPLE_SMALL} fill="var(--ill-coral)" />
        <path
          d="M0 -11 C0 -16 2 -19 4 -21 M3 -17 C8 -23 14 -21 15 -19 C11 -14 7 -14 3 -17 Z"
          fill="var(--ill-leaf)"
        />
      </g>
      <g transform="translate(22 40)">
        <path d={APPLE_SMALL} fill="var(--ill-coral)" />
        <path d="M0 -11 C0 -16 2 -19 4 -21" fill="none" />
        <path d="M-8 -3 C-8 -6 -6 -8 -4 -8" fill="none" stroke="var(--ill-white)" />
      </g>
    </g>,
  ],
  [
    'melone',
    <g key="melone">
      <path d="M6 20 A26 26 0 0 0 58 20 Z" fill="var(--ill-leaf)" />
      <path d="M11 20 A21 21 0 0 0 53 20 Z" fill="var(--ill-coral)" />
      <path d="M22 27 L23 30 M32 31 V34 M42 27 L41 30 M27 37 L28 39 M37 37 L36 39" fill="none" />
    </g>,
  ],
  [
    'mango',
    <g key="mango">
      <path
        d="M20 14 C38 6 56 22 52 40 C48 54 30 58 20 50 C8 40 6 20 20 14 Z"
        fill="var(--ill-seahorse)"
      />
      <path d="M45 24 C52 32 50 46 40 52 C46 44 48 34 45 24 Z" fill="var(--ill-coral)" />
      <path d="M22 14 L20 8" fill="none" />
      <path d="M21 10 C26 2 36 3 39 6 C33 12 26 12 21 10 Z" fill="var(--ill-leaf)" />
    </g>,
  ],
  [
    'muffin',
    <g key="muffin">
      <path d="M14 34 L19 57 H45 L50 34 Z" fill="var(--ill-purse)" />
      <path d="M24 34 L26 57 M32 34 V57 M40 34 L38 57" fill="none" strokeWidth={2} />
      <path
        d="M10 36 C6 28 13 19 21 19 C23 11 41 11 43 19 C51 19 58 28 54 36 Z"
        fill="var(--ill-trunk)"
      />
      <circle cx={32} cy={10} r={5} fill="var(--ill-coral)" />
    </g>,
  ],
  [
    'fisch',
    <g key="fisch">
      <path d="M45 32 L58 21 L58 43 Z" fill="var(--ill-water)" />
      <path d="M6 32 C14 17 38 15 48 32 C38 49 14 47 6 32 Z" fill="var(--ill-dolphin)" />
      <circle cx={16} cy={29} r={2.5} fill="var(--stroke)" />
      <path d="M26 23 C30 28 30 36 26 41" fill="none" strokeWidth={2} />
      <path d="M8 36 Q11 38 13 36" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'fischbroetchen',
    <g key="fischbroetchen">
      <path d="M6 38 C6 48 14 54 32 54 C50 54 58 48 58 38 Z" fill="var(--ill-wood)" />
      <path
        d="M5 34 Q10 30 15 34 Q20 30 25 34 Q30 30 35 34 Q40 30 45 34 Q50 30 55 34 Q58 32 60 34 L58 39 H6 Z"
        fill="var(--ill-leaf)"
      />
      <rect x={4} y={25} width={56} height={9} rx={4} fill="var(--ill-shell)" />
      <path d="M6 26 C6 13 18 9 32 9 C46 9 58 13 58 26 Z" fill="var(--ill-trunk)" />
      <path d="M20 17 L22 16 M31 14 H33 M42 16 L44 17" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'bonbon',
    <g key="bonbon">
      <path d="M21 32 L6 21 L10 32 L6 43 Z" fill="var(--ill-sun)" />
      <path d="M43 32 L58 21 L54 32 L58 43 Z" fill="var(--ill-sun)" />
      <circle cx={32} cy={32} r={13} fill="var(--ill-coral)" />
      <path d="M27 21 C31 28 31 36 27 43 M37 21 C33 28 33 36 37 43" fill="none" strokeWidth={2} />
    </g>,
  ],
  [
    'lolli',
    <g key="lolli">
      <rect x={30} y={36} width={5} height={24} rx={2} fill="var(--ill-white)" />
      <circle cx={32} cy={24} r={18} fill="var(--ill-sun)" />
      <path
        d="M32 24 C35 24 36 28 32 29 C27 30 25 23 30 20 C36 17 42 24 39 30 C36 36 25 36 21 29"
        fill="none"
        stroke="var(--ill-coral)"
        strokeWidth={4}
      />
    </g>,
  ],
  [
    'kaugummi',
    <g key="kaugummi">
      <rect x={20} y={8} width={14} height={22} rx={2} fill="var(--ill-white)" />
      <rect x={8} y={24} width={48} height={26} rx={4} fill="var(--ill-flamingo)" />
      <rect x={8} y={32} width={48} height={10} fill="var(--ill-white)" />
      <circle cx={45} cy={37} r={2.5} fill="var(--ill-flamingo)" strokeWidth={1.5} />
    </g>,
  ],
  [
    'marmelade',
    <g key="marmelade">
      <rect x={14} y={21} width={36} height={36} rx={7} fill="var(--ill-jam)" />
      <rect x={12} y={11} width={40} height={11} rx={3} fill="var(--ill-white)" />
      <path d="M21 11 V22 M29 11 V22 M37 11 V22 M45 11 V22" fill="none" strokeWidth={2} />
      <rect x={20} y={31} width={24} height={16} rx={3} fill="var(--ill-white)" />
      <path
        d="M32 36 C29 33 25 37 32 43 C39 37 35 33 32 36 Z"
        fill="var(--ill-jam)"
        strokeWidth={1.5}
      />
    </g>,
  ],
  [
    'honig',
    <g key="honig">
      <rect x={14} y={21} width={36} height={36} rx={9} fill="var(--ill-honey)" />
      <rect x={12} y={12} width={40} height={10} rx={3} fill="var(--ill-wood-dark)" />
      <path d="M32 29 L39 33 V42 L32 46 L25 42 V33 Z" fill="var(--ill-sun)" />
      <path d="M20 22 V28 C20 31 24 31 24 28 V22" fill="var(--ill-honey)" />
    </g>,
  ],
  [
    'kaese',
    <g key="kaese">
      <path d="M8 38 L46 16 L56 38 Z" fill="var(--ill-sun)" />
      <path d="M8 38 H56 V52 H8 Z" fill="var(--ill-honey)" />
      <circle cx={19} cy={45} r={3} fill="var(--ill-wood)" strokeWidth={2} />
      <circle cx={40} cy={46} r={3.5} fill="var(--ill-wood)" strokeWidth={2} />
      <circle cx={42} cy={30} r={3} fill="var(--ill-wood)" strokeWidth={2} />
    </g>,
  ],
  [
    'tee',
    <g key="tee">
      <path d="M6 54 H52 C50 58 46 60 40 60 H18 C12 60 8 58 6 54 Z" fill="var(--ill-water)" />
      <path d="M45 30 C56 30 56 43 44 43" fill="none" />
      <path d="M11 25 H47 V38 C47 48 39 54 29 54 C19 54 11 48 11 38 Z" fill="var(--ill-white)" />
      <path d="M22 18 C18 14 26 12 22 6 M35 18 C31 14 39 12 35 6" fill="none" strokeWidth={2.5} />
      <path d="M17 34 H41" fill="none" stroke="var(--ill-coral)" strokeWidth={4} />
    </g>,
  ],
  [
    'wasser',
    <g key="wasser">
      <rect x={24} y={4} width={16} height={9} rx={2} fill="var(--ill-water)" />
      <path
        d="M24 13 H40 L41 19 C46 21 47 25 47 30 V55 C47 58 45 60 41 60 H23 C19 60 17 58 17 55 V30 C17 25 18 21 23 19 Z"
        fill="var(--ill-glass)"
      />
      <rect x={17} y={33} width={30} height={14} fill="var(--ill-water)" />
      <path
        d="M32 35 C29 39 28 43 32 44 C36 43 35 39 32 35 Z"
        fill="var(--ill-white)"
        strokeWidth={1.5}
      />
    </g>,
  ],
]);
