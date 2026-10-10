import { THINGS } from '@/content/things';
import { pick, randomInt, type Rng } from '@/domain/random';
import type {
  ChoiceAnswer,
  ChoiceOption,
  MoneyPiece,
  OrderEntry,
  Stufe,
  StufeConfig,
  Task,
} from '@/domain/types';
import {
  cap,
  chooseItem,
  chooseName,
  makeTask,
  mix,
  randomPrice,
  readBind,
  readForce,
  tok,
} from '../build';
import type { GenerateOptions, Generator } from '../types';
import {
  countAloud,
  countWords,
  MOVERS,
  numberMistakes,
  STILL_THINGS,
  SYMBOLS,
  thingById,
  type ThingWords,
  withDot,
} from './mengen-zahlen-parts';

// Vorlagen für das Thema „mengen-zahlen“ (docs/05 Anhang B, Varianten der Bucht in docs/11).

const COUNT_ONE = 'Hast du etwas übersehen oder doppelt gezählt? Tippe jedes einzeln an.';

/** Kleinste Anzahl bei M1 (docs/05 Anhang B: Stufe 1 ab 3, Stufe 2 ab 8). */
const M1_MIN: Partial<Record<Stufe, number>> = { 1: 3, 2: 8 };

function pickThing(rng: Rng, ids: readonly string[]): ThingWords {
  return thingById(pick(rng, ids));
}

/** Zahlenkarten aufsteigend, ohne Mischen (wie B1.1, B4.3). */
function numberCards(
  correct: number,
  wrong: readonly { value: number; feedback: string }[],
): ChoiceAnswer {
  const options = [
    { value: correct, correct: true as const },
    ...wrong.map((w) => ({ value: w.value, feedback: w.feedback })),
  ].sort((a, b) => a.value - b.value);
  return {
    type: 'choice',
    layout: 'cards',
    shuffle: false,
    options: options.map(({ value, ...rest }, i): ChoiceOption => ({
      id: 'abcd'.charAt(i),
      label: String(value),
      ...rest,
    })),
  };
}

// ---------- M1: Wie viele siehst du? ----------

const M1: Generator = {
  id: 'M1',
  topic: 'mengen-zahlen',
  stufen: [1, 2],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['eingabe']);
    readBind(opts, []);
    const eingabe = force.eingabe ?? 'choice';
    if (eingabe !== 'choice' && eingabe !== 'number') throw new Error('M1: eingabe');
    if (!cfg.answerTypes.includes(eingabe)) return 'unsupported';
    const min = M1_MIN[cfg.id] ?? 3;
    const max = cfg.numbers.max;
    if (min > max) return 'unsupported';
    const thing = pickThing(
      rng,
      THINGS.map((t) => t.id),
    );
    const n = randomInt(rng, min, max);
    const p = thing.plural;
    const tip2 =
      n <= 5
        ? 'Zähle langsam mit: eins, zwei, drei …'
        : n <= 10
          ? 'Es sind mehr als 5. Zähle ab 5 weiter: sechs …'
          : 'Zähle die Fünferreihen: fünf, zehn … Dann zähle weiter.';
    const base = {
      question: `Wie viele ${p} siehst du?`,
      hints: [`Tippe ${thing.jedeAkk} an. Dann bekommt ${thing.pron} einen Punkt.`, tip2] as [
        string,
        string,
      ],
      explanation: `${countAloud(n)}. Es sind ${String(n)} ${p}.`,
    };
    const scene = { kind: 'objects' as const, groups: [{ itemId: thing.id, count: n }] };
    if (eingabe === 'number') {
      return makeTask(
        cfg,
        `${p} zählen`,
        scene,
        thing.place,
        [
          {
            ...base,
            answer: { type: 'number', correct: n },
            mistakes: numberMistakes(
              n,
              [
                { value: n - 1, feedback: `Zähle noch einmal und tippe ${thing.jedeAkk} an.` },
                { value: n + 1, feedback: `Hast du ${thing.akk} zweimal gezählt?` },
              ],
              max,
            ),
          },
        ],
        1,
      );
    }
    const less = {
      value: n - 1,
      feedback: `Hast du ${thing.akk} übersehen? Tippe ${thing.jedeAkk} an.`,
    };
    const more = {
      value: n + 1,
      feedback: `Hast du ${thing.akk} zweimal gezählt? Tippe ${thing.jede} nur einmal an.`,
    };
    const wrong =
      n + 1 <= max
        ? [less, more]
        : [{ value: n - 2, feedback: 'Zähle noch einmal. Es sind mehr.' }, less];
    return makeTask(
      cfg,
      `${p} zählen`,
      scene,
      thing.place,
      [{ ...base, answer: numberCards(n, wrong), praise: 'Super gezählt!' }],
      1,
    );
  },
};

