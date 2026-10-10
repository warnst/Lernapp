import type { Item } from '@/content/items';
import { ITEMS, itemById } from '@/content/items';
import { pick, randomInt, type Rng } from '@/domain/random';
import { renderText } from '@/domain/text';
import type {
  Cents,
  ChoiceAnswer,
  ChoiceOption,
  MoneyPiece,
  StufeConfig,
  Task,
} from '@/domain/types';
import {
  cap,
  chooseItem,
  chooseName,
  genitiv,
  makeTask,
  randomPrice,
  readBind,
  readForce,
  tok,
  wordCount,
} from '../build';
import type { GenerateOptions, Generator } from '../types';
import {
  addSteps,
  cleanMistakes,
  coinsOf,
  countUp,
  fehlen,
  greedy,
  isNote,
  pieceDef,
  pieceName,
  piecesInWords,
  piecesSum,
  randomAmount,
} from './sachaufgaben-parts';

// Vorlagen für das Thema „knobeln“ (docs/05 4.7 und Anhang A).

const TRIES = 40;

function retry(build: () => Task | null, cfg: StufeConfig): Task | 'unsupported' {
  for (let i = 0; i < TRIES; i++) {
    const task = build();
    if (task && wordCount(renderText(task.story)) <= cfg.maxStoryWords) return task;
  }
  return 'unsupported';
}

/** Stufe ohne Cent (Stufe 2): Münzen und Scheine; sonst nur Münzen (docs/05 4.7). */
function withNotes(cfg: StufeConfig): boolean {
  return !cfg.money.useCents;
}

/**
 * Erlaubte Stücke im Stufenschritt (Stufe 3/4: ohne 1- und 2-Cent-Münzen). Alle Beträge liegen im
 * Schritt, und die Prüfung aller Legemöglichkeiten bleibt klein.
 */
function piecesFor(cfg: StufeConfig): MoneyPiece[] {
  const pieces = withNotes(cfg) ? [...cfg.money.pieces] : coinsOf(cfg);
  return pieces.filter((p) => p % cfg.money.step === 0);
}

/** „5 Cent sind“, „1 € ist“ */
function amountIs(piece: MoneyPiece): string {
  return `${tok(piece)} ${piece === 100 || piece === 1 ? 'ist' : 'sind'}`;
}

/** Antwortkarten mit Münzen, aufsteigend sortiert (wie in den Originalen 8.1 und 9.5). */
function coinChoice(
  correct: MoneyPiece,
  wrong: readonly { piece: MoneyPiece; feedback: string }[],
): ChoiceAnswer {
  const options: Omit<ChoiceOption, 'id'>[] = [
    { label: pieceName(correct), correct: true, pieces: [correct] },
    ...wrong.map((w) => ({ label: pieceName(w.piece), pieces: [w.piece], feedback: w.feedback })),
  ];
  options.sort((x, y) => (x.pieces?.[0] ?? 0) - (y.pieces?.[0] ?? 0));
  return {
    type: 'choice',
    layout: 'coins',
    shuffle: false,
    options: options.map((o, i) => ({ ...o, id: 'abcd'.charAt(i) })),
  };
}

// ---------- K1 Tintenfleck ----------

function k1(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  readBind(opts, []);
  return retry(() => {
    const step = cfg.money.step;
    const wholeEuro = !cfg.money.useCents || rng() < 0.5;
    const maxEuro = Math.floor(cfg.money.maxPrice / 100);
    const b = wholeEuro
      ? maxEuro >= 2
        ? randomInt(rng, 2, maxEuro) * 100
        : null
      : randomAmount(rng, cfg, 2 * step, cfg.money.maxPrice);
    if (b === null) return null;
    const a = randomAmount(rng, cfg, step, b - step);
    if (a === null || 2 * a === b) return null;
    const missing = b - a;
    const minus = rng() < 0.5;
    const steps = countUp(a, b);
    const line = minus ? `${tok(b)} − ▢ = ${tok(a)}` : `${tok(a)} + ▢ = ${tok(b)}`;
    return makeTask(
      cfg,
      'Der Tintenfleck',
      { kind: 'note', lines: [line] },
      'Im Piratenbuch steht eine Rechnung. Eine Zahl ist unter einem Tintenfleck verschwunden.',
      [
        {
          question: 'Welcher Betrag ist unter dem Fleck?',
          answer: { type: 'money', correct: missing },
          mistakes: cleanMistakes(missing, [
            {
              value: a + b,
              feedback: minus
                ? `Du hast ${tok(b)} und ${tok(a)} zusammengezählt. Gesucht ist, was von ${tok(b)} weggenommen wird.`
                : `Du hast ${tok(a)} und ${tok(b)} zusammengezählt. Gesucht ist, was bis ${tok(b)} fehlt.`,
            },
            minus
              ? {
                  value: a,
                  feedback: `${tok(a)} ist das Ergebnis. Gesucht ist der Betrag unter dem Fleck.`,
                }
              : undefined,
            {
              value: missing + 100,
              feedback: `Mit ${tok(missing + 100)} kämst du bis ${tok(b + 100)}. Zähle von ${tok(a)} nur bis ${tok(b)}.`,
            },
          ]),
          hints: minus
            ? [
                `Was fehlt von ${tok(a)} bis ${tok(b)}? Das steht unter dem Fleck.`,
                steps.detail === steps.hints[0] ? `Rechne ${tok(b)} − ${tok(a)}.` : steps.detail,
              ]
            : steps.hints,
          explanation: `${steps.explanation} Unter dem Fleck ${missing === 100 || missing === 1 ? 'steht' : 'stehen'} ${tok(missing)}.`,
        },
      ],
      3,
    );
  }, cfg);
}

