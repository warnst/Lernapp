import { ITEMS } from '@/content/items';
import { pick, randomInt, type Rng } from '@/domain/random';
import type {
  Answer,
  Cents,
  ChoiceAnswer,
  ChoiceOption,
  MoneyPiece,
  OrderEntry,
  Stufe,
  StufeConfig,
} from '@/domain/types';
import { choice, makeTask, mix, readBind, readForce, tok } from '../build';
import { type Distractor, countStep, euroOff, selectDistractors } from '../distractors';
import type { Generator } from '../types';
import { SYMBOLS } from './mengen-zahlen-parts';
import {
  isNote,
  literalEur,
  pieceAkkDef,
  pieceName,
  pieceNom,
  piecePlural,
  plusTokens,
  printed,
  pursePalette,
  randomPieces,
  sortDesc,
  sumOf,
  trapsFor,
  validMistakes,
  valueLabel,
  verb,
} from './muenzen-zaehlen-parts';

// Vorlagen für das Thema „muenzen-zaehlen“ (docs/05 4.1, Anhang A und B; Varianten in docs/09 5.2 und docs/11).

function attempt<T>(tries: number, fn: () => T | null): T | null {
  for (let i = 0; i < tries; i++) {
    const result = fn();
    if (result !== null) return result;
  }
  return null;
}

// ---------- C1: Tippe die Münze an ----------

const C1: Generator = {
  id: 'C1',
  topic: 'muenzen-zaehlen',
  stufen: [1, 2],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['euro']);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('choice')) return 'unsupported';
    const pieces = cfg.money.pieces;
    const targets =
      force.euro === true ? pieces.filter((p) => p === 100 || p === 200) : [...pieces];
    if (targets.length === 0) return 'unsupported';
    const target = pick(rng, targets);
    // Keine zwei Stücke mit derselben Zahl (2 Cent / 2 €), sonst passt der Hinweis nicht.
    const others: MoneyPiece[] = [];
    for (const p of mix(rng, pieces)) {
      if (others.length >= cfg.choiceCount - 1) break;
      if ([target, ...others].some((q) => printed(q) === printed(p))) continue;
      others.push(p);
    }
    if (others.length < cfg.choiceCount - 1) return 'unsupported';
    const name = pieceName(target);
    const note = isNote(target);
    const wanted = note
      ? `den Schein mit der ${String(printed(target))}`
      : `die Münze mit der ${String(printed(target))}`;
    const wrong = others.map((p) => ({
      label: pieceName(p),
      pieces: [p],
      feedback: `Auf ${isNote(p) ? 'diesem Schein' : 'dieser Münze'} steht ${String(printed(p))}. Suche ${wanted}.`,
    }));
    const euroCoin = target === 100 || target === 200;
    const colors = target === 100 ? 'innen silbern, außen golden' : 'innen golden, außen silbern';
    const hints: [string, string] = euroCoin
      ? ['Schau dir die Farben der Münzen genau an.', `Die ${name} hat zwei Farben: ${colors}.`]
      : note
        ? ['Schau auf die Zahl auf dem Schein.', `Suche die Zahl ${String(printed(target))}.`]
        : [
            'Schau auf die Zahl in der Mitte der Münze.',
            `Suche die Zahl ${String(printed(target))}.`,
          ];
    const explanation = euroCoin
      ? `Die ${name} ist ${target === 100 ? 'innen silbern und außen golden' : 'innen golden und außen silbern'}.`
      : note
        ? `Auf dem ${name} steht eine ${String(printed(target))}.`
        : `Die ${name} hat eine ${String(printed(target))} in der Mitte.`;
    return makeTask(
      cfg,
      `${note ? 'Der' : 'Die'} ${name}`,
      { kind: 'none' },
      note ? 'Kiko sucht einen bestimmten Schein.' : 'Kiko sucht eine bestimmte Münze.',
      [
        {
          question: `Tippe ${pieceAkkDef(target)} an.`,
          answer: choice({ label: name, pieces: [target] }, wrong, cfg.choiceCount, 'coins'),
          hints,
          explanation,
        },
      ],
      1,
    );
  },
};

