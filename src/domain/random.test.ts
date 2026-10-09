import { describe, expect, it } from 'vitest';
import { hashSeed, mulberry32, pick, randomInt, shuffle } from './random';

describe('mulberry32', () => {
  it('liefert bei gleichem Seed die gleiche Folge', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
  });

  it('liefert bei anderem Seed eine andere Folge', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('bleibt in [0, 1)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('hashSeed', () => {
  it('ist stabil und unterscheidet Teile', () => {
    expect(hashSeed('p1', 'muschelstrand', 's1-t1', 0)).toBe(
      hashSeed('p1', 'muschelstrand', 's1-t1', 0),
    );
    expect(hashSeed('p1', 's1', 0)).not.toBe(hashSeed('p1', 's1', 1));
    expect(hashSeed('ab', 'c')).not.toBe(hashSeed('a', 'bc'));
  });

  it('liefert eine vorzeichenlose 32-Bit-Zahl', () => {
    const hash = hashSeed('s2-t3');
    expect(Number.isInteger(hash)).toBe(true);
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThan(2 ** 32);
  });
});

describe('randomInt', () => {
  it('trifft alle Werte im Bereich und nur diese', () => {
    const rng = mulberry32(3);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(randomInt(rng, 2, 5));
    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });

  it('akzeptiert min === max', () => {
    expect(randomInt(mulberry32(1), 4, 4)).toBe(4);
  });

  it('wirft bei ungültigem Bereich', () => {
    expect(() => randomInt(mulberry32(1), 5, 4)).toThrow(RangeError);
    expect(() => randomInt(mulberry32(1), 0.5, 4)).toThrow(RangeError);
    expect(() => randomInt(mulberry32(1), 0, 4.5)).toThrow(RangeError);
  });
});

describe('pick', () => {
  it('wählt ein Element der Liste', () => {
    const rng = mulberry32(9);
    for (let i = 0; i < 50; i++) expect(['a', 'b', 'c']).toContain(pick(rng, ['a', 'b', 'c']));
  });

  it('wirft bei leerer Liste', () => {
    expect(() => pick(mulberry32(1), [])).toThrow(RangeError);
  });
});

describe('shuffle', () => {
  it('mischt reproduzierbar, ohne das Original zu ändern', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = shuffle(mulberry32(5), original);
    expect(shuffle(mulberry32(5), original)).toEqual(a);
    expect([...a].sort((x, y) => x - y)).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(a).not.toEqual(original);
  });

  it('kommt mit leeren und einelementigen Listen zurecht', () => {
    expect(shuffle(mulberry32(1), [])).toEqual([]);
    expect(shuffle(mulberry32(1), ['x'])).toEqual(['x']);
  });
});
