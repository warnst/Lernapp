import type { WorldId } from '@/domain/types';

// Kartenhintergründe (docs/02, 6.3 und 6.4). Ruhig und flächig; Weg und Orte zeichnet die Karte selbst.

function Palm({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={`translate(${String(x)} ${String(y)}) scale(${flip ? '-1' : '1'} 1)`}>
      <ellipse cx={0} cy={2} rx={16} ry={5} fill="var(--ill-hill)" stroke="none" opacity={0.5} />
      <path d="M-4 0 C-4 -20 0 -40 8 -56 L14 -54 C6 -38 4 -20 4 0 Z" fill="var(--ill-trunk)" />
      <path d="M11 -56 C0 -66 -16 -64 -24 -50 C-12 -54 0 -54 11 -56 Z" fill="var(--ill-leaf)" />
      <path d="M11 -56 C20 -68 38 -66 44 -52 C32 -56 22 -56 11 -56 Z" fill="var(--ill-leaf)" />
      <path d="M11 -56 C4 -74 12 -86 26 -84 C18 -76 14 -66 11 -56 Z" fill="var(--ill-leaf)" />
      <circle cx={8} cy={-52} r={4} fill="var(--ill-coconut)" />
    </g>
  );
}

function Wave({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${String(x)} ${String(y)} q8 -8 16 0 t16 0`}
      fill="none"
      stroke="var(--ill-wave)"
      strokeWidth={3}
    />
  );
}

function Rock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${String(x)} ${String(y)}) scale(${String(s)})`}
      d="M-22 8 C-24 -4 -14 -16 -2 -16 C10 -16 22 -8 22 6 C22 12 -20 14 -22 8 Z"
      fill="var(--ill-rock)"
    />
  );
}

const ISLAND =
  'M200 70 C300 70 350 160 340 320 C332 480 360 640 350 820 C340 1000 360 1180 340 1340 C325 1470 270 1540 200 1540 C130 1540 75 1470 60 1340 C40 1180 60 1000 50 820 C40 640 68 480 60 320 C50 160 100 70 200 70 Z';

const WAVES_ISLAND: [number, number][] = Array.from({ length: 13 }, (_, i) => {
  const y = 60 + i * 120;
  return i % 2 === 0 ? [6, y] : [362, y + 60];
});

function Schatzinsel() {
  return (
    <>
      <rect x={0} y={0} width={400} height={1600} fill="var(--ill-sea)" stroke="none" />
      {WAVES_ISLAND.map(([x, y]) => (
        <Wave key={`${String(x)}-${String(y)}`} x={x} y={y} />
      ))}
      <path d={ISLAND} fill="none" stroke="var(--ill-surf)" strokeWidth={18} />
      <path d={ISLAND} fill="var(--ill-sand)" />
      <path
        d="M200 100 C285 100 322 180 314 320 C306 480 334 640 324 820 C314 1000 330 1120 318 1220 C280 1260 240 1230 200 1250 C160 1270 120 1240 82 1220 C70 1120 86 1000 76 820 C66 640 94 480 86 320 C78 180 115 100 200 100 Z"
        fill="var(--ill-grass)"
      />
      <path
        d="M100 420 C100 300 144 190 200 190 C256 190 300 300 300 420 C300 452 100 452 100 420 Z"
        fill="var(--ill-hill)"
      />
      <Palm x={104} y={740} />
      <Palm x={300} y={600} flip />
      <Palm x={110} y={1060} />
      <Palm x={92} y={1380} />
      <Palm x={312} y={1440} flip />
      <Rock x={30} y={250} s={0.9} />
      <Rock x={372} y={1000} s={0.8} />
    </>
  );
}

function KleineBucht() {
  return (
    <>
      <rect x={0} y={0} width={400} height={600} fill="var(--ill-sea)" stroke="none" />
      <Wave x={24} y={60} />
      <Wave x={330} y={40} />
      <Wave x={14} y={300} />
      <Wave x={352} y={330} />
      <Wave x={40} y={560} />
      <Wave x={320} y={566} />
      <circle cx={200} cy={290} r={186} fill="none" stroke="var(--ill-surf)" strokeWidth={18} />
      <circle cx={200} cy={290} r={186} fill="var(--ill-sand)" />
      <path
        d="M60 170 C90 120 140 104 200 104 C260 104 310 120 340 170 C300 150 250 142 200 142 C150 142 100 150 60 170 Z"
        fill="var(--ill-grass)"
      />
      <path
        d="M200 210 C262 210 310 258 310 320 C310 368 292 400 276 430 L320 610 L80 610 L124 430 C108 400 90 368 90 320 C90 258 138 210 200 210 Z"
        fill="var(--ill-sea)"
        stroke="none"
      />
      {/* Ufer der Bucht nur entlang des Sandes */}
      <path
        d="M117 457 L124 430 C108 400 90 368 90 320 C90 258 138 210 200 210 C262 210 310 258 310 320 C310 368 292 400 276 430 L283 457"
        fill="none"
      />
      <Wave x={170} y={300} />
      <Wave x={206} y={360} />
      <Wave x={180} y={460} />
      <Palm x={84} y={250} />
      <Palm x={318} y={250} flip />
      <Rock x={232} y={330} s={0.6} />
      <Rock x={100} y={500} s={0.9} />
      <Rock x={308} y={498} s={0.8} />
    </>
  );
}

