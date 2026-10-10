import { pick, randomInt, type Rng } from '@/domain/random';
import type { Answer, ClueSymbol, Mistake, SeqItem, StufeConfig, Task } from '@/domain/types';
import { choice, makeTask, mix, readBind, readForce } from '../build';
import { STILL_THINGS, thingById } from '../generators/mengen-zahlen-parts';
import type { Generator } from '../types';
import { paramsFor, type PicturePeriod, riddleStufen, type SeqRule } from './params';
import {
  ALL_SYMBOLS,
  attempt,
  formatter,
  pickWrong,
  symbolWords,
  toMistakes,
  valueCards,
  type Wrong,
} from './shared';

// Muster (docs/10): Bildmuster, Zahlen-, Mengen- und Geldreihen mit einer Lücke.

type Muster = 'bild' | 'zahl' | 'menge' | 'geld';
type Luecke = 'ende' | 'mitte';
type Antwort = 'choice' | 'number' | 'money';

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  key: string,
): T | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !allowed.includes(value as T))
    throw new Error(`${key}: ${JSON.stringify(value)}`);
  return value as T;
}

/** Werte einer Reihe nach der Regel. */
function series(rule: SeqRule, start: number, length: number): number[] {
  const values = [start];
  for (let i = 1; i < length; i++) {
    const last = values[i - 1] ?? start;
    if (rule.kind === 'add') values.push(last + rule.d);
    else if (rule.kind === 'double') values.push(last * 2);
    else values.push(last + (i % 2 === 1 ? rule.d1 : rule.d2));
  }
  return values;
}

/** Tipp 2 bzw. erster Satz des Lösungswegs je Regel (docs/10, Tabelle „Tipps“). */
function ruleText(rule: SeqRule, fmt: (v: number) => string): string {
  if (rule.kind === 'double') return 'Die Zahl wird immer doppelt so groß.';
  if (rule.kind === 'alt') return `Es kommt abwechselnd ${fmt(rule.d1)} und ${fmt(rule.d2)} dazu.`;
  return rule.d > 0
    ? `Es kommt immer ${fmt(rule.d)} dazu.`
    : `Es wird immer ${fmt(-rule.d)} weniger.`;
}

interface Layout {
  length: number;
  blank: number;
}

/** Länge und Lücke: mindestens `before` Elemente vor der Lücke (docs/10 Abschnitt 5). */
function layout(rng: Rng, luecke: Luecke, before: number): Layout {
  if (luecke === 'ende') {
    const blank = randomInt(rng, before, before + 1);
    return { length: blank + 1, blank };
  }
  return { length: before + randomInt(rng, 2, 3), blank: before };
}

/** Typische Denkfehler bei Zahlen- und Geldreihen. */
function seqWrong(
  rule: SeqRule,
  values: readonly number[],
  at: number,
  unit: number,
  fmt: (v: number) => string,
): Wrong[] {
  const correct = values[at] ?? 0;
  const prev = values[at - 1] ?? 0;
  const inRow = (v: number) =>
    values.some((x, i) => i !== at && x === v) ? `${fmt(v)} steht schon in der Reihe.` : undefined;
  const near = `Fast! ${ruleText(rule, fmt)}`;
  const result: Wrong[] = [];
  if (rule.kind === 'add') {
    const d = rule.d;
    result.push({
      value: correct + d,
      feedback: inRow(correct + d) ?? 'Das ist ein Schritt zu weit.',
    });
    result.push({
      value: prev - d,
      feedback: d > 0 ? 'Es wird mehr, nicht weniger.' : 'Es wird weniger, nicht mehr.',
    });
    result.push(
      { value: correct + unit, feedback: near },
      { value: correct - unit, feedback: near },
    );
    result.push({ value: correct - d, feedback: inRow(correct - d) ?? near });
  } else if (rule.kind === 'double') {
    const before = values[at - 2] ?? 0;
    result.push({
      value: prev + (prev - before),
      feedback: 'Es kommt nicht immer gleich viel dazu. Schau genau hin.',
    });
    result.push({
      value: prev * 3,
      feedback: 'Die Zahl wird doppelt so groß, nicht dreimal so groß.',
    });
    result.push({ value: correct + 2, feedback: `Fast! Rechne ${fmt(prev)} + ${fmt(prev)}.` });
    result.push({ value: correct - 2, feedback: `Fast! Rechne ${fmt(prev)} + ${fmt(prev)}.` });
  } else {
    const used = correct - prev;
    const other = used === rule.d1 ? rule.d2 : rule.d1;
    result.push({ value: prev + other, feedback: `Achte auf den Wechsel. ${ruleText(rule, fmt)}` });
    result.push(
      { value: correct + unit, feedback: near },
      { value: correct - unit, feedback: near },
    );
  }
  return result;
}

