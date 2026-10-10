import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { dailyType } from './daily';
import { makeProfile } from './test-helpers';

describe('Rätsel des Tages', () => {
  it('gleich für denselben Tag, wechselt über die Tage, nur Arten der Stufe', () => {
    const profile = makeProfile({ stufe: 1 });
    const day = new Date(2026, 9, 10, 8);
    expect(dailyType(profile, day)).toBe(dailyType(profile, new Date(2026, 9, 10, 20)));
    const week = Array.from({ length: 14 }, (_, i) =>
      dailyType(profile, new Date(2026, 9, 10 + i)),
    );
    expect(new Set(week).size).toBeGreaterThan(2);
    for (const type of week) expect(STUFEN[1].tower.types).toContain(type);
  });
});
