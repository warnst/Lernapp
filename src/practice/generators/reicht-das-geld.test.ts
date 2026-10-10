import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { sumPieces } from '@/domain/money';
import { mulberry32 } from '@/domain/random';
import { renderText } from '@/domain/text';
import type { ChoiceAnswer, Stufe, Task } from '@/domain/types';
import type { GenerateOptions, Generator } from '../types';
import { REICHT_DAS_GELD_GENERATORS } from './reicht-das-geld';

const [G1, G2, G3, G4] = REICHT_DAS_GELD_GENERATORS;
if (!G1 || !G2 || !G3 || !G4) throw new Error('Vorlagen fehlen');

const SEEDS = 60;

/** Anzeige-Text mit normalen Leerzeichen statt geschützten. */
const show = (text: string) => renderText(text).replaceAll('\u00A0', ' ');

function tasks(generator: Generator, stufe: Stufe, opts?: GenerateOptions, seeds = SEEDS): Task[] {
  const result: Task[] = [];
  for (let seed = 1; seed <= seeds; seed++) {
    const task = generator.generate(STUFEN[stufe], mulberry32(seed), opts);
    if (task !== 'unsupported') result.push(task);
  }
  return result;
}

function correctLabel(task: Task): string {
  const answer = task.parts[0]?.answer as ChoiceAnswer;
  return answer.options.find((o) => o.correct)?.label ?? '';
}

function items(task: Task) {
  if (task.scene.kind !== 'items') throw new Error('items-Szene erwartet');
  return task.scene;
}

describe('reicht-das-geld: Reihenfolge und Stufen', () => {
  it('G1–G4 in der Reihenfolge aus docs/05', () => {
    expect(REICHT_DAS_GELD_GENERATORS.map((g) => [g.id, g.stufen])).toEqual([
      ['G1', [1, 2, 3, 4]],
      ['G2', [2, 3, 4]],
      ['G3', [2, 3, 4]],
      ['G4', [2, 3, 4]],
    ]);
  });
});

describe('G1', () => {
  it('5.1: bind saft, genau und inDerHand – Münzen in der Hand ergeben genau den Preis', () => {
    for (const stufe of [2, 3, 4] as const) {
      const list = tasks(G1, stufe, {
        bind: { A: 'saft' },
        force: { genau: true, inDerHand: true },
      });
      expect(list.length).toBe(SEEDS);
      for (const task of list) {
        const scene = items(task);
        expect(scene.items[0]?.itemId).toBe('saft');
        expect(sumPieces(scene.hand ?? [])).toBe(scene.items[0]?.price);
        expect(correctLabel(task)).toBe('Ja, es reicht');
        expect(renderText(task.parts[0]?.explanation ?? '')).toContain('Es reicht genau!');
      }
    }
  });

  it('bind saft gibt es in der Bucht nicht', () => {
    expect(G1.generate(STUFEN[1], mulberry32(1), { bind: { A: 'saft' } })).toBe('unsupported');
  });

  it('B3.4: reicht und inDerHand – immer „Ja“, Geld in der Hand', () => {
    for (const task of tasks(G1, 1, { force: { reicht: true, inDerHand: true } })) {
      const scene = items(task);
      expect(sumPieces(scene.hand ?? [])).toBeGreaterThanOrEqual(scene.items[0]?.price ?? 0);
      expect(correctLabel(task)).toBe('Ja');
      expect(task.parts).toHaveLength(1);
      expect(task.parts[0]?.question).toBe('Reicht dein Geld?');
    }
  });

  it('B3.5: reicht nicht, zweiteilig – Teil b fragt nach den fehlenden Cent', () => {
    for (const task of tasks(G1, 1, {
      force: { reicht: false, inDerHand: true, zweiteilig: true },
    })) {
      const scene = items(task);
      const budget = sumPieces(scene.hand ?? []);
      const price = scene.items[0]?.price ?? 0;
      expect(correctLabel(task)).toBe('Nein');
      expect(task.parts[1]?.question).toBe('Wie viel Cent fehlen dir?');
      expect(task.parts[1]?.answer).toEqual({ type: 'number', correct: price - budget });
    }
  });

  it('zweiteilig auf der Insel: „Wie viel Geld bleibt übrig?“ bzw. „… fehlt?“', () => {
    const list = tasks(G1, 3, { force: { zweiteilig: true } });
    for (const task of list) {
      expect(task.parts).toHaveLength(2);
      const yes = correctLabel(task) === 'Ja, es reicht';
      expect(task.parts[1]?.question).toBe(
        yes ? 'Wie viel Geld bleibt übrig?' : 'Wie viel Geld fehlt?',
      );
    }
  });

  it('ohne force ist etwa jede vierte Aufgabe „genau“', () => {
    const list = tasks(G1, 3, undefined, 300);
    const genau = list.filter((t) => t.parts[0]?.explanation.includes('Es reicht genau!')).length;
    expect(genau / list.length).toBeGreaterThan(0.15);
    expect(genau / list.length).toBeLessThan(0.35);
  });

  it('falsche force-Werte brechen ab', () => {
    expect(() => G1.generate(STUFEN[2], mulberry32(1), { force: { reicht: 'ja' } })).toThrow();
    expect(() => G1.generate(STUFEN[2], mulberry32(1), { bind: { B: 'saft' } })).toThrow();
  });
});