// ---------- C2: Welche Münze ist mehr wert? ----------

const C2: Generator = {
  id: 'C2',
  topic: 'muenzen-zaehlen',
  stufen: [1, 2],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('choice')) return 'unsupported';
    const traps = trapsFor(cfg);
    // In mindestens jeder zweiten Aufgabe ist die größere Münze weniger wert (docs/05 Anhang B).
    const trap = traps.length > 0 && rng() < 0.6;
    let pair: [MoneyPiece, MoneyPiece];
    if (trap) {
      pair = pick(rng, traps);
    } else {
      const sorted = [...cfg.money.pieces].sort((a, b) => a - b);
      const pairs = sorted.flatMap((a, i) =>
        sorted
          .slice(i + 1)
          .filter((b) => !traps.some(([x, y]) => x === a && y === b))
          .map((b): [MoneyPiece, MoneyPiece] => [a, b]),
      );
      if (pairs.length === 0) return 'unsupported';
      pair = pick(rng, pairs);
    }
    const [lo, hi] = pair;
    const notes = pair.filter(isNote).length;
    const story =
      notes === 0
        ? 'Zwei Münzen liegen nebeneinander.'
        : notes === 2
          ? 'Zwei Scheine liegen nebeneinander.'
          : 'Eine Münze und ein Schein liegen nebeneinander.';
    const question =
      notes === 0
        ? 'Welche Münze ist mehr wert?'
        : notes === 2
          ? 'Welcher Schein ist mehr wert?'
          : 'Was ist mehr wert?';
    const more = `${tok(hi)} ${verb(hi)} mehr als ${tok(lo)}`;
    const [first, second] = rng() < 0.5 ? [lo, hi] : [hi, lo];
    return makeTask(
      cfg,
      trap ? 'Groß oder viel?' : 'Was ist mehr wert?',
      { kind: 'none' },
      story,
      [
        {
          question,
          answer: choice(
            { label: pieceName(hi), pieces: [hi] },
            [
              {
                label: pieceName(lo),
                pieces: [lo],
                feedback: trap
                  ? `Die ${pieceName(lo)} ist größer. Aber ${more}!`
                  : `Schau auf die Zahl. ${more}.`,
              },
            ],
            2,
            'coins',
          ),
          hints: [
            trap ? 'Schau nicht auf die Größe. Schau auf die Zahl.' : 'Schau auf die Zahlen.',
            `Was ist mehr: ${tok(first)} oder ${tok(second)}?`,
          ],
          explanation: trap ? `${more}, auch wenn die Münze kleiner ist.` : `${more}.`,
          ...(trap ? { praise: 'Klasse! Du hast auf die Zahl geschaut.' } : {}),
        },
      ],
      1,
    );
  },
};

// ---------- Z1: Wie viel Geld ist das zusammen? ----------

/** Anzahl der Stücke je Stufe (docs/05 4.1). */
const Z1_COUNT: Record<Stufe, [number, number]> = { 1: [2, 3], 2: [2, 4], 3: [3, 5], 4: [4, 6] };

