import { describe, expect, it } from 'vitest';
import { candidates, countSolutions, nextSafe, solveLogically, units } from './sudoku';

const S4 = { size: 4, boxRows: 2, boxCols: 2 };
const S6 = { size: 6, boxRows: 2, boxCols: 3 };

// gelöstes 4×4: 1 2 3 4 / 3 4 1 2 / 2 1 4 3 / 4 3 2 1
const SOLVED = [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1];

describe('Sudoku-Logik', () => {
  it('Einheiten: Reihen, Spalten und Kästen 2×3 beim 6×6', () => {
    const all = units(S6);
    expect(all).toHaveLength(18);
    expect(all[12]).toEqual({ kind: 'box', cells: [0, 1, 2, 6, 7, 8] });
    expect(all[13]).toEqual({ kind: 'box', cells: [3, 4, 5, 9, 10, 11] });
    expect(all[14]?.cells).toEqual([12, 13, 14, 18, 19, 20]);
    expect(units(S6)).toBe(all);
  });

  it('Kandidaten beachten Reihe, Spalte, Kasten und Rechenkasten', () => {
    const grid = [...SOLVED];
    grid[0] = 0;
    expect(candidates(grid, S4, 0)).toEqual([1]);
    const open = new Array<number>(16).fill(0);
    expect(candidates(open, S4, 5)).toEqual([1, 2, 3, 4]);
    // Kasten {0,1} mit Summe 3: nur 1 und 2, keine doppelten Werte
    const cage = { cells: [0, 1], sum: 3 };
    expect(candidates(open, S4, 0, [cage])).toEqual([1, 2]);
    const half = [...open];
    half[1] = 2;
    expect(candidates(half, S4, 0, [cage])).toEqual([1]);
    expect(candidates(half, S4, 0, [{ cells: [0, 1], sum: 4 }])).toEqual([]);
  });

  it('zählt Lösungen bis zur Grenze', () => {
    expect(countSolutions(SOLVED, S4)).toBe(1);
    expect(countSolutions(new Array<number>(16).fill(0), S4)).toBe(2);
    expect(countSolutions(new Array<number>(16).fill(0), S4, [], 5)).toBe(5);
    const broken = [...SOLVED];
    broken[0] = 0;
    broken[1] = 0;
    broken[4] = 1; // 1 steht jetzt doppelt in der Spalte, keine Lösung
    expect(countSolutions(broken, S4)).toBe(0);
  });

  it('sicherer Schritt: zuerst „hier fehlt nur noch eins“', () => {
    const grid = [...SOLVED];
    grid[0] = 0;
    expect(nextSafe(grid, S4)).toEqual({
      index: 0,
      value: 1,
      reason: { kind: 'last', unit: 'row' },
    });
    expect(nextSafe(SOLVED, S4)).toBeNull();
  });

  it('sicherer Schritt über den Rechenkasten', () => {
    // Reihen und Spalten haben je zwei Lücken, der Kasten {0,1} nur eine
    const grid = [0, 2, 0, 4, 0, 4, 0, 2, 2, 1, 4, 3, 4, 3, 2, 1];
    const step = nextSafe(grid, S4, [
      { cells: [0, 1], sum: 3 },
      { cells: [2, 3, 6, 7], sum: 10 },
      { cells: [4, 5], sum: 7 },
    ]);
    expect(step).toEqual({ index: 0, value: 1, reason: { kind: 'cage' } });
  });

  it('sicherer Schritt: einziger Kandidat und versteckter Einer', () => {
    // Feld 5 hat 1, 3 in der Reihe, 2 in der Spalte: nur 4 bleibt
    const single = [0, 0, 0, 0, 1, 0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0];
    expect(nextSafe(single, S4)).toMatchObject({ index: 5, value: 4, reason: { kind: 'single' } });
    // in Reihe 0 kann die 1 nur noch in Feld 0 stehen
    const hidden = [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
    expect(nextSafe(hidden, S4)).toMatchObject({
      index: 0,
      value: 1,
      reason: { kind: 'hidden', unit: 'row' },
    });
  });

  it('löst ohne Raten oder gibt auf', () => {
    const grid = [...SOLVED];
    for (const i of [0, 5, 10, 15]) grid[i] = 0;
    expect(solveLogically(grid, S4)).toEqual(SOLVED);
    expect(solveLogically(new Array<number>(16).fill(0), S4)).toBeNull();
  });

  it('widersprüchliche oder unvollständige Gitter führen nicht zu falschen Schritten', () => {
    // die letzte Lücke der Reihe hat keinen Kandidaten mehr (die 1 steht schon in der Spalte)
    const stuck = [0, 2, 3, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(nextSafe(stuck, S4)).not.toMatchObject({ index: 0 });
    // Felder außerhalb des Gitters zählen als leer bzw. ohne Nachbarn
    expect(candidates([], S4, 0)).toEqual([1, 2, 3, 4]);
    expect(candidates([], S4, 99, [{ cells: [99, 5], sum: 3 }])).toEqual([1, 2]);
    const open = new Array<number>(16).fill(0);
    // gleiche Werte im Rechenkasten sind verboten, auch wenn sich die Felder nicht sehen
    const far = [...open];
    far[15] = 2;
    expect(candidates(far, S4, 0, [{ cells: [0, 15], sum: 5 }])).toEqual([3]);
    // ein unmöglicher Rest im Kasten wird nicht als Tipp genommen
    const odd = [...open];
    odd[1] = 2;
    odd[10] = 3;
    odd[11] = 4;
    const cages = [
      { cells: [10, 11], sum: 7 },
      { cells: [0, 1], sum: 9 },
    ];
    expect(nextSafe(odd, S4, cages)?.reason.kind).not.toBe('cage');
    expect(nextSafe(open, S4, [{ cells: [0, 20], sum: 2 }])).toMatchObject({ index: 0, value: 1 });
  });
});
