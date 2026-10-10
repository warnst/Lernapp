import { CHECK_TEXTS } from '@/content/check-texts';
import { type AnswerInput, checkAnswer } from '@/domain/check';
import { solveGrid } from '@/domain/grid';
import { countWays, findCombination, payCombinations } from '@/domain/money';
import { renderText } from '@/domain/text';
import type {
  Answer,
  MoneyPiece,
  Scene,
  SelectAnswer,
  StufeConfig,
  Task,
  TaskPart,
} from '@/domain/types';
import { wordCount } from './build';

// Prüft erzeugte Aufgaben: Invarianten aus docs/03 4 und Stufengrenzen aus docs/05 7.

const FORBIDDEN = [
  // (?![\w-]): „ein Muschel-Armband“ ist richtig
  /\bein (Kokosnuss|Banane|Mango|Schaufel|Laterne|Kerze|Murmel|Muschel|Taucherbrille)(?![\w-])/,
  /\beinen (Eis|Brot|Seil|Buch|Bonbon|Zelt)(?![\w-])/,
];

function subsets<T>(items: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  return items.flatMap((item, i) =>
    subsets(items.slice(i + 1), size - 1).map((rest) => [item, ...rest]),
  );
}

/** Alle richtigen Auswahlen (Item-IDs) einer select-Aufgabe. */
export function selectSolutions(answer: SelectAnswer): string[][] {
  const { items, rule } = answer;
  if (rule.kind === 'affordable') {
    return [items.filter((i) => (i.price ?? Infinity) <= rule.budget).map((i) => i.itemId)];
  }
  return subsets(items, rule.count)
    .filter((set) => set.reduce((t, i) => t + (i.price ?? 0), 0) === rule.target)
    .map((set) => set.map((i) => i.itemId));
}

/** Eine richtige Eingabe für den Teil (oder keine, wenn die Aufgabe nicht lösbar ist). */
function correctInput(task: Task, part: TaskPart): AnswerInput | undefined {
  const answer = part.answer;
  switch (answer.type) {
    case 'choice': {
      const option = answer.options.find((o) => o.correct);
      return option && { type: 'choice', optionId: option.id };
    }
    case 'money':
      return {
        type: 'money',
        euro: String(Math.floor(answer.correct / 100)),
        cent: String(answer.correct % 100),
      };
    case 'number':
      return { type: 'number', value: answer.correct };
    case 'pay': {
      const pieces = findCombination(answer.target, answer.palette, answer.exactCount);
      return pieces ? { type: 'pay', pieces } : undefined;
    }
    case 'pay-variants': {
      const combos = payCombinations(answer.target, answer.palette, answer.required);
      const last = combos.at(-1);
      return combos.length === answer.required && last
        ? { type: 'pay-variants', pieces: last, found: combos.slice(0, -1) }
        : undefined;
    }
    case 'order':
      return {
        type: 'order',
        ids: [...answer.entries].sort((a, b) => a.value - b.value).map((e) => e.id),
      };
    case 'select': {
      const solution = selectSolutions(answer)[0];
      return solution && { type: 'select', itemIds: solution };
    }
    case 'grid':
      return {
        type: 'grid',
        values: Object.fromEntries(
          answer.cells.filter((c) => !c.given).map((c) => [c.id, c.value]),
        ),
      };
    case 'code':
      return {
        type: 'code',
        digits: answer.digits,
        symbols: task.scene.kind === 'clues' ? task.scene.clues.map((c) => c.symbol) : [],
      };
    case 'clock':
      return { type: 'clock', time: answer.correct };
  }
}

function scenePieces(scene: Scene): MoneyPiece[] {
  switch (scene.kind) {
    case 'coins':
      return [...scene.pieces, ...(scene.groups ?? []).flat()];
    case 'items':
      return [...(scene.paidWith ?? []), ...(scene.hand ?? [])];
    case 'balance':
      return [...(scene.left.pieces ?? []), ...(scene.right.pieces ?? [])];
    default:
      return [];
  }
}

