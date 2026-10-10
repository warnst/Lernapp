// Etagen des Rätselturms (docs/12, Abschnitt 4): erste Etage nach 3 Lampen, danach je 5.

const FIRST_FLOOR = 3;
const PER_FLOOR = 5;
/** Ab hier leuchtet das Leuchtfeuer; danach geht es mit „Sternenetagen“ weiter. */
export const BEACON_FLOOR = 10;

export interface FloorInfo {
  /** fertige Etagen */
  floors: number;
  /** Lampen in der Etage, die gerade gefüllt wird */
  lit: number;
  /** Lampen, die diese Etage braucht */
  size: number;
}

export function floorInfo(lamps: number): FloorInfo {
  if (lamps < FIRST_FLOOR) return { floors: 0, lit: lamps, size: FIRST_FLOOR };
  const after = lamps - FIRST_FLOOR;
  return { floors: 1 + Math.floor(after / PER_FLOOR), lit: after % PER_FLOOR, size: PER_FLOOR };
}

/** Hat die letzte Lampe eine neue Etage fertig gemacht? */
export function floorCompleted(before: number, after: number): boolean {
  return floorInfo(after).floors > floorInfo(before).floors;
}
