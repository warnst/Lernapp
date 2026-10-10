import { describe, expect, it } from 'vitest';
import {
  BROKEN_KEY,
  canStore,
  createInitialState,
  exportState,
  importState,
  loadState,
  parseState,
  repairState,
  saveState,
  STORAGE_KEY,
} from './storage';
import { makeProfile, makeState, memoryStorage } from './test-helpers';

const full = makeState({
  activeProfileId: 'p1',
  profiles: [
    makeProfile({
      name: 'Mila',
      worlds: {
        schatzinsel: {
          stations: {
            muschelstrand: { completed: true, completedAt: '2026-10-09', plays: 1, stufe: 3 },
          },
          unlockAll: false,
          bonusSolved: ['muschelstrand'],
        },
      },
      resume: { world: 'schatzinsel', stationId: 'markt', taskIndex: 2, partIndex: 0, seed: 42 },
      practice: { pearls: 3, last: { topic: 'rueckgeld', shift: -1, count: 5 } },
      celebrated: ['fog:markt'],
      stats: { 's1-t1-a': { wrong: 1, hints: 0, stufe: 3 } },
    }),
    makeProfile({ id: 'p2', avatar: 'pinguin', stufe: 1 }),
  ],
});

describe('parseState', () => {
  it('akzeptiert vollständige Zustände', () => {
    expect(parseState(full)).toEqual(full);
    const withTower = makeState({
      profiles: [
        makeProfile({
          tower: { lamps: 4, solved: { riddles: 4 }, jokes: ['kamm'], favorites: ['kamm'] },
        }),
      ],
    });
    expect(parseState(withTower)).toEqual(withTower);
    expect(parseState(createInitialState())).toEqual(createInitialState());
  });

  it.each([
    ['kein Objekt', 'x'],
    ['Array', []],
    ['falsche Version', { ...full, version: 1 }],
    ['setupDone fehlt', { version: 2, profiles: [] }],
    ['profiles kein Array', { ...full, profiles: {} }],
    [
      'zu viele Profile',
      {
        ...full,
        profiles: Array.from({ length: 7 }, (_, i) => makeProfile({ id: `p${String(i)}` })),
      },
    ],
    [
      'doppelte IDs',
      { ...full, activeProfileId: undefined, profiles: [makeProfile(), makeProfile()] },
    ],
    ['aktives Profil fehlt', { ...full, activeProfileId: 'gibt-es-nicht' }],
    ['aktives Profil keine Zeichenkette', { ...full, activeProfileId: 3 }],
    ['unbekanntes Tier', { ...full, profiles: [makeProfile({ avatar: 'drache' as never })] }],
    [
      'kaputter Turm',
      {
        ...full,
        profiles: [
          makeProfile({
            tower: { lamps: 1, solved: { drachen: 1 } as never, jokes: [], favorites: [] },
          }),
        ],
      },
    ],
    ['Stufe 5', { ...full, profiles: [makeProfile({ stufe: 5 as never })] }],
    ['leere ID', { ...full, activeProfileId: undefined, profiles: [makeProfile({ id: '' })] }],
    ['Name keine Zeichenkette', { ...full, profiles: [makeProfile({ name: 4 as never })] }],
    ['unbekannte Welt', { ...full, profiles: [makeProfile({ worlds: { mond: {} } as never })] }],
    [
      'kaputte Station',
      {
        ...full,
        profiles: [
          makeProfile({
            worlds: {
              schatzinsel: {
                stations: { x: { completed: 'ja' } },
                unlockAll: false,
                bonusSolved: [],
              },
            } as never,
          }),
        ],
      },
    ],
    [
      'stations fehlt',
      {
        ...full,
        profiles: [makeProfile({ worlds: { schatzinsel: { unlockAll: false } } as never })],
      },
    ],
    [
      'kaputtes resume',
      { ...full, profiles: [makeProfile({ resume: { world: 'mond' } as never })] },
    ],
    ['resume ohne Objekt', { ...full, profiles: [makeProfile({ resume: 'x' as never })] }],
    ['kaputte Perlen', { ...full, profiles: [makeProfile({ practice: { pearls: -1 } })] }],
    ['practice kein Objekt', { ...full, profiles: [makeProfile({ practice: null as never })] }],
    [
      'kaputte letzte Übung',
      {
        ...full,
        profiles: [makeProfile({ practice: { pearls: 1, last: { topic: 'x' } } as never })],
      },
    ],
    [
      'last kein Objekt',
      { ...full, profiles: [makeProfile({ practice: { pearls: 1, last: 3 } as never })] },
    ],
    ['celebrated kein Array', { ...full, profiles: [makeProfile({ celebrated: 'x' as never })] }],
    [
      'kaputte Statistik',
      { ...full, profiles: [makeProfile({ stats: { a: { wrong: 'x' } } as never })] },
    ],
    ['stats kein Objekt', { ...full, profiles: [makeProfile({ stats: [] as never })] }],
    ['Profil kein Objekt', { ...full, activeProfileId: undefined, profiles: [3] }],
  ])('lehnt ab: %s', (_name, raw) => {
    expect(parseState(raw)).toBeNull();
  });
});

