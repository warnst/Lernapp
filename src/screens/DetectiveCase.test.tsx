import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CASES } from '@/content/cases';
import { hashSeed } from '@/domain/random';
import type { AppStateV2, Stufe } from '@/domain/types';
import { buildRound } from '@/practice/round';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { answerPart } from '@/test/answer-part';
import { renderApp } from '@/test/render-app';

const SEED = 4242;

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const state = (stufe: Stufe) =>
  makeState({ profiles: [makeProfile({ stufe, celebrated: ['welcome:schatzinsel'] })] });

beforeEach(() => {
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    if (array instanceof Uint32Array) array[0] = SEED;
    return array;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Detektivfall', () => {
  it('Stufe 2: Akte, drei Rätsel, Hinweise entlasten, falscher Tipp ist kein Fehler, Detektivhut', async () => {
    const detective = CASES[0];
    if (!detective) throw new Error('keine Fälle');
    const culprit = detective.suspects.find((s) => s.id === detective.culprit);
    const { user, storage, unmount } = renderApp('/raetsel/detektivfall', state(2));
    expect(screen.getByText('Welchen Fall lösen wir, Partner?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: new RegExp(detective.title) }));
    expect(screen.getByText(detective.intro)).toBeInTheDocument();
    // Stufe 2: drei Verdächtige, drei leere Zettel
    expect(screen.getAllByLabelText('Hier fehlt noch ein Hinweis.')).toHaveLength(3);

    for (let step = 0; step < 3; step++) {
      await user.click(screen.getByRole('button', { name: 'Nächstes Rätsel lösen' }));
      const [task] = buildRound('raetsel', 2, 1, hashSeed(SEED, step));
      if (!task) throw new Error('kein Rätsel');
      for (const part of task.parts) await answerPart(user, part, false);
      expect(
        screen.getAllByText(new RegExp(detective.clues[step]?.short ?? '-')).length,
      ).toBeGreaterThan(0);
      if (step === 0) {
        // Fall gespeichert: nach dem Neuladen geht es weiter
        expect(saved(storage).profiles[0]?.tower?.caseSave).toMatchObject({
          caseId: detective.id,
          solved: 1,
        });
      }
    }
    expect(screen.getByText('Ich weiß es! Wer war es?')).toBeInTheDocument();
    const innocent = detective.suspects.slice(0, 3).find((s) => s.id !== detective.culprit);
    if (!innocent || !culprit) throw new Error('Verdächtige fehlen');
    await user.click(screen.getByRole('button', { name: new RegExp(`^${innocent.name}`) }));
    expect(screen.getByText(/Hmm, schau mal:/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: new RegExp(`^${culprit.name}`) }));
    expect(screen.getByText(detective.resolution)).toBeInTheDocument();
    expect(screen.getByText(/Detektivhut und die Lupe/)).toBeInTheDocument();
    const tower = saved(storage).profiles[0]?.tower;
    expect(tower).toMatchObject({ lamps: 1, cases: [detective.id], solved: { case: 1 } });
    expect(tower?.caseSave).toBeUndefined();
    expect(tower?.wardrobe?.owned).toEqual(['detektivhut', 'lupe']);
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(screen.getByText('Fall gelöst! Toll ermittelt, Partner!')).toBeInTheDocument();
    unmount();

    renderApp('/raetsel/detektivfall', saved(storage));
    expect(screen.getByText(detective.bookLine, { exact: false })).toBeInTheDocument();
  });

  it('ein angefangener Fall wartet', async () => {
    const detective = CASES[1];
    if (!detective) throw new Error('keine Fälle');
    const start = state(3);
    const profile = start.profiles[0];
    if (!profile) throw new Error('kein Profil');
    profile.tower = {
      lamps: 0,
      solved: {},
      jokes: [],
      favorites: [],
      caseSave: { caseId: detective.id, solved: 2, seed: 5 },
    };
    const { user } = renderApp('/raetsel/detektivfall', start);
    await user.click(screen.getByRole('button', { name: `Weiterermitteln: ${detective.title}` }));
    expect(screen.getAllByLabelText('Hier fehlt noch ein Hinweis.')).toHaveLength(2);
    expect(screen.getAllByText('Entlastet').length).toBeGreaterThan(0);
  });
});
