import { pick, randomInt, type Rng } from '@/domain/random';
import type {
  BalanceSide,
  ChoiceOption,
  MoneyPiece,
  Scene,
  StufeConfig,
  Task,
} from '@/domain/types';
import { cap, makeTask, readBind, readForce, tok, yesNo } from '../build';
import { STILL_THINGS, thingById, type ThingWords } from '../generators/mengen-zahlen-parts';
import {
  isNote,
  pieceName,
  piecePlural,
  plusTokens,
  sortDesc,
  sumOf,
  verb,
} from '../generators/muenzen-zaehlen-parts';
import type { Generator } from '../types';
import { paramsFor, riddleStufen } from './params';
import { attempt, pickWrong, toMistakes, valueCards } from './shared';

// Waage (docs/10): Auf beiden Seiten soll gleich viel liegen. Was fehlt? Oder: Ist es gleich?

type Frage = 'gleich' | 'fehlt';
type Side = 'links' | 'rechts';

/** Erlaubte Stücke für die Waage: im Stufenschritt, eins allein passt in `maxTotal`. */
function palette(cfg: StufeConfig): MoneyPiece[] {
  return cfg.money.pieces
    .filter((p) => p % cfg.money.step === 0 && p <= cfg.money.maxTotal)
    .sort((a, b) => a - b);
}

/** „2 Cent und 2 Cent und 1 Cent sind 5 Cent“ (Stufe 1) bzw. „50 Cent + 20 Cent = 70 Cent“. */
function sumText(cfg: StufeConfig, pieces: readonly MoneyPiece[]): string {
  const total = sumOf(pieces);
  if (pieces.length === 1) return tok(total);
  return cfg.money.centOnly
    ? `${pieces.map((p) => tok(p)).join(' und ')} ${verb(total)} ${tok(total)}`
    : `${plusTokens(pieces)} = ${tok(total)}`;
}

function randomPieces(rng: Rng, from: readonly MoneyPiece[], min: number, max: number) {
  return sortDesc(Array.from({ length: randomInt(rng, min, max) }, () => pick(rng, from)));
}

/** Zufällige Zerlegung von `total` in min–max Stücke (oder null). */
function decompose(
  rng: Rng,
  total: number,
  from: readonly MoneyPiece[],
  min: number,
  max: number,
): MoneyPiece[] | null {
  return attempt(30, () => {
    const result: MoneyPiece[] = [];
    let rest = total;
    while (rest > 0 && result.length < max) {
      // Das letzte Stück muss den Rest genau treffen.
      const fitting = from.filter((p) => p <= rest && (result.length < max - 1 || p === rest));
      if (fitting.length === 0) return null;
      const piece = pick(rng, fitting);
      result.push(piece);
      rest -= piece;
    }
    return rest === 0 && result.length >= min ? sortDesc(result) : null;
  });
}

function sameSet(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && [...a].sort().join() === [...b].sort().join();
}

function sides(
  heavy: Side,
  full: BalanceSide,
  light: BalanceSide,
): Pick<Extract<Scene, { kind: 'balance' }>, 'left' | 'right'> {
  return heavy === 'links' ? { left: full, right: light } : { left: light, right: full };
}

// ---------- Mengen (Muscheln …) ----------

