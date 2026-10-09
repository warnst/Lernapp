import type { ReactNode } from 'react';
import { starPath } from './star-path';

// Fundstücke (docs/02, 6.3 und 6.4). viewBox 0 0 96 96.
// `body` ist die Außenform: farbig im gefundenen Zustand, grau als Silhouette.
// `details` erscheinen nur, wenn das Fundstück gefunden ist.

export interface FindlingShape {
  d: string;
  fill: string;
  evenOdd?: boolean;
}

export interface FindlingDrawing {
  body: FindlingShape[];
  details: ReactNode;
  transform?: string;
}

/** Kreis als Pfad, damit Silhouette und Zeichnung dieselbe Form nutzen. */
function circle(cx: number, cy: number, r: number): string {
  const c = (n: number) => String(n);
  return `M${c(cx - r)} ${c(cy)} A${c(r)} ${c(r)} 0 1 0 ${c(cx + r)} ${c(cy)} A${c(r)} ${c(r)} 0 1 0 ${c(cx - r)} ${c(cy)} Z`;
}

const SHELL = 'M48 76 L17 46 C14 26 30 13 48 13 C66 13 82 26 79 46 Z';
const SHELL_FOOT = 'M40 72 L35 84 H61 L56 72 Z';
const SHELL_RIBS = 'M48 74 L33 19 M48 74 V14 M48 74 L63 19 M48 74 L22 33 M48 74 L74 33';

