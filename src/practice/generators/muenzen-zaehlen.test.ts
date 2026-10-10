import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { mulberry32 } from '@/domain/random';
import { renderText } from '@/domain/text';
import type { ChoiceAnswer, Stufe, Task } from '@/domain/types';
import type { GenerateOptions, Generator } from '../types';
import { validateTask } from '../validate';
import { MUENZEN_ZAEHLEN_GENERATORS } from './muenzen-zaehlen';

const byId = (id: string): Generator => {
  const generator = MUENZEN_ZAEHLEN_GENERATORS.find((g) => g.id === id);
  if (!generator) throw new Error(id);
  return generator;
};

/** Aufgaben für viele Seeds (nur die unterstützten), jede wird gleich geprüft. */
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

const show = (text: string) => renderText(text).replaceAll(' ', ' ');

function choiceOf(task: Task): ChoiceAnswer {
  const answer = task.parts[0]?.answer;
  if (answer?.type !== 'choice') throw new Error('keine choice');
  return answer;
}

/** Erste Aufgabe, deren Text (Geschichte, Frage, Tipps, Lösungsweg, Optionen) passt. */
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
    .map(show)
    .join('\n');
}

describe('muenzen-zaehlen', () => {
  it('Reihenfolge der Vorlagen wie in docs/05', () => {
    expect(MUENZEN_ZAEHLEN_GENERATORS.map((g) => g.id)).toEqual([
      'C1',
      'C2',
      'Z1',
      'Z2',
      'Z3',
      'Z4',
      'Z5',
    ]);
  });

  it('unbekannte bind-Schlüssel brechen ab', () => {
    for (const generator of MUENZEN_ZAEHLEN_GENERATORS) {
      const stufe = generator.stufen[0] ?? 1;
      expect(() =>
        generator.generate(STUFEN[stufe], mulberry32(1), { bind: { A: 'kokosnuss' } }),
      ).toThrow();
    }
  });

  it('C1 { euro: true } (B2.2): gesucht ist 1 € oder 2 €', () => {
    for (const stufe of [1, 2] as const) {
      const list = tasks('C1', stufe, { force: { euro: true } });
      expect(list.length).toBe(100);
      for (const task of list) {
        const correct = choiceOf(task).options.find((o) => o.correct);
        expect([[100], [200]]).toContainEqual(correct?.pieces);
        expect(choiceOf(task).options).toHaveLength(3);
      }
    }
  });

  it('C1: keine zwei Stücke mit derselben Zahl (2 Cent / 2 €)', () => {
    for (const task of tasks('C1', 1, undefined, 300)) {
      const printed = choiceOf(task).options.map((o) => {
        const piece = o.pieces?.[0] ?? 0;
        return piece >= 100 ? piece / 100 : piece;
      });
      expect(new Set(printed).size).toBe(printed.length);
    }
  });

  it('C2: in mindestens jeder zweiten Aufgabe ist die größere Münze weniger wert', () => {
    const list = tasks('C2', 1, undefined, 300);
    const traps = list.filter((t) => t.title === 'Groß oder viel?');
    expect(traps.length / list.length).toBeGreaterThanOrEqual(0.5);
    for (const task of traps) {
      const pieces = choiceOf(task).options.map((o) => o.pieces?.[0]);
      expect([
        [5, 10],
        [50, 100],
      ]).toContainEqual([...pieces].sort((a, b) => (a ?? 0) - (b ?? 0)));
    }
  });

  it('Z1 { antwort } (B2.4, B2.5) und Insel 1.1/1.4/4.1 ohne force', () => {
    for (const task of tasks('Z1', 1, { force: { antwort: 'number' } })) {
      expect(task.parts[0]?.answer.type).toBe('number');
      expect((task.scene.kind === 'coins' && task.scene.pieces.length) || 0).toBeLessThanOrEqual(3);
    }
    for (const task of tasks('Z1', 1, { force: { antwort: 'choice' } }))
      expect(task.parts[0]?.answer.type).toBe('choice');
    expect(byId('Z1').generate(STUFEN[1], mulberry32(1), { force: { antwort: 'money' } })).toBe(
      'unsupported',
    );
    for (const stufe of [2, 3, 4] as const) {
      const list = tasks('Z1', stufe);
      expect(list.length).toBe(100);
      const types = new Set(list.map((t) => t.parts[0]?.answer.type));
      expect(types).toEqual(new Set(['choice', 'money']));
    }
  });

  it('Z2 { falle: true } (1.3): der Beutel mit weniger Münzen hat mehr Geld', () => {
    for (const stufe of [2, 3, 4] as const) {
      const list = tasks('Z2', stufe, { force: { falle: true } });
      expect(list.length).toBeGreaterThanOrEqual(90);
      for (const task of list) {
        const options = choiceOf(task).options;
        const correct = options.find((o) => o.correct);
        const other = options.find((o) => !o.correct && o.pieces);
        expect(correct?.pieces?.length).toBeLessThan(other?.pieces?.length ?? 0);
        expect(options.at(-1)?.label).toBe('In beiden gleich viel');
      }
    }
    const free = tasks('Z2', 3, undefined, 300);
    const trapShare = free.filter((t) => t.parts[0]?.praise !== undefined).length / free.length;
    expect(trapShare).toBeGreaterThanOrEqual(0.5);
  });

  it('Z3 (1.5): vier Münzen mit Größenfalle', () => {
    for (const stufe of [3, 4] as const) {
      for (const task of tasks('Z3', stufe)) {
        const answer = task.parts[0]?.answer;
        if (answer?.type !== 'order') throw new Error('order');
        const values = answer.entries.map((e) => e.value);
        expect(values).toHaveLength(4);
        expect(
          (values.includes(5) && values.includes(10)) ||
            (values.includes(50) && values.includes(100)),
        ).toBe(true);
      }
    }
  });

  it('Z4 (4.4): drei Geldbörsen, genau eine passt, Position per Seed', () => {
    const positions = new Set<number>();
    for (const stufe of [2, 3, 4] as const) {
      for (const task of tasks('Z4', stufe)) {
        const answer = choiceOf(task);
        expect(answer.shuffle).toBe(false);
        expect(answer.options.map((o) => o.label)).toEqual([
          'Geldbörse 1',
          'Geldbörse 2',
          'Geldbörse 3',
        ]);
        const sums = answer.options.map((o) => (o.pieces ?? []).reduce((t, p) => t + p, 0));
        expect(new Set(sums).size).toBe(3);
        positions.add(answer.options.findIndex((o) => o.correct));
      }
    }
    expect(positions).toEqual(new Set([0, 1, 2]));
  });

  it('Z5 (5.2): Preisschild in Kommaschreibweise', () => {
    for (const task of tasks('Z5', 3)) {
      const item = task.scene.kind === 'items' ? task.scene.items[0] : undefined;
      expect(item?.priceFormat).toBe('eur');
      expect(item?.price).toBeLessThan(100);
      expect(choiceOf(task).options.find((o) => o.correct)?.label).toBe(
        `${String(item?.price)} Cent`,
      );
    }
    const big = tasks('Z5', 4, undefined, 100).filter(
      (t) => t.scene.kind === 'items' && (t.scene.items[0]?.price ?? 0) > 100,
    );
    expect(big.length).toBeGreaterThan(0);
  });

  it('Beispielsätze (gelesen und auf Deutsch geprüft)', () => {
    const c1 = tasks('C1', 2, undefined, 50).map(allText).join('\n');
    expect(c1).toContain('Kiko sucht einen bestimmten Schein.');
    expect(c1).toContain('Tippe den 10-Euro-Schein an.');
    expect(c1).toContain('Auf dieser Münze steht 1. Suche den Schein mit der 10.');
    expect(c1).toContain('Die 1-Euro-Münze hat zwei Farben: innen silbern, außen golden.');

    const c2 = tasks('C2', 1, undefined, 50).map(allText).join('\n');
    expect(c2).toContain('Die 50-Cent-Münze ist größer. Aber 1 € ist mehr als 50 Cent!');
    expect(c2).toContain('10 Cent sind mehr als 5 Cent, auch wenn die Münze kleiner ist.');

    const z1 = tasks('Z1', 3, undefined, 100).map(allText).join('\n');
    expect(z1).toContain('Hast du beide mitgezählt?');
    expect(z1).toContain('Schau genau hin: Das ist eine 50-Cent-Münze, keine 5-Cent-Münze.');

    const z1s1 = tasks('Z1', 1, { force: { antwort: 'number' } }, 20)
      .map(allText)
      .join('\n');
    expect(z1s1).toContain('Wie viel Cent sind das zusammen?');
    expect(z1s1).toMatch(/\d Cent und \d Cent (und \d Cent )?sind \d+ Cent\./);

    const z2 = tasks('Z2', 3, { force: { falle: true } }, 30)
      .map(allText)
      .join('\n');
    expect(z2).toMatch(/sind mehr Münzen\. Aber ist es auch mehr Geld\? Zähle nach: /);
    expect(z2).not.toMatch(/Beutel ist [^.?]*\+/);

    const z4 = tasks('Z4', 3, undefined, 30).map(allText).join('\n');
    expect(z4).toMatch(
      /In dieser Geldbörse sind [\d,]+ (€|Cent)\. Das sind \d+ Cent zu (viel|wenig)\./,
    );

    const z5 = tasks('Z5', 3, undefined, 30).map(allText).join('\n');
    expect(z5).toContain('Vor dem Komma steht eine 0. Das heißt: 0 Euro.');
  });
});
