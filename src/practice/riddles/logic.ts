import { AVATARS } from '@/content/avatars';
import { NAMES } from '@/content/names';
import { pick, randomInt, type Rng } from '@/domain/random';
import type { StufeConfig, Task } from '@/domain/types';
import { choice, makeTask, mix, readBind, readForce, tok } from '../build';
import { STILL_THINGS, thingById } from '../generators/mengen-zahlen-parts';
import { validMistakes } from '../generators/muenzen-zaehlen-parts';
import type { Generator } from '../types';
import { type LogicFrage, paramsFor, riddleStufen } from './params';

/** Kinder der Szene als Avatar mit Namen (docs/10 3); jedes Kind bekommt ein anderes Tier. */
function withAvatars(names: readonly string[]): { name: string; avatar: string }[] {
  return names.map((name, i) => ({ name, avatar: AVATARS[i % AVATARS.length]?.id ?? 'delfin' }));
}

// Wer hat am meisten? (docs/10): aus Sätzen eine Reihenfolge erschließen; Stufe 4 mit Beträgen.

/** hi hat mehr als lo. */
export interface Relation {
  hi: string;
  lo: string;
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [items.slice()];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
  );
}

/** Alle Reihenfolgen (vorne = am meisten), die zu den Sätzen passen. */
export function consistentOrders(
  names: readonly string[],
  relations: readonly Relation[],
): string[][] {
  return permutations(names).filter((order) =>
    relations.every((r) => order.indexOf(r.hi) < order.indexOf(r.lo)),
  );
}

/** Wer ist an der gefragten Stelle? */
export function answerOf(order: readonly string[], frage: Exclude<LogicFrage, 'betrag'>): string {
  const index = frage === 'meisten' ? 0 : frage === 'wenigsten' ? order.length - 1 : 1;
  return order[index] ?? '';
}

const QUESTION_WORD: Record<Exclude<LogicFrage, 'betrag'>, string> = {
  meisten: 'am meisten',
  wenigsten: 'am wenigsten',
  mitte: 'nicht am meisten und nicht am wenigsten',
};

function orderTask(
  cfg: StufeConfig,
  rng: Rng,
  frage: Exclude<LogicFrage, 'betrag'>,
  kids: number,
  fullOrder: boolean,
): Task | 'unsupported' {
  const money = rng() < cfg.riddles.moneyShare;
  const noun = money ? 'Geld' : thingById(pick(rng, STILL_THINGS)).plural;
  const count = frage === 'mitte' ? 3 : kids;
  const order = mix(
    rng,
    NAMES.map((n) => n.name),
  ).slice(0, count);
  const [top = '', mid = '', low = ''] = order;
  // Ab Stufe 3 (und bei „Mitte“) eine Kette, sonst auch ein „Stern“ (A > B, A > C).
  const chain = fullOrder || frage === 'mitte' || rng() < 0.5;
  const relations: Relation[] = chain
    ? order.slice(1).map((lo, i) => ({ hi: order[i] ?? '', lo }))
    : frage === 'meisten'
      ? [
          { hi: top, lo: mid },
          { hi: top, lo: low },
        ]
      : [
          { hi: top, lo: low },
          { hi: mid, lo: low },
        ];
  // Stufe 2 nur „mehr als“; ab Stufe 3 auch „weniger als“, Sätze gemischt.
  const sentenceOf = new Map<Relation, string>(
    relations.map((r) => [
      r,
      fullOrder && rng() < 0.5
        ? `${r.lo} hat weniger ${noun} als ${r.hi}.`
        : `${r.hi} hat mehr ${noun} als ${r.lo}.`,
    ]),
  );
  const shown = fullOrder ? mix(rng, relations) : relations;
  const orders = consistentOrders(order, relations);
  const answers = new Set(orders.map((o) => answerOf(o, frage)));
  const correct = answerOf(order, frage);
  if (answers.size !== 1 || !answers.has(correct) || (fullOrder && orders.length !== 1))
    return 'unsupported';
  const wrong = order
    .filter((name) => name !== correct)
    .map((name) => {
      const against =
        frage === 'meisten'
          ? relations.find((r) => r.lo === name)
          : frage === 'wenigsten'
            ? relations.find((r) => r.hi === name)
            : undefined;
      const sentence = against && sentenceOf.get(against);
      return {
        label: name,
        feedback: sentence
          ? `Lies noch einmal: ${sentence} Also hat ${name} nicht ${QUESTION_WORD[frage]}.`
          : 'Stell die Kinder auf die Treppe. Wer steht in der Mitte?',
      };
    });
  const last =
    frage === 'mitte'
      ? `${correct} steht in der Mitte.`
      : `${correct} hat ${QUESTION_WORD[frage]}.`;
  const explanation = chain
    ? `${order
        .slice(1)
        .map((lo, i) =>
          i === 0 ? `${order[0] ?? ''} hat mehr als ${lo}` : `${order[i] ?? ''} mehr als ${lo}`,
        )
        .join(', ')}. Also: ${order.join(', ')}. ${last}`
    : frage === 'meisten'
      ? `${top} hat mehr als ${mid} und mehr als ${low}. Also hat ${top} am meisten.`
      : `${top} und ${mid} haben mehr als ${low}. Also hat ${low} am wenigsten.`;
  const scene = withAvatars(mix(rng, order));
  return makeTask(
    cfg,
    frage === 'mitte' ? 'Wer ist in der Mitte?' : `Wer hat ${QUESTION_WORD[frage]}?`,
    { kind: 'people', people: scene },
    shown.map((r) => sentenceOf.get(r) ?? '').join(' '),
    [
      {
        question: `Wer hat ${QUESTION_WORD[frage]} ${noun}?`,
        answer: choice({ label: correct }, wrong, order.length),
        hints: [
          'Lies jeden Satz einzeln.',
          'Stell die Kinder auf die Treppe: Wer mehr hat, steht höher.',
        ],
        explanation,
      },
    ],
    3,
  );
}

