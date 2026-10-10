import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WORLDS } from '@/content/worlds';
import type { AppStateV2, StationProgress } from '@/domain/types';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { answerPart } from '@/test/answer-part';
import { renderApp } from '@/test/render-app';
import { bonusTask, bonusType } from '@/practice/bonus';

const done: StationProgress = { completed: true, plays: 1, stufe: 3 };
const islandIds = WORLDS.schatzinsel.stations.map((s) => s.id);

function withDone(ids: string[], extra: Partial<Parameters<typeof makeProfile>[0]> = {}) {
  return makeState({
    profiles: [
      makeProfile({
        celebrated: ['welcome:schatzinsel'],
        worlds: {
          schatzinsel: {
            stations: Object.fromEntries(ids.map((id) => [id, done])),
            unlockAll: false,
            bonusSolved: [],
          },
        },
        ...extra,
      }),
    ],
  });
}

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

describe('Stationsabschluss', () => {
  it('zeigt Fundstück, Stern, Rückblick und die Knöpfe', () => {
    renderApp('/station/markt/geschafft', withDone(['muschelstrand', 'markt']));
    expect(screen.getByRole('heading', { name: 'Strohhut' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Die Marktfrau schenkt dir einen Strohhut. Jetzt bist du gut gegen die Sonne geschützt.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Du hast Preise zusammengerechnet.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '2 von 9 Sternen' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ein neuer Stern' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zurück zur Karte' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Nächste Station' })).toHaveAttribute(
      'href',
      '/station/kiosk',
    );
  });

  it('Finale nach der letzten Insel-Station', () => {
    renderApp('/station/schatztruhe/geschafft', withDone(islandIds));
    expect(
      screen.getByText('Du hast die geheime Schatzinsel erkundet! Ich bin so stolz auf dich.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Meine Schätze ansehen' })).toHaveAttribute(
      'href',
      '/schaetze',
    );
    expect(screen.getByRole('link', { name: 'Zur Karte' })).toHaveAttribute('href', '/');
  });

  it('Finale der Bucht', () => {
    const stations = Object.fromEntries(WORLDS['kleine-bucht'].stations.map((s) => [s.id, done]));
    renderApp(
      '/station/muscheltruhe/geschafft',
      makeState({
        profiles: [
          makeProfile({
            stufe: 1,
            worlds: { 'kleine-bucht': { stations, unlockAll: false, bonusSolved: [] } },
          }),
        ],
      }),
    );
    expect(
      screen.getByText('Du hast die kleine Bucht erkundet! Ich bin so stolz auf dich.'),
    ).toBeInTheDocument();
  });

  it('nicht geschaffte oder unbekannte Stationen und fehlende Profile führen zur Karte', () => {
    const open = renderApp('/station/kiosk/geschafft', withDone(['muschelstrand']));
    expect(open.location.history.at(-1)).toBe('/');
    open.unmount();
    const unknown = renderApp('/station/x/geschafft', withDone([]));
    expect(unknown.location.history.at(-1)).toBe('/');
    unknown.unmount();
    const none = renderApp('/station/markt/geschafft', makeState({ profiles: [] }));
    expect(none.location.history.at(-1)).toBe('/');
  });
});

describe('Bonus-Rätsel (docs/10 6)', () => {
  it('Angebot nach der Station: „Ja!“ führt zum Rätsel, „Später“ blendet es aus', async () => {
    const { user } = renderApp('/station/markt/geschafft', withDone(['muschelstrand', 'markt']));
    expect(screen.getByText('Kiko hat noch ein Bonus-Rätsel. Magst du?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ja!' })).toHaveAttribute(
      'href',
      '/station/markt/bonus',
    );
    await user.click(screen.getByRole('button', { name: 'Später' }));
    expect(screen.queryByText('Kiko hat noch ein Bonus-Rätsel. Magst du?')).not.toBeInTheDocument();
  });

  it('gelöst: Glitzerstein, gespeichert, auf der Karte markiert, kein Angebot mehr', async () => {
    const state = withDone(['muschelstrand', 'markt']);
    const profile = state.profiles[0];
    const station = WORLDS.schatzinsel.stations[1];
    if (!profile || !station) throw new Error('Testdaten fehlen');
    const task = bonusTask(station, profile);
    expect(task).not.toBeNull();
    const { user, storage, unmount } = renderApp('/station/markt/bonus', state);
    for (const part of task?.parts ?? []) await answerPart(user, part, false);
    expect(screen.getByRole('img', { name: 'Ein neuer Glitzerstein' })).toBeInTheDocument();
    expect(saved(storage).profiles[0]?.worlds.schatzinsel?.bonusSolved).toEqual(['markt']);
    unmount();

    const again = renderApp('/', saved(storage));
    await again.user.click(
      screen.getByRole('button', { name: /^Station 2: .*, geschafft, Bonus-Rätsel gelöst$/ }),
    );
    expect(
      within(screen.getByRole('dialog')).queryByRole('link', { name: 'Bonus-Rätsel' }),
    ).not.toBeInTheDocument();
    again.unmount();
    renderApp('/station/markt/geschafft', saved(storage));
    expect(screen.queryByText('Kiko hat noch ein Bonus-Rätsel. Magst du?')).not.toBeInTheDocument();
  });

  it('nicht gelöst: die Stationskarte bietet „Bonus-Rätsel“ an', async () => {
    const { user } = renderApp('/', withDone(['muschelstrand', 'markt']));
    await user.click(screen.getByRole('button', { name: /^Station 2: .*, geschafft$/ }));
    expect(
      within(screen.getByRole('dialog')).getByRole('link', { name: 'Bonus-Rätsel' }),
    ).toHaveAttribute('href', '/station/markt/bonus');
  });

  it('nach der letzten Insel-Station ist es immer das Zahlenschloss', () => {
    const profile = makeProfile();
    const last = WORLDS.schatzinsel.stations.at(-1);
    if (!last) throw new Error('Testdaten fehlen');
    expect(bonusType(last, profile)).toBe('code');
  });
});

