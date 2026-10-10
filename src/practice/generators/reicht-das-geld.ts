import type { Item } from '@/content/items';
import { randomInt, type Rng } from '@/domain/random';
import type {
  Cents,
  ChoiceOption,
  Mistake,
  MoneyPiece,
  Scene,
  StufeConfig,
  Task,
  TaskPart,
} from '@/domain/types';
import {
  cap,
  chooseItem,
  chooseName,
  itemsFor,
  makeTask,
  mix,
  randomPrice,
  readBind,
  readForce,
  tok,
  yesNo,
} from '../build';
import type { GenerateOptions, Generator } from '../types';
import { numberWord, plusList } from './muenzen-legen-parts';
import { countUp, defAkk, differenceMistakes, handPieces, listJoin } from './reicht-das-geld-parts';

// Vorlagen für das Thema „reicht-das-geld“ (docs/05 4.5, Varianten docs/09 5.2 und docs/11).

const TRIES = 40;

type Part = Omit<TaskPart, 'id'>;

function readBool(value: unknown, key: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') throw new Error(`force.${key} muss true oder false sein`);
  return value;
}

/** Ja/Nein ohne force: die Hälfte reicht. */
function decideReicht(rng: Rng, forced: boolean | undefined): boolean {
  return forced ?? rng() < 0.5;
}

/** Zufallsbetrag im Stufenschritt in [low, high] oder null. */
function amountBetween(rng: Rng, cfg: StufeConfig, low: Cents, high: Cents): Cents | null {
  const step = cfg.money.step;
  const from = Math.max(1, Math.ceil(low / step));
  const to = Math.floor(high / step);
  return from > to ? null : randomInt(rng, from, to) * step;
}

/** Budget zum Preis: genau, etwas mehr oder etwas weniger (höchstens halber Preis daneben). */
function budgetFor(
  rng: Rng,
  cfg: StufeConfig,
  price: Cents,
  kind: 'genau' | 'mehr' | 'weniger',
): Cents | null {
  if (kind === 'genau') return price;
  const step = cfg.money.step;
  const spread = Math.max(step, Math.ceil(price / 2 / step) * step);
  return kind === 'mehr'
    ? amountBetween(rng, cfg, price + step, Math.min(cfg.money.maxTotal, price + spread))
    : amountBetween(rng, cfg, Math.max(step, price - spread), price - step);
}

// ---------- G1: Reicht das Geld für eine Sache? ----------

interface G1Plan {
  item: Item;
  price: Cents;
  budget: Cents;
  reicht: boolean;
  genau: boolean;
}

function planG1(
  cfg: StufeConfig,
  rng: Rng,
  boundA: string | undefined,
  force: { reicht?: boolean; genau?: boolean; zweiteilig: boolean },
): G1Plan | null {
  const item = chooseItem(rng, cfg, boundA);
  if (!item) return null;
  const price = randomPrice(rng, cfg, item);
  if (price === null) return null;
  // in jeder vierten Aufgabe genau (docs/05 4.5); nie bei zweiteilig, sonst wäre Teil b 0
  let genau: boolean;
  let reicht: boolean;
  if (force.genau === true && force.reicht !== false) {
    genau = true;
    reicht = true;
  } else {
    reicht = decideReicht(rng, force.reicht);
    genau = reicht && force.genau !== false && !force.zweiteilig && rng() < 0.5;
  }
  const budget = budgetFor(rng, cfg, price, genau ? 'genau' : reicht ? 'mehr' : 'weniger');
  if (budget === null || budget > cfg.money.maxTotal) return null;
  return { item, price, budget, reicht, genau };
}