function sceneTexts(scene: Scene): string[] {
  switch (scene.kind) {
    case 'coins':
      return scene.label === undefined ? [] : [scene.label];
    case 'items':
      return scene.items.map((i) => i.label);
    case 'people':
      return scene.people.map((p) => p.name);
    case 'note':
      return scene.lines;
    case 'clues':
      return scene.clues.map((c) => c.text);
    default:
      return [];
  }
}

function answerPieces(answer: Answer): MoneyPiece[] {
  switch (answer.type) {
    case 'choice':
      return answer.options.flatMap((o) => o.pieces ?? []);
    case 'pay':
    case 'pay-variants':
      return answer.palette;
    case 'order':
      return answer.entries.flatMap((e) => (e.piece === undefined ? [] : [e.piece]));
    default:
      return [];
  }
}

function answerTexts(answer: Answer): string[] {
  switch (answer.type) {
    case 'choice':
      return answer.options.flatMap((o) => [
        o.label,
        ...(o.feedback === undefined ? [] : [o.feedback]),
      ]);
    case 'order':
      return answer.entries.map((e) => e.label);
    case 'select':
      return answer.items.map((i) => i.label);
    default:
      return [];
  }
}

/** Geldwert der richtigen Antwort, falls es einen gibt (für Stufengrenzen). */
function correctMoney(answer: Answer): number | undefined {
  if (answer.type === 'money') return answer.correct;
  if (answer.type === 'pay' || answer.type === 'pay-variants') return answer.target;
  return undefined;
}

