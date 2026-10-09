import { describe, expect, it } from 'vitest';
import { hintLevel, pickFeedback, planFeedback } from './hints';
import { mulberry32 } from './random';

describe('hintLevel', () => {
  it.each([
    [0, 0, 0],
    [1, 0, 1],
    [0, 1, 1],
    [2, 1, 2],
    [1, 2, 2],
    [3, 0, 3],
    [5, 7, 3],
  ])('Fehlversuche %i, geöffnete Tipps %i → Stufe %i', (wrongCount, hintsOpened, expected) => {
    expect(hintLevel({ wrongCount, hintsOpened, solved: false })).toBe(expected);
  });
});

describe('pickFeedback', () => {
  const pool = ['Super, das passt!', 'Genau so! Gut gerechnet.', 'Klasse!'];

  it('wiederholt nie den zuletzt benutzten Satz', () => {
    const rng = mulberry32(11);
    let last: string | undefined;
    for (let i = 0; i < 200; i++) {
      const next = pickFeedback(pool, last, rng);
      expect(next).not.toBe(last);
      expect(pool).toContain(next);
      last = next;
    }
  });

  it('nutzt bei nur einem Satz diesen immer wieder', () => {
    const only = ['Ich zeige dir, wie es geht. Danach bist du dran.'];
    expect(pickFeedback(only, only[0], mulberry32(1))).toBe(only[0]);
  });
});

describe('planFeedback', () => {
  it('richtig beim ersten Versuch: freut sich, Lösungsweg kurz, weiter', () => {
    expect(planFeedback({ status: 'correct' }, 0, 'choice')).toEqual({
      pose: 'freut-sich',
      pool: 'correct-first',
      show: 'explanation',
      button: 'weiter',
    });
  });

  it('richtig nach Fehlversuchen: anderer Pool, Hinweis zur Schreibweise bleibt', () => {
    expect(planFeedback({ status: 'correct', note: '120 Cent …' }, 2, 'money')).toEqual({
      pose: 'freut-sich',
      pool: 'correct-after',
      note: '120 Cent …',
      show: 'explanation',
      button: 'weiter',
    });
  });

  it('pay-variants: gemerkte Möglichkeit ohne Lösungsweg', () => {
    expect(planFeedback({ status: 'correct', remaining: 1 }, 0, 'pay-variants')).toEqual({
      pose: 'freut-sich',
      pool: 'correct-first',
      show: 'none',
      button: 'weiter',
    });
  });

  it('partial: zeigt den Hinweis, ohne Pool', () => {
    expect(planFeedback({ status: 'partial', feedback: 'Weniger Münzen?' }, 0, 'pay')).toEqual({
      pose: 'zeigt',
      specific: 'Weniger Münzen?',
      show: 'none',
      button: 'nochmal',
    });
  });

  it('1. Fehlversuch mit Hinweis: Hinweis ersetzt Tipp 1', () => {
    expect(planFeedback({ status: 'wrong', feedback: 'Zweimal gezählt?' }, 1, 'choice')).toEqual({
      pose: 'denkt',
      pool: 'wrong-1',
      specific: 'Zweimal gezählt?',
      show: 'none',
      button: 'nochmal',
    });
  });

  it('1. Fehlversuch nur mit Richtung: Richtung und Tipp 1', () => {
    expect(planFeedback({ status: 'wrong', direction: 'too-much' }, 1, 'money')).toEqual({
      pose: 'denkt',
      pool: 'wrong-1',
      direction: 'too-much',
      show: 'hint1',
      button: 'nochmal',
    });
  });

  it('2. Fehlversuch: Tipp 2, spezifischer Hinweis nur bei Mauer, Dreieck und Schloss', () => {
    expect(planFeedback({ status: 'wrong', feedback: 'x' }, 2, 'choice')).toEqual({
      pose: 'zeigt',
      pool: 'wrong-2',
      show: 'hint2',
      button: 'nochmal',
    });
    expect(planFeedback({ status: 'wrong', feedback: '1 Feld stimmt.' }, 2, 'grid')).toMatchObject({
      specific: '1 Feld stimmt.',
      show: 'hint2',
    });
    expect(planFeedback({ status: 'wrong', feedback: 'Stern' }, 2, 'code')).toMatchObject({
      specific: 'Stern',
    });
  });

  it('3. Fehlversuch und später: Lösungsweg und „Jetzt ich!“', () => {
    for (const count of [3, 4, 9]) {
      expect(planFeedback({ status: 'wrong', feedback: 'x' }, count, 'money')).toEqual({
        pose: 'zeigt',
        pool: 'wrong-3',
        show: 'explanation',
        button: 'jetzt-ich',
      });
    }
  });
});