/** Stufe 1 im Stil von B3.4 und B3.5 (docs/11): „Du hast …“, immer mit Geld in der Hand. */
function partsG1Bucht(plan: G1Plan, zweiteilig: boolean): Part[] {
  const { item, price, budget, reicht, genau } = plan;
  const def = cap(item.def);
  const b = String(budget);
  const p = String(price);
  const partA: Part = {
    question: zweiteilig ? `Reicht dein Geld für ${defAkk(item)}?` : 'Reicht dein Geld?',
    answer: yesNo('Ja', 'Nein', reicht, {
      no: genau
        ? `Du hast genau ${tok(price)}. Dein Geld reicht!`
        : `${b} ist mehr als ${p}. Dein Geld reicht!`,
      yes: `${def} kostet ${tok(price)}. Du hast nur ${tok(budget)}.`,
    }),
    hints: genau
      ? [
          `Vergleiche: Du hast ${tok(budget)}. ${def} kostet ${tok(price)}.`,
          'Hast du genauso viel oder mehr Geld, dann reicht es.',
        ]
      : [
          `Was ist mehr: ${b} oder ${p}?`,
          reicht
            ? 'Hast du genauso viel oder mehr Geld, dann reicht es.'
            : `${def} kostet mehr, als du hast.`,
        ],
    explanation: genau
      ? `Du hast ${tok(budget)}. ${def} kostet ${tok(price)}. Das ist gleich viel. Es reicht genau!`
      : reicht
        ? `Du hast ${tok(budget)}. ${def} kostet ${tok(price)}. ${b} ist mehr als ${p}. Es reicht.`
        : `${p} ist mehr als ${b}. Das Geld reicht nicht.`,
  };
  if (!zweiteilig || genau) return [partA];
  const lo = Math.min(price, budget);
  const hi = Math.max(price, budget);
  const diff = hi - lo;
  const steps = Array.from({ length: diff + 1 }, (_, i) => numberWord(lo + i));
  const mistakes: Mistake[] = [
    {
      value: diff + 1,
      feedback: `Zähle von ${String(lo)} weiter bis ${String(hi)}. Wie viele Schritte sind das?`,
    },
    { value: lo + hi, feedback: 'Du hast zusammengezählt. Hier wird es weniger.' },
  ];
  const fehlt = !reicht;
  return [
    partA,
    {
      question: fehlt ? 'Wie viel Cent fehlen dir?' : 'Wie viel Cent bleiben übrig?',
      answer: { type: 'number', correct: diff },
      mistakes: mistakes.filter((m, i) => mistakes.findIndex((n) => n.value === m.value) === i),
      hints: [
        `Zähle von ${String(lo)} bis ${String(hi)}.`,
        `${cap(steps.join(' … '))}. ${diff === 1 ? 'Das ist ein Schritt.' : `Das sind ${numberWord(diff)} Schritte.`}`,
      ],
      explanation: fehlt
        ? `Von ${String(lo)} bis ${String(hi)} ${diff === 1 ? 'ist es' : 'sind es'} ${String(diff)}. ${diff === 1 ? 'Dir fehlt 1 Cent.' : `Dir fehlen ${String(diff)} Cent.`}`
        : `Von ${String(lo)} bis ${String(hi)} ${diff === 1 ? 'ist es' : 'sind es'} ${String(diff)}. ${diff === 1 ? 'Es bleibt 1 Cent übrig.' : `Es bleiben ${String(diff)} Cent übrig.`}`,
      praise: fehlt ? 'Super! Du hast herausgefunden, was fehlt.' : 'Super! Du hast weitergezählt.',
    },
  ];
}

/** Teil b auf der Insel: Wie viel Geld fehlt / bleibt übrig? */
function differencePart(
  cfg: StufeConfig,
  lo: Cents,
  hi: Cents,
  fehlt: boolean,
  extra: readonly Mistake[] = [],
): Part {
  const up = countUp(lo, hi);
  return {
    question: fehlt ? 'Wie viel Geld fehlt?' : 'Wie viel Geld bleibt übrig?',
    answer: { type: 'money', correct: hi - lo },
    mistakes: differenceMistakes(cfg, lo, hi, extra),
    hints: up.hints,
    explanation: `${up.steps} ${fehlt ? 'So viel Geld fehlt.' : 'So viel Geld bleibt übrig.'}`,
  };
}

