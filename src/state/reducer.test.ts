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

  it('merkt sich die letzte Übung und zählt Perlen', () => {
    let state = makeState({ profiles: [makeProfile()] });
    const last = { topic: 'rueckgeld', shift: -1, count: 5 } as const;
    state = appReducer(state, { type: 'set-practice-last', id: 'p1', last });
    state = appReducer(state, { type: 'add-pearl', id: 'p1' });
    state = appReducer(state, { type: 'add-pearl', id: 'p1' });
    expect(state.profiles[0]?.practice).toEqual({ pearls: 2, last });
  });
});

describe('Rätselturm (docs/12)', () => {
  it('zählt Lampen und gelöste Rätsel je Art', () => {
    let state = makeState({ profiles: [makeProfile()] });
    state = appReducer(state, { type: 'tower-solved', id: 'p1', kind: 'riddles' });
    state = appReducer(state, { type: 'tower-solved', id: 'p1', kind: 'riddles' });
    expect(state.profiles[0]?.tower).toMatchObject({ lamps: 2, solved: { riddles: 2 } });
  });

  it('merkt gehörte Witze einmal und schaltet Lieblingswitze um', () => {
    let state = makeState({ profiles: [makeProfile()] });
    state = appReducer(state, { type: 'joke-heard', id: 'p1', jokeId: 'kamm' });
    state = appReducer(state, { type: 'joke-heard', id: 'p1', jokeId: 'kamm' });
    state = appReducer(state, { type: 'joke-favorite', id: 'p1', jokeId: 'kamm' });
    expect(state.profiles[0]?.tower).toMatchObject({ jokes: ['kamm'], favorites: ['kamm'] });
    state = appReducer(state, { type: 'joke-favorite', id: 'p1', jokeId: 'kamm' });
    expect(state.profiles[0]?.tower?.favorites).toEqual([]);
  });

  it('Zurücksetzen löscht auch den Turm', () => {
    let state = makeState({ profiles: [makeProfile()] });
    state = appReducer(state, { type: 'tower-solved', id: 'p1', kind: 'riddles' });
    state = appReducer(state, { type: 'reset-progress', id: 'p1' });
    expect(state.profiles[0]?.tower).toBeUndefined();
  });

  it('Kleiderschrank: wählen, anziehen, ausziehen, ins Nest stellen', () => {
    let state = makeState({ profiles: [makeProfile()] });
    const wardrobe = () => state.profiles[0]?.tower?.wardrobe;
    state = appReducer(state, { type: 'wardrobe-pick', id: 'p1', itemId: 'piratenhut' });
    expect(wardrobe()).toEqual({
      owned: ['piratenhut'],
      chests: 1,
      kiko: { kopf: 'piratenhut' },
      nest: {},
    });
    // doppelt wählen zählt nicht
    state = appReducer(state, { type: 'wardrobe-pick', id: 'p1', itemId: 'piratenhut' });
    expect(wardrobe()?.chests).toBe(1);
    // besondere Teile ohne Truhe
    state = appReducer(state, { type: 'wardrobe-grant', id: 'p1', itemId: 'krone' });
    expect(wardrobe()).toMatchObject({ chests: 1, kiko: { kopf: 'krone' } });
    state = appReducer(state, { type: 'wardrobe-toggle', id: 'p1', itemId: 'piratenhut' });
    expect(wardrobe()?.kiko).toEqual({ kopf: 'piratenhut' });
    state = appReducer(state, { type: 'wardrobe-toggle', id: 'p1', itemId: 'piratenhut' });
    expect(wardrobe()?.kiko).toEqual({});
    // nicht gefundene oder unbekannte Teile ändern nichts
    const before = state;
    state = appReducer(state, { type: 'wardrobe-toggle', id: 'p1', itemId: 'zauberstab' });
    state = appReducer(state, { type: 'wardrobe-grant', id: 'p1', itemId: 'gibt-es-nicht' });
    expect(wardrobe()?.kiko).toEqual({});
    expect(wardrobe()?.owned).toEqual(['piratenhut', 'krone']);
    state = appReducer(before, { type: 'wardrobe-pick', id: 'p1', itemId: 'goldfisch' });
    expect(wardrobe()?.nest).toEqual({ haustier: 'goldfisch' });
    state = appReducer(state, { type: 'wardrobe-toggle', id: 'p1', itemId: 'goldfisch' });
    expect(wardrobe()?.nest).toEqual({});
    state = appReducer(state, { type: 'wardrobe-toggle', id: 'p1', itemId: 'goldfisch' });
    expect(wardrobe()?.nest).toEqual({ haustier: 'goldfisch' });
    state = appReducer(state, {
      type: 'wardrobe-outfit',
      id: 'p1',
      kiko: { kopf: 'krone', hand: 'zauberstab' },
    });
    expect(wardrobe()?.kiko).toEqual({ kopf: 'krone' });
  });

  it('Sudoku merken, verwerfen und beim Lösen löschen', () => {
    let state = makeState({ profiles: [makeProfile()] });
    const save = {
      kind: 'zahlen4' as const,
      stars: 1 as const,
      seed: 3,
      entries: [],
      locked: [],
      notes: [],
    };
    state = appReducer(state, { type: 'sudoku-save', id: 'p1', save });
    expect(state.profiles[0]?.tower?.sudoku).toEqual(save);
    state = appReducer(state, { type: 'tower-solved', id: 'p1', kind: 'riddles' });
    expect(state.profiles[0]?.tower?.sudoku).toEqual(save);
    state = appReducer(state, { type: 'tower-solved', id: 'p1', kind: 'sudoku' });
    expect(state.profiles[0]?.tower).not.toHaveProperty('sudoku');
    state = appReducer(state, { type: 'sudoku-save', id: 'p1', save });
    state = appReducer(state, { type: 'sudoku-save', id: 'p1', save: null });
    expect(state.profiles[0]?.tower).not.toHaveProperty('sudoku');
  });

  it('besondere Teile: Zauberhut beim goldenen Stempel, Krone beim Leuchtfeuer, als neu markiert', () => {
    let state = makeState({ profiles: [makeProfile()] });
    const tower = () => state.profiles[0]?.tower;
    for (let i = 0; i < 9; i++)
      state = appReducer(state, { type: 'tower-solved', id: 'p1', kind: 'memory' });
    expect(tower()?.wardrobe).toBeUndefined();
    state = appReducer(state, { type: 'tower-solved', id: 'p1', kind: 'memory' });
    expect(tower()?.wardrobe).toMatchObject({
      owned: ['zauberhut'],
      fresh: ['zauberhut'],
      kiko: { kopf: 'zauberhut' },
    });
    state = appReducer(state, { type: 'wardrobe-seen', id: 'p1' });
    expect(tower()?.wardrobe).not.toHaveProperty('fresh');
    // Leuchtfeuer: 3 + 9 × 5 = 48 Lampen für 10 Etagen
    while ((tower()?.lamps ?? 0) < 48)
      state = appReducer(state, { type: 'tower-solved', id: 'p1', kind: 'quiz' });
    expect(tower()?.wardrobe?.owned).toEqual(['zauberhut', 'krone']);
    expect(tower()?.wardrobe?.fresh).toEqual(['krone']);
    // nur einmal
    state = appReducer(state, { type: 'tower-solved', id: 'p1', kind: 'quiz' });
    expect(tower()?.wardrobe?.owned).toEqual(['zauberhut', 'krone']);
    const same = appReducer(state, { type: 'wardrobe-seen', id: 'p1' });
    expect(appReducer(same, { type: 'wardrobe-seen', id: 'p1' })).toEqual(same);
  });

  it('Detektivfall und Wissenskarten', () => {
    let state = makeState({ profiles: [makeProfile()] });
    state = appReducer(state, {
      type: 'case-save',
      id: 'p1',
      save: { caseId: 'keks', solved: 1, seed: 2 },
    });
    expect(state.profiles[0]?.tower?.caseSave).toEqual({ caseId: 'keks', solved: 1, seed: 2 });
    state = appReducer(state, { type: 'case-solved', id: 'p1', caseId: 'keks' });
    state = appReducer(state, { type: 'case-solved', id: 'p1', caseId: 'keks' });
    expect(state.profiles[0]?.tower).toMatchObject({ cases: ['keks'] });
    expect(state.profiles[0]?.tower).not.toHaveProperty('caseSave');
    state = appReducer(state, {
      type: 'case-save',
      id: 'p1',
      save: { caseId: 'feder', solved: 0, seed: 1 },
    });
    state = appReducer(state, { type: 'case-save', id: 'p1', save: null });
    expect(state.profiles[0]?.tower).not.toHaveProperty('caseSave');
    state = appReducer(state, { type: 'fact-learned', id: 'p1', factId: 'a' });
    const once = state;
    state = appReducer(state, { type: 'fact-learned', id: 'p1', factId: 'a' });
    expect(state).toEqual(once);
    expect(state.profiles[0]?.tower?.facts).toEqual(['a']);
  });
});
