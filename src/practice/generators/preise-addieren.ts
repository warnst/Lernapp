import type { Item } from '@/content/items';
import { pick, randomInt, type Rng } from '@/domain/random';
import type { Cents, ChoiceAnswer, SceneItem, StufeConfig, Task } from '@/domain/types';
import {
  cap,
  chooseItem,
  chooseName,
  genitiv,
  itemsFor,
  makeTask,
  mix,
  readBind,
  readForce,
  tok,
  wordCount,
} from '../build';
import {
  centDigit,
  type Distractor,
  euroOff,
  oneLessMore,
  subtractedInstead,
} from '../distractors';
import { renderText } from '@/domain/text';
import type { Generator } from '../types';
import {
  additionExplanation,
  additionHints,
  answerKind,
  attempt,
  forgotCarryMany,
  hasCarry,
  mistakesFrom,
  moneyPart,
  ordered,
  priceOptions,
  sum,
  withCents,
} from './preise-addieren-parts';

// Vorlagen für das Thema „preise-addieren“ (docs/05 4.2 und Anhang A; Stufe 1: docs/11 B3.3).

const TRIES = 60;

function sceneItem(item: Item, price: Cents, quantity?: number): SceneItem {
  return {
    itemId: item.id,
    label: item.name,
    price,
    ...(quantity === undefined ? {} : { quantity }),
  };
}

function storyFits(cfg: StufeConfig, story: string): boolean {
  return wordCount(renderText(story)) <= cfg.maxStoryWords;
}

/** Fehloptionen beim Zusammenzählen von Preisen. */
function additionDistractors(cfg: StufeConfig, rng: Rng, prices: readonly Cents[]): Distractor[] {
  const total = sum(prices);
  const [a = 0, b = 0] = prices;
  const rest = [
    ...centDigit(total),
    ...euroOff(total),
    ...(prices.length === 2 && a !== b ? subtractedInstead(a, b) : []),
  ];
  return ordered(rng, forgotCarryMany(cfg, prices), rest);
}

/**
 * Übertrag-Wunsch: mit force immer, sonst in etwa 40 % der Aufgaben (mindestens jede dritte),
 * ohne `cfg.carry` nie.
 */
function carryWish(cfg: StufeConfig, rng: Rng, forced: unknown): boolean {
  const coin = rng();
  if (!cfg.carry) return false;
  return forced === true || coin < 0.4;
}

interface PairOptions {
  A?: string;
  B?: string;
  carry: boolean;
  /** Übertrag ist Pflicht (force); bei ganzen Euro wird darauf verzichtet, wenn er unmöglich ist */
  carryForced: boolean;
  underOneEuro: boolean;
}

/** Zwei Sachen mit Preisen, Summe ≤ maxTotal, Übertrag wie gewünscht. */
function choosePair(
  cfg: StufeConfig,
  rng: Rng,
  o: PairOptions,
): { A: Item; B: Item; pA: Cents; pB: Cents } | null {
  const tryWith = (carry: boolean | null) =>
    attempt(TRIES, () => {
      const A = chooseItem(rng, cfg, o.A);
      if (!A) return null;
      const B = chooseItem(rng, cfg, o.B, [A.id]);
      if (!B || B.id === A.id) return null;
      const optsA = priceOptions(cfg, A);
      const optsB = priceOptions(cfg, B);
      if (optsA.length === 0 || optsB.length === 0) return null;
      const pA = pick(rng, optsA);
      const pB = pick(rng, optsB);
      if (pA + pB > cfg.money.maxTotal) return null;
      if (carry !== null && hasCarry(cfg, [pA, pB]) !== carry) return null;
      if (o.underOneEuro && !(Math.min(pA, pB) < 100 && Math.max(pA, pB) >= 100)) return null;
      return { A, B, pA, pB };
    });
  const strict = tryWith(o.carry);
  if (strict) return strict;
  if (o.carryForced && withCents(cfg)) return null;
  // Ohne Übertrag-Pflicht (oder bei ganzen Euro ohne möglichen Zehnerübergang) beliebig,
  // solange die Stufe Übertrag erlaubt.
  return cfg.carry ? tryWith(null) : null;
}

