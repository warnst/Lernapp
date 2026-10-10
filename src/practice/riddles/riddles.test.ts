import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { solveGrid } from '@/domain/grid';
import { mulberry32 } from '@/domain/random';
import type { MoneyPiece, Stufe, StufeConfig, Task } from '@/domain/types';
import type { GenerateOptions, Generator } from '../types';
import { validateTask } from '../validate';
import { allSums, solveSteps, stepText, wallRelations } from './grid-steps';
import { RIDDLE_GENERATORS } from './index';
import { answerOf, consistentOrders, type Relation } from './logic';

// Rätsel-Generatoren (docs/10 Abschnitt 5 und 7): Pflichtprüfungen, Beispiele, force-Schlüssel.

const SEEDS = 300;

function gen(id: string): Generator {
  const generator = RIDDLE_GENERATORS.find((g) => g.id === id);
  if (!generator) throw new Error(id);
  return generator;
}

function part(task: Task) {
  const first = task.parts[0];
  if (!first) throw new Error('kein Teil');
  return first;
}

/** Richtiger Wert einer choice-, number- oder money-Antwort. */
function correctValue(task: Task): number | string {
  const answer = part(task).answer;
  if (answer.type === 'number' || answer.type === 'money') return answer.correct;
  if (answer.type === 'choice') return answer.options.find((o) => o.correct)?.label ?? '';
  throw new Error(answer.type);
}

// ---------- unabhängige Nachrechnung der Pflichtprüfungen ----------

const cents = (text: string) => Number(/\{\{(\d+)\}\}/.exec(text)?.[1]);

/** „20-Cent-Münzen“ → 20, „2-Euro-Münzen“ → 200, „5-Euro-Scheine“ → 500 */
function pieceOf(text: string): number {
  const match = /(\d+)-(Cent|Euro)-/.exec(text);
  if (!match) throw new Error(text);
  return Number(match[1]) * (match[2] === 'Euro' ? 100 : 1);
}

/** Löst eine Rätselkarte des Zahlenschlosses aus ihrem Text. */
function solveClue(text: string): number {
  let m = /^(\d+) ([+−]) (\d+)$/.exec(text);
  if (m) return m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]);
  m = /^(\d+) geteilt durch (\d+)$/.exec(text);
  if (m) return Number(m[1]) / Number(m[2]);
  m = /^Wie viele Euro sind (\d+) mal (\{\{\d+\}\})\?$/.exec(text);
  if (m) return (Number(m[1]) * cents(m[2] ?? '')) / 100;
  m = /^Wie viele (.+) sind (\{\{\d+\}\})\?$/.exec(text);
  if (m) return cents(m[2] ?? '') / pieceOf(m[1] ?? '');
  throw new Error(`Unbekannte Karte: ${text}`);
}

/** Sätze „A hat mehr/weniger … als B.“ als Beziehungen. */
function relationsOf(story: string): Relation[] {
  return [...story.matchAll(/(\w+) hat (mehr|weniger) \w+ als (\w+)\./g)].map((m) =>
    m[2] === 'mehr' ? { hi: m[1] ?? '', lo: m[3] ?? '' } : { hi: m[3] ?? '', lo: m[1] ?? '' },
  );
}

/** Beträge aus „Ben hat {{500}}.“ und „Mara hat {{300}} mehr als Ben.“ */
function amountsOf(story: string): Map<string, number> {
  const known = new Map<string, number>();
  for (const m of story.matchAll(/(\w+) hat \{\{(\d+)\}\}\./g)) known.set(m[1] ?? '', Number(m[2]));
  const relative = [...story.matchAll(/(\w+) hat \{\{(\d+)\}\} (mehr|weniger) als (\w+)\./g)];
  let changed = true;
  while (changed) {
    changed = false;
    for (const [, who = '', d, word, other = ''] of relative) {
      const base = known.get(other);
      if (base === undefined || known.has(who)) continue;
      known.set(who, base + (word === 'mehr' ? 1 : -1) * Number(d));
      changed = true;
    }
  }
  return known;
}

/** Kürzeste Periode einer Reihe. */
function periodOf(row: readonly string[]): number {
  for (let p = 1; p <= row.length; p++) if (row.every((s, i) => s === row[i % p])) return p;
  return row.length;
}

