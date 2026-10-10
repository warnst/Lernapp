import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STUFEN } from '@/config/levels';
import { UI } from '@/content/ui';
import type { AppStateV2, Stufe, SudokuKind } from '@/domain/types';
import { generateSudoku } from '@/practice/tower/sudoku';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

// Kikos Rätselturm, Schritt 3 (docs/12 3.1, 5): Sudoku wählen, spielen, prüfen, Tipps, Speichern.

const SEED = 4711;

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const state = (stufe: Stufe) =>
  makeState({ profiles: [makeProfile({ stufe, celebrated: ['welcome:schatzinsel'] })] });

function puzzleFor(kind: SudokuKind, stufe: Stufe, stars: 1 | 2 | 3) {
  const empties = STUFEN[stufe].tower.sudoku.kinds.find((k) => k.kind === kind)?.empties ?? [];
  return generateSudoku(kind, empties[stars - 1] ?? 0, SEED);
}

/** offene Felder mit ihrer Nummer im Gitter */
function openCells(size: number) {
  return screen.queryAllByRole('button', { name: /^Reihe \d, Feld \d: / }).map((button) => {
    const [, row, col] =
      /^Reihe (\d), Feld (\d)/.exec(button.getAttribute('aria-label') ?? '') ?? [];
    return { button, index: (Number(row) - 1) * size + Number(col) - 1 };
  });
}

const pad = () => within(screen.getByRole('group', { name: 'Auswahl' }));
const LABELS = ['Muschel', 'Stern', 'Fisch', 'Krebs'];

