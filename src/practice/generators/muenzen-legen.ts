import { findCombination, payCombinations } from '@/domain/money';
import { pick, randomInt, type Rng } from '@/domain/random';
import type { Cents, MoneyPiece, StufeConfig, Task, TaskPart } from '@/domain/types';
import { cap, makeTask, readBind, readForce, tok } from '../build';
import type { GenerateOptions, Generator } from '../types';
import {
  andList,
  countWord,
  displayOrder,
  fewestPieces,
  greedyPieces,
  isNote,
  paletteFor,
  pieceDef,
  pieceDefAkk,
  pieceIndefAkk,
  pieceName,
  piecesUpTo,
  piecesWord,
  plusList,
  simpleMoney,
} from './muenzen-legen-parts';

// Vorlagen für das Thema „muenzen-legen“ (docs/05 4.4, Varianten docs/09 5.2 und docs/11).

const TRIES = 40;

/** Geschichte zufällig aus dem Pool der Welt (docs/05 4.4). */
function storyFor(cfg: StufeConfig, rng: Rng): string {
  return pick(
    rng,
    cfg.world === 'kleine-bucht'
      ? ['Kiko braucht Kleingeld für seinen Laden.', 'Krümel möchte passend bezahlt werden.']
      : [
          'Kiko braucht Kleingeld für den Kiosk.',
          'Im Münzschlitz muss genau der richtige Betrag landen.',
          'Tante Polly möchte passend bezahlt werden.',
        ],
  );
}

/** Zufallsbetrag im Stufenschritt von zwei Schritten bis maxTotal. */
function randomTarget(cfg: StufeConfig, rng: Rng): Cents {
  const step = cfg.money.step;
  return randomInt(rng, 2, Math.floor(cfg.money.maxTotal / step)) * step;
}

function readPositiveInt(value: unknown, key: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error(`force.${key} muss eine positive ganze Zahl sein`);
  }
  return value;
}

/** „Fang mit der größten Münze an, die passt.“ bzw. „… mit dem größten Schein …“ */
function startBiggest(piece: number, verb: string): string {
  return isNote(piece)
    ? `${verb} zuerst den größten Schein, der passt.`
    : `${verb} zuerst die größte Münze, die passt.`;
}

// ---------- L1: genau einen Betrag legen ----------

interface L1Plan {
  target: Cents;
  palette: MoneyPiece[];
}

function planL1(
  cfg: StufeConfig,
  rng: Rng,
  rund: boolean,
  exactCount: number | undefined,
): L1Plan | null {
  const pieces = piecesUpTo(cfg);
  if (rund) {
    // runder Betrag, die gleichwertige Münze fehlt in der Palette
    const target = pick(
      rng,
      pieces.filter((p) => p >= 2 * cfg.money.step),
    );
    const palette = paletteFor(
      target,
      pieces.filter((p) => p < target),
    );
    return palette && { target, palette };
  }
  if (exactCount === 1) {
    // Betrag ist ein Stück; daneben liegen kleinere Stücke zur Auswahl
    const target = pick(
      rng,
      pieces.filter((p) => pieces.some((q) => q < p)),
    );
    const palette = paletteFor(target, piecesUpTo(cfg, target));
    return palette?.includes(target) ? { target, palette } : null;
  }
  if (exactCount !== undefined) {
    const coins = pieces.filter((p) => !isNote(p));
    const chosen = Array.from({ length: exactCount }, () => pick(rng, coins));
    const target = chosen.reduce((sum, p) => sum + p, 0);
    if (target > cfg.money.maxTotal) return null;
    const palette = paletteFor(
      target,
      coins.filter((p) => p <= target),
    );
    if (!palette) return null;
    const fits = findCombination(target, palette, exactCount) !== null;
    return fits ? { target, palette } : null;
  }
  const target = randomTarget(cfg, rng);
  if (pieces.includes(target as MoneyPiece)) return null; // mit einem Stück wäre es zu leicht
  const palette = paletteFor(target, piecesUpTo(cfg, target));
  return palette && { target, palette };
}

