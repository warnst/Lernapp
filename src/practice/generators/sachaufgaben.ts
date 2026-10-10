import type { Item } from '@/content/items';
import { PAYMENT_DATIVE } from '@/content/names';
import { pick, randomInt, type Rng } from '@/domain/random';
import type { Cents, Mistake, StufeConfig, Task } from '@/domain/types';
import {
  cap,
  choice,
  chooseItem,
  chooseName,
  makeTask,
  mix,
  randomPrice,
  readBind,
  readForce,
  tok,
  wordCount,
} from '../build';
import { oneLessMore } from '../distractors';
import type { GenerateOptions, Generator } from '../types';
import { renderText } from '@/domain/text';
import {
  addSteps,
  choosePayment,
  cleanMistakes,
  countUp,
  greedy,
  possessive,
  timesText,
} from './sachaufgaben-parts';

// Vorlagen für das Thema „sachaufgaben“ (docs/05 4.6 und Anhang A).

const TRIES = 30;

/** Würfelt bis zu TRIES-mal; ungültige Versuche liefern null. */
function retry(build: () => Task | null, cfg: StufeConfig): Task | 'unsupported' {
  for (let i = 0; i < TRIES; i++) {
    const task = build();
    if (task && wordCount(renderText(task.story)) <= cfg.maxStoryWords) return task;
  }
  return 'unsupported';
}

/** Zwei verschiedene Sachen mit Preisen (A, B aus bind oder zufällig). */
function twoItems(
  rng: Rng,
  cfg: StufeConfig,
  bind: Record<string, string>,
): { a: Item; b: Item; pa: Cents; pb: Cents } | null {
  const a = chooseItem(rng, cfg, bind.A, bind.B === undefined ? [] : [bind.B]);
  if (!a) return null;
  const b = chooseItem(rng, cfg, bind.B, [a.id]);
  if (!b || b.id === a.id) return null;
  const pa = randomPrice(rng, cfg, a);
  const pb = randomPrice(rng, cfg, b);
  if (pa === null || pb === null) return null;
  return { a, b, pa, pb };
}

/** „Du hast zusammengezählt …“ und Weiterzähl-Fehler für „Wie viel bleibt?“ */
function restMistakes(start: Cents, cost: Cents, extra: (Mistake | undefined)[] = []): Mistake[] {
  const rest = start - cost;
  const naive =
    start % 100 < cost % 100
      ? {
          value:
            (Math.floor(start / 100) - Math.floor(cost / 100)) * 100 +
            ((cost % 100) - (start % 100)),
          feedback: `Zähle lieber von ${tok(cost)} aus weiter bis ${tok(start)}.`,
        }
      : undefined;
  return cleanMistakes(rest, [
    {
      value: start + cost,
      feedback: 'Du hast zusammengezählt. Es wird Geld ausgegeben, also bleibt weniger.',
    },
    ...extra,
    naive,
    {
      value: rest + 100,
      feedback: `Zähle noch einmal von ${tok(cost)} bis ${tok(start)}.`,
    },
  ]);
}

/** Fehler beim Zusammenzählen zweier Preise. */
function sumMistakes(a: Cents, b: Cents, buyer: string): Mistake[] {
  const sum = a + b;
  const carry = (a % 100) + (b % 100) >= 100;
  return cleanMistakes(sum, [
    {
      value: Math.abs(a - b),
      feedback: `Du hast abgezogen. ${buyer} kauft beides, also rechnen wir plus.`,
    },
    carry
      ? {
          value: sum - 100,
          feedback: `${String(a % 100)} Cent + ${String(b % 100)} Cent sind mehr als 1 €. Vergiss den Euro aus den Cent nicht.`,
        }
      : undefined,
    { value: sum + 100, feedback: 'Zähle die Euro noch einmal.' },
  ]);
}

/** Geld in der Hand für ein Budget (gierig aus der Stufenpalette). */
function handFor(cfg: StufeConfig, amount: Cents) {
  return greedy(amount, cfg.money.pieces) ?? [];
}

/** Budget in ganzen Euro, etwas über den Kosten, höchstens maxTotal. */
function budgetAbove(rng: Rng, cfg: StufeConfig, cost: Cents): Cents | null {
  const low = Math.floor(cost / 100) * 100 + 100;
  const high = Math.min(cfg.money.maxTotal, low + 200);
  if (low > high) return null;
  return randomInt(rng, low / 100, high / 100) * 100;
}

