import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppStateV2, Stufe } from '@/domain/types';
import { mulberry32, pick } from '@/domain/random';
import { generateCoinPath, generateMaze, type MazePuzzle } from '@/practice/tower/maze';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';
import { STUFEN } from '@/config/levels';

const SEED = 31;

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const state = (stufe: Stufe) =>
  makeState({
    profiles: [makeProfile({ stufe, celebrated: ['welcome:schatzinsel', 'welcome:kleine-bucht'] })],
  });

const board = () => within(screen.getByRole('group', { name: 'Spielfeld' }));
function cell(puzzle: MazePuzzle, index: number) {
  const row = Math.floor(index / puzzle.size) + 1;
  const col = (index % puzzle.size) + 1;
  return board().getByRole('button', {
    name: new RegExp(`^Reihe ${String(row)}, Feld ${String(col)}(:|$)`),
  });
}

beforeEach(() => {
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    if (array instanceof Uint32Array) array[0] = SEED;
    return array;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Labyrinth und Münzpfad', () => {
  it('Labyrinth: Wände halten auf, Zurücktippen kürzt den Weg, an der Truhe gibt es eine Lampe', async () => {
    const maze = generateMaze(5, SEED);
    const { user, storage } = renderApp('/raetsel/labyrinth', state(1));
    expect(screen.getByText('Hilf mir zur Truhe! Tipp Feld für Feld den Weg.')).toBeInTheDocument();
    // weit weg tippen
    await user.click(cell(maze, 12));
    expect(screen.getByText('Tipp ein Feld direkt neben mir.')).toBeInTheDocument();
    // ein Nachbar hinter einer Wand
    const blocked = [1, 5].find((n) => !maze.open.includes(`0-${String(n)}`));
    if (blocked !== undefined) {
      await user.click(cell(maze, blocked));
      expect(screen.getByText('Da ist eine Wand. Probier einen anderen Weg.')).toBeInTheDocument();
    }
    // Tipp zeigt das nächste Feld
    await user.click(screen.getByRole('button', { name: 'Tipp' }));
    expect(screen.getByText('Probier dieses Feld!')).toBeInTheDocument();
    // zwei Schritte, dann zurück auf den Start tippen
    const [, a = 0, b = 0] = maze.solution;
    await user.click(cell(maze, a));
    await user.click(cell(maze, b));
    await user.click(cell(maze, 0));
    expect(cell(maze, a)).toHaveAttribute('aria-pressed', 'false');
    for (const step of maze.solution.slice(1)) await user.click(cell(maze, step));
    expect(screen.getByText('Die Truhe ist offen!')).toBeInTheDocument();
    expect(saved(storage).profiles[0]?.tower).toMatchObject({ lamps: 1, solved: { maze: 1 } });
  });

  it('Münzpfad: laufende Summe, falsche Summe an der Truhe, richtiger Weg', async () => {
    const cfg = STUFEN[3].tower.maze;
    if (cfg.mode !== 'coins') throw new Error('Stufe 3 hat Münzpfad');
    const target = pick(mulberry32(SEED), cfg.targets);
    const puzzle = generateCoinPath(cfg.size, target, cfg.coins, SEED);
    const { user } = renderApp('/raetsel/labyrinth', state(3));
    expect(screen.getByRole('heading', { name: 'Münzpfad' })).toBeInTheDocument();
    expect(screen.getByText(/^Zusammen: 0\sCent von 1\s€$/)).toBeInTheDocument();
    for (const step of puzzle.solution.slice(1)) await user.click(cell(puzzle, step));
    expect(screen.getByText('Die Truhe ist offen!')).toBeInTheDocument();
  });

  it('Münzpfad: zu viel und falsche Summe, dann „Von vorn“', async () => {
    const cfg = STUFEN[3].tower.maze;
    if (cfg.mode !== 'coins') throw new Error('Stufe 3 hat Münzpfad');
    const target = pick(mulberry32(SEED), cfg.targets);
    const puzzle = generateCoinPath(cfg.size, target, cfg.coins, SEED);
    const { user } = renderApp('/raetsel/labyrinth', state(3));
    // am Rand entlang: oben rechts, dann runter
    const edge = [1, 2, 3, 7, 11, 15];
    for (const step of edge) await user.click(cell(puzzle, step));
    const sum = edge.slice(0, -1).reduce((s, c) => s + (puzzle.coins[c] ?? 0), 0);
    if (sum !== target) {
      expect(screen.getByText(/An der Truhe sind es|Das sind schon/)).toBeInTheDocument();
    }
    await user.click(screen.getByRole('button', { name: 'Von vorn' }));
    expect(screen.getByText(/^Zusammen: 0\sCent von 1\s€$/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tipp' }));
    expect(screen.getByText('Probier dieses Feld!')).toBeInTheDocument();
  });
});
