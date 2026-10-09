import { assertNever } from './assert';
import { formatMoney, minPieces, moneyFromFields, sameMultiset, sumPieces } from './money';
import type {
  Answer,
  Cents,
  ClueSymbol,
  CodeAnswer,
  GridAnswer,
  Mistake,
  MoneyPiece,
  OrderAnswer,
  PayAnswer,
  PayVariantsAnswer,
  SceneItem,
  SelectAnswer,
} from './types';

// Antwortprüfung aller Typen (docs/03, Abschnitt 6). Die Sätze kommen aus src/content/check-texts.ts.

export type Direction = 'too-much' | 'too-little';

export type CheckResult =
  /** remaining > 0 bei pay-variants: Möglichkeit gemerkt, es fehlen noch welche. */
  | { status: 'correct'; note?: string; remaining?: number }
  | {
      status: 'wrong';
      feedback?: string;
      direction?: Direction;
      /** grid: Felder, die stimmen und fest werden. */
      correctCells?: string[];
    }
  /** richtig, aber eine Bedingung fehlt; zählt nicht als Fehlversuch */
  | { status: 'partial'; feedback: string };

export type AnswerInput =
  | { type: 'choice'; optionId: string }
  | { type: 'money'; euro: string; cent: string }
  | { type: 'number'; value: number }
  | { type: 'pay'; pieces: MoneyPiece[] }
  /** found: bereits gemerkte Möglichkeiten */
  | { type: 'pay-variants'; pieces: MoneyPiece[]; found: MoneyPiece[][] }
  /** ids in der Reihenfolge, in der das Kind sie angetippt hat */
  | { type: 'order'; ids: string[] }
  | { type: 'select'; itemIds: string[] }
  /** Werte der offenen Felder */
  | { type: 'grid'; values: Partial<Record<string, number>> }
  /** symbols: Symbol je Rad, aus den Rätselkarten der Szene */
  | { type: 'code'; digits: number[]; symbols: ClueSymbol[] };

/** Satzbausteine für Rückmeldungen. Beträge kommen schon formatiert an. */
export interface CheckTexts {
  centNote: (cents: number, euroText: string) => string;
  payNotMinimal: (target: string) => string;
  payExactCount: (count: number) => string;
  variantDuplicate: string;
  orderWrongPlace: (label: string) => string;
  selectCount: (count: number) => string;
  selectTooMuch: (sum: string) => string;
  selectTooLittle: (sum: string) => string;
  affordableTooExpensive: (name: string, price: string, budget: string) => string;
  affordableMissingExact: (budget: string) => string;
  affordableMissingOther: string;
  /** correct: richtige offene Felder, wrong: noch nicht richtige */
  gridFeedback: (correct: number, wrong: number, shape: GridAnswer['shape']) => string;
  codeStuck: (symbol: ClueSymbol) => string;
}

function direction(value: number, correct: number): Direction {
  return value > correct ? 'too-much' : 'too-little';
}

function checkValue(value: number, correct: number, mistakes: readonly Mistake[]): CheckResult {
  if (value === correct) return { status: 'correct' };
  const mistake = mistakes.find((m) => m.value === value);
  if (mistake) return { status: 'wrong', feedback: mistake.feedback };
  return { status: 'wrong', direction: direction(value, correct) };
}

function checkPay(answer: PayAnswer, pieces: readonly MoneyPiece[], texts: CheckTexts) {
  const sum = sumPieces(pieces);
  if (answer.exactCount !== undefined && pieces.length !== answer.exactCount) {
    const result: CheckResult = {
      status: 'wrong',
      feedback: texts.payExactCount(answer.exactCount),
    };
    return sum === answer.target ? result : { ...result, direction: direction(sum, answer.target) };
  }
  if (sum !== answer.target) {
    return { status: 'wrong', direction: direction(sum, answer.target) } as const;
  }
  if (answer.minimal && pieces.length !== minPieces(answer.target, answer.palette)) {
    return {
      status: 'partial',
      feedback: texts.payNotMinimal(formatMoney(answer.target)),
    } as const;
  }
  return { status: 'correct' } as const;
}

function checkPayVariants(
  answer: PayVariantsAnswer,
  pieces: readonly MoneyPiece[],
  found: readonly MoneyPiece[][],
  texts: CheckTexts,
): CheckResult {
  const sum = sumPieces(pieces);
  if (sum !== answer.target) return { status: 'wrong', direction: direction(sum, answer.target) };
  if (found.some((earlier) => sameMultiset(earlier, pieces))) {
    return { status: 'partial', feedback: texts.variantDuplicate };
  }
  const remaining = Math.max(0, answer.required - found.length - 1);
  return remaining > 0 ? { status: 'correct', remaining } : { status: 'correct' };
}

function checkOrder(answer: OrderAnswer, ids: readonly string[], texts: CheckTexts): CheckResult {
  const placed = ids.map((id) => {
    const entry = answer.entries.find((e) => e.id === id);
    if (!entry) throw new Error(`Unbekannter Eintrag: ${id}`);
    return entry;
  });
  if (placed.length !== answer.entries.length) throw new Error('Nicht alle Einträge sortiert');
  const sortedValues = answer.entries.map((e) => e.value).sort((a, b) => a - b);
  const firstWrong = placed.find((entry, i) => entry.value !== sortedValues[i]);
  if (!firstWrong) return { status: 'correct' };
  return { status: 'wrong', feedback: texts.orderWrongPlace(firstWrong.label) };
}