interface Built {
  title: string;
  story: string;
  question: string;
  items: SeqItem[];
  answer: Answer;
  mistakes?: Mistake[];
  hints: [string, string];
  explanation: string;
}

function numberOrMoney(
  cfg: StufeConfig,
  rng: Rng,
  money: boolean,
  luecke: Luecke,
  antwort: Antwort,
): Built | null {
  const p = paramsFor(cfg).sequence;
  const rules = money ? p.moneyRules : p.numberRules;
  const unit = money ? cfg.money.step : 1;
  const max = money ? cfg.money.maxTotal : Math.min(p.numberMax, cfg.numbers.max);
  const min = money ? unit : 0;
  const fmt = formatter(money);
  const built = attempt(60, () => {
    const rule = pick(rng, rules);
    const lay = layout(rng, luecke, rule.kind === 'alt' ? 4 : 3);
    const span = series(rule, 0, lay.length);
    let start: number;
    if (rule.kind === 'double') {
      const top = Math.floor(max / 2 ** (lay.length - 1));
      if (top < 1) return null;
      start = randomInt(rng, 1, top);
    } else {
      // Startwert im Raster: Geld bei Zehner-Regeln in 10-Cent-Schritten, sonst im Stufenschritt.
      const d = rule.kind === 'add' ? Math.abs(rule.d) : rule.d1;
      const grid = money && d % 10 === 0 ? Math.max(unit, 10) : unit;
      const low = Math.ceil((min - Math.min(...span)) / grid);
      const high = Math.floor((max - Math.max(...span)) / grid);
      if (low > high) return null;
      start = randomInt(rng, low, high) * grid;
    }
    const values = series(rule, start, lay.length);
    if (values.some((v) => v < min || v > max || v % unit !== 0)) return null;
    return { rule, lay, values };
  });
  if (!built) return null;
  const { rule, lay, values } = built;
  const correct = values[lay.blank] ?? 0;
  const items: SeqItem[] = values.map((v, i) =>
    i === lay.blank
      ? { kind: 'blank' }
      : money
        ? { kind: 'money', cents: v }
        : { kind: 'number', value: v },
  );
  const limit = antwort === 'choice' ? (money ? 2 * cfg.money.maxTotal : max) : max;
  const count = antwort === 'choice' ? cfg.choiceCount - 1 : 3;
  const wrong = pickWrong(
    correct,
    seqWrong(rule, values, lay.blank, unit, fmt),
    count,
    { min, max: limit, unit },
    fmt,
  );
  const answer: Answer =
    antwort === 'choice'
      ? valueCards(correct, wrong, fmt)
      : antwort === 'money'
        ? { type: 'money', correct }
        : { type: 'number', correct };
  const listed = values.map(fmt).join(', ');
  return {
    title: money ? 'Die Geldreihe' : 'Die Zahlenreihe',
    story: money
      ? 'Kiko legt Karten mit Geld in eine Reihe. Ein Feld ist leer.'
      : 'Auf den Steinen stehen Zahlen. Ein Stein ist leer.',
    question: money
      ? 'Was gehört in das leere Feld?'
      : luecke === 'ende'
        ? 'Welche Zahl kommt als Nächstes?'
        : 'Welche Zahl fehlt?',
    items,
    answer,
    ...(antwort === 'choice' ? {} : { mistakes: toMistakes(wrong) }),
    hints: ['Schau, wie es von einem Feld zum nächsten weitergeht.', ruleText(rule, fmt)],
    explanation: money
      ? `${ruleText(rule, fmt)} ${listed}. In das leere Feld gehört ${fmt(correct)}.`
      : `${ruleText(rule, fmt)} ${listed}. Es fehlt die ${String(correct)}.`,
  };
}

