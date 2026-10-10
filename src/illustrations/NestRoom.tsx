import { useId, type ReactNode } from 'react';
import type { NestSlot } from '@/domain/types';
import styles from './NestRoom.module.css';
import { PaketIcon } from './PaketIcon';
import { starPath } from './star-path';

// Kikos Nest ganz oben im Leuchtturm (docs/12 4.1). Ein Zimmer mit festen Plätzen, auf die die
// Nest-Teile aus src/content/outfits.ts gelegt werden. viewBox 0 0 240 180.
// Jedes Teil ist einmal gezeichnet (in Zimmer-Koordinaten) und wird für die Vorschau-Kachel
// (viewBox 0 0 64 64) in einen Rahmen eingepasst. Sehr breite Teile (Teppiche, Lichterkette,
// Hängematte, Vorhänge) haben eine eigene, kleinere Fassung aus derselben Zeichenfunktion.

type Pt = readonly [number, number];

const n = (v: number) => String(Math.round(v * 10) / 10);
const translate = (x: number, y: number) => `translate(${n(x)} ${n(y)})`;

/** Punkt auf einer quadratischen Bézierkurve */
function quad(p0: Pt, c: Pt, p1: Pt, t: number): Pt {
  const a = (1 - t) * (1 - t);
  const b = 2 * t * (1 - t);
  const d = t * t;
  return [a * p0[0] + b * c[0] + d * p1[0], a * p0[1] + b * c[1] + d * p1[1]];
}

/** Stern, der flach auf dem Boden liegt (eigene Radien in x und y, damit die Kontur gleich dick bleibt) */
function flatStar(cx: number, cy: number, rx: number, ry: number, inner = 0.5): string {
  const parts: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const k = i % 2 === 0 ? 1 : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    parts.push(
      `${i === 0 ? 'M' : 'L'}${n(cx + rx * k * Math.cos(a))} ${n(cy + ry * k * Math.sin(a))}`,
    );
  }
  return `${parts.join(' ')} Z`;
}

/** kleiner Glitzer (vierzackig) */
function sparkle(cx: number, cy: number, r: number): string {
  const s = r * 0.28;
  return `M${n(cx)} ${n(cy - r)} Q${n(cx + s)} ${n(cy - s)} ${n(cx + r)} ${n(cy)} Q${n(cx + s)} ${n(cy + s)} ${n(cx)} ${n(cy + r)} Q${n(cx - s)} ${n(cy + s)} ${n(cx - r)} ${n(cy)} Q${n(cx - s)} ${n(cy - s)} ${n(cx)} ${n(cy - r)} Z`;
}

const LIGHT_COLORS = [
  'var(--ill-coral)',
  'var(--ill-sun)',
  'var(--ill-gem)',
  'var(--ill-flamingo)',
  'var(--ill-purse)',
  'var(--ill-turtle)',
];

// ---------------------------------------------------------------------------------------------
// Zeichnungen der Teile. Koordinaten: Zimmer (240 × 180) bzw. für die Kachel-Fassungen 64 × 64.
// ---------------------------------------------------------------------------------------------

function waveRug(cx: number, cy: number, rx: number, ry: number) {
  const w = rx * 0.78;
  const step = (2 * w) / 6;
  const wave = (y: number) =>
    `M${n(cx - w)} ${n(y)} ` +
    Array.from({ length: 6 }, (_, i) => {
      const x0 = cx - w + i * step;
      return `Q${n(x0 + step / 2)} ${n(y - ry * 0.32)} ${n(x0 + step)} ${n(y)}`;
    }).join(' ');
  return (
    <g>
      <path
        d={`M${n(cx - rx)} ${n(cy - ry * 0.4)} l-5 -2 M${n(cx - rx)} ${n(cy + ry * 0.4)} l-5 2 M${n(cx + rx)} ${n(cy - ry * 0.4)} l5 -2 M${n(cx + rx)} ${n(cy + ry * 0.4)} l5 2`}
        fill="none"
        strokeWidth={2}
      />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--ill-water)" />
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx - 5}
        ry={ry - 3}
        fill="none"
        stroke="var(--ill-surf)"
        strokeWidth={2}
        strokeDasharray="5 5"
      />
      <path d={wave(cy - ry * 0.12)} fill="none" stroke="var(--white)" strokeWidth={2.5} />
      <path
        d={wave(cy + ry * 0.42)}
        fill="none"
        stroke="var(--ill-surf)"
        strokeWidth={2}
        transform={translate(step / 2, 0)}
      />
    </g>
  );
}

function starRug(cx: number, cy: number, rx: number, ry: number) {
  return (
    <g>
      <path d={flatStar(cx, cy, rx, ry, 0.55)} fill="var(--ill-sun)" />
      <path
        d={flatStar(cx, cy, rx * 0.7, ry * 0.7, 0.55)}
        fill="none"
        stroke="var(--white)"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
    </g>
  );
}

const TREASURE_CHEST = (
  <g>
    {/* Glanz aus der Truhe */}
    <path
      d="M58 126 L55 118 M66 124 L66 115 M74 126 L78 118"
      fill="none"
      stroke="var(--ill-sun)"
      strokeWidth={3}
    />
    {/* Deckel offen nach hinten */}
    <path d="M46 138 L50 124 C52 120 78 120 80 124 L84 138 Z" fill="var(--ill-wood-dark)" />
    <path d="M47 138 L52 130 H78 L83 138 Z" fill="var(--ill-cave)" />
    {/* Schätze guckt heraus */}
    <circle cx={58} cy={136} r={5} fill="var(--ill-gold)" />
    <circle cx={67} cy={134} r={5.5} fill="var(--ill-gold)" />
    <circle cx={75} cy={137} r={4} fill="var(--ill-pearl)" />
    <path d="M65 132 L67 130" fill="none" stroke="var(--white)" strokeWidth={2} />
    {/* Körper */}
    <rect x={44} y={138} width={44} height={24} rx={4} fill="var(--ill-wood)" />
    <path d="M55 138 V162 M77 138 V162" fill="none" stroke="var(--ill-gold)" strokeWidth={5} />
    <rect x={44} y={138} width={44} height={24} rx={4} fill="none" />
    <rect x={61} y={141} width={10} height={11} rx={2.5} fill="var(--ill-gold)" strokeWidth={2.5} />
    <path d="M66 145 V148" fill="none" strokeWidth={2} />
  </g>
);

