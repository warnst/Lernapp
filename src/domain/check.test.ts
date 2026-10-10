import { describe, expect, it } from 'vitest';
import { type AnswerInput, type CheckTexts, checkAnswer } from './check';
import type {
  Answer,
  ChoiceAnswer,
  CodeAnswer,
  GridAnswer,
  OrderAnswer,
  PayAnswer,
  PayVariantsAnswer,
  SelectAnswer,
} from './types';

// Platzhalter-Texte: zeigen, welche Bausteine mit welchen Werten benutzt werden.
const T: CheckTexts = {
  centNote: (cents, euro) => `note(${String(cents)}|${euro})`,
  payNotMinimal: (target) => `minimal(${target})`,
  payExactCount: (count) => `exact(${String(count)})`,
  variantDuplicate: 'duplicate',
  orderWrongPlace: (label) => `place(${label})`,
  selectCount: (count) => `count(${String(count)})`,
  selectTooMuch: (sum) => `much(${sum})`,
  selectTooLittle: (sum) => `little(${sum})`,
  affordableTooExpensive: (name, price, budget) => `expensive(${name}|${price}|${budget})`,
  affordableMissingExact: (budget) => `exactBudget(${budget})`,
  affordableMissingOther: 'missingOther',
  gridFeedback: (correct, wrong, shape) => `grid(${String(correct)}|${String(wrong)}|${shape})`,
  codeStuck: (symbol) => `stuck(${symbol})`,
  clockHour: 'hour',
  clockMinute: 'minute',
};

const NB = ' ';
const check = (
  answer: Answer,
  input: AnswerInput,
  mistakes = [] as { value: number; feedback: string }[],
) => checkAnswer(answer, input, T, mistakes);

describe('choice', () => {
  const answer: ChoiceAnswer = {
    type: 'choice',
    layout: 'cards',
    shuffle: false,
    options: [
      { id: 'a', label: '3' },
      { id: 'b', label: '4', correct: true },
      { id: 'c', label: '5', feedback: 'Hast du eine Muschel zweimal gezählt?' },
    ],
  };

  it('erkennt die richtige Option', () => {
    expect(check(answer, { type: 'choice', optionId: 'b' })).toEqual({ status: 'correct' });
  });

  it('liefert den Hinweis der gewählten Option', () => {
    expect(check(answer, { type: 'choice', optionId: 'c' })).toEqual({
      status: 'wrong',
      feedback: 'Hast du eine Muschel zweimal gezählt?',
    });
  });

  it('kommt ohne Hinweis aus', () => {
    expect(check(answer, { type: 'choice', optionId: 'a' })).toEqual({ status: 'wrong' });
  });

  it('wirft bei unbekannter Option', () => {
    expect(() => check(answer, { type: 'choice', optionId: 'x' })).toThrow();
  });
});

describe('money', () => {
  const answer: Answer = { type: 'money', correct: 120 };
  const mistakes = [{ value: 320, feedback: 'Du hast 2 € dazugerechnet.' }];

  it('erkennt den richtigen Betrag', () => {
    expect(check(answer, { type: 'money', euro: '1', cent: '20' }, mistakes)).toEqual({
      status: 'correct',
    });
  });

  it('gibt bei Cent ab 100 einen Hinweis zur Euro-Schreibweise', () => {
    expect(check(answer, { type: 'money', euro: '', cent: '120' })).toEqual({
      status: 'correct',
      note: `note(120|1,20${NB}€)`,
    });
    expect(
      check({ type: 'money', correct: 200 }, { type: 'money', euro: '', cent: '200' }),
    ).toEqual({ status: 'correct', note: `note(200|2${NB}€)` });
  });

  it('nutzt passende Fehlerhinweise', () => {
    expect(check(answer, { type: 'money', euro: '3', cent: '20' }, mistakes)).toEqual({
      status: 'wrong',
      feedback: 'Du hast 2 € dazugerechnet.',
    });
  });

  it('sagt sonst, ob es zu viel oder zu wenig ist', () => {
    expect(check(answer, { type: 'money', euro: '1', cent: '50' }, mistakes)).toEqual({
      status: 'wrong',
      direction: 'too-much',
    });
    expect(check(answer, { type: 'money', euro: '', cent: '' })).toEqual({
      status: 'wrong',
      direction: 'too-little',
    });
  });

  it('liest 1,5 nicht als 1,05', () => {
    expect(check({ type: 'money', correct: 105 }, { type: 'money', euro: '1', cent: '5' })).toEqual(
      {
        status: 'correct',
      },
    );
    expect(check({ type: 'money', correct: 150 }, { type: 'money', euro: '1', cent: '5' })).toEqual(
      {
        status: 'wrong',
        direction: 'too-little',
      },
    );
  });
});