// ---------- S1 ----------

function s1(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  const bind = readBind(opts, ['A', 'B']);
  return retry(() => {
    const pair = twoItems(rng, cfg, bind);
    if (!pair) return null;
    const { a, b, pa, pb } = pair;
    const sum = pa + pb;
    if (sum > cfg.money.maxTotal) return null;
    const pay = choosePayment(rng, cfg, sum);
    if (pay === null) return null;
    const person = chooseName(rng);
    const add = addSteps(pa, pb);
    const rest = countUp(sum, pay);
    return makeTask(
      cfg,
      `${a.name} und ${b.name}`,
      {
        kind: 'items',
        items: [
          { itemId: a.id, label: a.name, price: pa },
          { itemId: b.id, label: b.name, price: pb },
        ],
        hand: [pay],
      },
      `${person.name} hat ${tok(pay)}. ${cap(person.pron)} kauft ${a.akk} für ${tok(pa)} und ${b.akk} für ${tok(pb)}.`,
      [
        {
          question: 'Wie viel kostet beides zusammen?',
          answer: { type: 'money', correct: sum },
          mistakes: sumMistakes(pa, pb, person.name),
          hints: add.hints,
          explanation: add.explanation,
        },
        {
          question: `Wie viel Geld bleibt ${person.name} übrig?`,
          answer: { type: 'money', correct: pay - sum },
          mistakes: restMistakes(pay, sum, [
            {
              value: pay - pa,
              feedback: `${cap(b.def)} kostet auch Geld. Zieh ${tok(pb)} auch noch ab.`,
            },
          ]),
          hints: rest.hints,
          explanation: `${rest.explanation} Es bleiben ${tok(pay - sum)}.`,
          praise: 'Stark! Du hast zwei Rechenschritte hintereinander gelöst.',
        },
      ],
      3,
    );
  }, cfg);
}

// ---------- S2 ----------

/** Anzahl Murmeln: mindestens 2 (docs/05 4.6); höchstens 12, damit die Zahl ins Bild passt. */
const MARBLES_MAX = 12;

function s2(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  const bind = readBind(opts, ['A']);
  return retry(() => {
    const a = chooseItem(rng, cfg, bind.A);
    if (!a) return null;
    const pa = randomPrice(rng, cfg, a);
    if (pa === null) return null;
    const budget = budgetAbove(rng, cfg, pa);
    if (budget === null) return null;
    const k = randomInt(rng, 2, Math.min(MARBLES_MAX, cfg.numbers.max));
    const person = chooseName(rng);
    const rest = countUp(pa, budget);
    const marbles = `${String(k)} Murmeln`;
    return makeTask(
      cfg,
      'Die unwichtige Angabe',
      {
        kind: 'items',
        items: [{ itemId: a.id, label: a.name, price: pa }],
        hand: handFor(cfg, budget),
        decor: { itemId: 'murmel', count: k },
      },
      `${person.name} hat ${marbles} und ${tok(budget)}. ${cap(person.pron)} kauft ${a.akk} für ${tok(pa)}.`,
      [
        {
          question: `${person.name} will wissen, wie viel Geld ${person.pron} noch hat. Welche Angabe brauchst du dafür nicht?`,
          answer: choice(
            { label: marbles },
            [
              {
                label: tok(budget),
                feedback: `Die ${tok(budget)} brauchst du: So viel Geld hat ${person.name} am Anfang.`,
              },
              {
                label: tok(pa),
                feedback: `Die ${tok(pa)} brauchst du: So viel kostet ${a.def}.`,
              },
            ],
            cfg.choiceCount,
          ),
          hints: [
            `${person.name} will etwas über ${possessive(person.pron)} Geld wissen.`,
            'Welche Zahl hat nichts mit Geld zu tun?',
          ],
          explanation: `Die ${marbles} haben nichts mit dem Geld zu tun. Die brauchst du nicht.`,
        },
        {
          question: `Wie viel Geld hat ${person.name} noch?`,
          answer: { type: 'money', correct: budget - pa },
          mistakes: restMistakes(budget, pa),
          hints: [`Rechne ${tok(budget)} − ${tok(pa)}.`, rest.detail],
          explanation: `${rest.explanation} ${person.name} hat noch ${tok(budget - pa)}.`,
          praise: 'Klasse! Du hast die unwichtige Angabe erkannt und richtig gerechnet.',
        },
      ],
      3,
    );
  }, cfg);
}

