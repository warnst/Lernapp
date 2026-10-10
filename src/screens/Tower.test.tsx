import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AppStateV2 } from '@/domain/types';
import { buildRound } from '@/practice/round';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { answerPart } from '@/test/answer-part';
import { renderApp } from '@/test/render-app';

// Kikos Rätselturm, Schritt 1 (docs/12): Tab, Turm, „Muster & Co.“, Witzekiste, Witzebuch.

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const state = (lamps = 0) =>
  makeState({
    profiles: [
      makeProfile({
        celebrated: ['welcome:schatzinsel'],
        ...(lamps > 0 ? { tower: { lamps, solved: {}, jokes: [], favorites: [] } } : {}),
      }),
    ],
  });

describe('Rätselturm', () => {
  it('ist ein eigener Tab und zeigt, wie viele Lampen bis zur nächsten Etage fehlen', async () => {
    const { user, location } = renderApp('/', state());
    await user.click(screen.getByRole('link', { name: 'Rätsel' }));
    expect(location.history.at(-1)).toBe('/raetsel');
    expect(screen.getByRole('heading', { name: 'Kikos Rätselturm' })).toBeInTheDocument();
    expect(screen.getByText('Noch 3 Lampen bis zur nächsten Etage!')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Turm mit 0 Etagen, 0 von 3 Lampen leuchten' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Muster & Co\./ })).toBeInTheDocument();
  });

  it('Runde „Muster & Co.“: neue Lampe, neue Etage, Witz mit Auflösung, Witzebuch', async () => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      if (array instanceof Uint32Array) array[0] = 4711;
      return array;
    });
    const tasks = buildRound('raetsel', 3, 3, 4711);
    const { user, storage, unmount } = renderApp('/raetsel/muster', state(2));
    for (const task of tasks) for (const part of task.parts) await answerPart(user, part, false);
    vi.restoreAllMocks();

    expect(
      screen.getByText('Juhu, die erste Etage ist fertig! Der Turm wächst.'),
    ).toBeInTheDocument();
    expect(saved(storage).profiles[0]?.tower).toMatchObject({
      lamps: 3,
      solved: { riddles: 1 },
    });

    // zuerst die Truhe: ein Teil wählen, dann kommt die Witzekiste
    const chest = screen.getByRole('region', { name: 'Eine Schatztruhe! Was möchtest du?' });
    await user.click(within(chest).getAllByRole('button')[0] as HTMLElement);
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    const box = screen.getByRole('region', { name: 'Kikos Witzekiste' });
    expect(within(box).getByText('Was meinst du? Rate laut!')).toBeInTheDocument();
    await user.click(within(box).getByRole('button', { name: 'Auflösen!' }));
    const heard = saved(storage).profiles[0]?.tower?.jokes ?? [];
    expect(heard).toHaveLength(1);
    await user.click(within(box).getByRole('button', { name: 'Erzähl ihn weiter!' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    unmount();

    const book = renderApp('/schaetze/witze', saved(storage));
    const fav = screen.getByRole('button', { name: 'Lieblingswitz' });
    await book.user.click(fav);
    expect(saved(book.storage).profiles[0]?.tower?.favorites).toEqual(heard);
  });

  it('unbekannte Rätselarten führen zurück zum Turm', () => {
    const { location } = renderApp('/raetsel/gibt-es-nicht', state());
    expect(location.history.at(-1)).toBe('/raetsel');
  });

  it('das Witzebuch ist anfangs leer und erklärt, wie man Witze sammelt', () => {
    renderApp('/schaetze/witze', state());
    expect(screen.getByText(/Hier sammelst du Kikos Witze/)).toBeInTheDocument();
  });
});
