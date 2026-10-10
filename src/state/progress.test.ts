import { describe, expect, it } from 'vitest';
import { WORLDS } from '@/content/worlds';
import {
  activeProfile,
  autoReadOf,
  canResume,
  currentStation,
  isUnlocked,
  starCount,
  worldOf,
} from './progress';
import { makeProfile, makeState } from './test-helpers';

const island = WORLDS.schatzinsel.stations;
const done = (stufe: 1 | 2 | 3 | 4 = 3) => ({ completed: true, plays: 1, stufe });

describe('progress', () => {
  it('findet das aktive Profil', () => {
    const state = makeState({
      activeProfileId: 'p2',
      profiles: [makeProfile(), makeProfile({ id: 'p2' })],
    });
    expect(activeProfile(state)?.id).toBe('p2');
    expect(activeProfile(makeState({ profiles: [makeProfile()] }))?.id).toBe('p1');
    expect(
      activeProfile(makeState({ profiles: [makeProfile(), makeProfile({ id: 'p2' })] })),
    ).toBeUndefined();
  });

  it('Stufe 1 spielt in der Bucht, sonst auf der Insel', () => {
    expect(worldOf(makeProfile({ stufe: 1 }))).toBe('kleine-bucht');
    expect(worldOf(makeProfile({ stufe: 3 }))).toBe('schatzinsel');
  });

  it('liest wie die Stufe vor, außer die Eltern haben es eingestellt', () => {
    expect(autoReadOf(makeProfile({ stufe: 1 }))).toBe(true);
    expect(autoReadOf(makeProfile({ stufe: 3 }))).toBe(false);
    expect(autoReadOf(makeProfile({ stufe: 1, readAloud: false }))).toBe(false);
    expect(autoReadOf(makeProfile({ stufe: 3, readAloud: true }))).toBe(true);
  });

  it('schaltet der Reihe nach frei', () => {
    const fresh = makeProfile();
    expect(isUnlocked(fresh, island, 0)).toBe(true);
    expect(isUnlocked(fresh, island, 1)).toBe(false);
    expect(isUnlocked(fresh, island, 99)).toBe(false);
    const one = makeProfile({
      worlds: {
        schatzinsel: { stations: { muschelstrand: done() }, unlockAll: false, bonusSolved: [] },
      },
    });
    expect(isUnlocked(one, island, 1)).toBe(true);
    expect(isUnlocked(one, island, 2)).toBe(false);
    expect(starCount(one, island)).toBe(1);
    expect(currentStation(one, island)?.id).toBe('markt');
  });

  it('unlockAll öffnet alle Stationen der Welt', () => {
    const all = makeProfile({
      worlds: { schatzinsel: { stations: {}, unlockAll: true, bonusSolved: [] } },
    });
    expect(island.every((_, i) => isUnlocked(all, island, i))).toBe(true);
  });

  it('nach der letzten Station gibt es keine aktuelle mehr', () => {
    const stations = Object.fromEntries(island.map((s) => [s.id, done()]));
    const finished = makeProfile({
      worlds: { schatzinsel: { stations, unlockAll: false, bonusSolved: [] } },
    });
    expect(currentStation(finished, island)).toBeUndefined();
    expect(starCount(finished, island)).toBe(9);
  });

  it('erkennt, ob eine Station fortgesetzt werden kann', () => {
    const profile = makeProfile({
      resume: { world: 'schatzinsel', stationId: 'markt', taskIndex: 1, partIndex: 0, seed: 1 },
    });
    expect(canResume(profile, 'markt')).toBe(true);
    expect(canResume(profile, 'kiosk')).toBe(false);
    expect(canResume(makeProfile(), 'markt')).toBe(false);
  });
});
