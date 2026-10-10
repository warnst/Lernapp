import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { countSolutions, solveLogically, units } from '@/domain/sudoku';
import type { Stufe } from '@/domain/types';
import { generateSudoku } from './sudoku';

// docs/12 10: Jedes generierte Sudoku hat genau eine Lösung und lässt sich ohne Raten lösen.

const SEEDS = 300;

describe('Sudoku-Generator', () => {
  for (const stufe of [1, 2, 3, 4] as Stufe[]) {
    for (const { kind, empties } of STUFEN[stufe].tower.sudoku.kinds) {
      for (const [star, holes] of empties.entries()) {
        it(`Stufe ${String(stufe)}, ${kind}, ${String(star + 1)} Sterne: ${String(holes)} leere Felder, eindeutig, ohne Raten`, () => {
          for (let seed = 1; seed <= SEEDS; seed++) {
            const puzzle = generateSudoku(kind, holes, seed);
            const { shape, solution, givens, cages } = puzzle;
            expect(givens.filter((v) => v === 0)).toHaveLength(holes);
            // die Lösung ist ein gültiges Sudoku und passt zu den Vorgaben und Summen
            for (const unit of units(shape)) {
              expect(new Set(unit.cells.map((i) => solution[i])).size).toBe(shape.size);
            }
            givens.forEach((v, i) => {
              if (v !== 0) expect(v).toBe(solution[i]);
            });
            for (const cage of cages) {
              expect(cage.cells.reduce((s, i) => s + (solution[i] ?? 0), 0)).toBe(cage.sum);
              expect(new Set(cage.cells.map((i) => solution[i])).size).toBe(cage.cells.length);
            }
            expect(countSolutions(givens, shape, cages)).toBe(1);
            expect(solveLogically(givens, shape, cages)).toEqual(solution);
          }
        }, 120_000);
      }
    }
  }

  it('gleicher Seed, gleiches Rätsel; Rechen-Sudoku deckt jedes Feld mit genau einem Kasten ab', () => {
    expect(generateSudoku('zahlen6', 14, 7)).toEqual(generateSudoku('zahlen6', 14, 7));
    const { cages } = generateSudoku('rechnen', 10, 3);
    const covered = cages.flatMap((c) => c.cells).sort((a, b) => a - b);
    expect(covered).toEqual(Array.from({ length: 16 }, (_, i) => i));
    expect(cages.every((c) => c.cells.length >= 2 && c.cells.length <= 4)).toBe(true);
  });
});