function partsG1Insel(
  cfg: StufeConfig,
  plan: G1Plan,
  name: { name: string; pron: string },
  inDerHand: boolean,
  hand: readonly MoneyPiece[],
  zweiteilig: boolean,
): Part[] {
  const { item, price, budget, reicht, genau } = plan;
  const def = cap(item.def);
  const n = name.name;
  const partA: Part = {
    question: 'Reicht das Geld?',
    answer: yesNo('Ja, es reicht', 'Nein, es reicht nicht', reicht, {
      no: genau
        ? `${n} hat genau ${tok(price)}. Das reicht!`
        : `${n} hat ${tok(budget)}. Das ist mehr als ${tok(price)}.`,
      yes: `${def} kostet ${tok(price)}. ${n} hat nur ${tok(budget)}.`,
    }),
    hints: [
      inDerHand
        ? 'Zähle zuerst das Geld in der Hand zusammen.'
        : `Vergleiche: ${n} hat ${tok(budget)}. ${def} kostet ${tok(price)}.`,
      `Hat ${n} genauso viel Geld oder mehr, dann reicht es.`,
    ],
    explanation:
      (inDerHand && hand.length > 1 ? `${plusList(hand)} = ${tok(budget)}. ` : '') +
      (genau
        ? `${n} hat genau ${tok(price)}. Es reicht genau!`
        : reicht
          ? `${tok(budget)} ist mehr als ${tok(price)}. Das Geld reicht.`
          : `${tok(price)} ist mehr als ${tok(budget)}. Das Geld reicht nicht.`),
  };
  if (!zweiteilig || genau) return [partA];
  return [partA, differencePart(cfg, Math.min(price, budget), Math.max(price, budget), !reicht)];
}

const G1: Generator = {
  id: 'G1',
  topic: 'reicht-das-geld',
  stufen: [1, 2, 3, 4],
  generate(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
    const force = readForce(opts, ['reicht', 'genau', 'inDerHand', 'zweiteilig']);
    const bind = readBind(opts, ['A']);
    const forced = {
      reicht: readBool(force.reicht, 'reicht'),
      genau: readBool(force.genau, 'genau'),
      zweiteilig: readBool(force.zweiteilig, 'zweiteilig') ?? false,
    };
    const bucht = cfg.money.centOnly;
    // Stufe 1 immer mit Geld in der Hand (docs/05 4.5)
    const inDerHand = bucht || (readBool(force.inDerHand, 'inDerHand') ?? false);
    const zweiteilig = forced.zweiteilig && cfg.maxSteps >= 2;
    if (!cfg.answerTypes.includes('choice')) return 'unsupported';
    if (zweiteilig && !cfg.answerTypes.includes(bucht ? 'number' : 'money')) return 'unsupported';
    for (let attempt = 0; attempt < TRIES; attempt++) {
      const plan = planG1(cfg, rng, bind.A, forced);
      if (!plan) continue;
      const hand = inDerHand ? handPieces(cfg, plan.budget) : [];
      if (!hand) continue;
      const scene: Scene = {
        kind: 'items',
        items: [{ itemId: plan.item.id, label: plan.item.name, price: plan.price }],
        ...(inDerHand ? { hand } : {}),
      };
      const title = `Reicht es für ${defAkk(plan.item)}?`;
      if (bucht) {
        const story = `Du hast ${tok(plan.budget)}. ${cap(plan.item.nom)} kostet ${tok(plan.price)}.`;
        return makeTask(cfg, title, scene, story, partsG1Bucht(plan, zweiteilig), 2);
      }
      const name = chooseName(rng);
      const story = inDerHand
        ? `${name.name} hat dieses Geld in der Hand. ${cap(name.pron)} möchte ${plan.item.akk} für ${tok(plan.price)} kaufen.`
        : `${name.name} hat ${tok(plan.budget)}. ${cap(name.pron)} möchte ${plan.item.akk} für ${tok(plan.price)} kaufen.`;
      return makeTask(
        cfg,
        title,
        scene,
        story,
        partsG1Insel(cfg, plan, name, inDerHand, hand, zweiteilig),
        2,
      );
    }
    return 'unsupported';
  },
};

