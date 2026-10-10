import { solveGrid } from '@/domain/grid';
import { randomInt, shuffle } from '@/domain/random';
import type { GridCell } from '@/domain/types';
import { makeTask, readBind, readForce } from '../build';
import type { Generator } from '../types';
import { allSums, solveSteps, stepText, subsetsOf, wallRelations } from './grid-steps';
import { limitMoney, paramsFor, riddleStufen } from './params';
import { attempt, formatter, gridForce } from './shared';

// Zahlenmauer (docs/10): erst die volle Mauer, dann Lücken, solange der Löser eindeutig füllt.

const id = (row: number, col: number) => `r${String(row)}c${String(col)}`;

/** Volle Mauer aus den unteren Steinen (in Einheiten). */
function buildRows(bottom: readonly number[]): number[][] {
  const rows = [bottom.slice()];
  for (let r = 1; r < bottom.length; r++) {
    const below = rows[r - 1] ?? [];
    rows.push(below.slice(1).map((v, c) => (below[c] ?? 0) + v));
  }
  return rows;
}

export const wall: Generator = {
  id: 'wall',
  topic: 'raetsel',
  stufen: riddleStufen('wall'),
  generate(cfg, rng, opts) {
    const force = gridForce(readForce(opts, ['luecken', 'unten']));
    readBind(opts, []);
    if (!cfg.riddles.types.includes('wall') || !cfg.answerTypes.includes('grid'))
      return 'unsupported';
    const p = paramsFor(cfg).wall;
    const moneyGrid = limitMoney(cfg, p.money);
    const money = moneyGrid !== null && rng() < cfg.riddles.moneyShare ? moneyGrid : null;
    const unit = money?.step ?? 1;
    const maxTop = Math.floor((money?.maxTop ?? Math.min(p.numberMaxTop, cfg.numbers.max)) / unit);
    const width = p.width;
    // Untere Steine so wählen, dass die Spitze (Summe mit Binomialgewichten) passt.
    const each = Math.max(1, Math.floor((2 * maxTop) / 2 ** (width - 1)));
    const rows = attempt(200, () => {
      const bottom = Array.from({ length: width }, () => randomInt(rng, 1, each));
      const built = buildRows(bottom);
      const top = built[width - 1]?.[0] ?? Infinity;
      return top <= maxTop && top * 3 >= maxTop ? built : null;
    });
    if (!rows) return 'unsupported';
    const values: Record<string, number> = {};
    rows.forEach((row, r) => {
      row.forEach((v, c) => {
        values[id(r, c)] = v * unit;
      });
    });
    const ids = Object.keys(values);
    const gaps = force.luecken ?? p.gaps[randomInt(rng, 0, p.gaps.length - 1)] ?? 1;
    const unten = force.unten ?? rng() < p.bottomShare;
    const candidates = shuffle(
      rng,
      subsetsOf(ids, gaps).filter((set) => set.some((c) => c.startsWith('r0c')) === unten),
    );
    const cellsFor = (open: readonly string[]): GridCell[] =>
      ids.map((cid) => ({ id: cid, value: values[cid] ?? 0, given: !open.includes(cid) }));
    const open = candidates.find(
      (set) =>
        solveGrid(
          'wall',
          cellsFor(set).map((c) => (c.given ? { id: c.id, value: c.value } : { id: c.id })),
        ) !== null,
    );
    if (!open) return 'unsupported';
    const cells = cellsFor(open);
    const fmt = formatter(money !== null);
    const relations = wallRelations(width);
    const steps = solveSteps(relations, cells);
    const first = steps[0];
    if (!first || steps.length !== open.length) return 'unsupported';
    const tip2 =
      first.kind === 'sum'
        ? `Rechne ${fmt(first.left)} + ${fmt(first.right)}.`
        : `Was musst du zu ${fmt(first.known)} dazurechnen, damit ${fmt(first.total)} herauskommt?`;
    const explanation = steps.every((s) => s.kind === 'sum')
      ? allSums(relations, values, fmt)
      : steps.map((s) => stepText(s, fmt)).join(' ');
    const topId = id(width - 1, 0);
    const onlyTop = open.length === 1 && open[0] === topId;
    const story =
      width === 2
        ? 'Kiko baut eine Zahlenmauer. Oben steht, was unten zusammen ist.'
        : 'Kiko baut eine Zahlenmauer. Jeder Stein ist so viel wie die zwei Steine darunter zusammen.';
    return makeTask(
      cfg,
      money ? 'Die Geldmauer' : 'Die Zahlenmauer',
      { kind: 'none' },
      story,
      [
        {
          question:
            onlyTop && !money
              ? 'Welche Zahl kommt auf den oberen Stein?'
              : `Fülle ${open.length === 1 ? 'den leeren Stein' : 'die leeren Steine'} aus.`,
          answer: { type: 'grid', shape: 'wall', unit: money ? 'cents' : 'number', cells },
          hints: ['Ein Stein ist immer so viel wie die zwei Steine darunter zusammen.', tip2],
          explanation,
        },
      ],
      3,
    );
  },
};
