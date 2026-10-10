import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { mulberry32 } from '@/domain/random';
import { renderText } from '@/domain/text';
import type { ChoiceAnswer, Stufe, Task } from '@/domain/types';
import type { GenerateOptions, Generator } from '../types';
import { validateTask } from '../validate';
import { MENGEN_ZAHLEN_GENERATORS } from './mengen-zahlen';

const byId = (id: string): Generator => {
  const generator = MENGEN_ZAHLEN_GENERATORS.find((g) => g.id === id);
  if (!generator) throw new Error(id);
  return generator;
};

function tasks(id: string, stufe: Stufe, opts?: GenerateOptions, seeds = 100): Task[] {
  const result: Task[] = [];
  for (let seed = 1; seed <= seeds; seed++) {
    const task = byId(id).generate(STUFEN[stufe], mulberry32(seed), opts);
    if (task === 'unsupported') continue;
    expect(validateTask(task, STUFEN[stufe])).toEqual([]);
    result.push(task);
  }
  return result;
}

function choiceOf(task: Task): ChoiceAnswer {
  const answer = task.parts[0]?.answer;
  if (answer?.type !== 'choice') throw new Error('keine choice');
  return answer;
}

function allText(task: Task): string {
  return [
    task.story,
    ...task.parts.flatMap((p) => [
      p.question,
      ...p.hints,
      p.explanation,
      ...(p.answer.type === 'choice'
        ? p.answer.options.flatMap((o) => [o.label, o.feedback ?? ''])
        : []),
      ...(p.mistakes ?? []).map((m) => m.feedback),
    ]),
  ]
    .map((t) => renderText(t).replaceAll(' ', ' '))
    .join('\n');
}

