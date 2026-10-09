import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  exportState,
  importState,
  loadState,
  parseState,
  saveState,
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
