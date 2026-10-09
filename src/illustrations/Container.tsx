import type { ReactNode } from 'react';
import { ITEM_DRAWINGS } from './item-drawings';

// Behälter für Auswahl-Aufgaben (docs/02, 6.3): Stoffbeutel, Geldbörse, Sandeimer. viewBox 0 0 96 96.

export type ContainerKind = 'beutel' | 'geldboerse' | 'eimer';

const BODIES: Record<
  ContainerKind,
  { art: ReactNode; badge: { x: number; y: number; r: number } }
> = {
  beutel: {
    art: (
      <>
        <path
          d="M24 36 C14 50 12 74 20 84 C28 91 68 91 76 84 C84 74 82 50 72 36 Z"
          fill="var(--ill-sand)"
        />
        <path d="M30 37 L25 20 C36 25 60 25 71 20 L66 37 Z" fill="var(--ill-sand)" />
        <path d="M28 37 C40 41 56 41 68 37" fill="none" strokeWidth={4} />
        <path d="M48 40 C45 47 42 50 38 54 M48 40 C51 47 54 50 58 54" fill="none" />
      </>
    ),
    badge: { x: 48, y: 67, r: 15 },
  },
  geldboerse: {
    art: (
      <>
        <rect x={10} y={24} width={76} height={60} rx={14} fill="var(--ill-purse)" />
        <path
          d="M10 42 C10 30 18 24 28 24 H68 C78 24 86 30 86 42 L48 54 Z"
          fill="var(--ill-water)"
        />
        <circle cx={48} cy={54} r={6} fill="var(--ill-gold)" />
      </>
    ),
    badge: { x: 48, y: 72, r: 9 },
  },
  eimer: {
    art: (
      <>
        <path d="M16 32 C16 4 80 4 80 32" fill="none" />
        <path d="M18 32 L27 86 H69 L78 32 Z" fill="var(--ill-sun)" />
        <rect x={13} y={26} width={70} height={11} rx={5} fill="var(--ill-coral)" />
      </>
    ),
    badge: { x: 48, y: 61, r: 15 },
  },
};

export function Container({
  kind,
  symbol,
  size = 96,
  className,
}: {
  kind: ContainerKind;
  symbol?: string;
  size?: number;
  className?: string;
}) {
  const { art, badge } = BODIES[kind];
  const symbolArt = symbol === undefined ? undefined : ITEM_DRAWINGS.get(symbol);
  // Das 64er-Icon passt mit etwas Rand in den runden Aufnäher
  const scale = (badge.r * 1.7) / 64;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={className}
      data-container={kind}
      data-symbol={symbolArt === undefined ? undefined : symbol}
    >
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        {art}
        {symbolArt !== undefined && (
          <>
            <circle cx={badge.x} cy={badge.y} r={badge.r} fill="var(--ill-white)" strokeWidth={2} />
            <g
              transform={`translate(${String(badge.x - 32 * scale)} ${String(badge.y - 32 * scale)}) scale(${String(scale)})`}
              strokeWidth={2 / scale}
            >
              {symbolArt}
            </g>
          </>
        )}
      </g>
    </svg>
  );
}