// ---------- M2: Zwei Eimer ----------

const M2: Generator = {
  id: 'M2',
  topic: 'mengen-zahlen',
  stufen: [1, 2],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('choice')) return 'unsupported';
    const max = cfg.numbers.max;
    if (max < 3) return 'unsupported';
    const thing = pickThing(rng, STILL_THINGS);
    const p = thing.plural;
    const [s1, s2] = mix(
      rng,
      SYMBOLS.filter((s) => s.icon !== thing.id),
    );
    if (!s1 || !s2) return 'unsupported';
    const equal = rng() < 0.2;
    const a = randomInt(rng, 2, max);
    let b = a;
    if (!equal) {
      b = randomInt(rng, 2, max - 1);
      if (b >= a) b++;
    }
    const bags = [
      { symbol: s1, count: a },
      { symbol: s2, count: b },
    ];
    const hi = a >= b ? bags[0] : bags[1];
    const lo = a >= b ? bags[1] : bags[0];
    if (!hi || !lo) return 'unsupported';
    const bagOption = (bag: (typeof bags)[number]): Omit<ChoiceOption, 'id'> => {
      const other = bag === bags[0] ? bags[1] : bags[0];
      const base = {
        label: `Eimer mit ${bag.symbol.name}`,
        icon: bag.symbol.icon,
        objects: { itemId: thing.id, count: bag.count },
      };
      if (!equal && bag === hi) return { ...base, correct: true };
      return {
        ...base,
        feedback: equal
          ? `Im ${bag.symbol.name}-Eimer sind ${String(bag.count)} ${p}. Im ${other?.symbol.name ?? ''}-Eimer sind es auch ${String(bag.count)}.`
          : `Im ${bag.symbol.name}-Eimer sind ${String(bag.count)} ${p}. Zähle jetzt den ${hi.symbol.name}-Eimer.`,
      };
    };
    const same: Omit<ChoiceOption, 'id'> = equal
      ? { label: 'Gleich viele', correct: true }
      : { label: 'Gleich viele', feedback: 'Zähle noch einmal. Sind es wirklich gleich viele?' };
    const answer: ChoiceAnswer = {
      type: 'choice',
      layout: 'bags',
      shuffle: false,
      options: [bagOption(bags[0] ?? hi), bagOption(bags[1] ?? lo), same].map((o, i) => ({
        ...o,
        id: 'abc'.charAt(i),
      })),
    };
    const first = bags[0] ?? hi;
    const second = bags[1] ?? lo;
    return makeTask(
      cfg,
      'Zwei Eimer',
      { kind: 'none' },
      `Kiko hat zwei Eimer mit ${thing.dativ}.`,
      [
        {
          question: `In welchem Eimer sind mehr ${p}?`,
          answer,
          hints: [
            'Zähle zuerst den einen Eimer, dann den anderen.',
            equal
              ? 'Vergleiche die beiden Zahlen.'
              : `Was ist mehr: ${String(first.count)} oder ${String(second.count)}?`,
          ],
          explanation: equal
            ? `Im ${first.symbol.name}-Eimer sind ${String(a)} ${p}, im ${second.symbol.name}-Eimer auch ${String(a)}. Das ist gleich viel.`
            : `Im ${hi.symbol.name}-Eimer sind ${String(hi.count)} ${p}, im ${lo.symbol.name}-Eimer ${String(lo.count)}. ${String(hi.count)} ist mehr als ${String(lo.count)}.`,
        },
      ],
      1,
    );
  },
};

