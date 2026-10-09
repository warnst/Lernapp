import type { CoinValue } from '@/domain/types';
import { coinDiameter } from './coin-size';

// Münzen im echten Größenverhältnis (docs/02, 6.2). viewBox 0 0 100 100, Schrift in px mit Mindestgröße.

type Metal = 'copper' | 'gold' | 'silver';

const FILL: Record<Metal, string> = {
  copper: 'var(--coin-copper)',
  gold: 'var(--coin-gold)',
  silver: 'var(--coin-silver)',
};
const RIM: Record<Metal, string> = {
  copper: 'var(--coin-copper-rim)',
  gold: 'var(--coin-gold-rim)',
  silver: 'var(--coin-silver-rim)',
};

function metals(value: CoinValue): { ring: Metal; core: Metal | null } {
  if (value === 100) return { ring: 'gold', core: 'silver' };
  if (value === 200) return { ring: 'silver', core: 'gold' };
  return { ring: value <= 5 ? 'copper' : 'gold', core: null };
}

export function Coin({
  value,
  size,
  className,
}: {
  value: CoinValue;
  size?: number;
  className?: string;
}) {
  const d = coinDiameter(value, size);
  const { ring, core } = metals(value);
  const isEuro = value >= 100;
  const number = String(isEuro ? value / 100 : value);
  // Schriftgröße in px (gut lesbar ab 45 px Münze), umgerechnet in viewBox-Einheiten
  const unit = 100 / d;
  const numberSize = Math.max(16, d * 0.4) * unit;
  const labelSize = Math.max(10, d * 0.19) * unit;
  const numberY = 50 + (0.72 * numberSize - labelSize) / 2;
  const labelY = numberY + labelSize;
  const stroke = 3 * unit;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={d}
      height={d}
      viewBox="0 0 100 100"
      className={className}
      data-coin={value}
    >
      <circle
        cx={50}
        cy={50}
        r={50 - stroke / 2}
        fill={FILL[ring]}
        stroke="var(--stroke)"
        strokeWidth={stroke}
      />
      {/* Riffelring */}
      <circle
        cx={50}
        cy={50}
        r={50 - stroke - 3}
        fill="none"
        stroke={RIM[ring]}
        strokeWidth={4}
        strokeDasharray="2.5 3"
      />
      {core !== null && (
        <circle
          cx={50}
          cy={50}
          r={33}
          fill={FILL[core]}
          stroke={RIM[core]}
          strokeWidth={stroke * 0.8}
        />
      )}
      {/* Glanzbogen oben links */}
      <path
        d="M17 40 A34 34 0 0 1 40 17"
        fill="none"
        stroke="var(--ill-white)"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.7}
      />
      <g
        fill="var(--ink-900)"
        textAnchor="middle"
        style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}
      >
        <text x={50} y={numberY} fontSize={numberSize}>
          {number}
        </text>
        <text x={50} y={labelY} fontSize={labelSize}>
          {isEuro ? 'Euro' : 'Cent'}
        </text>
      </g>
    </svg>
  );
}
