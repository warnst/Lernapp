import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

describe('Kosmos-Welt und Planeten', () => {
  it('zeigt alle 8 Planeten in der Übersicht und navigiert zum Mond', async () => {
    const state = makeState({
      profiles: [makeProfile({ stufe: 1, celebrated: ['welcome:kosmos'] })],
    });
    const { user } = renderApp('/kosmos', state);

    expect(screen.getByRole('img', { name: '0 von 24 Sternen' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Station 1: Mond (0/3), als Nächstes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Station 2: Merkur (0/3), noch im Nebel' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Station 1: Mond (0/3), als Nächstes' }));
    expect(screen.getByRole('heading', { name: 'Der Mond' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Krater-Sprünge/ })).toBeInTheDocument();
  });

  it('schaltet die Planeten-Wissenskarte frei, sobald alle 3 Stationen geschafft sind', () => {
    const state = makeState({
      profiles: [
        makeProfile({
          stufe: 2,
          celebrated: ['welcome:kosmos'],
          worlds: {
            kosmos: {
              unlockAll: false,
              bonusSolved: [],
              stations: {
                'k1-s1': { completed: true, plays: 1, stufe: 2 },
                'k1-s2': { completed: true, plays: 1, stufe: 2 },
                'k1-s3': { completed: true, plays: 1, stufe: 2 },
              },
            },
          },
        }),
      ],
    });
    renderApp('/kosmos/mond', state);

    expect(screen.getByText('Planeten-Wissenskarte freigeschaltet!')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Wissen vom Mond' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Weiter zu Merkur/ })).toBeInTheDocument();
  });

  it('rendert ein Zahlenhaus mit kindgerechter Erklärung für leere Felder', async () => {
    const state = makeState({
      profiles: [
        makeProfile({
          stufe: 1,
          worlds: {
            kosmos: { unlockAll: true, bonusSolved: [], stations: {} },
          },
        }),
      ],
    });
    const { user } = renderApp('/station/k1-s2', state);

    const house = screen.getByRole('group', { name: 'Zahlenhaus' });
    expect(house).toBeInTheDocument();

    const emptyCells = within(house).getAllByRole('button', { name: /Leeres Feld/ });
    expect(emptyCells.length).toBeGreaterThan(0);
    const firstCell = emptyCells[0];
    if (!firstCell) throw new Error('Leeres Feld fehlt');
    await user.click(firstCell);

    expect(screen.getByText(/Im Dach steht/)).toBeInTheDocument();
  });
});