function partL1(
  cfg: StufeConfig,
  plan: L1Plan,
  rund: boolean,
  exactCount: number | undefined,
): Omit<TaskPart, 'id'> {
  const { target, palette } = plan;
  const showTotal = simpleMoney(cfg) || rund;
  const answer = {
    type: 'pay' as const,
    target,
    palette: displayOrder(cfg, palette),
    showTotal,
    ...(exactCount === undefined ? {} : { exactCount }),
  };
  const best = fewestPieces(target, palette) ?? [];
  const first = best[0] ?? target;

  if (exactCount === 1) {
    const note = isNote(target);
    return {
      question: `Lege ${tok(target)} mit nur ${note ? 'einem Schein' : 'einer Münze'}.`,
      answer,
      hints: [
        `Schau dir die Zahlen auf den ${piecesWord(palette, true)} an.`,
        cfg.money.centOnly
          ? `Auf einer Münze steht eine ${String(target)}.`
          : `Gesucht ist ${pieceDef(target)}.`,
      ],
      explanation: `${cap(pieceDef(target))}. ${note ? 'Ein Schein' : 'Eine Münze'}, ${tok(target)}.`,
    };
  }
  if (exactCount !== undefined) {
    const combo = findCombination(target, palette, exactCount) ?? best;
    return {
      question: `Lege ${tok(target)} mit genau ${countWord(exactCount)} Münzen.`,
      answer,
      hints: [
        `Du brauchst genau ${countWord(exactCount)} Münzen. Zähle beim Legen mit.`,
        `Probier es mit einer ${pieceName(combo[0] ?? first)}. Wie viel fehlt dann noch?`,
      ],
      explanation: `${plusList(combo)} = ${tok(target)}. Das sind ${countWord(exactCount)} Münzen.`,
    };
  }

  const question = `Lege genau ${tok(target)} mit ${piecesWord(palette, true)}.`;
  if (rund) {
    const biggest = Math.max(...palette) as MoneyPiece;
    const fits = target % biggest === 0;
    return {
      question,
      answer,
      hints: [
        `${cap(pieceIndefAkk(target))} gibt es hier nicht. Nimm mehrere kleinere ${piecesWord(palette)}.`,
        fits
          ? `Probier es mit ${piecePluralSafe(biggest)}. Wie viele brauchst du für ${tok(target)}?`
          : `Probier es mit ${piecePluralSafe(biggest)}. Wie viel fehlt dann noch bis ${tok(target)}?`,
      ],
      explanation: cfg.money.centOnly
        ? `Zum Beispiel: ${andList(best)} sind ${tok(target)}.`
        : `Zum Beispiel: ${plusList(best)} = ${tok(target)}.`,
    };
  }
  if (cfg.money.centOnly) {
    // Stil der kleinen Bucht (B3.1)
    return {
      question,
      answer,
      hints: [
        'Auf jeder Münze steht, wie viel Cent sie wert ist.',
        `Lege Münzen, bis auf dem Tablett ${tok(target)} stehen.`,
      ],
      explanation: `${andList(best)} sind ${tok(target)}.`,
    };
  }
  return {
    question,
    answer,
    hints: [
      startBiggest(first, 'Nimm'),
      showTotal
        ? `Lege weiter, bis auf dem Tablett ${tok(target)} stehen.`
        : `Nach ${tok(first)} fehlen noch ${tok(target - first)}.`,
    ],
    explanation: `Zum Beispiel: ${plusList(best)} = ${tok(target)}.`,
  };
}

/** „50-Cent-Münzen“ / „5-Euro-Scheinen“ (Dativ Plural nach „mit“) */
function piecePluralSafe(piece: MoneyPiece): string {
  return isNote(piece) ? `${pieceName(piece)}en` : `${pieceName(piece)}n`;
}

function titleL1(plan: L1Plan, rund: boolean, exactCount: number | undefined): string {
  if (rund) return `Ohne ${pieceName(plan.target)}`;
  if (exactCount === 1) return isNote(plan.target) ? 'Nur ein Schein' : 'Nur eine Münze';
  if (exactCount !== undefined) return `Genau ${countWord(exactCount)} Münzen`;
  return 'Genau passend';
}

const L1: Generator = {
  id: 'L1',
  topic: 'muenzen-legen',
  stufen: [1, 2, 3, 4],
  generate(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
    const force = readForce(opts, ['exactCount', 'ziel']);
    readBind(opts, []);
    const exactCount = readPositiveInt(force.exactCount, 'exactCount');
    if (force.ziel !== undefined && force.ziel !== 'rund') {
      throw new Error("force.ziel kennt nur 'rund'");
    }
    const rund = force.ziel === 'rund';
    if (!cfg.answerTypes.includes('pay')) return 'unsupported';
    for (let attempt = 0; attempt < TRIES; attempt++) {
      const plan = planL1(cfg, rng, rund, exactCount);
      if (!plan) continue;
      if (
        exactCount !== undefined &&
        findCombination(plan.target, plan.palette, exactCount) === null
      ) {
        continue;
      }
      const base = storyFor(cfg, rng);
      const story = rund ? `${base} ${cap(pieceIndefAkk(plan.target))} hat Kiko nicht.` : base;
      return makeTask(
        cfg,
        titleL1(plan, rund, exactCount),
        { kind: 'none' },
        story,
        [partL1(cfg, plan, rund, exactCount)],
        2,
      );
    }
    return 'unsupported';
  },
};

