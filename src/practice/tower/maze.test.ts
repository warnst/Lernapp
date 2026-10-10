import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import type { Stufe } from '@/domain/types';
import { canStep, countSolutions, generateCoinPath, generateMaze, nextHint, pathSum } from './maze';

describe('Labyrinth', () => {
  for (const size of [5, 6]) {
    it(`${String(size)}×${String(size)}: genau ein Weg, der Weg ist begehbar`, () => {
      for (let seed = 1; seed <= 300; seed++) {
        const maze = generateMaze(size, seed);
        expect(maze.open).toHaveLength(size * size - 1);
        expect(countSolutions(maze)).toBe(1);
        const { solution } = maze;
        expect(solution[0]).toBe(0);
        expect(solution[solution.length - 1]).toBe(size * size - 1);
        for (let i = 1; i < solution.length; i++) {
          expect(canStep(maze, solution[i - 1] ?? 0, solution[i] ?? 0)).toBe(true);
        }
      }
    });
  }

  it('Tipp: nächstes Feld, bei Sackgasse zurück', () => {
    const maze = generateMaze(5, 7);
    expect(nextHint(maze, [0])).toEqual({ cell: maze.solution[1], back: 0 });
    // ein Abzweig weg vom Lösungsweg
    const off = maze.open
      .map((e) => e.split('-').map(Number))
      .find(([a, b]) => a === maze.solution[1] && b !== maze.solution[2] && b !== 0);
    if (off?.[1] !== undefined) {
      const hint = nextHint(maze, [0, maze.solution[1] ?? 0, off[1]]);
      expect(hint).toEqual({ cell: maze.solution[2], back: 1 });
    }
    expect(nextHint(maze, maze.solution)).toBeNull();
  });
});

describe('Münzpfad', () => {
  for (const stufe of [3, 4] as Stufe[]) {
    const cfg = STUFEN[stufe].tower.maze;
    if (cfg.mode !== 'coins') continue;
    for (const target of cfg.targets) {
      it(`Stufe ${String(stufe)}, Ziel ${String(target)} Cent: mindestens ein passender Weg`, () => {
        for (let seed = 1; seed <= 300; seed++) {
          const puzzle = generateCoinPath(cfg.size, target, cfg.coins, seed);
          expect(pathSum(puzzle, puzzle.solution)).toBe(target);
          expect(countSolutions(puzzle, 1)).toBe(1);
          expect(puzzle.coins[0]).toBe(0);
          expect(puzzle.coins[puzzle.goal]).toBe(0);
          for (const coin of puzzle.coins.slice(1, -1)) expect(cfg.coins).toContain(coin);
        }
      });
    }
  }

  it('Tipp führt zu einem passenden Weg', () => {
    const puzzle = generateCoinPath(4, 100, [10, 20, 50], 3);
    const path = [0];
    for (let guard = 0; guard < 20 && path[path.length - 1] !== puzzle.goal; guard++) {
      const hint = nextHint(puzzle, path);
      if (!hint) break;
      path.splice(path.length - hint.back);
      path.push(hint.cell);
    }
    expect(path[path.length - 1]).toBe(puzzle.goal);
    expect(pathSum(puzzle, path)).toBe(100);
  });
});
