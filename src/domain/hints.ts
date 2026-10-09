import type { CheckResult, Direction } from './check';
import type { Answer } from './types';
import { pick, type Rng } from './random';

// Tipp-Stufen und Ablauf der Rückmeldung (docs/03 Abschnitt 7, docs/01 Abschnitt 5.5 und 6.1).

export interface PartState {
  wrongCount: number;
  hintsOpened: number;
  solved: boolean;
}

/** 0: nichts · 1: hints[0] · 2: hints[1] · 3: explanation */
export type HintLevel = 0 | 1 | 2 | 3;

export function hintLevel(state: PartState): HintLevel {
  const level = Math.min(3, Math.max(state.wrongCount, state.hintsOpened, 0));
  return level as HintLevel; // durch min/max sicher im Bereich 0–3
}

/** Zufälliger Satz aus dem Pool, nie derselbe wie zuletzt (sofern der Pool mehr als einen hat). */
export function pickFeedback(pool: readonly string[], lastUsed: string | undefined, rng: Rng) {
  const candidates = pool.length > 1 ? pool.filter((text) => text !== lastUsed) : pool;
  return pick(rng, candidates);
}

export type KikoPose = 'hallo' | 'denkt' | 'freut-sich' | 'zeigt' | 'schlaeft';

/** Rückmeldungs-Pools aus docs/01, Abschnitt 3. */
export type FeedbackPool = 'correct-first' | 'correct-after' | 'wrong-1' | 'wrong-2' | 'wrong-3';

export interface FeedbackPlan {
  pose: KikoPose;
  pool?: FeedbackPool;
  /** spezifischer Hinweis aus der Prüfung (Option, mistakes, Feldzählung …) */
  specific?: string;
  /** „Das ist etwas zu viel/zu wenig.“ */
  direction?: Direction;
  note?: string;
  /** Was aus dem Aufgabenteil angezeigt wird. */
  show: 'none' | 'hint1' | 'hint2' | 'explanation';
  button: 'weiter' | 'nochmal' | 'jetzt-ich';
}

/**
 * Was Kiko nach dem Prüfen zeigt. `wrongCount` ist die Zahl der Fehlversuche
 * einschließlich dieses Versuchs.
 */
export function planFeedback(
  result: CheckResult,
  wrongCount: number,
  answerType: Answer['type'],
): FeedbackPlan {
  switch (result.status) {
    case 'correct':
      if (result.remaining !== undefined) {
        // pay-variants: Möglichkeit gemerkt, weitersuchen
        return { pose: 'freut-sich', pool: 'correct-first', show: 'none', button: 'weiter' };
      }
      return {
        pose: 'freut-sich',
        pool: wrongCount === 0 ? 'correct-first' : 'correct-after',
        ...(result.note === undefined ? {} : { note: result.note }),
        show: 'explanation',
        button: 'weiter',
      };
    case 'partial':
      return { pose: 'zeigt', specific: result.feedback, show: 'none', button: 'nochmal' };
    case 'wrong': {
      if (wrongCount >= 3) {
        return { pose: 'zeigt', pool: 'wrong-3', show: 'explanation', button: 'jetzt-ich' };
      }
      // Bei Mauer, Dreieck und Schloss hilft die Zählung bzw. das Rad bei jedem Versuch (docs/10).
      const keepSpecific = wrongCount === 1 || answerType === 'grid' || answerType === 'code';
      const specific = keepSpecific ? result.feedback : undefined;
      const extras = {
        ...(specific === undefined ? {} : { specific }),
        ...(result.direction === undefined ? {} : { direction: result.direction }),
      };
      if (wrongCount <= 1) {
        // Ein spezifischer Hinweis ersetzt Tipp 1; die Richtung allein nicht.
        const show = specific === undefined ? 'hint1' : 'none';
        return { pose: 'denkt', pool: 'wrong-1', ...extras, show, button: 'nochmal' };
      }
      return { pose: 'zeigt', pool: 'wrong-2', ...extras, show: 'hint2', button: 'nochmal' };
    }
  }
}
