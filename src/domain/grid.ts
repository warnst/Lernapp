import type { GridAnswer } from './types';

// Löser für Zahlenmauer und Rechendreieck (docs/10, Abschnitt 5): füllt per Propagation auf.

type GridShape = GridAnswer['shape'];

/** Eine Summen-Beziehung: sum = left + right. */
interface Relation {
  sum: string;
  left: string;
  right: string;
}

const WALL_ID = /^r(\d+)c(\d+)$/;
const TRIANGLE_IDS = ['a', 'b', 'c', 'ab', 'bc', 'ca'];

/** Bausteine der Mauer: Jeder Stein ist die Summe der zwei Steine darunter. */
function wallRelations(ids: readonly string[]): Relation[] {
  const width = ids.filter((id) => id.startsWith('r0c')).length;
  const expected = new Set<string>();
  const relations: Relation[] = [];
  for (let row = 0; row < width; row++) {
    for (let col = 0; col < width - row; col++) {
      expected.add(`r${String(row)}c${String(col)}`);
      if (row > 0) {
        relations.push({
          sum: `r${String(row)}c${String(col)}`,
          left: `r${String(row - 1)}c${String(col)}`,
          right: `r${String(row - 1)}c${String(col + 1)}`,
        });
      }
    }
  }
  const complete =
    width >= 2 &&
    ids.length === expected.size &&
    ids.every((id) => WALL_ID.test(id) && expected.has(id));
  if (!complete) throw new Error(`Keine vollständige Zahlenmauer: ${ids.join(', ')}`);
  return relations;
}

function triangleRelations(ids: readonly string[]): Relation[] {
  const complete =
    ids.length === TRIANGLE_IDS.length && TRIANGLE_IDS.every((id) => ids.includes(id));
  if (!complete) throw new Error(`Kein vollständiges Rechendreieck: ${ids.join(', ')}`);
  return [
    { sum: 'ab', left: 'a', right: 'b' },
    { sum: 'bc', left: 'b', right: 'c' },
    { sum: 'ca', left: 'c', right: 'a' },
  ];
}

/** Zahlenhaus: Jede Etage ergibt zusammen die Dachzahl (r{row}l + r{row}r = dach). */
function houseRelations(ids: readonly string[]): Relation[] {
  const floors = (ids.length - 1) / 2;
  const expected = new Set<string>(['dach']);
  const relations: Relation[] = [];
  for (let row = 0; row < floors; row++) {
    const left = `r${String(row)}l`;
    const right = `r${String(row)}r`;
    expected.add(left);
    expected.add(right);
    relations.push({ sum: 'dach', left, right });
  }
  const complete =
    floors >= 1 &&
    Number.isInteger(floors) &&
    ids.length === expected.size &&
    ids.every((id) => expected.has(id));
  if (!complete) throw new Error(`Kein vollständiges Zahlenhaus: ${ids.join(', ')}`);
  return relations;
}

/** Rechendreieck: innen aus den drei Außenzahlen, z. B. a = (ab + ca − bc) / 2. */
function solveTriangleInside(values: Map<string, number>): boolean | null {
  const ab = values.get('ab');
  const bc = values.get('bc');
  const ca = values.get('ca');
  if (ab === undefined || bc === undefined || ca === undefined || values.has('a')) return false;
  const doubled: [string, number][] = [
    ['a', ab + ca - bc],
    ['b', ab + bc - ca],
    ['c', bc + ca - ab],
  ];
  for (const [id, twice] of doubled) {
    if (twice < 0 || twice % 2 !== 0) return null;
    values.set(id, twice / 2);
  }
  return true;
}

/**
 * Füllt alle Felder eindeutig aus den gegebenen Werten.
 * Liefert alle Werte oder null, wenn etwas offen bleibt oder sich widerspricht
 * (z. B. negative oder halbe Zahlen).
 */
export function solveGrid(
  shape: GridShape,
  cells: readonly { id: string; value?: number }[],
): Record<string, number> | null {
  const ids = cells.map((cell) => cell.id);
  const relations =
    shape === 'wall'
      ? wallRelations(ids)
      : shape === 'house'
        ? houseRelations(ids)
        : triangleRelations(ids);
  const values = new Map<string, number>();
  for (const cell of cells) {
    if (cell.value !== undefined) values.set(cell.id, cell.value);
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const { sum, left, right } of relations) {
      const s = values.get(sum);
      const l = values.get(left);
      const r = values.get(right);
      if (s !== undefined && l !== undefined && r !== undefined) {
        if (s !== l + r) return null;
      } else if (l !== undefined && r !== undefined) {
        values.set(sum, l + r);
        changed = true;
      } else if (s !== undefined && l !== undefined) {
        if (s - l < 0) return null;
        values.set(right, s - l);
        changed = true;
      } else if (s !== undefined && r !== undefined) {
        if (s - r < 0) return null;
        values.set(left, s - r);
        changed = true;
      }
    }
    if (!changed && shape === 'triangle') {
      const inside = solveTriangleInside(values);
      if (inside === null) return null;
      changed = inside;
    }
  }

  if (values.size !== ids.length) return null;
  return Object.fromEntries(values);
}
