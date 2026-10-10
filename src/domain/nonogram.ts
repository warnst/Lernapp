// Nonogramm-Logik (docs/12 3.6): Hinweise einer Zeile, Zeilenlogik und ein Löser ohne Raten.
// Ein Feld ist true (ausgemalt), false (sicher leer) oder null (noch unbekannt).

export type NonogramCell = boolean | null;

/** Hinweise einer Zeile: Längen der ausgemalten Blöcke von links nach rechts, leere Zeile → []. */
export function clues(line: readonly boolean[]): number[] {
  const result: number[] = [];
  let run = 0;
  for (const filled of line) {
    if (filled) {
      run += 1;
    } else if (run > 0) {
      result.push(run);
      run = 0;
    }
  }
  if (run > 0) result.push(run);
  return result;
}

/** Eine Zeile beim Lösen; undefined zählt wie unbekannt. */
type KnownLine = readonly (NonogramCell | undefined)[];

/** Alle vollständigen Belegungen einer Zeile, die zu den Hinweisen und den bekannten Feldern passen. */
export function lineOptions(clue: readonly number[], known: KnownLine): boolean[][] {
  const length = known.length;
  const options: boolean[][] = [];
  // passt, solange das Feld unbekannt ist oder schon den gewünschten Wert hat
  const fits = (index: number, filled: boolean) => known[index] !== !filled;

  const place = (block: number, start: number, prefix: boolean[]) => {
    const size = clue[block];
    if (size === undefined) {
      for (let i = start; i < length; i += 1) {
        if (!fits(i, false)) return;
      }
      options.push([...prefix, ...Array.from({ length: length - start }, () => false)]);
      return;
    }
    const rest = clue.slice(block + 1).reduce((sum, value) => sum + value + 1, 0);
    for (let at = start; at + size + rest <= length; at += 1) {
      // Alles vor dem Block ist leer: Ist dort ein ausgemaltes Feld, geht es nicht weiter nach rechts.
      if (at > start && !fits(at - 1, false)) return;
      const end = at + size;
      const hasGap = end < length;
      let ok = !hasGap || fits(end, false);
      for (let i = at; i < end; i += 1) {
        if (!fits(i, true)) ok = false;
      }
      if (ok) {
        const line = [
          ...prefix,
          ...Array.from({ length: at - start }, () => false),
          ...Array.from({ length: size }, () => true),
        ];
        if (hasGap) line.push(false);
        place(block + 1, line.length, line);
      }
    }
  };

  place(0, 0, []);
  return options;
}

/**
 * Zeilenlogik: Schnittmenge aller passenden Belegungen. Felder, die in allen gleich sind, werden
 * gesetzt, der Rest bleibt null. Gibt es keine passende Belegung, ist das Ergebnis null.
 */
export function solveLine(clue: readonly number[], known: KnownLine): NonogramCell[] | null {
  const options = lineOptions(clue, known);
  const [first, ...others] = options;
  if (!first) return null;
  return first.map((value, i): NonogramCell =>
    others.every((option) => option[i] === value) ? value : null,
  );
}

/**
 * Löst ein Nonogramm nur mit wiederholter Zeilen- und Spaltenlogik (ohne Raten).
 * Ergebnis: das fertige Bild oder null, wenn die Logik stecken bleibt oder ein Widerspruch entsteht.
 */
export function solveLogically(
  rowClues: readonly (readonly number[])[],
  colClues: readonly (readonly number[])[],
): boolean[][] | null {
  const rows = rowClues.map((clue) => ({
    clue,
    cells: colClues.map((): NonogramCell => null),
  }));
  let progress = true;
  // trägt ein neu erkanntes Feld ein und merkt sich den Fortschritt
  const settle = (cells: NonogramCell[], index: number, value: NonogramCell | undefined) => {
    if (typeof value === 'boolean' && cells[index] === null) {
      cells[index] = value;
      progress = true;
    }
  };

  while (progress) {
    progress = false;
    for (const row of rows) {
      const solved = solveLine(row.clue, row.cells);
      if (!solved) return null;
      solved.forEach((value, c) => {
        settle(row.cells, c, value);
      });
    }
    for (const [c, clue] of colClues.entries()) {
      const solved = solveLine(
        clue,
        rows.map((row) => row.cells[c]),
      );
      if (!solved) return null;
      rows.forEach((row, r) => {
        settle(row.cells, c, solved[r]);
      });
    }
  }

  if (rows.some((row) => row.cells.includes(null))) return null;
  return rows.map((row) => row.cells.map((cell) => cell === true));
}
