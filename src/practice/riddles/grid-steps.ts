import type { GridCell } from '@/domain/types';

// Rechenschritte für Tipp 2 und Lösungsweg bei Mauer und Dreieck (docs/10, Tabelle „Tipps“).
// Gleiche Propagation wie der Löser in src/domain/grid.ts, aber mit Protokoll der Schritte.

export interface Relation {
  sum: string;
  left: string;
  right: string;
}

export type Step =
  | { kind: 'sum'; cell: string; left: number; right: number; result: number }
  | { kind: 'diff'; cell: string; total: number; known: number; result: number };

/** Mauer mit `width` Steinen unten; Reihe für Reihe von unten, links nach rechts. */
export function wallRelations(width: number): Relation[] {
  const relations: Relation[] = [];
  for (let row = 1; row < width; row++) {
    for (let col = 0; col < width - row; col++) {
      relations.push({
        sum: `r${String(row)}c${String(col)}`,
        left: `r${String(row - 1)}c${String(col)}`,
        right: `r${String(row - 1)}c${String(col + 1)}`,
      });
    }
  }
  return relations;
}

export const TRIANGLE_RELATIONS: readonly Relation[] = [
  { sum: 'ab', left: 'a', right: 'b' },
  { sum: 'bc', left: 'b', right: 'c' },
  { sum: 'ca', left: 'c', right: 'a' },
];

/**
 * Schritte in der Reihenfolge, in der ein Kind die Lücken füllen kann (ohne Dreieck-Formel):
 * nach jedem Schritt wieder von unten anfangen.
 */
export function solveSteps(relations: readonly Relation[], cells: readonly GridCell[]): Step[] {
  const known = new Map<string, number>();
  for (const cell of cells) if (cell.given) known.set(cell.id, cell.value);
  const steps: Step[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const { sum, left, right } of relations) {
      const s = known.get(sum);
      const l = known.get(left);
      const r = known.get(right);
      if (s === undefined && l !== undefined && r !== undefined) {
        known.set(sum, l + r);
        steps.push({ kind: 'sum', cell: sum, left: l, right: r, result: l + r });
        changed = true;
        break;
      } else if (s !== undefined && l !== undefined && r === undefined) {
        known.set(right, s - l);
        steps.push({ kind: 'diff', cell: right, total: s, known: l, result: s - l });
        changed = true;
        break;
      } else if (s !== undefined && r !== undefined && l === undefined) {
        known.set(left, s - r);
        steps.push({ kind: 'diff', cell: left, total: s, known: r, result: s - r });
        changed = true;
        break;
      }
    }
  }
  return steps;
}

export function stepText(step: Step, fmt: (value: number) => string): string {
  return step.kind === 'sum'
    ? `${fmt(step.left)} + ${fmt(step.right)} = ${fmt(step.result)}.`
    : `${fmt(step.total)} − ${fmt(step.known)} = ${fmt(step.result)}.`;
}

/** Alle Beziehungen als Plus-Rechnungen, z. B. „4 + 3 = 7. 3 + 5 = 8. 7 + 8 = 15.“ */
export function allSums(
  relations: readonly Relation[],
  values: Readonly<Record<string, number>>,
  fmt: (value: number) => string,
): string {
  return relations
    .map(({ sum, left, right }) => {
      const v = (id: string) => fmt(values[id] ?? NaN);
      return `${v(left)} + ${v(right)} = ${v(sum)}.`;
    })
    .join(' ');
}

/** Alle k-elementigen Teilmengen (für die Auswahl der Lücken). */
export function subsetsOf<T>(items: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  return items.flatMap((item, i) =>
    subsetsOf(items.slice(i + 1), size - 1).map((rest) => [item, ...rest]),
  );
}