function price(item: SceneItem): Cents {
  if (item.price === undefined) throw new Error(`Sache ohne Preis: ${item.itemId}`);
  return item.price;
}

function checkSelect(answer: SelectAnswer, itemIds: readonly string[], texts: CheckTexts) {
  const chosen = answer.items.filter((item) => itemIds.includes(item.itemId));
  const rule = answer.rule;

  if (rule.kind === 'sum') {
    if (chosen.length !== rule.count) {
      return { status: 'wrong', feedback: texts.selectCount(rule.count) } as const;
    }
    const sum = chosen.reduce((total, item) => total + price(item), 0);
    if (sum === rule.target) return { status: 'correct' } as const;
    const text = sum > rule.target ? texts.selectTooMuch : texts.selectTooLittle;
    return {
      status: 'wrong',
      feedback: text(formatMoney(sum)),
      direction: direction(sum, rule.target),
    } as const;
  }

  const budget = formatMoney(rule.budget);
  const tooExpensive = chosen.find((item) => price(item) > rule.budget);
  if (tooExpensive) {
    const feedback = texts.affordableTooExpensive(
      tooExpensive.label,
      formatMoney(price(tooExpensive)),
      budget,
    );
    return { status: 'wrong', feedback } as const;
  }
  const missing = answer.items.filter(
    (item) => price(item) <= rule.budget && !chosen.includes(item),
  );
  if (missing.length === 0) return { status: 'correct' } as const;
  const feedback = missing.some((item) => price(item) === rule.budget)
    ? texts.affordableMissingExact(budget)
    : texts.affordableMissingOther;
  return { status: 'wrong', feedback } as const;
}

function checkGrid(
  answer: GridAnswer,
  values: Partial<Record<string, number>>,
  texts: CheckTexts,
): CheckResult {
  const open = answer.cells.filter((cell) => !cell.given);
  const correctCells = open.filter((cell) => values[cell.id] === cell.value).map((c) => c.id);
  if (correctCells.length === open.length) return { status: 'correct' };
  const feedback = texts.gridFeedback(
    correctCells.length,
    open.length - correctCells.length,
    answer.shape,
  );
  return { status: 'wrong', feedback, correctCells };
}

function checkCode(
  answer: CodeAnswer,
  digits: readonly number[],
  symbols: readonly ClueSymbol[],
  texts: CheckTexts,
): CheckResult {
  const wrongIndex = answer.digits.findIndex((digit, i) => digits[i] !== digit);
  if (wrongIndex === -1) return { status: 'correct' };
  const symbol = symbols[wrongIndex];
  if (symbol === undefined) throw new Error(`Rad ${String(wrongIndex + 1)} hat kein Symbol`);
  return { status: 'wrong', feedback: texts.codeStuck(symbol) };
}

function mismatch(answer: Answer, input: AnswerInput): never {
  throw new Error(`Eingabe ${input.type} passt nicht zur Antwort ${answer.type}`);
}

/** Prüft eine Antwort. `mistakes` sind die Fehlerhinweise des Aufgabenteils (money, number). */
export function checkAnswer(
  answer: Answer,
  input: AnswerInput,
  texts: CheckTexts,
  mistakes: readonly Mistake[] = [],
): CheckResult {
  switch (answer.type) {
    case 'choice': {
      if (input.type !== 'choice') return mismatch(answer, input);
      const option = answer.options.find((o) => o.id === input.optionId);
      if (!option) throw new Error(`Unbekannte Option: ${input.optionId}`);
      if (option.correct) return { status: 'correct' };
      return option.feedback === undefined
        ? { status: 'wrong' }
        : { status: 'wrong', feedback: option.feedback };
    }
    case 'money': {
      if (input.type !== 'money') return mismatch(answer, input);
      const result = checkValue(moneyFromFields(input.euro, input.cent), answer.correct, mistakes);
      const cent = Number(input.cent);
      if (result.status === 'correct' && cent >= 100) {
        return {
          status: 'correct',
          note: texts.centNote(cent, formatMoney(cent)),
        };
      }
      return result;
    }
    case 'number':
      if (input.type !== 'number') return mismatch(answer, input);
      return checkValue(input.value, answer.correct, mistakes);
    case 'pay':
      if (input.type !== 'pay') return mismatch(answer, input);
      return checkPay(answer, input.pieces, texts);
    case 'pay-variants':
      if (input.type !== 'pay-variants') return mismatch(answer, input);
      return checkPayVariants(answer, input.pieces, input.found, texts);
    case 'order':
      if (input.type !== 'order') return mismatch(answer, input);
      return checkOrder(answer, input.ids, texts);
    case 'select':
      if (input.type !== 'select') return mismatch(answer, input);
      return checkSelect(answer, input.itemIds, texts);
    case 'grid':
      if (input.type !== 'grid') return mismatch(answer, input);
      return checkGrid(answer, input.values, texts);
    case 'code':
      if (input.type !== 'code') return mismatch(answer, input);
      return checkCode(answer, input.digits, input.symbols, texts);
    default:
      return assertNever(answer);
  }
}
