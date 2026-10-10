import { useCallback, useEffect, useId, useReducer, useState } from 'react';
import { useLocation } from 'wouter';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { AnswerArea, type PendingInput } from '@/components/game/AnswerArea';
import { KikoSheet } from '@/components/game/KikoSheet';
import styles from '@/components/game/Play.module.css';
import { ProgressShells } from '@/components/game/ProgressShells';
import { SceneView } from '@/components/game/SceneView';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { CHECK_TEXTS } from '@/content/check-texts';
import { UI } from '@/content/ui';
import { checkAnswer } from '@/domain/check';
import { formatMoney } from '@/domain/money';
import { renderText, speakText } from '@/domain/text';
import type { Answer, Profile, Task } from '@/domain/types';
import { UiIcon } from '@/illustrations/UiIcon';
import { canSpeak, stopSpeaking, toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { currentHintLevel, playReducer, startPlay } from '@/state/play';

const LETTERS = 'abc';

/** Kurzform der Lösung für den Chip „✓ a) 1,20 €“. */
function chipAnswer(answer: Answer): string {
  switch (answer.type) {
    case 'money':
      return formatMoney(answer.correct);
    case 'number':
      return String(answer.correct);
    case 'choice':
      return renderText(answer.options.find((o) => o.correct)?.label ?? '');
    default:
      return '✓';
  }
}

/**
 * Spiel-Bildschirm für eine Folge von Aufgaben (Station oder Übungsrunde, docs/01 5.4).
 * onAdvance meldet die nächste Stelle nach jedem gelösten Teil, onFinish das Ende.
 */
export function Game({
  profile,
  tasks,
  progressStyle,
  start,
  onAdvance,
  onFinish,
}: {
  profile: Profile;
  tasks: Task[];
  progressStyle: 'shells' | 'locks';
  start?: { taskIndex: number; partIndex: number };
  onAdvance?: (taskIndex: number, partIndex: number) => void;
  onFinish: () => void;
}) {
  const { dispatch } = useAppState();
  const [, navigate] = useLocation();
  const pauseTitle = useId();
  const config = STUFEN[profile.stufe];
  const [play, playDispatch] = useReducer(playReducer, undefined, () =>
    startPlay(tasks, start?.taskIndex, start?.partIndex),
  );
  const [pending, setPending] = useState<PendingInput | null>(null);
  const [paused, setPaused] = useState(false);

  const task = tasks[play.taskIndex];
  const part = task?.parts[play.partIndex];

  // Fortsetzen: Stelle nach jedem gelösten Teil melden (docs/03 8)
  useEffect(() => {
    if (play.finished || (play.taskIndex === 0 && play.partIndex === 0)) return;
    onAdvance?.(play.taskIndex, play.partIndex);
  }, [onAdvance, play.finished, play.taskIndex, play.partIndex]);

  useEffect(() => {
    if (play.finished) onFinish();
  }, [onFinish, play.finished]);

  // Zurück-Taste öffnet die Pause, statt die Seite zu verlassen (docs/01 4)
  useEffect(() => {
    window.history.pushState({ play: true }, '');
    const onPop = () => {
      window.history.pushState({ play: true }, '');
      setPaused(true);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      stopSpeaking();
    };
  }, []);

  const spokenTask =
    task && part
      ? [task.story, part.lead ?? '', part.question].filter(Boolean).map(speakText).join(' ')
      : '';
  useEffect(() => {
    if (config.autoRead && spokenTask !== '') toggleSpeak(spokenTask);
  }, [config.autoRead, spokenTask]);

  const close = useCallback(() => {
    if (play.solvedPart && part) {
      dispatch({ type: 'record-part', id: profile.id, partId: part.id, ...play.solvedPart });
    }
    stopSpeaking();
    playDispatch({ type: 'close' });
  }, [dispatch, part, play.solvedPart, profile.id]);

  if (!task || !part) return null;

  const submit = (input: PendingInput) => {
    const result = checkAnswer(part.answer, input, CHECK_TEXTS, part.mistakes);
    playDispatch({
      type: 'checked',
      result,
      answerType: part.answer.type,
      roll: Math.random(),
      ...(input.type === 'choice' ? { optionId: input.optionId } : {}),
      ...(input.type === 'pay-variants' ? { pieces: input.pieces } : {}),
    });
  };

  const solved =
    play.sheet?.kind === 'check' &&
    play.sheet.result.status === 'correct' &&
    play.sheet.result.remaining === undefined;
  const checkLabel = part.answer.type === 'code' ? UI.play.open : UI.play.check;
  const partKey = `${part.id}-${String(play.found.length)}`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={UI.play.pause}
          onClick={() => {
            setPaused(true);
          }}
        >
          <UiIcon name="schliessen" size={28} />
        </button>
        <ProgressShells total={tasks.length} current={play.taskIndex} style={progressStyle} />
        {canSpeak() ? (
          <button
            type="button"
            className={styles.iconButton}
            aria-label={UI.play.read}
            onClick={() => {
              toggleSpeak(spokenTask);
            }}
          >
            <UiIcon name="lautsprecher" size={28} />
          </button>
        ) : (
          <span className={styles.iconButton} />
        )}
      </header>

      <main className={styles.body}>
        <div className={styles.column}>
          <SceneView key={task.id} scene={task.scene} />
          <p className={styles.story}>{renderText(task.story)}</p>
        </div>
        <div className={styles.column}>
          {play.partIndex > 0 && (
            <div className={styles.chips}>
              {task.parts.slice(0, play.partIndex).map((done, i) => (
                <span key={done.id} className={styles.chip}>
                  <UiIcon name="haken" size={18} />
                  {UI.play.solvedChip(LETTERS.charAt(i), chipAnswer(done.answer))}
                </span>
              ))}
            </div>
          )}
          {part.lead !== undefined && <p className={styles.story}>{renderText(part.lead)}</p>}
          <h1 className={styles.question}>{renderText(part.question)}</h1>
          <AnswerArea
            key={partKey}
            task={task}
            part={part}
            config={config}
            tried={play.tried}
            found={play.found}
            solved={solved}
            onPending={setPending}
            onSubmit={submit}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Button
            variant="secondary"
            onClick={() => {
              playDispatch({ type: 'open-hint' });
            }}
          >
            <UiIcon name="gluehbirne" /> {UI.play.hint}
          </Button>
          {currentHintLevel(play) >= 2 && (
            <Button
              variant="ghost"
              onClick={() => {
                playDispatch({ type: 'show-solution' });
              }}
            >
              {UI.play.solution}
            </Button>
          )}
          {part.answer.type !== 'choice' && (
            <Button
              disabled={pending === null}
              onClick={() => {
                if (pending) submit(pending);
              }}
            >
              {part.answer.type === 'pay-variants' ? UI.coins.remember : checkLabel}
            </Button>
          )}
        </div>
      </footer>

      {play.sheet && (
        <KikoSheet content={play.sheet} part={part} autoRead={config.autoRead} onClose={close} />
      )}

      {paused && (
        <BottomSheet
          labelledBy={pauseTitle}
          onClose={() => {
            setPaused(false);
          }}
        >
          <div className={styles.pause}>
            <h2 id={pauseTitle}>
              <SpeechBubble pose="schlaeft">{UI.play.pauseQuestion}</SpeechBubble>
            </h2>
            <Button
              block
              onClick={() => {
                setPaused(false);
              }}
            >
              {UI.play.resume}
            </Button>
            <Button
              variant="secondary"
              block
              onClick={() => {
                navigate('/');
              }}
            >
              {UI.play.toMap}
            </Button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