// ---------- M3: Noch mehr dazu ----------

const M3: Generator = {
  id: 'M3',
  topic: 'mengen-zahlen',
  stufen: [1, 2],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('number')) return 'unsupported';
    const max = cfg.numbers.max;
    if (max < 4) return 'unsupported';
    const thing = pickThing(rng, [...STILL_THINGS, 'krebs']);
    const p = thing.plural;
    const a = randomInt(rng, 2, max - 2);
    const b = randomInt(rng, 2, max - a);
    const s = a + b;
    return makeTask(
      cfg,
      `Noch mehr ${p}`,
      {
        kind: 'objects',
        groups: [
          { itemId: thing.id, count: a, label: 'zuerst' },
          { itemId: thing.id, count: b, label: 'dazu' },
        ],
      },
      `Kiko findet ${String(a)} ${p}. Dann findet er noch ${String(b)}.`,
      [
        {
          question: `Wie viele ${p} hat Kiko jetzt?`,
          answer: { type: 'number', correct: s },
          mistakes: numberMistakes(
            s,
            [
              { value: s - 1, feedback: `Zähle alle ${p} zusammen. Fang links an.` },
              { value: Math.abs(a - b), feedback: `Kiko findet ${p} dazu. Dann werden es mehr.` },
              { value: s + 1, feedback: COUNT_ONE },
            ],
            max,
          ),
          hints: [
            `Zähle alle ${p}: erst links, dann rechts.`,
            withDot(`Links sind ${String(a)}. Zähle weiter: ${countWords(a + 1, s)}`),
          ],
          explanation: `${String(a)} und ${String(b)} sind zusammen ${String(s)}.`,
          praise: 'Toll! Du hast weitergezählt.',
        },
      ],
      1,
    );
  },
};

// ---------- M4: Weg ist weg ----------

function m4Things(cfg: StufeConfig, rng: Rng): Task | 'unsupported' {
  const max = cfg.numbers.max;
  if (max < 3) return 'unsupported';
  const thing = pickThing(rng, Object.keys(MOVERS));
  const move = MOVERS[thing.id];
  if (!move) return 'unsupported';
  const p = thing.plural;
  const a = randomInt(rng, 3, max);
  const b = randomInt(rng, 1, a - 1);
  const r = a - b;
  const leave =
    b === 1 ? `${thing.nomCap} ${move.singular} weg.` : `${String(b)} ${move.plural} weg.`;
  const leaveFull =
    b === 1 ? `${thing.nomCap} ${move.singular} weg.` : `${String(b)} ${p} ${move.plural} weg.`;
  const fingers = a <= 10;
  return makeTask(
    cfg,
    `${p} ${move.plural} weg`,
    { kind: 'objects', groups: [{ itemId: thing.id, count: a, leaving: b }] },
    `${move.place} sind ${String(a)} ${p}. ${leave}`,
    [
      {
        question: `Wie viele ${p} bleiben da?`,
        answer: { type: 'number', correct: r },
        mistakes: numberMistakes(
          r,
          [
            {
              value: a + b,
              feedback: `Die ${p} ${move.plural} weg. Dann werden es weniger.`,
            },
            { value: b, feedback: `${leaveFull} Wie viele bleiben übrig?` },
            { value: r + 1, feedback: COUNT_ONE },
            { value: r - 1, feedback: COUNT_ONE },
          ],
          max,
        ),
        hints: fingers
          ? [
              `Halte ${String(a)} Finger hoch. Klappe ${String(b)} Finger ein.`,
              'Zähle die Finger, die noch stehen.',
            ]
          : [
              `Zähle von ${String(a)} rückwärts. Nimm ${String(b)} weg.`,
              withDot(`Zähle ${String(b)} Schritte rückwärts: ${countWords(a - 1, r)}`),
            ],
        explanation: `${String(a)} weniger ${String(b)} sind ${String(r)}. ${
          r === 1 ? `Es bleibt 1 ${thing.singular}.` : `Es bleiben ${String(r)} ${p}.`
        }`,
      },
    ],
    2,
  );
}