/** Pflichtprüfungen aus docs/10 Abschnitt 5; Liste der Verstöße. */
function riddleErrors(id: string, task: Task, cfg: StufeConfig): string[] {
  const errors: string[] = [];
  const answer = part(task).answer;
  const scene = task.scene;
  if (id === 'sequence' && scene.kind === 'sequence') {
    const blank = scene.items.findIndex((i) => i.kind === 'blank');
    if (scene.items.filter((i) => i.kind === 'blank').length !== 1) errors.push('genau eine Lücke');
    const solution = correctValue(task);
    const values = scene.items.map((item) => {
      if (item.kind === 'number') return item.value;
      if (item.kind === 'money') return item.cents;
      if (item.kind === 'objects') return item.count;
      if (item.kind === 'icon') return item.icon;
      if (typeof solution === 'number') return solution;
      if (/^\d+$/.test(solution)) return Number(solution);
      return /\{\{\d+\}\}/.test(solution) ? cents(solution) : solution.toLowerCase();
    });
    if (values.every((v) => typeof v === 'number')) {
      const nums = values;
      const diffs = nums.slice(1).map((v, i) => v - (nums[i] ?? 0));
      const constant = diffs.every((d) => d === diffs[0]);
      const doubling = nums.every((v, i) => i === 0 || v === 2 * (nums[i - 1] ?? 0));
      const alternating = diffs.every((d, i) => d === diffs[i % 2]);
      if (!constant && !doubling && !alternating) errors.push(`keine Regel: ${nums.join(',')}`);
      if (blank < (constant || doubling ? 3 : 4)) errors.push('zu wenige Elemente vor der Lücke');
      const money = scene.items.some((i) => i.kind === 'money');
      const max = money ? cfg.money.maxTotal : cfg.numbers.max;
      if (nums.some((v) => v < 0 || v > max)) errors.push('Wert außerhalb der Stufe');
    } else {
      const row = values.map(String);
      const p = periodOf(row);
      if (p < 2 || blank < 2 * p)
        errors.push(`Bildmuster: Periode ${String(p)}, Lücke ${String(blank)}`);
    }
  }
  if (id === 'balance' && scene.kind === 'balance') {
    const sum = (pieces?: MoneyPiece[]) => (pieces ?? []).reduce((t, x) => t + x, 0);
    const [light, heavy] = scene.left.unknown
      ? [scene.left, scene.right]
      : [scene.right, scene.left];
    if (light.unknown && answer.type === 'choice' && light.pieces) {
      const missing = sum(heavy.pieces) - sum(light.pieces);
      const fitting = answer.options.filter((o) => sum(o.pieces) === missing);
      const right = answer.options.find((o) => o.correct);
      if (fitting.length !== 1 || fitting[0] !== right) errors.push('genau ein passendes Stück');
      const pieces = right?.pieces ?? [];
      const expected = cfg.riddles.params.balance.twoEqual ? 2 : 1;
      if (pieces.length !== expected || light.unknown !== expected || new Set(pieces).size !== 1)
        errors.push('Anzahl fehlender Stücke');
    } else if (light.unknown && light.objects && heavy.objects) {
      const missing = heavy.objects.count - light.objects.count;
      if (Number(correctValue(task)) !== missing || missing < 1 || missing > cfg.numbers.max)
        errors.push('fehlende Menge');
    } else if (answer.type === 'choice' && answer.layout === 'yesno') {
      const l = scene.left.objects?.count ?? sum(scene.left.pieces);
      const r = scene.right.objects?.count ?? sum(scene.right.pieces);
      if ((l === r) !== (correctValue(task) === 'Ja')) errors.push('gleich?');
    } else errors.push('unbekannte Waage');
  }
  if (id === 'code' && scene.kind === 'clues' && answer.type === 'code') {
    const solved = scene.clues.map((c) => solveClue(c.text));
    if (solved.join() !== answer.digits.join())
      errors.push(`Code ${solved.join()} ≠ ${answer.digits.join()}`);
    if (solved.some((d) => !Number.isInteger(d) || d < 0 || d > 9))
      errors.push('Karte nicht einstellig');
    for (const clue of scene.clues)
      if (clue.dots && clue.dots[0] + clue.dots[1] !== solveClue(clue.text)) errors.push('Punkte');
    if (new Set(scene.clues.map((c) => c.symbol)).size !== scene.clues.length)
      errors.push('Symbole doppelt');
  }
  if (id === 'logic' && scene.kind === 'people') {
    const names = scene.people.map((p) => p.name);
    if (answer.type === 'money') {
      const last = /Wie viel Geld hat (\w+)\?/.exec(part(task).question)?.[1] ?? '';
      if (amountsOf(task.story).get(last) !== answer.correct) errors.push('Betrag');
    } else {
      const relations = relationsOf(task.story);
      const orders = consistentOrders(names, relations);
      const q = part(task).question;
      const frage = q.includes('nicht am meisten')
        ? 'mitte'
        : q.includes('meisten')
          ? 'meisten'
          : 'wenigsten';
      const answers = new Set(orders.map((o) => answerOf(o, frage)));
      if (answers.size !== 1 || !answers.has(String(correctValue(task))))
        errors.push('Antwort nicht eindeutig');
      if (cfg.riddles.params.logic.fullOrder && orders.length !== 1)
        errors.push('Reihenfolge offen');
    }
  }
  return errors;
}

