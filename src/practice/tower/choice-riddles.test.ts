import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { ODD_CATEGORIES } from '@/content/odd';
import { QUIZ } from '@/content/quiz';
import type { ChoiceAnswer, Stufe, Task } from '@/domain/types';
import { oddRound, quizPool, quizRound, quizTask, shadowRound } from './choice-riddles';

const STUFEN_LIST = [1, 2, 3, 4] as Stufe[];

function choice(task: Task): ChoiceAnswer {
  const answer = task.parts[0]?.answer;
  if (answer?.type !== 'choice') throw new Error('keine Auswahl');
  return answer;
}

describe('Was passt nicht?', () => {
  for (const stufe of STUFEN_LIST) {
    it(`Stufe ${String(stufe)}: 4 Karten, genau eine passt nicht, Erklärung nennt alle`, () => {
      const cfg = STUFEN[stufe].tower.odd;
      for (let seed = 1; seed <= 300; seed++) {
        for (const task of oddRound(cfg, stufe, 3, seed)) {
          const { options } = choice(task);
          expect(options).toHaveLength(4);
          expect(options.filter((o) => o.correct)).toHaveLength(1);
          expect(new Set(options.map((o) => o.id)).size).toBe(4);
          const part = task.parts[0];
          for (const o of options) expect(part?.explanation).toContain(o.label);
          if (options.every((o) => o.icon)) {
            // die drei anderen stammen aus derselben Kategorie, das fremde Ding nicht
            const same = options.filter((o) => !o.correct).map((o) => o.icon);
            const group = ODD_CATEGORIES.find((c) =>
              same.every((i) => c.things.some((t) => t.icon === i)),
            );
            const stranger = options.find((o) => o.correct)?.icon;
            expect(group).toBeDefined();
            expect(group?.from).toBeLessThanOrEqual(stufe);
            expect(group?.things.some((t) => t.icon === stranger)).toBe(false);
          } else {
            expect(cfg.numbers).toBe(true);
            for (const o of options) expect(Number(o.label)).toBeLessThanOrEqual(cfg.max);
          }
        }
      }
    });
  }
});

describe('Schattenrätsel', () => {
  for (const stufe of STUFEN_LIST) {
    it(`Stufe ${String(stufe)}: Schatten wie in levels.ts`, () => {
      const cfg = STUFEN[stufe].tower.shadow;
      for (let seed = 1; seed <= 100; seed++) {
        const tasks = shadowRound(cfg, 3, seed);
        expect(
          new Set(tasks.map((t) => t.scene.kind === 'items' && t.scene.items[0]?.itemId)).size,
        ).toBe(3);
        for (const task of tasks) {
          const { options } = choice(task);
          expect(options).toHaveLength(cfg.options);
          const right = options.find((o) => o.correct);
          expect(task.scene.kind === 'items' && task.scene.items[0]?.itemId).toBe(right?.icon);
          if (cfg.rotate) expect(right?.shadow?.rotate).not.toBe(0);
          else for (const o of options) expect(o.shadow).toEqual({ rotate: 0, mirror: false });
          expect(right?.shadow?.mirror).toBe(cfg.mirror);
          expect(options.map((o) => o.label)).toEqual(
            options.map((_, i) => `Schatten ${String(i + 1)}`),
          );
        }
      }
    });
  }
});

describe('Wissensfragen', () => {
  it('Runde: passende Stufe, erst neue Karten, Tipps, Fakt als Lob', () => {
    const pool = quizPool(1, 'tiere');
    expect(pool.length).toBeGreaterThanOrEqual(8);
    const known = pool.slice(0, pool.length - 2).map((q) => q.id);
    const round = quizRound(1, 'tiere', known, 5, 9);
    expect(round).toHaveLength(5);
    expect(round.slice(0, 2).every((q) => !known.includes(q.id))).toBe(true);
    expect(quizRound(4, null, [], 5, 1).every((q) => q.from <= 4 && q.to >= 4)).toBe(true);

    const question = QUIZ[0];
    if (!question) throw new Error('keine Fragen');
    const task = quizTask(question);
    const part = task.parts[0];
    expect(
      choice(task)
        .options.filter((o) => o.correct)
        .map((o) => o.label),
    ).toEqual([question.answers[question.correct]?.text]);
    expect(part?.praise).toBe(`Wusstest du? ${question.fact}`);
    expect(part?.hints[1]).toMatch(/Es ist nicht/);
  });
});
