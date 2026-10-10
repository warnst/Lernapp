import { hashSeed, mulberry32, shuffle } from './random';
import type { ChoiceAnswer, ChoiceOption } from './types';

/**
 * Reihenfolge der Antwortkarten: mit shuffle fest gemischt aus der Aufgaben-ID, sonst wie in den
 * Daten. App und Druck zeigen so dieselbe Reihenfolge (docs/06 4).
 */
export function choiceOrder(answer: ChoiceAnswer, seedId: string): ChoiceOption[] {
  return answer.shuffle ? shuffle(mulberry32(hashSeed(seedId)), answer.options) : answer.options;
}