// ---------- S3 ----------

function s3(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  const bind = readBind(opts, ['A']);
  return retry(() => {
    const a = chooseItem(rng, cfg, bind.A);
    if (!a) return null;
    const pa = randomPrice(rng, cfg, a);
    if (pa === null) return null;
    const budget = budgetAbove(rng, cfg, pa);
    if (budget === null) return null;
    const person = chooseName(rng);
    const n = person.name;
    const pool = [
      {
        label: `Wie alt ist ${n}?`,
        feedback: 'Das steht nicht in der Geschichte. Hier geht es um Geld!',
      },
      {
        label: `Wie viele Geschwister hat ${n}?`,
        feedback: 'Von Geschwistern steht nichts in der Geschichte.',
      },
      {
        label: `Welche Farbe hat ${a.def}?`,
        feedback: 'Die Farbe steht nicht in der Geschichte.',
      },
      {
        label: 'Wie heißt der Verkäufer?',
        feedback: 'Vom Verkäufer steht nichts in der Geschichte.',
      },
    ];
    const rest = countUp(pa, budget);
    const question = `Wie viel Geld hat ${n} noch?`;
    return makeTask(
      cfg,
      'Die richtige Frage',
      {
        kind: 'items',
        items: [{ itemId: a.id, label: a.name, price: pa }],
        hand: handFor(cfg, budget),
      },
      `${n} hat ${tok(budget)}. ${cap(person.pron)} kauft ${a.akk} für ${tok(pa)}.`,
      [
        {
          question: 'Welche Frage kannst du mit dieser Geschichte beantworten?',
          answer: choice({ label: question }, mix(rng, pool), cfg.choiceCount),
          hints: [
            `Lies die Geschichte noch einmal. Was wissen wir über ${n}?`,
            `Wir wissen, wie viel Geld ${n} hat und was ${person.pron} kauft.`,
          ],
          explanation: `${n} hat ${tok(budget)} und gibt ${tok(pa)} aus. Also können wir ausrechnen, wie viel ${person.pron} noch hat.`,
        },
        {
          question: `Rechne sie aus: ${question}`,
          answer: { type: 'money', correct: budget - pa },
          mistakes: restMistakes(budget, pa),
          hints: [`Rechne ${tok(budget)} − ${tok(pa)}.`, rest.detail],
          explanation: `${rest.explanation} ${n} hat noch ${tok(budget - pa)}.`,
          praise: 'Super! Erst verstehen, dann rechnen.',
        },
      ],
      3,
    );
  }, cfg);
}

// ---------- S4 ----------

function quantityHints(n: number, a: Item, pa: Cents): [string, string] {
  return [
    `${cap(a.nom)} kostet ${tok(pa)}. Nimm den Preis ${String(n)}-mal.`,
    `Rechne ${timesText(n, pa)}.`,
  ];
}

function s4(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  const bind = readBind(opts, ['A']);
  if (cfg.multiply < 2) return 'unsupported';
  return retry(() => {
    const a = chooseItem(rng, cfg, bind.A, [], true);
    if (!a?.plural) return null;
    const pa = randomPrice(rng, cfg, a);
    if (pa === null) return null;
    const n = randomInt(rng, 2, cfg.multiply);
    const total = n * pa;
    if (total > cfg.money.maxTotal) return null;
    const pay = choosePayment(rng, cfg, total);
    const dative = pay === null ? undefined : PAYMENT_DATIVE[pay];
    if (pay === null || dative === undefined) return null;
    const person = chooseName(rng);
    const things = `${String(n)} ${a.plural}`;
    const rest = countUp(total, pay);
    return makeTask(
      cfg,
      things,
      {
        kind: 'items',
        items: [{ itemId: a.id, label: a.name, price: pa, quantity: n }],
        paidWith: [pay],
      },
      `${person.name} kauft ${things}. ${cap(a.nom)} kostet ${tok(pa)}. ${cap(person.pron)} bezahlt mit ${dative}.`,
      [
        {
          question: `Wie viel kosten ${things}?`,
          answer: { type: 'money', correct: total },
          mistakes: cleanMistakes(
            total,
            oneLessMore(n, pa, a).map((d) => ({ value: d.value, feedback: d.feedback })),
          ),
          hints: quantityHints(n, a, pa),
          explanation: `${timesText(n, pa)} = ${tok(total)}.`,
        },
        {
          question: `Wie viel Rückgeld bekommt ${person.pron}?`,
          answer: { type: 'money', correct: pay - total },
          mistakes: restMistakes(pay, total, [
            {
              value: pay - pa,
              feedback: `Du hast nur ${a.akk} abgezogen. ${person.name} kauft ${things}.`,
            },
            {
              value: total,
              feedback: `${tok(total)} ist der Preis. Das Rückgeld ist das, was übrig bleibt.`,
            },
          ]),
          hints: rest.hints,
          explanation: `${rest.explanation} ${person.name} bekommt ${tok(pay - total)} zurück.`,
        },
      ],
      4,
    );
  }, cfg);
}