const SEAT_CUSHION = (
  <g>
    <path
      d="M40 154 C36 138 48 128 64 128 C80 128 92 138 88 154 C86 164 42 164 40 154 Z"
      fill="var(--ill-coral)"
    />
    <path d="M44 146 C52 152 76 152 84 146" fill="none" strokeWidth={2} />
    <g fill="var(--white)" stroke="none">
      <circle cx={52} cy={138} r={2.5} />
      <circle cx={74} cy={137} r={2.5} />
      <circle cx={48} cy={155} r={2.2} />
      <circle cx={64} cy={157} r={2.5} />
      <circle cx={80} cy={155} r={2.2} />
    </g>
    <circle cx={64} cy={140} r={3} fill="var(--ill-sun)" strokeWidth={2} />
    {/* kleine Quaste */}
    <path d="M88 150 Q93 152 92 158" fill="none" strokeWidth={2} />
    <circle cx={92} cy={160} r={2.5} fill="var(--ill-sun)" strokeWidth={2} />
  </g>
);

const MINI_POOL = (
  <g>
    {/* aufblasbarer Ring: Seite, dann Oberseite */}
    <path d="M34 148 V156 C34 168 92 168 92 156 V148 Z" fill="var(--ill-purse)" />
    <path
      d="M42 160 L42 165 M54 163 V167 M68 163 V167 M82 161 V165"
      fill="none"
      stroke="var(--white)"
      strokeWidth={3}
    />
    <ellipse cx={63} cy={148} rx={29} ry={11} fill="var(--ill-purse)" />
    <ellipse cx={63} cy={148} rx={22} ry={7} fill="var(--ill-water)" />
    <path
      d="M47 149 q4 -2 8 0 M73 150 q4 -2 8 0"
      fill="none"
      stroke="var(--white)"
      strokeWidth={2}
    />
    {/* Gummientchen */}
    <g className={styles.bob}>
      <path
        d="M58 147 C58 141 70 141 72 145 C74 141 76 140 76 144 C76 148 72 150 66 150 C61 150 58 149 58 147 Z"
        fill="var(--ill-sun)"
        strokeWidth={2.5}
      />
      <circle cx={62} cy={139} r={4.5} fill="var(--ill-sun)" strokeWidth={2.5} />
      <path d="M57 139 L53 140 L57 142 Z" fill="var(--kiko-beak)" strokeWidth={2} />
      <circle cx={61} cy={138} r={1} fill="var(--stroke)" stroke="none" />
    </g>
    {/* Spritzer */}
    <path
      d="M86 138 L89 134 M90 141 L94 139"
      fill="none"
      stroke="var(--ill-water)"
      strokeWidth={2.5}
    />
  </g>
);

const PICTURE_FRAME = (
  <g transform="rotate(-3 44 74)">
    <path d="M30 58 L44 46 L58 58" fill="none" strokeWidth={2} />
    <circle cx={44} cy={46} r={2.5} fill="var(--ill-dark)" strokeWidth={2} />
    <rect x={20} y={56} width={48} height={38} rx={4} fill="var(--ill-gold)" />
    <rect x={27} y={63} width={34} height={24} rx={2} fill="var(--ill-surf)" />
    {/* Bild: Insel mit Palme und Sonne */}
    <circle cx={53} cy={70} r={4} fill="var(--ill-sun)" strokeWidth={2} />
    <path d="M27 80 H61 V87 H27 Z" fill="var(--ill-sea)" strokeWidth={2} />
    <path d="M31 81 C34 74 46 74 49 81 Z" fill="var(--ill-sand)" strokeWidth={2} />
    <path d="M40 77 C40 73 39 70 37 68" fill="none" strokeWidth={2} />
    <path
      d="M37 68 C34 66 31 67 30 69 M37 68 C40 65 43 66 44 68 M37 68 C37 65 35 64 33 64"
      fill="none"
      stroke="var(--ill-leaf)"
      strokeWidth={2.5}
    />
    <rect x={27} y={63} width={34} height={24} rx={2} fill="none" />
  </g>
);

const PIRATE_FLAG = (
  <g>
    <circle cx={20} cy={56} r={2.5} fill="var(--ill-dark)" strokeWidth={2} />
    <circle cx={68} cy={56} r={2.5} fill="var(--ill-dark)" strokeWidth={2} />
    <path d="M20 56 C32 60 54 52 68 56 L66 96 C52 90 34 100 22 94 Z" fill="var(--ill-penguin)" />
    {/* gekreuzte Knochen */}
    <path d="M32 88 L56 70 M32 70 L56 88" fill="none" stroke="var(--white)" strokeWidth={4} />
    {/* freundlicher Totenkopf mit Augenklappe */}
    <path
      d="M44 62 C52 62 55 67 55 72 C55 76 52 78 51 79 V82 H37 V79 C36 78 33 76 33 72 C33 67 36 62 44 62 Z"
      fill="var(--white)"
      strokeWidth={2.5}
    />
    <circle cx={40} cy={71} r={2.5} fill="var(--stroke)" stroke="none" />
    <path d="M45 69 H51 V74 H45 Z" fill="var(--stroke)" strokeWidth={1.5} />
    <path d="M33 68 L55 66" fill="none" strokeWidth={1.5} />
    <path d="M40 79 V82 M44 79 V82 M48 79 V82" fill="none" strokeWidth={1.5} />
  </g>
);

const BOOK_COLORS = [
  'var(--ill-coral)',
  'var(--ill-purse)',
  'var(--ill-sun)',
  'var(--ill-turtle)',
  'var(--ill-flamingo)',
  'var(--ill-octopus)',
];

function books(x: number, base: number, widths: number[], heights: number[], offset: number) {
  let cur = x;
  return widths.map((w, i) => {
    const h = heights[i] ?? 16;
    const color = BOOK_COLORS[(i + offset) % BOOK_COLORS.length] ?? 'var(--ill-coral)';
    const bx = cur;
    cur += w;
    return (
      <g key={i}>
        <rect x={bx} y={base - h} width={w} height={h} rx={1.5} fill={color} strokeWidth={2} />
        <path
          d={`M${n(bx + 1.5)} ${n(base - h + 4)} H${n(bx + w - 1.5)}`}
          fill="none"
          strokeWidth={1.5}
        />
      </g>
    );
  });
}

