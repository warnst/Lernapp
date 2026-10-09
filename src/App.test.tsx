import { act, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

afterEach(() => {
  vi.useRealTimers();
});

function savedState(storage: Storage) {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as ReturnType<typeof makeState>;
}

describe('Ersteinrichtung und „Wer spielt?“ (Abnahme Phase 3)', () => {
  it('legt zwei Kinder an; Stufe 1 spielt in der Bucht, Stufe 3 auf der Insel', async () => {
    const { user, storage } = renderApp('/');
    expect(screen.getByText(/Richten wir kurz ein, wer spielt/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Kind anlegen' }));

    const save = screen.getByRole('button', { name: 'Kind speichern' });
    expect(save).toBeDisabled();
    await user.type(screen.getByLabelText('Name (optional)'), 'Mila');
    await user.click(screen.getByRole('button', { name: 'Robbe' }));
    await user.click(screen.getByRole('button', { name: '5' }));
    expect(
      screen.getByText('Wir empfehlen die Stufe Muschel. Sie können das jederzeit ändern.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Was bedeuten die Stufen?' }));
    expect(screen.getByText(/etwa 8 Jahre/)).toBeInTheDocument();
    await user.click(save);
    expect(screen.getByText('Mila ist angelegt.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Noch ein Kind hinzufügen' }));
    await user.click(screen.getByRole('button', { name: 'Pinguin' }));
    await user.click(screen.getByRole('button', { name: '7' }));
    await user.click(screen.getByRole('button', { name: 'Kind speichern' }));
    expect(screen.getByText('Pinguin ist angelegt.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fertig' }));

    expect(screen.getByRole('heading', { name: 'Wer spielt?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mila' }));
    expect(screen.getByRole('button', { name: /Station 1: Das Muschelufer/ })).toBeInTheDocument();
    expect(
      screen.getByText('Hallo! Ich bin Kiko. Komm mit in die kleine Bucht!'),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '0 von 5 Sternen' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Wer spielt\? \(Mila\)/ }));
    await user.click(screen.getByRole('button', { name: 'Pinguin' }));
    expect(screen.getByRole('button', { name: /Station 1: Muschelstrand/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '0 von 9 Sternen' })).toBeInTheDocument();

    const saved = savedState(storage);
    expect(saved.setupDone).toBe(true);
    expect(saved.profiles.map((p) => [p.name, p.avatar, p.stufe])).toEqual([
      ['Mila', 'robbe', 1],
      [undefined, 'pinguin', 3],
    ]);
  });

  it('mit nur einem Kind geht es nach „Fertig“ direkt zur Karte', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Kind anlegen' }));
    await user.click(screen.getByRole('button', { name: 'Delfin' }));
    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(screen.getByRole('button', { name: 'Kind speichern' }));
    await user.click(screen.getByRole('button', { name: 'Fertig' }));
    expect(screen.getByRole('button', { name: /Weiter: Muschelstrand/ })).toBeInTheDocument();
  });

  it('nach dem Neuladen ist alles noch da', () => {
    const state = makeState({ activeProfileId: 'p1', profiles: [makeProfile({ name: 'Ben' })] });
    renderApp('/', state);
    expect(
      screen.getByText('Hallo! Ich bin Kiko. Ich kenne eine geheime Schatzinsel. Kommst du mit?'),
    ).toBeInTheDocument();
  });

  it('ohne Einrichtung leiten Kinderseiten zur Startseite um', () => {
    const { location } = renderApp('/schaetze');
    expect(location.history.at(-1)).toBe('/');
    expect(screen.getByText(/Richten wir kurz ein/)).toBeInTheDocument();
  });

  it('mehrere Kinder ohne aktives Kind führen zu „Wer spielt?“', () => {
    const state = makeState({
      profiles: [makeProfile(), makeProfile({ id: 'p2', avatar: 'pinguin' })],
    });
    renderApp('/', state);
    expect(screen.getByRole('heading', { name: 'Wer spielt?' })).toBeInTheDocument();
  });
});