describe('number', () => {
  const answer: Answer = { type: 'number', correct: 7 };
  const mistakes = [{ value: 8, feedback: 'Hast du einen Seestern zweimal gezählt?' }];

  it('prüft ganze Zahlen mit Hinweisen und Richtung', () => {
    expect(check(answer, { type: 'number', value: 7 }, mistakes)).toEqual({ status: 'correct' });
    expect(check(answer, { type: 'number', value: 8 }, mistakes)).toEqual({
      status: 'wrong',
      feedback: 'Hast du einen Seestern zweimal gezählt?',
    });
    expect(check(answer, { type: 'number', value: 9 }, mistakes)).toEqual({
      status: 'wrong',
      direction: 'too-much',
    });
    expect(check(answer, { type: 'number', value: 6 })).toEqual({
      status: 'wrong',
      direction: 'too-little',
    });
  });
});

describe('pay', () => {
  const base: PayAnswer = {
    type: 'pay',
    target: 75,
    palette: [50, 20, 10, 5, 2, 1],
    showTotal: true,
  };

  it('akzeptiert jede passende Summe', () => {
    expect(check(base, { type: 'pay', pieces: [50, 20, 5] })).toEqual({ status: 'correct' });
    expect(check(base, { type: 'pay', pieces: [20, 20, 20, 10, 5] })).toEqual({
      status: 'correct',
    });
  });

  it('sagt, ob zu viel oder zu wenig auf dem Tablett liegt', () => {
    expect(check(base, { type: 'pay', pieces: [50, 50] })).toEqual({
      status: 'wrong',
      direction: 'too-much',
    });
    expect(check(base, { type: 'pay', pieces: [] })).toEqual({
      status: 'wrong',
      direction: 'too-little',
    });
  });

  it('minimal: richtige Summe mit zu vielen Münzen ist partial', () => {
    const answer: PayAnswer = { ...base, minimal: true };
    expect(check(answer, { type: 'pay', pieces: [50, 20, 5] })).toEqual({ status: 'correct' });
    expect(check(answer, { type: 'pay', pieces: [50, 10, 10, 5] })).toEqual({
      status: 'partial',
      feedback: `minimal(75${NB}Cent)`,
    });
  });

  it('exactCount: falsche Anzahl bekommt den Hinweis, mit Richtung nur bei falscher Summe', () => {
    const answer: PayAnswer = {
      type: 'pay',
      target: 70,
      palette: [50, 20, 10],
      showTotal: false,
      exactCount: 2,
    };
    expect(check(answer, { type: 'pay', pieces: [50, 20] })).toEqual({ status: 'correct' });
    expect(check(answer, { type: 'pay', pieces: [50, 10, 10] })).toEqual({
      status: 'wrong',
      feedback: 'exact(2)',
    });
    expect(check(answer, { type: 'pay', pieces: [50] })).toEqual({
      status: 'wrong',
      feedback: 'exact(2)',
      direction: 'too-little',
    });
    expect(check(answer, { type: 'pay', pieces: [50, 50] })).toEqual({
      status: 'wrong',
      direction: 'too-much',
    });
  });
});

describe('pay-variants', () => {
  const answer: PayVariantsAnswer = {
    type: 'pay-variants',
    target: 100,
    palette: [50, 20, 10],
    required: 2,
    showTotal: true,
  };

  it('merkt eine neue Möglichkeit und meldet, wie viele noch fehlen', () => {
    expect(check(answer, { type: 'pay-variants', pieces: [50, 50], found: [] })).toEqual({
      status: 'correct',
      remaining: 1,
    });
  });

  it('ist fertig, wenn genug Möglichkeiten gefunden sind', () => {
    expect(
      check(answer, { type: 'pay-variants', pieces: [20, 20, 20, 20, 20], found: [[50, 50]] }),
    ).toEqual({ status: 'correct' });
  });

  it('erkennt doppelte Möglichkeiten in anderer Reihenfolge (zählt nicht als Fehlversuch)', () => {
    expect(
      check(answer, { type: 'pay-variants', pieces: [20, 50, 10, 20], found: [[50, 20, 20, 10]] }),
    ).toEqual({ status: 'partial', feedback: 'duplicate' });
  });

  it('sagt bei falscher Summe die Richtung', () => {
    expect(check(answer, { type: 'pay-variants', pieces: [50], found: [] })).toEqual({
      status: 'wrong',
      direction: 'too-little',
    });
  });
});