function objectsFehlt(
  cfg: StufeConfig,
  rng: Rng,
  thing: ThingWords,
  max: number,
  antwort: 'choice' | 'number',
): Task {
  const total = randomInt(rng, 2, max);
  const missing = randomInt(rng, 1, total - 1);
  const have = total - missing;
  const heavy: Side = rng() < 0.5 ? 'links' : 'rechts';
  const light: Side = heavy === 'links' ? 'rechts' : 'links';
  const plural = thing.plural;
  const many = (n: number) => (n === 1 ? thing.singular : plural);
  const candidates =
    antwort === 'choice'
      ? [
          {
            value: missing + 1,
            feedback: `Dann wären es ${light} ${String(total + 1)}. Das ist eins zu viel.`,
          },
          {
            value: missing - 1,
            feedback: `Dann wären es ${light} ${String(total - 1)}. Das ist eins zu wenig.`,
          },
          {
            value: missing + 2,
            feedback: `Dann wären es ${light} ${String(total + 2)}. Das ist zu viel.`,
          },
        ]
      : [
          {
            value: total,
            feedback: `${cap(light)} ${have === 1 ? 'liegt' : 'liegen'} schon ${String(have)}. Wie viele fehlen bis ${String(total)}?`,
          },
          {
            value: total + have,
            feedback: `${cap(light)} sollen es so viele sein wie ${heavy}, also ${String(total)}.`,
          },
        ];
  const wrong = pickWrong(
    missing,
    candidates,
    antwort === 'choice' ? cfg.choiceCount - 1 : 2,
    { min: 1, max: cfg.numbers.max, unit: 1 },
    String,
  );
  return makeTask(
    cfg,
    'Was muss dazu?',
    {
      kind: 'balance',
      ...sides(
        heavy,
        { objects: { itemId: thing.id, count: total } },
        { objects: { itemId: thing.id, count: have }, unknown: 1 },
      ),
    },
    `${cap(heavy)} liegen mehr ${plural}. Die Wippe kippt.`,
    [
      {
        question: `Wie viele ${plural} müssen ${light} noch dazu?`,
        answer:
          antwort === 'choice'
            ? valueCards(missing, wrong, String)
            : { type: 'number', correct: missing },
        ...(antwort === 'number' && wrong.length > 0 ? { mistakes: toMistakes(wrong) } : {}),
        hints: [
          `${cap(heavy)} sind ${String(total)} ${plural}. ${cap(light)} sollen es auch ${String(total)} werden.`,
          `${cap(light)} ${have === 1 ? 'ist' : 'sind'} schon ${String(have)}. Zähle weiter bis ${String(total)}.`,
        ],
        explanation: `${String(have)} und ${String(missing)} sind ${String(total)}. ${cap(light)} ${missing === 1 ? 'kommt' : 'kommen'} ${String(missing)} ${many(missing)} dazu.`,
      },
    ],
    2,
  );
}

function objectsGleich(cfg: StufeConfig, rng: Rng, thing: ThingWords, max: number): Task {
  const equal = rng() < 0.5;
  const left = randomInt(rng, equal ? 1 : 2, max);
  const right = equal
    ? left
    : pick(
        rng,
        [left - 1, left - 2, left + 1, left + 2].filter((n) => n >= 1 && n <= max),
      );
  const plural = thing.plural;
  const answer = yesNo('Ja', 'Nein', equal, {
    yes: `Zähle beide Seiten. Links ${left === 1 ? 'ist' : 'sind'} ${String(left)}. Und rechts?`,
    no: `Zähle beide Seiten. Links ${left === 1 ? 'ist' : 'sind'} ${String(left)}. Und rechts?`,
  });
  return makeTask(
    cfg,
    'Ist die Wippe gerade?',
    {
      kind: 'balance',
      left: { objects: { itemId: thing.id, count: left } },
      right: { objects: { itemId: thing.id, count: right } },
    },
    `Auf der Wippe liegen ${plural}.`,
    [
      {
        question: `Liegen auf beiden Seiten gleich viele ${plural}?`,
        answer,
        hints: [
          'Zähle zuerst links, dann rechts.',
          `Links ${left === 1 ? 'ist' : 'sind'} ${String(left)}. Wie viele sind rechts?`,
        ],
        explanation: equal
          ? `Links ${String(left)}, rechts ${String(right)}. Das ist gleich viel. Die Wippe ist gerade.`
          : `Links ${String(left)}, rechts ${String(right)}. Das ist nicht gleich viel. Die Wippe kippt nach ${left > right ? 'links' : 'rechts'}.`,
      },
    ],
    2,
  );
}

// ---------- Geld ----------