const BOOKSHELF = (
  <g>
    <rect x={18} y={52} width={52} height={60} rx={4} fill="var(--ill-wood-dark)" />
    <rect x={23} y={57} width={42} height={22} rx={2} fill="var(--ill-wood)" strokeWidth={2} />
    <rect x={23} y={84} width={42} height={23} rx={2} fill="var(--ill-wood)" strokeWidth={2} />
    {books(24, 79, [6, 5, 7, 5], [18, 15, 19, 16], 0)}
    {/* ein Buch lehnt schräg */}
    <rect
      x={48}
      y={63}
      width={5}
      height={16}
      rx={1.5}
      fill="var(--ill-gem)"
      strokeWidth={2}
      transform="rotate(18 50 79)"
    />
    {/* Kikos Wissensbuch liegt oben */}
    <rect x={56} y={73} width={8} height={6} rx={1.5} fill="var(--ill-sun)" strokeWidth={2} />
    {books(24, 107, [5, 7, 6, 5, 6], [17, 20, 16, 19, 15], 3)}
    {/* Witzekiste */}
    <rect x={53} y={97} width={11} height={10} rx={2} fill="var(--ill-coral)" strokeWidth={2} />
    <path
      d="M56.5 100.5 C56.5 98.5 61 98.5 61 100.5 C61 102 58.7 102 58.7 103.5 M58.7 105.5 V105.6"
      fill="none"
      stroke="var(--white)"
      strokeWidth={1.5}
    />
    {/* kleine Pflanze obendrauf */}
    <path d="M34 52 L33 46 H41 L40 52 Z" fill="var(--ill-coral)" strokeWidth={2} />
    <path
      d="M37 46 C34 40 30 40 29 42 C32 44 34 44 37 46 C38 40 42 38 45 40 C42 42 40 44 37 46"
      fill="var(--ill-leaf)"
      strokeWidth={2}
    />
  </g>
);

const FISH_CLOCK = (
  <g>
    {/* Pendel mit Luftblase: tick, tack */}
    <g className={styles.pendulum}>
      <path d="M48 92 V106" fill="none" strokeWidth={2} />
      <circle cx={48} cy={109} r={4} fill="var(--ill-glass)" strokeWidth={2} />
      <path d="M46.5 107.5 L47.5 106.8" fill="none" stroke="var(--white)" strokeWidth={1.5} />
    </g>
    {/* Schwanzflosse und Rückenflosse */}
    <path d="M66 80 L80 66 C82 74 82 86 80 94 Z" fill="var(--ill-coral)" />
    <path d="M36 66 C40 56 52 56 56 64" fill="var(--ill-coral)" />
    {/* Fischkörper */}
    <path
      d="M16 80 C20 66 34 62 46 62 C58 62 66 70 68 80 C66 90 58 98 46 98 C34 98 20 94 16 80 Z"
      fill="var(--ill-seahorse)"
    />
    {/* Zifferblatt */}
    <circle cx={48} cy={80} r={12} fill="var(--white)" />
    <g fill="var(--stroke)" stroke="none">
      <circle cx={48} cy={71} r={1.4} />
      <circle cx={57} cy={80} r={1.4} />
      <circle cx={48} cy={89} r={1.4} />
      <circle cx={39} cy={80} r={1.4} />
    </g>
    <path d="M48 80 V73.5 M48 80 L53 82.5" fill="none" strokeWidth={2.5} />
    {/* Auge und Mund */}
    <circle cx={27} cy={76} r={4} fill="var(--white)" strokeWidth={2} />
    <circle cx={26.3} cy={76.5} r={1.8} fill="var(--stroke)" stroke="none" />
    <path d="M18 84 Q21 86 24 84" fill="none" strokeWidth={2} />
    <circle cx={30} cy={84} r={2} fill="var(--ill-coral)" stroke="none" />
  </g>
);

