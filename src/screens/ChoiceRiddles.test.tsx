import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STUFEN } from '@/config/levels';
import type { AppStateV2, Stufe } from '@/domain/types';
import { oddRound, quizRound, quizTask, shadowRound } from '@/practice/tower/choice-riddles';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { answerPart } from '@/test/answer-part';
import { renderApp } from '@/test/render-app';

const SEED = 12;

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const state = (stufe: Stufe, facts?: string[]) =>
  makeState({
    profiles: [
      makeProfile({
        stufe,
        celebrated: ['welcome:schatzinsel', 'welcome:kleine-bucht'],
        ...(facts ? { tower: { lamps: 0, solved: {}, jokes: [], favorites: [], facts } } : {}),
      }),
    ],
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

describe('Rätsel mit Antwortkarten im Turm', () => {
  it('Was passt nicht?: drei Rätsel, eine Lampe', async () => {
    const tasks = oddRound(STUFEN[1].tower.odd, 1, 3, SEED);
    const { user, storage } = renderApp('/raetsel/was-passt-nicht', state(1));
    for (const task of tasks) for (const part of task.parts) await answerPart(user, part, false);
    expect(saved(storage).profiles[0]?.tower).toMatchObject({ lamps: 1, solved: { odd: 1 } });
  });

  it('Schattenrätsel: drei Rätsel, eine Lampe', async () => {
    const tasks = shadowRound(STUFEN[4].tower.shadow, 3, SEED);
    const { user, storage } = renderApp('/raetsel/schatten', state(4));
    expect(screen.getByText(/Er kann auch gedreht sein/)).toBeInTheDocument();
    for (const task of tasks) for (const part of task.parts) await answerPart(user, part, false);
    expect(saved(storage).profiles[0]?.tower).toMatchObject({ lamps: 1, solved: { shadow: 1 } });
  });

  it('Wissensfragen: Thema, fünf Fragen, Karten im Wissensbuch, Doktorhut ab 20 Karten', async () => {
    const known = Array.from({ length: 16 }, (_, i) => `alt-${String(i)}`);
    const questions = quizRound(2, 'meer', known, 5, SEED);
    const { user, storage, unmount } = renderApp('/raetsel/wissensfragen', state(2, known));
    await user.click(screen.getByRole('button', { name: /Meer/ }));
    for (const q of questions) {
      for (const part of quizTask(q).parts) await answerPart(user, part, false);
    }
    const tower = saved(storage).profiles[0]?.tower;
    expect(tower).toMatchObject({ lamps: 1, solved: { quiz: 1 } });
    expect(tower?.facts).toHaveLength(21);
    expect(tower?.wardrobe?.owned).toContain('doktorhut');
    unmount();

    renderApp('/schaetze/wissen', saved(storage));
    expect(screen.getByRole('heading', { name: /Meer/ })).toBeInTheDocument();
    expect(screen.getByText(questions[0]?.fact ?? '-')).toBeInTheDocument();
  });

  it('das Wissensbuch ist anfangs leer', () => {
    renderApp('/schaetze/wissen', state(1));
    expect(screen.getByText(/Hier sammelst du Wissenskarten/)).toBeInTheDocument();
  });
});