function moneyGleich(cfg: StufeConfig, rng: Rng): Task | null {
  const pieces = palette(cfg);
  const max = cfg.money.maxTotal;
  const equal = rng() < 0.5;
  const built = attempt(80, () => {
    const left = randomPieces(rng, pieces, 1, 2);
    const l = sumOf(left);
    // Ungleich: um ein kleineres Stück mehr oder weniger.
    const smaller = pieces.filter((p) => 2 * p <= l);
    if (!equal && smaller.length === 0) return null;
    const delta = equal ? 0 : pick(rng, smaller) * (rng() < 0.5 ? 1 : -1);
    const right = decompose(rng, l + delta, pieces, 2, 3);
    if (!right || l > max || l + delta > max || sameSet(left, right)) return null;
    return { left, right, l, r: l + delta };
  });
  if (!built) return null;
  const { left, right, l, r } = built;
  const swap = rng() < 0.5;
  const [a, b] = swap ? [right, left] : [left, right];
  const [la, lb] = swap ? [r, l] : [l, r];
  const notes = [...a, ...b].some(isNote);
  const hint = `Zähle beide Seiten. Links ${verb(la)} ${tok(la)}. Und rechts?`;
  return makeTask(
    cfg,
    'Ist die Wippe gerade?',
    { kind: 'balance', left: { pieces: a }, right: { pieces: b } },
    notes ? 'Auf der Wippe liegt Geld.' : 'Auf der Wippe liegen Münzen.',
    [
      {
        question: 'Liegt auf beiden Seiten gleich viel Geld?',
        answer: yesNo('Ja', 'Nein', equal, { yes: hint, no: hint }),
        hints: [
          'Rechne zuerst links zusammen, dann rechts.',
          `Links ${verb(la)} ${tok(la)}. Wie viel ist rechts?`,
        ],
        explanation: `Links: ${sumText(cfg, a)}. Rechts: ${sumText(cfg, b)}. ${
          equal
            ? 'Das ist gleich viel. Die Wippe ist gerade.'
            : `Das ist nicht gleich viel. Die Wippe kippt nach ${la > lb ? 'links' : 'rechts'}.`
        }`,
      },
    ],
    2,
  );
}

function moneyFehlt(cfg: StufeConfig, rng: Rng, twoEqual: boolean): Task | null {
  const pieces = palette(cfg);
  const max = cfg.money.maxTotal;
  // Stufe 4: zwei gleiche Münzen (keine Scheine, docs/10 Abschnitt 4).
  const missingPalette = twoEqual ? pieces.filter((p) => !isNote(p)) : pieces;
  const count = twoEqual ? 2 : 1;
  const built = attempt(120, () => {
    const missing = pick(rng, missingPalette);
    const light = randomPieces(rng, pieces, 1, 2);
    const have = sumOf(light);
    const total = have + count * missing;
    if (total > max) return null;
    // Die volle Seite anders legen als „leichte Seite + fehlendes Stück“.
    const full = decompose(rng, total, pieces, 1, 3);
    if (!full || sameSet(full, [...light, ...Array<MoneyPiece>(count).fill(missing)])) return null;
    return { missing, light, have, total, full };
  });
  if (!built) return null;
  const { missing, light, have, total, full } = built;
  const heavy: Side = rng() < 0.5 ? 'links' : 'rechts';
  const lightSide: Side = heavy === 'links' ? 'rechts' : 'links';
  const label = (p: MoneyPiece) => (twoEqual ? `zwei ${piecePlural(p)}` : pieceName(p));
  const at = missingPalette.indexOf(missing);
  const neighbours = missingPalette
    .map((p, i) => ({ p, d: Math.abs(i - at) }))
    .filter((n) => n.p !== missing)
    .sort((x, y) => x.d - y.d || x.p - y.p)
    .slice(0, cfg.choiceCount - 1)
    .map(({ p }) => p);
  const options = [missing, ...neighbours]
    .sort((x, y) => x - y)
    .map((p, i): ChoiceOption => {
      const base = {
        id: 'abcd'.charAt(i),
        label: label(p),
        pieces: Array<MoneyPiece>(count).fill(p),
      };
      if (p === missing) return { ...base, correct: true };
      const would = have + count * p;
      return {
        ...base,
        feedback: `Dann wären es ${lightSide} ${tok(would)}. Das ist zu ${would > total ? 'viel' : 'wenig'}.`,
      };
    });
  const allCoins = options.every((o) => !(o.pieces ?? []).some(isNote));
  const question = twoEqual
    ? `Welche zwei gleichen Münzen fehlen ${lightSide}?`
    : allCoins
      ? `Welche Münze fehlt ${lightSide}?`
      : `Was fehlt ${lightSide}?`;
  const notes = [...full, ...light].some(isNote);
  const diff = count * missing;
  const explanation = twoEqual
    ? `${tok(total)} − ${tok(have)} = ${tok(diff)}. Das sind zwei ${piecePlural(missing)}: ${tok(missing)} + ${tok(missing)}.`
    : cfg.money.centOnly
      ? `${[...light, missing].map((p) => tok(p)).join(' und ')} ${verb(total)} ${tok(total)}. Es fehlt die ${pieceName(missing)}.`
      : `${tok(total)} − ${tok(have)} = ${tok(diff)}. Es fehlt ${isNote(missing) ? 'der' : 'die'} ${pieceName(missing)}.`;
  return makeTask(
    cfg,
    twoEqual ? 'Zwei gleiche Münzen' : 'Die Münzwippe',
    {
      kind: 'balance',
      ...sides(heavy, { pieces: full }, { pieces: light, unknown: count }),
    },
    notes ? 'Auf der Wippe liegt Geld.' : 'Auf der Wippe liegen Münzen.',
    [
      {
        question,
        answer: { type: 'choice', layout: 'coins', shuffle: false, options },
        hints: [
          'Auf beiden Seiten muss gleich viel liegen.',
          `${cap(heavy)} ${verb(total)} ${tok(total)}. ${cap(lightSide)} ${verb(have)} schon ${tok(have)}. Was fehlt noch?`,
        ],
        explanation,
      },
    ],
    2,
  );
}

