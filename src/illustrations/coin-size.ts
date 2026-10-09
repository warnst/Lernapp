import type { CoinValue } from '@/domain/types';

// Echte Durchmesser der Euro-Münzen in mm (docs/02, 6.2).
const REAL_MM: Record<CoinValue, number> = {
  1: 16.25,
  2: 18.75,
  5: 21.25,
  10: 19.75,
  20: 22.25,
  50: 24.25,
  100: 23.25,
  200: 25.75,
};

/** Durchmesser in px im echten Größenverhältnis; `scale2Euro` ist der Durchmesser der 2-Euro-Münze. */
export function coinDiameter(value: CoinValue, scale2Euro = 72): number {
  return (REAL_MM[value] / REAL_MM[200]) * scale2Euro;
}
