import { useCallback, useState } from 'react';
import { Redirect } from 'wouter';
import { LinkButton } from '@/components/Button';
import { SpeechBubble } from '@/components/SpeechBubble';
import { UI } from '@/content/ui';
import { WORLDS } from '@/content/worlds';
import { KOSMOS_STATIONS, planetOfStation } from '@/content/worlds/kosmos/planets';
import type { Profile, Station, Task } from '@/domain/types';
import { Gem } from '@/illustrations/Gem';
import { bonusTask } from '@/practice/bonus';
import { useAppState } from '@/state/context';
import { activeProfile, isCompleted, worldOf } from '@/state/progress';
import { Game } from './Game';
import styles from './StationComplete.module.css';

function Solved({ mapHref }: { mapHref: string }) {
  return (
    <main className={styles.page}>
      <span className={styles.findling} role="img" aria-label={UI.bonus.gemLabel}>
        <Gem size={112} found />
      </span>
      <SpeechBubble pose="freut-sich" kikoSize={72}>
        {UI.bonus.solved}
      </SpeechBubble>
      <div className={styles.actions}>
        <LinkButton href={mapHref} block>
          {UI.bonus.toMap}
        </LinkButton>
        <LinkButton href="/schaetze" variant="secondary" block>
          {UI.bonus.toTreasures}
        </LinkButton>
      </div>
    </main>
  );
}

function BonusGame({ profile, station, task }: { profile: Profile; station: Station; task: Task }) {
  const { dispatch } = useAppState();
  const [solved, setSolved] = useState(false);
  const planet = station.world === 'kosmos' ? planetOfStation(station.id) : undefined;
  const mapHref = planet ? `/kosmos/${planet.id}` : '/';
  const onFinish = useCallback(() => {
    dispatch({ type: 'solve-bonus', id: profile.id, world: station.world, stationId: station.id });
    setSolved(true);
  }, [dispatch, profile.id, station]);
  if (solved) return <Solved mapHref={mapHref} />;
  return (
    <Game
      profile={profile}
      tasks={[task]}
      progressStyle="locks"
      mapHref={mapHref}
      onFinish={onFinish}
    />
  );
}

function findStation(profile: Profile, stationId: string): Station | undefined {
  return (
    KOSMOS_STATIONS.find((s) => s.id === stationId) ??
    WORLDS[worldOf(profile)].stations.find((s) => s.id === stationId)
  );
}

/** Bonus-Rätsel einer geschafften Station (docs/10 6). Freiwillig, nichts geht verloren. */
export function BonusPlay({ stationId }: { stationId: string }) {
  const { state } = useAppState();
  const profile = activeProfile(state);
  const [task] = useState(() => {
    const station = profile && findStation(profile, stationId);
    return profile && station ? bonusTask(station, profile) : null;
  });
  if (!profile) return <Redirect to="/" />;
  const station = findStation(profile, stationId);
  if (!station || !task || !isCompleted(profile, station.world, station.id)) {
    return <Redirect to={station?.world === 'kosmos' ? '/kosmos' : '/'} />;
  }
  return <BonusGame key={profile.id} profile={profile} station={station} task={task} />;
}
