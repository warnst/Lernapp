import type { CheckTexts } from '@/domain/check';
import type { ClueSymbol, GridAnswer } from '@/domain/types';

// Rückmeldungen der Antwortprüfung, wörtlich aus docs/03 (Abschnitt 6) und docs/10 (Abschnitt 3).

const SYMBOL_DATIVE: Record<ClueSymbol, string> = {
  stern: 'dem Stern',
  muschel: 'der Muschel',
  fisch: 'dem Fisch',
  krebs: 'dem Krebs',
};

// Zahlenmauer: Steine; Rechendreieck: Felder.
const GRID_WORDS: Record<
  GridAnswer['shape'],
  { one: string; many: string; last: string; all: string }
> = {
  wall: { one: 'Ein Stein stimmt', many: 'Steine stimmen', last: 'den letzten', all: 'die Steine' },
  triangle: {
    one: 'Ein Feld stimmt',
    many: 'Felder stimmen',
    last: 'das letzte',
    all: 'die Felder',
  },
};

/** z. B. „2 Steine stimmen schon. Schau dir den letzten noch einmal an.“ (docs/10) */
function gridFeedback(correct: number, wrong: number, shape: GridAnswer['shape']): string {
  const words = GRID_WORDS[shape];
  const lookAgain = `Schau dir ${wrong === 1 ? words.last : 'die anderen'} noch einmal an.`;
  if (correct === 0) return `Schau dir ${words.all} noch einmal an.`;
  const stimmt = correct === 1 ? words.one : `${String(correct)} ${words.many}`;
  return `${stimmt} schon. ${lookAgain}`;
}

export const CHECK_TEXTS: CheckTexts = {
  centNote: (cents, euroText) => `${String(cents)}\u00A0Cent sind übrigens ${euroText}.`,
  payNotMinimal: (target) => `Richtig, das sind ${target}! Geht es auch mit weniger Münzen?`,
  payExactCount: (count) => `Es müssen genau ${String(count)} Münzen sein.`,
  variantDuplicate: 'Diese Möglichkeit hast du schon. Findest du eine andere?',
  orderWrongPlace: (label) => `${label} steht noch nicht an der richtigen Stelle.`,
  selectCount: (count) => `Wähle genau ${String(count)} Sachen.`,
  selectTooMuch: (sum) => `Deine Sachen kosten zusammen ${sum}. Das ist zu viel.`,
  selectTooLittle: (sum) => `Deine Sachen kosten zusammen ${sum}. Das ist zu wenig.`,
  affordableTooExpensive: (name, price, budget) =>
    `${name} kostet ${price}. Das ist mehr als ${budget}.`,
  affordableMissingExact: (budget) =>
    `Es fehlt noch etwas. Denk dran: Genau ${budget} reicht auch!`,
  affordableMissingOther: 'Es fehlt noch eine Sache, die du dir leisten kannst.',
  gridFeedback,
  codeStuck: (symbol) =>
    `Das Schloss klemmt noch. Das Rad mit ${SYMBOL_DATIVE[symbol]} stimmt noch nicht.`,
};
