import { createElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppStateProvider } from './app-state';
import { useAppState } from './context';
import { mergeProfiles, mergeStates, pullCloudState, pushCloudState } from './sync';
import { makeProfile, makeState, memoryStorage } from './test-helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('mergeProfiles', () => {
  it('behält den jeweils weiteren Fortschritt aus beiden Ständen', () => {
    const base = makeProfile({
      id: 'p1',
      name: 'Mila',
      avatar: 'robbe',
      stufe: 2,
      createdAt: '2026-10-01T10:00:00Z',
      worlds: {
        schatzinsel: {
          stations: {
            muschelstrand: { completed: true, completedAt: '2026-10-01', plays: 1, stufe: 2 },
            markt: { completed: false, plays: 0, stufe: 2 },
          },
          unlockAll: false,
          bonusSolved: ['muschelstrand'],
        },
      },
      resume: { world: 'schatzinsel', stationId: 'markt', taskIndex: 1, partIndex: 0, seed: 0 },
      practice: { pearls: 3, last: { topic: 'rueckgeld', shift: 0, count: 5 } },
      celebrated: ['welcome:schatzinsel'],
      stats: { 's1-t1-a': { wrong: 1, hints: 0, stufe: 2 } },
      tower: {
        lamps: 2,
        solved: { riddles: 2 },
        jokes: ['j1'],
        favorites: ['j1'],
        wardrobe: { owned: ['piratenhut'], chests: 1, kiko: { kopf: 'piratenhut' }, nest: {} },
        facts: ['f1'],
        cases: ['c1'],
        caseSave: { caseId: 'c2', solved: 1, seed: 7 },
      },
    });

    const incoming = makeProfile({
      id: 'p1',
      name: 'Mila',
      avatar: 'delfin',
      stufe: 3,
      readAloud: true,
      createdAt: '2026-10-02T10:00:00Z',
      worlds: {
        schatzinsel: {
          stations: {
            muschelstrand: { completed: true, completedAt: '2026-10-02', plays: 2, stufe: 3 },
            markt: { completed: true, completedAt: '2026-10-03', plays: 1, stufe: 3 },
          },
          unlockAll: true,
          bonusSolved: ['markt'],
        },
      },
      resume: { world: 'schatzinsel', stationId: 'kiosk', taskIndex: 2, partIndex: 1, seed: 0 },
      practice: { pearls: 5 },
      celebrated: ['fog:markt'],
      stats: { 's2-t1-a': { wrong: 0, hints: 1, stufe: 3 } },
      tower: {
        lamps: 5,
        solved: { riddles: 1, memory: 4 },
        jokes: ['j2'],
        favorites: [],
        wardrobe: {
          owned: ['krone'],
          chests: 2,
          kiko: { hand: 'fernrohr' },
          nest: {},
          fresh: ['krone'],
        },
        facts: ['f2'],
        cases: ['c2'],
      },
    });

    const merged = mergeProfiles(base, incoming);
    expect(merged.avatar).toBe('delfin');
    expect(merged.stufe).toBe(3);
    expect(merged.readAloud).toBe(true);
    expect(merged.createdAt).toBe('2026-10-01T10:00:00Z');
    expect(merged.worlds.schatzinsel?.stations.muschelstrand?.plays).toBe(2);
    expect(merged.worlds.schatzinsel?.stations.markt?.completed).toBe(true);
    expect(merged.worlds.schatzinsel?.unlockAll).toBe(true);
    expect(merged.worlds.schatzinsel?.bonusSolved).toEqual(['muschelstrand', 'markt']);
    expect(merged.resume?.stationId).toBe('kiosk');
    expect(merged.practice.pearls).toBe(5);
    expect(merged.practice.last).toEqual({ topic: 'rueckgeld', shift: 0, count: 5 });
    expect(merged.celebrated).toEqual(['welcome:schatzinsel', 'fog:markt']);
    expect(Object.keys(merged.stats)).toEqual(['s1-t1-a', 's2-t1-a']);
    expect(merged.tower?.lamps).toBe(5);
    expect(merged.tower?.solved).toEqual({ riddles: 2, memory: 4 });
    expect(merged.tower?.wardrobe?.owned).toEqual(['piratenhut', 'krone']);
    expect(merged.tower?.wardrobe?.chests).toBe(2);
    expect(merged.tower?.cases).toEqual(['c1', 'c2']);
    // Fall c2 ist inzwischen gelöst -> angefangener Fall c2 entfällt
    expect(merged.tower?.caseSave).toBeUndefined();
  });

  it('verwirft ein Resume, wenn dieser Stationsdurchgang bereits abgeschlossen wurde', () => {
    const withResume = makeProfile({
      resume: { world: 'schatzinsel', stationId: 'markt', taskIndex: 3, partIndex: 0, seed: 0 },
    });
    const completed = makeProfile({
      worlds: {
        schatzinsel: {
          stations: { markt: { completed: true, plays: 1, stufe: 3 } },
          unlockAll: false,
          bonusSolved: [],
        },
      },
    });
    expect(mergeProfiles(withResume, completed).resume).toBeUndefined();
  });

  it('nimmt innerhalb desselben Durchgangs die weiter fortgeschrittene Aufgabe', () => {
    const earlier = makeProfile({
      resume: { world: 'schatzinsel', stationId: 'markt', taskIndex: 1, partIndex: 0, seed: 0 },
    });
    const later = makeProfile({
      resume: { world: 'schatzinsel', stationId: 'markt', taskIndex: 3, partIndex: 1, seed: 0 },
    });
    expect(mergeProfiles(later, earlier).resume?.taskIndex).toBe(3);
    expect(mergeProfiles(earlier, later).resume?.taskIndex).toBe(3);
  });
});

