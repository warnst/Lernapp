import { SceneView } from '@/components/game/SceneView';
import { PRINT } from '@/content/print';
import { renderText } from '@/domain/text';
import type { Answer, StufeConfig, Task } from '@/domain/types';
import { UiIcon } from '@/illustrations/UiIcon';
import { cx } from '@/components/cx';
import { instructionFor } from './instruction';
import { PaperAnswer } from './PaperAnswer';
import styles from './Paper.module.css';

const LETTERS = 'abc';

/** Rechenkästchen nur, wo gerechnet wird; nicht beim Münzenmalen, Ordnen oder bei Rätselfeldern. */
const NEEDS_WORKINGS = new Set<Answer['type']>(['choice', 'money', 'number', 'select']);

/** Breite Antworten (Karten, Münzen) stehen bei einteiligen Aufgaben unter Szene und Rechenkästchen. */
function isWide(answer: Answer): boolean {
  if (answer.type === 'choice') return answer.layout === 'coins' || answer.layout === 'bags';
  return ['select', 'order', 'pay', 'pay-variants'].includes(answer.type);
}

/** Bild-Symbol für die Tätigkeit auf den Bucht-Blättern (docs/06 1). */
function Activity({ answer }: { answer: Answer }) {
  if (answer.type === 'choice') {
    return (
      <span className={styles.activity}>
        <UiIcon name="stift" size={20} />
        {PRINT.activity.cross}
      </span>
    );
  }
  if (answer.type === 'number') {
    return (
      <span className={styles.activity}>
        <UiIcon name="hand-zahl" size={20} />
        {PRINT.activity.write}
      </span>
    );
  }
  if (answer.type === 'pay') {
    return (
      <span className={styles.activity}>
        <UiIcon name="muenzen" size={20} />
        {PRINT.activity.coins}
      </span>
    );
  }
  return null;
}

/** Eine Aufgabe auf dem Arbeitsblatt: Nummer, Titel, Szene, Geschichte, Teile mit Antwortfeld. */
export function PaperTask({
  task,
  index,
  cfg,
  workings,
}: {
  task: Task;
  index: number;
  cfg: StufeConfig;
  /** Rechenkästchen neben der Aufgabe (docs/06 3) */
  workings: boolean;
}) {
  const multi = task.parts.length > 1;
  const bay = cfg.world === 'kleine-bucht';
  const hasScene = task.scene.kind !== 'none';
  const showWorkings = workings && task.parts.some((p) => NEEDS_WORKINGS.has(p.answer.type));
  const hasSide = hasScene || showWorkings;
  const only = task.parts.length === 1 ? task.parts[0] : undefined;
  const wideBelow = only !== undefined && isWide(only.answer);
  return (
    <section className={cx(styles.task, 'print-task')}>
      <h2 className={styles.taskHead}>
        <span className={styles.number}>{index + 1}</span>
        {task.title}
        {bay && task.parts[0] && <Activity answer={task.parts[0].answer} />}
      </h2>
      <div className={cx(styles.body, !hasSide && styles.single)}>
        <div className={styles.main}>
          {task.story !== '' && <p>{renderText(task.story)}</p>}
          {task.parts.map((part, i) => {
            const instruction = instructionFor(part.answer);
            return (
              <div key={part.id} className={styles.part}>
                {part.lead !== undefined && <p>{renderText(part.lead)}</p>}
                <p className={styles.question}>
                  {multi && `${LETTERS.charAt(i)}) `}
                  {renderText(part.question)}
                </p>
                {instruction && !bay && <p className={styles.instruction}>{instruction}</p>}
                {!wideBelow && <PaperAnswer task={task} answer={part.answer} cfg={cfg} />}
              </div>
            );
          })}
        </div>
        {hasSide && (
          <div className={styles.side}>
            {hasScene && (
              <div className={styles.scene}>
                <SceneView scene={task.scene} />
              </div>
            )}
            {showWorkings && (
              <div className={styles.workings}>
                <span>{PRINT.workings}</span>
                <span className={styles.grid} />
              </div>
            )}
          </div>
        )}
      </div>
      {wideBelow && <PaperAnswer task={task} answer={only.answer} cfg={cfg} />}
    </section>
  );
}
