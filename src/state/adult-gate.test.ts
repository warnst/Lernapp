import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/domain/random';
import { makeAdultQuestion } from './adult-gate';

describe('makeAdultQuestion', () => {
  it('zweistellig × einstellig, Ergebnis über 60', () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 300; i++) {
      const q = makeAdultQuestion(rng);
      expect(q.a).toBeGreaterThanOrEqual(10);
      expect(q.a).toBeLessThanOrEqual(99);
      expect(q.b).toBeGreaterThanOrEqual(2);
      expect(q.b).toBeLessThanOrEqual(9);
      expect(q.answer).toBe(q.a * q.b);
      expect(q.answer).toBeGreaterThan(60);
    }
  });
});
