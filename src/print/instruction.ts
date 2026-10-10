import { PRINT } from '@/content/print';
import type { Answer } from '@/domain/types';

/** Anweisung vor der Frage, falls der Typ eine braucht. */
export function instructionFor(answer: Answer): string | undefined {
  switch (answer.type) {
    case 'choice':
      return PRINT.cross;
    case 'pay':
      return answer.exactCount === undefined ? PRINT.drawCoins : PRINT.drawExact(answer.exactCount);
    case 'pay-variants':
      return PRINT.drawVariants;
    case 'order':
      return PRINT.orderNumbers(answer.entries.length);
    case 'select':
      return answer.rule.kind === 'sum' ? PRINT.circleSum : PRINT.circleAffordable;
    case 'grid':
      return PRINT.fillGrid;
    default:
      return undefined;
  }
}
