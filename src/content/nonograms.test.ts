import { describe, expect, it } from 'vitest';
import { clues, solveLogically } from '@/domain/nonogram';
import { NONOGRAMS } from './nonograms';

const grid = (rows: readonly string[]) => rows.map((row) => Array.from(row, (ch) => ch !== '.'));
const columns = (cells: boolean[][]) =>
  (cells[0] ?? []).map((_, c) => cells.map((row) => row[c] === true));

describe('Bilderrätsel (docs/12 3.6)', () => {
  it('IDs eindeutig, 8 Bilder 5×5, 8 Bilder 6×6, 6 Bilder 7×7', () => {
    const ids = NONOGRAMS.map((picture) => picture.id);
    expect(new Set(ids).size).toBe(ids.length);
    const sizes = NONOGRAMS.map((picture) => picture.rows.length);
    expect(sizes.filter((size) => size === 5)).toHaveLength(8);
    expect(sizes.filter((size) => size === 6)).toHaveLength(8);
    expect(sizes.filter((size) => size === 7)).toHaveLength(6);
  });

  it('quadratisch, nur Buchstaben aus der Palette, Farben sind Tokens', () => {
    for (const picture of NONOGRAMS) {
      const size = picture.rows.length;
      for (const row of picture.rows) {
        expect(row, picture.id).toHaveLength(size);
        for (const ch of row) {
          if (ch !== '.') expect(Object.keys(picture.palette), picture.id).toContain(ch);
        }
      }
      for (const color of Object.values(picture.palette)) {
        expect(color, picture.id).toMatch(/^var\(--[a-z0-9-]+\)$/);
      }
      expect(picture.name.length, picture.id).toBeGreaterThan(2);
    }
  });

  it('höchstens eine leere Zeile oder Spalte pro Bild', () => {
    for (const picture of NONOGRAMS) {
      const cells = grid(picture.rows);
      const lines = [...cells, ...columns(cells)];
      expect(lines.filter((line) => !line.includes(true)).length, picture.id).toBeLessThanOrEqual(
        1,
      );
    }
  });

  it('jedes Bild ist eindeutig und ohne Raten lösbar', () => {
    for (const picture of NONOGRAMS) {
      const cells = grid(picture.rows);
      const solved = solveLogically(cells.map(clues), columns(cells).map(clues));
      expect(solved, picture.id).toEqual(cells);
    }
  });
});
