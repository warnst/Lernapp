import { describe, expect, it } from 'vitest';
import { solveGrid } from './grid';

type Cells = { id: string; value?: number }[];

function cells(values: Record<string, number | undefined>): Cells {
  return Object.entries(values).map(([id, value]) =>
    value === undefined ? { id } : { id, value },
  );
}

describe('solveGrid: Zahlenmauer (Beispiele aus docs/10, Abschnitt 5)', () => {
  it('Stufe 1: unten 2 und 3, oben ? → 5', () => {
    expect(solveGrid('wall', cells({ r0c0: 2, r0c1: 3, r1c0: undefined }))).toEqual({
      r0c0: 2,
      r0c1: 3,
      r1c0: 5,
    });
  });

  it('Stufe 2: unten 4 · 3 · 5, Mitte 7 · ?, oben ? → 8, 15', () => {
    const solved = solveGrid(
      'wall',
      cells({ r0c0: 4, r0c1: 3, r0c2: 5, r1c0: 7, r1c1: undefined, r2c0: undefined }),
    );
    expect(solved).toMatchObject({ r1c1: 8, r2c0: 15 });
  });

  it('Stufe 3: unten 1,20 € · ? · 1,50 €, Mitte 2,00 € · 2,30 €, oben ? → 80 Cent, 4,30 €', () => {
    const solved = solveGrid(
      'wall',
      cells({ r0c0: 120, r0c1: undefined, r0c2: 150, r1c0: 200, r1c1: 230, r2c0: undefined }),
    );
    expect(solved).toMatchObject({ r0c1: 80, r2c0: 430 });
  });

  it('Stufe 4: 12 · ? · 8 · 30 / 37 · 33 · 38 / 70 · ? / ? → 25, 71, 141', () => {
    const solved = solveGrid(
      'wall',
      cells({
        r0c0: 12,
        r0c1: undefined,
        r0c2: 8,
        r0c3: 30,
        r1c0: 37,
        r1c1: 33,
        r1c2: 38,
        r2c0: 70,
        r2c1: undefined,
        r3c0: undefined,
      }),
    );
    expect(solved).toMatchObject({ r0c1: 25, r2c1: 71, r3c0: 141 });
  });

  it('rechnet auch von oben nach unten (links und rechts fehlt)', () => {
    expect(solveGrid('wall', cells({ r0c0: undefined, r0c1: 3, r1c0: 10 }))).toMatchObject({
      r0c0: 7,
    });
    expect(solveGrid('wall', cells({ r0c0: 4, r0c1: undefined, r1c0: 10 }))).toMatchObject({
      r0c1: 6,
    });
  });

  it('liefert null, wenn die Lösung nicht eindeutig ist', () => {
    expect(solveGrid('wall', cells({ r0c0: undefined, r0c1: undefined, r1c0: 10 }))).toBeNull();
  });

  it('liefert null bei Widersprüchen und negativen Steinen', () => {
    expect(solveGrid('wall', cells({ r0c0: 2, r0c1: 3, r1c0: 6 }))).toBeNull();
    expect(solveGrid('wall', cells({ r0c0: 8, r0c1: undefined, r1c0: 5 }))).toBeNull();
    expect(solveGrid('wall', cells({ r0c0: undefined, r0c1: 8, r1c0: 5 }))).toBeNull();
  });

  it('wirft bei einer unvollständigen Mauer', () => {
    expect(() => solveGrid('wall', cells({ r0c0: 1, r0c1: 2 }))).toThrow();
    expect(() => solveGrid('wall', cells({ r0c0: 1, r1c0: 2 }))).toThrow();
    expect(() => solveGrid('wall', cells({ r0c0: 1, r0c1: 2, r1c0: 3, x: 1 }))).toThrow();
  });
});

describe('solveGrid: Rechendreieck', () => {
  it('Stufe 2: innen 3, 5, 4 → außen 8, 9, 7', () => {
    const solved = solveGrid(
      'triangle',
      cells({ a: 3, b: 5, c: 4, ab: undefined, bc: undefined, ca: undefined }),
    );
    expect(solved).toEqual({ a: 3, b: 5, c: 4, ab: 8, bc: 9, ca: 7 });
  });

  it('Stufe 4: außen 8, 9, 7 → innen 3, 5, 4', () => {
    const solved = solveGrid(
      'triangle',
      cells({ a: undefined, b: undefined, c: undefined, ab: 8, bc: 9, ca: 7 }),
    );
    expect(solved).toEqual({ a: 3, b: 5, c: 4, ab: 8, bc: 9, ca: 7 });
  });

  it('löst gemischt gegebene Dreiecke', () => {
    const solved = solveGrid(
      'triangle',
      cells({ a: 3, b: undefined, c: undefined, ab: undefined, bc: 9, ca: 7 }),
    );
    expect(solved).toEqual({ a: 3, b: 5, c: 4, ab: 8, bc: 9, ca: 7 });
  });

  it('liefert null, wenn innen halbe oder negative Zahlen herauskämen', () => {
    expect(
      solveGrid(
        'triangle',
        cells({ a: undefined, b: undefined, c: undefined, ab: 8, bc: 9, ca: 6 }),
      ),
    ).toBeNull();
    expect(
      solveGrid(
        'triangle',
        cells({ a: undefined, b: undefined, c: undefined, ab: 2, bc: 9, ca: 3 }),
      ),
    ).toBeNull();
  });

  it('liefert null, wenn zu wenig gegeben ist', () => {
    expect(
      solveGrid(
        'triangle',
        cells({ a: 3, b: undefined, c: undefined, ab: undefined, bc: 9, ca: undefined }),
      ),
    ).toBeNull();
  });

  it('wirft bei einem unvollständigen Dreieck', () => {
    expect(() => solveGrid('triangle', cells({ a: 1, b: 2, ab: 3 }))).toThrow();
    expect(() => solveGrid('triangle', cells({ a: 1, b: 2, c: 3, ab: 3, bc: 5, cx: 4 }))).toThrow();
  });
});