// ---------- K2 Rückwärts ----------

function k2(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  readBind(opts, []);
  return retry(() => {
    const x = randomAmount(rng, cfg, cfg.money.step, cfg.money.maxPrice);
    const y = randomAmount(rng, cfg, cfg.money.step, cfg.money.maxPrice);
    if (x === null || y === null || x === y) return null;
    const start = x + y;
    if (start > cfg.money.maxTotal) return null;
    const person = chooseName(rng);
    const add = addSteps(y, x);
    return makeTask(
      cfg,
      `${genitiv(person.name)} Beutel`,
      {
        kind: 'note',
        lines: [`Ausgegeben: ${tok(x)}`, `Noch im Beutel: ${tok(y)}`, 'Am Anfang: ▢'],
      },
      `${person.name} hatte Geld im Beutel. ${cap(person.pron)} hat ${tok(x)} ausgegeben. Jetzt hat ${person.pron} noch ${tok(y)}.`,
      [
        {
          question: 'Wie viel Geld war am Anfang im Beutel?',
          answer: { type: 'money', correct: start },
          mistakes: cleanMistakes(start, [
            {
              value: Math.abs(x - y),
              feedback: `Am Anfang war mehr Geld im Beutel, nicht weniger. ${person.name} hat ja etwas ausgegeben.`,
            },
            add.carry
              ? {
                  value: start - 100,
                  feedback: `Rechne die Cent noch einmal: ${String(y % 100)} Cent + ${String(x % 100)} Cent.`,
                }
              : undefined,
            { value: start + 100, feedback: 'Zähle die Euro noch einmal.' },
          ]),
          hints: [
            'Leg das ausgegebene Geld in Gedanken zurück in den Beutel.',
            `Rechne ${tok(y)} + ${tok(x)}.`,
          ],
          explanation: `${tok(y)} + ${tok(x)} = ${tok(start)}. So viel war am Anfang im Beutel.`,
          praise: 'Toll! Du hast rückwärts gerechnet.',
        },
      ],
      4,
    );
  }, cfg);
}

// ---------- K3 Münzrätsel ----------