beforeEach(() => {
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    if (array instanceof Uint32Array) array[0] = SEED;
    return array;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Sudoku im Rätselturm', () => {
  it('Bilder-Sudoku ohne Lesen: Feld antippen, Bild wählen, prüfen, Lampe', async () => {
    const puzzle = puzzleFor('bilder', 1, 1);
    const { user, storage } = renderApp('/raetsel/sudoku', state(1));
    // Stufe 1 hat nur eine Art, also gleich die Sterne
    expect(screen.queryByText('Welches Sudoku?')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'leicht, 1 Stern' }));
    expect(screen.getByText('Tipp hier und such ein Bild aus!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prüfen' })).toBeDisabled();

    // ohne Feld: Kiko erklärt, was zu tun ist
    await user.click(pad().getByRole('button', { name: 'Muschel' }));
    expect(screen.getByText('Tippe zuerst ein leeres Feld an.')).toBeInTheDocument();

    // alle Felder richtig bis auf das erste
    const cells = openCells(4);
    expect(cells).toHaveLength(4);
    for (const [n, { button, index }] of cells.entries()) {
      const right = puzzle.solution[index] ?? 1;
      const value = n === 0 ? (right % 4) + 1 : right;
      await user.click(button);
      await user.click(pad().getByRole('button', { name: LABELS[value - 1] ?? '' }));
    }
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText(UI.sudoku.partly)).toBeInTheDocument();
    expect(saved(storage).profiles[0]?.tower?.sudoku?.locked).toHaveLength(3);
    expect(openCells(4)).toHaveLength(1);

    // das falsche Feld ist noch offen und lässt sich ändern
    const [last] = openCells(4);
    if (!last) throw new Error('kein offenes Feld');
    await user.click(last.button);
    await user.click(
      pad().getByRole('button', { name: LABELS[(puzzle.solution[last.index] ?? 1) - 1] ?? '' }),
    );
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));

    expect(screen.getByText(/Du hast nicht aufgegeben!|Das war knifflig/)).toBeInTheDocument();
    expect(saved(storage).profiles[0]?.tower).toMatchObject({ lamps: 1, solved: { sudoku: 1 } });
    expect(saved(storage).profiles[0]?.tower?.sudoku).toBeUndefined();
  });

  it('Speichern, Weiterspielen, Notizen, Radiergummi und Neues Rätsel', async () => {
    const puzzle = puzzleFor('zahlen4', 3, 2);
    const first = renderApp('/raetsel/sudoku', state(3));
    await first.user.click(screen.getByRole('button', { name: 'Zahlen' }));
    await first.user.click(screen.getByRole('button', { name: 'mittel, 2 Sterne' }));
    const [a, b] = openCells(4);
    if (!a || !b) throw new Error('zu wenig Felder');
    await first.user.click(a.button);
    await first.user.click(pad().getByRole('button', { name: '3' }));
    await first.user.click(b.button);
    await first.user.click(screen.getByRole('button', { name: 'Notizen' }));
    await first.user.click(pad().getByRole('button', { name: '2' }));
    await first.user.click(pad().getByRole('button', { name: '4' }));
    await first.user.click(pad().getByRole('button', { name: '4' }));
    const save = saved(first.storage).profiles[0]?.tower?.sudoku;
    expect(save).toMatchObject({ kind: 'zahlen4', stars: 2, seed: SEED });
    expect(save?.entries[a.index]).toBe(3);
    expect(save?.notes[b.index]).toBe(0b10);
    expect(puzzle.givens[a.index]).toBe(0);
    first.unmount();

    const second = renderApp('/raetsel/sudoku', saved(first.storage));
    expect(screen.getByText('Dein Sudoku wartet auf dich!')).toBeInTheDocument();
    await second.user.click(screen.getByRole('button', { name: 'Weiterspielen' }));
    const cell = screen.getByRole('button', { name: /: 3$/ });
    await second.user.click(cell);
    await second.user.click(screen.getByRole('button', { name: 'Radiergummi' }));
    expect(saved(second.storage).profiles[0]?.tower?.sudoku?.entries[a.index]).toBe(0);

    await second.user.click(screen.getByRole('button', { name: 'Neues Rätsel' }));
    expect(saved(second.storage).profiles[0]?.tower?.sudoku).toBeUndefined();
    expect(screen.getByText('Welches Sudoku?')).toBeInTheDocument();
  });

  it('Tipps: erst die Regel, dann ein sicheres Feld, dann die Lösung', async () => {
    const { user, storage } = renderApp('/raetsel/sudoku', state(4));
    await user.click(screen.getByRole('button', { name: 'Rechen-Sudoku' }));
    await user.click(screen.getByRole('button', { name: 'knifflig, 3 Sterne' }));
    expect(screen.getAllByLabelText(/^Summe \d+$/).length).toBeGreaterThan(3);

    await user.click(screen.getByRole('button', { name: 'Tipp' }));
    expect(screen.getByText(/Die kleine Zahl in der Ecke ist die Summe/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: "So geht's" })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tipp' }));
    expect(
      screen.getByText(/fehlt nur noch|Was fehlt noch|nur in dieses Feld|passt nur noch eins/),
    ).toBeInTheDocument();
    expect(
      openCells(4).filter(({ button }) => button.getAttribute('aria-pressed') === 'true'),
    ).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: "So geht's" }));
    expect(screen.getByText(UI.sudoku.solution)).toBeInTheDocument();
    expect(openCells(4)).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(saved(storage).profiles[0]?.tower).toMatchObject({ lamps: 1, solved: { sudoku: 1 } });
    expect(screen.getByRole('button', { name: 'Noch eins' })).toBeInTheDocument();
  });

  it('ein kniffliges Sudoku ohne Hilfe bekommt eigenes Lob', async () => {
    const puzzle = puzzleFor('zahlen6', 4, 3);
    const { user } = renderApp('/raetsel/sudoku', state(4));
    await user.click(screen.getByRole('button', { name: 'knifflig, 3 Sterne' }));
    for (const { button, index } of openCells(6)) {
      await user.click(button);
      await user.click(pad().getByRole('button', { name: String(puzzle.solution[index]) }));
    }
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText('Wow, das war ein kniffliges!')).toBeInTheDocument();
  });
});
