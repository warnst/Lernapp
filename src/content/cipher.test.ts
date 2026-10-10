import { describe, expect, it } from 'vitest';
import { CASE_LETTER, CIPHER_MESSAGES } from './cipher';

const distinctLetters = (text: string): number => new Set(text.replace(/ /g, '')).size;

// Grenzen je Stufe: Länge inkl. Leerzeichen, verschiedene Buchstaben, Wörter
const LIMITS = {
  3: { length: 14, letters: 8, words: 3 },
  4: { length: 26, letters: 12, words: Infinity },
} as const;

describe('Geheimbotschaften (docs/12 3.8)', () => {
  it('je 24 Nachrichten für Stufe 3 und 4', () => {
    expect(CIPHER_MESSAGES.filter((m) => m.from === 3)).toHaveLength(24);
    expect(CIPHER_MESSAGES.filter((m) => m.from === 4)).toHaveLength(24);
  });

  it('IDs und Texte eindeutig', () => {
    const ids = CIPHER_MESSAGES.map((m) => m.id);
    const texts = CIPHER_MESSAGES.map((m) => m.text);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('nur A–Z und einzelne Leerzeichen, Längen und Buchstaben je Stufe', () => {
    for (const { text, from } of CIPHER_MESSAGES) {
      const limit = LIMITS[from];
      expect(text).toMatch(/^[A-Z]+( [A-Z]+)*$/);
      expect(text.length, text).toBeLessThanOrEqual(limit.length);
      expect(distinctLetters(text), text).toBeLessThanOrEqual(limit.letters);
      expect(text.split(' ').length, text).toBeLessThanOrEqual(limit.words);
    }
  });

  it('Beispiele aus der Spezifikation sind dabei', () => {
    const texts = CIPHER_MESSAGES.map((m) => m.text);
    expect(texts).toContain('SCHATZ IM SAND');
    expect(texts).toContain('KIKO MAG KEKSE');
  });

  it('Botschaft im Geheimbrief-Fall', () => {
    expect(CASE_LETTER).toMatch(/^[A-Z]+( [A-Z]+)*$/);
    expect(CASE_LETTER.length).toBeLessThanOrEqual(16);
    expect(distinctLetters(CASE_LETTER)).toBeLessThanOrEqual(9);
  });
});