function stringLights(segments: readonly (readonly [Pt, Pt, Pt])[], perSegment: number, r: number) {
  const bulbs: { p: Pt; i: number }[] = [];
  let i = 0;
  for (const [p0, c, p1] of segments) {
    for (let k = 1; k <= perSegment; k += 1) {
      bulbs.push({ p: quad(p0, c, p1, k / (perSegment + 1)), i });
      i += 1;
    }
  }
  const wire = segments
    .map(
      ([p0, c, p1], k) =>
        `${k === 0 ? `M${n(p0[0])} ${n(p0[1])} ` : ''}Q${n(c[0])} ${n(c[1])} ${n(p1[0])} ${n(p1[1])}`,
    )
    .join(' ');
  return (
    <g>
      <path d={wire} fill="none" strokeWidth={2} />
      {bulbs.map(({ p, i: idx }) => {
        const color = LIGHT_COLORS[idx % LIGHT_COLORS.length] ?? 'var(--ill-sun)';
        return (
          <g key={idx} transform={translate(p[0], p[1])}>
            <circle
              cx={0}
              cy={r * 1.6}
              r={r * 2}
              fill={color}
              stroke="none"
              opacity={0.35}
              className={styles.glow}
              style={{ animationDelay: `${n((idx % 3) * 0.7)}s` }}
            />
            <rect
              x={-r * 0.55}
              y={-1}
              width={r * 1.1}
              height={r * 0.8}
              rx={0.8}
              fill="var(--ill-dark)"
              strokeWidth={1.5}
            />
            <ellipse cx={0} cy={r * 1.5} rx={r * 0.8} ry={r} fill={color} strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
}

function hammock(x1: number, x2: number, top: number, end: number, sag: number) {
  const mid = (x1 + x2) / 2;
  const inset = (x2 - x1) * 0.14;
  const a = x1 + inset;
  const b = x2 - inset;
  const body = `M${n(a)} ${n(end)} Q${n(mid)} ${n(end + sag * 3)} ${n(b)} ${n(end)} Q${n(mid)} ${n(end + sag * 0.5)} ${n(a)} ${n(end)} Z`;
  return (
    <g className={styles.sway}>
      {/* Haken */}
      <path d={`M${n(x1)} ${n(top)} v3 M${n(x2)} ${n(top)} v3`} fill="none" strokeWidth={2} />
      <path
        d={`M${n(x1)} ${n(top + 3)} L${n(a)} ${n(end)} M${n(x1)} ${n(top + 3)} L${n(a + 4)} ${n(end + 2)} M${n(x2)} ${n(top + 3)} L${n(b)} ${n(end)} M${n(x2)} ${n(top + 3)} L${n(b - 4)} ${n(end + 2)}`}
        fill="none"
        stroke="var(--ill-wood-dark)"
        strokeWidth={2}
      />
      <path d={body} fill="var(--ill-coral)" />
      <path
        d={`M${n(a + (b - a) * 0.3)} ${n(end + sag * 0.35)} L${n(a + (b - a) * 0.31)} ${n(end + sag * 1.2)} M${n(mid)} ${n(end + sag * 0.4)} V${n(end + sag * 1.35)} M${n(b - (b - a) * 0.3)} ${n(end + sag * 0.35)} L${n(b - (b - a) * 0.31)} ${n(end + sag * 1.2)}`}
        fill="none"
        stroke="var(--white)"
        strokeWidth={3}
      />
      {/* Kissen */}
      <ellipse
        cx={a + (b - a) * 0.17}
        cy={end + sag * 0.15}
        rx={(b - a) * 0.1}
        ry={sag * 0.5}
        fill="var(--ill-sun)"
        strokeWidth={2}
        transform={`rotate(-18 ${n(a + (b - a) * 0.17)} ${n(end + sag * 0.15)})`}
      />
      <path d={body} fill="none" />
    </g>
  );
}

const MOBILE = (
  <g className={styles.swing}>
    <path d="M120 28 V38" fill="none" strokeWidth={2} />
    <path d="M92 38 Q120 34 148 38" fill="none" stroke="var(--ill-wood-dark)" strokeWidth={4} />
    <path d="M92 38 Q120 34 148 38" fill="none" strokeWidth={1} />
    <path d="M94 38 V48 M120 36 V44 M146 38 V50" fill="none" strokeWidth={1.5} />
    <path d={starPath(94, 55, 9.5, 4.5)} fill="var(--ill-sun)" strokeWidth={2.5} />
    <path
      d="M114 46 C108 52 112 62 121 61 C115 58 114 51 119 46 Z"
      fill="var(--ill-straw)"
      strokeWidth={2.5}
    />
    <path d={starPath(146, 57, 8.5, 4)} fill="var(--ill-coral)" strokeWidth={2.5} />
    <path d={starPath(128, 52, 4, 2)} fill="var(--white)" strokeWidth={1.5} />
  </g>
);

const DISCO_SPOTS: { x: number; y: number; c: string }[] = [
  { x: 80, y: 58, c: 'var(--ill-flamingo)' },
  { x: 160, y: 52, c: 'var(--ill-gem)' },
  { x: 84, y: 98, c: 'var(--ill-sun)' },
  { x: 156, y: 106, c: 'var(--ill-octopus)' },
  { x: 148, y: 34, c: 'var(--ill-sun)' },
  { x: 92, y: 36, c: 'var(--ill-gem)' },
];

function discoBall(withSpots: boolean) {
  return (
    <g>
      {withSpots &&
        DISCO_SPOTS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={3.5}
            fill={s.c}
            stroke="none"
            opacity={0.7}
            className={styles.glow}
            style={{ animationDelay: `${n(i * 0.45)}s` }}
          />
        ))}
      <path d="M120 28 V37" fill="none" strokeWidth={2} />
      <rect x={116} y={34} width={8} height={4} rx={1} fill="var(--ill-dark)" strokeWidth={2} />
      <circle cx={120} cy={50} r={13} fill="var(--coin-silver)" />
      {/* Spiegelplättchen */}
      <g stroke="none">
        <path
          d="M110 42 H116 V47 H110 Z M122 39 H128 V43 H122 Z M116 52 H122 V57 H116 Z"
          fill="var(--white)"
        />
        <path d="M122 47 H128 V52 H122 Z M110 52 H115 V56 H110 Z" fill="var(--ill-glass)" />
        <path d="M126 55 H131 V58 H126 Z M116 43 H122 V47 H116 Z" fill="var(--coin-silver-rim)" />
      </g>
      <g fill="none" strokeWidth={1.2}>
        <path d="M108 44 Q120 41 132 44 M107 50 H133 M108 56 Q120 59 132 56" />
        <path d="M120 37 V63 M114 38 Q110 50 114 62 M126 38 Q130 50 126 62" />
      </g>
      <circle cx={120} cy={50} r={13} fill="none" />
      <g fill="var(--white)" strokeWidth={1.5}>
        <path className={styles.twinkle} d={sparkle(104, 40, 5)} />
        <path
          className={styles.twinkle}
          style={{ animationDelay: '0.6s' }}
          d={sparkle(137, 46, 4)}
        />
        <path
          className={styles.twinkle}
          style={{ animationDelay: '1.2s' }}
          d={sparkle(132, 63, 4.5)}
        />
      </g>
    </g>
  );
}

const WINDOW = { cx: 192, cy: 68, r: 22 } as const;

function curtains(x1: number, x2: number, top: number, bottom: number, tie: number) {
  const w = (x2 - x1) * 0.24;
  const left = `M${n(x1)} ${n(top)} H${n(x1 + w)} C${n(x1 + w * 0.9)} ${n(tie - 8)} ${n(x1 + w * 0.4)} ${n(tie - 2)} ${n(x1 + w * 0.35)} ${n(tie)} C${n(x1 + w * 0.6)} ${n(tie + 8)} ${n(x1 + w * 0.9)} ${n(bottom - 6)} ${n(x1 + w * 0.9)} ${n(bottom)} H${n(x1 - 2)} C${n(x1)} ${n(bottom - 10)} ${n(x1 + 3)} ${n(tie + 6)} ${n(x1 + 3)} ${n(tie)} C${n(x1 + 1)} ${n(tie - 10)} ${n(x1)} ${n(top + 10)} ${n(x1)} ${n(top)} Z`;
  const mirror = `translate(${n(x1 + x2)} 0) scale(-1 1)`;
  const dots = (
    <g fill="var(--white)" stroke="none">
      <circle cx={x1 + w * 0.45} cy={top + (tie - top) * 0.35} r={1.8} />
      <circle cx={x1 + w * 0.3} cy={top + (tie - top) * 0.75} r={1.6} />
      <circle cx={x1 + w * 0.45} cy={tie + (bottom - tie) * 0.55} r={1.8} />
    </g>
  );
  const tieBand = (
    <path
      d={`M${n(x1 + 1)} ${n(tie)} H${n(x1 + w * 0.45)}`}
      fill="none"
      stroke="var(--ill-sun)"
      strokeWidth={4}
    />
  );
  return (
    <g>
      <path d={left} fill="var(--ill-flamingo)" />
      {dots}
      {tieBand}
      <g transform={mirror}>
        <path d={left} fill="var(--ill-flamingo)" />
        {dots}
        {tieBand}
      </g>
      <path
        d={`M${n(x1 - 4)} ${n(top)} H${n(x2 + 4)}`}
        fill="none"
        stroke="var(--ill-wood-dark)"
        strokeWidth={4}
      />
      <path d={`M${n(x1 - 4)} ${n(top)} H${n(x2 + 4)}`} fill="none" strokeWidth={1} />
      <circle cx={x1 - 5} cy={top} r={3} fill="var(--ill-gold)" strokeWidth={2} />
      <circle cx={x2 + 5} cy={top} r={3} fill="var(--ill-gold)" strokeWidth={2} />
    </g>
  );
}

const TELESCOPE = (
  <g>
    {/* Dreibein auf der Fensterbank */}
    <path d="M181 86 L173 96 M181 86 L189 96 M181 86 V96" fill="none" strokeWidth={2.5} />
    <g transform="rotate(-30 181 85)">
      <rect x={158} y={81} width={10} height={8} rx={2} fill="var(--ill-dark)" strokeWidth={2.5} />
      <rect
        x={166}
        y={79}
        width={22}
        height={12}
        rx={2}
        fill="var(--ill-coral)"
        strokeWidth={2.5}
      />
      <rect x={186} y={76} width={16} height={18} rx={3} fill="var(--ill-gold)" strokeWidth={2.5} />
      <path d="M172 79 V91" fill="none" stroke="var(--ill-sun)" strokeWidth={3} />
      <ellipse cx={203} cy={85} rx={3} ry={8} fill="var(--ill-glass)" strokeWidth={2.5} />
    </g>
    <path
      className={styles.twinkle}
      d={sparkle(212, 52, 4.5)}
      fill="var(--white)"
      strokeWidth={1.5}
    />
  </g>
);
const FLOWERS = [
  [172, 80, 'var(--ill-flamingo)'],
  [185, 73, 'var(--ill-sun)'],
  [199, 77, 'var(--ill-coral)'],
  [212, 82, 'var(--ill-octopus)'],
] as const;

const FLOWER_BOX = (
  <g>
    <g strokeWidth={2}>
      <path
        d="M172 92 V82 M185 92 V75 M199 92 V79 M212 92 V84"
        fill="none"
        stroke="var(--ill-leaf)"
        strokeWidth={2.5}
      />
      <path
        d="M185 86 C179 84 177 80 179 78 C183 80 185 82 185 86 Z M199 88 C205 86 207 82 205 80 C201 82 199 84 199 88 Z"
        fill="var(--ill-leaf)"
      />
      {FLOWERS.map(([x, y, c]) => (
        <g key={x}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <circle
              key={deg}
              cx={x}
              cy={y - 4.2}
              r={3.4}
              fill={c}
              transform={`rotate(${String(deg)} ${String(x)} ${String(y)})`}
            />
          ))}
          <circle cx={x} cy={y} r={2.6} fill="var(--ill-honey)" />
        </g>
      ))}
    </g>
    <path d="M161 90 H223 L219 106 H165 Z" fill="var(--coin-copper)" />
    <path d="M176 98 H208" fill="none" stroke="var(--ill-wood)" strokeWidth={2.5} />
  </g>
);
function eye(cx: number, cy: number, r: number) {
  return (
    <g className={styles.blink}>
      <circle cx={cx} cy={cy} r={r} fill="var(--white)" strokeWidth={2} />
      <circle cx={cx + r * 0.15} cy={cy + r * 0.1} r={r * 0.5} fill="var(--stroke)" stroke="none" />
      <circle cx={cx + r * 0.3} cy={cy - r * 0.2} r={r * 0.18} fill="var(--white)" stroke="none" />
    </g>
  );
}