// ---------- G2: Reicht das Geld für zwei Sachen? ----------

const G2: Generator = {
  id: 'G2',
  topic: 'reicht-das-geld',
  stufen: [2, 3, 4],
  generate(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
    const force = readForce(opts, ['reicht']);
    const bind = readBind(opts, ['A', 'B']);
    const forcedReicht = readBool(force.reicht, 'reicht');
    if (!cfg.answerTypes.includes('choice') || !cfg.answerTypes.includes('money')) {
      return 'unsupported';
    }
    if (cfg.maxSteps < 2) return 'unsupported';
    for (let attempt = 0; attempt < TRIES; attempt++) {
      const a = chooseItem(rng, cfg, bind.A);
      if (!a) return 'unsupported';
      const b = chooseItem(rng, cfg, bind.B, [a.id]);
      if (!b) return 'unsupported';
      const pa = randomPrice(rng, cfg, a);
      const pb = randomPrice(rng, cfg, b);
      if (pa === null || pb === null) continue;
      const sum = pa + pb;
      const reicht = decideReicht(rng, forcedReicht);
      // runder Euro-Betrag knapp neben der Summe, nie genau gleich (docs/05 4.5)
      const extra = randomInt(rng, 0, 1) * 100;
      const budget = reicht
        ? Math.floor(sum / 100) * 100 + 100 + extra
        : Math.ceil(sum / 100) * 100 - 100 - extra;
      if (budget <= 0 || budget === sum || budget > cfg.money.maxTotal) continue;
      if (sum > cfg.money.maxTotal) continue;
      const hand = handPieces(cfg, budget);
      if (!hand) continue;
      const name = chooseName(rng);
      const n = name.name;
      const story = `${n} hat ${tok(budget)}. ${cap(name.pron)} möchte ${a.akk} für ${tok(pa)} und ${b.akk} für ${tok(pb)} kaufen.`;
      const lo = Math.min(sum, budget);
      const hi = Math.max(sum, budget);
      const partA: Part = {
        question: 'Reicht das Geld für beides?',
        answer: yesNo('Ja, es reicht', 'Nein, es reicht nicht', reicht, {
          yes: `Rechne zuerst aus, was beides zusammen kostet: ${tok(pa)} + ${tok(pb)}.`,
          no: `Rechne aus: ${tok(pa)} + ${tok(pb)}. Ist das mehr als ${tok(budget)}?`,
        }),
        hints: [
          'Rechne zuerst aus, was beides zusammen kostet.',
          `Beides zusammen kostet ${tok(sum)}. Ist das mehr als ${tok(budget)}?`,
        ],
        explanation: reicht
          ? `${tok(pa)} + ${tok(pb)} = ${tok(sum)}. Das ist weniger als ${tok(budget)}. Es reicht!`
          : `${tok(pa)} + ${tok(pb)} = ${tok(sum)}. Das ist mehr als ${tok(budget)}.`,
      };
      const sumMistake: Mistake = {
        value: sum,
        feedback: reicht
          ? `${tok(sum)} kostet alles zusammen. Wie viel bleibt von ${tok(budget)} übrig?`
          : `${tok(sum)} kostet alles zusammen. Wie viel fehlt von ${tok(budget)} bis ${tok(sum)}?`,
      };
      return makeTask(
        cfg,
        `${a.name} und ${b.name}`,
        {
          kind: 'items',
          items: [
            { itemId: a.id, label: a.name, price: pa },
            { itemId: b.id, label: b.name, price: pb },
          ],
          hand,
        },
        story,
        [partA, differencePart(cfg, lo, hi, !reicht, [sumMistake])],
        3,
      );
    }
    return 'unsupported';
  },
};