function amountTask(cfg: StufeConfig, rng: Rng, kids: number): Task | 'unsupported' {
  if (!cfg.answerTypes.includes('money')) return 'unsupported';
  const p = paramsFor(cfg).logic;
  const step = Math.max(p.moneyStep, cfg.money.step);
  const max = Math.min(p.moneyMax, cfg.money.maxTotal);
  const units = Math.floor(max / step);
  if (units < 4) return 'unsupported';
  const count = kids >= 4 ? randomInt(rng, 3, 4) : 3;
  const names = mix(
    rng,
    NAMES.map((n) => n.name),
  ).slice(0, count);
  const values = [randomInt(rng, 1, units) * step];
  const diffs: number[] = [];
  for (let i = 1; i < count; i++) {
    const prev = values[i - 1] ?? 0;
    const d = randomInt(rng, 1, Math.max(1, Math.floor(units / 3))) * step;
    const up = prev + d <= max && (prev - d < step || rng() < 0.5);
    const next = up ? prev + d : prev - d;
    if (next < step || next > max) return 'unsupported';
    values.push(next);
    diffs.push(up ? d : -d);
  }
  const word = (d: number) => (d > 0 ? 'mehr' : 'weniger');
  const name = (i: number) => names[i] ?? '';
  const relationSentences = diffs.map(
    (d, i) => `${name(i + 1)} hat ${tok(Math.abs(d))} ${word(d)} als ${name(i)}.`,
  );
  const base = `${name(0)} hat ${tok(values[0] ?? 0)}.`;
  // Wie im Beispiel aus docs/10 steht der bekannte Betrag manchmal erst im zweiten Satz.
  const sentences =
    rng() < 0.5
      ? [base, ...relationSentences]
      : [relationSentences[0] ?? '', base, ...relationSentences.slice(1)];
  const lastIndex = count - 1;
  const correct = values[lastIndex] ?? 0;
  const prevValue = values[lastIndex - 1] ?? 0;
  const lastDiff = diffs[lastIndex - 1] ?? 0;
  const flippedAll = diffs.reduce((v, d) => v - d, values[0] ?? 0);
  const mistakes = validMistakes(
    correct,
    [
      {
        value: prevValue - lastDiff,
        feedback: `Lies genau: ${relationSentences[lastIndex - 1] ?? ''}`,
      },
      {
        value: prevValue,
        feedback: `So viel hat ${name(lastIndex - 1)}. Rechne noch einen Schritt weiter.`,
      },
      { value: flippedAll, feedback: 'Achte bei jedem Satz auf „mehr“ und „weniger“.' },
    ],
    2 * cfg.money.maxTotal,
    cfg.money.step,
  );
  const steps = diffs.map((d, i) => {
    const prev = values[i] ?? 0;
    return `${name(i + 1)} hat ${tok(Math.abs(d))} ${word(d)} als ${name(i)}: ${tok(prev)} ${d > 0 ? '+' : '−'} ${tok(Math.abs(d))} = ${tok(values[i + 1] ?? 0)}.`;
  });
  return makeTask(
    cfg,
    `Wie viel hat ${name(lastIndex)}?`,
    { kind: 'people', people: withAvatars(mix(rng, names)) },
    sentences.join(' '),
    [
      {
        question: `Wie viel Geld hat ${name(lastIndex)}?`,
        answer: { type: 'money', correct },
        ...(mistakes.length > 0 ? { mistakes } : {}),
        hints: [
          'Lies jeden Satz einzeln.',
          `Fang bei ${name(0)} an. Wie viel Geld hat ${name(1)}?`,
        ],
        explanation: `${base} ${steps.join(' ')} ${name(lastIndex)} hat ${tok(correct)}.`,
      },
    ],
    3,
  );
}

export const logic: Generator = {
  id: 'logic',
  topic: 'raetsel',
  stufen: riddleStufen('logic'),
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['frage']);
    readBind(opts, []);
    const frage = force.frage;
    if (
      frage !== undefined &&
      !['meisten', 'wenigsten', 'mitte', 'betrag'].includes(frage as string)
    )
      throw new Error('logic: frage');
    if (!cfg.riddles.types.includes('logic')) return 'unsupported';
    const p = paramsFor(cfg).logic;
    const chosen = (frage as LogicFrage | undefined) ?? pick(rng, p.fragen);
    if (chosen === 'betrag') return amountTask(cfg, rng, p.kids);
    if (!cfg.answerTypes.includes('choice')) return 'unsupported';
    return orderTask(cfg, rng, chosen, p.kids, p.fullOrder);
  },
};
