import { mulberry32, pick, shuffle, type Rng } from '@/domain/random';

// Labyrinth und Münzpfad (docs/12 3.5). Felder Zeile für Zeile, Start oben links, Truhe unten rechts.
// Labyrinth: aufspannender Baum, also genau ein Weg. Münzpfad: offenes Gitter mit Münzen, mindestens
// ein Weg ergibt genau den Zielbetrag.

export interface MazePuzzle {
  size: number;
  start: number;
  goal: number;
  /** begehbare Verbindungen zwischen Nachbarfeldern als Schlüssel `a-b` mit a < b */
  open: string[];
  /** Münzwert je Feld in Cent (nur Münzpfad; Start und Truhe 0) */
  coins: number[];
  /** Zielbetrag in Cent (nur Münzpfad) */
  target: number;
  /** ein gültiger Weg vom Start zur Truhe */
  solution: number[];
}

const edge = (a: number, b: number) =>
  a < b ? `${String(a)}-${String(b)}` : `${String(b)}-${String(a)}`;

export function neighbours(size: number, cell: number): number[] {
  const row = Math.floor(cell / size);
  const col = cell % size;
  const result: number[] = [];
  if (row > 0) result.push(cell - size);
  if (col < size - 1) result.push(cell + 1);
  if (row < size - 1) result.push(cell + size);
  if (col > 0) result.push(cell - 1);
  return result;
}

export function canStep(puzzle: MazePuzzle, from: number, to: number): boolean {
  return neighbours(puzzle.size, from).includes(to) && puzzle.open.includes(edge(from, to));
}

export function pathSum(puzzle: MazePuzzle, path: readonly number[]): number {
  return path.reduce((sum, cell) => sum + (puzzle.coins[cell] ?? 0), 0);
}

/** Alle Wege vom Ende des angefangenen Weges zur Truhe, die das Ziel erfüllen (höchstens `limit`). */
function completions(puzzle: MazePuzzle, path: readonly number[], limit: number): number[][] {
  const found: number[][] = [];
  const visited = new Set(path);
  const walk = [...path];
  const coinMode = puzzle.target > 0;
  const step = (sum: number): void => {
    const last = walk[walk.length - 1] ?? puzzle.start;
    if (last === puzzle.goal) {
      if (!coinMode || sum === puzzle.target) found.push([...walk]);
      return;
    }
    if (coinMode && sum > puzzle.target) return;
    for (const next of neighbours(puzzle.size, last)) {
      if (visited.has(next) || !canStep(puzzle, last, next)) continue;
      visited.add(next);
      walk.push(next);
      step(sum + (puzzle.coins[next] ?? 0));
      walk.pop();
      visited.delete(next);
      if (found.length >= limit) return;
    }
  };
  step(pathSum(puzzle, path));
  return found;
}

export function countSolutions(puzzle: MazePuzzle, limit = 2): number {
  return completions(puzzle, [puzzle.start], limit).length;
}

/**
 * Tipp: das nächste Feld eines gültigen Weges. Führt der angefangene Weg in eine Sackgasse,
 * zeigt der Tipp, bis wohin man zurückgehen muss (`back`: so viele Felder wegnehmen).
 */
export function nextHint(
  puzzle: MazePuzzle,
  path: readonly number[],
): { cell: number; back: number } | null {
  if (path[path.length - 1] === puzzle.goal && completions(puzzle, path, 1).length > 0) return null;
  for (let keep = path.length; keep >= 1; keep--) {
    const [way] = completions(puzzle, path.slice(0, keep), 1);
    const cell = way?.[keep];
    if (cell !== undefined) return { cell, back: path.length - keep };
  }
  return null;
}