function k3(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  readBind(opts, []);
  const pieces = piecesFor(cfg).sort((a, b) => a - b);
  // Paare (u, o) mit genau einem erlaubten Stück dazwischen (docs/05 4.7).
  const triples = pieces.slice(0, -2).map((u, i) => ({
    i,
    u,
    m: pieces[i + 1] ?? u,
    o: pieces[i + 2] ?? u,
  }));
  if (triples.length === 0) return 'unsupported';
  const { i, u, m, o } = pick(rng, triples);
  const notes = withNotes(cfg);
  const what = notes ? 'Ich bin eine Münze oder ein Schein' : 'Ich bin eine Münze';
  const ask = notes ? 'Was bin ich?' : 'Welche bin ich?';
  const wanted = notes ? 'Das gesuchte Geld' : 'Die gesuchte Münze';
  const wrong = [
    {
      piece: u,
      feedback: `${wanted} ist mehr wert als ${tok(u)}. ${cap(pieceDef(u))} passt also nicht.`,
    },
    {
      piece: o,
      feedback: `${wanted} ist weniger wert als ${tok(o)}. ${cap(pieceDef(o))} passt also nicht.`,
    },
  ];
  const below = pieces[i - 1];
  const above = pieces[i + 3];
  const outside = [
    ...(below === undefined
      ? []
      : [{ piece: below, feedback: `${amountIs(below)} weniger als ${tok(u)}.` }]),
    ...(above === undefined
      ? []
      : [{ piece: above, feedback: `${amountIs(above)} mehr als ${tok(o)}.` }]),
  ];
  const extra = outside.length > 1 && rng() < 0.5 ? outside.reverse() : outside;
  const options = [...wrong, ...extra].slice(0, cfg.choiceCount - 1);
  const noun = notes ? 'Münzen und Scheine liegen' : 'Münzen liegen';
  return makeTask(
    cfg,
    'Das Münzrätsel',
    { kind: 'none' },
    `${what}, mehr wert als ${tok(u)}, aber weniger als ${tok(o)}. ${ask}`,
    [
      {
        question: notes
          ? 'Tippe die richtige Münze oder den richtigen Schein an.'
          : 'Tippe die richtige Münze an.',
        answer: coinChoice(m, options),
        hints: [
          `Welche ${noun} zwischen ${tok(u)} und ${tok(o)}?`,
          notes
            ? `Zwischen ${tok(u)} und ${tok(o)} gibt es nur ein einziges Geldstück.`
            : `Zwischen ${tok(u)} und ${tok(o)} gibt es nur eine einzige Münze.`,
        ],
        explanation: `${cap(pieceDef(m))}: ${amountIs(m)} mehr als ${tok(u)} und weniger als ${tok(o)}.`,
      },
    ],
    3,
  );
}

// ---------- K4 Zwei Münzen ----------

function k4(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  readBind(opts, []);
  const palette = piecesFor(cfg).sort((a, b) => b - a);
  // Beträge, die sich mit genau zwei Stücken auf genau eine Art legen lassen.
  const pairs = new Map<Cents, [MoneyPiece, MoneyPiece][]>();
  palette.forEach((x, i) => {
    palette.slice(i).forEach((y) => {
      const sum = x + y;
      pairs.set(sum, [...(pairs.get(sum) ?? []), [x, y]]);
    });
  });
  const targets = [...pairs]
    .filter(
      ([sum, list]) => list.length === 1 && sum % cfg.money.step === 0 && sum <= cfg.money.maxTotal,
    )
    .map(([sum, list]) => ({ sum, pair: list[0] ?? [0, 0] }));
  if (targets.length === 0) return 'unsupported';
  const { sum, pair } = pick(rng, targets);
  const [big, small] = pair as [MoneyPiece, MoneyPiece];
  const notes = withNotes(cfg);
  const noun = notes ? 'Münzen oder Scheine' : 'Münzen';
  return makeTask(
    cfg,
    notes ? 'Genau zwei Geldstücke' : 'Genau zwei Münzen',
    { kind: 'none' },
    `Kiko sagt: „Gib mir genau zwei ${noun}. Zusammen sollen sie ${tok(sum)} wert sein.“`,
    [
      {
        question: `Welche zwei ${noun} passen?`,
        answer: { type: 'pay', target: sum, palette, showTotal: false, exactCount: 2 },
        hints: [
          `Eine davon ist ${isNote(big) ? 'ein' : 'eine'} ${pieceName(big)}.`,
          `${tok(big)} ${big === 100 ? 'ist' : 'sind'} schon da. Was fehlt noch bis ${tok(sum)}?`,
        ],
        explanation: `${tok(big)} + ${tok(small)} = ${tok(sum)}. Mit zwei ${notes ? 'Münzen oder Scheinen' : 'Münzen'} geht es nur so.`,
      },
    ],
    4,
  );
}

// ---------- K5 Doppelt ----------

