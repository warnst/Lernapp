import { useMemo } from 'react';
import { UI } from '@/content/ui';
import { hashSeed, mulberry32, shuffle } from '@/domain/random';
import { renderText, speakText } from '@/domain/text';
import type { ChoiceAnswer, ChoiceOption } from '@/domain/types';
import { Container } from '@/illustrations/Container';
import { ItemIcon } from '@/illustrations/ItemIcon';
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
  const options = useMemo(
    () => (answer.shuffle ? shuffle(mulberry32(hashSeed(seedId)), answer.options) : answer.options),
    [answer, seedId],
  );
  const pictorial = answer.layout === 'coins' || answer.layout === 'bags';
  const gridClass =
    options.length === 2 ? styles.two : options.length === 4 || pictorial ? styles.four : undefined;

  return (
    <div className={cx(styles.cards, gridClass)}>
      {options.map((option) => {
        const isTried = tried.includes(option.id);
        const isCorrect = solved && option.correct === true;
        const textOnly = answer.layout === 'bags' && !option.pieces && !option.objects;
        return (
          <button
            key={option.id}
            type="button"
            className={cx(
              styles.card,
              isTried && styles.tried,
              isCorrect && styles.correct,
              (textOnly || answer.layout === 'yesno' || answer.layout === 'bags') &&
                styles.textCard,
              textOnly && styles.wide,
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
        );
      })}
    </div>
  );
}