/** Kleine Hand voll Münzen für einen Betrag (größte zuerst). */
function handPieces(cfg: StufeConfig, amount: number): MoneyPiece[] | null {
  const pieces = [...cfg.money.pieces].sort((x, y) => y - x);
  const result: MoneyPiece[] = [];
  let rest = amount;
  for (const piece of pieces) {
    while (piece <= rest) {
      result.push(piece);
      rest -= piece;
    }
  }
  return rest === 0 ? result : null;
}

function m4Money(cfg: StufeConfig, rng: Rng): Task | 'unsupported' {
  const kind = cfg.money.centOnly ? 'number' : 'money';
  if (!cfg.answerTypes.includes(kind)) return 'unsupported';
  const limit =
    kind === 'number' ? Math.min(cfg.numbers.max, cfg.money.maxTotal) : cfg.money.maxTotal;
  const step = cfg.money.step;
  for (let tries = 0; tries < 20; tries++) {
    const item = chooseItem(rng, cfg, undefined);
    if (!item) return 'unsupported';
    const price = randomPrice(rng, cfg, item);
    if (price === null || price + step > limit) continue;
    const budget = randomInt(rng, price / step + 1, Math.floor(limit / step)) * step;
    const hand = handPieces(cfg, budget);
    if (!hand) continue;
    const rest = budget - price;
    const person = chooseName(rng);
    const pron = person.pron;
    const n = person.name;
    const cents = cfg.money.centOnly;
    const words = cents ? countWords(budget - 1, rest) : '';
    return makeTask(
      cfg,
      `${n} kauft ein`,
      {
        kind: 'items',
        items: [{ itemId: item.id, label: item.name, price }],
        hand,
      },
      `${n} hat ${tok(budget)}. ${cap(pron)} kauft ${item.akk} für ${tok(price)}.`,
      [
        {
          question: cents ? `Wie viel Cent hat ${pron} noch?` : `Wie viel Geld hat ${pron} noch?`,
          answer:
            kind === 'number'
              ? { type: 'number', correct: rest }
              : { type: 'money', correct: rest },
          mistakes: numberMistakes(
            rest,
            [
              {
                value: budget + price,
                feedback: `${n} gibt Geld aus. Dann hat ${pron} weniger.`,
              },
              {
                value: price,
                feedback: `${cap(item.def)} kostet ${tok(price)}. Wie viel bleibt ${n} übrig?`,
              },
              {
                value: rest + step,
                feedback: `Zähle noch einmal von ${tok(budget)} rückwärts.`,
              },
              {
                value: rest - step,
                feedback: `Zähle noch einmal von ${tok(budget)} rückwärts.`,
              },
            ],
            kind === 'number' ? cfg.numbers.max : 2 * cfg.money.maxTotal,
          ),
          hints: [
            `${n} hat ${tok(budget)} und gibt ${tok(price)} aus.`,
            cents
              ? withDot(`Zähle von ${String(budget)} rückwärts: ${words}`)
              : `Rechne ${String(budget / 100)} − ${String(price / 100)}.`,
          ],
          explanation: cents
            ? `${String(budget)} weniger ${String(price)} sind ${String(rest)}. ${n} hat noch ${tok(rest)}.`
            : `${tok(budget)} − ${tok(price)} = ${tok(rest)}. ${n} hat noch ${tok(rest)}.`,
          praise: 'Toll! Du hast rückwärts gezählt.',
        },
      ],
      2,
    );
  }
  return 'unsupported';
}

const M4: Generator = {
  id: 'M4',
  topic: 'mengen-zahlen',
  stufen: [1, 2],
  generate(cfg, rng, opts: GenerateOptions | undefined) {
    const force = readForce(opts, ['geld']);
    readBind(opts, []);
    if (force.geld === true) return m4Money(cfg, rng);
    if (!cfg.answerTypes.includes('number')) return 'unsupported';
    return m4Things(cfg, rng);
  },
};

// ---------- N1: Welche Zahl kommt davor/danach? ----------