// ---------- S5 ----------

function s5(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  const bind = readBind(opts, ['A', 'B']);
  if (cfg.multiply < 2 || cfg.maxSteps < 3) return 'unsupported';
  return retry(() => {
    const a = chooseItem(rng, cfg, bind.A, bind.B === undefined ? [] : [bind.B], true);
    if (!a?.plural) return null;
    const b = chooseItem(rng, cfg, bind.B, [a.id]);
    if (!b || b.id === a.id) return null;
    const pa = randomPrice(rng, cfg, a);
    const pb = randomPrice(rng, cfg, b);
    if (pa === null || pb === null) return null;
    const n = randomInt(rng, 2, cfg.multiply);
    const many = n * pa;
    const total = many + pb;
    if (total > cfg.money.maxTotal) return null;
    const budget = choosePayment(rng, cfg, total);
    if (budget === null) return null;
    const person = chooseName(rng);
    const add = addSteps(many, pb);
    const rest = countUp(total, budget);
    return makeTask(
      cfg,
      'Der große Einkauf',
      {
        kind: 'items',
        items: [
          { itemId: a.id, label: a.name, price: pa, quantity: n },
          { itemId: b.id, label: b.name, price: pb },
        ],
        hand: [budget],
      },
      `${person.name} hat ${tok(budget)}. ${cap(person.pron)} kauft ${String(n)} ${a.plural} für je ${tok(pa)} und ${b.akk} für ${tok(pb)}.`,
      [
        {
          question: `Wie viel kosten die ${a.plural}?`,
          answer: { type: 'money', correct: many },
          mistakes: cleanMistakes(
            many,
            oneLessMore(n, pa, a).map((d) => ({ value: d.value, feedback: d.feedback })),
          ),
          hints: quantityHints(n, a, pa),
          explanation: `${timesText(n, pa)} = ${tok(many)}.`,
        },
        {
          question: 'Wie viel kostet alles?',
          answer: { type: 'money', correct: total },
          mistakes: sumMistakes(many, pb, person.name),
          hints: [`Rechne ${tok(many)} + ${tok(pb)}.`, add.hints[1]],
          explanation: add.explanation,
        },
        {
          question: 'Wie viel bleibt übrig?',
          answer: { type: 'money', correct: budget - total },
          mistakes: restMistakes(budget, total, [
            {
              value: budget - many,
              feedback: `${cap(b.def)} kostet auch Geld. Zieh ${tok(pb)} auch noch ab.`,
            },
          ]),
          hints: rest.hints,
          explanation: `${rest.explanation} Es bleiben ${tok(budget - total)}.`,
          praise: 'Super! Drei Rechenschritte hintereinander.',
        },
      ],
      5,
    );
  }, cfg);
}

// ---------- UE1 ----------

/** Preise höchstens 10 Cent neben ganzen Euro: x,90 / x,95 / x,05 / x,10 (Anhang A). */
const NEAR_OFFSETS = [-10, -5, 5, 10];

function nearPrice(rng: Rng, cfg: StufeConfig, item: Item): Cents | null {
  const range = item.prices[cfg.id];
  if (!range) return null;
  const max = Math.min(range[1], cfg.money.maxPrice);
  const options: Cents[] = [];
  for (let euro = 1; euro * 100 - 10 <= max; euro++) {
    for (const offset of NEAR_OFFSETS) {
      const price = euro * 100 + offset;
      if (price >= range[0] && price <= max && price % cfg.money.step === 0) options.push(price);
    }
  }
  return options.length === 0 ? null : pick(rng, options);
}

