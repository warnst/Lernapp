import type { Direction } from '@/domain/check';
import type { FeedbackPool } from '@/domain/hints';

// Rückmeldungs-Pools aus docs/01, Abschnitt 3. Kiko wählt zufällig, nie zweimal hintereinander denselben.

export const FEEDBACK_POOLS: Record<FeedbackPool, readonly string[]> = {
  'correct-first': [
    'Richtig! Du bist dem Schatz einen Schritt näher.',
    'Genau so! Gut gerechnet.',
    'Stimmt! Das hast du dir gut überlegt.',
    'Super, das passt!',
    'Klasse! Ich mache einen Freudensprung.',
  ],
  'correct-after': [
    'Geschafft! Du bist drangeblieben.',
    'Jetzt passt es! Dranbleiben lohnt sich.',
    'Richtig! Fehler sind Hinweise, und du hast sie genutzt.',
  ],
  'wrong-1': [
    'Noch nicht ganz. Schau dir meinen Tipp an.',
    'Fast! Probier es noch einmal.',
    'Das passt noch nicht. Fehler sind Hinweise.',
  ],
  'wrong-2': ['Lass uns zusammen rechnen.', 'Ich helfe dir ein Stück weiter.'],
  'wrong-3': ['Ich zeige dir, wie es geht. Danach bist du dran.'],
};

export const PAUSE_TEXT = 'Gute Idee, mach eine Pause! Ich merke mir, wo wir waren.';

/** Hinweis bei Geldeingaben ohne passenden mistakes-Eintrag (docs/01, 5.5). */
export const DIRECTION_TEXTS: Record<Direction, string> = {
  'too-much': 'Das ist etwas zu viel.',
  'too-little': 'Das ist etwas zu wenig.',
};
