import type { Cents, MoneyPiece, StufeConfig } from '@/domain/types';
import { tok } from '../build';

// Bausteine für „Münzen legen“ (docs/05 4.4): Namen der Stücke, Paletten, Zerlegungen.

/**
 * Höchstzahl der Legemöglichkeiten einer Palette. validateTask zählt für pay/pay-variants alle
 * Möglichkeiten auf; mehr würde die Prüfung sprengen. Technische Grenze, keine Stufengrenze.
 */
const MAX_WAYS = 600;

const WORDS = ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const NUMBER_WORDS = [
  'null',
  'eins',
  'zwei',
  'drei',
  'vier',
  'fünf',
  'sechs',
  'sieben',
  'acht',
  'neun',
  'zehn',
];

/** Anzahl als Wort vor einem Nomen: 3 → „drei“, 1 → „eine“; ab 10 als Ziffern. */
export function countWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/** Zahl als Wort zum Mitzählen: 5 → „fünf“; ab 11 als Ziffern. */
export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

export function isNote(piece: number): boolean {
  return piece >= 500;
}

/** 5 → „5-Cent-Münze“, 200 → „2-Euro-Münze“, 500 → „5-Euro-Schein“ */
export function pieceName(piece: number): string {
  if (piece < 100) return `${String(piece)}-Cent-Münze`;
  return `${String(piece / 100)}-Euro-${isNote(piece) ? 'Schein' : 'Münze'}`;
}

/** „die 5-Cent-Münze“ / „der 5-Euro-Schein“ */
export function pieceDef(piece: number): string {
  return `${isNote(piece) ? 'der' : 'die'} ${pieceName(piece)}`;
}

/** „die 5-Cent-Münze“ / „den 5-Euro-Schein“ */
export function pieceDefAkk(piece: number): string {
  return `${isNote(piece) ? 'den' : 'die'} ${pieceName(piece)}`;
}

/** „eine 1-Euro-Münze“ / „einen 5-Euro-Schein“ */
export function pieceIndefAkk(piece: number): string {
  return `${isNote(piece) ? 'einen' : 'eine'} ${pieceName(piece)}`;
}

/** „Münzen“ oder „Münzen und Scheine“, je nach Palette. */
export function piecesWord(palette: readonly MoneyPiece[], dativ = false): string {
  if (!palette.some(isNote)) return 'Münzen';
  if (palette.every(isNote)) return dativ ? 'Scheinen' : 'Scheine';
  return dativ ? 'Münzen und Scheinen' : 'Münzen und Scheine';
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Anzahl der Möglichkeiten, den Betrag mit der Palette zu legen (ohne Reihenfolge). */
function waysFor(target: Cents, palette: readonly MoneyPiece[]): number {
  const pieces = [...new Set(palette)];
  // in Einheiten des größten gemeinsamen Teilers rechnen (spart Zeit bei großen Beträgen)
  const unit = pieces.reduce(gcd, 0);
  if (unit === 0 || target % unit !== 0) return target === 0 ? 1 : 0;
  const size = target / unit;
  const ways = new Float64Array(size + 1);
  ways[0] = 1;
  for (const piece of pieces) {
    const step = piece / unit;
    for (let amount = step; amount <= size; amount++) {
      ways[amount] = (ways[amount] ?? 0) + (ways[amount - step] ?? 0);
    }
  }
  return ways[size] ?? 0;
}

/**
 * Wenigste Stücke für den Betrag (bei Gleichstand größere Stücke zuerst), absteigend sortiert.
 * null = nicht legbar.
 */
export function fewestPieces(target: Cents, palette: readonly MoneyPiece[]): MoneyPiece[] | null {
  const pieces = [...new Set(palette)].sort((a, b) => b - a);
  const count = new Int32Array(target + 1).fill(-1);
  const last = new Int32Array(target + 1);
  count[0] = 0;
  for (let amount = 1; amount <= target; amount++) {
    for (const piece of pieces) {
      if (piece > amount) continue;
      const rest = count[amount - piece] ?? -1;
      const current = count[amount] ?? -1;
      if (rest >= 0 && (current < 0 || rest + 1 < current)) {
        count[amount] = rest + 1;
        last[amount] = piece;
      }
    }
  }
  if ((count[target] ?? -1) < 0) return null;
  const result: MoneyPiece[] = [];
  for (let amount = target; amount > 0; amount -= last[amount] ?? amount) {
    result.push(last[amount] as MoneyPiece);
  }
  return result.sort((a, b) => b - a);
}

/** Gierig: immer das größte Stück, das passt. null = so nicht legbar. */
export function greedyPieces(target: Cents, palette: readonly MoneyPiece[]): MoneyPiece[] | null {
  const pieces = [...new Set(palette)].sort((a, b) => b - a);
  const result: MoneyPiece[] = [];
  let rest = target;
  for (const piece of pieces) {
    while (piece <= rest) {
      result.push(piece);
      rest -= piece;
    }
  }
  return rest === 0 ? result : null;
}

/**
 * Palette für einen Betrag: alle erlaubten Stücke ≤ Obergrenze; solange es zu viele
 * Möglichkeiten gibt, fällt das kleinste Stück weg (wenn der Betrag legbar bleibt).
 * null = keine brauchbare Palette.
 */
export function paletteFor(
  target: Cents,
  candidates: readonly MoneyPiece[],
  minSize = 2,
): MoneyPiece[] | null {
  const all = [...new Set(candidates)].filter((p) => p <= target).sort((a, b) => a - b);
  // Weniger Stücke ergeben nie mehr Möglichkeiten: binär nach der größten Palette suchen
  // (kleinste Stücke zuerst weglassen), die höchstens MAX_WAYS Möglichkeiten hat.
  let low = 0;
  let high = all.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (waysFor(target, all.slice(mid)) > MAX_WAYS) low = mid + 1;
    else high = mid;
  }
  const palette = all.slice(low);
  if (palette.length < minSize || waysFor(target, palette) === 0) return null;
  return palette;
}

/** Palette in Anzeige-Reihenfolge: Bucht aufsteigend (wie B3.1), Insel absteigend (wie 4.3). */
export function displayOrder(cfg: StufeConfig, palette: readonly MoneyPiece[]): MoneyPiece[] {
  const sorted = [...palette].sort((a, b) => a - b);
  return cfg.money.centOnly ? sorted : sorted.reverse();
}

/** „{{50}} + {{20}} + {{5}}“ */
export function plusList(pieces: readonly number[]): string {
  return pieces.map((p) => tok(p)).join(' + ');
}

/** „{{2}} und {{1}}“ (Stufe 1, wie B3.1) */
export function andList(pieces: readonly number[]): string {
  return pieces.map((p) => tok(p)).join(' und ');
}

/** Einfache Geldstufen (nur Cent oder nur ganze Euro): mit Summenanzeige (docs/05 4.4). */
export function simpleMoney(cfg: StufeConfig): boolean {
  return cfg.money.centOnly || !cfg.money.useCents;
}

/** Erlaubte Stücke der Stufe bis zur Obergrenze maxTotal. */
export function piecesUpTo(cfg: StufeConfig, max: Cents = cfg.money.maxTotal): MoneyPiece[] {
  return cfg.money.pieces.filter((p) => p <= max);
}