const CRAB = (
  <g>
    {/* Beinchen */}
    <path
      d="M186 160 L178 164 L176 170 M188 164 L182 170 M214 160 L222 164 L224 170 M212 164 L218 170"
      fill="none"
      strokeWidth={2.5}
    />
    {/* Scheren: links winkt */}
    <g className={styles.wave}>
      <path d="M186 154 L176 144" fill="none" strokeWidth={2.5} />
      <path
        d="M176 144 C168 142 166 134 172 130 L175 136 L179 131 C182 136 181 142 176 144 Z"
        fill="var(--ill-coral)"
        strokeWidth={2.5}
      />
    </g>
    <path d="M214 154 L222 148" fill="none" strokeWidth={2.5} />
    <path
      d="M222 148 C228 148 231 141 227 137 L224 142 L221 138 C218 142 218 147 222 148 Z"
      fill="var(--ill-coral)"
      strokeWidth={2.5}
    />
    {/* Stielaugen */}
    <path d="M195 151 V142 M205 151 V142" fill="none" strokeWidth={2.5} />
    {eye(195, 140, 4.5)}
    {eye(205, 140, 4.5)}
    {/* Körper */}
    <path
      d="M184 160 C184 150 192 148 200 148 C208 148 216 150 216 160 C216 166 208 168 200 168 C192 168 184 166 184 160 Z"
      fill="var(--ill-coral)"
    />
    <path d="M195 159 Q200 163 205 159" fill="none" strokeWidth={2} />
    <circle cx={190} cy={157} r={2} fill="var(--ill-flamingo)" stroke="none" />
    <circle cx={210} cy={157} r={2} fill="var(--ill-flamingo)" stroke="none" />
  </g>
);

