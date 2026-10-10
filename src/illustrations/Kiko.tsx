import { useContext } from 'react';
import type { KikoPose } from '@/domain/hints';
import { type KikoOutfit, KikoOutfitContext } from './kiko-outfit';
import { HAND_ANCHOR, type ItemArt, type ItemLayer, KIKO_ITEM_ART } from './KikoItems';

// Kiko, der Papagei (docs/02, 6.1). Ein Körper, die Posen ändern nur Flügel, Augen und Extras.

/** Flügel als Blatt, das vom Ansatzpunkt (0|0) nach unten zeigt. */
const WING = 'M0 0 C9 2 11 14 4 24 C-1 20 -5 10 0 0 Z';

interface WingProps {
  x: number;
  y: number;
  angle: number;
  mirror?: boolean;
  scale?: number;
}

function Wing({ x, y, angle, mirror = false, scale = 1 }: WingProps) {
  const sx = mirror ? -scale : scale;
  return (
    <path
      d={WING}
      fill="var(--kiko-wing)"
      transform={`translate(${String(x)} ${String(y)}) rotate(${String(angle)}) scale(${String(sx)} ${String(scale)})`}
    />
  );
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Fünfzackiger Stern als Pfad um den Mittelpunkt. */
function starPath(cx: number, cy: number, r: number): string {
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

const FEATHER = 'M0 0 C-5 -7 -5 -14 0 -18 C5 -14 5 -7 0 0 Z';

function Eyes({ pose }: { pose: KikoPose }) {
  if (pose === 'schlaeft') {
    return (
      <g fill="none">
        <path d="M34 39 Q40 44 46 39" />
        <path d="M50 39 Q56 44 62 39" />
      </g>
    );
  }
  if (pose === 'freut-sich') {
    return (
      <g fill="none">
        <path d="M34 40 Q40 32 46 40" />
        <path d="M50 40 Q56 32 62 40" />
      </g>
    );
  }
  const dy = pose === 'denkt' ? -3 : 0;
  const dx = pose === 'zeigt' ? 2 : 0;
  return (
    <g>
      <circle cx={40} cy={38} r={7.5} fill="var(--white)" />
      <circle cx={56} cy={38} r={7.5} fill="var(--white)" />
      <circle cx={40 + dx} cy={39 + dy} r={3.8} fill="var(--stroke)" stroke="none" />
      <circle cx={56 + dx} cy={39 + dy} r={3.8} fill="var(--stroke)" stroke="none" />
      <circle cx={41.4 + dx} cy={37.4 + dy} r={1.3} fill="var(--white)" stroke="none" />
      <circle cx={57.4 + dx} cy={37.4 + dy} r={1.3} fill="var(--white)" stroke="none" />
    </g>
  );
}

function Wings({ pose }: { pose: KikoPose }) {
  switch (pose) {
    case 'hallo':
      return (
        <g>
          <Wing x={28} y={54} angle={20} />
          <Wing x={68} y={52} angle={-145} mirror />
          <g fill="none" strokeWidth={2.5}>
            <path d="M88 20 Q92 26 90 32" />
            <path d="M82 10 Q88 12 91 16" />
          </g>
        </g>
      );
    case 'denkt':
      return (
        <g>
          <Wing x={28} y={54} angle={20} />
          <Wing x={70} y={60} angle={102} mirror scale={0.8} />
          <g fill="var(--white)">
            <circle cx={76} cy={20} r={2.5} />
            <circle cx={84} cy={12} r={3.5} />
          </g>
        </g>
      );
    case 'freut-sich':
      return (
        <g>
          <Wing x={28} y={52} angle={140} />
          <Wing x={68} y={52} angle={-140} mirror />
          <g fill="var(--fill-accent)" strokeWidth={2}>
            <path d={starPath(14, 16, 7)} />
            <path d={starPath(84, 14, 7)} />
            <path d={starPath(10, 62, 5)} />
            <path d={starPath(87, 62, 5)} />
          </g>
        </g>
      );
    case 'zeigt':
      return (
        <g>
          <Wing x={28} y={54} angle={20} />
          <Wing x={68} y={54} angle={-100} mirror />
        </g>
      );
    case 'schlaeft':
      return (
        <g>
          <Wing x={28} y={54} angle={15} />
          <Wing x={68} y={54} angle={-15} mirror />
          <g fill="none" strokeWidth={2.5}>
            <path d="M72 16 H80 L72 24 H80" />
            <path d="M84 4 H89 L84 9 H89" />
          </g>
        </g>
      );
  }
}

/**
 * Kiko, wahlweise verkleidet (docs/12 4.1). Ohne `outfit` gilt das Outfit des aktiven Kindes aus dem
 * Kontext. Hüte und Umhänge dürfen über den Rand des Bildes hinausragen (overflow sichtbar).
 */
export function Kiko({
  pose,
  size = 96,
  className,
  outfit,
}: {
  pose: KikoPose;
  size?: number;
  className?: string;
  outfit?: KikoOutfit;
}) {
  const fromContext = useContext(KikoOutfitContext);
  const worn: { id: string; art: ItemArt }[] = Object.values(outfit ?? fromContext).flatMap(
    (id: string) => {
      const art = KIKO_ITEM_ART[id];
      return art ? [{ id, art }] : [];
    },
  );
  const layer = (name: ItemLayer) =>
    worn
      .filter((item) => item.art.layer === name)
      .map((item) => (
        <g key={item.id} data-worn={item.id}>
          {item.art.art}
        </g>
      ));
  const crest = !worn.some((item) => item.art.hidesCrest);
  const [hx, hy] = HAND_ANCHOR[pose];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={className}
      data-pose={pose}
      overflow="visible"
    >
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        {layer('back')}
        {worn.map((item) => item.art.under && <g key={`u-${item.id}`}>{item.art.under}</g>)}
        {/* Schopffedern: gelb, koralle, gelb */}
        {crest && (
          <>
            <path d={FEATHER} fill="var(--fill-accent)" transform="translate(45 21) rotate(-30)" />
            <path d={FEATHER} fill="var(--fill-accent)" transform="translate(51 21) rotate(30)" />
            <path d={FEATHER} fill="var(--ill-coral)" transform="translate(48 21)" />
          </>
        )}
        {/* Füße */}
        <ellipse cx={40} cy={90} rx={5} ry={3} fill="var(--kiko-beak)" />
        <ellipse cx={56} cy={90} rx={5} ry={3} fill="var(--kiko-beak)" />
        {/* Körper, birnenförmig */}
        <path
          d="M48 18 C63 18 70 29 70 42 C70 50 68 54 72 62 C78 77 66 90 48 90 C30 90 18 77 24 62 C28 54 26 50 26 42 C26 29 33 18 48 18 Z"
          fill="var(--kiko-body)"
        />
        <path
          d="M48 54 C58 54 64 62 63 72 C62 82 56 87 48 87 C40 87 34 82 33 72 C32 62 38 54 48 54 Z"
          fill="var(--kiko-belly)"
        />
        {layer('feet')}
        <Eyes pose={pose} />
        {/* Wangen */}
        <circle cx={32} cy={47} r={2.6} fill="var(--ill-coral)" stroke="none" />
        <circle cx={64} cy={47} r={2.6} fill="var(--ill-coral)" stroke="none" />
        {/* kurzer, gebogener Schnabel */}
        <path
          d="M42 45 C42 40 54 40 54 45 C54 50 51 54 47 57 C47 53 45 49 42 45 Z"
          fill="var(--kiko-beak)"
        />
        {layer('neck')}
        {layer('face')}
        {layer('eyes')}
        <Wings pose={pose} />
        {layer('head')}
        <g transform={`translate(${String(hx)} ${String(hy)})`}>{layer('hand')}</g>
      </g>
    </svg>
  );
}
