import { describe, expect, it } from 'vitest';
import { clues, lineOptions, solveLine, solveLogically, type NonogramCell } from './nonogram';

const line = (text: string) => Array.from(text, (ch) => ch === '#');
const known = (text: string) =>
  Array.from(text, (ch): NonogramCell => (ch === '#' ? true : ch === 'x' ? false : null));
const show = (cells: readonly NonogramCell[]) =>
  cells.map((cell) => (cell === true ? '#' : cell === false ? 'x' : '?')).join('');

/** alle Zeilen der Länge n */
const allLines = (n: number) =>
  Array.from({ length: 2 ** n }, (_, bits) =>
    Array.from({ length: n }, (_, i) => ((bits >> i) & 1) === 1),
  );

describe('clues', () => {
  it('zählt Blöcke von links nach rechts', () => {
    expect(clues(line('##.#.'))).toEqual([2, 1]);
    expect(clues(line('.###.'))).toEqual([3]);
    expect(clues(line('#####'))).toEqual([5]);
    expect(clues(line('.....'))).toEqual([]);
    expect(clues([])).toEqual([]);
  });
});

describe('lineOptions', () => {
  it('findet ohne Vorwissen genau alle Zeilen mit diesen Hinweisen', () => {
    for (const n of [1, 4, 6]) {
      const lines = allLines(n);
      for (const target of lines) {
        const clue = clues(target);
        const expected = lines.filter((other) => clues(other).join() === clue.join());
        const found = lineOptions(
          clue,
          Array.from({ length: n }, () => null),
        );
        expect(found.map((o) => show(o)).sort()).toEqual(expected.map((o) => show(o)).sort());
      }
    }
  });

  it('beachtet bekannte Felder (vollständiger Vergleich für Länge 5)', () => {
    const lines = allLines(5);
    const states: NonogramCell[] = [null, true, false];
    for (let code = 0; code < 3 ** 5; code += 1) {
      const cells = Array.from(
        { length: 5 },
        (_, i): NonogramCell => states[Math.floor(code / 3 ** i) % 3] ?? null,
      );
      for (const clue of [[], [1], [2], [5], [1, 1], [2, 1], [1, 3], [1, 1, 1]]) {
        const expected = lines.filter(
          (option) =>
            clues(option).join() === clue.join() &&
            option.every((value, i) => cells[i] === null || cells[i] === value),
        );
        const found = lineOptions(clue, cells);
        expect(found.map((o) => show(o)).sort(), `${show(cells)} ${clue.join()}`).toEqual(
          expected.map((o) => show(o)).sort(),
        );
      }
    }
  });

  it('liefert nichts, wenn der Block nicht hineinpasst', () => {
    expect(lineOptions([4], [null, null, null])).toEqual([]);
  });
});

describe('solveLine', () => {
  it('Überlappung: großer Block legt die Mitte fest', () => {
    expect(show(solveLine([4], known('?????')) ?? [])).toBe('?###?');
    expect(show(solveLine([2, 2], known('?????')) ?? [])).toBe('##x##');
    expect(show(solveLine([1], known('??#??')) ?? [])).toBe('xx#xx');
    expect(show(solveLine([], known('???')) ?? [])).toBe('xxx');
    expect(show(solveLine([1], known('???')) ?? [])).toBe('???');
  });

  it('meldet einen Widerspruch mit null', () => {
    expect(solveLine([1], known('#?#'))).toBeNull();
    expect(solveLine([], known('?#?'))).toBeNull();
  });
});

describe('solveLogically', () => {
  const grid = (rows: string[]) => rows.map((row) => line(row));
  const cluesOf = (picture: boolean[][]) => ({
    rows: picture.map((row) => clues(row)),
    cols: (picture[0] ?? []).map((_, c) => clues(picture.map((row) => row[c] === true))),
  });

  it('löst ein Bild, das nur mit Zeilen- und Spaltenlogik geht', () => {
    const heart = grid(['.#.#.', '#####', '#####', '.###.', '..#..']);
    const { rows, cols } = cluesOf(heart);
    expect(solveLogically(rows, cols)).toEqual(heart);
  });

  it('löst ein Bild, das mehrere Runden braucht', () => {
    const picture = grid(['##...', '#....', '###..', '..#..', '..###']);
    const { rows, cols } = cluesOf(picture);
    expect(solveLogically(rows, cols)).toEqual(picture);
  });

  it('bleibt bei mehrdeutigen Bildern stecken', () => {
    const diagonal = grid(['#.', '.#']);
    const { rows, cols } = cluesOf(diagonal);
    expect(solveLogically(rows, cols)).toBeNull();
  });

  it('erkennt widersprüchliche Hinweise in Zeilen und in Spalten', () => {
    expect(solveLogically([[3]], [[1], [1]])).toBeNull();
    expect(solveLogically([[2], [2]], [[2], []])).toBeNull();
  });

  it('löst ein leeres Bild', () => {
    expect(solveLogically([[], []], [[], []])).toEqual(grid(['..', '..']));
  });
});