const GOLDFISH = (
  <g>
    <ellipse cx={200} cy={170} rx={14} ry={3} fill="var(--ill-wood-dark)" strokeWidth={2} />
    <path
      d="M189 134 C176 140 178 168 200 169 C222 168 224 140 211 134 Z"
      fill="var(--ill-glass)"
    />
    <path
      d="M182 148 C190 145 210 151 218 148 C220 160 214 168 200 168 C186 168 180 160 182 148 Z"
      fill="var(--ill-water)"
      strokeWidth={2}
    />
    {/* Steinchen und Pflanze */}
    <path
      d="M190 166 C190 162 196 162 196 166 M200 167 C200 163 206 163 207 167"
      fill="var(--ill-rock)"
      strokeWidth={1.5}
    />
    <path
      d="M211 167 C208 161 214 158 210 152"
      fill="none"
      stroke="var(--ill-leaf)"
      strokeWidth={2.5}
    />
    {/* Goldi */}
    <g className={styles.swim}>
      <path d="M206 156 L213 151 L213 162 Z" fill="var(--ill-coral)" strokeWidth={2} />
      <ellipse cx={199} cy={156} rx={8} ry={6} fill="var(--ill-seahorse)" strokeWidth={2} />
      <circle
        cx={195.5}
        cy={154.5}
        r={1.4}
        fill="var(--stroke)"
        stroke="none"
        className={styles.blink}
      />
      <path d="M200 151 Q203 148 205 152" fill="var(--ill-coral)" strokeWidth={1.5} />
    </g>
    {/* Luftblasen */}
    <g fill="var(--white)" strokeWidth={1.5}>
      <circle cx={192} cy={146} r={1.8} className={styles.bubble} />
      <circle
        cx={194}
        cy={140}
        r={1.3}
        className={styles.bubble}
        style={{ animationDelay: '0.8s' }}
      />
    </g>
    {/* Glas: Rand und Glanz */}
    <ellipse cx={200} cy={134} rx={11} ry={3.5} fill="var(--ill-surf)" strokeWidth={2.5} />
    <path
      d="M184 146 C183 152 184 157 186 160"
      fill="none"
      stroke="var(--white)"
      strokeWidth={2.5}
    />
    <path d="M189 134 C176 140 178 168 200 169 C222 168 224 140 211 134" fill="none" />
  </g>
);

const TURTLE = (
  <g>
    {/* Füße */}
    <path
      d="M186 164 C185 170 191 171 192 165 M206 165 C207 171 213 170 212 164"
      fill="var(--ill-turtle)"
      strokeWidth={2.5}
    />
    <path d="M180 161 L174 164 L180 164" fill="var(--ill-turtle)" strokeWidth={2.5} />
    {/* Kopf schaut heraus */}
    <g className={styles.peek}>
      <path
        d="M210 158 C214 148 226 146 228 154 C229 160 222 163 212 162 Z"
        fill="var(--ill-turtle)"
        strokeWidth={2.5}
      />
      {eye(221, 152.5, 2.8)}
      <path d="M223 158 Q225 159.5 227 157.5" fill="none" strokeWidth={1.8} />
      <circle cx={217} cy={157} r={1.6} fill="var(--ill-flamingo)" stroke="none" />
    </g>
    {/* Panzer */}
    <path
      d="M180 162 C180 146 190 138 198 138 C206 138 216 146 216 162 Z"
      fill="var(--ill-turtle-shell)"
    />
    <path
      d="M192 146 L198 142 L204 146 L203 154 H193 Z M193 154 L188 162 M203 154 L208 162 M192 146 L184 152 M204 146 L212 152"
      fill="var(--ill-turtle)"
      strokeWidth={2}
    />
    <rect
      x={178}
      y={159}
      width={40}
      height={5}
      rx={2.5}
      fill="var(--ill-turtle)"
      strokeWidth={2.5}
    />
    {/* Blümchen auf dem Panzer */}
    <g strokeWidth={1.2}>
      <circle cx={198} cy={136} r={2} fill="var(--ill-flamingo)" />
      <circle cx={202} cy={137} r={2} fill="var(--ill-flamingo)" />
      <circle cx={200} cy={135.5} r={1.4} fill="var(--ill-sun)" />
    </g>
  </g>
);

const FIREFLY = (
  <g>
    {/* Pilz als Schlafplatz */}
    <path
      d="M206 168 C205 162 207 156 207 152 H215 C215 156 217 162 216 168 Z"
      fill="var(--white)"
    />
    <path d="M198 154 C198 142 224 142 224 154 Z" fill="var(--ill-coral)" />
    <g fill="var(--white)" stroke="none">
      <circle cx={206} cy={148} r={2} />
      <circle cx={214} cy={146} r={1.6} />
      <circle cx={219} cy={151} r={1.6} />
    </g>
    {/* Leuchtpunkte */}
    <g fill="var(--ill-sun)" stroke="none">
      <circle cx={174} cy={152} r={1.8} className={styles.glow} />
      <circle
        cx={186}
        cy={163}
        r={1.5}
        className={styles.glow}
        style={{ animationDelay: '0.9s' }}
      />
    </g>
    {/* das Glühwürmchen schwebt */}
    <g className={styles.hover}>
      <g transform="translate(190 136) scale(1.35) translate(-190 -136)">
        <circle
          cx={187}
          cy={140}
          r={13}
          fill="var(--ill-sun)"
          stroke="none"
          opacity={0.35}
          className={styles.glow}
        />
        <ellipse
          cx={186}
          cy={128}
          rx={4}
          ry={6}
          fill="var(--ill-glass)"
          strokeWidth={1.8}
          transform="rotate(-30 186 128)"
        />
        <ellipse
          cx={194}
          cy={129}
          rx={4}
          ry={6}
          fill="var(--ill-glass)"
          strokeWidth={1.8}
          transform="rotate(25 194 129)"
        />
        <ellipse cx={186} cy={142} rx={5.5} ry={5} fill="var(--ill-sun)" strokeWidth={2} />
        <circle cx={192} cy={135} r={6} fill="var(--ill-penguin)" strokeWidth={2} />
        <path d="M190 129 L187 123 M194 129 L197 123" fill="none" strokeWidth={1.5} />
        {eye(190.5, 134.5, 2.2)}
        {eye(195, 134.5, 2.2)}
        <path
          d="M190.5 138.5 Q192.5 140 194.5 138.5"
          fill="none"
          stroke="var(--white)"
          strokeWidth={1.4}
        />
      </g>
    </g>
  </g>
);

