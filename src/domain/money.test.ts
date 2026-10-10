import { describe, expect, it } from 'vitest';
import {
  formatMoney,
  minPieces,
  payCombinations,
  countWays,
  findCombination,
  moneyFromFields,
  parseMoney,
  sameMultiset,
  speakMoney,
  sumPieces,
} from './money';

const NB = ' ';

describe('formatMoney', () => {
  it.each([
    [0, 'auto', `0${NB}Cent`],
    [5, 'auto', `5${NB}Cent`],
    [85, 'auto', `85${NB}Cent`],
    [99, 'auto', `99${NB}Cent`],
    [100, 'auto', `1${NB}€`],
    [200, 'auto', `2${NB}€`],
    [105, 'auto', `1,05${NB}€`],
    [120, 'auto', `1,20${NB}€`],
    [1050, 'auto', `10,50${NB}€`],
    [85, 'eur', `0,85${NB}€`],
    [200, 'eur', `2,00${NB}€`],
    [5, 'eur', `0,05${NB}€`],
    [120, 'eur', `1,20${NB}€`],
    [200, 'full', `2,00${NB}€`],
    [85, 'full', `85${NB}Cent`],
    [150, 'full', `1,50${NB}€`],
  ] as const)('%i Cent im Modus %s → %s', (cents, mode, expected) => {
    expect(formatMoney(cents, mode)).toBe(expected);
  });

  it('nutzt standardmäßig den Modus auto', () => {
    expect(formatMoney(85)).toBe(`85${NB}Cent`);
  });

  it('wirft bei Kommazahlen und negativen Beträgen', () => {
    expect(() => formatMoney(1.5)).toThrow(RangeError);
    expect(() => formatMoney(-1)).toThrow(RangeError);
  });
});

describe('speakMoney', () => {
  it.each([
    [85, '85 Cent'],
    [0, '0 Cent'],
    [200, '2 Euro'],
    [120, '1 Euro 20'],
    [105, '1 Euro 5'],
    [1000, '10 Euro'],
  ])('%i → %s', (cents, expected) => {
    expect(speakMoney(cents)).toBe(expected);
  });

  it('liest im Modus eur auch kleine Beträge mit Euro', () => {
    expect(speakMoney(85, 'eur')).toBe('0 Euro 85');
    expect(speakMoney(200, 'eur')).toBe('2 Euro');
    expect(speakMoney(200, 'full')).toBe('2 Euro');
  });

  it('wirft bei ungültigen Beträgen', () => {
    expect(() => speakMoney(0.5)).toThrow(RangeError);
  });
});

describe('parseMoney', () => {
  it.each([
    ['1,5', 150],
    ['1,50', 150],
    ['1,50 €', 150],
    ['1,50€', 150],
    [`1,50${NB}€`, 150],
    ['1.50', 150],
    ['1 €', 100],
    ['3', 300],
    ['0,85', 85],
    ['1,05', 105],
    ['150 ct', 150],
    ['150 Cent', 150],
    ['150cent', 150],
    ['85 CENT', 85],
    ['  2,30  ', 230],
    ['2 Euro', 200],
    ['2,5 EUR', 250],
    ['€ 4,20', 420],
    ['0', 0],
    ['10,00 €', 1000],
  ])('„%s“ → %i', (input, expected) => {
    expect(parseMoney(input)).toBe(expected);
  });

  it.each([
    '',
    '   ',
    'abc',
    '1,555',
    '1,',
    ',50',
    '-1',
    '1,5 Cent',
    '1 € 50',
    '1.000,00',
    '€',
    'Cent',
    '12345678',
  ])('„%s“ → null', (input) => {
    expect(parseMoney(input)).toBeNull();
  });
});

describe('moneyFromFields', () => {
  it('rechnet Euro und Cent zusammen', () => {
    expect(moneyFromFields('3', '50')).toBe(350);
    expect(moneyFromFields('1', '5')).toBe(105);
  });

  it('wertet leere Felder als 0', () => {
    expect(moneyFromFields('', '85')).toBe(85);
    expect(moneyFromFields('2', '')).toBe(200);
    expect(moneyFromFields('', '')).toBe(0);
  });

  it('erlaubt Cent ab 100', () => {
    expect(moneyFromFields('0', '120')).toBe(120);
    expect(moneyFromFields('1', '120')).toBe(220);
  });

  it('wirft bei Zeichen, die keine Ziffern sind', () => {
    expect(() => moneyFromFields('1,5', '')).toThrow(RangeError);
    expect(() => moneyFromFields('', 'x')).toThrow(RangeError);
  });
});

