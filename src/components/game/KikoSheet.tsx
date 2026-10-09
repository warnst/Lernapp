import { useEffect, useRef } from 'react';
import { DIRECTION_TEXTS } from '@/content/feedback';
import { UI } from '@/content/ui';
import type { KikoPose } from '@/domain/hints';
import { renderText, speakText } from '@/domain/text';
import type { TaskPart } from '@/domain/types';
import { Kiko } from '@/illustrations/Kiko';
import { UiIcon } from '@/illustrations/UiIcon';
import { toggleSpeak } from '@/speech/speak';
import type { SheetContent } from '@/state/play';
import { Button } from '../Button';
import { cx } from '../cx';
import styles from './KikoSheet.module.css';

interface View {
  pose: KikoPose;
  lines: { text: string; strong?: boolean }[];
  button: string;
  correct: boolean;
}

function hintText(part: TaskPart, level: 1 | 2 | 3): string {
  if (level === 3) return part.explanation;
  return level === 1 ? part.hints[0] : part.hints[1];
}

/** Baut den Inhalt nach docs/01 5.5 zusammen. */
function view(content: SheetContent, part: TaskPart): View {
  if (content.kind === 'hint') {
    return {
      pose: 'zeigt',
      lines: [{ text: hintText(part, content.level) }],
      button: UI.play.retry,
      correct: false,
    };
  }
  const { plan, result, poolText } = content;
  const lines: View['lines'] = [];
  if (poolText !== undefined) lines.push({ text: poolText, strong: true });
  if (plan.specific !== undefined) lines.push({ text: plan.specific });
  if (plan.direction !== undefined) lines.push({ text: DIRECTION_TEXTS[plan.direction] });
  if (plan.note !== undefined) lines.push({ text: plan.note });
  const solved = result.status === 'correct' && result.remaining === undefined;
  if (solved && part.praise !== undefined) lines.push({ text: part.praise });
  if (plan.show === 'hint1') lines.push({ text: part.hints[0] });
  if (plan.show === 'hint2') lines.push({ text: part.hints[1] });
  if (plan.show === 'explanation') {
    lines.push({ text: solved ? `${UI.play.howTo}${part.explanation}` : part.explanation });
  }
  const button = { weiter: UI.play.next, nochmal: UI.play.retry, 'jetzt-ich': UI.play.myTurn }[
    plan.button
  ];
  return { pose: plan.pose, lines, button, correct: result.status === 'correct' };
}

/** Rückmeldung von unten; der Aufgabenbereich darüber bleibt sichtbar. */
export function KikoSheet({
  content,
  part,
  autoRead,
  onClose,
}: {
  content: SheetContent;
  part: TaskPart;
  autoRead: boolean;
  onClose: () => void;
}) {
  const { pose, lines, button, correct } = view(content, part);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const spoken = lines.map((line) => speakText(line.text)).join(' ');

  useEffect(() => {
    buttonRef.current?.focus();
    if (autoRead) toggleSpeak(spoken);
  }, [autoRead, spoken]);

  return (
    <section className={cx(styles.sheet, correct && styles.correct)} aria-label={UI.play.kikoSays}>
      <div className={styles.head}>
        <Kiko pose={pose} size={80} />
        <div className={styles.text} aria-live="polite">
          {correct && (
            <span className={styles.status}>
              <UiIcon name="haken" size={22} />
            </span>
          )}
          {lines.map((line, i) => (
            <p key={i} className={line.strong ? styles.strong : undefined}>
              {renderText(line.text)}
            </p>
          ))}
        </div>
      </div>
      <Button ref={buttonRef} block onClick={onClose}>
        {button}
      </Button>
    </section>
  );
}