describe('Karte', () => {
  const twoDone = makeProfile({
    name: 'Ida',
    celebrated: ['welcome:schatzinsel'],
    worlds: {
      schatzinsel: {
        stations: {
          muschelstrand: { completed: true, plays: 1, stufe: 3 },
          markt: { completed: true, plays: 1, stufe: 3 },
        },
        unlockAll: false,
        bonusSolved: [],
      },
    },
    resume: { world: 'schatzinsel', stationId: 'kiosk', taskIndex: 1, partIndex: 0, seed: 1 },
  });

  it('begrüßt mit Namen, zeigt Sterne und blendet die Begrüßung nach 4 Sekunden aus', () => {
    vi.useFakeTimers();
    renderApp('/', makeState({ profiles: [twoDone] }));
    expect(screen.getByText("Hallo Ida! Wohin geht's heute?")).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '2 von 9 Sternen' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Station 1: Muschelstrand, geschafft' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Station 3: Kokos-Kiosk, als Nächstes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Station 4: Die geheimnisvolle Geldbörse, noch im Nebel',
      }),
    ).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4100);
    });
    expect(screen.queryByText("Hallo Ida! Wohin geht's heute?")).not.toBeInTheDocument();
  });

  it('ohne Namen grüßt Kiko das Tier', () => {
    renderApp(
      '/',
      makeState({
        profiles: [makeProfile({ avatar: 'schildkroete', celebrated: ['welcome:schatzinsel'] })],
      }),
    );
    expect(screen.getByText("Hallo, kleine Schildkröte! Wohin geht's heute?")).toBeInTheDocument();
  });

  it('gesperrte Stationen zeigen den Nebel-Hinweis', async () => {
    const { user } = renderApp('/', makeState({ profiles: [twoDone] }));
    await user.click(screen.getByRole('button', { name: /Station 4/ }));
    expect(
      screen.getByText('Der Weg ist noch im Nebel. Schaffe zuerst die Station davor!'),
    ).toBeInTheDocument();
  });

  it('Weiter öffnet die Stationskarte; Escape schließt sie', async () => {
    const { user } = renderApp('/', makeState({ profiles: [twoDone] }));
    await user.click(screen.getByRole('button', { name: /Weiter: Kokos-Kiosk/ }));
    const sheet = screen.getByRole('dialog', { name: 'Station 3 · Kokos-Kiosk' });
    expect(within(sheet).getByText('etwa 7 Minuten')).toBeInTheDocument();
    expect(within(sheet).getByText('Hier übst du: Rückgeld berechnen')).toBeInTheDocument();
    expect(within(sheet).getByRole('link', { name: 'Weiterspielen' })).toHaveAttribute(
      'href',
      '/station/kiosk',
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('geschaffte Stationen bieten „Noch einmal spielen“ und „Mehr davon üben“', async () => {
    const { user } = renderApp('/', makeState({ profiles: [twoDone] }));
    await user.click(screen.getByRole('button', { name: /Station 2: Markt/ }));
    const sheet = screen.getByRole('dialog');
    expect(within(sheet).getByRole('link', { name: 'Noch einmal spielen' })).toBeInTheDocument();
    expect(within(sheet).getByRole('link', { name: 'Mehr davon üben' })).toHaveAttribute(
      'href',
      '/ueben?thema=preise-addieren',
    );
    await user.click(within(sheet).getByRole('button', { name: 'Schließen' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('nach der letzten Station heißt der Knopf „Schatz ansehen“', () => {
    const stations = Object.fromEntries(
      ['muschelufer', 'muenzquelle', 'kikos-laden', 'kruemels-wippe', 'muscheltruhe'].map((id) => [
        id,
        { completed: true, plays: 1, stufe: 1 as const },
      ]),
    );
    renderApp(
      '/',
      makeState({
        profiles: [
          makeProfile({
            stufe: 1,
            worlds: { 'kleine-bucht': { stations, unlockAll: false, bonusSolved: [] } },
          }),
        ],
      }),
    );
    expect(screen.getByRole('link', { name: 'Schatz ansehen' })).toHaveAttribute(
      'href',
      '/schaetze',
    );
  });

  it('die Navigation führt zu Üben und Schätzen', async () => {
    const { user } = renderApp('/', makeState({ profiles: [makeProfile({ stufe: 2 })] }));
    await user.click(screen.getByRole('link', { name: 'Üben' }));
    expect(screen.getByRole('heading', { name: 'Üben' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Üben' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('link', { name: 'Schätze' }));
    expect(screen.getByRole('heading', { name: 'Schätze' })).toBeInTheDocument();
  });

  it('Platzhalter für Spiel-Routen führen zurück zur Karte', () => {
    renderApp('/station/muschelstrand', makeState({ profiles: [makeProfile()] }));
    expect(screen.getByText('Hier wird noch gebaut.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zur Karte' })).toHaveAttribute('href', '/');
  });
});
