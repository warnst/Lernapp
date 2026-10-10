import { useCallback, useMemo, useState } from 'react';
import { Redirect } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import { ChestPick } from '@/components/ChestPick';
import { JokeBox } from '@/components/JokeBox';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { TOWER_ORDER, TOWER_SLUG } from '@/content/tower';
import { UI } from '@/content/ui';
import type { Profile, TowerType } from '@/domain/types';
import { floorCompleted, floorInfo } from '@/domain/tower';
import { Tower as TowerArt } from '@/illustrations/Tower';
import { buildRound } from '@/practice/round';
import { useAppState } from '@/state/context';
import { activeProfile } from '@/state/progress';
import { towerOf } from '@/state/reducer';
import { pendingChests } from '@/state/wardrobe';
import { Game } from './Game';
import styles from './Tower.module.css';

/** Rätsel in einer Runde „Muster & Co.“ (docs/12 3.11); eine Runde = eine Lampe. */
const RIDDLES_PER_ROUND = 3;

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

/** Abschluss: neue Lampe, ggf. neue Etage, Witzekiste (docs/12 4). */
function Done({
  profile,
  before,
  onAgain,
}: {
  profile: Profile;
  before: number;
  onAgain: () => void;
}) {
  const lamps = towerOf(profile).lamps;
  const { floors, lit, size } = floorInfo(lamps);
  const newFloor = floorCompleted(before, lamps);
  const readAloud = STUFEN[profile.stufe].autoRead;
  // beim Öffnen gemerkt, damit die Truhe nach der Wahl nicht sofort verschwindet
  const [chest, setChest] = useState(() => pendingChests(profile) > 0);
  return (
    <Screen title={UI.tower.title}>
      <div className={styles.done}>
        <div role="img" aria-label={UI.tower.label(floors, lit, size)} className={styles.newLamp}>
          <TowerArt floors={floors} lit={lit} size={size} width={140} />
        </div>
        <SpeechBubble pose="freut-sich" kikoSize={72}>
          {newFloor ? UI.tower.newFloor(floors) : UI.tower.done}
        </SpeechBubble>
        {chest ? (
          <ChestPick
            profile={profile}
            readAloud={readAloud}
            onDone={() => {
              setChest(false);
            }}
          />
        ) : (
          <JokeBox profile={profile} readAloud={readAloud} />
        )}
        <div className={styles.actions}>
          <Button block onClick={onAgain}>
            {UI.tower.again}
          </Button>
          <LinkButton href="/raetsel" variant="secondary" block>
            {UI.tower.toTower}
          </LinkButton>
        </div>
      </div>
    </Screen>
  );
}

function RiddleRound({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const [seed, setSeed] = useState(newSeed);
  const [before, setBefore] = useState<number | null>(null);
  const tasks = useMemo(
    () => buildRound('raetsel', profile.stufe, RIDDLES_PER_ROUND, seed),
    [profile.stufe, seed],
  );
  const onFinish = useCallback(() => {
    setBefore(towerOf(profile).lamps);
    dispatch({ type: 'tower-solved', id: profile.id, kind: 'riddles' });
  }, [dispatch, profile]);

  if (tasks.length === 0) return <Redirect to="/raetsel" />;
  if (before !== null) {
    return (
      <Done
        profile={profile}
        before={before}
        onAgain={() => {
          setSeed(newSeed());
          setBefore(null);
        }}
      />
    );
  }
  return (
    <Game key={seed} profile={profile} tasks={tasks} progressStyle="locks" onFinish={onFinish} />
  );
}

/** Ein Rätsel im Turm, Adresse `/raetsel/:slug` (docs/12 2). */
export function TowerPlay({ slug }: { slug: string }) {
  const { state } = useAppState();
  const profile = activeProfile(state);
  const type: TowerType | undefined = TOWER_ORDER.find((t) => TOWER_SLUG[t] === slug);
  if (!profile) return <Redirect to="/" />;
  if (!type || !STUFEN[profile.stufe].tower.types.includes(type)) return <Redirect to="/raetsel" />;
  switch (type) {
    case 'riddles':
      return <RiddleRound key={profile.id} profile={profile} />;
    default:
      return <Redirect to="/raetsel" />;
  }
}