function rounded(price: Cents): Cents {
  return Math.round(price / 100) * 100;
}

function nearText(price: Cents): string {
  const r = rounded(price);
  const is = price < 100 ? 'sind' : 'ist';
  return price < r
    ? `${tok(price)} ${is} fast ${tok(r)}.`
    : `${tok(price)} ${is} nur wenig mehr als ${tok(r)}.`;
}

function ue1(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  const bind = readBind(opts, ['A', 'B']);
  if (!cfg.money.useCents || cfg.money.centOnly) return 'unsupported';
  return retry(() => {
    const a = chooseItem(rng, cfg, bind.A, bind.B === undefined ? [] : [bind.B]);
    if (!a) return null;
    const b = chooseItem(rng, cfg, bind.B, [a.id]);
    if (!b || b.id === a.id) return null;
    const pa = nearPrice(rng, cfg, a);
    const pb = nearPrice(rng, cfg, b);
    if (pa === null || pb === null || pa === pb || pa + pb > cfg.money.maxTotal) return null;
    // Heben sich die Abweichungen auf, gäbe es nichts zu überschlagen.
    if (rounded(pa) + rounded(pb) === pa + pb) return null;
    const ra = rounded(pa);
    const rb = rounded(pb);
    const r = ra + rb;
    const person = chooseName(rng);
    const higher = Math.ceil(Math.max(pa, pb) / 100) * 100;
    const label = (cents: Cents) => `ungefähr ${tok(cents)}`;
    return makeTask(
      cfg,
      'Ungefähr reicht',
      {
        kind: 'items',
        items: [
          { itemId: a.id, label: a.name, price: pa },
          { itemId: b.id, label: b.name, price: pb },
        ],
      },
      `${person.name} kauft ${a.akk} für ${tok(pa)} und ${b.akk} für ${tok(pb)}.`,
      [
        {
          question: 'Ungefähr wie viel kostet beides? Du musst nicht genau rechnen.',
          answer: choice(
            { label: label(r) },
            [
              {
                label: label(Math.max(r - 200, 100)),
                feedback: `${nearText(pa)} Und ${nearText(pb)}`,
              },
              {
                label: label(r * 2),
                feedback: `Beide Sachen kosten weniger als ${tok(higher)}. Zusammen können es keine ${tok(r * 2)} sein.`,
              },
              {
                label: label(r + 200),
                feedback: `Runde die Preise und rechne dann: ${tok(ra)} + ${tok(rb)}.`,
              },
              {
                label: label(r + 300),
                feedback: `Runde die Preise und rechne dann: ${tok(ra)} + ${tok(rb)}.`,
              },
            ],
            cfg.choiceCount,
          ),
          hints: [
            `Runde die Preise. ${tok(pa)} ${pa < 100 ? 'sind' : 'ist'} ungefähr …?`,
            `${nearText(pa)} ${nearText(pb)}`,
          ],
          explanation: `Ungefähr ${tok(ra)} + ${tok(rb)} = ${tok(r)}. Ganz genau sind es ${tok(pa + pb)}.`,
          praise: 'Gut geschätzt! Überschlagen hilft beim Einkaufen.',
        },
      ],
      4,
    );
  }, cfg);
}

/** Vorlagen für das Thema „sachaufgaben“ (docs/05 4.6), leicht → schwer. */
export const SACHAUFGABEN_GENERATORS: Generator[] = [
  { id: 'S1', topic: 'sachaufgaben', stufen: [2, 3, 4], generate: s1 },
  { id: 'S2', topic: 'sachaufgaben', stufen: [2, 3, 4], generate: s2 },
  { id: 'S3', topic: 'sachaufgaben', stufen: [2, 3, 4], generate: s3 },
  { id: 'S4', topic: 'sachaufgaben', stufen: [3, 4], generate: s4 },
  { id: 'S5', topic: 'sachaufgaben', stufen: [4], generate: s5 },
  { id: 'UE1', topic: 'sachaufgaben', stufen: [3, 4], generate: ue1 },
];