describe('mergeStates', () => {
  it('übernimmt Kinder aus der Cloud auf ein neues Gerät und setzt setupDone', () => {
    const emptyLocal = makeState({ profiles: [], setupDone: false });
    const cloud = makeState({
      profiles: [makeProfile({ id: 'p1', name: 'Leo' })],
      activeProfileId: 'p1',
      setupDone: true,
    });
    const merged = mergeStates(emptyLocal, cloud);
    expect(merged.setupDone).toBe(true);
    expect(merged.activeProfileId).toBe('p1');
    expect(merged.profiles).toHaveLength(1);
    expect(merged.profiles[0]?.name).toBe('Leo');
  });
});

describe('pullCloudState / pushCloudState & AppStateProvider Cloud-Sync', () => {
  it('lädt und speichert den Zustand über /api/state', async () => {
    const cloudState = makeState({
      profiles: [makeProfile({ id: 'p1', name: 'Mila' })],
      activeProfileId: 'p1',
    });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      if (typeof input === 'string' && input === '/api/state') {
        if (init?.method === 'PUT') {
          return Promise.resolve(
            new Response(JSON.stringify({ state: cloudState, updatedAt: 123 }), { status: 200 }),
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ state: cloudState, updatedAt: 123 }), { status: 200 }),
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });

    const pulled = await pullCloudState();
    expect(pulled?.profiles[0]?.name).toBe('Mila');

    const pushed = await pushCloudState(cloudState, false);
    expect(pushed?.profiles[0]?.name).toBe('Mila');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('synchronisiert ein leeres Gerät beim Start automatisch mit dem Cloud-Stand', async () => {
    const cloudState = makeState({
      profiles: [makeProfile({ id: 'p1', name: 'Noah' })],
      activeProfileId: 'p1',
      setupDone: true,
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ state: cloudState, updatedAt: 100 }), { status: 200 }),
    );

    function Probe() {
      const { state } = useAppState();
      return createElement('div', null, state.profiles[0]?.name ?? 'leer');
    }

    render(
      createElement(AppStateProvider, {
        storage: memoryStorage(),
        cloudSync: true,
        children: createElement(Probe),
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('Noah')).toBeInTheDocument();
    });
  });
});
