import { mulberry32, shuffle, type Rng } from '@/domain/random';
import { type Cage, countSolutions, solveLogically, type SudokuShape } from '@/domain/sudoku';
import type { SudokuKind } from '@/domain/types';

// Sudoku-Generator (docs/12 3.1): volles Gitter mischen, dann Felder leeren, solange das Rätsel
// genau eine Lösung hat und sich ohne Raten lösen lässt. Gleicher Seed, gleiches Rätsel.

export interface SudokuPuzzle {
  kind: SudokuKind;
  shape: SudokuShape;
  solution: number[];
  /** vorgegebene Werte, 0 = leeres Feld */
  givens: number[];
  /** nur beim Rechen-Sudoku */
  cages: Cage[];
}

function shapeOf(kind: SudokuKind): SudokuShape {
  return kind === 'zahlen6'
    ? { size: 6, boxRows: 2, boxCols: 3 }
    : { size: 4, boxRows: 2, boxCols: 2 };
}

/** Gemischte Reihenfolge von Gruppen (Bänder bzw. Stapel) und innerhalb jeder Gruppe. */
function order(rng: Rng, groups: number, per: number): number[] {
  return shuffle(
    rng,
    Array.from({ length: groups }, (_, g) => g),
  ).flatMap((g) =>
    shuffle(
      rng,
      Array.from({ length: per }, (_, i) => g * per + i),
    ),
  );
}

function fullGrid(shape: SudokuShape, rng: Rng): number[] {
  const { size, boxRows, boxCols } = shape;
  const base = (r: number, c: number) =>
    ((boxCols * (r % boxRows) + Math.floor(r / boxRows) + c) % size) + 1;
  const symbols = shuffle(
    rng,
    Array.from({ length: size }, (_, i) => i + 1),
  );
  const rows = order(rng, size / boxRows, boxRows);
  const cols = order(rng, size / boxCols, boxCols);
  const grid: number[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const value = base(rows[r] ?? 0, cols[c] ?? 0);
      grid.push(symbols[value - 1] ?? value);
    }
  }
  return grid;
}

/** Teilt das 4×4-Gitter in Rechenkästen aus 2 bis 3 Feldern ohne doppelte Werte. */
function makeCages(solution: readonly number[], size: number, rng: Rng): Cage[] {
  const owner = new Array<number>(solution.length).fill(-1);
  const cages: number[][] = [];
  const neighbours = (i: number) =>
    [i - size, i + size, i % size === 0 ? -1 : i - 1, i % size === size - 1 ? -1 : i + 1].filter(
      (n) => n >= 0 && n < solution.length,
    );
  for (const start of shuffle(
    rng,
    solution.map((_, i) => i),
  )) {
    if (owner[start] !== -1) continue;
    const cells = [start];
    owner[start] = cages.length;
    const target = rng() < 0.5 ? 2 : 3;
    while (cells.length < target) {
      const options = cells
        .flatMap(neighbours)
        .filter((n) => owner[n] === -1 && !cells.some((c) => solution[c] === solution[n]));
      const next = shuffle(rng, options)[0];
      if (next === undefined) break;
      owner[next] = cages.length;
      cells.push(next);
    }
    cages.push(cells);
  }
  // einzelne Felder an einen Nachbarkasten hängen, wenn das ohne doppelte Werte geht
  const merged = cages.map((cells) => [...cells]);
  for (const [index, cells] of merged.entries()) {
    const [only] = cells;
    if (cells.length !== 1 || only === undefined) continue;
    const target = neighbours(only)
      .map((n) => owner[n] ?? -1)
      .find(
        (o) =>
          o !== index &&
          (merged[o]?.length ?? 9) < 4 &&
          !(merged[o] ?? []).some((c) => solution[c] === solution[only]),
      );
    if (target === undefined) continue;
    merged[target]?.push(only);
    owner[only] = target;
    merged[index] = [];
  }
  return merged
    .filter((cells) => cells.length > 0)
    .map((cells) => ({
      cells: [...cells].sort((a, b) => a - b),
      sum: cells.reduce((sum, c) => sum + (solution[c] ?? 0), 0),
    }));
}

function digPuzzle(
  solution: readonly number[],
  shape: SudokuShape,
  cages: readonly Cage[],
  empties: number,
  rng: Rng,
): number[] {
  const givens = [...solution];
  let removed = 0;
  for (const index of shuffle(
    rng,
    solution.map((_, i) => i),
  )) {
    if (removed >= empties) break;
    const value = givens[index] ?? 0;
    givens[index] = 0;
    if (countSolutions(givens, shape, cages) === 1 && solveLogically(givens, shape, cages)) {
      removed++;
    } else {
      givens[index] = value;
    }
  }
  return givens;
}

/** Ein Sudoku der Art mit genau `empties` leeren Feldern (falls möglich, sonst so viele wie gehen). */
export function generateSudoku(kind: SudokuKind, empties: number, seed: number): SudokuPuzzle {
  const shape = shapeOf(kind);
  const rng = mulberry32(seed);
  let best: SudokuPuzzle | null = null;
  for (let attempt = 0; attempt < 12; attempt++) {
    const solution = fullGrid(shape, rng);
    const cages = kind === 'rechnen' ? makeCages(solution, shape.size, rng) : [];
    const givens = digPuzzle(solution, shape, cages, empties, rng);
    const puzzle = { kind, shape, solution, givens, cages };
    const holes = givens.filter((v) => v === 0).length;
    if (holes >= empties) return puzzle;
    if (!best || holes > best.givens.filter((v) => v === 0).length) best = puzzle;
  }
  if (!best) throw new Error('Sudoku konnte nicht erzeugt werden');
  return best;
}
