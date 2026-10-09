import { describe, expect, it } from 'vitest';
import { appReducer } from './reducer';
import { makeProfile, makeState } from './test-helpers';

describe('appReducer', () => {
  it('legt Profile an, ohne leere Namen, höchstens 6', () => {
    let state = makeState({ profiles: [] });
    state = appReducer(state, {
      type: 'add-profile',
      id: 'a',
      createdAt: 't',
      avatar: 'robbe',
      stufe: 1,
      name: '  Mila ',
    });
    state = appReducer(state, {
      type: 'add-profile',
      id: 'b',
      createdAt: 't',
      avatar: 'delfin',
      stufe: 3,
      name: ' ',
    });
    expect(state.profiles.map((p) => [p.id, p.name, p.stufe])).toEqual([
      ['a', 'Mila', 1],
      ['b', undefined, 3],
    ]);
    expect(state.profiles[1]).not.toHaveProperty('name');
    for (let i = 0; i < 6; i++) {
      state = appReducer(state, {
        type: 'add-profile',
        id: `x${String(i)}`,
        createdAt: 't',
        avatar: 'delfin',
        stufe: 2,
      });
    }
    expect(state.profiles).toHaveLength(6);
  });

  it('ändert Name, Tier und Stufe', () => {
    const state = makeState({
      profiles: [makeProfile({ name: 'Ben' }), makeProfile({ id: 'p2' })],
    });
    const changed = appReducer(state, {
      type: 'update-profile',
      id: 'p1',
      avatar: 'pinguin',
      stufe: 4,
    });
    expect(changed.profiles[0]).toMatchObject({ name: 'Ben', avatar: 'pinguin', stufe: 4 });
    expect(changed.profiles[1]).toBe(state.profiles[1]);
    const renamed = appReducer(changed, { type: 'update-profile', id: 'p1', name: 'Lea' });
    expect(renamed.profiles[0]).toMatchObject({ name: 'Lea', avatar: 'pinguin', stufe: 4 });
    const cleared = appReducer(renamed, { type: 'update-profile', id: 'p1', name: '' });
    expect(cleared.profiles[0]).not.toHaveProperty('name');
  });

  it('löscht Profile und vergisst dabei das aktive Profil', () => {
    const state = makeState({
      activeProfileId: 'p1',
      profiles: [makeProfile(), makeProfile({ id: 'p2' })],
    });
    const deleted = appReducer(state, { type: 'delete-profile', id: 'p1' });
    expect(deleted.profiles.map((p) => p.id)).toEqual(['p2']);
    expect(deleted).not.toHaveProperty('activeProfileId');
    const other = appReducer(state, { type: 'delete-profile', id: 'p2' });
    expect(other.activeProfileId).toBe('p1');
    const none = appReducer(makeState({ profiles: [makeProfile()] }), {
      type: 'delete-profile',
      id: 'p1',
    });
    expect(none.profiles).toEqual([]);
  });

  it('setzt das aktive Profil nur auf bestehende Profile', () => {
    const state = makeState({ profiles: [makeProfile()] });
    expect(appReducer(state, { type: 'set-active', id: 'p1' }).activeProfileId).toBe('p1');
    expect(appReducer(state, { type: 'set-active', id: 'x' })).not.toHaveProperty(
      'activeProfileId',
    );
    const active = makeState({ activeProfileId: 'p1', profiles: [makeProfile()] });
    expect(appReducer(active, { type: 'set-active', id: undefined })).not.toHaveProperty(
      'activeProfileId',
    );
  });

  it('beendet die Einrichtung', () => {
    expect(appReducer(makeState({ setupDone: false }), { type: 'finish-setup' }).setupDone).toBe(
      true,
    );
  });

  it('schaltet alle Stationen einer Welt frei und wieder zurück', () => {
    const state = makeState({ profiles: [makeProfile()] });
    const on = appReducer(state, {
      type: 'set-unlock-all',
      id: 'p1',
      world: 'schatzinsel',
      value: true,
    });
    expect(on.profiles[0]?.worlds.schatzinsel).toEqual({
      stations: {},
      bonusSolved: [],
      unlockAll: true,
    });
    const off = appReducer(on, {
      type: 'set-unlock-all',
      id: 'p1',
      world: 'schatzinsel',
      value: false,
    });
    expect(off.profiles[0]?.worlds.schatzinsel?.unlockAll).toBe(false);
  });

  it('setzt den Fortschritt zurück, Name, Tier und Stufe bleiben', () => {
    const state = makeState({
      profiles: [
        makeProfile({
          name: 'Mila',
          worlds: { schatzinsel: { stations: {}, unlockAll: true, bonusSolved: [] } },
          resume: { world: 'schatzinsel', stationId: 'markt', taskIndex: 0, partIndex: 0, seed: 1 },
          practice: { pearls: 4 },
          celebrated: ['x'],
          stats: { a: { wrong: 1, hints: 1, stufe: 3 } },
        }),
      ],
    });
    const reset = appReducer(state, { type: 'reset-progress', id: 'p1' });
    expect(reset.profiles[0]).toEqual(makeProfile({ name: 'Mila' }));
  });

  it('merkt sich Gefeiertes nur einmal', () => {
    const state = makeState({ profiles: [makeProfile()] });
    const once = appReducer(state, {
      type: 'mark-celebrated',
      id: 'p1',
      key: 'welcome:schatzinsel',
    });
    const twice = appReducer(once, {
      type: 'mark-celebrated',
      id: 'p1',
      key: 'welcome:schatzinsel',
    });
    expect(twice.profiles[0]?.celebrated).toEqual(['welcome:schatzinsel']);
    expect(twice.profiles[0]).toBe(once.profiles[0]);
  });

  it('ersetzt den ganzen Zustand (Sicherung laden)', () => {
    const next = makeState({ profiles: [makeProfile({ id: 'neu' })] });
    expect(appReducer(makeState(), { type: 'replace', state: next })).toBe(next);
  });

  it('merkt sich die Fortsetzungsstelle und die Statistik eines Teils', () => {
    const resume = {
      world: 'schatzinsel' as const,
      stationId: 'markt',
      taskIndex: 2,
      partIndex: 1,
      seed: 0,
    };
    let state = makeState({ profiles: [makeProfile({ stufe: 4 })] });
    state = appReducer(state, { type: 'save-resume', id: 'p1', resume });
    state = appReducer(state, {
      type: 'record-part',
      id: 'p1',
      partId: 's2-t3-a',
      wrong: 2,
      hints: 1,
    });
    expect(state.profiles[0]).toMatchObject({
      resume,
      stats: { 's2-t3-a': { wrong: 2, hints: 1, stufe: 4 } },
    });
  });

  it('schließt eine Station ab, zählt Durchgänge und löscht die Fortsetzungsstelle', () => {
    const resume = {
      world: 'schatzinsel' as const,
      stationId: 'markt',
      taskIndex: 4,
      partIndex: 1,
      seed: 0,
    };
    let state = makeState({ profiles: [makeProfile({ resume })] });
    const done = {
      type: 'complete-station',
      id: 'p1',
      world: 'schatzinsel',
      stationId: 'markt',
      at: 't1',
    } as const;
    state = appReducer(state, done);
    expect(state.profiles[0]).not.toHaveProperty('resume');
    expect(state.profiles[0]?.worlds.schatzinsel).toEqual({
      stations: { markt: { completed: true, completedAt: 't1', plays: 1, stufe: 3 } },
      unlockAll: false,
      bonusSolved: [],
    });
    state = appReducer(state, { ...done, at: 't2' });
    expect(state.profiles[0]?.worlds.schatzinsel?.stations.markt).toMatchObject({
      plays: 2,
      completedAt: 't2',
    });
  });
});