describe('loadState / saveState', () => {
  it('liest, was gespeichert wurde', () => {
    const storage = memoryStorage();
    expect(saveState(storage, full)).toBe(true);
    expect(loadState(storage)).toEqual(full);
  });

  it('startet frisch ohne Speicher, ohne Eintrag, bei kaputtem JSON oder fremden Daten', () => {
    expect(loadState(undefined)).toEqual(createInitialState());
    expect(loadState(memoryStorage())).toEqual(createInitialState());
    expect(loadState(memoryStorage('{kaputt'))).toEqual(createInitialState());
    expect(loadState(memoryStorage('{"version":1}'))).toEqual(createInitialState());
  });

  it('übersteht Speicher, die Fehler werfen', () => {
    const broken = memoryStorage();
    broken.getItem = () => {
      throw new Error('gesperrt');
    };
    broken.setItem = () => {
      throw new Error('voll');
    };
    expect(loadState(broken)).toEqual(createInitialState());
    expect(saveState(broken, full)).toBe(false);
    expect(saveState(undefined, full)).toBe(false);
  });
});

describe('exportState / importState', () => {
  it('sichert mit Datum und liest die Sicherung wieder ein', () => {
    const json = exportState(full, new Date('2026-10-09T12:00:00Z'));
    expect(json).toContain('"exportedAt": "2026-10-09T12:00:00.000Z"');
    expect(importState(json)).toEqual(full);
  });

  it('lehnt fremde oder kaputte Dateien ab', () => {
    expect(importState('kein json')).toBeNull();
    expect(importState(JSON.stringify(full))).toBeNull();
    expect(importState(JSON.stringify({ app: 'anders', state: full }))).toBeNull();
    expect(importState(JSON.stringify({ app: 'schatzinsel', state: { version: 9 } }))).toBeNull();
  });
});

describe('Retten statt Löschen', () => {
  it('ein kaputtes Teil kostet nicht den ganzen Fortschritt; der Text wird aufgehoben', () => {
    const raw = JSON.parse(JSON.stringify(full)) as Record<string, unknown> & {
      profiles: Record<string, unknown>[];
    };
    const [mila, other] = raw.profiles;
    if (!mila || !other) throw new Error('Profile fehlen');
    mila.resume = { world: 'mond' };
    mila.stats = { x: 'kaputt' };
    mila.tower = {
      lamps: 7,
      solved: {},
      jokes: [],
      favorites: [],
      sudoku: { kind: 'riesig' },
      wardrobe: { owned: ['piratenhut'], chests: 1, kiko: {}, nest: {} },
    };
    raw.profiles.push({ id: 'ohne-avatar' });
    const text = JSON.stringify(raw);
    const storage = memoryStorage(text);

    const state = loadState(storage);
    expect(state.profiles.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(state.activeProfileId).toBe('p1');
    const repaired = state.profiles[0];
    expect(repaired?.worlds).toEqual(full.profiles[0]?.worlds);
    expect(repaired?.practice.pearls).toBe(3);
    expect(repaired?.resume).toBeUndefined();
    expect(repaired?.stats).toEqual({});
    expect(repaired?.tower).toMatchObject({ lamps: 7, wardrobe: { owned: ['piratenhut'] } });
    expect(repaired?.tower).not.toHaveProperty('sudoku');
    expect(storage.getItem(BROKEN_KEY)).toBe(text);
    expect(storage.getItem(STORAGE_KEY)).toBe(text);
  });

  it('behält die Vorlese-Einstellung, verwirft aber falsche Werte', () => {
    const ok = makeState({ profiles: [makeProfile({ readAloud: false })] });
    expect(parseState(ok)).toEqual(ok);
    const broken = { ...ok, profiles: [{ ...makeProfile(), readAloud: 'ja' }] };
    expect(parseState(broken)).toBeNull();
    expect(repairState(broken)?.profiles[0]).not.toHaveProperty('readAloud');
    const kept = { ...ok, profiles: [{ ...makeProfile({ readAloud: true }), stats: 1 }] };
    expect(repairState(kept)?.profiles[0]?.readAloud).toBe(true);
  });

  it('rettet auch ohne Turm, ohne gültige Übung und ohne Einrichtung', () => {
    const state = repairState({
      version: 2,
      profiles: [
        { ...makeProfile(), practice: { pearls: 'viele' }, celebrated: 3, tower: { lamps: -1 } },
        makeProfile(),
        'kein Profil',
      ],
      activeProfileId: 'weg',
    });
    expect(state).toEqual({
      version: 2,
      setupDone: true,
      profiles: [{ ...makeProfile(), practice: { pearls: 0 }, celebrated: [] }],
    });
    expect(repairState({ version: 2, profiles: [], setupDone: false })?.setupDone).toBe(false);
    expect(repairState({ version: 1 })).toBeNull();
    expect(repairState('text')).toBeNull();
  });

  it('kaputtes JSON wird aufgehoben, auch wenn das Aufheben scheitert', () => {
    const storage = memoryStorage('{kaputt');
    expect(loadState(storage)).toEqual(createInitialState());
    expect(storage.getItem(BROKEN_KEY)).toBe('{kaputt');
    const full2 = memoryStorage('{kaputt');
    full2.setItem = () => {
      throw new Error('voll');
    };
    expect(loadState(full2)).toEqual(createInitialState());
  });

  it('erkennt, ob gespeichert werden kann', () => {
    expect(canStore(memoryStorage())).toBe(true);
    expect(canStore(undefined)).toBe(false);
    const locked = memoryStorage();
    locked.setItem = () => {
      throw new Error('privat');
    };
    expect(canStore(locked)).toBe(false);
  });
});