/** Stufe 1: Karten wie in B3.3 (Summe ± 1, aufsteigend, nicht gemischt). */
function smallChoice(cfg: StufeConfig, a: number, b: number): ChoiceAnswer {
  const total = a + b;
  const feedback = `Zähle noch einmal: ${String(a)} und ${String(b)}.`;
  const wrong = [total - 1, total + 1, total - 2, total + 2]
    .filter((v) => v > 0 && v <= cfg.money.maxTotal)
    .slice(0, cfg.choiceCount - 1);
  const values = [total, ...wrong].sort((x, y) => x - y);
  return {
    type: 'choice',
    layout: 'cards',
    shuffle: false,
    options: values.map((v, i) => ({
      id: 'abcd'.charAt(i),
      label: tok(v),
      ...(v === total ? { correct: true as const } : { feedback }),
    })),
  };
}

function pairSum(variant: 'A1' | 'A2') {
  return (cfg: StufeConfig, rng: Rng, opts?: Parameters<Generator['generate']>[2]) => {
    const force = readForce(opts, ['carry', 'einPreisUnterEinemEuro']);
    const bind = readBind(opts, ['A', 'B']);
    const underOneEuro = force.einPreisUnterEinemEuro === true;
    if (underOneEuro && !withCents(cfg)) return 'unsupported' as const;
    const carry = carryWish(cfg, rng, force.carry);
    const kind = answerKind(cfg, rng);
    const result = attempt(10, () => {
      const pair = choosePair(cfg, rng, {
        ...(bind.A === undefined ? {} : { A: bind.A }),
        ...(bind.B === undefined ? {} : { B: bind.B }),
        carry,
        carryForced: force.carry === true,
        underOneEuro,
      });
      if (!pair) return null;
      const { A, B, pA, pB } = pair;
      const person = chooseName(rng);
      const story =
        variant === 'A1'
          ? `${cap(A.nom)} kostet ${tok(pA)}. ${cap(B.nom)} kostet ${tok(pB)}.`
          : `${person.name} kauft ${A.akk} für ${tok(pA)} und ${B.akk} für ${tok(pB)}.`;
      if (!storyFits(cfg, story)) return null;
      const total = pA + pB;
      const answer = cfg.money.centOnly
        ? { answer: smallChoice(cfg, pA, pB) }
        : moneyPart(cfg, kind, total, additionDistractors(cfg, rng, [pA, pB]));
      return makeTask(
        cfg,
        `${A.name} und ${B.name}`,
        { kind: 'items', items: [sceneItem(A, pA), sceneItem(B, pB)] },
        story,
        [
          {
            question:
              variant === 'A1'
                ? 'Wie viel kosten beide zusammen?'
                : `Wie viel muss ${person.pron} bezahlen?`,
            ...answer,
            hints: additionHints(cfg, [pA, pB]),
            explanation: additionExplanation(cfg, [pA, pB]),
          },
        ],
        variant === 'A1' ? 1 : 2,
      );
    });
    return result ?? ('unsupported' as const);
  };
}

/** Eine Sache n-mal (A3, A6 Teil a): n von 2 bis cfg.multiply, n · p ≤ maxTotal. */
function chooseQuantity(
  cfg: StufeConfig,
  rng: Rng,
  bound: string | undefined,
  room: Cents = cfg.money.maxTotal,
): { A: Item; n: number; pA: Cents } | null {
  if (cfg.multiply < 2) return null;
  return attempt(TRIES, () => {
    const A = chooseItem(rng, cfg, bound, [], true);
    if (!A?.plural) return null;
    const n = randomInt(rng, 2, cfg.multiply);
    const prices = priceOptions(cfg, A).filter((p) => n * p <= room);
    if (prices.length === 0) return null;
    return { A, n, pA: pick(rng, prices) };
  });
}

function repeated(price: Cents, n: number): string {
  return Array.from({ length: n }, () => tok(price)).join(' + ');
}

/** Tipps für n gleiche Preise (im Stil von 2.5 und 7.1). */
function quantityHints(price: Cents, n: number): [string, string] {
  const tip1 = `Rechne ${repeated(price, n)}.`;
  if (n >= 3) return [tip1, `${tok(price)}, ${tok(2 * price)} … wie geht es weiter?`];
  if (price % 100 !== 0 && price > 100) return [tip1, 'Rechne zuerst die Euro, dann die Cent.'];
  return [tip1, `Zähle von ${tok(price)} aus noch ${tok(price)} weiter.`];
}