/** Liste der Verstöße; leer = Aufgabe in Ordnung. */
export function validateTask(task: Task, cfg: StufeConfig): string[] {
  const errors: string[] = [];
  const fail = (message: string) => {
    errors.push(message);
  };

  if (task.parts.length < 1 || task.parts.length > cfg.maxSteps)
    fail(`Teile: ${String(task.parts.length)}`);
  const story = renderText(task.story);
  if (wordCount(story) > cfg.maxStoryWords) fail(`Geschichte zu lang: ${story}`);

  const texts = [task.story, ...sceneTexts(task.scene)];
  for (const part of task.parts) {
    texts.push(part.question, part.explanation, ...part.hints, ...answerTexts(part.answer));
    if (part.lead !== undefined) texts.push(part.lead);
    if (part.praise !== undefined) texts.push(part.praise);
    for (const m of part.mistakes ?? []) texts.push(m.feedback);
  }
  for (const text of texts) {
    const shown = renderText(text);
    if (shown.trim() === '') fail('leerer Text');
    if (/undefined|NaN|\{\{|\}\}/.test(shown)) fail(`kaputter Text: ${shown}`);
    if (/ {2}/.test(shown)) fail(`doppelte Leerzeichen: ${shown}`);
    if (shown.toLowerCase().includes('falsch')) fail(`„falsch“ im Text: ${shown}`);
    for (const pattern of FORBIDDEN) if (pattern.test(shown)) fail(`Grammatik: ${shown}`);
  }

  const allowedPieces = new Set<number>(cfg.money.pieces);
  const pieces = [...scenePieces(task.scene), ...task.parts.flatMap((p) => answerPieces(p.answer))];
  for (const piece of pieces)
    if (!allowedPieces.has(piece)) fail(`Stück nicht erlaubt: ${String(piece)}`);
  if (task.scene.kind === 'items') {
    for (const item of task.scene.items) {
      if (
        item.price !== undefined &&
        (item.price % cfg.money.step !== 0 || item.price > cfg.money.maxPrice)
      ) {
        fail(`Preis außerhalb der Stufe: ${String(item.price)}`);
      }
    }
  }

  for (const part of task.parts) {
    const answer = part.answer;
    if (!cfg.answerTypes.includes(answer.type)) fail(`Antworttyp nicht erlaubt: ${answer.type}`);
    const money = correctMoney(answer);
    if (money !== undefined) {
      if (!Number.isInteger(money) || money < 0 || money > cfg.money.maxTotal)
        fail(`Betrag: ${String(money)}`);
      if (money % cfg.money.step !== 0) fail(`Betrag nicht im Stufenschritt: ${String(money)}`);
    }
    if (
      answer.type === 'number' &&
      (answer.correct < 0 || answer.correct > cfg.numbers.max || !Number.isInteger(answer.correct))
    ) {
      fail(`Zahl außerhalb: ${String(answer.correct)}`);
    }
    if (part.mistakes) {
      if (answer.type !== 'money' && answer.type !== 'number')
        fail('mistakes nur bei money/number');
      const values = part.mistakes.map((m) => m.value);
      if (new Set(values).size !== values.length) fail('doppelte mistakes');
      if (
        (answer.type === 'money' || answer.type === 'number') &&
        values.includes(answer.correct)
      ) {
        fail('mistake gleich richtiger Antwort');
      }
    }
    switch (answer.type) {
      case 'choice': {
        if (answer.options.length < 2 || answer.options.length > 4) fail('2–4 Optionen');
        if (answer.options.filter((o) => o.correct).length !== 1)
          fail('genau eine richtige Option');
        if (
          new Set(answer.options.map((o) => renderText(o.label))).size !== answer.options.length
        ) {
          fail('Optionen nicht verschieden');
        }
        break;
      }
      case 'pay':
        if (
          answer.exactCount !== undefined &&
          !findCombination(answer.target, answer.palette, answer.exactCount)
        ) {
          fail('exactCount nicht lösbar');
        }
        break;
      case 'pay-variants':
        if (countWays(answer.target, answer.palette, answer.required) < answer.required) {
          fail('zu wenige Möglichkeiten');
        }
        break;
      case 'order':
        if (new Set(answer.entries.map((e) => e.value)).size !== answer.entries.length)
          fail('order-Werte gleich');
        break;
      case 'select':
        if (answer.items.some((i) => i.price === undefined)) fail('Sache ohne Preis');
        if (selectSolutions(answer).every((s) => s.length === 0)) fail('select nicht lösbar');
        break;
      case 'grid': {
        const solved = solveGrid(
          answer.shape,
          answer.cells.map((c) => (c.given ? { id: c.id, value: c.value } : { id: c.id })),
        );
        if (!solved) fail('grid nicht eindeutig lösbar');
        // Die Lösung des Lösers muss zu den hinterlegten Werten passen (sonst prüft die App falsch).
        else if (answer.cells.some((c) => solved[c.id] !== c.value))
          fail('grid-Werte passen nicht');
        for (const { value } of answer.cells) {
          const inRange =
            answer.unit === 'number'
              ? Number.isInteger(value) && value >= 0 && value <= cfg.numbers.max
              : Number.isInteger(value) &&
                value >= 0 &&
                value <= cfg.money.maxTotal &&
                value % cfg.money.step === 0;
          if (!inRange) fail(`grid-Wert außerhalb der Stufe: ${String(value)}`);
        }
        break;
      }
      case 'code':
        if (
          answer.digits.some((d) => !Number.isInteger(d) || d < 0 || d > 9) ||
          answer.digits[0] === 0 ||
          answer.digits.length < 3 ||
          answer.digits.length > 4
        ) {
          fail('Code ungültig');
        }
        if (task.scene.kind === 'clues' && task.scene.clues.length !== answer.digits.length)
          fail('Code: so viele Räder wie Rätselkarten');
        break;
      default:
        break;
    }
    const input = correctInput(task, part);
    if (!input) fail(`keine richtige Eingabe für ${part.id}`);
    else if (checkAnswer(answer, input, CHECK_TEXTS, part.mistakes).status !== 'correct') {
      fail(`richtige Eingabe wird nicht erkannt: ${part.id}`);
    }
  }
  return errors;
}
