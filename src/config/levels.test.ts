import { describe, expect, it } from 'vitest';
import { AGE_TO_STUFE, STUFEN } from './levels';

const stufen = Object.values(STUFEN);

describe('STUFEN', () => {
  it('hat vier Stufen mit passender id', () => {
    expect(Object.keys(STUFEN)).toEqual(['1', '2', '3', '4']);
    for (const [key, config] of Object.entries(STUFEN)) expect(String(config.id)).toBe(key);
  });

  it('Stufe 1 spielt in der kleinen Bucht, alle anderen auf der Schatzinsel', () => {
    expect(STUFEN[1].world).toBe('kleine-bucht');
    expect([STUFEN[2].world, STUFEN[3].world, STUFEN[4].world]).toEqual([
      'schatzinsel',
      'schatzinsel',
      'schatzinsel',
    ]);
  });

  it.each(stufen)('Stufe $id: Geldgrenzen sind ganze Cent und passen zum Schritt', (config) => {
    const { step, maxPrice, maxTotal, pieces, payments } = config.money;
    for (const value of [step, maxPrice, maxTotal, ...pieces, ...payments]) {
      expect(Number.isInteger(value)).toBe(true);
    }
    expect(maxPrice % step).toBe(0);
    expect(maxTotal % step).toBe(0);
    expect(maxPrice).toBeLessThanOrEqual(maxTotal);
    for (const payment of payments) expect(pieces).toContain(payment);
  });

  it.each(stufen)('Stufe $id: Rätsel- und Antworttypen passen zusammen', (config) => {
    expect(config.riddles.moneyShare).toBeGreaterThanOrEqual(0);
    expect(config.riddles.moneyShare).toBeLessThanOrEqual(1);
    if (config.riddles.types.some((t) => t === 'wall' || t === 'triangle')) {
      expect(config.answerTypes).toContain('grid');
    }
    if (config.riddles.types.includes('code')) expect(config.answerTypes).toContain('code');
  });

  it('wird von Stufe zu Stufe nicht leichter', () => {
    for (let i = 1; i < stufen.length; i++) {
      const [easier, harder] = [stufen[i - 1], stufen[i]];
      expect(harder?.numbers.max).toBeGreaterThan(easier?.numbers.max ?? Infinity);
      expect(harder?.maxStoryWords).toBeGreaterThan(easier?.maxStoryWords ?? Infinity);
    }
  });
});

describe('AGE_TO_STUFE', () => {
  it('schlägt für 5 bis 8 Jahre die Stufen 1 bis 4 vor', () => {
    expect(AGE_TO_STUFE).toEqual({ 5: 1, 6: 2, 7: 3, 8: 4 });
  });
});