const COUNT_WORDS = ['', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs'];

function z1Distractors(cfg: StufeConfig, coins: readonly MoneyPiece[], sum: Cents): Distractor[] {
  const result: Distractor[] = [];
  const distinct = [...new Set(coins)];
  if (cfg.money.centOnly && coins.length !== sum) {
    result.push({
      value: coins.length,
      feedback: 'Du hast die Münzen gezählt. Schau auf die Zahl auf jeder Münze.',
    });
  }
  for (const p of distinct) {
    const count = coins.filter((c) => c === p).length;
    if (count >= 2) {
      result.push({
        value: sum - p,
        feedback:
          count === 2
            ? `Es liegen zwei ${piecePlural(p)} da. Hast du beide mitgezählt?`
            : `Es liegen ${COUNT_WORDS[count] ?? String(count)} ${piecePlural(p)} da. Hast du alle mitgezählt?`,
      });
    }
  }
  for (const p of distinct) {
    if (p === 10 || p === 20 || p === 50) {
      result.push({
        value: sum - p + p / 10,
        feedback: `Schau genau hin: Das ist ${pieceNom(p)}, keine ${pieceName(p / 10)}.`,
      });
    }
    if (p === 100 || p === 200) {
      result.push({
        value: sum - p + p / 100,
        feedback: `Das ist ${pieceNom(p)}. Sie ist ${tok(p)} wert, nicht ${String(p / 100)} Cent.`,
      });
    }
  }
  if (!cfg.money.centOnly) {
    for (const p of distinct) {
      if (p === 1 || p === 2) {
        result.push({
          value: sum - p + p * 100,
          feedback: `Das ist ${pieceNom(p)}, keine ${pieceName(p * 100)}.`,
        });
      }
    }
    if (sum >= 100) result.push(...euroOff(sum));
  }
  result.push(...countStep(sum, Math.min(...coins)));
  return result;
}

const Z1: Generator = {
  id: 'Z1',
  topic: 'muenzen-zaehlen',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['antwort']);
    readBind(opts, []);
    const forced = force.antwort;
    if (forced !== undefined && forced !== 'choice' && forced !== 'number' && forced !== 'money')
      throw new Error('Z1: antwort');
    const kinds = (cfg.money.centOnly ? ['choice', 'number'] : ['choice', 'money']) as (
      'choice' | 'number' | 'money'
    )[];
    const kind = forced ?? pick(rng, kinds);
    if (!cfg.answerTypes.includes(kind)) return 'unsupported';
    if (kind === 'number' && !cfg.money.centOnly) return 'unsupported';
    const [minCount, maxCount] = Z1_COUNT[cfg.id];
    const palette = cfg.money.pieces.filter(
      (p) => p <= cfg.money.maxPrice && p <= cfg.money.maxTotal,
    );
    if (palette.length === 0) return 'unsupported';
    const limit =
      kind === 'number' ? Math.min(cfg.numbers.max, cfg.money.maxTotal) : cfg.money.maxTotal;
    const coins = attempt(60, () => {
      const drawn = sortDesc(randomPieces(rng, palette, randomInt(rng, minCount, maxCount)));
      const total = sumOf(drawn);
      return total <= limit && total % cfg.money.step === 0 ? drawn : null;
    });
    if (!coins) return 'unsupported';
    const sum = sumOf(coins);
    const biggest = coins[0] ?? sum;
    const hasEuro = coins.some((c) => c >= 100);
    const hasCent = coins.some((c) => c < 100);
    const partial: number[] = [];
    coins.reduce((t, c) => {
      partial.push(t + c);
      return t + c;
    }, 0);
    const tip1 = isNote(biggest)
      ? `Fang mit dem größten Schein an: ${tok(biggest)}.`
      : `Fang mit der größten Münze an: ${tok(biggest)}.`;
    const tip2 =
      hasEuro && hasCent
        ? 'Zähle erst die Euro, dann die Cent.'
        : `Zähle weiter: ${partial.map((t) => (hasEuro ? tok(t) : String(t))).join(', ')}.`;
    const explanation = cfg.money.centOnly
      ? `${coins.map((c) => tok(c)).join(' und ')} ${verb(sum)} ${tok(sum)}.`
      : `${plusTokens(coins)} = ${tok(sum)}.`;
    const candidates = z1Distractors(cfg, coins, sum);
    let answer: Answer;
    let mistakes;
    if (kind === 'choice') {
      const wrong = selectDistractors(sum, candidates, cfg, cfg.choiceCount - 1, 'money');
      answer = choice(
        { label: tok(sum) },
        wrong.map((d) => ({ label: tok(d.value), feedback: d.feedback })),
        cfg.choiceCount,
      );
    } else if (kind === 'number') {
      answer = { type: 'number', correct: sum };
      mistakes = validMistakes(sum, candidates, cfg.numbers.max, 1);
    } else {
      answer = { type: 'money', correct: sum };
      mistakes = validMistakes(sum, candidates, 2 * cfg.money.maxTotal, cfg.money.step);
    }
    return makeTask(
      cfg,
      'Geld zählen',
      { kind: 'coins', pieces: coins },
      'Kiko hat dieses Geld gefunden.',
      [
        {
          question: cfg.money.centOnly
            ? 'Wie viel Cent sind das zusammen?'
            : 'Wie viel Geld ist das zusammen?',
          answer,
          ...(mistakes ? { mistakes } : {}),
          hints: [tip1, tip2],
          explanation,
        },
      ],
      cfg.id === 1 ? 1 : 2,
    );
  },
};

