import { findCombination, formatMoney, payCombinations } from '@/domain/money';
import { renderText } from '@/domain/text';
import type { Answer, MoneyPiece } from '@/domain/types';
import { selectSolutions } from '@/practice/validate';

// Lösung einer Aufgabe als kurzer Text für das Lösungsblatt (docs/06 5).

function pieces(list: readonly MoneyPiece[]): string {
  return list.map((piece) => formatMoney(piece)).join(' + ');
}

export function solutionText(answer: Answer): string {
  switch (answer.type) {
    case 'choice':
      return renderText(answer.options.find((o) => o.correct)?.label ?? '');
    case 'money':
      return formatMoney(answer.correct);
    case 'number':
      return String(answer.correct);
    case 'pay': {
      // minimale Kombination bzw. eine mit genau exactCount Stücken
      const combo = findCombination(answer.target, answer.palette, answer.exactCount);
      return combo ? pieces(combo) : '';
    }
    case 'pay-variants':
      return payCombinations(answer.target, answer.palette, answer.required)
        .map(pieces)
        .join(' oder ');
    case 'order':
      return [...answer.entries]
        .sort((a, b) => a.value - b.value)
        .map((entry) => renderText(entry.label))
        .join(', ');
    case 'select': {
      const names = new Map(answer.items.map((item) => [item.itemId, renderText(item.label)]));
      return selectSolutions(answer)
        .map((set) => set.map((id) => names.get(id) ?? id).join(' + '))
        .join(' oder ');
    }
    case 'grid':
      return answer.cells
        .filter((cell) => !cell.given)
        .map((cell) => (answer.unit === 'cents' ? formatMoney(cell.value) : String(cell.value)))
        .join(', ');
    case 'code':
      return answer.digits.join(', ');
  }
}