const A3: Generator = {
  id: 'A3',
  topic: 'preise-addieren',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    const bind = readBind(opts, ['A']);
    const kind = answerKind(cfg, rng);
    const result = attempt(10, () => {
      const q = chooseQuantity(cfg, rng, bind.A);
      if (!q) return null;
      const { A, n, pA } = q;
      const plural = A.plural ?? '';
      const person = chooseName(rng);
      const story = `${person.name} kauft ${String(n)} ${plural}. ${cap(A.nom)} kostet ${tok(pA)}.`;
      if (!storyFits(cfg, story)) return null;
      const total = n * pA;
      const candidates = ordered(rng, oneLessMore(n, pA, A), [
        ...euroOff(total),
        ...centDigit(total),
      ]);
      return makeTask(
        cfg,
        `${String(n)} ${plural}`,
        { kind: 'items', items: [sceneItem(A, pA, n)] },
        story,
        [
          {
            question: `Wie viel kosten ${String(n)} ${plural}?`,
            ...moneyPart(cfg, kind, total, candidates),
            hints: quantityHints(pA, n),
            explanation: `${repeated(pA, n)} = ${tok(total)}.`,
          },
        ],
        2,
      );
    });
    return result ?? 'unsupported';
  },
};

const A4: Generator = {
  id: 'A4',
  topic: 'preise-addieren',
  stufen: [3, 4],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['carry']);
    const bind = readBind(opts, ['A', 'B', 'C']);
    const carry = carryWish(cfg, rng, force.carry);
    const kind = answerKind(cfg, rng);
    const build = (wantCarry: boolean | null) =>
      attempt(TRIES, () => {
        const A = chooseItem(rng, cfg, bind.A);
        if (!A) return null;
        const B = chooseItem(rng, cfg, bind.B, [A.id]);
        if (!B || B.id === A.id) return null;
        const C = chooseItem(rng, cfg, bind.C, [A.id, B.id]);
        if (!C || C.id === A.id || C.id === B.id) return null;
        const items = [A, B, C];
        const lists = items.map((i) => priceOptions(cfg, i));
        if (lists.some((l) => l.length === 0)) return null;
        const prices = lists.map((l) => pick(rng, l));
        const total = sum(prices);
        if (total > cfg.money.maxTotal) return null;
        if (wantCarry !== null && hasCarry(cfg, prices) !== wantCarry) return null;
        const person = chooseName(rng);
        const story = `${person.name} kauft ${A.akk}, ${B.akk} und ${C.akk}.`;
        if (!storyFits(cfg, story)) return null;
        return makeTask(
          cfg,
          'Drei Sachen',
          {
            kind: 'items',
            items: items.map((item, i) => sceneItem(item, prices[i] ?? 0)),
          },
          story,
          [
            {
              question: 'Wie viel kostet alles zusammen?',
              ...moneyPart(cfg, kind, total, additionDistractors(cfg, rng, prices)),
              hints: additionHints(cfg, prices),
              explanation: additionExplanation(cfg, prices),
            },
          ],
          3,
        );
      });
    const task = build(carry) ?? (force.carry === true || !cfg.carry ? null : build(null));
    return task ?? 'unsupported';
  },
};

const COUNT_WORD: Record<number, string> = { 2: 'zwei', 3: 'drei' };

/** Teilmengen der Größe k. */
function subsets<T>(list: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  return list.flatMap((x, i) => subsets(list.slice(i + 1), k - 1).map((rest) => [x, ...rest]));
}

