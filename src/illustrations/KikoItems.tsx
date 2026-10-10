import type { ReactNode } from 'react';
import type { KikoPose } from '@/domain/hints';
import type { KikoSlot } from '@/domain/types';

// Kikos Kleiderschrank (docs/12 4.1): jedes Teil als eigene Zeichnung im Koordinatensystem von Kiko
// (viewBox 0 0 96 96). Kiko legt die Teile in Ebenen über bzw. unter den Körper. Teile für den Flügel
// sind um ihren Griffpunkt (0|0) gezeichnet und hängen an einem Ankerpunkt je Pose.

export type ItemLayer = 'back' | 'feet' | 'neck' | 'face' | 'eyes' | 'head' | 'hand';

export interface ItemArt {
  layer: ItemLayer;
  art: ReactNode;
  /** zusätzlicher Teil hinter dem Körper (z. B. Rucksack) */
  under?: ReactNode;
  /** Hut verdeckt Kikos Schopf */
  hidesCrest?: boolean;
}

/** Griffpunkt des rechten Flügels je Pose (Flügelspitze, aus den Flügelwinkeln in Kiko.tsx). */
export const HAND_ANCHOR: Record<KikoPose, [number, number]> = {
  hallo: [81, 39],
  denkt: [58, 56],
  'freut-sich': [82, 40],
  zeigt: [86, 54],
  schlaeft: [70, 72],
};

const DARK = 'var(--ill-dark)';
const GOLD = 'var(--sun-400)';
const CORAL = 'var(--coral-400)';
const RED = 'var(--kiko-red)';
const PINK = 'var(--kiko-pink)';
const BLUE = 'var(--kiko-blue)';
const SKY = 'var(--kiko-sky)';
const WHITE = 'var(--white)';
const WOOD = 'var(--ill-wood)';
const BROWN = 'var(--wood-500)';
const GREEN = 'var(--ill-leaf)';

const round1 = (n: number) => Math.round(n * 10) / 10;

function star(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    points.push(
      `${String(round1(cx + radius * Math.cos(a)))} ${String(round1(cy + radius * Math.sin(a)))}`,
    );
  }
  return `M${points.join(' L')} Z`;
}

