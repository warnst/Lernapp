import { LinkButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { JOKE_CATEGORIES } from '@/content/jokes';
import { UI } from '@/content/ui';
import type { Profile } from '@/domain/types';
import { UiIcon } from '@/illustrations/UiIcon';
import { toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { heardJokes } from '@/state/jokes';
import { towerOf } from '@/state/reducer';
import styles from './JokeBook.module.css';

/** Witzebuch: alle gehörten Witze nach Art, zum Vorlesen und mit Herz (docs/12 4.2). */
export function JokeBook({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const jokes = heardJokes(profile);
  const favorites = towerOf(profile).favorites;

  return (
    <Screen title={UI.jokes.book} withNav>
      {jokes.length === 0 && <SpeechBubble pose="denkt">{UI.jokes.bookEmpty}</SpeechBubble>}
      {JOKE_CATEGORIES.map((category) => {
        const own = jokes.filter((joke) => joke.category === category.id);
        if (own.length === 0) return null;
        return (
          <section key={category.id} className={styles.section}>
            <h2 className={styles.heading}>{category.label}</h2>
            <ul className={styles.list}>
              {own.map((joke) => {
                const favorite = favorites.includes(joke.id);
                return (
                  <li key={joke.id} className={styles.joke}>
                    <p className={styles.question}>{joke.question}</p>
                    <p className={styles.answer}>{joke.answer}</p>
                    <div className={styles.buttons}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={`${UI.jokes.read}: ${joke.question}`}
                        onClick={() => {
                          toggleSpeak(`${joke.question} ${joke.answer}`);
                        }}
                      >
                        <UiIcon name="lautsprecher" size={24} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={UI.jokes.favorite}
                        aria-pressed={favorite}
                        onClick={() => {
                          dispatch({ type: 'joke-favorite', id: profile.id, jokeId: joke.id });
                        }}
                      >
                        <UiIcon
                          name="herz"
                          size={24}
                          className={favorite ? styles.heart : undefined}
                        />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <LinkButton href="/schaetze" variant="secondary" block>
        {UI.treasures.title}
      </LinkButton>
    </Screen>
  );
}
