import { describe, expect, it } from 'vitest';
import { choiceOrder } from './choice';
import type { ChoiceAnswer } from './types';

const answer: ChoiceAnswer = {
  type: 'choice',
  layout: 'cards',
  shuffle: false,
  options: [
    { id: 'a', label: 'A', correct: true },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
    { id: 'd', label: 'D' },
  ],
};

describe('choiceOrder', () => {
  it('ohne shuffle bleibt die Reihenfolge der Daten', () => {
    expect(choiceOrder(answer, 's1-t1').map((o) => o.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('mit shuffle fest gemischt aus der Aufgaben-ID', () => {
    const shuffled = { ...answer, shuffle: true };
    const first = choiceOrder(shuffled, 's1-t1').map((o) => o.id);
    expect(choiceOrder(shuffled, 's1-t1').map((o) => o.id)).toEqual(first);
    expect([...first].sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});