interface NestArt {
  slot: NestSlot;
  /** Zeichnung im Zimmer */
  scene: ReactNode;
  /** Kachel 64 × 64: eigene Zeichnung (`icon`) oder Ausschnitt [x, y, Breite, Höhe] aus der Zimmer-Zeichnung (`box`) */
  icon?: ReactNode;
  box?: readonly [number, number, number, number];
}

const LIGHTS_SCENE: readonly (readonly [Pt, Pt, Pt])[] = [
  [
    [6, 14],
    [36, 36],
    [64, 22],
  ],
  [
    [64, 22],
    [92, 40],
    [120, 26],
  ],
  [
    [120, 26],
    [148, 40],
    [176, 22],
  ],
  [
    [176, 22],
    [206, 36],
    [234, 14],
  ],
];
const LIGHTS_ICON: readonly (readonly [Pt, Pt, Pt])[] = [
  [
    [4, 16],
    [18, 40],
    [32, 26],
  ],
  [
    [32, 26],
    [46, 40],
    [60, 16],
  ],
];

const NEST_ART = new Map<string, NestArt>([
  [
    'teppich-welle',
    { slot: 'boden', scene: waveRug(120, 150, 52, 12), icon: waveRug(32, 34, 24, 15) },
  ],
  [
    'teppich-stern',
    { slot: 'boden', scene: starRug(120, 149, 58, 15), icon: starRug(32, 34, 28, 24) },
  ],
  ['schatzkiste', { slot: 'boden', scene: TREASURE_CHEST, box: [40, 112, 52, 52] }],
  ['sitzkissen', { slot: 'boden', scene: SEAT_CUSHION, box: [36, 118, 60, 52] }],
  ['mini-pool', { slot: 'boden', scene: MINI_POOL, box: [32, 120, 64, 52] }],
  ['bilderrahmen', { slot: 'wand', scene: PICTURE_FRAME, box: [16, 42, 56, 56] }],
  ['piratenflagge', { slot: 'wand', scene: PIRATE_FLAG, box: [16, 48, 56, 54] }],
  ['buecherregal', { slot: 'wand', scene: BOOKSHELF, box: [14, 40, 60, 74] }],
  ['fischuhr', { slot: 'wand', scene: FISH_CLOCK, box: [12, 52, 72, 66] }],
  [
    'lichterkette',
    {
      slot: 'decke',
      scene: stringLights(LIGHTS_SCENE, 3, 3.5),
      icon: stringLights(LIGHTS_ICON, 2, 5),
    },
  ],
  ['sternenmobile', { slot: 'decke', scene: MOBILE, box: [82, 22, 76, 48] }],
  [
    'discokugel',
    {
      slot: 'decke',
      scene: discoBall(true),
      icon: <g transform="translate(32 34) scale(1.4) translate(-120 -48)">{discoBall(false)}</g>,
    },
  ],
  [
    'haengematte',
    { slot: 'decke', scene: hammock(64, 176, 24, 38, 10), icon: hammock(4, 60, 10, 22, 10) },
  ],
  [
    'vorhaenge',
    {
      slot: 'fenster',
      scene: curtains(162, 222, 42, 106, 74),
      icon: (
        <g>
          <circle cx={32} cy={32} r={16} fill="var(--ill-gold)" />
          <circle cx={32} cy={32} r={11} fill="var(--ill-sky)" />
          <path d="M21.3 34.5 A11 11 0 0 0 42.7 34.5 Z" fill="var(--ill-sea)" strokeWidth={2} />
          {curtains(12, 52, 10, 58, 34)}
        </g>
      ),
    },
  ],
  ['fensterfernrohr', { slot: 'fenster', scene: TELESCOPE, box: [150, 44, 68, 56] }],
  ['blumenkasten', { slot: 'fenster', scene: FLOWER_BOX, box: [160, 58, 64, 50] }],
  ['haustier-krebs', { slot: 'haustier', scene: CRAB, box: [164, 126, 68, 48] }],
  ['goldfisch', { slot: 'haustier', scene: GOLDFISH, box: [174, 130, 52, 44] }],
  ['schildkroete', { slot: 'haustier', scene: TURTLE, box: [172, 130, 60, 44] }],
  ['gluehwuermchen', { slot: 'haustier', scene: FIREFLY, box: [166, 112, 60, 60] }],
]);

function iconContent(art: NestArt): ReactNode {
  const { icon, box, scene } = art;
  if (!box) return icon;
  const [x, y, w, h] = box;
  const s = 60 / Math.max(w, h);
  return (
    <g
      transform={`translate(32 32) scale(${n(s)}) translate(${n(-(x + w / 2))} ${n(-(y + h / 2))})`}
    >
      {scene}
    </g>
  );
}

/** ein Teil an seinem Platz; Teile, die nicht zu diesem Platz gehören, bleiben weg */
function SceneItem({ id, slot }: { id: string | undefined; slot: NestSlot }) {
  if (id === undefined) return null;
  const art = NEST_ART.get(id);
  if (art?.slot !== slot) return null;
  return <g data-nest-item={id}>{art.scene}</g>;
}

