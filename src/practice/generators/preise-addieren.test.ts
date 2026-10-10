import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { mulberry32 } from '@/domain/random';
import { renderText } from '@/domain/text';
import type { Stufe, Task } from '@/domain/types';
import type { GenerateOptions, Generator } from '../types';
import { validateTask } from '../validate';
import { PREISE_ADDIEREN_GENERATORS } from './preise-addieren';

const gen = (id: string): Generator => {
  const g = PREISE_ADDIEREN_GENERATORS.find((x) => x.id === id);
  if (!g) throw new Error(id);
  return g;
};

/** Alle unterstützten Aufgaben für Seeds 1..n. */
function tasks(id: string, stufe: Stufe, opts?: GenerateOptions, n = 100): Task[] {
  const result: Task[] = [];
  for (let seed = 1; seed <= n; seed++) {
    const task = gen(id).generate(STUFEN[stufe], mulberry32(seed), opts);
    if (task !== 'unsupported') {
      expect(validateTask(task, STUFEN[stufe]), `${id} Seed ${String(seed)}`).toEqual([]);
      result.push(task);
    }
  }
  return result;
}

function prices(task: Task): number[] {
  return task.scene.kind === 'items' ? task.scene.items.map((i) => i.price ?? 0) : [];
}

const centCarry = (ps: number[]) => ps.reduce((t, p) => t + (p % 100), 0) >= 100;

