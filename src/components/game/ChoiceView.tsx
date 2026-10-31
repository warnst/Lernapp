import { useMemo } from 'react';
import { UI } from '@/content/ui';
import { choiceOrder } from '@/domain/choice';
import { renderText, speakText } from '@/domain/text';
import type { ChoiceAnswer, ChoiceOption } from '@/domain/types';
import { Container } from '@/illustrations/Container';
import { ClockFace } from '@/illustrations/ClockFace';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { ShapeIcon } from '@/illustrations/ShapeIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import { toggleSpeak } from '@/speech/speak';
import { cx } from '../cx';
import styles from './Answer.module.css';
import { MoneyPieceView } from './MoneyPieceView';

function OptionBody({ option, layout }: { option: ChoiceOption; layout: ChoiceAnswer['layout'] }) {
  if (layout === 'coins' && option.pieces) {
    return (
      <>
        {option.pieces.map((piece, i) => (
          <MoneyPieceView key={i} value={piece} />
        ))}
      </>
    );
  }
  if (layout === 'bags' && (option.pieces || option.objects)) {
    const kind = option.objects ? 'eimer' : option.icon ? 'beutel' : 'geldboerse';
    return (
      <>
        <Container kind={kind} symbol={option.icon} size={72} />
        <span>{renderText(option.label)}</span>
        <span className={styles.mini}>
          {option.pieces?.map((piece, i) => (
            <MoneyPieceView key={i} value={piece} scale={48} />
          ))}
          {option.objects &&
            Array.from({ length: option.objects.count }, (_, i) => (
              <ItemIcon key={i} itemId={option.objects?.itemId ?? ''} size={28} />
            ))}
        </span>
      </>
    );
  }
  if (option.clock) {
    return (
      <>
        <ClockFace time={option.clock} size={96} />
        <span className={styles.visuallyHidden}>{option.label}</span>
      </>
    );
  }
  if (option.shape) {
    return (
      <>
        <ShapeIcon shape={option.shape} size={64} />
        <span className={styles.visuallyHidden}>{option.label}</span>
      </>
    );
  }
  if (option.icon && option.shadow) {
    const { rotate, mirror } = option.shadow;
    return (
      <>
        <span
          className={styles.shadow}
          style={{ transform: `rotate(${String(rotate)}deg) scaleX(${mirror ? '-1' : '1'})` }}
        >
          <ItemIcon itemId={option.icon} size={64} />
        </span>
        <span>{option.label}</span>
      </>
    );
  }
  if (option.icon) {
    return (
      <>
        <ItemIcon itemId={option.icon} size={56} />
        <span>{option.label}</span>
      </>
    );
  }
  return <span>{renderText(option.label)}</span>;
}

const LONG_LABEL = 16;

/**
 * Antwortkarten: 2 nebeneinander, 3 untereinander, 4 im 2 × 2-Raster; Münz- und Beutelkarten
 * immer im Raster (docs/02 5). Geprüft wird sofort beim Antippen.
 */
export function ChoiceView({
  answer,
  seedId,
  tried,
  solved,
  readOnTap,
  onPick,
}: {
  answer: ChoiceAnswer;
  seedId: string;
  tried: readonly string[];
  solved: boolean;
  readOnTap: boolean;
  onPick: (optionId: string) => void;
}) {
  const options = useMemo(() => choiceOrder(answer, seedId), [answer, seedId]);
  const pictorial = answer.layout === 'coins' || answer.layout === 'bags';
  // ganze Sätze als Antwort (z. B. „Wie viel Geld hat Mara noch?“) in kleinerer Schrift
  const sentences = options.some((option) => renderText(option.label).length > LONG_LABEL);
  const gridClass =
    options.length === 2 ? styles.two : options.length === 4 || pictorial ? styles.four : undefined;

  return (
    <div className={cx(styles.cards, gridClass)}>
      {options.map((option) => {
        const isTried = tried.includes(option.id);
        const isCorrect = solved && option.correct === true;
        const textOnly = answer.layout === 'bags' && !option.pieces && !option.objects;
        const hasVisibleText =
          answer.layout !== 'coins' && option.clock === undefined && option.shape === undefined;
        return (
          <div key={option.id} className={cx(styles.cardRow, textOnly && styles.wide)}>
            <button
              type="button"
              className={cx(
                styles.card,
                isTried && styles.tried,
                isCorrect && styles.correct,
                (textOnly || sentences || answer.layout === 'yesno' || answer.layout === 'bags') &&
                  styles.textCard,
              )}
              disabled={isTried || solved}
              aria-label={pictorial ? renderText(option.label) : undefined}
              onClick={() => {
                if (readOnTap) toggleSpeak(speakText(option.label));
                onPick(option.id);
              }}
            >
              <OptionBody option={option} layout={answer.layout} />
              {isTried && (
                <span className={styles.mark}>
                  <UiIcon name="zurueck" size={16} /> {UI.play.tried}
                </span>
              )}
              {isCorrect && (
                <span className={styles.mark}>
                  <UiIcon name="haken" size={18} />
                </span>
              )}
            </button>
            {hasVisibleText && (
              <button
                type="button"
                className={styles.speakOption}
                aria-label="Antwort vorlesen"
                onClick={() => {
                  toggleSpeak(speakText(option.label));
                }}
              >
                <UiIcon name="lautsprecher" size={24} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