const N1: Generator = {
  id: 'N1',
  topic: 'mengen-zahlen',
  stufen: [1, 2],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const max = cfg.numbers.max;
    if (max < 4 || !cfg.answerTypes.includes('choice')) return 'unsupported';
    const after = rng() < 0.5;
    if (after) {
      const n = randomInt(rng, 1, max - 2);
      return makeTask(
        cfg,
        'Kiko zählt',
        {
          kind: 'sequence',
          items: [
            { kind: 'number', value: n - 1 },
            { kind: 'number', value: n },
            { kind: 'blank' },
          ],
        },
        'Kiko zählt.',
        [
          {
            question: `Welche Zahl kommt nach der ${String(n)}?`,
            answer: numberCards(n + 1, [
              {
                value: n - 1,
                feedback: `Die ${String(n - 1)} kommt vor der ${String(n)}. Wir suchen die Zahl danach.`,
              },
              {
                value: n + 2,
                feedback: `Zwischen ${String(n)} und ${String(n + 2)} kommt noch eine Zahl.`,
              },
            ]),
            hints: [
              `Zähle laut: ${countWords(n - 1, n)} …`,
              `Was sagst du nach ${countWords(n, n)}?`,
            ],
            explanation: `${String(n - 1)}, ${String(n)}, ${String(n + 1)}. Nach der ${String(n)} kommt die ${String(n + 1)}.`,
          },
        ],
        1,
      );
    }
    const n = randomInt(rng, 2, max - 1);
    return makeTask(
      cfg,
      'Kiko zählt',
      {
        kind: 'sequence',
        items: [{ kind: 'blank' }, { kind: 'number', value: n }, { kind: 'number', value: n + 1 }],
      },
      'Kiko zählt.',
      [
        {
          question: `Welche Zahl kommt vor der ${String(n)}?`,
          answer: numberCards(n - 1, [
            {
              value: n - 2,
              feedback: `Zwischen ${String(n - 2)} und ${String(n)} kommt noch eine Zahl.`,
            },
            {
              value: n + 1,
              feedback: `Die ${String(n + 1)} kommt nach der ${String(n)}. Wir suchen die Zahl davor.`,
            },
          ]),
          hints: [
            `Zähle laut von eins bis ${countWords(n, n)}.`,
            `Was sagst du direkt vor ${countWords(n, n)}?`,
          ],
          explanation: `${String(n - 1)}, ${String(n)}, ${String(n + 1)}. Vor der ${String(n)} kommt die ${String(n - 1)}.`,
        },
      ],
      1,
    );
  },
};

// ---------- O2: Häufchen ordnen ----------

const O2: Generator = {
  id: 'O2',
  topic: 'mengen-zahlen',
  stufen: [1, 2],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const max = cfg.numbers.max;
    if (max < 6 || !cfg.answerTypes.includes('order')) return 'unsupported';
    const thing = pickThing(rng, STILL_THINGS);
    const p = thing.plural;
    // Drei Anzahlen ab 2 mit Abstand ≥ 2: kleinste zuerst, dann zwei Lücken verteilen.
    const a = randomInt(rng, 2, max - 4);
    const b = randomInt(rng, a + 2, max - 2);
    const c = randomInt(rng, b + 2, max);
    const entries: OrderEntry[] = mix(rng, [a, b, c]).map((n) => ({
      id: `h${String(n)}`,
      label: `${String(n)} ${p}`,
      value: n,
      objects: { itemId: thing.id, count: n },
    }));
    return makeTask(
      cfg,
      'Häufchen ordnen',
      { kind: 'none' },
      'Kiko hat drei Häufchen gemacht.',
      [
        {
          question: `Tippe zuerst das Häufchen mit den wenigsten ${thing.dativ} an.`,
          answer: { type: 'order', entries, direction: 'asc' },
          hints: [
            'Zähle jedes Häufchen.',
            `Ein Häufchen hat nur ${String(a)} ${p}. Damit fängst du an.`,
          ],
          explanation: `Zuerst ${String(a)} ${p}, dann ${String(b)}, dann ${String(c)}.`,
        },
      ],
      1,
    );
  },
};

/** Reihenfolge leicht → schwer (docs/05 Anhang B). */
export const MENGEN_ZAHLEN_GENERATORS: Generator[] = [M1, M2, M3, M4, N1, O2];
