import { describe, expect, it } from 'vitest';
import { renderText, speakText } from './text';

const NB = ' ';

describe('renderText', () => {
  it('löst alle Token-Arten auf', () => {
    expect(renderText('{{120}}')).toBe(`1,20${NB}€`);
    expect(renderText('{{200}}')).toBe(`2${NB}€`);
    expect(renderText('{{85}}')).toBe(`85${NB}Cent`);
    expect(renderText('{{85|eur}}')).toBe(`0,85${NB}€`);
    expect(renderText('{{200|full}}')).toBe(`2,00${NB}€`);
  });

  it('löst mehrere Tokens in einem Satz auf', () => {
    expect(renderText('Eine Kokosnuss kostet {{120}}. Ein Bananenbrot kostet {{230}}.')).toBe(
      `Eine Kokosnuss kostet 1,20${NB}€. Ein Bananenbrot kostet 2,30${NB}€.`,
    );
  });

  it('lässt Text ohne Tokens und unbekannte Tokens unverändert', () => {
    expect(renderText('Wie viele Muscheln siehst du?')).toBe('Wie viele Muscheln siehst du?');
    expect(renderText('{{abc}}')).toBe('{{abc}}');
    expect(renderText('{{85|xyz}}')).toBe('{{85|xyz}}');
  });
});

describe('speakText', () => {
  it('liest Tokens aus', () => {
    expect(speakText('{{120}}')).toBe('1 Euro 20');
    expect(speakText('{{200}}')).toBe('2 Euro');
    expect(speakText('{{85}}')).toBe('85 Cent');
    expect(speakText('{{85|eur}}')).toBe('0 Euro 85');
    expect(speakText('{{200|full}}')).toBe('2 Euro');
  });

  it('liest wörtliche Beträge aus', () => {
    expect(speakText(`Das kostet 1,50${NB}€.`)).toBe('Das kostet 1 Euro 50.');
    expect(speakText('Das kostet 1,50 €.')).toBe('Das kostet 1 Euro 50.');
    expect(speakText('Das kostet 0,85€.')).toBe('Das kostet 0 Euro 85.');
    expect(speakText('Das kostet 1,05 €.')).toBe('Das kostet 1 Euro 5.');
    expect(speakText('Das sind 2,00 €.')).toBe('Das sind 2 Euro.');
    expect(speakText(`Du hast 2${NB}€.`)).toBe('Du hast 2 Euro.');
    expect(speakText(`Das sind 50${NB}Cent.`)).toBe('Das sind 50 Cent.');
  });

  it('liest Rechenzeichen und den Tintenfleck', () => {
    expect(speakText(`2${NB}€ − 1,20${NB}€ = 80${NB}Cent`)).toBe(
      '2 Euro minus 1 Euro 20 gleich 80 Cent',
    );
    expect(speakText('3 + ▢ = 7')).toBe('3 plus Fleck gleich 7');
  });

  it('lässt Bindestriche in Wörtern stehen', () => {
    expect(speakText('die 2-Euro-Münze')).toBe('die 2-Euro-Münze');
  });
});
