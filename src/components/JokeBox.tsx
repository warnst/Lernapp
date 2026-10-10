import { useEffect, useId, useState } from 'react';
import { UI } from '@/content/ui';
import type { Profile } from '@/domain/types';
import { Kiko } from '@/illustrations/Kiko';
import { UiIcon } from '@/illustrations/UiIcon';
import { toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { nextJoke } from '@/state/jokes';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import styles from './JokeBox.module.css';
import { cx } from './cx';

/**
 * Kikos Witzekiste (docs/12 4.2): erst die Frage, das Kind rät laut, dann „Auflösen!“.
 * Mit startOpen springt die Kiste gleich auf (nach einer Runde im Turm).
 */
export function JokeBox({
  profile,
  readAloud,
  startOpen = true,
}: {
  profile: Profile;
  readAloud: boolean;
  startOpen?: boolean;
}) {
  const { dispatch } = useAppState();
  const titleId = useId();
  const [joke] = useState(() => nextJoke(profile));
  const [step, setStep] = useState<'closed' | 'question' | 'answer'>(
    startOpen ? 'question' : 'closed',
  );
  const [telling, setTelling] = useState(false);

  useEffect(() => {
    if (readAloud && step === 'question') toggleSpeak(joke.question);
  }, [readAloud, step, joke.question]);

  if (step === 'closed') {
    return (
      <section className={styles.box} aria-label={UI.jokes.box}>
        <Button
          variant="secondary"
          block
          onClick={() => {
            setStep('question');
          }}
        >
          <UiIcon name="truhe" /> {UI.jokes.open}
        </Button>
      </section>
    );
  }

  const answered = step === 'answer';
  return (
    <section className={cx(styles.box, styles.open)} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {UI.jokes.box}
      </h2>
      <div className={styles.card}>
        <Kiko
          pose={answered ? 'freut-sich' : 'denkt'}
          size={72}
          className={cx(answered && styles.laugh)}
        />
        <div className={styles.text}>
          <p className={styles.question}>{joke.question}</p>
          {answered ? (
            <>
              <p className={styles.answer}>{joke.answer}</p>
              <p className={styles.laughText} aria-hidden="true">
                {UI.jokes.laugh}
              </p>
            </>
          ) : (
            <p className={styles.hint}>{UI.jokes.guess}</p>
          )}
        </div>
      </div>
      {answered ? (
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => {
              toggleSpeak(`${joke.question} ${joke.answer}`);
            }}
          >
            <UiIcon name="lautsprecher" /> {UI.jokes.readAgain}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setTelling(true);
            }}
          >
            {UI.jokes.tell}
          </Button>
        </div>
      ) : (
        <Button
          block
          onClick={() => {
            dispatch({ type: 'joke-heard', id: profile.id, jokeId: joke.id });
            setStep('answer');
            if (readAloud) toggleSpeak(joke.answer);
          }}
        >
          {UI.jokes.reveal}
        </Button>
      )}
      {telling && (
        <BottomSheet
          labelledBy={`${titleId}-tell`}
          onClose={() => {
            setTelling(false);
          }}
        >
          <div className={styles.tell}>
            <h2 id={`${titleId}-tell`} className={styles.tellQuestion}>
              {joke.question}
            </h2>
            <p className={styles.tellAnswer}>{joke.answer}</p>
            <Button
              block
              onClick={() => {
                setTelling(false);
              }}
            >
              {UI.jokes.close}
            </Button>
          </div>
        </BottomSheet>
      )}
    </section>
  );
}
