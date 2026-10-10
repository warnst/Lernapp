import { describe, expect, it } from 'vitest';
import { floorCompleted, floorInfo } from './tower';

describe('Turm-Etagen', () => {
  it('erste Etage nach 3 Lampen, danach je 5', () => {
    expect(floorInfo(0)).toEqual({ floors: 0, lit: 0, size: 3 });
    expect(floorInfo(2)).toEqual({ floors: 0, lit: 2, size: 3 });
    expect(floorInfo(3)).toEqual({ floors: 1, lit: 0, size: 5 });
    expect(floorInfo(7)).toEqual({ floors: 1, lit: 4, size: 5 });
    expect(floorInfo(8)).toEqual({ floors: 2, lit: 0, size: 5 });
  });

  it('erkennt eine neu fertige Etage', () => {
    expect(floorCompleted(2, 3)).toBe(true);
    expect(floorCompleted(3, 4)).toBe(false);
    expect(floorCompleted(7, 8)).toBe(true);
  });
});
