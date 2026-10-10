import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppStateV2 } from '@/domain/types';
import { buildRound } from '@/practice/round';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { answerPart } from '@/test/answer-part';
import { renderApp } from '@/test/render-app';

function saved(storage: Storage): AppStateV2 {
  return JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubSpeech() {
  const speak = vi.fn();
  vi.stubGlobal('speechSynthesis', {
    speaking: false,
    speak,
    cancel: vi.fn(),
    getVoices: () => [],
  });
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    },
  );
  return speak;
}

describe('Üben (docs/01 5.7)', () => {
  it('liest die Aufgabe nach der Einstellung der Eltern vor', () => {
    const speak = stubSpeech();
    const { unmount } = renderApp(
      '/ueben/spiel?thema=rueckgeld&schwer=0&anzahl=5',
      makeState({ profiles: [makeProfile({ stufe: 3, readAloud: true })] }),
    );
    expect(speak).toHaveBeenCalledOnce();
    unmount();
    renderApp(
      '/ueben/spiel?thema=mengen-zahlen&schwer=0&anzahl=5',
      makeState({ profiles: [makeProfile({ stufe: 1, readAloud: false })] }),
    );
    expect(speak).toHaveBeenCalledOnce();
  });

  it('zeigt die Themen der Stufe und startet eine Runde', async () => {
    const { user, storage, location } = renderApp(
      '/ueben',
      makeState({ profiles: [makeProfile()] }),
    );
    expect(screen.getByRole('heading', { name: 'Was möchtest du üben?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rückgeld/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mengen und Zahlen/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Rückgeld/ }));
    await user.click(screen.getByRole('button', { name: 'Etwas leichter' }));
    await user.click(screen.getByRole('button', { name: '10' }));
    await user.click(screen.getByRole('button', { name: "Los geht's!" }));
    expect(location.history.at(-1)).toBe('/ueben/spiel?thema=rueckgeld&schwer=-1&anzahl=10');
    expect(saved(storage).profiles[0]?.practice.last).toEqual({
      topic: 'rueckgeld',
      shift: -1,
      count: 10,
    });
    expect(screen.getByRole('list', { name: 'Aufgabe 1 von 10' })).toBeInTheDocument();
  });

  it('„Mehr davon üben“ wählt das Thema der Station vor, sonst den Ersatz', () => {
    const { unmount } = renderApp(
      '/ueben?thema=knobeln',
      makeState({ profiles: [makeProfile({ stufe: 2 })] }),
    );
    expect(screen.getByRole('button', { name: /Geschichten/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    unmount();
    renderApp('/ueben?thema=reicht-das-geld', makeState({ profiles: [makeProfile()] }));
    expect(screen.getByRole('button', { name: /Reicht das Geld\?/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('Stufe 1: kurze Namen; „Etwas leichter“ gibt es nicht', () => {
    renderApp('/ueben', makeState({ profiles: [makeProfile({ stufe: 1 })] }));
    expect(screen.getByRole('button', { name: /Zählen/ })).toBeInTheDocument();
    const easier = screen.getByRole('button', { name: /Etwas leichter/ });
    expect(easier).toBeDisabled();
    expect(within(easier).getByText('Gibt es hier nicht')).toBeInTheDocument();
  });

  it('ohne gültige Parameter geht es zurück zur Auswahl', () => {
    const { location } = renderApp(
      '/ueben/spiel?thema=gibt-es-nicht',
      makeState({ profiles: [makeProfile()] }),
    );
    expect(location.history.at(-1)).toBe('/ueben');
  });
});

describe('Übungsrunde', () => {
  it('Rückgeld, etwas leichter, 5 Aufgaben → Rundenabschluss → Perle in den Schätzen', async () => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      if (array instanceof Uint32Array) array[0] = 4711;
      return array;
    });
    const tasks = buildRound('rueckgeld', 2, 5, 4711);
    const { user, storage } = renderApp(
      '/ueben/spiel?thema=rueckgeld&schwer=-1&anzahl=5',
      makeState({ profiles: [makeProfile()] }),
    );
    for (const task of tasks) for (const part of task.parts) await answerPart(user, part, false);
    expect(
      screen.getByText('Runde geschafft! Eine neue Perle für deine Kette.'),
    ).toBeInTheDocument();
    expect(saved(storage).profiles[0]?.practice.pearls).toBe(1);
    await user.click(screen.getByRole('button', { name: 'Noch eine Runde' }));
    expect(screen.getByRole('list', { name: 'Aufgabe 1 von 5' })).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it.each([
    ['uhrzeit', 1],
    ['uhrzeit', 4],
    ['plus-minus', 1],
    ['verdoppeln', 2],
    ['zahlenreihe', 3],
    ['kalender', 3],
    ['formen', 2],
  ] as const)('Thema ohne Geld: %s auf Stufe %i lässt sich ganz spielen', async (topic, stufe) => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      if (array instanceof Uint32Array) array[0] = 99;
      return array;
    });
    const tasks = buildRound(topic, stufe, 5, 99);
    expect(tasks).toHaveLength(5);
    const { user, storage } = renderApp(
      `/ueben/spiel?thema=${topic}&schwer=0&anzahl=5`,
      makeState({
        profiles: [
          makeProfile({ stufe, celebrated: ['welcome:kleine-bucht', 'welcome:schatzinsel'] }),
        ],
      }),
    );
    for (const task of tasks)
      for (const part of task.parts) await answerPart(user, part, stufe === 1);
    expect(saved(storage).profiles[0]?.practice.pearls).toBe(1);
    vi.restoreAllMocks();
  });
});
