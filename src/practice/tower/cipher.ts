import { mulberry32, shuffle } from '@/domain/random';

// Schlüssel der Geheimschrift (docs/12 3.8): je Buchstabe ein Zeichen (Nummer) bzw. A = 1, B = 2 …
// Zeichen und Reihenfolge der Tabelle werden pro Rätsel neu gemischt.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface CipherKey {
  letter: string;
  /** Zeichen-Nummer oder Zahl (A = 1) */
  code: number;
}

/** Verschiedene Buchstaben der Botschaft, alphabetisch */
export function cipherLetters(message: string): string[] {
  return [...new Set(Array.from(message.replace(/ /g, '')))].sort();
}

export function cipherKey(
  message: string,
  seed: number,
  numbers: boolean,
  symbolCount: number,
): CipherKey[] {
  const symbols = shuffle(
    mulberry32(seed),
    Array.from({ length: symbolCount }, (_, i) => i),
  );
  return shuffle(
    mulberry32(seed + 1),
    cipherLetters(message).map((letter, i) => ({
      letter,
      code: numbers ? ALPHABET.indexOf(letter) + 1 : (symbols[i] ?? i),
    })),
  );
}
