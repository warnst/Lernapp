import { randomInt, type Rng } from '@/domain/random';
import type { Cents, Mistake, MoneyPiece, StufeConfig } from '@/domain/types';
import { tok } from '../build';
import type { Distractor } from '../distractors';

// Bausteine für „muenzen-zaehlen“ (docs/05 4.1, Anhang A und B): Namen der Münzen und Scheine.

export function isNote(piece: number): boolean {
  return piece >= 500;
}

/** Zahl, die auf dem Stück steht: 20-Cent-Münze → 20, 2-Euro-Münze → 2. */
export function printed(piece: number): number {
  return piece >= 100 ? piece / 100 : piece;
}

/** „2-Cent-Münze“, „1-Euro-Münze“, „5-Euro-Schein“ */
export function pieceName(piece: number): string {
  if (isNote(piece)) return `${String(piece / 100)}-Euro-Schein`;
  if (piece >= 100) return `${String(piece / 100)}-Euro-Münze`;
  return `${String(piece)}-Cent-Münze`;
}

/** „20-Cent-Münzen“, „5-Euro-Scheine“ */
export function piecePlural(piece: number): string {
  return isNote(piece) ? `${pieceName(piece)}e` : `${pieceName(piece)}n`;
}

/** „die 2-Cent-Münze“ / „den 5-Euro-Schein“ (Akkusativ mit bestimmtem Artikel) */
export function pieceAkkDef(piece: number): string {
  return `${isNote(piece) ? 'den' : 'die'} ${pieceName(piece)}`;
}

/** „eine 2-Euro-Münze“ / „ein 5-Euro-Schein“ */
export function pieceNom(piece: number): string {
  return `${isNote(piece) ? 'ein' : 'eine'} ${pieceName(piece)}`;
}

/** Verb passend zum Betrag: „1 € ist“, „1 Cent ist“, sonst „sind“. */
export function verb(cents: Cents): 'ist' | 'sind' {
  return cents === 1 || cents === 100 ? 'ist' : 'sind';
}

/** Label wie in docs/04 1.5: „10 Cent“, „1 Euro“, „5 Euro“. */
export function valueLabel(piece: number): string {
  return piece >= 100 ? `${String(piece / 100)} Euro` : `${String(piece)} Cent`;
}

/** Wörtliche Kommaschreibweise ohne Token: 850 → „8,50 €“. */
export function literalEur(cents: Cents): string {
  return `${String(Math.floor(cents / 100))},${String(cents % 100).padStart(2, '0')} €`;
}

/** Münzen als Rechnung mit Tokens: „{{50}} + {{20}} + {{20}}“. */
export function plusTokens(pieces: readonly MoneyPiece[]): string {
  return pieces.map((p) => tok(p)).join(' + ');
}

export function sumOf(pieces: readonly number[]): number {
  return pieces.reduce((t, p) => t + p, 0);
}

export function sortDesc(pieces: readonly MoneyPiece[]): MoneyPiece[] {
  return [...pieces].sort((a, b) => b - a);
}

/** Zufällige Auswahl von `count` Stücken (mit Wiederholung). */
export function randomPieces(
  rng: Rng,
  palette: readonly MoneyPiece[],
  count: number,
): MoneyPiece[] {
  const result: MoneyPiece[] = [];
  for (let i = 0; i < count; i++) {
    const piece = palette[randomInt(rng, 0, palette.length - 1)];
    if (piece !== undefined) result.push(piece);
  }
  return result;
}

/**
 * Stücke für Geldbörsen und Beutel: im Stufenschritt und klein genug, dass vier davon
 * in `maxTotal` passen.
 */
export function pursePalette(cfg: StufeConfig): MoneyPiece[] {
  return cfg.money.pieces.filter((p) => p % cfg.money.step === 0 && 4 * p <= cfg.money.maxTotal);
}

/** Münzen, deren größere Münze weniger wert ist (echte Größe, docs/02 6.2). */
const SIZE_TRAPS: readonly [small: MoneyPiece, big: MoneyPiece][] = [
  [5, 10],
  [50, 100],
];

export function trapsFor(cfg: StufeConfig): [MoneyPiece, MoneyPiece][] {
  return SIZE_TRAPS.filter(
    ([a, b]) => cfg.money.pieces.includes(a) && cfg.money.pieces.includes(b),
  );
}

/** Fehlerhinweise für money/number: ganzzahlig, 0 … limit, ≠ richtig, verschieden. */
export function validMistakes(
  correct: number,
  candidates: readonly Distractor[],
  limit: number,
  step: number,
): Mistake[] {
  const seen = new Set<number>([correct]);
  const result: Mistake[] = [];
  for (const d of candidates) {
    if (!Number.isInteger(d.value) || d.value < 0 || d.value > limit || d.value % step !== 0)
      continue;
    if (seen.has(d.value)) continue;
    seen.add(d.value);
    result.push({ value: d.value, feedback: d.feedback });
  }
  return result;
}
