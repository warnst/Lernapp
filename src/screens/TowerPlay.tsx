import { useCallback, useMemo, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { STUFEN } from '@/config/levels';
import { TOWER_ORDER, TOWER_SLUG } from '@/content/tower';
import type { Profile, TowerType } from '@/domain/types';
import { buildRound } from '@/practice/round';
import { useAppState } from '@/state/context';
import { activeProfile } from '@/state/progress';
import { towerOf } from '@/state/reducer';
import { Game } from './Game';
import { Odd, Quiz, Shadow } from './ChoiceRiddles';
import { Cipher } from './Cipher';
import { Detective } from './DetectiveCase';
import { Dots } from './Dots';
import { Maze } from './Maze';
import { Memory } from './Memory';
import { Nonogram } from './Nonogram';
import { Sudoku } from './Sudoku';
import { TowerDone } from './TowerDone';

/** Rätsel in einer Runde „Muster & Co.“ (docs/12 3.11); eine Runde = eine Lampe. */
const RIDDLES_PER_ROUND = 3;

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
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
      <TowerDone
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
  const [, navigate] = useLocation();
  const profile = activeProfile(state);
  const type: TowerType | undefined = TOWER_ORDER.find((t) => TOWER_SLUG[t] === slug);
  if (!profile) return <Redirect to="/" />;
  if (!type || !STUFEN[profile.stufe].tower.types.includes(type)) return <Redirect to="/raetsel" />;
  switch (type) {
    case 'riddles':
      return <RiddleRound key={profile.id} profile={profile} />;
    case 'cipher':
      return <Cipher key={profile.id} profile={profile} />;
    case 'case':
      return (
        <Detective
          key={profile.id}
          profile={profile}
          onLeave={() => {
            navigate('/raetsel');
          }}
        />
      );
    case 'maze':
      return <Maze key={profile.id} profile={profile} />;
    case 'odd':
      return <Odd key={profile.id} profile={profile} />;
    case 'shadow':
      return <Shadow key={profile.id} profile={profile} />;
    case 'quiz':
      return <Quiz key={profile.id} profile={profile} />;
    case 'dots':
      return <Dots key={profile.id} profile={profile} />;
    case 'nonogram':
      return <Nonogram key={profile.id} profile={profile} />;
    case 'memory':
      return <Memory key={profile.id} profile={profile} />;
    case 'sudoku':
      return <Sudoku key={profile.id} profile={profile} />;
    default:
      return <Redirect to="/raetsel" />;
  }
}