/** Labyrinth mit genau einem Weg (Tiefensuche mit Zurückgehen). */
export function generateMaze(size: number, seed: number): MazePuzzle {
  const rng = mulberry32(seed);
  const open: string[] = [];
  const seen = new Set<number>([0]);
  const stack = [0];
  while (stack.length > 0) {
    const cell = stack[stack.length - 1] ?? 0;
    const fresh = neighbours(size, cell).filter((n) => !seen.has(n));
    if (fresh.length === 0) {
      stack.pop();
      continue;
    }
    const next = pick(rng, fresh);
    open.push(edge(cell, next));
    seen.add(next);
    stack.push(next);
  }
  const base: MazePuzzle = {
    size,
    start: 0,
    goal: size * size - 1,
    open,
    coins: new Array<number>(size * size).fill(0),
    target: 0,
    solution: [],
  };
  return { ...base, solution: completions(base, [0], 1)[0] ?? [] };
}

/** zufälliger einfacher Weg vom Start zur Truhe mit `cells` Feldern dazwischen */
function randomPath(size: number, cells: number, rng: Rng): number[] | null {
  const goal = size * size - 1;
  const walk = [0];
  const visited = new Set(walk);
  let budget = 4000;
  const step = (): boolean => {
    if (--budget < 0) return false;
    const last = walk[walk.length - 1] ?? 0;
    const inner = walk.length - 1;
    if (last === goal) return inner === cells + 1;
    if (inner > cells) return false;
    for (const next of shuffle(rng, neighbours(size, last))) {
      if (visited.has(next) || (next === goal && inner !== cells)) continue;
      visited.add(next);
      walk.push(next);
      if (step()) return true;
      walk.pop();
      visited.delete(next);
    }
    return false;
  };
  return step() ? walk : null;
}

/** `count` Münzen, die zusammen genau `target` ergeben (gleichmäßig zufällig unter den Möglichen). */
function coinsFor(
  count: number,
  target: number,
  coins: readonly number[],
  rng: Rng,
): number[] | null {
  // reachable[k] = Beträge, die mit k Münzen gehen
  const reachable: Set<number>[] = [new Set([0])];
  for (let k = 1; k <= count; k++) {
    const next = new Set<number>();
    for (const sum of reachable[k - 1] ?? [])
      for (const c of coins) if (sum + c <= target) next.add(sum + c);
    reachable.push(next);
  }
  if (!reachable[count]?.has(target)) return null;
  const result: number[] = [];
  let rest = target;
  for (let k = count; k >= 1; k--) {
    const options = coins.filter((c) => reachable[k - 1]?.has(rest - c));
    const coin = pick(rng, options);
    result.push(coin);
    rest -= coin;
  }
  return shuffle(rng, result);
}

/** Münzpfad: Münzen auf allen Feldern, ein eingeplanter Weg ergibt genau den Zielbetrag. */
export function generateCoinPath(
  size: number,
  target: number,
  coins: readonly number[],
  seed: number,
): MazePuzzle {
  const rng = mulberry32(seed);
  const open: string[] = [];
  for (let cell = 0; cell < size * size; cell++) {
    for (const n of neighbours(size, cell)) if (n > cell) open.push(edge(cell, n));
  }
  for (let attempt = 0; attempt < 200; attempt++) {
    // kürzester Weg hat 2·size − 3 Felder dazwischen; länger geht nur in Zweierschritten (Schachbrett)
    const inner = 2 * size - 3 + 2 * Math.floor(rng() * size);
    const path = randomPath(size, inner, rng);
    if (!path) continue;
    const planted = coinsFor(path.length - 2, target, coins, rng);
    if (!planted) continue;
    const cellCoins = Array.from({ length: size * size }, () => pick(rng, coins));
    path.slice(1, -1).forEach((cell, i) => {
      cellCoins[cell] = planted[i] ?? 0;
    });
    cellCoins[0] = 0;
    cellCoins[size * size - 1] = 0;
    return {
      size,
      start: 0,
      goal: size * size - 1,
      open,
      coins: cellCoins,
      target,
      solution: path,
    };
  }
  throw new Error('Münzpfad konnte nicht erzeugt werden');
}
