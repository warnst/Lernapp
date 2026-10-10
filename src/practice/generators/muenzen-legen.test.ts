import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { countWays, minPieces } from '@/domain/money';
import { mulberry32 } from '@/domain/random';
import { renderText } from '@/domain/text';
import type { PayAnswer, PayVariantsAnswer, Stufe, Task } from '@/domain/types';
import type { GenerateOptions, Generator } from '../types';
import { MUENZEN_LEGEN_GENERATORS } from './muenzen-legen';
import { fewestPieces, paletteFor } from './muenzen-legen-parts';

const [L1, L2, L3] = MUENZEN_LEGEN_GENERATORS;
if (!L1 || !L2 || !L3) throw new Error('Vorlagen fehlen');

const SEEDS = 60;

/** Anzeige-Text mit normalen Leerzeichen statt geschützten. */
const show = (text: string) => renderText(text).replaceAll(' ', ' ');

function tasks(generator: Generator, stufe: Stufe, opts?: GenerateOptions): Task[] {
  const result: Task[] = [];
  for (let seed = 1; seed <= SEEDS; seed++) {
    const task = generator.generate(STUFEN[stufe], mulberry32(seed), opts);
    if (task !== 'unsupported') result.push(task);
  }
  return result;
}

function pay(task: Task): PayAnswer {
  const answer = task.parts[0]?.answer;
  if (answer?.type !== 'pay') throw new Error('pay erwartet');
  return answer;
}

function variants(task: Task): PayVariantsAnswer {
  const answer = task.parts[0]?.answer;
  if (answer?.type !== 'pay-variants') throw new Error('pay-variants erwartet');
  return answer;
}

describe('Bausteine', () => {
  it('fewestPieces findet die wenigsten Stücke, auch wo „gierig“ scheitert', () => {
    expect(fewestPieces(75, [50, 20, 10, 5, 2, 1])).toEqual([50, 20, 5]);
    expect(fewestPieces(60, [50, 20])).toEqual([20, 20, 20]);
  });

  it('paletteFor lässt kleine Stücke weg, wenn es zu viele Möglichkeiten gibt', () => {
    const palette = paletteFor(1000, [1, 2, 5, 10, 20, 50, 100, 200, 500]);
    expect(palette?.includes(1)).toBe(false);
    expect(palette && countWays(1000, palette, Infinity)).toBeGreaterThan(0);
  });
});

describe('muenzen-legen: Reihenfolge und Stufen', () => {
  it('L1–L3 in der Reihenfolge aus docs/05', () => {
    expect(MUENZEN_LEGEN_GENERATORS.map((g) => [g.id, g.stufen])).toEqual([
      ['L1', [1, 2, 3, 4]],
      ['L2', [2, 3, 4]],
      ['L3', [3, 4]],
    ]);
  });
});

