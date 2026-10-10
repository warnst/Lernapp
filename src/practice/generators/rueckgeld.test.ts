import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { mulberry32 } from '@/domain/random';
import { renderText } from '@/domain/text';
import type { Stufe, Task } from '@/domain/types';
import type { GenerateOptions, Generator } from '../types';
import { validateTask } from '../validate';
import { RUECKGELD_GENERATORS } from './rueckgeld';

const gen = (id: string): Generator => {
  const g = RUECKGELD_GENERATORS.find((x) => x.id === id);
  if (!g) throw new Error(id);
  return g;
};

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

function purchase(task: Task) {
  if (task.scene.kind !== 'items') throw new Error('items-Szene erwartet');
  return {
    itemId: task.scene.items[0]?.itemId,
    price: task.scene.items[0]?.price ?? 0,
    payment: task.scene.paidWith?.[0] ?? 0,
  };
}

const STUFEN_INSEL = [2, 3, 4] as const;

describe('rueckgeld', () => {
  it('Reihenfolge der Vorlagen wie in docs/05', () => {
    expect(RUECKGELD_GENERATORS.map((g) => g.id)).toEqual(['R1', 'R2', 'R3', 'R4']);
  });

  it('Zahlung aus cfg.money.payments und größer als der Preis', () => {
    for (const stufe of STUFEN_INSEL) {
      for (const id of ['R1', 'R2', 'R3', 'R4']) {
        for (const t of tasks(id, stufe)) {
          const { price, payment } = purchase(t);
          expect(STUFEN[stufe].money.payments).toContain(payment);
          expect(payment).toBeGreaterThan(price);
        }
      }
    }
  });

  it('3.1 / 3.3 / 3.4 / 3.5 / 6.2: bind A setzt die Sache', () => {
    const cases: [string, string][] = [
      ['R2', 'eis'],
      ['R1', 'strandball'],
      ['R3', 'seifenblasen'],
      ['R4', 'sonnencreme'],
      ['R4', 'muschelarmband'],
    ];
    for (const stufe of STUFEN_INSEL) {
      for (const [id, item] of cases) {
        const list = tasks(id, stufe, { bind: { A: item } });
        expect(list.length, `${id} ${item} Stufe ${String(stufe)}`).toBe(100);
        for (const t of list) expect(purchase(t).itemId).toBe(item);
      }
    }
  });

  it('R3: Rückgeld höchstens 2 € (Stufe 4: 5 €), Palette ohne Scheine', () => {
    for (const stufe of STUFEN_INSEL) {
      for (const t of tasks('R3', stufe)) {
        const a = t.parts[0]?.answer;
        if (a?.type !== 'pay') throw new Error('pay erwartet');
        expect(a.target).toBeLessThanOrEqual(stufe === 4 ? 500 : 200);
        expect(a.palette.every((p) => p <= 200)).toBe(true);
      }
    }
  });

  it('R4: stimmt true → nur Teil a mit Ja; stimmt false → Teil b mit richtigem Rückgeld', () => {
    for (const stufe of STUFEN_INSEL) {
      for (const t of tasks('R4', stufe, { force: { stimmt: true } })) {
        expect(t.parts).toHaveLength(1);
        const a = t.parts[0]?.answer;
        expect(a?.type === 'choice' && a.options.find((o) => o.correct)?.label).toBe(
          'Ja, das stimmt',
        );
      }
      for (const t of tasks('R4', stufe, { force: { stimmt: false } })) {
        expect(t.parts).toHaveLength(2);
        const { price, payment } = purchase(t);
        const b = t.parts[1]?.answer;
        expect(b?.type === 'money' && b.correct).toBe(payment - price);
        expect(renderText(t.story)).not.toContain(
          ` ${renderText(`{{${String(payment - price)}}}`)} zurück`,
        );
      }
    }
  });

  it('R4: genannte Abweichung ist ein Schritt, 50 Cent oder 1 € (Stufe 2: 1 € oder 2 €)', () => {
    for (const stufe of STUFEN_INSEL) {
      for (const t of tasks('R4', stufe, { force: { stimmt: false } })) {
        const { price, payment } = purchase(t);
        const stated = Number(/\{\{(\d+)\}\} zurück/.exec(t.story)?.[1]);
        const diff = Math.abs(stated - (payment - price));
        expect(stufe === 2 ? [100, 200] : [5, 50, 100]).toContain(diff);
      }
    }
  });

  it('unbekannte force-Schlüssel brechen ab', () => {
    expect(() =>
      gen('R4').generate(STUFEN[3], mulberry32(1), { force: { stimt: true } }),
    ).toThrow();
    expect(() => gen('R1').generate(STUFEN[3], mulberry32(1), { bind: { B: 'eis' } })).toThrow();
  });

  it('Beispielsätze', () => {
    const first = (id: string, stufe: Stufe, opts?: GenerateOptions) => {
      const t = gen(id).generate(STUFEN[stufe], mulberry32(11), opts);
      if (t === 'unsupported') throw new Error(id);
      return t;
    };
    const r2 = first('R2', 3, { bind: { A: 'eis' } });
    expect(renderText(r2.story)).toMatch(
      /^Du kaufst ein Eis für .+\. Du bezahlst mit (einer 2-Euro-Münze|einem 5-Euro-Schein|einem 10-Euro-Schein)\.$/,
    );
    expect(r2.parts[0]?.question).toBe('Wie viel Rückgeld bekommst du?');
    const r1 = first('R1', 3, { bind: { A: 'strandball' } });
    expect(renderText(r1.story)).toMatch(
      /^\p{Lu}\p{Ll}+ kauft einen Strandball für .+\. (Sie|Er) bezahlt mit einem \d+-Euro-Schein\.$/u,
    );
    expect(renderText(r1.parts[0]?.question ?? '')).toMatch(
      /^Wie viel Rückgeld bekommt (sie|er)\?$/,
    );
    const r3 = first('R3', 3, { bind: { A: 'seifenblasen' } });
    expect(renderText(r3.story)).toMatch(/kauft eine Dose Seifenblasen für/);
    const r4 = first('R4', 3, { bind: { A: 'sonnencreme' }, force: { stimmt: false } });
    expect(renderText(r4.story)).toMatch(
      /^\p{Lu}\p{Ll}+ kauft eine Sonnencreme für .+ und bezahlt mit einem \d+-Euro-Schein\. (Sie|Er) bekommt .+ zurück\.$/u,
    );
    expect(renderText(r4.parts[0]?.explanation ?? '')).toMatch(
      /= .+\. Das ist (mehr|weniger) als .+\. \p{Lu}\p{Ll}+ hat .+ zu (viel|wenig) bekommen\.$/u,
    );
    expect(renderText(r4.parts[1]?.explanation ?? '')).toMatch(/Rückgeld: .+\.$/);
  });
});
