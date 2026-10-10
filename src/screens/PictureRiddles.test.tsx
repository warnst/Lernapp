import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STUFEN } from '@/config/levels';
import { DOTS } from '@/content/dots';
import { NONOGRAMS } from '@/content/nonograms';
import { mulberry32, pick } from '@/domain/random';
import type { AppStateV2, Stufe } from '@/domain/types';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

const SEED = 5;

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const state = (stufe: Stufe) =>
  makeState({
    profiles: [makeProfile({ stufe, celebrated: ['welcome:schatzinsel', 'welcome:kleine-bucht'] })],
  });

beforeEach(() => {
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    if (array instanceof Uint32Array) array[0] = SEED;
    return array;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Bilderrätsel', () => {
  it('ausmalen, Punkt, Tipp, am Ende erscheint das Bild', async () => {
    const sizes = STUFEN[3].tower.nonogram.sizes;
    const picture = pick(
      mulberry32(SEED),
      NONOGRAMS.filter((p) => sizes.includes(p.rows.length)),
    );
    const { user, storage } = renderApp('/raetsel/bilderraetsel', state(3));
    const cell = (r: number, c: number) =>
      screen.getByRole('button', {
        name: new RegExp(`^Reihe ${String(r + 1)}, Spalte ${String(c + 1)}:`),
      });

    // ein leeres Feld: ausmalen (zu viel), Tipp zeigt es, zweimal tippen macht einen Punkt
    const emptyRow = picture.rows.findIndex((row) => row.includes('.'));
    const emptyCol = picture.rows[emptyRow]?.indexOf('.') ?? 0;
    await user.click(cell(emptyRow, emptyCol));
    expect(cell(emptyRow, emptyCol)).toHaveAccessibleName(/ausgemalt$/);
    await user.click(screen.getByRole('button', { name: 'Tipp' }));
    expect(screen.getByText(/Ein Kästchen ist zu viel ausgemalt/)).toBeInTheDocument();
    await user.click(cell(emptyRow, emptyCol));
    expect(cell(emptyRow, emptyCol)).toHaveAccessibleName(/Punkt$/);
    await user.click(screen.getByRole('button', { name: 'Tipp' }));
    expect(screen.getByText('Schau, dieses Kästchen gehört zum Bild.')).toBeInTheDocument();

    for (const [r, row] of picture.rows.entries()) {
      for (const [c, char] of Array.from(row).entries()) {
        if (char !== '.') await user.click(cell(r, c));
      }
    }
    expect(screen.getByText(`Ein Bild ist erschienen: ${picture.name}!`)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(saved(storage).profiles[0]?.tower).toMatchObject({ lamps: 1, solved: { nonogram: 1 } });
  });
});

describe('Punkte verbinden', () => {
  it('in der Nähe tippen verbindet, daneben wackelt nur der nächste Punkt', async () => {
    const rng = mulberry32(SEED);
    const variant = pick(rng, STUFEN[1].tower.dots);
    const picture = pick(
      rng,
      DOTS.filter((p) => p.points.length === variant.count),
    );
    vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    } as DOMRect);
    const { user, storage } = renderApp('/raetsel/punkte', state(1));
    expect(
      screen.getByText('Verbinde die Punkte der Reihe nach. Fang bei 1 an!'),
    ).toBeInTheDocument();
    const board = screen.getByRole('group', { name: 'Punktebild' });
    // weit weg vom ersten Punkt
    const [fx = 0, fy = 0] = picture.points[0] ?? [];
    fireEvent.click(board, { clientX: fx > 50 ? 5 : 95, clientY: fy > 50 ? 5 : 95 });
    expect(screen.getByText('Weiter mit 1!')).toBeInTheDocument();
    // alle Punkte bis auf den letzten per Tipp, den letzten mit der Tastatur
    for (const [x, y] of picture.points.slice(0, -1))
      fireEvent.click(board, { clientX: x + 2, clientY: y - 2 });
    const last = screen.getByRole('button', { name: `Punkt ${String(picture.points.length)}` });
    fireEvent.keyDown(last, { key: 'Enter' });
    expect(screen.getByText(`Ein Bild ist erschienen: ${picture.name}!`)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(saved(storage).profiles[0]?.tower).toMatchObject({ lamps: 1, solved: { dots: 1 } });
  });
});
