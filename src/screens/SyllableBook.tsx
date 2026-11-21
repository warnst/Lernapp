import { Button, LinkButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { SyllableText } from '@/components/game/SyllableText';
import { LESEN_CHAPTERS } from '@/content/worlds/lesen/chapters';
import { chapterStars } from '@/state/lesen-progress';
import type { Profile } from '@/domain/types';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import { canSpeak, speakNow } from '@/speech/speak';
import styles from './SyllableBook.module.css';

/** „Mein Silbenbuch“ (/schaetze/silbenbuch): alle freigeschalteten Conni-artigen Silbengeschichten. */
export function SyllableBook({ profile }: { profile: Profile }) {
  const unlocked = LESEN_CHAPTERS.filter((c) => chapterStars(profile, c) === 3);

  return (
    <Screen title="Mein Silbenbuch" withNav>
      <LinkButton href="/lesen" variant="secondary">
        <UiIcon name="zurueck" /> Zur Silben-Insel
      </LinkButton>

      {unlocked.length === 0 ? (
        <div className={styles.empty}>
          <SpeechBubble kikoSize={64}>
            Hier sammelst du deine eigenen Silbengeschichten! Schaffe alle 3 Stationen eines
            Kapitels auf der Silben-Insel, dann erscheint deine erste Geschichte!
          </SpeechBubble>
          <LinkButton href="/lesen">Auf zur Silben-Insel!</LinkButton>
        </div>
      ) : (
        <div className={styles.list}>
          <p className={styles.tip}>
            Tippe ein Wort an, wenn Kiko es dir vorlesen soll – oder lies selbst Silbe für Silbe!
          </p>
          {unlocked.map((chapter) => {
            const page = chapter.storyBookPage;
            return (
              <article key={page.id} className={styles.pageCard}>
                <div className={styles.head}>
                  <ItemIcon itemId={page.itemId} size={64} />
                  <div>
                    <p className={styles.chapterTag}>
                      Seite {String(page.chapterNumber)} · {chapter.name}
                    </p>
                    <h2 className={styles.title}>{page.title}</h2>
                  </div>
                </div>
                <div className={styles.sentences}>
                  {page.sentences.map((sentence, sIdx) => (
                    <p key={sIdx} className={styles.sentence}>
                      {sentence.map((word, wIdx) => {
                        const spoken = word.speak ?? word.syllables.join('');
                        return (
                          <button
                            key={`${String(sIdx)}-${String(wIdx)}`}
                            type="button"
                            className={styles.wordBtn}
                            aria-label={`${spoken} vorlesen`}
                            onClick={() => {
                              speakNow(spoken);
                            }}
                          >
                            <SyllableText syllables={word.syllables} size="md" />
                          </button>
                        );
                      })}
                    </p>
                  ))}
                </div>
                {canSpeak() && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      speakNow(`${page.title}. ${page.fullSpeak}`);
                    }}
                  >
                    <UiIcon name="lautsprecher" /> Geschichte vorlesen
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