describe('G2', () => {
  it('5.5: Fernglas und Hut, reicht nicht – Teil b ist der Fehlbetrag', () => {
    for (const stufe of [2, 3, 4] as const) {
      for (const task of tasks(G2, stufe, {
        bind: { A: 'fernglas', B: 'hut' },
        force: { reicht: false },
      })) {
        const scene = items(task);
        expect(scene.items.map((i) => i.itemId)).toEqual(['fernglas', 'hut']);
        const sum = scene.items.reduce((s, i) => s + (i.price ?? 0), 0);
        const budget = sumPieces(scene.hand ?? []);
        expect(correctLabel(task)).toBe('Nein, es reicht nicht');
        expect(task.parts[1]?.question).toBe('Wie viel Geld fehlt?');
        expect(task.parts[1]?.answer).toEqual({ type: 'money', correct: sum - budget });
      }
    }
  });

  it('6.5: Kompass und Karte, reicht – Teil b ist der Rest, nie 0', () => {
    for (const stufe of [2, 3, 4] as const) {
      for (const task of tasks(G2, stufe, {
        bind: { A: 'kompass', B: 'karte' },
        force: { reicht: true },
      })) {
        const scene = items(task);
        expect(scene.items.map((i) => i.itemId)).toEqual(['kompass', 'karte']);
        const sum = scene.items.reduce((s, i) => s + (i.price ?? 0), 0);
        const budget = sumPieces(scene.hand ?? []);
        expect(correctLabel(task)).toBe('Ja, es reicht');
        expect(task.parts[1]?.question).toBe('Wie viel Geld bleibt übrig?');
        expect(task.parts[1]?.answer).toEqual({ type: 'money', correct: budget - sum });
        expect(budget - sum).toBeGreaterThan(0);
      }
    }
  });
});

describe('G3', () => {
  it('5.3: 4–5 Sachen, eine kostet genau das Budget, mindestens eine ist zu teuer', () => {
    for (const stufe of [2, 3, 4] as const) {
      for (const task of tasks(G3, stufe)) {
        const answer = task.parts[0]?.answer;
        if (answer?.type !== 'select' || answer.rule.kind !== 'affordable') throw new Error();
        const budget = answer.rule.budget;
        expect(answer.items.length).toBeGreaterThanOrEqual(4);
        expect(answer.items.length).toBeLessThanOrEqual(5);
        expect(answer.items.some((i) => i.price === budget)).toBe(true);
        expect(answer.items.some((i) => (i.price ?? 0) > budget)).toBe(true);
        expect(renderText(task.story)).toBe(`Du hast ${renderText(`{{${String(budget)}}}`)}.`);
      }
    }
  });
});