// ---------- G3: Wofür reicht das Geld? ----------

const G3: Generator = {
  id: 'G3',
  topic: 'reicht-das-geld',
  stufen: [2, 3, 4],
  generate(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('select')) return 'unsupported';
    for (let attempt = 0; attempt < TRIES; attempt++) {
      const count = randomInt(rng, 4, 5);
      const items = mix(rng, itemsFor(cfg)).slice(0, count);
      if (items.length < count) return 'unsupported';
      const list: { item: Item; price: Cents }[] = [];
      for (const item of items) {
        const price = randomPrice(rng, cfg, item);
        if (price !== null) list.push({ item, price });
      }
      if (list.length < count) continue;
      // eine Sache kostet genau das Budget
      const exact = list[randomInt(rng, 0, list.length - 1)];
      if (!exact) continue;
      const budget = exact.price;
      const cheaper = list.filter((p) => p !== exact && p.price <= budget);
      const dearer = list.filter((p) => p.price > budget);
      if (cheaper.length === 0 || dearer.length === 0) continue;
      const affordable = list.filter((p) => p.price <= budget);
      const shown = (p: { item: Item; price: Cents }) => `${p.item.name} (${tok(p.price)})`;
      const story = `Du hast ${tok(budget)}.`;
      return makeTask(
        cfg,
        'Was kann ich mir leisten?',
        { kind: 'none' },
        story,
        [
          {
            question: 'Tippe alle Sachen an, für die dein Geld reicht.',
            answer: {
              type: 'select',
              items: list.map((p) => ({ itemId: p.item.id, label: p.item.name, price: p.price })),
              rule: { kind: 'affordable', budget },
            },
            hints: [
              cfg.money.useCents
                ? 'Schau bei jedem Preis zuerst auf die Euro.'
                : `Vergleiche jeden Preis mit ${tok(budget)}.`,
              `Alles, was weniger als ${tok(budget)} kostet, reicht. Und genau ${tok(budget)} reicht auch.`,
            ],
            explanation: `${listJoin(affordable.map(shown))} kannst du kaufen. ${cap(listJoin(dearer.map((p) => p.item.def)))} ${dearer.length === 1 ? 'kostet' : 'kosten'} mehr als ${tok(budget)}.`,
            praise: `Super! Du hast an ${defAkk(exact.item)} für genau ${tok(budget)} gedacht.`,
          },
        ],
        3,
      );
    }
    return 'unsupported';
  },
};

// ---------- G4: Wer hat mehr Geld? ----------

/** Zahlendreher (3,40 € / 4,30 €), wenn die Stufe Cent kennt; sonst ähnliche Beträge. */
function twoAmounts(cfg: StufeConfig, rng: Rng): [Cents, Cents] | null {
  const max = cfg.money.maxTotal;
  if (cfg.money.useCents && !cfg.money.centOnly && 10 % cfg.money.step === 0) {
    const e = randomInt(rng, 1, 9);
    const c = randomInt(rng, 1, 9);
    if (e === c) return null;
    const x = e * 100 + c * 10;
    const y = c * 100 + e * 10;
    return x <= max && y <= max ? [x, y] : null;
  }
  const step = cfg.money.step;
  const x = amountBetween(rng, cfg, step, max - step);
  if (x === null) return null;
  const y = x + randomInt(rng, 1, 3) * step * (rng() < 0.5 ? 1 : -1);
  return y > 0 && y <= max ? [x, y] : null;
}