export const balance: Generator = {
  id: 'balance',
  topic: 'raetsel',
  stufen: riddleStufen('balance'),
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['frage', 'geld', 'antwort']);
    readBind(opts, []);
    const { frage, geld, antwort } = force;
    if (frage !== undefined && frage !== 'gleich' && frage !== 'fehlt')
      throw new Error('balance: frage');
    if (geld !== undefined && typeof geld !== 'boolean') throw new Error('balance: geld');
    if (antwort !== undefined && antwort !== 'choice' && antwort !== 'number')
      throw new Error('balance: antwort');
    if (!cfg.riddles.types.includes('balance')) return 'unsupported';
    const p = paramsFor(cfg).balance;
    const objectsMax = Math.min(p.objectsMax, cfg.numbers.max);
    const which: Frage = frage ?? 'fehlt';
    // Mengen nur, wo die Stufe sie vorsieht; `antwort: 'number'` meint Mengen (B4.2).
    const money =
      geld ??
      (antwort === 'number'
        ? false
        : !p.objectsByDefault || objectsMax < 2 || rng() < cfg.riddles.moneyShare);
    if (!money && objectsMax < 2) return 'unsupported';
    if (money && antwort === 'number') return 'unsupported';
    if (which === 'gleich') {
      if (antwort === 'number') return 'unsupported';
      if (!cfg.answerTypes.includes('choice')) return 'unsupported';
      if (money) return moneyGleich(cfg, rng) ?? 'unsupported';
      return objectsGleich(cfg, rng, thingById(pick(rng, STILL_THINGS)), objectsMax);
    }
    if (money) {
      if (!cfg.answerTypes.includes('choice')) return 'unsupported';
      return moneyFehlt(cfg, rng, p.twoEqual) ?? 'unsupported';
    }
    const kind = antwort ?? (rng() < 0.5 ? 'choice' : 'number');
    if (!cfg.answerTypes.includes(kind)) return 'unsupported';
    return objectsFehlt(cfg, rng, thingById(pick(rng, STILL_THINGS)), objectsMax, kind);
  },
};