// ---------- Z2: Zwei Beutel ----------

interface Bag {
  icon: string;
  name: string;
  pieces: MoneyPiece[];
  sum: Cents;
}

function bagPhrase(bag: Bag): string {
  return bag.pieces.length === 1
    ? `Im ${bag.name}-Beutel ${verb(bag.sum)} ${tok(bag.sum)}.`
    : `Im ${bag.name}-Beutel sind ${plusTokens(bag.pieces)} = ${tok(bag.sum)}.`;
}

function z2Bags(
  cfg: StufeConfig,
  rng: Rng,
  palette: readonly MoneyPiece[],
  trap: boolean,
): [MoneyPiece[], MoneyPiece[]] | null {
  return attempt(80, () => {
    const max = cfg.money.maxTotal;
    if (trap) {
      const few = sortDesc(randomPieces(rng, palette, randomInt(rng, 1, 2)));
      const rich = sumOf(few);
      const smaller = palette.filter((p) => p < Math.max(...few));
      if (smaller.length === 0) return null;
      const many = sortDesc(randomPieces(rng, smaller, randomInt(rng, 3, 4)));
      const poor = sumOf(many);
      if (rich > max || poor >= rich || 2 * poor < rich) return null;
      return [few, many];
    }
    const a = sortDesc(randomPieces(rng, palette, randomInt(rng, 2, 4)));
    const b = sortDesc(randomPieces(rng, palette, randomInt(rng, 1, 4)));
    const sa = sumOf(a);
    const sb = sumOf(b);
    if (sa === sb || sa > max || sb > max) return null;
    // Keine Falle: Der Beutel mit weniger Stücken hat nicht mehr Geld.
    const [rich, poor] = sa > sb ? [a, b] : [b, a];
    if (rich.length < poor.length || 3 * sumOf(poor) < sumOf(rich)) return null;
    return [rich, poor];
  });
}

const Z2: Generator = {
  id: 'Z2',
  topic: 'muenzen-zaehlen',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['falle']);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('choice')) return 'unsupported';
    const palette = pursePalette(cfg);
    if (palette.length < 2) return 'unsupported';
    const trap = typeof force.falle === 'boolean' ? force.falle : rng() < 0.6;
    const pair = z2Bags(cfg, rng, palette, trap);
    if (!pair) return 'unsupported';
    const [s1, s2] = mix(rng, SYMBOLS);
    if (!s1 || !s2) return 'unsupported';
    const rich: Bag = { icon: s1.icon, name: s1.name, pieces: pair[0], sum: sumOf(pair[0]) };
    const poor: Bag = { icon: s2.icon, name: s2.name, pieces: pair[1], sum: sumOf(pair[1]) };
    const withNotes = poor.pieces.some(isNote);
    const stuck = withNotes ? 'Münzen und Scheine' : 'Münzen';
    const poorFeedback = trap
      ? `Im ${poor.name}-Beutel sind mehr ${stuck}. Aber ist es auch mehr Geld? Zähle nach: ${plusTokens(poor.pieces)}.`
      : poor.pieces.length === 1
        ? `Im ${poor.name}-Beutel ${verb(poor.sum)} nur ${tok(poor.sum)}.`
        : `Zähle den ${poor.name}-Beutel noch einmal: ${plusTokens(poor.pieces)}.`;
    const bags = rng() < 0.5 ? [rich, poor] : [poor, rich];
    const options: ChoiceOption[] = [
      ...bags.map((bag) => ({
        id: '',
        label: `${bag.name}-Beutel`,
        icon: bag.icon,
        pieces: bag.pieces,
        ...(bag === rich ? { correct: true as const } : { feedback: poorFeedback }),
      })),
      {
        id: '',
        label: 'In beiden gleich viel',
        feedback: 'Zähle beide Beutel noch einmal. Ist es wirklich gleich viel?',
      },
    ].map((o, i) => ({ ...o, id: 'abc'.charAt(i) }));
    const answer: ChoiceAnswer = { type: 'choice', layout: 'bags', shuffle: false, options };
    return makeTask(
      cfg,
      'Zwei Beutel',
      { kind: 'none' },
      'Kiko hat zwei Beutel gefunden.',
      [
        {
          question: 'In welchem Beutel ist mehr Geld?',
          answer,
          hints: trap
            ? [
                `Mehr ${stuck} heißt nicht immer mehr Geld.`,
                'Zähle jeden Beutel einzeln. Fang mit dem größten Wert an.',
              ]
            : ['Zähle jeden Beutel einzeln.', 'Fang in jedem Beutel mit dem größten Wert an.'],
          explanation: `${bagPhrase(rich)} ${bagPhrase(poor)} ${tok(rich.sum)} ${verb(rich.sum)} mehr als ${tok(poor.sum)}.`,
          ...(trap
            ? { praise: 'Gut aufgepasst! Wenige Münzen können mehr wert sein als viele.' }
            : {}),
        },
      ],
      1,
    );
  },
};