function k5(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  const force = readForce(opts, ['zweiteilig']);
  const bind = readBind(opts, ['A', 'B']);
  const twoParts = force.zweiteilig === true && cfg.maxSteps >= 2;
  return retry(() => {
    const a = chooseItem(rng, cfg, bind.A, bind.B === undefined ? [] : [bind.B]);
    if (!a) return null;
    const pa = randomPrice(rng, cfg, a);
    if (pa === null) return null;
    const double = 2 * pa;
    const total = 3 * pa;
    if (double > cfg.money.maxPrice || total > cfg.money.maxTotal) return null;
    // B: eine Sache, zu der der doppelte Preis passt.
    let b: Item | null;
    if (bind.B !== undefined) {
      b = chooseItem(rng, cfg, bind.B);
    } else {
      const fitting = ITEMS.filter((item) => {
        const range = item.prices[cfg.id];
        return item.id !== a.id && range !== undefined && range[0] <= double && double <= range[1];
      });
      b = fitting.length === 0 ? null : pick(rng, fitting);
    }
    if (!b || b.id === a.id) return null;
    const scene = {
      kind: 'items' as const,
      items: [
        { itemId: a.id, label: a.name, price: pa },
        { itemId: b.id, label: b.name },
      ],
    };
    const story = `${cap(a.nom)} kostet ${tok(pa)}. ${cap(b.nom)} kostet doppelt so viel.`;
    const onlyB = {
      value: double,
      feedback: `${tok(double)} kostet ${b.def} allein. Dazu kommt noch ${a.def}.`,
    };
    const halfB =
      (pa / 2) % cfg.money.step === 0
        ? {
            value: pa + pa / 2,
            feedback: 'Doppelt so viel heißt: zweimal so viel, nicht die Hälfte.',
          }
        : undefined;
    const totalPart = {
      question: 'Wie viel kosten beide zusammen?',
      answer: { type: 'money' as const, correct: total },
    };
    if (!twoParts) {
      return makeTask(
        cfg,
        'Doppelt so viel',
        scene,
        story,
        [
          {
            ...totalPart,
            mistakes: cleanMistakes(total, [
              onlyB,
              { value: 2 * pa, feedback: onlyB.feedback },
              halfB,
              {
                value: 4 * pa,
                feedback: `${cap(a.def)} zählt nur einmal. Rechne ${tok(pa)} + ${tok(double)}.`,
              },
            ]),
            hints: [
              `Doppelt heißt: zweimal. ${cap(b.def)} kostet ${tok(pa)} + ${tok(pa)}.`,
              `${cap(b.def)} kostet ${tok(double)}. Rechne jetzt ${tok(pa)} + ${tok(double)}.`,
            ],
            explanation: `${cap(b.def)} kostet ${tok(pa)} + ${tok(pa)} = ${tok(double)}. Zusammen: ${tok(pa)} + ${tok(double)} = ${tok(total)}.`,
          },
        ],
        4,
      );
    }
    const add = addSteps(pa, double);
    return makeTask(
      cfg,
      'Doppelt so viel',
      scene,
      story,
      [
        {
          question: `Wie viel kostet ${b.def}?`,
          answer: { type: 'money', correct: double },
          mistakes: cleanMistakes(double, [
            { value: pa, feedback: `Doppelt so viel heißt: zweimal so viel wie ${a.def}.` },
            halfB,
          ]),
          hints: ['Doppelt heißt: zweimal.', `Rechne ${tok(pa)} + ${tok(pa)}.`],
          explanation: `${tok(pa)} + ${tok(pa)} = ${tok(double)}. ${cap(b.def)} kostet ${tok(double)}.`,
        },
        {
          ...totalPart,
          mistakes: cleanMistakes(total, [
            onlyB,
            {
              value: 4 * pa,
              feedback: `${cap(a.def)} zählt nur einmal. Rechne ${tok(pa)} + ${tok(double)}.`,
            },
          ]),
          hints: [`Rechne ${tok(pa)} + ${tok(double)}.`, add.hints[1]],
          explanation: `${tok(pa)} + ${tok(double)} = ${tok(total)}.`,
          praise: 'Wow! Das war ein richtig schweres Rätsel.',
        },
      ],
      5,
    );
  }, cfg);
}

// ---------- K6 Welche Münze fehlt? ----------

