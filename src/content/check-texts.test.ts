import { describe, expect, it } from 'vitest';
import { CHECK_TEXTS as T } from './check-texts';

const NB = ' ';

describe('CHECK_TEXTS (wörtlich aus docs/03, Abschnitt 6)', () => {
  it('bildet die Sätze', () => {
    expect(T.centNote(120, `1,20${NB}€`)).toBe(`120${NB}Cent sind übrigens 1,20${NB}€.`);
    expect(T.payNotMinimal(`75${NB}Cent`)).toBe(
      `Richtig, das sind 75${NB}Cent! Geht es auch mit weniger Münzen?`,
    );
    expect(T.payExactCount(2)).toBe('Es müssen genau 2 Münzen sein.');
    expect(T.variantDuplicate).toBe('Diese Möglichkeit hast du schon. Findest du eine andere?');
    expect(T.orderWrongPlace('Die 5-Cent-Münze')).toBe(
      'Die 5-Cent-Münze steht noch nicht an der richtigen Stelle.',
    );
    expect(T.selectCount(2)).toBe('Wähle genau 2 Sachen.');
    expect(T.selectTooMuch('2,70 €')).toBe('Deine Sachen kosten zusammen 2,70 €. Das ist zu viel.');
    expect(T.selectTooLittle('2 €')).toBe('Deine Sachen kosten zusammen 2 €. Das ist zu wenig.');
    expect(T.affordableTooExpensive('Ball', '3,50 €', '2 €')).toBe(
      'Ball kostet 3,50 €. Das ist mehr als 2 €.',
    );
    expect(T.affordableMissingExact('2 €')).toBe(
      'Es fehlt noch etwas. Denk dran: Genau 2 € reicht auch!',
    );
    expect(T.affordableMissingOther).toBe('Es fehlt noch eine Sache, die du dir leisten kannst.');
  });

  it('zählt richtige Steine bzw. Felder (docs/10, Abschnitt 3)', () => {
    expect(T.gridFeedback(2, 1, 'wall')).toBe(
      '2 Steine stimmen schon. Schau dir den letzten noch einmal an.',
    );
    expect(T.gridFeedback(1, 2, 'wall')).toBe(
      'Ein Stein stimmt schon. Schau dir die anderen noch einmal an.',
    );
    expect(T.gridFeedback(0, 2, 'wall')).toBe('Schau dir die Steine noch einmal an.');
    expect(T.gridFeedback(2, 1, 'triangle')).toBe(
      '2 Felder stimmen schon. Schau dir das letzte noch einmal an.',
    );
    expect(T.gridFeedback(1, 2, 'triangle')).toBe(
      'Ein Feld stimmt schon. Schau dir die anderen noch einmal an.',
    );
    expect(T.gridFeedback(0, 3, 'triangle')).toBe('Schau dir die Felder noch einmal an.');
  });

  it('nennt das Rad mit dem richtigen Artikel', () => {
    expect(T.codeStuck('stern')).toBe(
      'Das Schloss klemmt noch. Das Rad mit dem Stern stimmt noch nicht.',
    );
    expect(T.codeStuck('muschel')).toBe(
      'Das Schloss klemmt noch. Das Rad mit der Muschel stimmt noch nicht.',
    );
    expect(T.codeStuck('fisch')).toContain('mit dem Fisch');
    expect(T.codeStuck('krebs')).toContain('mit dem Krebs');
  });

  it('enthält nie das Wort „falsch“', () => {
    const samples = [
      T.centNote(1, 'x'),
      T.payNotMinimal('x'),
      T.payExactCount(1),
      T.variantDuplicate,
      T.orderWrongPlace('x'),
      T.selectCount(1),
      T.selectTooMuch('x'),
      T.selectTooLittle('x'),
      T.affordableTooExpensive('x', 'y', 'z'),
      T.affordableMissingExact('x'),
      T.affordableMissingOther,
      T.gridFeedback(1, 1, 'wall'),
      T.gridFeedback(0, 1, 'triangle'),
      T.codeStuck('stern'),
    ];
    for (const text of samples) expect(text.toLowerCase()).not.toContain('falsch');
  });
});