const A5: Generator = {
  id: 'A5',
  topic: 'preise-addieren',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['count']);
    readBind(opts, []);
    const forced = force.count;
    if (forced !== undefined && forced !== 2 && forced !== 3) {
      throw new Error(`A5: count muss 2 oder 3 sein, nicht ${JSON.stringify(forced)}`);
    }
    // docs/05 Anhang A: 3 Sachen nur ab Stufe 3.
    const threeAllowed = cfg.id >= 3;
    if (forced === 3 && !threeAllowed) return 'unsupported';
    const count = forced ?? 2;
    const total = randomInt(rng, 5, 6);
    const pool = itemsFor(cfg);
    const draw = () =>
      attempt(TRIES, () => {
        const chosen: Item[] = [];
        const prices: Cents[] = [];
        for (let i = 0; i < count - 1; i++) {
          const item = pick(
            rng,
            pool.filter((p) => !chosen.includes(p)),
          );
          chosen.push(item);
          prices.push(pick(rng, priceOptions(cfg, item)));
        }
        // Letzte Sache so, dass das Ziel ganze Euro hat.
        const partial = sum(prices);
        const fitting = pool
          .filter((p) => !chosen.includes(p))
          .map((item) => ({
            item,
            prices: priceOptions(cfg, item).filter(
              (p) => (partial + p) % 100 === 0 && partial + p <= cfg.money.maxTotal,
            ),
          }))
          .filter((f) => f.prices.length > 0);
        if (fitting.length === 0) return null;
        const last = pick(rng, fitting);
        chosen.push(last.item);
        prices.push(pick(rng, last.prices));
        const target = sum(prices);
        const others = pool.filter((p) => !chosen.includes(p));
        const extra: SceneItem[] = [];
        while (chosen.length + extra.length < total) {
          const item = pick(
            rng,
            others.filter((o) => !extra.some((e) => e.itemId === o.id)),
          );
          extra.push(sceneItem(item, pick(rng, priceOptions(cfg, item))));
        }
        const all = [...chosen.map((item, i) => sceneItem(item, prices[i] ?? 0)), ...extra];
        const solutions = subsets(all, count).filter(
          (set) => sum(set.map((s) => s.price ?? 0)) === target,
        );
        return { all, solutions, target, firstItem: chosen[0], firstPrice: prices[0] ?? 0 };
      });
    // möglichst zwei Lösungen: einige Würfe probieren, sonst den ersten nehmen
    let best: ReturnType<typeof draw> = null;
    for (let i = 0; i < 12; i++) {
      const candidate = draw();
      if (!candidate) continue;
      best ??= candidate;
      if (candidate.solutions.length === 2) {
        best = candidate;
        break;
      }
    }
    if (!best?.firstItem) return 'unsupported';
    const { all, solutions, target, firstItem, firstPrice } = best;
    const person = chooseName(rng);
    const word = COUNT_WORD[count] ?? String(count);
    const story = `${person.name} hat genau ${tok(target)}. ${cap(person.pron)} möchte ${word} Sachen kaufen. Es soll nichts übrig bleiben.`;
    if (!storyFits(cfg, story)) return 'unsupported';
    const items = mix(rng, all);
    const describe = (set: SceneItem[], also = false) => {
      const names = set.map((s) => s.label);
      const last = names.pop() ?? '';
      const list = names.length > 0 ? `${names.join(', ')} und ${last}` : last;
      const sumText = `${set.map((s) => tok(s.price ?? 0)).join(' + ')} = ${tok(target)}.`;
      return `${list}${also ? ' passen' : ''}: ${sumText}`;
    };
    const [first, second] = solutions;
    const explanation =
      first && second ? `${describe(first)} Auch ${describe(second, true)}` : describe(first ?? []);
    const centsSumToEuro =
      count === 2 && withCents(cfg) && first?.every((s) => (s.price ?? 0) % 100 !== 0) === true;
    const hints: [string, string] =
      count === 2
        ? [
            centsSumToEuro
              ? 'Die Cent müssen zusammen genau einen Euro ergeben. Schau auf die Cent hinter dem Komma.'
              : `Nimm eine Sache. Wie viel fehlt dann noch bis ${tok(target)}?`,
            `Nimm ${firstItem.akk} für ${tok(firstPrice)}. Welche Sache passt dazu?`,
          ]
        : [
            `Nimm ${firstItem.akk} für ${tok(firstPrice)}. Dann fehlen noch ${tok(
              target - firstPrice,
            )}.`,
            `Welche zwei Sachen kosten zusammen ${tok(target - firstPrice)}?`,
          ];
    return makeTask(
      cfg,
      'Genau passend',
      { kind: 'none' },
      story,
      [
        {
          question: `Wähle ${word} Sachen, die zusammen genau ${tok(target)} kosten.`,
          answer: { type: 'select', items, rule: { kind: 'sum', count, target } },
          hints,
          explanation,
          ...(solutions.length >= 2
            ? { praise: 'Stimmt genau! Übrigens gibt es noch eine zweite Lösung. Findest du sie?' }
            : {}),
        },
      ],
      count === 3 ? 4 : 3,
    );
  },
};