function k6(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  const bind = readBind(opts, ['A']);
  const notes = withNotes(cfg);
  const missingPalette = piecesFor(cfg).sort((a, b) => a - b);
  return retry(() => {
    const missing = pick(rng, missingPalette);
    // Geld in der Hand: 2–3 Stücke, zusammen mit dem fehlenden Stück genau der Preis.
    const handCount = randomInt(rng, 2, 3);
    const hand = Array.from({ length: handCount }, () => pick(rng, cfg.money.pieces)).sort(
      (x, y) => y - x,
    );
    const have = hand.reduce((s, p) => s + p, 0);
    const price = have + missing;
    if (price > cfg.money.maxPrice || price % cfg.money.step !== 0) return null;
    // Eine Sache, zu deren Preisbereich der Preis passt.
    const fits = (item: Item) => {
      const range = item.prices[cfg.id];
      return range !== undefined && range[0] <= price && price <= range[1];
    };
    const candidates = bind.A === undefined ? ITEMS.filter(fits) : [itemById(bind.A)].filter(fits);
    if (candidates.length === 0) return null;
    const a = pick(rng, candidates);
    // Gierig gelegt, damit das Geld in der Hand „natürlich“ aussieht (keine 5 + 5 statt 10).
    const natural = greedy(have, cfg.money.pieces);
    if (natural?.length !== hand.length) return null;
    const idx = missingPalette.indexOf(missing);
    const neighbours = missingPalette
      .map((p, i) => ({ p, d: Math.abs(i - idx) }))
      .filter((n) => n.p !== missing)
      .sort((x, y) => x.d - y.d || x.p - y.p)
      .slice(0, cfg.choiceCount - 1)
      .map(({ p }) => ({
        piece: p,
        feedback:
          p < missing
            ? `Mit ${tok(p)} hättest du ${tok(have + p)}. Es fehlt mehr.`
            : `Mit ${tok(p)} hättest du ${tok(have + p)}. Das ist ${tok(p - missing)} zu viel.`,
      }));
    return makeTask(
      cfg,
      notes ? 'Ein Geldstück fehlt' : 'Eine Münze fehlt',
      { kind: 'items', items: [{ itemId: a.id, label: a.name, price }], hand },
      `${cap(a.nom)} kostet ${tok(price)}. Du hast ${piecesInWords(hand)}.`,
      [
        {
          question: notes
            ? 'Welche Münze oder welcher Schein fehlt dir noch, damit du genau bezahlen kannst?'
            : 'Welche Münze fehlt dir noch, damit du genau bezahlen kannst?',
          answer: coinChoice(missing, neighbours),
          hints: [
            `Zähle zuerst dein Geld: ${piecesSum(hand)}.`,
            `Du hast ${tok(have)}. Wie viel fehlt bis ${tok(price)}?`,
          ],
          explanation: `${piecesSum(hand)} = ${tok(have)}. Bis ${tok(price)} ${fehlen(missing)} ${tok(missing)}.`,
        },
      ],
      3,
    );
  }, cfg);
}

// ---------- K7 Fehlendes Geld legen ----------

/** Fehlbetrag höchstens 2 €, auf Stufe 4 höchstens 5 € (docs/05 Anhang A, K7). */
function maxMissing(cfg: StufeConfig): Cents {
  return cfg.id === 4 ? 500 : 200;
}

function k7(cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' {
  readForce(opts, []);
  const bind = readBind(opts, ['A']);
  const palette = coinsOf(cfg)
    .filter((p) => p % cfg.money.step === 0)
    .sort((a, b) => b - a);
  return retry(() => {
    const a = chooseItem(rng, cfg, bind.A);
    if (!a) return null;
    const price = randomPrice(rng, cfg, a);
    if (price === null) return null;
    const missing = randomAmount(
      rng,
      cfg,
      cfg.money.step,
      Math.min(maxMissing(cfg), price - cfg.money.step),
    );
    if (missing === null) return null;
    const have = price - missing;
    const hand = greedy(have, cfg.money.pieces);
    const example = greedy(missing, palette);
    if (!hand || !example) return null;
    const person = chooseName(rng);
    const steps = countUp(have, price);
    return makeTask(
      cfg,
      'Das fehlende Geld',
      { kind: 'items', items: [{ itemId: a.id, label: a.name, price }], hand },
      `${person.name} hat schon ${tok(have)} in der Hand. ${cap(a.nom)} kostet ${tok(price)}.`,
      [
        {
          question: `Lege das Geld, das ${person.name} noch fehlt.`,
          answer: { type: 'pay', target: missing, palette, showTotal: false },
          hints: [`Wie viel fehlt von ${tok(have)} bis ${tok(price)}?`, steps.detail],
          explanation: `${person.name} ${fehlen(missing)} ${tok(missing)}. Zum Beispiel: ${example.length === 1 ? piecesInWords(example) : piecesSum(example)}.`,
        },
      ],
      4,
    );
  }, cfg);
}

/** Vorlagen für das Thema „knobeln“ (docs/05 4.7), leicht → schwer. */
export const KNOBELN_GENERATORS: Generator[] = [
  { id: 'K1', topic: 'knobeln', stufen: [2, 3, 4], generate: k1 },
  { id: 'K2', topic: 'knobeln', stufen: [2, 3, 4], generate: k2 },
  { id: 'K3', topic: 'knobeln', stufen: [2, 3, 4], generate: k3 },
  { id: 'K4', topic: 'knobeln', stufen: [2, 3, 4], generate: k4 },
  { id: 'K5', topic: 'knobeln', stufen: [3, 4], generate: k5 },
  { id: 'K6', topic: 'knobeln', stufen: [2, 3, 4], generate: k6 },
  { id: 'K7', topic: 'knobeln', stufen: [2, 3, 4], generate: k7 },
];
