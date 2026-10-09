import { STUFEN } from '@/config/levels';
import type { AppStateV2, Profile, Station, WorldId } from '@/domain/types';

// Abgeleitete Werte aus dem Zustand (docs/03 Abschnitt 8, docs/09 Abschnitt 3).

/** Das spielende Kind. Mit nur einem Profil ist es immer dieses („Wer spielt?“ entfällt). */
export function activeProfile(state: AppStateV2): Profile | undefined {
  if (state.profiles.length === 1) return state.profiles[0];
  return state.profiles.find((p) => p.id === state.activeProfileId);
}

export function worldOf(profile: Profile): WorldId {
  return STUFEN[profile.stufe].world;
}

export function isCompleted(profile: Profile, world: WorldId, stationId: string): boolean {
  return profile.worlds[world]?.stations[stationId]?.completed === true;
}

/** Station n ist spielbar, wenn n = 1, Station n − 1 geschafft ist oder unlockAll gilt. */
export function isUnlocked(profile: Profile, stations: readonly Station[], index: number) {
  const station = stations[index];
  if (!station) return false;
  if (index === 0 || profile.worlds[station.world]?.unlockAll === true) return true;
  const previous = stations[index - 1];
  return previous !== undefined && isCompleted(profile, station.world, previous.id);
}

export function starCount(profile: Profile, stations: readonly Station[]): number {
  return stations.filter((s) => isCompleted(profile, s.world, s.id)).length;
}

/** Die nächste spielbare, noch nicht geschaffte Station – oder undefined, wenn alles geschafft ist. */
export function currentStation(
  profile: Profile,
  stations: readonly Station[],
): Station | undefined {
  return stations.find(
    (station, i) =>
      !isCompleted(profile, station.world, station.id) && isUnlocked(profile, stations, i),
  );
}

/** Wurde die Station angefangen und kann fortgesetzt werden? */
export function canResume(profile: Profile, stationId: string): boolean {
  return profile.resume?.stationId === stationId;
}
