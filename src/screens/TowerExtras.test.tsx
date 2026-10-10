import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UI } from '@/content/ui';
import type { AppStateV2 } from '@/domain/types';
import { dailyType } from '@/state/daily';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

// Rätselpass, Rätsel des Tages, neue besondere Teile (docs/12 4).

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

const profile = makeProfile({
  stufe: 3,
  celebrated: ['welcome:schatzinsel'],
  tower: {
    lamps: 12,
    solved: { sudoku: 10, memory: 2 },
    jokes: [],
    favorites: [],
    wardrobe: { owned: ['zauberhut'], chests: 0, kiko: {}, nest: {}, fresh: ['zauberhut'] },
  },
});
const state = makeState({ profiles: [profile] });

describe('Rätselturm-Extras', () => {
  it('Rätsel des Tages und Hinweis auf neue Teile; im Schrank gelten sie als gesehen', async () => {
    const { user, storage } = renderApp('/raetsel', state);
    const daily = dailyType(profile, new Date());
    expect(screen.getByText(UI.pass.daily(UI.pass.phrases[daily]))).toBeInTheDocument();
    expect(screen.getByText('Rätsel des Tages')).toBeInTheDocument();
    expect(screen.getByText('Neu in Kikos Kleiderschrank: Zauberhut!')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Ansehen' }));
    expect(screen.getByRole('heading', { name: 'Kikos Kleiderschrank' })).toBeInTheDocument();
    expect(saved(storage).profiles[0]?.tower?.wardrobe).not.toHaveProperty('fresh');
  });

  it('Rätselpass: goldener Stempel, Stempel, noch leer', () => {
    renderApp('/schaetze', state);
    expect(screen.getByLabelText('Sudoku: goldener Stempel, 10 gelöst')).toBeInTheDocument();
    expect(screen.getByLabelText('Memory: Stempel, 2 gelöst')).toBeInTheDocument();
    expect(screen.getByLabelText('Geheimschrift: noch kein Stempel')).toBeInTheDocument();
  });
});
