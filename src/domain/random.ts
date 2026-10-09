// Seed-Zufall: gleicher Seed ergibt gleiche Folge (docs/05, Abschnitt 1).

/** Liefert Zahlen in [0, 1). */
export type Rng = () => number;

/** Zufallsgenerator mulberry32. */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stabiler 32-Bit-Hash (FNV-1a) aus beliebigen Teilen, z. B. für Varianten-Seeds. */
export function hashSeed(...parts: (string | number)[]): number {
  let hash = 0x811c9dc5;
  const text = parts.join('\u0000');
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** Ganze Zahl in [min, max], beide eingeschlossen. */
export function randomInt(rng: Rng, min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError(`Ungültiger Bereich: ${String(min)}–${String(max)}`);
  }
  return min + Math.floor(rng() * (max - min + 1));
}

/** Ein zufälliges Element. */
export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new RangeError('pick aus leerer Liste');
  // Index liegt sicher im Bereich, das Element existiert also
  return items[randomInt(rng, 0, items.length - 1)] as T;
}

/** Neue, gemischte Kopie (Fisher-Yates). */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i);
    // i und j liegen sicher im Bereich, beide Elemente existieren also
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}
