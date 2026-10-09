import type { Cents, MoneyPiece } from './types';

// Geld ist immer eine ganze Zahl in Cent (docs/03, Abschnitt 5).

const NBSP = '\u00A0';

export type MoneyFormat = 'auto' | 'eur' | 'full';

function assertCents(cents: Cents): void {
  if (!Number.isInteger(cents) || cents < 0) {
    throw new RangeError(`Kein gültiger Cent-Betrag: ${String(cents)}`);
  }
}

function euroWithCents(cents: Cents): string {
  const euro = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, '0');
  return `${String(euro)},${rest}${NBSP}€`;
}

/**
 * auto: < 100 → „85 Cent“; ganze Euro → „2 €“; sonst „1,20 €“
 * eur:  immer „0,85 €“ / „2,00 €“
 * full: wie auto, aber ganze Euro als „2,00 €“
 */
export function formatMoney(cents: Cents, mode: MoneyFormat = 'auto'): string {
  assertCents(cents);
  if (mode === 'eur') return euroWithCents(cents);
  if (cents < 100) return `${String(cents)}${NBSP}Cent`;
  if (cents % 100 === 0 && mode === 'auto') return `${String(cents / 100)}${NBSP}€`;
  return euroWithCents(cents);
}

/** 85 → „85 Cent“; 200 → „2 Euro“; 120 → „1 Euro 20“; 105 → „1 Euro 5“; eur: 85 → „0 Euro 85“. */
export function speakMoney(cents: Cents, mode: MoneyFormat = 'auto'): string {
  assertCents(cents);
  const euro = Math.floor(cents / 100);
  const rest = cents % 100;
  if (euro === 0 && mode !== 'eur') return `${String(rest)} Cent`;
  if (rest === 0) return `${String(euro)} Euro`;
  return `${String(euro)} Euro ${String(rest)}`;
}

const CENT_PATTERN = /^(\d{1,7})\s*(?:ct|cent)$/;
const EURO_PATTERN = /^(?:€\s*)?(\d{1,5})(?:[.,](\d{1,2}))?\s*(?:€|eur|euro)?$/;

/**
 * Tolerantes Einlesen: „1,5“ „1,50 €“ „1.50“ „1 €“ „150 ct“ „150 Cent“ „0,85“.
 * Ohne Komma sind es Euro („3“ → 300). Ungültig → null.
 */
export function parseMoney(input: string): Cents | null {
  const text = input.replaceAll(NBSP, ' ').trim().toLowerCase();
  const cent = CENT_PATTERN.exec(text);
  if (cent) return Number(cent[1]);
  const euro = EURO_PATTERN.exec(text);
  if (!euro) return null;
  const fraction = (euro[2] ?? '').padEnd(2, '0');
  return Number(euro[1]) * 100 + Number(fraction);
}

function fieldValue(field: string): number {
  if (!/^\d*$/.test(field)) throw new RangeError(`Feld enthält keine Ziffern: ${field}`);
  return field === '' ? 0 : Number(field);
}

/** Geldeingabe mit zwei Feldern: leere Felder = 0; Cent darf ≥ 100 sein. */
export function moneyFromFields(euro: string, cent: string): Cents {
  return fieldValue(euro) * 100 + fieldValue(cent);
}

export function sumPieces(pieces: readonly MoneyPiece[]): Cents {
  return pieces.reduce((sum, piece) => sum + piece, 0);
}

/** Kleinste Anzahl Münzen/Scheine für den Betrag (unbegrenzter Vorrat) oder null. */
export function minPieces(target: Cents, palette: readonly MoneyPiece[]): number | null {
  assertCents(target);
  // Breitensuche: In Runde n liegen alle Beträge, die mit n Stücken erreichbar sind.
  const reached = new Set([0]);
  let frontier = [0];
  for (let count = 0; frontier.length > 0; count++) {
    if (reached.has(target)) return count;
    const next: number[] = [];
    for (const amount of frontier) {
      for (const piece of palette) {
        const sum = amount + piece;
        if (sum <= target && !reached.has(sum)) {
          reached.add(sum);
          next.push(sum);
        }
      }
    }
    frontier = next;
  }
  return null;
}

/** Gleiche Münzen in beliebiger Reihenfolge? Für pay-variants. */
export function sameMultiset(a: readonly MoneyPiece[], b: readonly MoneyPiece[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((piece, i) => piece === sortedB[i]);
}