export const KIKO_ITEM_ART: Record<string, ItemArt> = {
  // ---------- Kopf ----------
  piratenhut: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <path d="M20 24 C26 6 70 6 76 24 C64 18 32 18 20 24 Z" fill={DARK} />
        <path d="M24 22 C36 17 60 17 72 22" fill="none" stroke={GOLD} strokeWidth={2.5} />
        <circle cx={48} cy={13} r={3.2} fill={WHITE} strokeWidth={2} />
        <path d="M45 18 L51 18" strokeWidth={2} />
      </>
    ),
  },
  partyhut: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <path d="M38 22 L48 -4 L58 22 Z" fill={CORAL} />
        <path d="M41 15 L55 15 M44 8 L52 8" stroke={GOLD} strokeWidth={2.5} />
        <circle cx={48} cy={-5} r={3} fill={GOLD} />
      </>
    ),
  },
  kochmuetze: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <path
          d="M34 22 V14 C26 12 26 0 36 1 C38 -6 58 -6 60 1 C70 0 70 12 62 14 V22 Z"
          fill={WHITE}
        />
        <path d="M34 17 H62" fill="none" strokeWidth={2} />
      </>
    ),
  },
  wikingerhelm: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <path d="M28 18 C30 4 66 4 68 18 C64 22 32 22 28 18 Z" fill="var(--ill-rock)" />
        <path d="M30 16 C18 14 14 4 16 -2 C20 6 26 8 32 10 Z" fill={WHITE} />
        <path d="M66 16 C78 14 82 4 80 -2 C76 6 70 8 64 10 Z" fill={WHITE} />
        <path d="M48 6 V20" fill="none" strokeWidth={2} />
        <circle cx={38} cy={16} r={1.6} fill="var(--stroke)" stroke="none" />
        <circle cx={58} cy={16} r={1.6} fill="var(--stroke)" stroke="none" />
      </>
    ),
  },
  ananas: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <path d="M46 6 C40 -4 36 -6 32 -6 C38 -2 40 2 42 8 Z" fill={GREEN} />
        <path d="M50 6 C56 -4 60 -6 64 -6 C58 -2 56 2 54 8 Z" fill={GREEN} />
        <path d="M48 7 C46 -2 47 -8 48 -11 C49 -8 50 -2 48 7 Z" fill={GREEN} />
        <ellipse cx={48} cy={16} rx={16} ry={9} fill={GOLD} />
        <path
          d="M37 12 L42 20 M45 9 L52 22 M53 9 L59 19 M40 21 L46 11 M48 23 L55 11"
          fill="none"
          strokeWidth={1.8}
        />
      </>
    ),
  },
  ente: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <ellipse cx={46} cy={13} rx={12} ry={7} fill={GOLD} />
        <circle cx={55} cy={4} r={6} fill={GOLD} />
        <path d="M60 4 L67 6 L60 8 Z" fill="var(--kiko-beak)" strokeWidth={2} />
        <circle cx={56} cy={2.5} r={1.3} fill="var(--stroke)" stroke="none" />
        <path d="M38 12 Q42 9 46 13" fill="none" strokeWidth={2} />
      </>
    ),
  },
  astronautenhelm: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <circle cx={48} cy={36} r={27} fill={SKY} opacity={0.35} />
        <circle cx={48} cy={36} r={27} fill="none" />
        <path d="M30 22 Q36 14 46 12" fill="none" stroke={WHITE} strokeWidth={3} />
        <path d="M24 56 C30 64 66 64 72 56" fill="none" strokeWidth={5} stroke="var(--ill-rock)" />
        <path d="M48 9 V2" fill="none" />
        <circle cx={48} cy={1} r={2.5} fill={RED} />
      </>
    ),
  },
  zauberhut: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <ellipse cx={48} cy={21} rx={24} ry={4} fill={BLUE} />
        <path d="M34 21 L46 -12 Q48 -14 50 -11 L62 21 Z" fill={BLUE} />
        <path d={star(44, 9, 4)} fill={GOLD} strokeWidth={1.5} />
        <circle cx={53} cy={13} r={1.8} fill={GOLD} stroke="none" />
        <circle cx={49} cy={-3} r={1.5} fill={GOLD} stroke="none" />
      </>
    ),
  },
  detektivhut: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <ellipse cx={48} cy={22} rx={27} ry={4.5} fill={BROWN} />
        <path d="M31 22 C31 8 37 4 48 4 C59 4 65 8 65 22 Z" fill={BROWN} />
        <path d="M31.5 18 H64.5" stroke="var(--wood-900)" strokeWidth={4} />
      </>
    ),
  },
  doktorhut: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <path d="M34 22 V14 H62 V22 Z" fill={DARK} />
        <path d="M22 12 L48 4 L74 12 L48 20 Z" fill={DARK} />
        <path d="M48 12 L70 14 V24" fill="none" stroke={GOLD} strokeWidth={2} />
        <circle cx={70} cy={26} r={2.5} fill={GOLD} strokeWidth={1.5} />
      </>
    ),
  },
  krone: {
    layer: 'head',
    hidesCrest: true,
    art: (
      <>
        <path d="M33 22 L32 7 L40 14 L48 3 L56 14 L64 7 L63 22 Z" fill={GOLD} />
        <circle cx={48} cy={16} r={2.4} fill={RED} strokeWidth={1.5} />
        <circle cx={38} cy={18} r={1.6} fill={BLUE} strokeWidth={1.2} />
        <circle cx={58} cy={18} r={1.6} fill={BLUE} strokeWidth={1.2} />
      </>
    ),
  },

  // ---------- Augen ----------
  sonnenbrille: {
    layer: 'eyes',
    art: (
      <>
        <rect x={31} y={33} width={15} height={11} rx={4} fill={DARK} />
        <rect x={50} y={33} width={15} height={11} rx={4} fill={DARK} />
        <path d="M46 37 H50" />
        <path d="M34 36 L38 36 M53 36 L57 36" stroke={WHITE} strokeWidth={2} />
      </>
    ),
  },
  herzbrille: {
    layer: 'eyes',
    art: (
      <>
        <path
          d="M40 46 C30 40 29 32 35 31 C38 30.5 40 33 40 34.5 C40 33 42 30.5 45 31 C51 32 50 40 40 46 Z"
          fill={PINK}
        />
        <path
          d="M56 46 C46 40 45 32 51 31 C54 30.5 56 33 56 34.5 C56 33 58 30.5 61 31 C67 32 66 40 56 46 Z"
          fill={PINK}
        />
        <path d="M46 36 H50" />
      </>
    ),
  },
  taucherbrille: {
    layer: 'eyes',
    art: (
      <>
        <path d="M26 36 Q48 28 70 36" fill="none" stroke={BLUE} strokeWidth={4} />
        <rect x={31} y={31} width={34} height={15} rx={7} fill={SKY} opacity={0.75} />
        <rect x={31} y={31} width={34} height={15} rx={7} fill="none" />
        <path d="M24 44 V20 Q24 14 30 14" fill="none" stroke={GOLD} strokeWidth={4} />
        <path d="M36 34 Q40 32 44 33" fill="none" stroke={WHITE} strokeWidth={2} />
      </>
    ),
  },
  augenklappe: {
    layer: 'eyes',
    art: (
      <>
        <path d="M27 30 L69 34" fill="none" strokeWidth={2} />
        <ellipse cx={56} cy={39} rx={7} ry={6} fill={DARK} />
      </>
    ),
  },
  monokel: {
    layer: 'eyes',
    art: (
      <>
        <circle cx={56} cy={38} r={9} fill={SKY} opacity={0.4} />
        <circle cx={56} cy={38} r={9} fill="none" stroke={GOLD} strokeWidth={2.5} />
        <path d="M64 42 Q70 56 64 66" fill="none" stroke={GOLD} strokeWidth={1.5} />
      </>
    ),
  },

  // ---------- Gesicht ----------
  schnurrbart: {
    layer: 'face',
    art: (
      <path
        d="M34 51 C38 46 44 47 48 50 C52 47 58 46 62 51 C59 50 56 53 48 52 C40 53 37 50 34 51 Z"
        fill="var(--wood-900)"
      />
    ),
  },
  clownsnase: {
    layer: 'face',
    art: (
      <>
        <circle cx={48} cy={47} r={5.5} fill={RED} />
        <circle cx={46.3} cy={45.3} r={1.5} fill={WHITE} stroke="none" />
      </>
    ),
  },
  glitzerwangen: {
    layer: 'face',
    art: (
      <g fill={GOLD} strokeWidth={1.5}>
        <path d={star(30, 47, 4.5)} />
        <path d={star(66, 47, 4.5)} />
        <circle cx={26} cy={52} r={1.2} stroke="none" />
        <circle cx={70} cy={52} r={1.2} stroke="none" />
      </g>
    ),
  },

  // ---------- Hals ----------
  schal: {
    layer: 'neck',
    art: (
      <>
        <path d="M30 57 C40 63 56 63 66 57 L66 63 C56 69 40 69 30 63 Z" fill={RED} />
        <path d="M58 63 L62 79 L54 79 Z" fill={RED} />
        <path d="M33 59 L37 61 M41 62 L45 63 M51 63 L55 62" stroke={WHITE} strokeWidth={2} />
      </>
    ),
  },
  fliege: {
    layer: 'neck',
    art: (
      <>
        <path d="M48 62 L38 56 V68 Z" fill={RED} />
        <path d="M48 62 L58 56 V68 Z" fill={RED} />
        <circle cx={48} cy={62} r={2.6} fill={RED} />
      </>
    ),
  },
  blumenkette: {
    layer: 'neck',
    art: (
      <g strokeWidth={1.8}>
        {[
          [32, 58, PINK],
          [38, 62, GOLD],
          [44, 64, CORAL],
          [52, 64, PINK],
          [58, 62, GOLD],
          [64, 58, CORAL],
        ].map(([x, y, fill]) => (
          <g key={`${String(x)}-${String(y)}`}>
            <circle cx={x} cy={y} r={3.6} fill={fill as string} />
            <circle cx={x} cy={y} r={1} fill={WHITE} stroke="none" />
          </g>
        ))}
      </g>
    ),
  },
  medaille: {
    layer: 'neck',
    art: (
      <>
        <path d="M38 56 L46 70 M58 56 L50 70" fill="none" stroke={BLUE} strokeWidth={4} />
        <circle cx={48} cy={73} r={6.5} fill={GOLD} />
        <path d={star(48, 73, 3.5)} fill={WHITE} strokeWidth={1.2} />
      </>
    ),
  },
  halstuch: {
    layer: 'neck',
    art: (
      <>
        <path d="M30 57 C40 62 56 62 66 57 L48 74 Z" fill={BLUE} />
        <circle cx={40} cy={62} r={1.2} fill={WHITE} stroke="none" />
        <circle cx={52} cy={64} r={1.2} fill={WHITE} stroke="none" />
        <circle cx={47} cy={68} r={1.2} fill={WHITE} stroke="none" />
      </>
    ),
  },

  // ---------- Rücken ----------
  umhang: {
    layer: 'back',
    art: (
      <>
        <path d="M30 30 C18 52 10 78 8 96 C30 90 66 90 88 96 C86 78 78 52 66 30 Z" fill={RED} />
        <path d="M30 30 Q48 38 66 30" fill="none" stroke={GOLD} strokeWidth={3} />
      </>
    ),
  },
  feenfluegel: {
    layer: 'back',
    art: (
      <>
        <ellipse
          cx={16}
          cy={46}
          rx={14}
          ry={20}
          fill={SKY}
          opacity={0.9}
          transform="rotate(-25 16 46)"
        />
        <ellipse
          cx={80}
          cy={46}
          rx={14}
          ry={20}
          fill={SKY}
          opacity={0.9}
          transform="rotate(25 80 46)"
        />
        <ellipse
          cx={20}
          cy={70}
          rx={8}
          ry={12}
          fill={PINK}
          opacity={0.9}
          transform="rotate(30 20 70)"
        />
        <ellipse
          cx={76}
          cy={70}
          rx={8}
          ry={12}
          fill={PINK}
          opacity={0.9}
          transform="rotate(-30 76 70)"
        />
      </>
    ),
  },
  rucksack: {
    layer: 'neck',
    under: <rect x={12} y={46} width={24} height={30} rx={8} fill={CORAL} />,
    art: (
      <>
        <path d="M33 30 C35 44 34 56 31 66" fill="none" stroke={CORAL} strokeWidth={4} />
        <path d="M63 30 C61 44 62 56 65 66" fill="none" stroke={CORAL} strokeWidth={4} />
      </>
    ),
  },
  schwimmring: {
    layer: 'neck',
    art: (
      <>
        <ellipse cx={48} cy={72} rx={30} ry={9} fill={WHITE} />
        <path
          d="M22 70 Q24 77 30 79 M66 79 Q72 77 74 70 M44 81 H52"
          fill="none"
          stroke={RED}
          strokeWidth={6}
        />
        <ellipse cx={48} cy={72} rx={30} ry={9} fill="none" />
      </>
    ),
  },

  // ---------- Flügel (Griffpunkt 0|0) ----------
  lupe: {
    layer: 'hand',
    art: (
      <>
        <path d="M0 0 L8 -10" strokeWidth={4} />
        <circle cx={12} cy={-15} r={8} fill={SKY} />
        <path d="M8 -19 Q10 -21 13 -21" fill="none" stroke={WHITE} strokeWidth={2} />
      </>
    ),
  },
  zauberstab: {
    layer: 'hand',
    art: (
      <>
        <path d="M0 0 L10 -14" strokeWidth={3.5} />
        <path d={star(13, -20, 7)} fill={GOLD} strokeWidth={2} />
      </>
    ),
  },
  eis: {
    layer: 'hand',
    art: (
      <>
        <path d="M-4 -6 L2 8 L8 -6 Z" fill={WOOD} />
        <circle cx={2} cy={-10} r={6.5} fill={PINK} />
        <circle cx={-1} cy={-13} r={1.2} fill={WHITE} stroke="none" />
      </>
    ),
  },
  banane: {
    layer: 'hand',
    art: (
      <>
        <path d="M-6 -18 C-8 -4 -2 6 8 8 C2 2 -1 -6 0 -16 Z" fill="var(--kiko-banana)" />
        <path d="M-6 -18 L-7 -21" strokeWidth={3} />
      </>
    ),
  },
  fernrohr: {
    layer: 'hand',
    art: (
      <g transform="rotate(-30)">
        <rect x={-4} y={-18} width={8} height={20} rx={2} fill={WOOD} />
        <rect x={-5.5} y={-24} width={11} height={8} rx={2} fill={GOLD} />
      </g>
    ),
  },
  faehnchen: {
    layer: 'hand',
    art: (
      <>
        <path d="M0 4 V-24" strokeWidth={2.5} />
        <path d="M0 -24 L16 -18 L0 -12 Z" fill={CORAL} />
      </>
    ),
  },

  // ---------- Füße ----------
  gummistiefel: {
    layer: 'feet',
    art: (
      <>
        <path d="M34 80 H45 V93 H32 V88 Z" fill={GOLD} />
        <path d="M51 80 H62 V88 L64 93 H51 Z" fill={GOLD} />
      </>
    ),
  },
  rollschuhe: {
    layer: 'feet',
    art: (
      <>
        <path d="M33 84 H47 V91 H33 Z" fill={RED} />
        <path d="M49 84 H63 V91 H49 Z" fill={RED} />
        {[36, 44, 52, 60].map((x) => (
          <circle key={x} cx={x} cy={94} r={2.6} fill={GOLD} strokeWidth={2} />
        ))}
      </>
    ),
  },
  flossen: {
    layer: 'feet',
    art: (
      <>
        <path d="M40 86 L26 96 H44 Z" fill={BLUE} />
        <path d="M56 86 L52 96 H70 Z" fill={BLUE} />
      </>
    ),
  },
  ballettschuhe: {
    layer: 'feet',
    art: (
      <>
        <ellipse cx={40} cy={90} rx={6} ry={3.5} fill={PINK} />
        <ellipse cx={56} cy={90} rx={6} ry={3.5} fill={PINK} />
        <path
          d="M37 88 L42 82 M43 88 L38 82 M53 88 L58 82 M59 88 L54 82"
          fill="none"
          stroke={PINK}
          strokeWidth={1.8}
        />
      </>
    ),
  },
};

/** Ausschnitt je Platz für die Vorschaubilder im Kleiderschrank. */
/** Quadratischer Ausschnitt von Kiko je Platz, für die Kacheln im Kleiderschrank (Pose „hallo“). */
export const SLOT_VIEWBOX: Record<KikoSlot, string> = {
  kopf: '10 -22 76 76',
  augen: '20 12 56 56',
  gesicht: '20 22 56 56',
  hals: '16 32 64 64',
  ruecken: '-6 4 108 108',
  hand: '48 -6 64 64',
  fuesse: '18 50 60 60',
};