/** Zimmer: Wand, Decke, Boden und rundes Fenster */
function Room({ emptyWall }: { emptyWall: boolean }) {
  const { cx, cy, r } = WINDOW;
  const seaY = cy + 5;
  const dx = Math.sqrt(r * r - (seaY - cy) * (seaY - cy));
  return (
    <g>
      <rect x={0} y={0} width={240} height={180} fill="var(--ill-nest-wall)" stroke="none" />
      {/* Leuchtturm-Streifen unten an der runden Wand */}
      <path
        d="M0 152 Q120 108 240 152 V124 Q120 80 0 124 Z"
        fill="var(--ill-nest-band)"
        stroke="none"
      />
      <path d="M0 124 Q120 80 240 124" fill="none" strokeWidth={2} />
      {/* Steinfugen deuten die runde Wand an */}
      <g fill="none" stroke="var(--ill-nest-band)" strokeWidth={2}>
        {(
          [
            [6, 40],
            [22, 50],
            [84, 34],
            [140, 30],
            [150, 92],
            [76, 96],
            [222, 112],
            [8, 98],
          ] as const
        ).map(([x, y]) => (
          <rect key={`${String(x)}-${String(y)}`} x={x} y={y} width={16} height={8} rx={3} />
        ))}
      </g>
      {/* Decke mit Balken, die zur Turmspitze laufen */}
      <path d="M0 0 H240 V12 Q120 44 0 12 Z" fill="var(--ill-wood-dark)" />
      <path
        d="M40 0 L52 21 M84 0 L90 27 M120 0 V28 M156 0 L150 27 M200 0 L188 21"
        fill="none"
        strokeWidth={2}
      />
      <circle cx={120} cy={28} r={3} fill="var(--ill-gold)" strokeWidth={2} />
      {/* rundes Fenster mit Meer und Himmel */}
      <circle cx={cx} cy={cy} r={r + 6} fill="var(--ill-gold)" />
      <circle cx={cx} cy={cy} r={r} fill="var(--ill-sky)" />
      <path
        d={`M${n(cx - dx)} ${n(seaY)} A${n(r)} ${n(r)} 0 0 0 ${n(cx + dx)} ${n(seaY)} Z`}
        fill="var(--ill-sea)"
        strokeWidth={2}
      />
      <path
        d={`M${n(cx - 12)} ${n(seaY + 8)} q4 -3 8 0 M${n(cx + 4)} ${n(seaY + 12)} q4 -3 8 0`}
        fill="none"
        stroke="var(--white)"
        strokeWidth={2}
      />
      <circle cx={cx - 9} cy={cy - 9} r={5} fill="var(--ill-sun)" strokeWidth={2} />
      <path
        d={`M${n(cx + 4)} ${n(cy - 10)} c0 -4 6 -4 7 -1 c2 -2 6 0 5 3 Z`}
        fill="var(--white)"
        strokeWidth={1.5}
      />
      {/* kleines Segelboot am Horizont */}
      <path
        d={`M${n(cx + 6)} ${n(seaY - 1)} h10 l-2 3 h-6 Z M${n(cx + 11)} ${n(seaY - 1)} V${n(seaY - 10)} L${n(cx + 16)} ${n(seaY - 2)} Z`}
        fill="var(--white)"
        strokeWidth={1.5}
      />
      <circle cx={cx} cy={cy} r={r} fill="none" />
      <circle cx={cx} cy={cy} r={r + 6} fill="none" />
      <g fill="var(--ill-gold-dark)" stroke="none">
        <circle cx={cx} cy={cy - r - 3} r={1.5} />
        <circle cx={cx} cy={cy + r + 3} r={1.5} />
        <circle cx={cx - r - 3} cy={cy} r={1.5} />
        <circle cx={cx + r + 3} cy={cy} r={1.5} />
      </g>
      {/* Fensterbank */}
      <rect x={164} y={96} width={56} height={6} rx={2} fill="var(--white)" />
      {/* Boden aus Holzdielen */}
      <path d="M0 152 Q120 108 240 152 V180 H0 Z" fill="var(--ill-wood)" />
      <g fill="none" strokeWidth={1.5} stroke="var(--ill-wood-dark)">
        <path d="M0 166 Q120 124 240 166 M0 180 Q120 142 240 180" />
        <path d="M60 143 L56 156 M150 132 L152 145 M100 150 L98 162 M190 150 L194 162 M30 165 L28 176 M210 166 L213 177" />
      </g>
      {/* ein leerer Nagel an der Wand macht Lust auf ein Bild */}
      {emptyWall && <circle cx={44} cy={52} r={2} fill="var(--ill-dark)" strokeWidth={1.5} />}
    </g>
  );
}

export function NestRoom({
  items,
  kiko,
  width = 240,
  className,
}: {
  items: Partial<Record<NestSlot, string>>;
  kiko?: ReactNode;
  width?: number;
  className?: string;
}) {
  const clipId = `nest-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const isRug = items.boden === 'teppich-welle' || items.boden === 'teppich-stern';
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 240 180"
      width={width}
      height={(width * 180) / 240}
      className={[styles.scene, className].filter(Boolean).join(' ')}
      data-nest-room=""
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={240} height={180} rx={18} />
        </clipPath>
      </defs>
      <g
        clipPath={`url(#${clipId})`}
        stroke="var(--stroke)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Room emptyWall={items.wand === undefined} />
        <SceneItem id={items.wand} slot="wand" />
        <SceneItem id={items.fenster} slot="fenster" />
        {isRug && <SceneItem id={items.boden} slot="boden" />}
        {/* Kikos Schatten und Kiko selbst (viewBox 0 0 96 96) */}
        <ellipse
          cx={120}
          cy={144}
          rx={24}
          ry={4.5}
          fill="var(--stroke)"
          stroke="none"
          opacity={0.12}
        />
        {!isRug && <SceneItem id={items.boden} slot="boden" />}
        {kiko !== undefined && kiko !== null && (
          <svg
            x={80}
            y={66}
            width={80}
            height={80}
            viewBox="0 0 96 96"
            overflow="visible"
            data-nest-kiko=""
          >
            {kiko}
          </svg>
        )}
        <SceneItem id={items.haustier} slot="haustier" />
        <SceneItem id={items.decke} slot="decke" />
      </g>
      <rect
        x={1.5}
        y={1.5}
        width={237}
        height={177}
        rx={17}
        fill="none"
        stroke="var(--stroke)"
        strokeWidth={3}
      />
    </svg>
  );
}

/** ein Nest-Teil allein als Vorschaubild für die Auswahlkacheln (viewBox 0 0 64 64) */
export function NestItemIcon({ id, size = 64 }: { id: string; size?: number }) {
  const art = NEST_ART.get(id);
  if (!art) return <PaketIcon size={size} />;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      data-nest-item={id}
    >
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        {iconContent(art)}
      </g>
    </svg>
  );
}
