import { useCallback, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { WORLDS } from '@/content/worlds';
import { KOSMOS_STATIONS, planetOfStation } from '@/content/worlds/kosmos/planets';
import { ZAHLENBLOECKE_STATIONS, heroOfStation } from '@/content/worlds/zahlenbloecke/blocks';
import type { Profile, Station } from '@/domain/types';
import { stationTasks } from '@/practice/variants';
import { useAppState } from '@/state/context';
import { activeProfile, isUnlocked, worldOf } from '@/state/progress';
import { Game } from './Game';

function isKosmosUnlocked(profile: Profile, stationIndex: number): boolean {
  if (profile.worlds[worldOf(profile)]?.unlockAll === true) return true;
  return isUnlocked(profile, KOSMOS_STATIONS, stationIndex);
}

function isZahlenbloeckeUnlocked(profile: Profile, stationIndex: number): boolean {
  if (profile.worlds[worldOf(profile)]?.unlockAll === true) return true;
  return isUnlocked(profile, ZAHLENBLOECKE_STATIONS, stationIndex);
}

function StationGame({ profile, station }: { profile: Profile; station: Station }) {
  const { dispatch } = useAppState();
  const [, navigate] = useLocation();
  const plays = profile.worlds[station.world]?.stations[station.id]?.plays ?? 0;
  const [tasks] = useState(() => stationTasks(station, profile.stufe, plays, profile.id));
  const resume = profile.resume?.stationId === station.id ? profile.resume : undefined;
  const planet = station.world === 'kosmos' ? planetOfStation(station.id) : undefined;
  const hero = station.world === 'zahlenbloecke' ? heroOfStation(station.id) : undefined;
  const mapHref = planet ? `/kosmos/${planet.id}` : hero ? `/zahlenbloecke/${hero.id}` : '/';

  const onAdvance = useCallback(
    (taskIndex: number, partIndex: number) => {
      dispatch({
        type: 'save-resume',
        id: profile.id,
        resume: { world: station.world, stationId: station.id, taskIndex, partIndex, seed: plays },
      });
    },
    [dispatch, plays, profile.id, station],
  );

  const onFinish = useCallback(() => {
    dispatch({
      type: 'complete-station',
      id: profile.id,
      world: station.world,
      stationId: station.id,
      at: new Date().toISOString(),
    });
    navigate(`/station/${station.id}/geschafft`, { replace: true });
  }, [dispatch, navigate, profile.id, station]);

  return (
    <Game
      profile={profile}
      tasks={tasks}
      progressStyle={station.progressStyle ?? 'shells'}
      mapHref={mapHref}
      {...(resume ? { start: resume } : {})}
      onAdvance={onAdvance}
      onFinish={onFinish}
    />
  );
}

/** Spiel einer Station (docs/01 5.4). Unbekannte oder gesperrte Stationen führen zur Karte. */
export function Play({ stationId }: { stationId: string }) {
  const { state } = useAppState();
  const profile = activeProfile(state);
  if (!profile) return <Redirect to="/" />;
  const kosmosIndex = KOSMOS_STATIONS.findIndex((s) => s.id === stationId);
  if (kosmosIndex !== -1) {
    const station = KOSMOS_STATIONS[kosmosIndex];
    if (!station || !isKosmosUnlocked(profile, kosmosIndex)) return <Redirect to="/kosmos" />;
    return <StationGame key={`${profile.id}-${station.id}`} profile={profile} station={station} />;
  }
  const blockIndex = ZAHLENBLOECKE_STATIONS.findIndex((s) => s.id === stationId);
  if (blockIndex !== -1) {
    const station = ZAHLENBLOECKE_STATIONS[blockIndex];
    if (!station || !isZahlenbloeckeUnlocked(profile, blockIndex))
      return <Redirect to="/zahlenbloecke" />;
    return <StationGame key={`${profile.id}-${station.id}`} profile={profile} station={station} />;
  }
  const stations = WORLDS[worldOf(profile)].stations;
  const index = stations.findIndex((s) => s.id === stationId);
  const station = stations[index];
  if (!station || !isUnlocked(profile, stations, index)) return <Redirect to="/" />;
  return <StationGame key={`${profile.id}-${station.id}`} profile={profile} station={station} />;
}