describe('Rätsel-Generatoren', () => {
  it('IDs, Thema und Stufen wie in docs/10', () => {
    expect(RIDDLE_GENERATORS.map((g) => g.id)).toEqual([
      'sequence',
      'balance',
      'wall',
      'code',
      'triangle',
      'logic',
    ]);
    for (const g of RIDDLE_GENERATORS) {
      expect(g.topic).toBe('raetsel');
      const expected = (Object.keys(STUFEN).map(Number) as Stufe[]).filter((s) =>
        STUFEN[s].riddles.types.includes(g.id as never),
      );
      expect(g.stufen, g.id).toEqual(expected);
    }
  });

  it('pro Typ × Stufe × 300 Seeds: gültig, Pflichtprüfungen, reproduzierbar', () => {
    for (const generator of RIDDLE_GENERATORS) {
      for (const stufe of generator.stufen) {
        const cfg = STUFEN[stufe];
        const name = `${generator.id} Stufe ${String(stufe)}`;
        let supported = 0;
        for (let seed = 1; seed <= SEEDS; seed++) {
          const task = generator.generate(cfg, mulberry32(seed));
          if (task === 'unsupported') continue;
          supported++;
          expect(validateTask(task, cfg), `${name} Seed ${String(seed)}`).toEqual([]);
          expect(riddleErrors(generator.id, task, cfg), `${name} Seed ${String(seed)}`).toEqual([]);
        }
        expect(supported, name).toBeGreaterThanOrEqual(SEEDS * 0.9);
        expect(generator.generate(cfg, mulberry32(42)), name).toEqual(
          generator.generate(cfg, mulberry32(42)),
        );
      }
    }
  }, 60_000);

  it('Beispiele aus docs/10 Abschnitt 5', () => {
    const wall = (values: (number | undefined)[]) => {
      const ids = idsOf((Math.sqrt(8 * values.length + 1) - 1) / 2);
      return solveGrid(
        'wall',
        ids.map((id, i) => (values[i] === undefined ? { id } : { id, value: values[i] })),
      );
    };
    // Reihenfolge der Werte: Reihe 0 (unten) links → rechts, dann Reihe 1 …
    expect(wall([2, 3, undefined])).toMatchObject({ r1c0: 5 });
    expect(wall([4, 3, 5, 7, undefined, undefined])).toMatchObject({ r1c1: 8, r2c0: 15 });
    expect(wall([120, undefined, 150, 200, 230, undefined])).toMatchObject({ r0c1: 80, r2c0: 430 });
    expect(wall([12, undefined, 8, 30, 37, 33, 38, 70, undefined, undefined])).toMatchObject({
      r0c1: 25,
      r2c1: 71,
      r3c0: 141,
    });

    // Lösungsweg der Mauer: „4 + 3 = 7. 3 + 5 = 8. 7 + 8 = 15.“; rückwärts mit Minus.
    const relations = wallRelations(3);
    const values = { r0c0: 4, r0c1: 3, r0c2: 5, r1c0: 7, r1c1: 8, r2c0: 15 };
    expect(allSums(relations, values, String)).toBe('4 + 3 = 7. 3 + 5 = 8. 7 + 8 = 15.');
    const cells = Object.entries(values).map(([id, value]) => ({
      id,
      value,
      given: id !== 'r0c1' && id !== 'r2c0',
    }));
    expect(solveSteps(relations, cells).map((s) => stepText(s, String))).toEqual([
      '7 − 4 = 3.',
      '7 + 8 = 15.',
    ]);

    const triangle = (given: Record<string, number>) =>
      solveGrid(
        'triangle',
        ['a', 'b', 'c', 'ab', 'bc', 'ca'].map((id) => ({ id, value: given[id] })),
      );
    expect(triangle({ a: 3, b: 5, c: 4 })).toMatchObject({ ab: 8, bc: 9, ca: 7 });
    expect(triangle({ ab: 8, bc: 9, ca: 7 })).toMatchObject({ a: 3, b: 5, c: 4 });

    // Waage Stufe 3: links 50 + 20 Cent, rechts 50 Cent + ? → genau ein Stück: 20 Cent.
    const missing = 50 + 20 - 50;
    expect(STUFEN[3].money.pieces.filter((p) => p === missing)).toEqual([20]);

    expect(['3 + 4', '10 − 2', '5 + 0'].map(solveClue)).toEqual([7, 8, 5]);
    expect(solveClue('Wie viele 20-Cent-Münzen sind {{100}}?')).toBe(5);
    expect(solveClue('Wie viele 50-Cent-Münzen sind {{400}}?')).toBe(8);

    const orders = consistentOrders(
      ['Emil', 'Lina', 'Noah'],
      relationsOf('Emil hat mehr Geld als Lina. Lina hat mehr Geld als Noah.'),
    );
    expect(orders).toEqual([['Emil', 'Lina', 'Noah']]);
    expect(answerOf(orders[0] ?? [], 'wenigsten')).toBe('Noah');
    expect(amountsOf('Mara hat {{300}} mehr als Ben. Ben hat {{500}}.').get('Mara')).toBe(800);
  });

  it('unbekannte oder ungültige force-Schlüssel brechen ab', () => {
    const bad: Record<string, GenerateOptions['force'][]> = {
      sequence: [{ tippfehler: 1 }, { muster: 'blume' }, { luecke: 'vorne' }, { antwort: 'pay' }],
      balance: [{ tippfehler: 1 }, { frage: 'mehr' }, { geld: 'ja' }, { antwort: 'money' }],
      wall: [{ tippfehler: 1 }, { luecken: 0 }, { unten: 'ja' }],
      triangle: [{ tippfehler: 1 }, { luecken: 1.5 }],
      logic: [{ tippfehler: 1 }, { frage: 'oben' }],
      code: [{ tippfehler: 1 }, { raeder: 5 }, { punkte: 1 }],
    };
    for (const g of RIDDLE_GENERATORS) {
      const cfg = STUFEN[g.stufen[0] ?? 2];
      for (const force of bad[g.id] ?? [])
        expect(() => g.generate(cfg, mulberry32(1), { force }), g.id).toThrow();
      expect(() => g.generate(cfg, mulberry32(1), { bind: { A: 'kokosnuss' } }), g.id).toThrow();
    }
  });

  it('force-Schlüssel aus docs/10 5.1 werden respektiert', () => {
    type Check = (task: Task, stufe: Stufe) => boolean;
    const blankAt = (t: Task) =>
      t.scene.kind === 'sequence' ? t.scene.items.findIndex((i) => i.kind === 'blank') : -1;
    const items = (t: Task) => (t.scene.kind === 'sequence' ? t.scene.items : []);
    const open = (t: Task) => {
      const a = part(t).answer;
      return a.type === 'grid' ? a.cells.filter((c) => !c.given).map((c) => c.id) : [];
    };
    const kinds = (kind: string) => (t: Task) =>
      items(t).every((i) => i.kind === 'blank' || i.kind === kind);
    // [Vorlage, force, Prüfung, Stufen ohne Aufgabe]
    const cases: [string, Record<string, unknown>, Check, Stufe[]][] = [
      ['sequence', { muster: 'bild' }, kinds('icon'), []],
      ['sequence', { muster: 'zahl' }, kinds('number'), []],
      ['sequence', { muster: 'menge' }, kinds('objects'), [3, 4]],
      ['sequence', { muster: 'geld' }, kinds('money'), [1]],
      ['sequence', { luecke: 'ende' }, (t) => blankAt(t) === items(t).length - 1, []],
      ['sequence', { luecke: 'mitte' }, (t) => blankAt(t) < items(t).length - 1, []],
      [
        'sequence',
        { muster: 'zahl', antwort: 'number' },
        (t) => part(t).answer.type === 'number',
        [],
      ],
      [
        'sequence',
        { muster: 'geld', antwort: 'money' },
        (t) => part(t).answer.type === 'money',
        [1],
      ],
      ['sequence', { antwort: 'choice' }, (t) => part(t).answer.type === 'choice', []],
      ['balance', { frage: 'gleich' }, (t) => part(t).answer.type === 'choice', []],
      [
        'balance',
        { geld: false },
        (t) => t.scene.kind === 'balance' && !!t.scene.left.objects,
        [3, 4],
      ],
      ['balance', { geld: true }, (t) => t.scene.kind === 'balance' && !!t.scene.left.pieces, []],
      [
        'balance',
        { frage: 'fehlt', antwort: 'number' },
        (t) => part(t).answer.type === 'number',
        [3, 4],
      ],
      [
        'wall',
        { luecken: 2, unten: true },
        (t) => open(t).length === 2 && open(t).some((c) => c.startsWith('r0')),
        [1], // 2 Steine unten: Mit 2 Lücken ist die Mauer nicht eindeutig.
      ],
      ['wall', { unten: true }, (t) => open(t).some((c) => c.startsWith('r0')), []],
      ['wall', { unten: false }, (t) => !open(t).some((c) => c.startsWith('r0')), []],
      ['triangle', { luecken: 3, unten: true }, (t) => open(t).some((c) => c.length === 1), []],
      ['triangle', { unten: false }, (t) => open(t).every((c) => c.length === 2), []],
      ['triangle', { luecken: 2 }, (t) => open(t).length === 2, []],
      ['logic', { frage: 'wenigsten' }, (t) => part(t).question.includes('am wenigsten'), []],
      ['logic', { frage: 'mitte' }, (t) => part(t).question.includes('nicht am meisten'), []],
      ['logic', { frage: 'betrag' }, (t) => part(t).answer.type === 'money', []],
      [
        'code',
        { raeder: 4 },
        (t) =>
          part(t).answer.type === 'code' &&
          (part(t).answer as { digits: number[] }).digits.length === 4,
        [],
      ],
      [
        'code',
        { punkte: true },
        (t) => t.scene.kind === 'clues' && t.scene.clues.every((c) => c.dots),
        [],
      ],
      [
        'code',
        { punkte: false },
        (t) => t.scene.kind === 'clues' && t.scene.clues.every((c) => !c.dots),
        [],
      ],
    ];
    for (const [id, force, check, none] of cases) {
      const generator = gen(id);
      for (const stufe of generator.stufen) {
        const cfg = STUFEN[stufe];
        const name = `${id} ${JSON.stringify(force)} Stufe ${String(stufe)}`;
        let supported = 0;
        for (let seed = 1; seed <= 40; seed++) {
          const task = generator.generate(cfg, mulberry32(seed), { force });
          if (task === 'unsupported') continue;
          supported++;
          expect(check(task, stufe), name).toBe(true);
          expect(validateTask(task, cfg), name).toEqual([]);
          expect(riddleErrors(id, task, cfg), name).toEqual([]);
        }
        if (none.includes(stufe)) expect(supported, name).toBe(0);
        else expect(supported, name).toBeGreaterThanOrEqual(32);
      }
    }
  });

  it('Varianten der Muscheltruhe (docs/11, B5.1–B5.5) auf allen Stufen', () => {
    const variants: [string, Record<string, unknown>][] = [
      ['sequence', { muster: 'bild' }],
      ['sequence', { muster: 'zahl', luecke: 'mitte', antwort: 'number' }],
      ['sequence', { muster: 'menge' }],
      ['balance', { frage: 'fehlt', geld: true }],
      ['code', { raeder: 3, punkte: true }],
    ];
    for (const [id, force] of variants) {
      for (const stufe of [1, 2, 3, 4] as Stufe[]) {
        // Mengenmuster gibt es nur auf Stufe 1–2 (docs/10 Abschnitt 4).
        if (id === 'sequence' && force.muster === 'menge' && stufe > 2) continue;
        const cfg = STUFEN[stufe];
        const tasks = [1, 2, 3, 4, 5].map((seed) =>
          gen(id).generate(cfg, mulberry32(seed), { force }),
        );
        for (const task of tasks) {
          expect(task, `${id} Stufe ${String(stufe)}`).not.toBe('unsupported');
          if (task !== 'unsupported') expect(validateTask(task, cfg)).toEqual([]);
        }
      }
    }
  });
});

function idsOf(width: number): string[] {
  const ids: string[] = [];
  for (let row = 0; row < width; row++)
    for (let col = 0; col < width - row; col++) ids.push(`r${String(row)}c${String(col)}`);
  return ids;
}