const A6: Generator = {
  id: 'A6',
  topic: 'preise-addieren',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    const bind = readBind(opts, ['A', 'B']);
    const result = attempt(10, () => {
      const q = chooseQuantity(cfg, rng, bind.A);
      if (!q) return null;
      const { A, n, pA } = q;
      const first = n * pA;
      const B = chooseItem(rng, cfg, bind.B, [A.id]);
      if (!B || B.id === A.id) return null;
      const pricesB = priceOptions(cfg, B).filter((p) => first + p <= cfg.money.maxTotal);
      if (pricesB.length === 0) return null;
      const pB = pick(rng, pricesB);
      const total = first + pB;
      const plural = A.plural ?? '';
      const person = chooseName(rng);
      const story = `${person.name} kauft ${String(n)} ${plural}. ${cap(A.nom)} kostet ${tok(pA)}.`;
      if (!storyFits(cfg, story)) return null;
      const wrongA = mistakesFrom(cfg, first, [...oneLessMore(n, pA, A), ...euroOff(first)]);
      const wrongB = mistakesFrom(cfg, total, [
        {
          value: pA + pB,
          feedback: `Du hast nur ${A.akk} gerechnet. Nimm das Ergebnis aus Teil a: ${tok(first)}.`,
        },
        {
          value: pB,
          feedback: `Das ist nur ${B.def}. Nimm das Ergebnis aus Teil a dazu.`,
        },
        ...forgotCarryMany(cfg, [first, pB]),
        ...euroOff(total),
      ]);
      return makeTask(
        cfg,
        `${plural} und ${B.name}`,
        { kind: 'items', items: [sceneItem(A, pA, n)] },
        story,
        [
          {
            question: `Wie viel kosten ${String(n)} ${plural}?`,
            answer: { type: 'money', correct: first },
            mistakes: wrongA,
            hints: quantityHints(pA, n),
            explanation: `${repeated(pA, n)} = ${tok(first)}.`,
          },
          {
            lead: `Dazu kauft ${person.pron} noch ${B.akk} für ${tok(pB)}.`,
            question: `Wie viel muss ${person.name} jetzt insgesamt bezahlen?`,
            answer: { type: 'money', correct: total },
            mistakes: wrongB,
            hints: [
              `Nimm das Ergebnis aus Teil a: ${tok(first)}. Dann kommt ${B.def} dazu.`,
              additionHints(cfg, [first, pB])[0],
            ],
            explanation: `${tok(first)} + ${tok(pB)} = ${tok(total)}.`,
          },
        ],
        3,
      );
    });
    return result ?? 'unsupported';
  },
};

const A7: Generator = {
  id: 'A7',
  topic: 'preise-addieren',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['carry']);
    readBind(opts, []);
    const carry = carryWish(cfg, rng, force.carry);
    const step = cfg.money.step;
    // Beträge ab 1 € im Stufenschritt, höchstens maxPrice, Summe ≤ maxTotal.
    const low = Math.ceil(100 / step);
    const high = Math.floor(cfg.money.maxPrice / step);
    if (low > high) return 'unsupported';
    const build = (wantCarry: boolean | null) =>
      attempt(TRIES, () => {
        const x = randomInt(rng, low, high) * step;
        const y = randomInt(rng, low, high) * step;
        if (x + y > cfg.money.maxTotal || x === y) return null;
        if (wantCarry !== null && hasCarry(cfg, [x, y]) !== wantCarry) return null;
        const n1 = chooseName(rng);
        const n2 = chooseName(rng, [n1.name]);
        const story = `${n1.name} und ${n2.name} legen ihr Geld zusammen. ${n1.name} hat ${tok(
          x,
        )}. ${n2.name} hat ${tok(y)}.`;
        if (!storyFits(cfg, story)) return null;
        const total = x + y;
        const wrong = mistakesFrom(cfg, total, [
          ...forgotCarryMany(cfg, [x, y]),
          {
            value: Math.abs(x - y),
            feedback: `Du hast abgezogen. ${n1.name} und ${n2.name} legen zusammen, also rechnen wir plus.`,
          },
          ...euroOff(total),
          ...centDigit(total),
        ]);
        return makeTask(
          cfg,
          `${n1.name} und ${n2.name} legen zusammen`,
          {
            kind: 'people',
            people: [
              { name: n1.name, amount: x },
              { name: n2.name, amount: y },
            ],
          },
          story,
          [
            {
              question: 'Wie viel Geld haben beide zusammen?',
              answer: { type: 'money', correct: total },
              mistakes: wrong,
              hints: additionHints(cfg, [x, y]),
              explanation: additionExplanation(cfg, [x, y]),
            },
          ],
          2,
        );
      });
    const task = build(carry) ?? (force.carry === true || !cfg.carry ? null : build(null));
    return task ?? 'unsupported';
  },
};

