import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AppStateV2, Wardrobe } from '@/domain/types';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { chestOffer } from '@/state/wardrobe';
import { renderApp } from '@/test/render-app';

// Kikos Rätselturm, Schritt 2 (docs/12 4.1): Truhe, Kleiderschrank, Nest, Kiko mit Outfit.

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const state = (lamps: number, wardrobe?: Partial<Wardrobe>) =>
  makeState({
    profiles: [
      makeProfile({
        celebrated: ['welcome:schatzinsel'],
        tower: {
          lamps,
          solved: {},
          jokes: [],
          favorites: [],
          wardrobe: { owned: [], chests: 0, kiko: {}, nest: {}, ...wardrobe },
        },
      }),
    ],
  });

describe('Kikos Kleiderschrank', () => {
  it('eine wartende Truhe im Turm öffnen und ein Teil wählen', async () => {
    const start = state(1);
    const profile = start.profiles[0];
    if (!profile) throw new Error('kein Profil');
    const [kikoOffer] = chestOffer(profile);
    const { user, storage } = renderApp('/raetsel', start);
    await user.click(screen.getByRole('button', { name: 'Eine Truhe wartet auf dich!' }));
    const box = screen.getByRole('region', { name: 'Eine Schatztruhe! Was möchtest du?' });
    const options = within(box).getAllByRole('button');
    expect(options).toHaveLength(2);
    await user.click(options[0] as HTMLElement);
    expect(saved(storage).profiles[0]?.tower?.wardrobe).toMatchObject({
      owned: [kikoOffer?.id],
      chests: 1,
    });
    expect(screen.getByText('Das andere Teil kommt später wieder.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(
      screen.queryByRole('button', { name: 'Eine Truhe wartet auf dich!' }),
    ).not.toBeInTheDocument();
  });

  it('Kiko trägt sein Outfit überall in der App', () => {
    const { container } = renderApp(
      '/',
      state(5, { owned: ['piratenhut'], kiko: { kopf: 'piratenhut' } }),
    );
    expect(container.querySelector('[data-worn="piratenhut"]')).not.toBeNull();
  });

  it('im Schrank an- und ausziehen, gesperrte Teile verraten nur die nächste Truhe', async () => {
    const { user, storage, container } = renderApp(
      '/raetsel/kiko',
      state(4, { owned: ['piratenhut', 'goldfisch'], chests: 2 }),
    );
    expect(screen.getByRole('heading', { name: 'Kikos Kleiderschrank' })).toBeInTheDocument();
    expect(screen.getAllByText('Nächste Truhe nach 4 Lampen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ein besonderes Teil!').length).toBeGreaterThan(0);

    const hat = screen.getByRole('button', { name: /Piratenhut/ });
    expect(hat).toHaveAttribute('aria-pressed', 'false');
    await user.click(hat);
    expect(hat).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText("Arrr! Käpt'n Kiko meldet sich!")).toBeInTheDocument();
    expect(saved(storage).profiles[0]?.tower?.wardrobe?.kiko).toEqual({ kopf: 'piratenhut' });
    expect(container.querySelector('[data-worn="piratenhut"]')).not.toBeNull();
    await user.click(hat);
    expect(saved(storage).profiles[0]?.tower?.wardrobe?.kiko).toEqual({});

    await user.click(screen.getByRole('button', { name: 'Überrasch mich!' }));
    expect(screen.getAllByText('Überrasch mich!').length).toBeGreaterThan(1);

    await user.click(screen.getByRole('tab', { name: 'Nest' }));
    expect(screen.getByRole('img', { name: 'Kikos Nest im Turm' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Haustier' }));
    await user.click(screen.getByRole('button', { name: /Goldfisch/ }));
    expect(saved(storage).profiles[0]?.tower?.wardrobe?.nest).toEqual({ haustier: 'goldfisch' });
  });

  it('ein leerer Schrank erklärt, wie man Truhen findet', () => {
    renderApp('/raetsel/kiko', state(0));
    expect(screen.getByText(/Löse Rätsel im Turm/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Überrasch mich!' })).not.toBeInTheDocument();
  });
});