describe('sumPieces', () => {
  it('addiert Münzen und Scheine', () => {
    expect(sumPieces([])).toBe(0);
    expect(sumPieces([50, 20, 5])).toBe(75);
    expect(sumPieces([500, 200, 1])).toBe(701);
  });
});

describe('minPieces', () => {
  it('findet die kleinste Anzahl', () => {
    expect(minPieces(75, [50, 20, 10, 5, 2, 1])).toBe(3);
    expect(minPieces(0, [1])).toBe(0);
    expect(minPieces(100, [50, 20, 10])).toBe(2);
    expect(minPieces(388, [200, 100, 50, 20, 10, 5, 2, 1])).toBe(8);
  });

  it('rechnet nicht gierig, wenn das nicht optimal ist', () => {
    // gierig (50 zuerst) bliebe bei 10 Cent hängen; richtig sind 3 × 20 Cent
    expect(minPieces(60, [50, 20])).toBe(3);
  });

  it('liefert null, wenn der Betrag nicht legbar ist', () => {
    expect(minPieces(3, [2])).toBeNull();
    expect(minPieces(5, [])).toBeNull();
  });
});

describe('sameMultiset', () => {
  it('vergleicht unabhängig von der Reihenfolge', () => {
    expect(sameMultiset([50, 20, 20, 10], [20, 10, 50, 20])).toBe(true);
    expect(sameMultiset([], [])).toBe(true);
  });

  it('erkennt Unterschiede in Anzahl und Werten', () => {
    expect(sameMultiset([50, 50], [50])).toBe(false);
    expect(sameMultiset([50, 20], [50, 10])).toBe(false);
    expect(sameMultiset([20, 20, 10], [20, 10, 10])).toBe(false);
  });
});

describe('payCombinations', () => {
  it('findet alle Möglichkeiten ohne Reihenfolge', () => {
    expect(payCombinations(100, [50, 20, 10])).toHaveLength(10);
    expect(payCombinations(5, [2, 1])).toEqual([
      [2, 2, 1],
      [2, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ]);
  });

  it('ignoriert doppelte Palettenwerte und findet bei 0 genau eine leere Lösung', () => {
    expect(payCombinations(4, [2, 2, 1])).toHaveLength(3);
    expect(payCombinations(0, [1])).toEqual([[]]);
  });

  it('liefert nichts, wenn der Betrag nicht legbar ist', () => {
    expect(payCombinations(3, [2])).toEqual([]);
  });
});

describe('payCombinations mit Grenze', () => {
  it('hört nach limit Möglichkeiten auf', () => {
    expect(payCombinations(100, [50, 20, 10], 2)).toEqual([
      [50, 50],
      [50, 20, 20, 10],
    ]);
  });
});

describe('countWays', () => {
  it('zählt Möglichkeiten und deckelt bei cap', () => {
    expect(countWays(100, [50, 20, 10], 100)).toBe(10);
    expect(countWays(100, [50, 20, 10], 3)).toBe(3);
    expect(countWays(3, [2], 5)).toBe(0);
    expect(countWays(0, [1], 5)).toBe(1);
    expect(countWays(4785, [1, 2, 5, 10, 20, 50, 100, 200], 1000)).toBe(1000);
  });
});

describe('findCombination', () => {
  it('findet die kürzeste Möglichkeit', () => {
    expect(findCombination(75, [50, 20, 10, 5, 2, 1])).toEqual([50, 20, 5]);
    expect(findCombination(0, [1])).toEqual([]);
  });

  it('findet eine Möglichkeit mit genau count Stücken', () => {
    expect(findCombination(150, [1, 2, 5, 10, 20, 50, 100, 200], 2)).toEqual([100, 50]);
    expect(findCombination(5, [1, 2, 5], 1)).toEqual([5]);
    expect(findCombination(4, [2, 1], 3)).toEqual([2, 1, 1]);
  });

  it('liefert null, wenn es nicht geht', () => {
    expect(findCombination(3, [2])).toBeNull();
    expect(findCombination(150, [100, 50], 4)).toBeNull();
    expect(findCombination(5, [], 0)).toBeNull();
  });
});