function Kosmos() {
  return (
    <>
      <rect x={0} y={0} width={400} height={1400} fill="var(--ink-900)" stroke="none" />
      <ellipse
        cx={110}
        cy={260}
        rx={130}
        ry={75}
        fill="var(--kiko-blue)"
        stroke="none"
        opacity={0.35}
      />
      <ellipse
        cx={300}
        cy={660}
        rx={120}
        ry={85}
        fill="var(--sea-700)"
        stroke="none"
        opacity={0.3}
      />
      <ellipse
        cx={120}
        cy={1040}
        rx={140}
        ry={80}
        fill="var(--kiko-blue)"
        stroke="none"
        opacity={0.28}
      />
      {[
        [52, 90, 4],
        [330, 80, 5],
        [190, 150, 3.5],
        [70, 240, 5],
        [290, 210, 4],
        [350, 360, 4.5],
        [45, 440, 4],
        [220, 420, 3.5],
        [135, 560, 5],
        [345, 540, 4],
        [65, 720, 4.5],
        [260, 780, 5],
        [350, 880, 3.5],
        [85, 960, 4],
        [210, 1080, 5],
        [330, 1180, 4.5],
        [60, 1240, 4],
      ].map(([cx, cy, r], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill={i % 3 === 0 ? 'var(--ill-sun)' : 'var(--ill-white)'}
          stroke="none"
        />
      ))}
      <circle cx={200} cy={1440} r={90} fill="var(--ill-sun)" />
    </>
  );
}

function Zahlenbloecke() {
  return (
    <>
      <rect x={0} y={0} width={400} height={1600} fill="var(--ill-sky)" stroke="none" />
      {/* Regenbogen im Zahlenland */}
      <path
        d="M-20 460 A220 220 0 0 1 420 460"
        fill="none"
        stroke="var(--nb-1-red)"
        strokeWidth={14}
        opacity={0.35}
      />
      <path
        d="M-5 460 A205 205 0 0 1 405 460"
        fill="none"
        stroke="var(--nb-3-yellow)"
        strokeWidth={14}
        opacity={0.35}
      />
      <path
        d="M10 460 A190 190 0 0 1 390 460"
        fill="none"
        stroke="var(--nb-5-blue)"
        strokeWidth={14}
        opacity={0.35}
      />
      {/* Grüne Zahlenland-Hügel */}
      <ellipse cx={90} cy={380} rx={160} ry={90} fill="var(--ill-grass)" stroke="none" />
      <ellipse cx={310} cy={780} rx={170} ry={95} fill="var(--ill-hill)" stroke="none" />
      <ellipse cx={100} cy={1180} rx={165} ry={90} fill="var(--ill-grass)" stroke="none" />
      <ellipse cx={280} cy={1500} rx={190} ry={100} fill="var(--ill-hill)" stroke="none" />
      {/* Bunte Deko-Würfel am Wegesrand */}
      {[
        [36, 1460, 'var(--nb-1-red)'],
        [342, 1310, 'var(--nb-2-orange)'],
        [42, 1120, 'var(--nb-3-yellow)'],
        [338, 940, 'var(--nb-4-green)'],
        [44, 760, 'var(--nb-5-blue)'],
        [340, 580, 'var(--nb-6-purple)'],
        [40, 380, 'var(--nb-8-magenta)'],
        [336, 200, 'var(--ill-white)'],
      ].map(([x, y, fill], i) => (
        <rect
          key={i}
          x={Number(x)}
          y={Number(y)}
          width={28}
          height={28}
          rx={5}
          fill={String(fill)}
        />
      ))}
    </>
  );
}

function LesenInsel() {
  return (
    <>
      {/* Sanftes Meer & Sonnenhimmel für die Silben-Insel */}
      <rect x={0} y={0} width={400} height={1400} fill="var(--ill-sky)" stroke="none" />
      <path
        d="M0 1120 Q100 1090 200 1120 T400 1120 V1400 H0 Z"
        fill="var(--ill-sea)"
        stroke="none"
      />
      <path
        d="M40 1340 C15 1100 28 840 50 560 C72 280 120 70 205 55 C295 40 365 260 362 560 C360 880 375 1120 355 1340 Z"
        fill="var(--ill-sand)"
      />
      <path
        d="M78 1180 C62 940 86 680 96 420 C110 210 155 100 205 95 C265 90 315 240 318 460 C320 740 330 980 310 1180 Z"
        fill="var(--ill-grass)"
      />
      {/* Sanfte Hügel und schwebende Silben-Bögen als Deko */}
      <circle cx={68} cy={140} r={28} fill="var(--ill-sun)" />
      <path
        d="M270 140 Q310 110 350 140 M35 440 Q70 415 105 440 M290 760 Q328 732 366 760 M32 1040 Q72 1012 112 1040"
        fill="none"
        stroke="var(--ill-white)"
        strokeWidth={6}
      />
      <path
        d="M55 1290 Q95 1278 135 1290 M240 1320 Q285 1308 330 1320"
        fill="none"
        stroke="var(--ill-wave)"
        strokeWidth={4}
      />
    </>
  );
}

export function MapBackground({ world, className }: { world: WorldId; className?: string }) {
  const viewBox =
    world === 'schatzinsel' || world === 'zahlenbloecke'
      ? '0 0 400 1600'
      : world === 'kosmos' || world === 'lesen'
        ? '0 0 400 1400'
        : '0 0 400 600';
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="100%"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      data-world={world}
    >
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        {world === 'schatzinsel' ? (
          <Schatzinsel />
        ) : world === 'kosmos' ? (
          <Kosmos />
        ) : world === 'zahlenbloecke' ? (
          <Zahlenbloecke />
        ) : world === 'lesen' ? (
          <LesenInsel />
        ) : (
          <KleineBucht />
        )}
      </g>
    </svg>
  );
}
