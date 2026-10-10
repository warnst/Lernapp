import { describe, expect, it } from 'vitest';
import { WORLDS } from '@/content/worlds';
import type { AppStateV2, Station, Stufe } from '@/domain/types';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { answerPart } from '@/test/answer-part';
import { renderApp } from '@/test/render-app';

// Abnahme Phase 5: Jede Station lässt sich über die Oberfläche mit richtigen Antworten durchspielen.

function profileState(stufe: Stufe, world: Station['world']): AppStateV2 {
  return makeState({
    profiles: [
      makeProfile({
        stufe,
        worlds: { [world]: { stations: {}, unlockAll: true, bonusSolved: [] } },
      }),
    ],
  });
}

const islandStations = WORLDS.schatzinsel.stations;
const bayStations = WORLDS['kleine-bucht'].stations.filter((s) => s.id !== 'muscheltruhe');

describe('alle Stationen sind durchspielbar', () => {
  it.each(islandStations.map((s) => [s.id, s] as const))(
    'Insel: %s',
    async (_id, station) => {
      const { user, storage } = renderApp(`/station/${station.id}`, profileState(3, 'schatzinsel'));
      for (const task of station.tasks) {
        for (const part of task.parts) await answerPart(user, part, false);
      }
      const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
      expect(saved.profiles[0]?.worlds.schatzinsel?.stations[station.id]?.completed).toBe(true);
    },
    20000,
  );

  it.each(bayStations.map((s) => [s.id, s] as const))(
    'Bucht: %s',
    async (_id, station) => {
      const { user, storage } = renderApp(
        `/station/${station.id}`,
        profileState(1, 'kleine-bucht'),
      );
      for (const task of station.tasks) {
        for (const part of task.parts) await answerPart(user, part, true);
      }
      const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
      expect(saved.profiles[0]?.worlds['kleine-bucht']?.stations[station.id]?.completed).toBe(true);
    },
    20000,
  );
});