describe('order', () => {
  const answer: OrderAnswer = {
    type: 'order',
    direction: 'asc',
    entries: [
      { id: 'c50', label: '50-Cent-Münze', value: 50 },
      { id: 'e1', label: '1-Euro-Münze', value: 100 },
      { id: 'c5', label: '5-Cent-Münze', value: 5 },
      { id: 'c10', label: '10-Cent-Münze', value: 10 },
    ],
  };

  it('erkennt die aufsteigende Reihenfolge', () => {
    expect(check(answer, { type: 'order', ids: ['c5', 'c10', 'c50', 'e1'] })).toEqual({
      status: 'correct',
    });
  });

  it('nennt den Eintrag an der ersten falschen Stelle', () => {
    expect(check(answer, { type: 'order', ids: ['c10', 'c5', 'c50', 'e1'] })).toEqual({
      status: 'wrong',
      feedback: 'place(10-Cent-Münze)',
    });
    expect(check(answer, { type: 'order', ids: ['c5', 'c10', 'e1', 'c50'] })).toEqual({
      status: 'wrong',
      feedback: 'place(1-Euro-Münze)',
    });
  });

  it('wirft bei unbekannten oder fehlenden Einträgen', () => {
    expect(() => check(answer, { type: 'order', ids: ['c5', 'c10', 'c50', 'x'] })).toThrow();
    expect(() => check(answer, { type: 'order', ids: ['c5', 'c10'] })).toThrow();
  });
});

describe('select / sum', () => {
  const answer: SelectAnswer = {
    type: 'select',
    items: [
      { itemId: 'eis', label: 'Eis', price: 150 },
      { itemId: 'saft', label: 'Saft', price: 120 },
      { itemId: 'keks', label: 'Keks', price: 80 },
    ],
    rule: { kind: 'sum', count: 2, target: 230 },
  };

  it('prüft Anzahl und Summe', () => {
    expect(check(answer, { type: 'select', itemIds: ['eis', 'keks'] })).toEqual({
      status: 'correct',
    });
    expect(check(answer, { type: 'select', itemIds: ['eis'] })).toEqual({
      status: 'wrong',
      feedback: 'count(2)',
    });
    expect(check(answer, { type: 'select', itemIds: ['eis', 'saft'] })).toEqual({
      status: 'wrong',
      feedback: `much(2,70${NB}€)`,
      direction: 'too-much',
    });
    expect(check(answer, { type: 'select', itemIds: ['saft', 'keks'] })).toEqual({
      status: 'wrong',
      feedback: `little(2${NB}€)`,
      direction: 'too-little',
    });
  });

  it('wirft bei Sachen ohne Preis', () => {
    const broken: SelectAnswer = {
      ...answer,
      items: [{ itemId: 'x', label: 'X' }, ...answer.items],
    };
    expect(() => check(broken, { type: 'select', itemIds: ['x', 'eis'] })).toThrow();
  });
});

describe('select / affordable', () => {
  const answer: SelectAnswer = {
    type: 'select',
    items: [
      { itemId: 'eis', label: 'Eis', price: 150 },
      { itemId: 'saft', label: 'Saft', price: 200 },
      { itemId: 'keks', label: 'Keks', price: 80 },
      { itemId: 'ball', label: 'Ball', price: 350 },
    ],
    rule: { kind: 'affordable', budget: 200 },
  };

  it('erkennt die vollständige Auswahl', () => {
    expect(check(answer, { type: 'select', itemIds: ['keks', 'eis', 'saft'] })).toEqual({
      status: 'correct',
    });
  });

  it('nennt eine zu teure Sache', () => {
    expect(check(answer, { type: 'select', itemIds: ['eis', 'ball'] })).toEqual({
      status: 'wrong',
      feedback: `expensive(Ball|3,50${NB}€|2${NB}€)`,
    });
  });

  it('erinnert daran, dass genau das Budget auch reicht', () => {
    expect(check(answer, { type: 'select', itemIds: ['eis', 'keks'] })).toEqual({
      status: 'wrong',
      feedback: `exactBudget(2${NB}€)`,
    });
  });

  it('meldet eine fehlende günstigere Sache', () => {
    expect(check(answer, { type: 'select', itemIds: ['eis', 'saft'] })).toEqual({
      status: 'wrong',
      feedback: 'missingOther',
    });
  });
});