// ---------- L2: so wenige Münzen wie möglich ----------

const L2: Generator = {
  id: 'L2',
  topic: 'muenzen-legen',
  stufen: [2, 3, 4],
  generate(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('pay')) return 'unsupported';
    for (let attempt = 0; attempt < TRIES; attempt++) {
      const target = randomTarget(cfg, rng);
      const pieces = piecesUpTo(cfg, target);
      if (pieces.includes(target as MoneyPiece)) continue;
      const palette = paletteFor(target, pieces);
      if (!palette) continue;
      const best = fewestPieces(target, palette);
      const greedy = greedyPieces(target, palette);
      // „größte Münze zuerst“ muss hier wirklich die wenigsten Stücke liefern
      if (!best || !greedy) continue;
      if (greedy.length !== best.length || best.length < 2) continue;
      const first = greedy[0] ?? target;
      const story = storyFor(cfg, rng);
      const word = piecesWord(greedy);
      return makeTask(
        cfg,
        'So wenige Münzen wie möglich',
        { kind: 'none' },
        story,
        [
          {
            question: `Lege ${tok(target)} mit so wenigen ${piecesWord(palette, true)} wie möglich.`,
            answer: {
              type: 'pay',
              target,
              palette: displayOrder(cfg, palette),
              showTotal: true,
              minimal: true,
            },
            hints: [
              startBiggest(first, 'Nimm'),
              `Nach ${tok(first)} fehlen noch ${tok(target - first)}. Was passt jetzt am besten?`,
            ],
            explanation: `${plusList(greedy)} = ${tok(target)}. Das sind nur ${countWord(greedy.length)} ${word}.`,
            ...(word === 'Münzen'
              ? { praise: 'Super! Mit den großen Münzen zuerst brauchst du die wenigsten Münzen.' }
              : {}),
          },
        ],
        3,
      );
    }
    return 'unsupported';
  },
};

// ---------- L3: auf verschiedene Arten legen ----------

/** Standard: zwei Möglichkeiten, auf Stufe 4 drei (docs/05 4.4); aus cfg.maxSteps abgeleitet. */
function defaultRequired(cfg: StufeConfig): number {
  return Math.max(2, cfg.maxSteps);
}

const L3: Generator = {
  id: 'L3',
  topic: 'muenzen-legen',
  stufen: [3, 4],
  generate(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
    const force = readForce(opts, ['required']);
    readBind(opts, []);
    const required = readPositiveInt(force.required, 'required') ?? defaultRequired(cfg);
    if (!cfg.answerTypes.includes('pay-variants')) return 'unsupported';
    const pieces = piecesUpTo(cfg);
    for (let attempt = 0; attempt < TRIES; attempt++) {
      // halb runde Beträge (wie 1 € oder 50 Cent im Original), halb beliebige
      // mindestens zehn Stufenschritte, sonst gibt es kaum verschiedene Wege
      const least = 10 * cfg.money.step;
      const roundOnes = pieces.filter((p) => p >= least);
      const target = rng() < 0.5 ? pick(rng, roundOnes) : randomTarget(cfg, rng);
      if (target < least) continue;
      const excluded = Math.max(...pieces.filter((p) => p <= target)) as MoneyPiece;
      const palette = paletteFor(
        target,
        pieces.filter((p) => p < excluded),
      );
      if (!palette) continue;
      const combos = payCombinations(target, palette);
      if (combos.length < required) continue;
      const examples = [...combos]
        .sort((a, b) => a.length - b.length)
        .slice(0, required)
        .map((c) => plusList(c));
      const story = storyFor(cfg, rng);
      return makeTask(
        cfg,
        `${cap(countWord(required))} Wege`,
        { kind: 'none' },
        story,
        [
          {
            question: `Lege ${tok(target)} auf ${countWord(required)} verschiedene Arten. ${cap(pieceDefAkk(excluded))} darfst du nicht benutzen.`,
            answer: {
              type: 'pay-variants',
              target,
              palette: displayOrder(cfg, palette),
              required,
              showTotal: true,
            },
            hints: [
              isNote(Math.max(...palette))
                ? 'Fang mit dem größten Schein an, den du benutzen darfst.'
                : 'Fang mit der größten Münze an, die du benutzen darfst.',
              isNote(Math.max(...palette))
                ? 'Für eine andere Möglichkeit: Nimm statt eines großen Scheins mehrere kleinere.'
                : 'Für eine andere Möglichkeit: Nimm statt einer großen Münze mehrere kleine.',
            ],
            explanation: `Zum Beispiel: ${examples.join('. Oder: ')}.`,
          },
        ],
        4,
      );
    }
    return 'unsupported';
  },
};

export const MUENZEN_LEGEN_GENERATORS: Generator[] = [L1, L2, L3];
