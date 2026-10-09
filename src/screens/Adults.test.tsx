import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppStateV2 } from '@/domain/types';
import { exportState, STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const state = makeState({
  activeProfileId: 'p1',
  profiles: [
    makeProfile({
      name: 'Mila',
      worlds: {
        schatzinsel: {
          stations: { muschelstrand: { completed: true, plays: 1, stufe: 3 } },
          unlockAll: false,
          bonusSolved: [],
        },
      },
      practice: { pearls: 2 },
    }),
    makeProfile({ id: 'p2', avatar: 'pinguin', stufe: 1 }),
  ],
});

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

async function openGate(user: ReturnType<typeof renderApp>['user']) {
  const label = screen.getByText(/Für Erwachsene: Wie viel ist/).textContent;
  const [, a, b] = /(\d+) × (\d+)/.exec(label) ?? [];
  await user.type(screen.getByRole('textbox'), String(Number(a) * Number(b)));
  await user.click(screen.getByRole('button', { name: 'Öffnen' }));
}

describe('Erwachsenen-Frage', () => {
  it('schützt den Bereich; eine falsche Antwort stellt eine neue Frage', async () => {
    const { user } = renderApp('/erwachsene', state);
    expect(screen.queryByRole('heading', { name: 'Kinder' })).not.toBeInTheDocument();
    const before = screen.getByText(/Für Erwachsene: Wie viel ist/).textContent;
    await user.type(screen.getByRole('textbox'), '1x');
    expect(screen.getByRole('textbox')).toHaveValue('1');
    await user.click(screen.getByRole('button', { name: 'Öffnen' }));
    expect(
      screen.getByText('Das Ergebnis passt nicht. Bitte noch einmal rechnen.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByText(/Für Erwachsene: Wie viel ist/).textContent).toBeDefined();
    expect(before).toMatch(/× \d\?$/);
    await openGate(user);
    expect(screen.getByRole('heading', { name: 'Kinder' })).toBeInTheDocument();
  });

  it('schließt sich nach 10 Minuten wieder', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { user } = renderApp('/erwachsene', state);
    await openGate(user);
    expect(screen.getByRole('heading', { name: 'Kinder' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    });
    expect(screen.queryByRole('heading', { name: 'Kinder' })).not.toBeInTheDocument();
  });
});

describe('Erwachsenen-Bereich', () => {
  it('listet die Kinder und legt ein weiteres an', async () => {
    const { user, storage } = renderApp('/erwachsene', state);
    await openGate(user);
    expect(screen.getByRole('link', { name: /Mila/ })).toHaveAttribute(
      'href',
      '/erwachsene/kind/p1',
    );
    expect(screen.getByRole('link', { name: /Pinguin/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Kind hinzufügen' }));
    await user.click(screen.getByRole('button', { name: 'Flamingo' }));
    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: 'Kind speichern' }));
    expect(saved(storage).profiles.at(-1)).toMatchObject({ avatar: 'flamingo', stufe: 4 });
    expect(screen.getByRole('link', { name: /Flamingo/ })).toBeInTheDocument();
  });

  it('lädt eine Sicherung herunter', async () => {
    const createObjectURL = vi.fn(() => 'blob:x');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const { user } = renderApp('/erwachsene', state);
    await openGate(user);
    await user.click(screen.getByRole('button', { name: 'Sicherung herunterladen' }));
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:x');
    vi.unstubAllGlobals();
  });

  it('lädt eine gültige Sicherung und lehnt kaputte Dateien ab', async () => {
    const { user, storage } = renderApp('/erwachsene', state);
    await openGate(user);
    const input = screen.getByLabelText('Sicherung laden');

    await user.upload(input, new File(['kaputt'], 'x.json', { type: 'application/json' }));
    expect(await screen.findByText(/keine gültige Sicherung/)).toBeInTheDocument();

    const other = makeState({ profiles: [makeProfile({ id: 'neu', name: 'Yusuf' })] });
    const backup = exportState(other, new Date('2026-10-09T12:00:00Z'));
    await user.upload(input, new File([backup], 'b.json', { type: 'application/json' }));
    expect(await screen.findByText('Die Sicherung wurde geladen.')).toBeInTheDocument();
    expect(saved(storage).profiles.map((p) => p.name)).toEqual(['Yusuf']);

    fireEvent.change(input, { target: { files: [] } });
  });
});

describe('Kind bearbeiten', () => {
  it('ändert Name, Tier und Stufe', async () => {
    const { user, storage } = renderApp('/erwachsene/kind/p1', state);
    await openGate(user);
    expect(screen.getByRole('heading', { name: 'Mila' })).toBeInTheDocument();
    const name = screen.getByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Lina');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Seepferdchen' }));
    await user.click(screen.getByRole('button', { name: /Oktopus/ }));
    expect(saved(storage).profiles[0]).toMatchObject({
      name: 'Lina',
      avatar: 'seepferdchen',
      stufe: 4,
    });
    expect(screen.getByRole('button', { name: /Oktopus/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('schaltet alle Stationen frei und wieder zurück', async () => {
    const { user, storage } = renderApp('/erwachsene/kind/p1', state);
    await openGate(user);
    await user.click(screen.getByRole('button', { name: 'Alle Stationen freischalten' }));
    expect(saved(storage).profiles[0]?.worlds.schatzinsel?.unlockAll).toBe(true);
    expect(screen.getByText('Alle Stationen sind freigeschaltet.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Freischaltung aufheben' }));
    expect(saved(storage).profiles[0]?.worlds.schatzinsel?.unlockAll).toBe(false);
  });

  it('setzt erst nach Bestätigung zurück', async () => {
    const { user, storage } = renderApp('/erwachsene/kind/p1', state);
    await openGate(user);
    await user.click(screen.getByRole('button', { name: 'Fortschritt zurücksetzen' }));
    expect(
      screen.getByText(
        'Wirklich alles von Mila zurücksetzen? Sterne, Fundstücke und Perlen werden gelöscht.',
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
    expect(saved(storage).profiles[0]?.practice.pearls).toBe(2);
    await user.click(screen.getByRole('button', { name: 'Fortschritt zurücksetzen' }));
    await user.click(screen.getByRole('button', { name: 'Zurücksetzen' }));
    expect(saved(storage).profiles[0]).toMatchObject({ worlds: {}, practice: { pearls: 0 } });
  });

  it('löscht ein Profil nach Bestätigung', async () => {
    const { user, storage, location } = renderApp('/erwachsene/kind/p2', state);
    await openGate(user);
    expect(screen.getByRole('heading', { name: 'Pinguin' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Profil löschen' }));
    expect(screen.getByText('Das Profil von Pinguin wirklich löschen?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Löschen' }));
    expect(saved(storage).profiles.map((p) => p.id)).toEqual(['p1']);
    expect(location.history.at(-1)).toBe('/erwachsene');
  });

  it('meldet unbekannte Kinder', async () => {
    const { user } = renderApp('/erwachsene/kind/gibt-es-nicht', state);
    await openGate(user);
    expect(screen.getByText('Dieses Kind gibt es nicht mehr.')).toBeInTheDocument();
  });

  it('die Druckseite ist ein Platzhalter hinter der Frage', async () => {
    const { user } = renderApp('/erwachsene/drucken', state);
    await openGate(user);
    expect(screen.getByRole('heading', { name: 'Drucken' })).toBeInTheDocument();
  });
});