describe('grid', () => {
  const answer: GridAnswer = {
    type: 'grid',
    shape: 'wall',
    unit: 'number',
    cells: [
      { id: 'r0c0', value: 4, given: true },
      { id: 'r0c1', value: 3, given: true },
      { id: 'r0c2', value: 5, given: true },
      { id: 'r1c0', value: 7, given: true },
      { id: 'r1c1', value: 8, given: false },
      { id: 'r2c0', value: 15, given: false },
    ],
  };

  it('erkennt alle richtigen Felder', () => {
    expect(check(answer, { type: 'grid', values: { r1c1: 8, r2c0: 15 } })).toEqual({
      status: 'correct',
    });
  });

  it('zählt richtige Felder und macht sie fest', () => {
    expect(check(answer, { type: 'grid', values: { r1c1: 8, r2c0: 14 } })).toEqual({
      status: 'wrong',
      feedback: 'grid(1|1|wall)',
      correctCells: ['r1c1'],
    });
  });

  it('sagt bei keinem richtigen Feld nur den zweiten Satz', () => {
    expect(check(answer, { type: 'grid', values: { r1c1: 9 } })).toEqual({
      status: 'wrong',
      feedback: 'grid(0|2|wall)',
      correctCells: [],
    });
  });
});

describe('code', () => {
  const answer: CodeAnswer = { type: 'code', digits: [7, 8, 5] };
  const symbols = ['stern', 'muschel', 'fisch'] as const;

  it('öffnet bei richtigem Code', () => {
    expect(check(answer, { type: 'code', digits: [7, 8, 5], symbols: [...symbols] })).toEqual({
      status: 'correct',
    });
  });

  it('nennt das erste klemmende Rad', () => {
    expect(check(answer, { type: 'code', digits: [7, 2, 1], symbols: [...symbols] })).toEqual({
      status: 'wrong',
      feedback: 'stuck(muschel)',
    });
  });

  it('wirft, wenn einem Rad das Symbol fehlt', () => {
    expect(() => check(answer, { type: 'code', digits: [1, 8, 5], symbols: [] })).toThrow();
  });
});

describe('Uhr stellen', () => {
  const answer: Answer = { type: 'clock', correct: { hour: 3, minute: 30 }, step: 30 };
  it('richtig, auch 12 und 0 sind gleich', () => {
    expect(check(answer, { type: 'clock', time: { hour: 3, minute: 30 } })).toEqual({
      status: 'correct',
    });
    const noon: Answer = { type: 'clock', correct: { hour: 12, minute: 0 }, step: 60 };
    expect(check(noon, { type: 'clock', time: { hour: 0, minute: 0 } }).status).toBe('correct');
  });
  it('erst der große, dann der kleine Zeiger', () => {
    expect(check(answer, { type: 'clock', time: { hour: 4, minute: 0 } })).toEqual({
      status: 'wrong',
      feedback: 'minute',
    });
    expect(check(answer, { type: 'clock', time: { hour: 4, minute: 30 } })).toEqual({
      status: 'wrong',
      feedback: 'hour',
    });
    expect(() => check(answer, { type: 'number', value: 3 })).toThrow();
  });
});

describe('falsche Eingabeart', () => {
  const answers: Answer[] = [
    { type: 'choice', layout: 'cards', shuffle: false, options: [] },
    { type: 'money', correct: 1 },
    { type: 'number', correct: 1 },
    { type: 'pay', target: 1, palette: [1], showTotal: true },
    { type: 'pay-variants', target: 1, palette: [1], required: 1, showTotal: true },
    { type: 'order', entries: [], direction: 'asc' },
    { type: 'select', items: [], rule: { kind: 'sum', count: 1, target: 1 } },
    { type: 'grid', shape: 'wall', unit: 'number', cells: [] },
    { type: 'code', digits: [1] },
  ];

  it.each(answers)('wirft bei $type mit unpassender Eingabe', (answer) => {
    const input: AnswerInput =
      answer.type === 'number' ? { type: 'choice', optionId: 'a' } : { type: 'number', value: 1 };
    expect(() => check(answer, input)).toThrow(/passt nicht/);
  });

  it('wirft bei unbekanntem Antworttyp', () => {
    // absichtlich ungültige Daten, wie sie aus kaputtem JSON kommen könnten
    const unknown = { type: 'zauber' } as unknown as Answer;
    expect(() => check(unknown, { type: 'number', value: 1 })).toThrow(/Unerwarteter Fall/);
  });
});
