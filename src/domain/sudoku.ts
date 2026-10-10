// Sudoku-Logik (docs/12 3.1): Einheiten, Kandidaten, Löser und der „sichere nächste Schritt“.
// Ein Gitter ist ein Array der Länge size², Zeile für Zeile; 0 heißt leer, sonst 1..size.

export interface SudokuShape {
  size: number;
  boxRows: number;
  boxCols: number;
}

/** Umrandeter Kasten beim Rechen-Sudoku mit Summe in der Ecke. */
export interface Cage {
  cells: number[];
  sum: number;
}

export type UnitKind = 'row' | 'col' | 'box';

/** Warum ein Feld sicher ist; daraus entsteht Kikos Tipp. */
export type SafeReason =
  | { kind: 'last'; unit: UnitKind }
  | { kind: 'cage' }
  | { kind: 'single' }
  | { kind: 'hidden'; unit: UnitKind };

export interface SafeStep {
  index: number;
  value: number;
  reason: SafeReason;
}

export interface Unit {
  kind: UnitKind;
  cells: number[];
}

const unitCache = new Map<string, Unit[]>();
const peerCache = new Map<string, number[][]>();

const keyOf = (shape: SudokuShape) =>
  `${String(shape.size)}:${String(shape.boxRows)}x${String(shape.boxCols)}`;

export function units(shape: SudokuShape): Unit[] {
  const key = keyOf(shape);
  const cached = unitCache.get(key);
  if (cached) return cached;
  const built = buildUnits(shape);
  unitCache.set(key, built);
  return built;
}

function buildUnits(shape: SudokuShape): Unit[] {
  const { size, boxRows, boxCols } = shape;
  const range = Array.from({ length: size }, (_, i) => i);
  const rows = range.map((r): Unit => ({ kind: 'row', cells: range.map((c) => r * size + c) }));
  const cols = range.map((c): Unit => ({ kind: 'col', cells: range.map((r) => r * size + c) }));
  const boxes = range.map((b): Unit => {
    const top = Math.floor(b / (size / boxCols)) * boxRows;
    const left = (b % (size / boxCols)) * boxCols;
    return {
      kind: 'box',
      cells: Array.from(
        { length: size },
        (_, i) => (top + Math.floor(i / boxCols)) * size + left + (i % boxCols),
      ),
    };
  });
  return [...rows, ...cols, ...boxes];
}

/** Alle Felder, die mit einem Feld eine Reihe, Spalte oder einen Kasten teilen. */
function peersOf(shape: SudokuShape, index: number): number[] {
  const key = keyOf(shape);
  let table = peerCache.get(key);
  if (!table) {
    const all = units(shape);
    table = Array.from({ length: shape.size * shape.size }, (_, i) => {
      const peers = new Set<number>();
      for (const unit of all) {
        if (unit.cells.includes(i)) for (const cell of unit.cells) peers.add(cell);
      }
      peers.delete(i);
      return [...peers];
    });
    peerCache.set(key, table);
  }
  return table[index] ?? [];
}

/** Mögliche Werte eines leeren Feldes nach Reihe, Spalte, Kasten und (falls vorhanden) Rechenkasten. */
export function candidates(
  grid: readonly number[],
  shape: SudokuShape,
  index: number,
  cages: readonly Cage[] = [],
): number[] {
  const used = new Set(peersOf(shape, index).map((i) => grid[i] ?? 0));
  const cage = cages.find((c) => c.cells.includes(index));
  const result: number[] = [];
  for (let value = 1; value <= shape.size; value++) {
    if (used.has(value)) continue;
    if (cage && !cageAllows(grid, cage, index, value)) continue;
    result.push(value);
  }
  return result;
}

function cageAllows(grid: readonly number[], cage: Cage, index: number, value: number): boolean {
  let filled = value;
  let open = 0;
  for (const cell of cage.cells) {
    if (cell === index) continue;
    const v = grid[cell] ?? 0;
    if (v === value) return false;
    if (v === 0) open++;
    else filled += v;
  }
  const rest = cage.sum - filled;
  return open === 0 ? rest === 0 : rest >= open;
}

/** Zählt Lösungen bis `limit` (Backtracking, Feld mit den wenigsten Kandidaten zuerst). */
export function countSolutions(
  grid: readonly number[],
  shape: SudokuShape,
  cages: readonly Cage[] = [],
  limit = 2,
): number {
  const work = [...grid];
  let found = 0;
  const step = (): void => {
    let best = -1;
    let bestOptions: number[] = [];
    for (let i = 0; i < work.length; i++) {
      if (work[i] !== 0) continue;
      const options = candidates(work, shape, i, cages);
      if (best === -1 || options.length < bestOptions.length) {
        best = i;
        bestOptions = options;
        if (options.length <= 1) break;
      }
    }
    if (best === -1) {
      found++;
      return;
    }
    for (const value of bestOptions) {
      work[best] = value;
      step();
      if (found >= limit) break;
    }
    work[best] = 0;
  };
  step();
  return found;
}

/**
 * Ein Feld, das sich ohne Raten sicher füllen lässt, in kindgerechter Reihenfolge:
 * erst „hier fehlt nur noch eins“, dann Rechenkasten, dann einziger Kandidat, dann versteckter Einer.
 */
export function nextSafe(
  grid: readonly number[],
  shape: SudokuShape,
  cages: readonly Cage[] = [],
): SafeStep | null {
  const all = units(shape);
  for (const unit of all) {
    const [only, ...more] = unit.cells.filter((i) => grid[i] === 0);
    if (only === undefined || more.length > 0) continue;
    const [value] = candidates(grid, shape, only, cages);
    if (value !== undefined)
      return { index: only, value, reason: { kind: 'last', unit: unit.kind } };
  }
  for (const cage of cages) {
    const [only, ...more] = cage.cells.filter((i) => grid[i] === 0);
    if (only === undefined || more.length > 0) continue;
    const value = cage.sum - cage.cells.reduce((sum, i) => sum + (grid[i] ?? 0), 0);
    if (candidates(grid, shape, only, cages).includes(value)) {
      return { index: only, value, reason: { kind: 'cage' } };
    }
  }
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== 0) continue;
    const [value, ...more] = candidates(grid, shape, i, cages);
    if (value !== undefined && more.length === 0) {
      return { index: i, value, reason: { kind: 'single' } };
    }
  }
  for (const unit of all) {
    for (let value = 1; value <= shape.size; value++) {
      if (unit.cells.some((i) => grid[i] === value)) continue;
      const [spot, ...more] = unit.cells.filter(
        (i) => grid[i] === 0 && candidates(grid, shape, i, cages).includes(value),
      );
      if (spot !== undefined && more.length === 0) {
        return { index: spot, value, reason: { kind: 'hidden', unit: unit.kind } };
      }
    }
  }
  return null;
}

/** Lässt sich das Gitter Schritt für Schritt mit `nextSafe` bis zum Ende füllen? Liefert die Lösung. */
export function solveLogically(
  grid: readonly number[],
  shape: SudokuShape,
  cages: readonly Cage[] = [],
): number[] | null {
  const work = [...grid];
  for (;;) {
    if (!work.includes(0)) return work;
    const step = nextSafe(work, shape, cages);
    if (!step) return null;
    work[step.index] = step.value;
  }
}
