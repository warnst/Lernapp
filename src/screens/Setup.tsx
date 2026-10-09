import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/Button';
import { ChildForm, type NewChild } from '@/components/ChildForm';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { avatarInfo } from '@/content/avatars';
import { UI } from '@/content/ui';
import { AvatarIllustration } from '@/illustrations/AvatarIllustration';
import { useAppState } from '@/state/context';
import { MAX_PROFILES } from '@/state/storage';
import styles from './Setup.module.css';

type Step = 'welcome' | 'child' | 'more';

/** Ersteinrichtung durch Erwachsene (docs/09, 3.3). */
export function Setup() {
  const { state, dispatch } = useAppState();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>(state.profiles.length > 0 ? 'more' : 'welcome');

  const save = (child: NewChild) => {
    dispatch({
      type: 'add-profile',
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...child,
    });
    setStep('more');
  };

  const finish = () => {
    dispatch({ type: 'finish-setup' });
    const only = state.profiles.length === 1 ? state.profiles[0] : undefined;
    dispatch({ type: 'set-active', id: only?.id });
    navigate(only ? '/' : '/wer-spielt');
  };

  if (step === 'welcome') {
    return (
      <Screen title={UI.setup.title}>
        <SpeechBubble kikoSize={96}>{UI.setup.welcome}</SpeechBubble>
        <div className={styles.actions}>
          <Button
            block
            onClick={() => {
              setStep('child');
            }}
          >
            {UI.setup.start}
          </Button>
        </div>
      </Screen>
    );
  }

  if (step === 'child') {
    return (
      <Screen title={UI.setup.start}>
        <ChildForm onSave={save} />
      </Screen>
    );
  }

  return (
    <Screen title={UI.setup.title}>
      <ul className={styles.added} aria-label={UI.adults.children}>
        {state.profiles.map((profile) => (
          <li key={profile.id} className={styles.child}>
            <AvatarIllustration avatar={profile.avatar} size={40} />
            {UI.setup.added(profile.name ?? avatarInfo(profile.avatar).name)}
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        {state.profiles.length < MAX_PROFILES ? (
          <Button
            variant="secondary"
            block
            onClick={() => {
              setStep('child');
            }}
          >
            {UI.setup.addAnother}
          </Button>
        ) : (
          <p>{UI.setup.full}</p>
        )}
        <Button block onClick={finish}>
          {UI.setup.done}
        </Button>
      </div>
    </Screen>
  );
}