// ---------- Z3: Münzen der Reihe nach ----------

const Z3: Generator = {
  id: 'Z3',
  topic: 'muenzen-zaehlen',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('order')) return 'unsupported';
    const traps = trapsFor(cfg);
    let chosen: MoneyPiece[];
    let trap: [MoneyPiece, MoneyPiece] | undefined;
    if (traps.length > 0) {
      // Vier Münzen mit „Größenfalle“ (docs/05 4.1).
      trap = pick(rng, traps);
      const coins = cfg.money.pieces.filter((p) => !isNote(p) && !trap?.includes(p));
      chosen = [...trap, ...mix(rng, coins).slice(0, 2)];
    } else {
      // Stufe 2: Euro-Münzen und Scheine.
      chosen = mix(
        rng,
        cfg.money.pieces.filter((p) => p <= cfg.money.maxTotal),
      ).slice(0, 4);
    }
    if (chosen.length < 4) return 'unsupported';
    const coinsOnly = !chosen.some(isNote);
    const entries: OrderEntry[] = mix(rng, chosen).map((p) => ({
      id: `m${String(p)}`,
      label: valueLabel(p),
      value: p,
      piece: p,
    }));
    const sorted = [...chosen].sort((a, b) => a - b);
    const list = `${sorted.map((p) => tok(p)).join(', ')}.`;
    const [small, big] = trap ?? [0, 0];
    return makeTask(
      cfg,
      coinsOnly ? 'Münzen in einer Reihe' : 'Geld in einer Reihe',
      { kind: 'none' },
      coinsOnly ? 'Kiko will seine Münzen ordnen.' : 'Kiko will sein Geld ordnen.',
      [
        {
          question: coinsOnly
            ? 'Tippe die Münzen der Reihe nach an. Fang mit der Münze an, die am wenigsten wert ist.'
            : 'Tippe die Münzen und Scheine der Reihe nach an. Fang mit dem an, was am wenigsten wert ist.',
          answer: { type: 'order', entries, direction: 'asc' },
          hints: trap
            ? [
                'Achtung: Große Münzen sind nicht immer mehr wert. Lies die Zahl auf der Münze.',
                `Die ${pieceName(small)} ist größer als die ${pieceName(big)}, aber weniger wert.`,
              ]
            : [
                'Lies die Zahl auf jeder Münze und auf jedem Schein.',
                'Die Scheine sind hier mehr wert als die Münzen.',
              ],
          explanation: trap
            ? `${list} Die ${pieceName(small)} ist größer als die ${pieceName(big)}. Trotzdem ${verb(big)} ${tok(big)} mehr wert.`
            : list,
          ...(trap
            ? { praise: 'Klasse! Du hast auf die Zahl geschaut und nicht auf die Größe.' }
            : {}),
        },
      ],
      2,
    );
  },
};

