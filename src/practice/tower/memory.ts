import { mulberry32, randomInt, shuffle } from '@/domain/random';
import { MEMORY_PICTURES } from '@/content/memory';
import type { CoinValue, TowerConfig } from '@/domain/types';

// Memory (docs/12 3.2): gleiche Bilder (Stufe 1–2), Rechnung ↔ Ergebnis (Stufe 3),
// Betrag ↔ Münzen (Stufe 4). Gleicher Seed, gleiche Karten.

export type MemoryFace =
  | { kind: 'icon'; icon: string; name: string }
  | { kind: 'text'; text: string; speak: string }
  | { kind: 'money'; cents: number }
  | { kind: 'coins'; coins: CoinValue[] };

export interface MemoryCard {
  id: number;
  pair: number;
  face: MemoryFace;
}

const COINS_DESC: readonly CoinValue[] = [200, 100, 50, 20, 10, 5, 2, 1];

/** Betrag mit möglichst wenigen Münzen (beim Euro ist gierig auch optimal). */
export function fewestCoins(cents: number): CoinValue[] {
  const coins: CoinValue[] = [];
  let rest = cents;
  for (const coin of COINS_DESC) {
    while (rest >= coin) {
      coins.push(coin);
      rest -= coin;
    }
  }
  return coins;
}

function pairsFor(cfg: TowerConfig['memory'], seed: number): [MemoryFace, MemoryFace][] {
  const rng = mulberry32(seed);
  if (cfg.kind === 'bilder') {
    return shuffle(rng, MEMORY_PICTURES)
      .slice(0, cfg.pairs)
      .map(({ icon, name }): [MemoryFace, MemoryFace] => [
        { kind: 'icon', icon, name },
        { kind: 'icon', icon, name },
      ]);
  }
  const used = new Set<number>();
  const pairs: [MemoryFace, MemoryFace][] = [];
  for (let tries = 0; pairs.length < cfg.pairs && tries < 500; tries++) {
    if (cfg.kind === 'rechnung') {
      const result = randomInt(rng, 3, cfg.max);
      if (used.has(result)) continue;
      const plus = result === cfg.max || rng() < 0.6;
      const a = plus ? randomInt(rng, 1, result - 1) : randomInt(rng, result + 1, cfg.max);
      const b = plus ? result - a : a - result;
      used.add(result);
      pairs.push([
        {
          kind: 'text',
          text: `${String(a)} ${plus ? '+' : '−'} ${String(b)}`,
          speak: `${String(a)} ${plus ? 'plus' : 'minus'} ${String(b)}`,
        },
        { kind: 'text', text: String(result), speak: String(result) },
      ]);
    } else {
      // Beträge in 10-Cent-Schritten, mit 2 bis 4 Münzen
      const cents = randomInt(rng, 2, cfg.max / 10) * 10;
      const coins = fewestCoins(cents);
      if (used.has(cents) || coins.length < 2 || coins.length > 4) continue;
      used.add(cents);
      pairs.push([
        { kind: 'money', cents },
        { kind: 'coins', coins },
      ]);
    }
  }
  return pairs;
}

export function memoryDeck(cfg: TowerConfig['memory'], seed: number): MemoryCard[] {
  const cards = pairsFor(cfg, seed).flatMap(([a, b], pair) => [
    { pair, face: a },
    { pair, face: b },
  ]);
  return shuffle(mulberry32(seed + 1), cards).map((card, id) => ({ id, ...card }));
}
