import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import type { Stufe } from '@/domain/types';
import { fewestCoins, memoryDeck } from './memory';

describe('Memory-Karten', () => {
  for (const stufe of [1, 2, 3, 4] as Stufe[]) {
    const cfg = STUFEN[stufe].tower.memory;
    it(`Stufe ${String(stufe)}: ${String(cfg.pairs)} Paare (${cfg.kind}), jedes Paar passt`, () => {
      for (let seed = 1; seed <= 300; seed++) {
        const deck = memoryDeck(cfg, seed);
        expect(deck).toHaveLength(cfg.pairs * 2);
        expect(new Set(deck.map((c) => c.id)).size).toBe(deck.length);
        for (let pair = 0; pair < cfg.pairs; pair++) {
          const faces = deck.filter((c) => c.pair === pair).map((c) => c.face);
          expect(faces).toHaveLength(2);
          // Rechnung bzw. Betrag zuerst
          const [a, b] = [...faces].sort((x, y) =>
            (x.kind === 'text' && x.text.includes(' ')) || x.kind === 'money'
              ? -1
              : y.kind === x.kind
                ? 0
                : 1,
          );
          if (a?.kind === 'icon') expect(b).toEqual(a);
          if (a?.kind === 'text' && b?.kind === 'text') {
            const [x = '', op, y = ''] = a.text.split(' ');
            const value = op === '+' ? Number(x) + Number(y) : Number(x) - Number(y);
            expect(String(value)).toBe(b.text);
            expect(Number(x)).toBeLessThanOrEqual(cfg.max);
            expect(value).toBeLessThanOrEqual(cfg.max);
          }
          if (a?.kind === 'money' && b?.kind === 'coins') {
            expect(b.coins.reduce((s, c) => s + c, 0)).toBe(a.cents);
            expect(a.cents).toBeLessThanOrEqual(cfg.max);
          }
        }
        // keine zwei Paare sehen gleich aus
        const keys = deck.map((c) => JSON.stringify(c.face));
        expect(new Set(keys).size).toBe(cfg.kind === 'bilder' ? cfg.pairs : cfg.pairs * 2);
      }
    });
  }

  it('wenigste Münzen', () => {
    expect(fewestCoins(380)).toEqual([200, 100, 50, 20, 10]);
    expect(fewestCoins(0)).toEqual([]);
  });
});
