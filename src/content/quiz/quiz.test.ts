import { describe, expect, it } from 'vitest';
import { ITEM_DRAWINGS } from '@/illustrations/item-drawings';
import { QUIZ, QUIZ_TOPICS } from './index';

// Inhaltstests für Kikos Wissenskiste (docs/12, Abschnitt 3.10).

const STUFEN = [1, 2, 3, 4] as const;
const END_PUNCTUATION = /[.!?“]$/;

describe('Kikos Wissenskiste (docs/12 3.10)', () => {
  it('120 Fragen, 20 je Thema, IDs und Fragen eindeutig', () => {
    expect(QUIZ).toHaveLength(120);
    expect(QUIZ_TOPICS).toHaveLength(6);
    for (const topic of QUIZ_TOPICS) {
      expect(
        QUIZ.filter((q) => q.topic === topic.id),
        topic.id,
      ).toHaveLength(20);
    }
    const ids = QUIZ.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const questions = QUIZ.map((q) => q.question);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it('ID beginnt mit dem Thema', () => {
    for (const q of QUIZ) {
      expect(q.id.startsWith(`${q.topic}-`), q.id).toBe(true);
    }
  });

  it('Stufenbereich gültig, Antwortanzahl passt zur Stufe, richtige Antwort gültig', () => {
    for (const q of QUIZ) {
      expect(q.from, q.id).toBeGreaterThanOrEqual(1);
      expect(q.from, q.id).toBeLessThanOrEqual(q.to);
      expect(q.to, q.id).toBeLessThanOrEqual(4);
      if (q.from <= 2) expect(q.answers, q.id).toHaveLength(3);
      else expect([3, 4], q.id).toContain(q.answers.length);
      expect(Number.isInteger(q.correct), q.id).toBe(true);
      expect(q.correct, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correct, q.id).toBeLessThan(q.answers.length);
    }
  });

  it('Antworten je Frage eindeutig, kurz und nur mit vorhandenen Icons', () => {
    for (const q of QUIZ) {
      const texts = q.answers.map((a) => a.text);
      expect(new Set(texts).size, q.id).toBe(texts.length);
      for (const answer of q.answers) {
        expect(answer.text.trim(), q.id).toBe(answer.text);
        expect(answer.text.split(' ').length, `${q.id}: ${answer.text}`).toBeLessThanOrEqual(4);
        if (answer.icon !== undefined) {
          expect(ITEM_DRAWINGS.has(answer.icon), `${q.id}: ${answer.icon}`).toBe(true);
        }
      }
    }
    for (const topic of QUIZ_TOPICS) {
      expect(ITEM_DRAWINGS.has(topic.icon), topic.id).toBe(true);
    }
  });

  it('jede Stufe hat je Thema mindestens 8 passende Fragen', () => {
    for (const topic of QUIZ_TOPICS) {
      for (const stufe of STUFEN) {
        const passend = QUIZ.filter(
          (q) => q.topic === topic.id && q.from <= stufe && stufe <= q.to,
        );
        expect(passend.length, `${topic.id}, Stufe ${String(stufe)}`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it('Frage endet mit ?, Tipp und Fakt sind ganze Sätze', () => {
    for (const q of QUIZ) {
      expect(q.question, q.id).toMatch(/\?$/);
      expect(q.hint.trim().length, q.id).toBeGreaterThan(0);
      expect(q.fact.trim().length, q.id).toBeGreaterThan(0);
      expect(q.hint, q.id).toMatch(END_PUNCTUATION);
      expect(q.fact, q.id).toMatch(END_PUNCTUATION);
    }
  });

  it('die richtige Antwort steht nicht immer an derselben Stelle', () => {
    const dreier = QUIZ.filter((q) => q.answers.length === 3);
    for (const position of [0, 1, 2]) {
      const anteil = dreier.filter((q) => q.correct === position).length / dreier.length;
      expect(anteil, `Position ${String(position)}`).toBeGreaterThanOrEqual(0.15);
    }
    const vierer = QUIZ.filter((q) => q.answers.length === 4);
    const positionen = new Set(vierer.map((q) => q.correct));
    expect(positionen.size).toBe(4);
  });
});