export const FINDLING_DRAWINGS: ReadonlyMap<string, FindlingDrawing> = new Map([
  // Schatzinsel
  [
    'glitzermuschel',
    {
      body: [
        { d: SHELL_FOOT, fill: 'var(--ill-shell)' },
        { d: SHELL, fill: 'var(--ill-shell)' },
      ],
      details: (
        <>
          <path d={SHELL_RIBS} fill="none" strokeWidth={2.5} />
          <path d={starPath(80, 14, 10, 3.5, 4)} fill="var(--ill-sun)" strokeWidth={2} />
          <path d={starPath(15, 18, 7, 2.5, 4)} fill="var(--ill-sun)" strokeWidth={2} />
          <path d={starPath(84, 66, 6, 2.2, 4)} fill="var(--ill-sun)" strokeWidth={2} />
        </>
      ),
    },
  ],
  [
    'strohhut',
    {
      body: [
        {
          d: 'M6 62 C6 52 26 46 48 46 C70 46 90 52 90 62 C90 72 70 78 48 78 C26 78 6 72 6 62 Z',
          fill: 'var(--ill-straw)',
        },
        {
          d: 'M26 62 C26 36 34 24 48 24 C62 24 70 36 70 62 C60 66 36 66 26 62 Z',
          fill: 'var(--ill-straw)',
        },
      ],
      details: (
        <>
          <path d="M27 50 C38 55 58 55 69 50 L70 60 C58 65 38 65 26 60 Z" fill="var(--ill-coral)" />
          <path
            d="M40 30 C38 36 37 42 37 48 M56 30 C58 36 59 42 59 48"
            fill="none"
            strokeWidth={2}
          />
          <path
            d="M14 66 C20 70 30 72 38 73 M58 73 C66 72 76 70 82 66"
            fill="none"
            strokeWidth={2}
          />
        </>
      ),
    },
  ],
  [
    'bambusfloete',
    {
      transform: 'rotate(-30 48 48)',
      body: [
        {
          d: 'M14 39 H82 C87 39 90 43 90 48 C90 53 87 57 82 57 H14 C9 57 6 53 6 48 C6 43 9 39 14 39 Z',
          fill: 'var(--ill-bamboo)',
        },
      ],
      details: (
        <>
          <path d="M30 39 V57 M68 39 V57" fill="none" strokeWidth={2.5} />
          <circle cx={18} cy={48} r={3.5} fill="var(--ill-cave)" strokeWidth={2} />
          <circle cx={42} cy={48} r={3} fill="var(--ill-cave)" strokeWidth={2} />
          <circle cx={51} cy={48} r={3} fill="var(--ill-cave)" strokeWidth={2} />
          <circle cx={60} cy={48} r={3} fill="var(--ill-cave)" strokeWidth={2} />
          <path d="M76 44 H84" fill="none" stroke="var(--ill-white)" strokeWidth={2.5} />
        </>
      ),
    },
  ],
  [
    'goldener-schluessel',
    {
      transform: 'rotate(-20 48 48)',
      body: [
        { d: `${circle(24, 48, 17)} ${circle(24, 48, 7)}`, fill: 'var(--ill-gold)', evenOdd: true },
        { d: 'M41 43 H88 V60 H81 V53 H76 V65 H68 V53 H41 Z', fill: 'var(--ill-gold)' },
      ],
      details: (
        <path d="M13 40 C15 36 19 34 23 33" fill="none" stroke="var(--ill-white)" strokeWidth={3} />
      ),
    },
  ],
  [
    'bunte-feder',
    {
      body: [{ d: 'M22 80 C18 46 44 14 84 10 C84 46 60 72 26 78 Z', fill: 'var(--ill-coral)' }],
      details: (
        <>
          <path d="M32 70 C30 48 48 26 74 21 C73 46 56 64 34 68 Z" fill="var(--ill-sun)" />
          <path d="M42 60 C42 46 52 34 64 31 C63 46 54 55 44 58 Z" fill="var(--ill-gem)" />
          <path d="M8 90 L70 28" fill="none" />
        </>
      ),
    },
  ],
  [
    'kompass',
    {
      body: [
        { d: circle(48, 12, 7), fill: 'var(--ill-gold)' },
        { d: circle(48, 54, 35), fill: 'var(--ill-wood)' },
      ],
      details: (
        <>
          <circle cx={48} cy={54} r={26} fill="var(--ill-white)" />
          <path d="M48 31 L55 54 H41 Z" fill="var(--ill-coral)" />
          <path d="M48 77 L55 54 H41 Z" fill="var(--ill-rock)" />
          <path d="M26 54 H30 M66 54 H70" fill="none" strokeWidth={2.5} />
          <circle cx={48} cy={54} r={3} fill="var(--stroke)" />
        </>
      ),
    },
  ],
  [
    'fernrohr',
    {
      transform: 'rotate(-25 48 48)',
      body: [
        { d: 'M4 42 H24 V54 H4 Z', fill: 'var(--ill-wood-dark)' },
        { d: 'M24 38 H50 V58 H24 Z', fill: 'var(--ill-wood-dark)' },
        { d: 'M50 33 H90 V63 H50 Z', fill: 'var(--ill-wood-dark)' },
      ],
      details: (
        <>
          <path d="M44 38 H50 V58 H44 Z M80 33 H90 V63 H80 Z" fill="var(--ill-gold)" />
          <path d="M90 37 V59" fill="none" stroke="var(--ill-glass)" strokeWidth={4} />
          <path d="M56 39 H74" fill="none" stroke="var(--ill-white)" strokeWidth={3} />
        </>
      ),
    },
  ],
  [
    'schatzkarte',
    {
      body: [
        { d: 'M18 18 H78 V80 H18 Z', fill: 'var(--ill-sand)' },
        {
          d: 'M18 10 H78 C82 10 85 13 85 17 C85 21 82 24 78 24 H18 C14 24 11 21 11 17 C11 13 14 10 18 10 Z',
          fill: 'var(--ill-wood)',
        },
        {
          d: 'M18 74 H78 C82 74 85 77 85 81 C85 85 82 88 78 88 H18 C14 88 11 85 11 81 C11 77 14 74 18 74 Z',
          fill: 'var(--ill-wood)',
        },
      ],
      details: (
        <>
          <path
            d="M26 44 C26 34 38 30 46 34 C54 30 66 36 62 46 C66 56 50 64 40 60 C28 62 22 52 26 44 Z"
            fill="var(--ill-grass)"
            strokeWidth={2.5}
          />
          <path d="M30 66 C36 58 40 54 46 50" fill="none" strokeWidth={2.5} strokeDasharray="1 5" />
          <path
            d="M44 40 L56 52 M56 40 L44 52"
            fill="none"
            stroke="var(--ink-900)"
            strokeWidth={5}
          />
        </>
      ),
    },
  ],
  [
    'goldene-krone',
    {
      body: [
        { d: 'M14 70 L10 30 L31 47 L48 22 L65 47 L86 30 L82 70 Z', fill: 'var(--ill-gold)' },
        { d: 'M12 66 H84 V82 H12 Z', fill: 'var(--ill-gold-dark)' },
        { d: circle(10, 26, 5), fill: 'var(--ill-gold)' },
        { d: circle(48, 17, 6), fill: 'var(--ill-gold)' },
        { d: circle(86, 26, 5), fill: 'var(--ill-gold)' },
      ],
      details: (
        <>
          <circle cx={30} cy={74} r={4.5} fill="var(--ill-gem)" strokeWidth={2} />
          <circle cx={48} cy={74} r={5.5} fill="var(--ill-coral)" strokeWidth={2} />
          <circle cx={66} cy={74} r={4.5} fill="var(--ill-gem)" strokeWidth={2} />
          <path
            d="M44 50 C44 44 46 40 48 37"
            fill="none"
            stroke="var(--ill-white)"
            strokeWidth={3}
          />
        </>
      ),
    },
  ],
  // Kleine Bucht
  [
    'perlmuttmuschel',
    {
      body: [
        { d: SHELL_FOOT, fill: 'var(--ill-pearl)' },
        { d: SHELL, fill: 'var(--ill-pearl)' },
      ],
      details: (
        <>
          <path
            d="M22 50 A26 26 0 0 1 74 50"
            fill="none"
            stroke="var(--ill-flamingo)"
            strokeWidth={5}
          />
          <path d="M28 50 A20 20 0 0 1 68 50" fill="none" stroke="var(--ill-sun)" strokeWidth={5} />
          <path d="M34 50 A14 14 0 0 1 62 50" fill="none" stroke="var(--ill-gem)" strokeWidth={5} />
          <path d="M48 74 L30 56 M48 74 V58 M48 74 L66 56" fill="none" strokeWidth={2.5} />
        </>
      ),
    },
  ],
  [
    'gluecksstein',
    {
      body: [
        {
          d: 'M14 56 C10 38 28 24 50 24 C72 24 88 36 84 56 C80 72 64 78 46 78 C28 78 17 70 14 56 Z',
          fill: 'var(--ill-rock)',
        },
      ],
      details: (
        <>
          <path
            d="M26 42 C30 35 38 32 46 31"
            fill="none"
            stroke="var(--ill-white)"
            strokeWidth={4}
          />
          <circle cx={56} cy={50} r={6} fill="var(--ill-leaf)" strokeWidth={2} />
          <circle cx={66} cy={50} r={6} fill="var(--ill-leaf)" strokeWidth={2} />
          <circle cx={61} cy={58} r={6} fill="var(--ill-leaf)" strokeWidth={2} />
          <path d="M61 58 L64 68" fill="none" strokeWidth={2} />
        </>
      ),
    },
  ],
  [
    'kleiner-eimer',
    {
      body: [
        { d: 'M18 36 C18 4 78 4 78 36', fill: 'none' },
        { d: 'M20 36 L29 86 H67 L76 36 Z', fill: 'var(--ill-sun)' },
        {
          d: 'M18 29 H78 C81 29 83 31 83 34 V38 C83 41 81 43 78 43 H18 C15 43 13 41 13 38 V34 C13 31 15 29 18 29 Z',
          fill: 'var(--ill-coral)',
        },
      ],
      details: <path d={starPath(48, 62, 13, 6)} fill="var(--ill-starfish)" strokeWidth={2.5} />,
    },
  ],
  [
    'moewenfeder',
    {
      body: [{ d: 'M22 82 C18 52 40 20 76 10 C80 40 62 70 26 80 Z', fill: 'var(--ill-white)' }],
      details: (
        <>
          <path
            d="M76 10 C78 22 74 34 66 44 C60 36 64 20 76 10 Z"
            fill="var(--ill-seal)"
            strokeWidth={2.5}
          />
          <path d="M10 92 L64 30" fill="none" />
          <path d="M34 50 L42 54 M46 38 L50 44 M28 62 L36 64" fill="none" strokeWidth={2} />
        </>
      ),
    },
  ],
  [
    'perle',
    {
      body: [
        { d: 'M8 62 C10 84 86 84 88 62 C70 66 26 66 8 62 Z', fill: 'var(--ill-shell)' },
        { d: circle(48, 44, 22), fill: 'var(--ill-pearl)' },
      ],
      details: (
        <>
          <circle cx={40} cy={36} r={5} fill="var(--ill-white)" stroke="none" />
          <path d="M30 72 L32 78 M48 72 V79 M66 72 L64 78" fill="none" strokeWidth={2} />
        </>
      ),
    },
  ],
]);