describe('Urkunde (docs/01 5.8)', () => {
  it('zeigt dem Kind die Urkunde mit Namen, ohne Druckknopf', () => {
    renderApp('/schaetze/urkunde', withDone(islandIds, { name: 'Mila' }));
    expect(screen.getByRole('heading', { name: 'URKUNDE' })).toBeInTheDocument();
    expect(screen.getByText('Mila')).toBeInTheDocument();
    expect(screen.getByText('hat die geheime Schatzinsel erkundet!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Drucken' })).not.toBeInTheDocument();
  });
});

describe('Nebel auf der Karte', () => {
  it('zieht über neu freigeschalteten Stationen einmalig ab', () => {
    const { storage, unmount } = renderApp('/', withDone(['muschelstrand']));
    expect(saved(storage).profiles[0]?.celebrated).toContain('fog:markt');
    expect(saved(storage).profiles[0]?.celebrated).not.toContain('fog:kiosk');
    unmount();
  });
});

describe('Schätze', () => {
  it('zeigt Sterne, Fundstücke mit Fundort, Perlen und Glitzersteine', async () => {
    const state = withDone(['muschelstrand', 'markt'], { practice: { pearls: 3 } });
    const island = state.profiles[0]?.worlds.schatzinsel;
    if (island) island.bonusSolved = ['muschelstrand'];
    const { user } = renderApp('/schaetze', state);
    expect(
      within(screen.getByRole('main')).getByRole('img', { name: '2 von 9 Sternen' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Noch nicht gefunden' })).toHaveLength(7);
    expect(screen.getByText('3 Perlen')).toBeInTheDocument();
    expect(screen.getByText('Bonus-Rätsel: 1 von 9')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Meine Urkunde' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Glitzermuschel' }));
    const sheet = screen.getByRole('dialog', { name: 'Glitzermuschel' });
    expect(within(sheet).getByText('Fundort: Muschelstrand')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mit allen Sternen gibt es die Urkunde; Vorschau mit Hinweis', async () => {
    const { user } = renderApp('/schaetze', withDone(islandIds, { practice: { pearls: 1 } }));
    expect(screen.getByText('1 Perle')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Meine Urkunde' }));
    expect(screen.getByText('Frag einen Erwachsenen, ob ihr sie ausdruckt.')).toBeInTheDocument();
  });

  it('wer schon in der Bucht war, bekommt Reiter für beide Welten', async () => {
    const state = withDone(['muschelstrand']);
    const profile = state.profiles[0];
    if (profile) {
      profile.worlds['kleine-bucht'] = {
        stations: { muschelufer: { completed: true, plays: 1, stufe: 1 } },
        unlockAll: false,
        bonusSolved: [],
      };
    }
    const { user } = renderApp('/schaetze', state);
    expect(screen.getByRole('tab', { name: 'Schatzinsel' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('tab', { name: 'Kleine Bucht' }));
    expect(
      within(screen.getByRole('main')).getByRole('img', { name: '1 von 5 Sternen' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Perlmuttmuschel' })).toBeInTheDocument();
  });
});
