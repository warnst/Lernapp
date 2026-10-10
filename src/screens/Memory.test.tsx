import { act, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STUFEN } from '@/config/levels';
import type { AppStateV2 } from '@/domain/types';
import { memoryDeck } from '@/practice/tower/memory';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

const SEED = 99;

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const state = makeState({
  activeProfileId: 'p1',
  profiles: [
    makeProfile({ name: 'Mila', stufe: 1, celebrated: ['welcome:kleine-bucht'] }),
    makeProfile({ id: 'p2', name: 'Ben', avatar: 'pinguin', stufe: 3 }),
  ],
});

beforeEach(() => {
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    if (array instanceof Uint32Array) array[0] = SEED;
    return array;
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const cards = () =>
  within(screen.getByRole('group', { name: 'Memory-Karten' })).getAllByRole('button');

describe('Memory', () => {
  it('allein: falsche Karten drehen sich zurück, alle Paare geben eine Lampe', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const deck = memoryDeck(STUFEN[1].tower.memory, SEED);
    const { user, storage } = renderApp('/raetsel/memory', state);
    await user.click(screen.getByRole('button', { name: /Allein/ }));
    expect(cards()).toHaveLength(12);

    // zwei verschiedene Karten
    const first = deck[0];
    const other = deck.find((c) => c.pair !== first?.pair);
    if (!first || !other) throw new Error('Deck zu klein');
    await user.click(cards()[first.id] as HTMLElement);
    await user.click(cards()[other.id] as HTMLElement);
    expect(cards()[first.id]).toHaveAccessibleName(/^Karte 1: /);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    expect(cards()[first.id]).toHaveAccessibleName('Karte 1, verdeckt');
    expect(screen.getByText('Kein Paar. Merk dir die Karten!')).toBeInTheDocument();

    for (let pair = 0; pair < 6; pair++) {
      for (const card of deck.filter((c) => c.pair === pair)) {
        await user.click(cards()[card.id] as HTMLElement);
      }
    }
    expect(screen.getByText('Super, alle Paare gefunden!')).toBeInTheDocument();
    expect(saved(storage).profiles[0]?.tower).toMatchObject({ lamps: 1, solved: { memory: 1 } });
  });

  it('zu zweit: abwechselnd, ohne Gewinner, gemeinsamer Schatz', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const deck = memoryDeck(STUFEN[1].tower.memory, SEED);
    const { user } = renderApp('/raetsel/memory', state);
    await user.click(screen.getByRole('button', { name: /Zu zweit/ }));
    await user.click(screen.getByRole('button', { name: /Ben/ }));
    expect(screen.getByText('Mila ist dran.')).toBeInTheDocument();

    const first = deck[0];
    const other = deck.find((c) => c.pair !== first?.pair);
    if (!first || !other) throw new Error('Deck zu klein');
    await user.click(cards()[first.id] as HTMLElement);
    await user.click(cards()[other.id] as HTMLElement);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    expect(screen.getAllByText('Ben ist dran.').length).toBeGreaterThan(0);

    for (const card of deck.filter((c) => c.pair === 0)) {
      await user.click(cards()[card.id] as HTMLElement);
    }
    expect(screen.getByText('Euer gemeinsamer Schatz: 1 Paar')).toBeInTheDocument();
    expect(screen.getByText('Ein Paar! Du darfst noch einmal.')).toBeInTheDocument();
    for (let pair = 1; pair < 6; pair++) {
      for (const card of deck.filter((c) => c.pair === pair)) {
        await user.click(cards()[card.id] as HTMLElement);
      }
    }
    expect(screen.getByText('Ihr habt alle Paare gefunden!')).toBeInTheDocument();
  });

  it('zu zweit mit einem Erwachsenen', async () => {
    const { user } = renderApp('/raetsel/memory', state);
    await user.click(screen.getByRole('button', { name: /Zu zweit/ }));
    await user.click(screen.getByRole('button', { name: /Mit einem Erwachsenen/ }));
    expect(screen.getByText('Mila ist dran.')).toBeInTheDocument();
  });
});
