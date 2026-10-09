import { type ReactNode, type SubmitEvent, useId, useState } from 'react';
import { Button, LinkButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { UI } from '@/content/ui';
import { mulberry32 } from '@/domain/random';
import { makeAdultQuestion } from '@/state/adult-gate';
import { useAppState } from '@/state/context';
import styles from './AdultArea.module.css';

function freshQuestion() {
  return makeAdultQuestion(mulberry32(crypto.getRandomValues(new Uint32Array(1))[0] ?? 1));
}

/** Erwachsenen-Frage vor dem Erwachsenen-Bereich (docs/09, Abschnitt 4). */
export function AdultArea({ children }: { children: ReactNode }) {
  const { adultUnlocked, unlockAdult } = useAppState();
  const inputId = useId();
  const [question, setQuestion] = useState(freshQuestion);
  const [value, setValue] = useState('');
  const [retry, setRetry] = useState(false);

  if (adultUnlocked) return children;

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    if (Number(value) === question.answer) {
      unlockAdult();
      return;
    }
    setRetry(true);
    setValue('');
    setQuestion(freshQuestion());
  };

  return (
    <Screen title={UI.adults.title}>
      <form className={styles.form} onSubmit={submit}>
        <label htmlFor={inputId} className={styles.question}>
          {UI.gate.question(question.a, question.b)}
        </label>
        <input
          id={inputId}
          className={styles.input}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={value}
          onChange={(event) => {
            setValue(event.target.value.replace(/\D/g, '').slice(0, 4));
          }}
        />
        <p className={styles.retry} aria-live="polite">
          {retry ? UI.gate.retry : ''}
        </p>
        <Button type="submit" block disabled={value === ''}>
          {UI.gate.submit}
        </Button>
        <LinkButton href="/" variant="ghost" block>
          {UI.gate.back}
        </LinkButton>
      </form>
    </Screen>
  );
}