function menge(cfg: StufeConfig, rng: Rng, luecke: Luecke, antwort: Antwort): Built | null {
  const p = paramsFor(cfg).sequence;
  const max = Math.min(p.mengeMax, cfg.numbers.max);
  if (p.mengeSteps.length === 0) return null;
  const shape = attempt(20, () => {
    const s = pick(rng, p.mengeSteps);
    const l = layout(rng, luecke, 3);
    return max - s * (l.length - 1) >= 1 ? { step: s, lay: l } : null;
  });
  if (!shape) return null;
  const { step, lay } = shape;
  const top = max - step * (lay.length - 1);
  const start = randomInt(rng, 1, Math.min(top, step === 1 ? 3 : 2));
  const thing = thingById(pick(rng, STILL_THINGS));
  const values = series({ kind: 'add', d: step }, start, lay.length);
  const correct = values[lay.blank] ?? 0;
  const prev = values[lay.blank - 1] ?? 0;
  const ein = `${thing.nomCap.charAt(0).toLowerCase()}${thing.nomCap.slice(1)}`;
  const rule =
    step === 1
      ? `Es kommt immer ${ein} dazu.`
      : `Es kommen immer ${String(step)} ${thing.plural} dazu.`;
  const candidates: Wrong[] = [
    { value: prev, feedback: `In jedem Feld werden es mehr. ${String(prev)} gab es schon.` },
    {
      value: correct + 1,
      feedback: step === 1 ? `Es kommt immer nur ${ein} dazu.` : `Fast! ${rule}`,
    },
    { value: correct - 1, feedback: `Fast! ${rule}` },
  ];
  const wrong = pickWrong(
    correct,
    candidates,
    antwort === 'choice' ? cfg.choiceCount - 1 : 3,
    { min: 1, max, unit: 1 },
    String,
  );
  return {
    title: 'Es werden immer mehr',
    story: `Kiko legt ${thing.plural} in Felder.`,
    question:
      luecke === 'ende'
        ? `Wie viele ${thing.plural} kommen ins nächste Feld?`
        : `Wie viele ${thing.plural} gehören ins leere Feld?`,
    items: values.map((count, i): SeqItem =>
      i === lay.blank ? { kind: 'blank' } : { kind: 'objects', itemId: thing.id, count },
    ),
    answer: antwort === 'choice' ? valueCards(correct, wrong, String) : { type: 'number', correct },
    ...(antwort === 'choice' ? {} : { mistakes: toMistakes(wrong) }),
    hints: [`Zähle die ${thing.plural} in jedem Feld.`, rule],
    explanation: `${values.join(', ')}. Ins ${luecke === 'ende' ? 'nächste' : 'leere'} Feld kommen ${String(correct)} ${thing.plural}.`,
  };
}