// ---------- Z4: Welche Geldbörse passt? ----------

const Z4: Generator = {
  id: 'Z4',
  topic: 'muenzen-zaehlen',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('choice')) return 'unsupported';
    const palette = sortDesc(pursePalette(cfg));
    if (palette.length < 3) return 'unsupported';
    const max = cfg.money.maxTotal;
    const built = attempt(80, () => {
      const right = sortDesc(randomPieces(rng, palette, randomInt(rng, 3, 4)));
      const target = sumOf(right);
      if (target > max) return null;
      // Abweichung um eine Münze: eine fehlt oder eine kommt dazu.
      const i = randomInt(rng, 0, right.length - 1);
      const coinOff =
        rng() < 0.5 ? right.filter((_p, k) => k !== i) : sortDesc([...right, pick(rng, palette)]);
      // Abweichung um einen Schritt: eine Münze ist die nächstkleinere oder nächstgrößere.
      const j = randomInt(rng, 0, right.length - 1);
      const at = right[j] === undefined ? -1 : palette.indexOf(right[j]);
      const neighbour = palette[rng() < 0.5 ? at - 1 : at + 1];
      if (neighbour === undefined) return null;
      const stepOff = sortDesc(right.map((p, k) => (k === j ? neighbour : p)));
      const sums = [target, sumOf(coinOff), sumOf(stepOff)];
      if (new Set(sums).size !== 3 || sums.some((s) => s <= 0 || s > max)) return null;
      return { right, target, wrong: [coinOff, stepOff] };
    });
    if (!built) return 'unsupported';
    const { right, target } = built;
    const correctAt = randomInt(rng, 0, 2);
    const wrong = mix(rng, built.wrong);
    const purses = [...wrong];
    purses.splice(correctAt, 0, right);
    const options: ChoiceOption[] = purses.map((pieces, i) => {
      const base = { id: 'abc'.charAt(i), label: `Geldbörse ${String(i + 1)}`, pieces };
      if (pieces === right) return { ...base, correct: true };
      const s = sumOf(pieces);
      const diff = Math.abs(s - target);
      return {
        ...base,
        feedback: `In dieser Geldbörse ${verb(s)} ${tok(s)}. Das ${verb(diff)} ${tok(diff)} zu ${s > target ? 'viel' : 'wenig'}.`,
      };
    });
    const euro = Math.floor(target / 100) * 100;
    const cent = target % 100;
    const biggest = right[0] ?? target;
    return makeTask(
      cfg,
      'Welche Geldbörse passt?',
      { kind: 'none' },
      'Kiko hat drei kleine Geldbörsen gefunden.',
      [
        {
          question: `In welcher Geldbörse sind genau ${tok(target)}?`,
          answer: { type: 'choice', layout: 'bags', shuffle: false, options },
          hints: [
            `Zähle jede Geldbörse einzeln. Fang mit ${isNote(biggest) ? 'dem größten Schein' : 'der größten Münze'} an.`,
            euro > 0 && cent > 0
              ? `${tok(target)} sind ${tok(euro)} und ${tok(cent)}.`
              : `Du suchst genau ${tok(target)}. Vergleiche jede Summe damit.`,
          ],
          explanation: `${plusTokens(right)} = ${tok(target)}.`,
        },
      ],
      2,
    );
  },
};

// ---------- Z5: Das Preisschild ----------

