import { useCallback, useMemo, useState } from 'react';
import { Redirect, useSearch } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { UI } from '@/content/ui';
import type { Profile } from '@/domain/types';
import { Pearl } from '@/illustrations/Pearl';
import { buildRound, shiftStufe } from '@/practice/round';
import { TOPIC_ORDER } from '@/practice/topics';
import { useAppState } from '@/state/context';
import { activeProfile } from '@/state/progress';
import { Game } from './Game';
import styles from './Practice.module.css';

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

function Round({ profile, params }: { profile: Profile; params: URLSearchParams }) {
  const { dispatch } = useAppState();
  const topic = TOPIC_ORDER.find((t) => t === params.get('thema'));
  const shift = Number(params.get('schwer'));
  const count = params.get('anzahl') === '10' ? 10 : 5;
  const stufe = shiftStufe(profile.stufe, shift === -1 || shift === 1 ? shift : 0);
  const [seed, setSeed] = useState(newSeed);
  const [done, setDone] = useState(false);
  const tasks = useMemo(
    () => (topic ? buildRound(topic, stufe, count, seed) : []),
    [topic, stufe, count, seed],
  );

  const onFinish = useCallback(() => {
    dispatch({ type: 'add-pearl', id: profile.id });
    setDone(true);
  }, [dispatch, profile.id]);

  if (tasks.length === 0) return <Redirect to="/ueben" />;

  if (done) {
    return (
      <Screen title={UI.practice.title}>
        <div className={styles.done}>
          <SpeechBubble pose="freut-sich" kikoSize={96}>
            {UI.practice.done}
          </SpeechBubble>
          <div className={styles.chain} aria-hidden="true">
            {Array.from({ length: profile.practice.pearls }, (_, i) => (
              <Pearl
                key={i}
                size={28}
                className={i === profile.practice.pearls - 1 ? styles.newPearl : undefined}
              />
            ))}
          </div>
          <Button
            block
            onClick={() => {
              setSeed(newSeed());
              setDone(false);
            }}
          >
            {UI.practice.again}
          </Button>
          <LinkButton href="/ueben" variant="secondary" block>
            {UI.practice.finish}
          </LinkButton>
        </div>
      </Screen>
    );
  }

  return (
    <Game key={seed} profile={profile} tasks={tasks} progressStyle="shells" onFinish={onFinish} />
  );
}

/** Übungsrunde auf dem Spiel-Bildschirm, Parameter thema, schwer, anzahl (docs/03 3). */
export function PracticePlay() {
  const { state } = useAppState();
  const params = new URLSearchParams(useSearch());
  const profile = activeProfile(state);
  if (!profile) return <Redirect to="/" />;
  return <Round key={params.toString()} profile={profile} params={params} />;
}