function bild(cfg: StufeConfig, rng: Rng, luecke: Luecke): Built {
  const period: PicturePeriod = pick(rng, paramsFor(cfg).sequence.periods);
  const letters = [...new Set(period)];
  const symbols = mix(rng, ALL_SYMBOLS);
  const symbolOf = (letter: string): ClueSymbol => symbols[letters.indexOf(letter)] ?? 'stern';
  const size = period.length;
  // Beginnt am Periodenanfang, vor der Lücke mindestens zwei volle Perioden.
  const blank = 2 * size + randomInt(rng, 0, size - 1);
  const length = luecke === 'ende' ? blank + 1 : blank + 1 + randomInt(rng, 1, 2);
  const row = Array.from({ length }, (_v, i) => symbolOf(period.charAt(i % size)));
  const correct = row[blank] ?? 'stern';
  const before = row[blank - 1] ?? 'stern';
  const name = (s: ClueSymbol) => symbolWords(s).name;
  // Folgt auf `before` im Muster immer dasselbe? (AB, ABC: ja; AAB nach A: nein)
  const followers = new Set(
    Array.from(period)
      .map((letter, j) => (symbolOf(letter) === before ? period.charAt((j + 1) % size) : ''))
      .filter(Boolean),
  );
  const unique = followers.size === 1 && symbolOf([...followers][0] ?? '') === correct;
  const inPattern = letters.map(symbolOf);
  const wrongSymbols = [
    ...inPattern.filter((s) => s !== correct),
    ...symbols.filter((s) => !inPattern.includes(s)),
  ];
  const wrong = wrongSymbols.map((s) => ({
    label: name(s),
    icon: s,
    feedback: !inPattern.includes(s)
      ? `${symbolWords(s).ein.charAt(0).toUpperCase()}${symbolWords(s).ein.slice(1)} kommt in der Reihe gar nicht vor.`
      : unique
        ? `Schau genau: Nach ${symbolWords(before).jedem} kommt ${symbolWords(correct).ein.split(' ')[0] ?? ''} …?`
        : 'Sprich die Reihe noch einmal laut von vorne.',
  }));
  const spoken = row
    .slice(0, 2 * size)
    .map(name)
    .join(', ');
  const full = row.map(name).join(', ');
  return {
    title: 'Das Muster',
    story: luecke === 'ende' ? 'Kiko legt eine Reihe.' : 'Kiko legt eine Reihe. Ein Feld ist leer.',
    question: luecke === 'ende' ? 'Was kommt als Nächstes?' : 'Was fehlt in der Reihe?',
    items: row.map((s, i): SeqItem =>
      i === blank ? { kind: 'blank' } : { kind: 'icon', icon: s },
    ),
    answer: choice({ label: name(correct), icon: correct }, wrong, cfg.choiceCount),
    hints: [
      `Sprich das Muster laut: ${spoken} …`,
      unique
        ? `Nach ${symbolWords(before).einem} kommt immer ${symbolWords(correct).ein}.`
        : `Das Muster ist immer: ${row.slice(0, size).map(name).join(', ')}.`,
    ],
    explanation: `${full}.`,
  };
}

export const sequence: Generator = {
  id: 'sequence',
  topic: 'raetsel',
  stufen: riddleStufen('sequence'),
  generate(cfg, rng, opts): Task | 'unsupported' {
    const force = readForce(opts, ['muster', 'luecke', 'antwort']);
    readBind(opts, []);
    const forcedMuster = oneOf(force.muster, ['bild', 'zahl', 'menge', 'geld'] as const, 'muster');
    const forcedLuecke = oneOf(force.luecke, ['ende', 'mitte'] as const, 'luecke');
    const forcedAntwort = oneOf(force.antwort, ['choice', 'number', 'money'] as const, 'antwort');
    if (!cfg.riddles.types.includes('sequence')) return 'unsupported';
    const p = paramsFor(cfg).sequence;
    const muster: Muster =
      forcedMuster ??
      (p.mengeSteps.length > 0
        ? pick(rng, ['bild', 'zahl', 'menge'] as const)
        : rng() < cfg.riddles.moneyShare && p.moneyRules.length > 0
          ? 'geld'
          : 'zahl');
    const luecke: Luecke = forcedLuecke ?? (rng() < 0.5 ? 'ende' : 'mitte');
    // Stufe 1 überwiegend Karten, ab Stufe 2 etwa halb und halb (docs/10 Abschnitt 3).
    const input: Antwort = muster === 'geld' ? 'money' : 'number';
    const choiceShare = p.mengeSteps.length > 0 && cfg.money.centOnly ? 0.75 : 0.5;
    const antwort: Antwort =
      forcedAntwort ?? (muster === 'bild' || rng() < choiceShare ? 'choice' : input);
    if (antwort !== 'choice' && antwort !== input) return 'unsupported';
    if (muster === 'bild' && antwort !== 'choice') return 'unsupported';
    if (!cfg.answerTypes.includes(antwort)) return 'unsupported';
    let built: Built | null;
    if (muster === 'bild') built = bild(cfg, rng, luecke);
    else if (muster === 'menge') built = menge(cfg, rng, luecke, antwort);
    else if (muster === 'geld' && p.moneyRules.length === 0) built = null;
    else built = numberOrMoney(cfg, rng, muster === 'geld', luecke, antwort);
    if (!built) return 'unsupported';
    return makeTask(
      cfg,
      built.title,
      { kind: 'sequence', items: built.items },
      built.story,
      [
        {
          question: built.question,
          answer: built.answer,
          ...(built.mistakes && built.mistakes.length > 0 ? { mistakes: built.mistakes } : {}),
          hints: built.hints,
          explanation: built.explanation,
        },
      ],
      2,
    );
  },
};