const Z5: Generator = {
  id: 'Z5',
  topic: 'muenzen-zaehlen',
  stufen: [3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.answerTypes.includes('choice') || !cfg.money.useCents || cfg.money.centOnly)
      return 'unsupported';
    const step = cfg.money.step;
    // Stufe 4 auch 1,05 € ↔ 105 Cent (docs/05 Anhang A).
    const withEuro = cfg.choiceCount >= 4 && rng() < 0.4;
    let amount: Cents;
    let correct: string;
    let wrong: { label: string; feedback: string }[];
    let hints: [string, string];
    let explanation: string;
    if (withEuro) {
      const cent = step;
      const maxEuro = Math.min(3, Math.floor((cfg.money.maxPrice - cent) / 100));
      if (maxEuro < 1) return 'unsupported';
      const euro = randomInt(rng, 1, maxEuro);
      amount = euro * 100 + cent;
      correct = `${String(amount)} Cent`;
      wrong = [
        {
          label: `${String(euro)}${String(cent)} Cent`,
          feedback: `Vor dem Komma steht eine ${String(euro)}. Das sind ${String(euro)} Euro, also ${String(euro * 100)} Cent.`,
        },
        {
          label: `${String(euro * 100 + cent * 10)} Cent`,
          feedback: `Hinter dem Komma steht ${String(cent).padStart(2, '0')}. Das sind nur ${String(cent)} Cent.`,
        },
        {
          label: `${String(euro * 1000 + cent)} Cent`,
          feedback: `Vor dem Komma steht nur eine ${String(euro)}. Das sind ${String(euro)} Euro, nicht ${String(euro * 10)} Euro.`,
        },
      ];
      hints = [
        'Vor dem Komma stehen die Euro, hinter dem Komma die Cent.',
        `Vor dem Komma steht eine ${String(euro)}. ${String(euro)} Euro sind ${String(euro * 100)} Cent.`,
      ];
      explanation = `${literalEur(amount)} heißt: ${String(euro)} Euro und ${String(cent)} Cent. ${String(euro)} Euro sind ${String(euro * 100)} Cent. Also ${String(amount)} Cent.`;
    } else {
      // Cent-Betrag mit zwei verschiedenen Ziffern, z. B. 0,85 €.
      const values: Cents[] = [];
      for (let c = step; c < 100; c += step) if (c >= 10 && c % 10 !== 0) values.push(c);
      if (values.length === 0) return 'unsupported';
      amount = pick(rng, values);
      const ten = Math.floor((amount * 10) / 100);
      correct = `${String(amount)} Cent`;
      wrong = [
        {
          label: literalEur(amount * 10),
          feedback: `Vor dem Komma steht eine 0. Das heißt: 0 Euro. ${literalEur(amount * 10)} wären mehr als ${String(ten)} Euro!`,
        },
        {
          label: `${String(amount)} €`,
          feedback: 'Hinter dem Komma stehen die Cent. Vor dem Komma steht 0 Euro.',
        },
        {
          label: `${String(amount * 10)} Cent`,
          feedback: `${String(amount * 10)} Cent wären mehr als ${String(ten)} Euro. Vor dem Komma steht aber eine 0.`,
        },
      ];
      hints = [
        'Vor dem Komma stehen die Euro, hinter dem Komma die Cent.',
        'Vor dem Komma steht eine 0. Wie viele Cent stehen dahinter?',
      ];
      explanation = `${literalEur(amount)} heißt: 0 Euro und ${String(amount)} Cent. Also ${String(amount)} Cent.`;
    }
    const fitting = ITEMS.filter((item) => {
      const range = item.prices[cfg.id];
      return range !== undefined && range[0] <= amount && amount <= range[1];
    });
    const pool = fitting.length > 0 ? fitting : ITEMS.filter((i) => i.prices[cfg.id] !== undefined);
    if (pool.length === 0 || amount > cfg.money.maxPrice) return 'unsupported';
    const item = pick(rng, pool);
    return makeTask(
      cfg,
      'Das Preisschild',
      {
        kind: 'items',
        items: [{ itemId: item.id, label: item.name, price: amount, priceFormat: 'eur' }],
      },
      `Auf dem Preisschild steht ${literalEur(amount)}.`,
      [
        {
          question: 'Wie viel ist das?',
          answer: choice({ label: correct }, wrong, cfg.choiceCount),
          hints,
          explanation,
          praise: 'Genau! Du kannst Preisschilder lesen.',
        },
      ],
      2,
    );
  },
};

/** Reihenfolge leicht → schwer (docs/05 4.1 und Anhang B). */
export const MUENZEN_ZAEHLEN_GENERATORS: Generator[] = [C1, C2, Z1, Z2, Z3, Z4, Z5];