describe('mengen-zahlen', () => {
  it('Reihenfolge der Vorlagen wie in docs/05 Anhang B', () => {
    expect(MENGEN_ZAHLEN_GENERATORS.map((g) => g.id)).toEqual(['M1', 'M2', 'M3', 'M4', 'N1', 'O2']);
  });

  it('unbekannte bind-Schlüssel brechen ab', () => {
    for (const generator of MENGEN_ZAHLEN_GENERATORS) {
      expect(() =>
        generator.generate(STUFEN[1], mulberry32(1), { bind: { A: 'muschel' } }),
      ).toThrow();
    }
  });

  it('M1 (B1.1): drei Zahlenkarten, richtig ± 1', () => {
    for (const stufe of [1, 2] as const) {
      for (const task of tasks('M1', stufe)) {
        const answer = choiceOf(task);
        const count = task.scene.kind === 'objects' ? (task.scene.groups[0]?.count ?? 0) : 0;
        expect(answer.options).toHaveLength(3);
        expect(answer.options.find((o) => o.correct)?.label).toBe(String(count));
        expect(count).toBeLessThanOrEqual(STUFEN[stufe].numbers.max);
      }
    }
  });

  it('M1 { eingabe: "number" } (B1.2): Zahlenstrahl', () => {
    for (const task of tasks('M1', 1, { force: { eingabe: 'number' } })) {
      const answer = task.parts[0]?.answer;
      expect(answer?.type).toBe('number');
      expect(task.parts[0]?.mistakes?.length).toBeGreaterThan(0);
    }
  });

  it('M2 (B1.3): in etwa jeder fünften Aufgabe gleich viele', () => {
    const list = tasks('M2', 1, undefined, 300);
    const same = list.filter(
      (t) => choiceOf(t).options.find((o) => o.correct)?.label === 'Gleich viele',
    );
    expect(same.length / list.length).toBeGreaterThan(0.1);
    expect(same.length / list.length).toBeLessThan(0.3);
  });

  it('M3 (B1.4): a, b ≥ 2 und a + b ≤ numbers.max', () => {
    for (const stufe of [1, 2] as const) {
      for (const task of tasks('M3', stufe)) {
        const groups = task.scene.kind === 'objects' ? task.scene.groups : [];
        const [a, b] = groups.map((g) => g.count);
        expect(a).toBeGreaterThanOrEqual(2);
        expect(b).toBeGreaterThanOrEqual(2);
        expect((a ?? 0) + (b ?? 0)).toBeLessThanOrEqual(STUFEN[stufe].numbers.max);
      }
    }
  });

  it('M4 (B4.4): Dinge gehen weg', () => {
    for (const task of tasks('M4', 1)) {
      const group = task.scene.kind === 'objects' ? task.scene.groups[0] : undefined;
      const answer = task.parts[0]?.answer;
      expect(answer?.type === 'number' && answer.correct).toBe(
        (group?.count ?? 0) - (group?.leaving ?? 0),
      );
    }
  });

  it('M4 { geld: true } (B4.5): Geld in der Hand und eine Sache', () => {
    for (const stufe of [1, 2] as const) {
      const list = tasks('M4', stufe, { force: { geld: true } });
      expect(list.length).toBeGreaterThanOrEqual(90);
      for (const task of list) {
        if (task.scene.kind !== 'items') throw new Error('items');
        const budget = (task.scene.hand ?? []).reduce((t, p) => t + p, 0);
        const price = task.scene.items[0]?.price ?? 0;
        const answer = task.parts[0]?.answer;
        expect(answer?.type).toBe(stufe === 1 ? 'number' : 'money');
        expect(answer && 'correct' in answer && answer.correct).toBe(budget - price);
      }
    }
  });

  it('N1 (B4.3): Optionen zwischen 0 und numbers.max', () => {
    for (const stufe of [1, 2] as const) {
      for (const task of tasks('N1', stufe)) {
        for (const option of choiceOf(task).options) {
          const value = Number(option.label);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(STUFEN[stufe].numbers.max);
        }
      }
    }
  });

  it('O2 (B1.5): drei Anzahlen mit Abstand ≥ 2', () => {
    for (const stufe of [1, 2] as const) {
      for (const task of tasks('O2', stufe)) {
        const answer = task.parts[0]?.answer;
        if (answer?.type !== 'order') throw new Error('order');
        const values = answer.entries.map((e) => e.value).sort((a, b) => a - b);
        expect(values).toHaveLength(3);
        expect((values[1] ?? 0) - (values[0] ?? 0)).toBeGreaterThanOrEqual(2);
        expect((values[2] ?? 0) - (values[1] ?? 0)).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('Beispielsätze (gelesen und auf Deutsch geprüft)', () => {
    const text = (id: string, opts?: GenerateOptions) =>
      [1, 2]
        .flatMap((s) => tasks(id, s as Stufe, opts, 100))
        .map(allText)
        .join('\n');
    const m1 = text('M1');
    expect(m1).toContain('Hast du einen Seestern übersehen? Tippe jeden Seestern an.');
    expect(m1).toContain('Tippe jedes Boot an. Dann bekommt es einen Punkt.');
    expect(text('M2')).toContain('Kiko hat zwei Eimer mit Steinen.');
    expect(text('M3')).toMatch(/Kiko findet \d+ \S+\. Dann findet er noch \d+\./);
    const m4 = text('M4');
    expect(m4).toMatch(/Ein Fisch schwimmt weg\.|Eine Möwe fliegt weg\.|Ein Krebs krabbelt weg\./);
    expect(m4).toContain('Es bleibt 1 ');
    expect(text('M4', { force: { geld: true } })).toMatch(
      /^\w+ hat \d+ Cent\. (Sie|Er) kauft (ein|eine|einen) \S+ für \d+ Cent\.$/m,
    );
    expect(text('N1')).toContain('Wir suchen die Zahl davor.');
    expect(text('O2')).toMatch(
      /Tippe zuerst das Häufchen mit den wenigsten (Muscheln|Seesternen|Steinen|Federn) an\./,
    );
  });
});