describe('preise-addieren', () => {
  it('Reihenfolge der Vorlagen wie in docs/05', () => {
    expect(PREISE_ADDIEREN_GENERATORS.map((g) => g.id)).toEqual([
      'A1',
      'A2',
      'A3',
      'A4',
      'A5',
      'A6',
      'A7',
      'O1',
    ]);
  });

  it('unbekannte bind-Schlüssel brechen ab', () => {
    expect(() =>
      gen('A1').generate(STUFEN[3], mulberry32(1), { bind: { C: 'kokosnuss' } }),
    ).toThrow();
    expect(() => gen('A5').generate(STUFEN[3], mulberry32(1), { force: { count: 4 } })).toThrow();
  });

  it('2.1: A1 mit bind A kokosnuss, B bananenbrot', () => {
    for (const stufe of [2, 3, 4] as const) {
      const list = tasks('A1', stufe, { bind: { A: 'kokosnuss', B: 'bananenbrot' } });
      expect(list.length).toBe(100);
      for (const t of list) {
        expect(t.scene.kind === 'items' && t.scene.items.map((i) => i.itemId)).toEqual([
          'kokosnuss',
          'bananenbrot',
        ]);
        expect(renderText(t.story)).toMatch(/^Eine Kokosnuss kostet .+\. Ein Bananenbrot kostet/);
      }
    }
  });

  it('2.2: A1 einPreisUnterEinemEuro (Stufe 3, 4), auf Stufe 2 nicht möglich', () => {
    const opts = {
      bind: { A: 'wasser', B: 'fischbroetchen' },
      force: { einPreisUnterEinemEuro: true },
    };
    for (const stufe of [3, 4] as const) {
      const list = tasks('A1', stufe, opts);
      expect(list.length).toBe(100);
      for (const t of list) {
        const [pA = 0, pB = 0] = prices(t);
        expect(pA).toBeLessThan(100);
        expect(pB).toBeGreaterThanOrEqual(100);
      }
    }
    expect(gen('A1').generate(STUFEN[2], mulberry32(1), opts)).toBe('unsupported');
  });

  it('2.4: A1 mit carry hat auf Stufe 3 und 4 immer Übertrag', () => {
    const opts = { bind: { A: 'melone', B: 'kokoskeks' }, force: { carry: true } };
    for (const stufe of [3, 4] as const) {
      const list = tasks('A1', stufe, opts);
      expect(list.length).toBe(100);
      for (const t of list) expect(centCarry(prices(t))).toBe(true);
    }
    // Stufe 2: ganze Euro, Zehnerübergang mit diesen Sachen unmöglich → Aufgabe ohne Übertrag
    expect(tasks('A1', 2, opts).length).toBe(100);
  });

  it('ohne force: auf Stufe 3 mindestens jede dritte Aufgabe mit Übertrag', () => {
    const list = tasks('A1', 3, undefined, 300);
    const share = list.filter((t) => centCarry(prices(t))).length / list.length;
    expect(share).toBeGreaterThanOrEqual(1 / 3);
  });

  it('Stufe 1 (B3.3): Karten aufsteigend, nicht gemischt, Fingertipps', () => {
    for (const t of tasks('A1', 1)) {
      const part = t.parts[0];
      expect(part?.answer.type).toBe('choice');
      if (part?.answer.type !== 'choice') continue;
      expect(part.answer.shuffle).toBe(false);
      const values = part.answer.options.map((o) => Number(/\d+/.exec(o.label)?.[0]));
      expect(values).toEqual([...values].sort((a, b) => a - b));
      expect(part.hints[0]).toMatch(/^Halte \d+ Finger hoch\. Dann noch \d+ Finger\.$/);
      expect(part.hints[1]).toBe('Zähle alle Finger.');
    }
  });

  it('2.3 / 7.2: A5 count 2 und count 3, 3 erst ab Stufe 3', () => {
    for (const stufe of [2, 3, 4] as const) {
      for (const t of tasks('A5', stufe, { force: { count: 2 } })) {
        const a = t.parts[0]?.answer;
        expect(a?.type === 'select' && a.rule.kind === 'sum' && a.rule.count).toBe(2);
        expect(a?.type === 'select' && a.items.length).toBeGreaterThanOrEqual(5);
      }
    }
    for (const stufe of [3, 4] as const) {
      const list = tasks('A5', stufe, { force: { count: 3 } });
      expect(list.length).toBe(100);
      for (const t of list) {
        const a = t.parts[0]?.answer;
        expect(a?.type === 'select' && a.rule.kind === 'sum' && a.rule.count).toBe(3);
        expect(renderText(t.parts[0]?.question ?? '')).toMatch(/^Wähle drei Sachen/);
      }
    }
    expect(gen('A5').generate(STUFEN[2], mulberry32(1), { force: { count: 3 } })).toBe(
      'unsupported',
    );
  });

  it('2.5: A6 mit bind A banane, B saft', () => {
    for (const stufe of [2, 3] as const) {
      const list = tasks('A6', stufe, { bind: { A: 'banane', B: 'saft' } });
      expect(list.length).toBe(100);
      for (const t of list) {
        expect(renderText(t.story)).toMatch(/kauft \d Bananen\. Eine Banane kostet/);
        expect(t.parts[1]?.lead).toMatch(/^Dazu kauft (sie|er) noch einen Saft für/);
      }
    }
    // Die Banane hat im Katalog (docs/05 3.1) keinen Preis für Stufe 4.
    expect(tasks('A6', 4, { bind: { A: 'banane', B: 'saft' } })).toEqual([]);
  });

  it('7.1: A3 mit bind A kerze', () => {
    for (const stufe of [2, 3, 4] as const) {
      const list = tasks('A3', stufe, { bind: { A: 'kerze' } });
      expect(list.length).toBe(100);
      for (const t of list) {
        expect(renderText(t.parts[0]?.question ?? '')).toMatch(/^Wie viel kosten \d Kerzen\?$/);
      }
    }
  });

  it('6.1 / 7.4: A7 und O1 auf Stufe 2–4', () => {
    for (const stufe of [2, 3, 4] as const) {
      expect(tasks('A7', stufe).length).toBe(100);
      const list = tasks('O1', stufe);
      expect(list.length).toBe(100);
      if (stufe >= 3) {
        for (const t of list) {
          const a = t.parts[0]?.answer;
          const euros = a?.type === 'order' ? a.entries.map((e) => Math.floor(e.value / 100)) : [];
          expect(new Set(euros).size).toBeLessThan(euros.length);
        }
      }
    }
  });

  it('Sachen ohne Plural sind für Mengen nicht möglich', () => {
    expect(gen('A3').generate(STUFEN[3], mulberry32(1), { bind: { A: 'eis' } })).toBe(
      'unsupported',
    );
  });

  it('Beispielsätze', () => {
    const first = (id: string, stufe: Stufe, opts?: GenerateOptions) => {
      const t = gen(id).generate(STUFEN[stufe], mulberry32(7), opts);
      if (t === 'unsupported') throw new Error(id);
      return t;
    };
    const a1 = first('A1', 3, { bind: { A: 'melone', B: 'kokoskeks' }, force: { carry: true } });
    expect(renderText(a1.story)).toMatch(
      /^Ein Stück Melone kostet \d,\d\d\s€\. Ein Kokoskeks kostet \d+(,\d\d\s€|\sCent)\.$/,
    );
    expect(renderText(a1.parts[0]?.explanation ?? '')).toMatch(
      /^\d+ Cent \+ \d+ Cent = \d+ Cent = \d,\d\d\s€\. Dazu die Euro: \d,\d\d\s€\.$/,
    );
    const a2 = first('A2', 2);
    expect(renderText(a2.story)).toMatch(
      /^\p{Lu}\p{Ll}+ kauft .+ für \d+\s€ und .+ für \d+\s€\.$/u,
    );
    const a3 = first('A3', 3, { bind: { A: 'kerze' } });
    expect(renderText(a3.story)).toMatch(/^\p{Lu}\p{Ll}+ kauft \d Kerzen\. Eine Kerze kostet/u);
    const o1 = first('O1', 3);
    expect(renderText(o1.story)).toMatch(/^Auf \p{Lu}\p{Ll}+’?s? Einkaufszettel stehen vier/u);
    const a7 = first('A7', 3);
    expect(renderText(a7.story)).toMatch(/^(\p{Lu}\p{Ll}+) und (\p{Lu}\p{Ll}+) legen ihr Geld/u);
    const a5 = first('A5', 3, { force: { count: 3 } });
    expect(renderText(a5.story)).toMatch(
      /^\p{Lu}\p{Ll}+ hat genau \d+\s€\. (Sie|Er) möchte drei Sachen kaufen\. Es soll nichts übrig bleiben\.$/u,
    );
  });
});
