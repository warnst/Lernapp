import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AppStateV2 } from '@/domain/types';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

type User = ReturnType<typeof renderApp>['user'];

const island = makeState({ profiles: [makeProfile({ celebrated: ['welcome:schatzinsel'] })] });
const islandAll = makeState({
  profiles: [
    makeProfile({ worlds: { schatzinsel: { stations: {}, unlockAll: true, bonusSolved: [] } } }),
  ],
});
const bay = makeState({
  profiles: [
    makeProfile({
      stufe: 1,
      worlds: { 'kleine-bucht': { stations: {}, unlockAll: true, bonusSolved: [] } },
    }),
  ],
});

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

function firstOf(elements: HTMLElement[]): HTMLElement {
  const [element] = elements;
  if (!element) throw new Error('Element fehlt');
  return element;
}

/** Beträge stehen mit geschütztem Leerzeichen da: „70 Cent“. */
function amount(text: string): RegExp {
  return new RegExp(`^${text.replace(' ', '\\s')}$`);
}

function sheet() {
  return screen.getByRole('region', { name: 'Kiko sagt' });
}

async function next(user: User) {
  await user.click(within(sheet()).getByRole('button', { name: 'Weiter' }));
}

async function check(user: User, label = 'Prüfen') {
  await user.click(screen.getByRole('button', { name: label }));
}

async function lay(user: User, coins: string[]) {
  const palette = screen.getByRole('group', { name: 'Münzen zum Hinlegen' });
  for (const coin of coins) await user.click(within(palette).getByRole('button', { name: coin }));
}

async function money(user: User, euro: string, cent = '') {
  for (const digit of euro) await user.click(screen.getByRole('button', { name: digit }));
  if (cent !== '') {
    await user.click(screen.getByRole('button', { name: 'Zum Cent-Feld' }));
    for (const digit of cent) await user.click(screen.getByRole('button', { name: digit }));
  }
}

async function order(user: User, labels: string[]) {
  for (const label of labels) await user.click(screen.getByRole('button', { name: label }));
}