describe('G4', () => {
  it('5.4: zweiteilig – Teil b ist der Unterschied', () => {
    for (const stufe of [2, 3, 4] as const) {
      for (const task of tasks(G4, stufe, { force: { zweiteilig: true } })) {
        if (task.scene.kind !== 'people') throw new Error();
        const [a, b] = task.scene.people.map((p) => p.amount ?? 0);
        expect(task.parts).toHaveLength(2);
        expect(task.parts[1]?.answer).toEqual({
          type: 'money',
          correct: Math.abs((a ?? 0) - (b ?? 0)),
        });
      }
    }
  });

  it('ohne force: Stufe 2 und 3 einteilig, Stufe 4 immer mit „Wie viel mehr?“', () => {
    expect(tasks(G4, 3).every((t) => t.parts.length === 1)).toBe(true);
    expect(tasks(G4, 4).every((t) => t.parts.length === 2)).toBe(true);
  });

  it('Zahlendreher ab Stufe 3 (3,40 € / 4,30 €)', () => {
    for (const task of tasks(G4, 3)) {
      if (task.scene.kind !== 'people') throw new Error();
      const [a, b] = task.scene.people.map((p) => p.amount ?? 0);
      const [x = 0, y = 0] = [a, b].map((v) => v ?? 0);
      expect(Math.floor(x / 100)).toBe((y % 100) / 10);
      expect(Math.floor(y / 100)).toBe((x % 100) / 10);
    }
  });
});

describe('Beispielaufgaben (gelesen und auf Deutsch geprüft)', () => {
  it('G1 Bucht, reicht nicht, zweiteilig (wie B3.5)', () => {
    const task = G1.generate(STUFEN[1], mulberry32(3), {
      force: { reicht: false, inDerHand: true, zweiteilig: true },
    }) as Task;
    expect(show(task.story)).toBe('Du hast 3 Cent. Ein Keks kostet 5 Cent.');
    expect(task.parts[0]?.question).toBe('Reicht dein Geld für den Keks?');
    expect(task.parts[1]?.hints[1]).toBe('Drei … vier … fünf. Das sind zwei Schritte.');
    expect(task.parts[1]?.explanation).toBe('Von 3 bis 5 sind es 2. Dir fehlen 2 Cent.');
  });

  it('G1 Insel', () => {
    const task = G1.generate(STUFEN[3], mulberry32(5)) as Task;
    expect(show(task.story)).toBe(
      'Mara hat 1,40 €. Sie möchte eine Flasche Wasser für 1,30 € kaufen.',
    );
    expect(show(task.parts[0]?.hints[0] ?? '')).toBe(
      'Vergleiche: Mara hat 1,40 €. Die Flasche Wasser kostet 1,30 €.',
    );
  });

  it('G1 genau mit Geld in der Hand (wie 5.1)', () => {
    const task = G1.generate(STUFEN[3], mulberry32(2), {
      bind: { A: 'saft' },
      force: { genau: true, inDerHand: true },
    }) as Task;
    expect(show(task.story)).toBe(
      'Emil hat dieses Geld in der Hand. Er möchte einen Saft für 1,70 € kaufen.',
    );
    expect(show(task.parts[0]?.explanation ?? '')).toBe(
      '1 € + 50 Cent + 20 Cent = 1,70 €. Emil hat genau 1,70 €. Es reicht genau!',
    );
  });

  it('G2 mit Weiterzählen über den Euro', () => {
    const task = G2.generate(STUFEN[3], mulberry32(7), {
      bind: { A: 'kompass', B: 'karte' },
    }) as Task;
    expect(show(task.story)).toBe(
      'Paul hat 3 €. Er möchte einen Kompass für 3 € und eine Karte für 1,10 € kaufen.',
    );
    expect(show(task.parts[1]?.hints[1] ?? '')).toBe(
      'Von 3 € bis 4 € ist es 1 €. Von 4 € bis 4,10 € noch 10 Cent.',
    );
  });

  it('G3 Lösungsweg mit Artikeln', () => {
    const task = G3.generate(STUFEN[3], mulberry32(4)) as Task;
    expect(show(task.story)).toBe('Du hast 2,95 €.');
    expect(show(task.parts[0]?.explanation ?? '')).toBe(
      'Tüte Kekse (1,85 €), Keks (35 Cent) und Karte (2,95 €) kannst du kaufen. Die Sonnenbrille und die Sonnencreme kosten mehr als 2,95 €.',
    );
  });

  it('G4 zweiteilig', () => {
    const task = G4.generate(STUFEN[3], mulberry32(1), { force: { zweiteilig: true } }) as Task;
    expect(show(task.story)).toBe('Paul hat 6,10 €. Lea hat 1,60 €.');
    expect(task.parts[1]?.question).toBe('Wie viel Geld hat Paul mehr als Lea?');
    expect(show(task.parts[1]?.explanation ?? '')).toBe(
      '40 Cent + 4,10 € = 4,50 €. Paul hat 4,50 € mehr.',
    );
  });
});
