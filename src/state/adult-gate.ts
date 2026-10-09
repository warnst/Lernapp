import { randomInt, type Rng } from '@/domain/random';

// Erwachsenen-Frage (docs/09 Abschnitt 4): zweistellige × einstellige Zahl, Ergebnis über 60.

export interface AdultQuestion {
  a: number;
  b: number;
  answer: number;
}

export const ADULT_UNLOCK_MS = 10 * 60 * 1000;

export function makeAdultQuestion(rng: Rng): AdultQuestion {
  for (;;) {
    const a = randomInt(rng, 10, 99);
    const b = randomInt(rng, 2, 9);
    if (a * b > 60) return { a, b, answer: a * b };
  }
}