describe('L1', () => {
  it('Stufe 1: 2–10 Cent mit 1, 2, 5, 10 Cent und Summenanzeige', () => {
    for (const task of tasks(L1, 1)) {
      const answer = pay(task);
      expect(answer.target).toBeGreaterThanOrEqual(2);
      expect(answer.target).toBeLessThanOrEqual(10);
      expect(answer.palette.every((p) => [1, 2, 5, 10].includes(p))).toBe(true);
      expect(answer.showTotal).toBe(true);
    }
  });

  it('Summenanzeige nur auf Stufe 1–2', () => {
    expect(tasks(L1, 2).every((t) => pay(t).showTotal)).toBe(true);
    expect(tasks(L1, 3).some((t) => pay(t).showTotal)).toBe(false);
  });

  it('1.2: ziel rund – runder Betrag, die gleichwertige Münze fehlt in der Palette', () => {
    for (const stufe of [2, 3, 4] as const) {
      const list = tasks(L1, stufe, { force: { ziel: 'rund' } });
      expect(list.length).toBe(SEEDS);
      for (const task of list) {
        const answer = pay(task);
        expect(STUFEN[stufe].money.pieces).toContain(answer.target);
        expect(answer.palette).not.toContain(answer.target);
        expect(answer.palette.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('B3.2: exactCount 1 – „mit nur einer Münze“', () => {
    const list = tasks(L1, 1, { force: { exactCount: 1 } });
    expect(list.length).toBe(SEEDS);
    for (const task of list) {
      const answer = pay(task);
      expect(answer.exactCount).toBe(1);
      expect(answer.palette).toContain(answer.target);
      expect(show(task.parts[0]?.question ?? '')).toMatch(/^Lege \d+ Cent mit nur einer Münze\.$/);
    }
  });

  it('exactCount 2 ist lösbar', () => {
    for (const stufe of [1, 2, 3, 4] as const) {
      for (const task of tasks(L1, stufe, { force: { exactCount: 2 } })) {
        expect(pay(task).exactCount).toBe(2);
      }
    }
  });

  it('falsche force-Werte brechen ab', () => {
    expect(() => L1.generate(STUFEN[2], mulberry32(1), { force: { ziel: 'eckig' } })).toThrow();
    expect(() => L1.generate(STUFEN[2], mulberry32(1), { force: { exactCount: 0 } })).toThrow();
    expect(() => L1.generate(STUFEN[2], mulberry32(1), { bind: { A: 'keks' } })).toThrow();
  });
});

describe('L2', () => {
  it('4.3: minimal, und „größte Münze zuerst“ ergibt die wenigsten Stücke', () => {
    for (const stufe of [2, 3, 4] as const) {
      for (const task of tasks(L2, stufe)) {
        const answer = pay(task);
        expect(answer.minimal).toBe(true);
        expect(minPieces(answer.target, answer.palette)).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe('L3', () => {
  it('4.2: Standard zwei Arten auf Stufe 3, drei auf Stufe 4', () => {
    expect(tasks(L3, 3).every((t) => variants(t).required === 2)).toBe(true);
    expect(tasks(L3, 4).every((t) => variants(t).required === 3)).toBe(true);
  });

  it('9.3: required 3 – genug Möglichkeiten ohne die größte passende Münze', () => {
    for (const stufe of [3, 4] as const) {
      const list = tasks(L3, stufe, { force: { required: 3 } });
      expect(list.length).toBe(SEEDS);
      for (const task of list) {
        const answer = variants(task);
        expect(answer.required).toBe(3);
        expect(countWays(answer.target, answer.palette, Infinity)).toBeGreaterThanOrEqual(3);
        const biggest = Math.max(...STUFEN[stufe].money.pieces.filter((p) => p <= answer.target));
        expect(answer.palette).not.toContain(biggest);
        expect(task.parts[0]?.question).toContain('auf drei verschiedene Arten');
      }
    }
  });
});

describe('Beispielaufgaben (gelesen und auf Deutsch geprüft)', () => {
  it('L1 Bucht (wie B3.1)', () => {
    const task = L1.generate(STUFEN[1], mulberry32(2)) as Task;
    expect(task.story).toBe('Kiko braucht Kleingeld für seinen Laden.');
    expect(show(task.parts[0]?.question ?? '')).toBe('Lege genau 8 Cent mit Münzen.');
    expect(show(task.parts[0]?.hints[1] ?? '')).toBe(
      'Lege Münzen, bis auf dem Tablett 8 Cent stehen.',
    );
    expect(show(task.parts[0]?.explanation ?? '')).toBe(
      '5 Cent und 2 Cent und 1 Cent sind 8 Cent.',
    );
  });

  it('L1 nur eine Münze (wie B3.2)', () => {
    const task = L1.generate(STUFEN[1], mulberry32(2), { force: { exactCount: 1 } }) as Task;
    expect(show(task.parts[0]?.question ?? '')).toBe('Lege 10 Cent mit nur einer Münze.');
    expect(show(task.parts[0]?.explanation ?? '')).toBe('Die 10-Cent-Münze. Eine Münze, 10 Cent.');
  });

  it('L1 rund (wie 1.2)', () => {
    const task = L1.generate(STUFEN[3], mulberry32(2), { force: { ziel: 'rund' } }) as Task;
    expect(task.story).toBe(
      'Kiko braucht Kleingeld für den Kiosk. Einen 5-Euro-Schein hat Kiko nicht.',
    );
    expect(show(task.parts[0]?.question ?? '')).toBe('Lege genau 5 € mit Münzen.');
    expect(show(task.parts[0]?.hints[1] ?? '')).toBe(
      'Probier es mit 2-Euro-Münzen. Wie viel fehlt dann noch bis 5 €?',
    );
  });

  it('L2 (wie 4.3)', () => {
    const task = L2.generate(STUFEN[3], mulberry32(3)) as Task;
    expect(show(task.parts[0]?.question ?? '')).toBe(
      'Lege 45 Cent mit so wenigen Münzen wie möglich.',
    );
    expect(show(task.parts[0]?.explanation ?? '')).toBe(
      '20 Cent + 20 Cent + 5 Cent = 45 Cent. Das sind nur drei Münzen.',
    );
  });

  it('L3 mit Schein (wie 4.2)', () => {
    const task = L3.generate(STUFEN[4], mulberry32(6), { force: { required: 3 } }) as Task;
    expect(show(task.parts[0]?.question ?? '')).toBe(
      'Lege 50 € auf drei verschiedene Arten. Den 50-Euro-Schein darfst du nicht benutzen.',
    );
    expect(task.parts[0]?.hints[0]).toBe('Fang mit dem größten Schein an, den du benutzen darfst.');
  });
});