/** Karten wie im Original 5.4: erst die beiden Namen, dann „Beide gleich viel“. */
function options(
  n1: string,
  n2: string,
  winner: string,
  [wrongPerson, same]: [string, string],
): ChoiceOption[] {
  const person = (id: string, label: string): ChoiceOption =>
    label === winner ? { id, label, correct: true } : { id, label, feedback: wrongPerson };
  return [
    person('a', n1),
    person('b', n2),
    { id: 'c', label: 'Beide gleich viel', feedback: same },
  ];
}

const G4: Generator = {
  id: 'G4',
  topic: 'reicht-das-geld',
  stufen: [2, 3, 4],
  generate(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
    const force = readForce(opts, ['zweiteilig']);
    readBind(opts, []);
    // Stufe 4 immer mit „Wie viel mehr?“ (docs/05 4.5); aus cfg.maxSteps abgeleitet
    const zweiteilig =
      (readBool(force.zweiteilig, 'zweiteilig') ?? cfg.maxSteps > 2) && cfg.maxSteps >= 2;
    if (!cfg.answerTypes.includes('choice')) return 'unsupported';
    if (zweiteilig && !cfg.answerTypes.includes('money')) return 'unsupported';
    for (let attempt = 0; attempt < TRIES; attempt++) {
      const amounts = twoAmounts(cfg, rng);
      if (!amounts) continue;
      const [x, y] = amounts;
      const first = chooseName(rng);
      const second = chooseName(rng, [first.name]);
      const n1 = first.name;
      const n2 = second.name;
      const winner = x > y ? n1 : n2;
      const loser = x > y ? n2 : n1;
      const hi = Math.max(x, y);
      const lo = Math.min(x, y);
      const euros = (v: Cents) => String(Math.floor(v / 100));
      const byEuro = cfg.money.useCents;
      const partA: Part = {
        question: 'Wer hat mehr Geld?',
        answer: {
          type: 'choice',
          layout: 'cards',
          shuffle: false,
          options: options(n1, n2, winner, [
            byEuro
              ? `Schau zuerst auf die Euro: ${n1} hat ${euros(x)} Euro, ${n2} hat ${euros(y)} Euro.`
              : `${winner} hat ${tok(hi)}. ${loser} hat nur ${tok(lo)}.`,
            byEuro
              ? 'Die Zahlen sehen ähnlich aus, aber sie sind verschieden. Vergleiche die Euro.'
              : 'Schau genau hin: Die Beträge sind verschieden.',
          ]),
        },
        hints: byEuro
          ? [
              'Vergleiche zuerst die Euro vor dem Komma.',
              `${euros(x)} Euro oder ${euros(y)} Euro: Was ist mehr?`,
            ]
          : ['Vergleiche die beiden Beträge.', `${tok(x)} oder ${tok(y)}: Was ist mehr?`],
        explanation: byEuro
          ? `${winner} hat ${tok(hi)}, ${loser} hat ${tok(lo)}. ${euros(hi)} Euro sind mehr als ${euros(lo)} Euro.`
          : `${winner} hat ${tok(hi)}, ${loser} hat ${tok(lo)}. ${tok(hi)} ist mehr als ${tok(lo)}.`,
      };
      const parts: Part[] = [partA];
      if (zweiteilig) {
        const up = countUp(lo, hi);
        parts.push({
          question: `Wie viel Geld hat ${winner} mehr als ${loser}?`,
          answer: { type: 'money', correct: hi - lo },
          mistakes: differenceMistakes(cfg, lo, hi),
          hints: up.hints,
          explanation: `${up.steps} ${winner} hat ${tok(hi - lo)} mehr.`,
        });
      }
      return makeTask(
        cfg,
        `${n1} und ${n2}`,
        {
          kind: 'people',
          people: [
            { name: n1, amount: x },
            { name: n2, amount: y },
          ],
        },
        `${n1} hat ${tok(x)}. ${n2} hat ${tok(y)}.`,
        parts,
        3,
      );
    }
    return 'unsupported';
  },
};

export const REICHT_DAS_GELD_GENERATORS: Generator[] = [G1, G2, G3, G4];