describe('Insel-Station 1 komplett', () => {
  it('mit Fehlversuch, Tipp, Lösungsweg und Abschluss', async () => {
    const { user, storage, location } = renderApp('/station/muschelstrand', island);

    // 1.1 choice: erst nicht richtig, dann richtig
    expect(
      screen.getByRole('heading', { name: 'Wie viel Geld ist das zusammen?' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: amount('70 Cent') }));
    expect(
      within(sheet()).getByText('Es liegen zwei 20-Cent-Münzen da. Hast du beide mitgezählt?'),
    ).toBeInTheDocument();
    await user.click(within(sheet()).getByRole('button', { name: 'Nochmal versuchen' }));
    expect(screen.getByRole('button', { name: /70\sCent/ })).toBeDisabled();
    expect(screen.getByText('probiert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: amount('90 Cent') }));
    expect(
      within(sheet()).getByText('Toll! Du hast mit der größten Münze angefangen.'),
    ).toBeInTheDocument();
    expect(
      within(sheet()).getByText(/So geht's: 50 Cent \+ 20 Cent \+ 20 Cent = 90 Cent\./),
    ).toBeInTheDocument();
    await next(user);

    // 1.2 pay: Tipp öffnen, dann 2 × 50 Cent
    await user.click(screen.getByRole('button', { name: 'Tipp' }));
    expect(within(sheet()).getByText(/1 Euro sind 100 Cent\. Wie viele Cent/)).toBeInTheDocument();
    await user.click(within(sheet()).getByRole('button', { name: 'Nochmal versuchen' }));
    expect(screen.getByRole('button', { name: 'Prüfen' })).toBeDisabled();
    await lay(user, ['50-Cent-Münze', '50-Cent-Münze']);
    expect(screen.getByText(/Auf dem Tablett: 1\s€/)).toBeInTheDocument();
    await check(user);
    await next(user);

    // 1.3 bags
    await user.click(screen.getByRole('button', { name: 'Anker-Beutel' }));
    await next(user);

    // 1.4 money: Fehlerhinweis, dann richtig
    await money(user, '4', '60');
    expect(screen.getByText(/Deine Antwort: 4,60\s€/)).toBeInTheDocument();
    await check(user);
    expect(
      within(sheet()).getByText(
        'Zähle die Euro noch einmal: eine 2-Euro-Münze und eine 1-Euro-Münze.',
      ),
    ).toBeInTheDocument();
    await user.click(within(sheet()).getByRole('button', { name: 'Nochmal versuchen' }));
    await user.click(screen.getByRole('button', { name: 'Euro: 4' }));
    await user.click(screen.getByRole('button', { name: 'Löschen' }));
    await money(user, '3');
    await check(user);
    await next(user);

    // 1.5 order
    await order(user, ['5 Cent', '10 Cent', '50 Cent', '1 Euro']);
    await check(user);
    await next(user);

    expect(location.history.at(-1)).toBe('/station/muschelstrand/geschafft');
    const profile = saved(storage).profiles[0];
    expect(profile?.worlds.schatzinsel?.stations.muschelstrand).toMatchObject({
      completed: true,
      plays: 1,
      stufe: 3,
    });
    expect(profile?.stats['s1-t1-a']).toEqual({ wrong: 1, hints: 0, stufe: 3 });
    expect(profile?.stats['s1-t2-a']).toEqual({ wrong: 0, hints: 1, stufe: 3 });
    expect(profile).not.toHaveProperty('resume');
  });

  it('drei Fehlversuche führen zum Lösungsweg und „Jetzt ich!“', async () => {
    const { user } = renderApp('/station/muschelstrand', island);
    for (const label of ['70 Cent', '72 Cent']) {
      await user.click(screen.getByRole('button', { name: amount(label) }));
      await user.click(within(sheet()).getByRole('button', { name: 'Nochmal versuchen' }));
    }
    expect(screen.getByRole('button', { name: "So geht's" })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: "So geht's" }));
    expect(within(sheet()).getByText('50 Cent + 20 Cent + 20 Cent = 90 Cent.')).toBeInTheDocument();
  });
});

describe('Insel-Station 4 komplett', () => {
  it('pay-variants, minimal (partial), bags, zweiteilig', async () => {
    const { user, storage } = renderApp('/station/geldboerse', islandAll);

    await money(user, '2', '90');
    await check(user);
    await next(user);

    // 4.2 zwei verschiedene Arten für 1 €
    await lay(user, ['50-Cent-Münze', '50-Cent-Münze']);
    await check(user, 'Diese Möglichkeit merken');
    await next(user);
    expect(screen.getByText('1. Möglichkeit')).toBeInTheDocument();
    await lay(user, ['50-Cent-Münze', '50-Cent-Münze']);
    await check(user, 'Diese Möglichkeit merken');
    expect(
      within(sheet()).getByText('Diese Möglichkeit hast du schon. Findest du eine andere?'),
    ).toBeInTheDocument();
    await user.click(within(sheet()).getByRole('button', { name: 'Nochmal versuchen' }));
    const tray = screen.getByRole('group', { name: /Tablett/ });
    await user.click(firstOf(within(tray).getAllByRole('button', { name: '50-Cent-Münze' })));
    await lay(user, ['20-Cent-Münze', '20-Cent-Münze', '10-Cent-Münze']);
    await check(user, 'Diese Möglichkeit merken');
    await next(user);

    // 4.3 minimal: erst zu viele Münzen
    await lay(user, ['50-Cent-Münze', '10-Cent-Münze', '10-Cent-Münze', '5-Cent-Münze']);
    await check(user);
    expect(
      within(sheet()).getByText('Richtig, das sind 75 Cent! Geht es auch mit weniger Münzen?'),
    ).toBeInTheDocument();
    await user.click(within(sheet()).getByRole('button', { name: 'Nochmal versuchen' }));
    const tray2 = screen.getByRole('group', { name: /Tablett/ });
    await user.click(firstOf(within(tray2).getAllByRole('button', { name: '10-Cent-Münze' })));
    await user.click(within(tray2).getByRole('button', { name: '10-Cent-Münze' }));
    await lay(user, ['20-Cent-Münze']);
    await check(user);
    await next(user);

    // 4.4 bags
    await user.click(screen.getByRole('button', { name: 'Geldbörse 2' }));
    await next(user);

    // 4.5 a) und b)
    await money(user, '1', '40');
    await check(user);
    await next(user);
    expect(screen.getByText(/1,40\s€/)).toBeInTheDocument();
    await money(user, '1', '60');
    await check(user);
    await next(user);

    expect(saved(storage).profiles[0]?.worlds.schatzinsel?.stations.geldboerse?.completed).toBe(
      true,
    );
  });
});

describe('Bucht-Stationen 1 und 3 komplett', () => {
  it('Station 1: Zählen mit Zahlenstrahl und Häufchen ordnen', async () => {
    const { user, storage } = renderApp('/station/muschelufer', bay);
    await user.click(screen.getByRole('button', { name: '4' }));
    await next(user);
    // Zählhilfe: Seestern antippen markiert ihn
    const first = firstOf(screen.getAllByRole('button', { name: 'Zählen: 1' }));
    await user.click(first);
    expect(first).toHaveAttribute('aria-pressed', 'true');
    await user.click(
      within(screen.getByRole('group', { name: 'Deine Zahl' })).getByRole('button', { name: '7' }),
    );
    await check(user);
    await next(user);
    await user.click(screen.getByRole('button', { name: 'Eimer mit Fisch' }));
    await next(user);
    await user.click(
      within(screen.getByRole('group', { name: 'Deine Zahl' })).getByRole('button', { name: '5' }),
    );
    await check(user);
    await next(user);
    await order(user, ['2 Muscheln', '4 Muscheln', '6 Muscheln']);
    await check(user);
    await next(user);
    expect(
      saved(storage).profiles[0]?.worlds['kleine-bucht']?.stations.muschelufer?.completed,
    ).toBe(true);
  });

  it('Station 3: Münzen legen, genau eine Münze, ja/nein, zweiteilig', async () => {
    const { user, storage } = renderApp('/station/kikos-laden', bay);
    await lay(user, ['2-Cent-Münze', '1-Cent-Münze']);
    await check(user);
    await next(user);
    await lay(user, ['2-Cent-Münze', '2-Cent-Münze', '1-Cent-Münze']);
    await check(user);
    expect(within(sheet()).getByText('Es muss genau eine Münze sein.')).toBeInTheDocument();
    await user.click(within(sheet()).getByRole('button', { name: 'Nochmal versuchen' }));
    for (let i = 0; i < 3; i++) {
      const tray = screen.getByRole('group', { name: /Tablett/ });
      await user.click(firstOf(within(tray).getAllByRole('button')));
    }
    expect(screen.getByText('Tippe unten auf eine Münze')).toBeInTheDocument();
    await lay(user, ['5-Cent-Münze']);
    await check(user);
    await next(user);
    await user.click(screen.getByRole('button', { name: amount('5 Cent') }));
    await next(user);
    await user.click(screen.getByRole('button', { name: 'Ja' }));
    await next(user);
    await user.click(screen.getByRole('button', { name: 'Nein' }));
    await next(user);
    await user.click(
      within(screen.getByRole('group', { name: 'Deine Zahl' })).getByRole('button', { name: '1' }),
    );
    await check(user);
    await next(user);
    expect(
      saved(storage).profiles[0]?.worlds['kleine-bucht']?.stations['kikos-laden']?.completed,
    ).toBe(true);
  });
});

describe('Pause, Fortsetzen, Schutz', () => {
  it('merkt sich die Stelle und setzt nach dem Neuladen dort fort', async () => {
    const { user, storage, unmount } = renderApp('/station/muschelstrand', island);
    await user.click(screen.getByRole('button', { name: amount('90 Cent') }));
    await next(user);
    expect(saved(storage).profiles[0]?.resume).toMatchObject({
      stationId: 'muschelstrand',
      taskIndex: 1,
      partIndex: 0,
    });
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByText('Pause machen? Ich merke mir, wo wir waren.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Weiterspielen' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('button', { name: 'Zur Karte' }));
    expect(screen.getByRole('button', { name: /Station 1: Muschelstrand/ })).toBeInTheDocument();
    const state = saved(storage);
    unmount();

    renderApp('/station/muschelstrand', state);
    expect(
      screen.getByRole('heading', { name: 'Lege genau 1 € mit den Münzen auf Kikos Tablett.' }),
    ).toBeInTheDocument();
  });

  it('die Zurück-Taste öffnet die Pause', async () => {
    renderApp('/station/muschelstrand', island);
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(
      await screen.findByText('Pause machen? Ich merke mir, wo wir waren.'),
    ).toBeInTheDocument();
  });

  it('gesperrte oder unbekannte Stationen und fehlende Profile führen zur Karte', () => {
    const locked = renderApp('/station/kiosk', island);
    expect(locked.location.history.at(-1)).toBe('/');
    locked.unmount();
    const unknown = renderApp('/station/gibt-es-nicht', island);
    expect(unknown.location.history.at(-1)).toBe('/');
    unknown.unmount();
    const none = renderApp('/station/muschelstrand', makeState({ profiles: [] }));
    expect(none.location.history.at(-1)).toBe('/');
  });
});
