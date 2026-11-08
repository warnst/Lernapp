import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

describe('Zahlenblöcke-Welt im Zahlenland', () => {
  it('zeigt alle 10 Zahlenblöcke in der Übersicht und navigiert zu Zahlenblock Eins', async () => {
    const state = makeState({
      profiles: [makeProfile({ stufe: 1, celebrated: ['welcome:zahlenbloecke'] })],
    });
    const { user } = renderApp('/zahlenbloecke', state);

    expect(screen.getByRole('img', { name: '0 von 30 Sternen' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Station 1: Eins (1) (0/3), als Nächstes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Station 2: Zwei (2) (0/3), noch im Nebel' }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Station 1: Eins (1) (0/3), als Nächstes' }),
    );
    expect(screen.getByRole('heading', { name: 'Zahlenblock Eins' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eins und der Zauberspiegel/ })).toBeInTheDocument();
  });

  it('schaltet die Zahlenblock-Freundeskarte frei, sobald alle 3 Stationen geschafft sind', () => {
    const state = makeState({
      profiles: [
        makeProfile({
          stufe: 2,
          celebrated: ['welcome:zahlenbloecke'],
          worlds: {
            zahlenbloecke: {
              unlockAll: false,
              bonusSolved: [],
              stations: {
                'nb-eins-s1': { completed: true, plays: 1, stufe: 2 },
                'nb-eins-s2': { completed: true, plays: 1, stufe: 2 },
                'nb-eins-s3': { completed: true, plays: 1, stufe: 2 },
              },
            },
          },
        }),
      ],
    });
    renderApp('/zahlenbloecke/eins', state);

    expect(screen.getByText('Zahlenblock-Freundeskarte freigeschaltet!')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Freundeskarte: Zahlenblock 1' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Weiter zu Zahlenblock Zwei/ })).toBeInTheDocument();
  });

  it('zeigt bei Block 10 die großen Zehner bis 100 und spielt die visuelle Zahlenblock-Szene', async () => {
    const state = makeState({
      profiles: [
        makeProfile({
          stufe: 1,
          worlds: {
            zahlenbloecke: { unlockAll: true, bonusSolved: [], stations: {} },
          },
        }),
      ],
    });
    const { user } = renderApp('/zahlenbloecke/zehn', state);

    const showcase = screen.getByRole('region', { name: 'Die großen Zehner bis 100' });
    expect(within(showcase).getByRole('button', { name: '100' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Zehner-Raketen bis 100/ }));
    await user.click(screen.getByRole('link', { name: "Los geht's!" }));

    expect(screen.getByRole('img', { name: /Zahlenblöcke: 10 \+ 10/ })).toBeInTheDocument();
    expect(screen.getByText('Zwei Zehner zusammen: 10 + 10 = ?')).toBeInTheDocument();
  });
});
