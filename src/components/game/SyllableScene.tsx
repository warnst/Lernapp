import type { SyllableScene as SyllableSceneData } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import { canSpeak, speakNow } from '@/speech/speak';
import { SyllableText } from './SyllableText';
import styles from './SyllableScene.module.css';

/** Bühne für Lese- und Silben-Aufgaben (Groß/Klein-Paare, Silbenwörter, Hörproben, Mini-Geschichten). */
export function SyllableScene({ scene }: { scene: SyllableSceneData }) {
  if (scene.mode === 'letter-pair' && scene.letter) {
    const { upper, lower, anchorWord, itemId, speak } = scene.letter;
    return (
      <div className={styles.wrap}>
        <button
          type="button"
          className={styles.letterCard}
          aria-label={`Buchstabe ${upper} anhören`}
          onClick={() => {
            speakNow(speak);
          }}
        >
          <span className={styles.bigLetter}>{upper}</span>
          {lower !== undefined && <span className={styles.smallLetter}>{lower}</span>}
          {itemId !== undefined && (
            <span className={styles.anchor}>
              <ItemIcon itemId={itemId} size={64} />
              {anchorWord !== undefined && <span>{anchorWord}</span>}
            </span>
          )}
          {canSpeak() && <UiIcon name="lautsprecher" size={28} />}
        </button>
      </div>
    );
  }

  if (scene.mode === 'word' && scene.word) {
    const { syllables, itemId, speak, speakSyllables, uppercase } = scene.word;
    return (
      <div className={styles.wrap}>
        <div className={styles.wordBox}>
          {itemId !== undefined && <ItemIcon itemId={itemId} size={72} />}
          <SyllableText
            syllables={syllables}
            uppercase={uppercase ?? false}
            interactive
            {...(speakSyllables ? { speakSyllables } : {})}
            size="xl"
          />
          {canSpeak() && (
            <button
              type="button"
              className={styles.listenBtn}
              onClick={() => {
                speakNow(speak);
              }}
            >
              <UiIcon name="lautsprecher" size={24} /> Ganzes Wort hören
            </button>
          )}
        </div>
        <p className={styles.tapHint}>Tipp: Tippe eine Silbe an, wenn du Hilfe brauchst!</p>
      </div>
    );
  }

  if (scene.mode === 'listen' && scene.listen) {
    const { speak, buttonLabel, itemId } = scene.listen;
    return (
      <div className={styles.listenWrap}>
        {itemId !== undefined && (
          <div className={styles.pictureBadge}>
            <ItemIcon itemId={itemId} size={84} />
          </div>
        )}
        {canSpeak() && (
          <button
            type="button"
            className={styles.listenBtn}
            onClick={() => {
              speakNow(speak);
            }}
          >
            <UiIcon name="lautsprecher" size={28} />
            {buttonLabel ?? 'Nochmal anhören'}
          </button>
        )}
      </div>
    );
  }

  if (scene.mode === 'story' && scene.story) {
    const { sentences, itemId, speak } = scene.story;
    return (
      <div className={styles.storyCard}>
        {itemId !== undefined && <ItemIcon itemId={itemId} size={64} />}
        <div className={styles.sentences}>
          {sentences.map((sentence, sIdx) => (
            <p key={sIdx} className={styles.sentence}>
              {sentence.map((word, wIdx) => {
                const spokenWord = word.speak ?? word.syllables.join('');
                return (
                  <button
                    key={`${String(sIdx)}-${String(wIdx)}`}
                    type="button"
                    className={styles.storyWordBtn}
                    aria-label={`${spokenWord} vorlesen`}
                    onClick={() => {
                      speakNow(spokenWord);
                    }}
                  >
                    <SyllableText syllables={word.syllables} size="md" />
                  </button>
                );
              })}
            </p>
          ))}
        </div>
        {canSpeak() && speak !== undefined && (
          <button
            type="button"
            className={styles.listenBtn}
            onClick={() => {
              speakNow(speak);
            }}
          >
            <UiIcon name="lautsprecher" size={24} /> Geschichte vorlesen
          </button>
        )}
      </div>
    );
  }

  return null;
}