const O1: Generator = {
  id: 'O1',
  topic: 'preise-addieren',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const pool = itemsFor(cfg);
    const sameEuro = withCents(cfg);
    const result = attempt(TRIES, () => {
      const chosen: { item: Item; price: Cents }[] = [];
      const free = () => pool.filter((p) => !chosen.some((c) => c.item.id === p.id));
      const taken = (price: Cents) => chosen.some((c) => c.price === price);
      if (sameEuro) {
        // ab Stufe 3: zwei Preise mit gleichem Euro-Betrag (Vergleich über die Cent)
        const first = pick(rng, free());
        const high = priceOptions(cfg, first).filter((p) => p >= 100);
        if (high.length === 0) return null;
        const p1 = pick(rng, high);
        chosen.push({ item: first, price: p1 });
        const euro = Math.floor(p1 / 100);
        const partners = free()
          .map((item) => ({
            item,
            prices: priceOptions(cfg, item).filter((p) => Math.floor(p / 100) === euro && p !== p1),
          }))
          .filter((x) => x.prices.length > 0);
        if (partners.length === 0) return null;
        const partner = pick(rng, partners);
        chosen.push({ item: partner.item, price: pick(rng, partner.prices) });
      }
      while (chosen.length < 4) {
        const item = pick(rng, free());
        const prices = priceOptions(cfg, item).filter((p) => !taken(p));
        if (prices.length === 0) return null;
        chosen.push({ item, price: pick(rng, prices) });
      }
      return mix(rng, chosen);
    });
    if (!result) return 'unsupported';
    const person = chooseName(rng);
    const story = `Auf ${genitiv(person.name)} Einkaufszettel stehen vier Sachen mit Preisen.`;
    const sorted = [...result].sort((a, b) => a.price - b.price);
    const [cheapest, ...rest] = sorted;
    if (!cheapest) return 'unsupported';
    const named = rest.map((c) => `${c.item.name} (${tok(c.price)})`);
    const explanation = `${cap(cheapest.item.def)} (${tok(
      cheapest.price,
    )}) ist am billigsten. Dann kommen ${named.slice(0, -1).join(', ')} und ${named.at(-1) ?? ''}.`;
    const hints: [string, string] = sameEuro
      ? [
          'Vergleiche zuerst die Euro vor dem Komma.',
          'Haben zwei Preise gleich viele Euro, vergleichst du die Cent.',
        ]
      : [
          'Vergleiche die Preise. Welcher Preis ist am kleinsten?',
          `Am billigsten ist ${cheapest.item.def}. Was kommt danach?`,
        ];
    return makeTask(
      cfg,
      'Der Einkaufszettel',
      { kind: 'none' },
      story,
      [
        {
          question: 'Tippe sie der Reihe nach an. Fang mit der billigsten Sache an.',
          answer: {
            type: 'order',
            direction: 'asc',
            entries: result.map((c) => ({
              id: c.item.id,
              label: c.item.name,
              value: c.price,
              itemId: c.item.id,
            })),
          },
          hints,
          explanation,
          ...(sameEuro ? { praise: 'Klasse! Erst die Euro, dann die Cent vergleichen.' } : {}),
        },
      ],
      3,
    );
  },
};

const A1: Generator = {
  id: 'A1',
  topic: 'preise-addieren',
  stufen: [1, 2, 3, 4],
  generate: (cfg, rng, opts): Task | 'unsupported' => pairSum('A1')(cfg, rng, opts),
};

const A2: Generator = {
  id: 'A2',
  topic: 'preise-addieren',
  stufen: [2, 3, 4],
  generate: (cfg, rng, opts): Task | 'unsupported' => pairSum('A2')(cfg, rng, opts),
};

// Reihenfolge wie in docs/05 (leicht → schwer), O1 aus Anhang A am Ende.
export const PREISE_ADDIEREN_GENERATORS: Generator[] = [A1, A2, A3, A4, A5, A6, A7, O1];
