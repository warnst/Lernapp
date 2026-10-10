import { solveGrid } from '@/domain/grid';
import { randomInt, shuffle } from '@/domain/random';
import type { GridCell } from '@/domain/types';
import { makeTask, readBind, readForce } from '../build';
import type { Generator } from '../types';
import { allSums, solveSteps, stepText, subsetsOf, TRIANGLE_RELATIONS } from './grid-steps';
import { limitMoney, paramsFor, riddleStufen } from './params';
import { formatter, gridForce } from './shared';

// Rechendreieck (docs/10): innen a, b, c; außen ab = a + b, bc = b + c, ca = c + a.

const INNER = ['a', 'b', 'c'];
const OUTER = ['ab', 'bc', 'ca'];
const IDS = [...INNER, ...OUTER];

export const triangle: Generator = {
  id: 'triangle',
  topic: 'raetsel',
  stufen: riddleStufen('triangle'),
  generate(cfg, rng, opts) {
    const force = gridForce(readForce(opts, ['luecken', 'unten']));
    readBind(opts, []);
    if (!cfg.riddles.types.includes('triangle') || !cfg.answerTypes.includes('grid'))
      return 'unsupported';
    const p = paramsFor(cfg).triangle;
    const moneyGrid = limitMoney(cfg, p.money);
    const money = moneyGrid !== null && rng() < cfg.riddles.moneyShare ? moneyGrid : null;
    const unit = money?.step ?? 1;
    const maxOuter = Math.floor(
      (money?.maxTop ?? Math.min(p.numberMaxOuter, cfg.numbers.max)) / unit,
    );
    const half = Math.floor(maxOuter / 2);
    if (half < 2) return 'unsupported';
    const [a, b, c] = [0, 0, 0].map(() => randomInt(rng, 1, half) * unit) as [
      number,
      number,
      number,
    ];
    if (a === b && b === c) return 'unsupported';
    const values: Record<string, number> = { a, b, c, ab: a + b, bc: b + c, ca: c + a };

    // Welche Felder fehlen: Standard je Stufe, mit force beliebig (eindeutig lösbar).
    const preset = { outer: OUTER, inner: INNER, mixed: null }[p.mode];
    const gaps = force.luecken ?? 3;
    const fits = (set: readonly string[]) =>
      set.length === gaps &&
      (force.unten === undefined || set.some((x) => INNER.includes(x)) === force.unten);
    const mixed = (set: readonly string[]) =>
      set.some((x) => INNER.includes(x)) && set.some((x) => OUTER.includes(x));
    const cellsFor = (open: readonly string[]): GridCell[] =>
      IDS.map((cid) => ({ id: cid, value: values[cid] ?? 0, given: !open.includes(cid) }));
    const solvable = (open: readonly string[]) =>
      solveGrid(
        'triangle',
        cellsFor(open).map((x) => (x.given ? { id: x.id, value: x.value } : { id: x.id })),
      ) !== null;
    const candidates = [
      ...(preset && fits(preset) ? [preset] : []),
      ...shuffle(
        rng,
        subsetsOf(IDS, gaps).filter((set) => fits(set) && (preset !== null || mixed(set))),
      ),
      ...shuffle(rng, subsetsOf(IDS, gaps).filter(fits)),
    ];
    const open = candidates.find(solvable);
    if (!open) return 'unsupported';

    const cells = cellsFor(open);
    const fmt = formatter(money !== null);
    const steps = solveSteps(TRIANGLE_RELATIONS, cells);
    const first = steps[0];
    const byFormula = steps.length < open.length;
    const tip2 = byFormula
      ? `Probiere es aus: Welche zwei ${money ? 'Beträge' : 'Zahlen'} ergeben zusammen ${fmt(a + b)}? Passen sie auch zu den anderen?`
      : first?.kind === 'sum'
        ? `Rechne ${fmt(first.left)} + ${fmt(first.right)}.`
        : first
          ? `${fmt(first.total)} − ${fmt(first.known)} = ?`
          : '';
    const explanation = byFormula
      ? `Innen stehen ${fmt(a)}, ${fmt(b)} und ${fmt(c)}. ${allSums(TRIANGLE_RELATIONS, values, fmt)}`
      : steps.map((s) => stepText(s, fmt)).join(' ');
    return makeTask(
      cfg,
      'Das Rechendreieck',
      { kind: 'none' },
      `Kiko malt ein Rechendreieck. ${money ? 'Jedes Feld' : 'Jede Zahl'} außen ist so viel wie die zwei Punktefelder daneben zusammen.`,
      [
        {
          question: `Fülle ${open.length === 1 ? 'das leere Feld' : 'die leeren Felder'} aus.`,
          answer: { type: 'grid', shape: 'triangle', unit: money ? 'cents' : 'number', cells },
          hints: [
            `${money ? 'Jedes Feld' : 'Jede Zahl'} außen ist so viel wie die zwei Punktefelder daneben zusammen.`,
            tip2,
          ],
          explanation,
        },
      ],
      3,
    );
  },
};
