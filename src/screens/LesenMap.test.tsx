import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildLesenReviewTasks } from '@/state/lesen-progress';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

describe('Silben-Insel (Lesen lernen)', () => {
  it('zeigt alle 8 Kapitel-Inseln und öffnet die Vokal-Bucht mit Buchstaben-Zwillingen und Silben-Werkstatt', async () => {
    const state = makeState({
      profiles: [makeProfile({ stufe: 1, celebrated: ['welcome:lesen'] })],
    });
    const { user } = renderApp('/lesen', state);

    expect(screen.getByRole('img', { name: '0 von 24 Sternen' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Station 1: A–U & M (0/3), als Nächstes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Station 2: L & S (0/3), noch im Nebel' }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Station 1: A–U & M (0/3), als Nächstes' }),
    );
    expect(screen.getByRole('heading', { name: 'Vokal-Bucht' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Silben-Werkstatt' })).toBeInTheDocument();

    // Großbuchstaben-Brücke: startet in Kapitel 1 mit GROSS (MA) und lässt sich auf Normal (Ma) umschalten
    const workshop = screen.getByRole('region', { name: 'Silben-Werkstatt' });
    const grossBtn = within(workshop).getByRole('button', { name: 'GROSS (MA)' });
    const normalBtn = within(workshop).getByRole('button', { name: 'Normal (Ma)' });
    expect(grossBtn).toHaveAttribute('aria-pressed', 'true');
    await user.click(normalBtn);
    expect(normalBtn).toHaveAttribute('aria-pressed', 'true');

    // Wechsel zum Silbenteppich
    await user.click(within(workshop).getByRole('tab', { name: 'Silbenteppich' }));
    expect(within(workshop).getByRole('button', { name: 'Silbe Ma anhören' })).toBeInTheDocument();
  });

  it('spielt eine Lese-Station (Zwillinge & Silben-Baukasten) ohne verräterische Vorlese-Knöpfe an den Optionen', async () => {
    const state = makeState({
      profiles: [
        makeProfile({
          stufe: 3, // auch bei Stufe 3 läuft Lesen sauber im Original!
          celebrated: ['welcome:lesen'],
          worlds: {
            lesen: { unlockAll: true, bonusSolved: [], stations: {} },
          },
        }),
      ],
    });
    const { user } = renderApp('/lesen/vokal-bucht', state);

    // Station 1: Buchstaben-Zwillinge -> kein „Antwort vorlesen“-Button an den Antwortkarten
    await user.click(screen.getByRole('button', { name: /Buchstaben-Zwillinge A, E, I, O, M/ }));
    await user.click(screen.getByRole('link', { name: "Los geht's!" }));

    expect(
      screen.getByRole('heading', { name: 'Welcher kleine Buchstabe passt zum großen O?' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Antwort vorlesen' })).not.toBeInTheDocument();
  });

  it('spielt den interaktiven Silben-Baukasten in Station 3 (Mama & Oma)', async () => {
    const state = makeState({
      profiles: [
        makeProfile({
          stufe: 1,
          worlds: {
            lesen: { unlockAll: true, bonusSolved: [], stations: {} },
          },
        }),
      ],
    });
    const { user } = renderApp('/station/l1-3', state);

    // Aufgabe 1: U -> u
    await user.click(screen.getByRole('button', { name: 'u' }));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    // Aufgabe 2: Silbe Ma hören
    await user.click(screen.getByRole('button', { name: 'Ma' }));
    await user.click(screen.getByRole('button', { name: 'Weiter' }));

    // Aufgabe 3: Silben-Baukasten „Mama“ (Ma + ma)
    expect(
      screen.getByRole('heading', { name: 'Setze die Silben zum Wort zusammen!' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ma' }));
    await user.click(screen.getByRole('button', { name: 'ma' }));
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText(/zusammen heißt das Wort Mama/)).toBeInTheDocument();
  });

  it('schaltet die Seite in „Mein Silbenbuch“ frei, wenn alle 3 Stationen eines Kapitels geschafft sind', () => {
    const state = makeState({
      profiles: [
        makeProfile({
          stufe: 1,
          celebrated: ['welcome:lesen'],
          worlds: {
            lesen: {
              unlockAll: false,
              bonusSolved: [],
              stations: {
                'l1-1': { completed: true, plays: 1, stufe: 1 },
                'l1-2': { completed: true, plays: 1, stufe: 1 },
                'l1-3': { completed: true, plays: 1, stufe: 1 },
              },
            },
          },
        }),
      ],
    });
    renderApp('/lesen/vokal-bucht', state);

    expect(screen.getByText('Neue Seite in „Mein Silbenbuch“!')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mama und Oma' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Weiter zu Lama-Lagune/ })).toBeInTheDocument();

    // Silbenbuch-Übersicht zeigt die freigeschaltete Geschichte
    renderApp('/schaetze/silbenbuch', state);
    expect(screen.getAllByRole('heading', { name: 'Mama und Oma' }).length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it('erzeugt in der täglichen Wiederholungs-Runde immer 6 Aufgaben aus den freigeschalteten Kapiteln', () => {
    const starter = makeProfile({ stufe: 1 });
    const round1 = buildLesenReviewTasks(starter, 42);
    expect(round1).toHaveLength(6);
    expect(round1.every((t) => t.id.includes('-l1-'))).toBe(true);

    const progressed = makeProfile({
      stufe: 1,
      worlds: {
        lesen: {
          unlockAll: false,
          bonusSolved: [],
          stations: {
            'l1-1': { completed: true, plays: 1, stufe: 1 },
            'l1-2': { completed: true, plays: 1, stufe: 1 },
            'l1-3': { completed: true, plays: 1, stufe: 1 },
          },
        },
      },
    });
    const round2 = buildLesenReviewTasks(progressed, 99);
    expect(round2).toHaveLength(6);
    // enthält sowohl Wiederholungen aus Kapitel 1 als auch Aufgaben aus Kapitel 2!
    expect(round2.some((t) => t.id.includes('-l1-'))).toBe(true);
    expect(round2.some((t) => t.id.includes('-l2-'))).toBe(true);
  });
});
