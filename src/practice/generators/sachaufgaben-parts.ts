import { randomInt, type Rng } from '@/domain/random';
import type { Cents, Mistake, MoneyPiece, StufeConfig } from '@/domain/types';
import { split, tok } from '../build';

// Gemeinsame Bausteine für Sachaufgaben und Knobeln: Weiterzählen, Addieren, Münznamen, Fehlerhinweise.

/** Zufallsbetrag im Stufenschritt zwischen min und max (beide eingeschlossen) oder null. */
export function randomAmount(rng: Rng, cfg: StufeConfig, min: Cents, max: Cents): Cents | null {
  const step = cfg.money.step;
  const low = Math.max(1, Math.ceil(min / step));
  const high = Math.floor(max / step);
  if (low > high) return null;
  return randomInt(rng, low, high) * step;
}

/** Münzen (ohne Scheine) aus der Stufenpalette. */
export function coinsOf(cfg: StufeConfig): MoneyPiece[] {
  return cfg.money.pieces.filter((p) => p <= 200);
}

/** Betrag gierig in Stücke der Palette zerlegen (größte zuerst) oder null. */
export function greedy(amount: Cents, palette: readonly MoneyPiece[]): MoneyPiece[] | null {
  const pieces = [...palette].sort((a, b) => b - a);
  const result: MoneyPiece[] = [];
  let rest = amount;
  for (const piece of pieces) {
    while (rest >= piece) {
      result.push(piece);
      rest -= piece;
    }
  }
  return rest === 0 ? result : null;
}

function valueWord(piece: MoneyPiece): string {
  return piece < 100 ? `${String(piece)}-Cent` : `${String(piece / 100)}-Euro`;
}

export function isNote(piece: MoneyPiece): boolean {
  return piece >= 500;
}

/** „10-Cent-Münze“, „5-Euro-Schein“ */
export function pieceName(piece: MoneyPiece): string {
  return `${valueWord(piece)}-${isNote(piece) ? 'Schein' : 'Münze'}`;
}

/** „die 10-Cent-Münze“, „der 5-Euro-Schein“ */
export function pieceDef(piece: MoneyPiece): string {
  return `${isNote(piece) ? 'der' : 'die'} ${pieceName(piece)}`;
}

const COUNT_WORDS = ['', 'eine', 'zwei', 'drei', 'vier', 'fünf'];

/** „eine 2-Euro-Münze, zwei 10-Cent-Münzen und einen 5-Euro-Schein“ (Akkusativ, für „Du hast …“). */
export function piecesInWords(pieces: readonly MoneyPiece[]): string {
  const counts = new Map<MoneyPiece, number>();
  for (const p of [...pieces].sort((a, b) => b - a)) counts.set(p, (counts.get(p) ?? 0) + 1);
  const words = [...counts].map(([piece, count]) => {
    const note = isNote(piece);
    if (count === 1) return `${note ? 'einen' : 'eine'} ${pieceName(piece)}`;
    const number = COUNT_WORDS[count] ?? String(count);
    return `${number} ${valueWord(piece)}-${note ? 'Scheine' : 'Münzen'}`;
  });
  if (words.length === 1) return words[0] ?? '';
  return `${words.slice(0, -1).join(', ')} und ${words.at(-1) ?? ''}`;
}

/** „2 € + 1 € + 50 Cent“ */
export function piecesSum(pieces: readonly MoneyPiece[]): string {
  return [...pieces]
    .sort((a, b) => b - a)
    .map((p) => tok(p))
    .join(' + ');
}

/** „sind es“ bzw. „ist es“ (bei 1 € und 1 Cent). */
function isAre(amount: Cents): string {
  return amount === 100 || amount === 1 ? 'ist es' : 'sind es';
}

/** „fehlen“ bzw. „fehlt“ (bei 1 € und 1 Cent). */
export function fehlen(amount: Cents): string {
  return amount === 100 || amount === 1 ? 'fehlt' : 'fehlen';
}

/** Haltepunkte beim Weiterzählen: von, nächster Euro, letzter ganzer Euro, bis. */
function stops(from: Cents, to: Cents): Cents[] {
  const result = [from];
  const nextEuro = Math.ceil(from / 100) * 100;
  if (nextEuro > from && nextEuro < to) result.push(nextEuro);
  const lastEuro = Math.floor(to / 100) * 100;
  if (lastEuro > (result.at(-1) ?? from) && lastEuro < to) result.push(lastEuro);
  result.push(to);
  return result;
}

export interface Steps {
  hints: [string, string];
  /** Sätze „Von … bis … sind es …“, ohne Schlusssatz */
  explanation: string;
}

export interface CountSteps extends Steps {
  /** genauer Weiterzähl-Tipp (für Vorlagen mit eigenem ersten Tipp) */
  detail: string;
}

/** Tipps und Lösungsweg für „von {from} weiter bis {to}“ (Rückgeld, Rest, Fehlbetrag). */
export function countUp(from: Cents, to: Cents): CountSteps {
  const points = stops(from, to);
  const diff = to - from;
  const segments = points.slice(1).map((point, i) => {
    const start = points[i] ?? from;
    return { start, end: point, amount: point - start };
  });
  const sentence = (s: { start: Cents; end: Cents; amount: Cents }, again: boolean) =>
    `Von ${tok(s.start)} bis ${tok(s.end)} ${isAre(s.amount)}${again ? ' noch' : ''} ${tok(s.amount)}.`;
  if (segments.length === 1) {
    const whole = from % 100 === 0 && to % 100 === 0;
    const first = whole
      ? `Zähle von ${tok(from)} in Euro-Schritten bis ${tok(to)}.`
      : `Zähle von ${tok(from)} bis ${tok(to)}.`;
    return {
      hints: [first, `Rechne ${tok(to)} − ${tok(from)}.`],
      detail: first,
      explanation: sentence({ start: from, end: to, amount: diff }, false),
    };
  }
  const first = segments[0] ?? { end: to };
  const detail = segments.map((s, i) => sentence(s, i > 0)).join(' ');
  return {
    hints: [`Zähle von ${tok(from)} bis ${tok(first.end)}.`, detail],
    detail,
    explanation: segments.map((s) => sentence(s, false)).join(' '),
  };
}

/** Tipps und Lösungsweg für „{a} + {b}“ (docs/05 4.2). */
export function addSteps(a: Cents, b: Cents): Steps & { carry: boolean } {
  const pa = split(a);
  const pb = split(b);
  const sum = a + b;
  const carry = pa.cent + pb.cent >= 100;
  if (pa.cent === 0 && pb.cent === 0) {
    return {
      hints: [`Rechne ${tok(a)} + ${tok(b)}.`, `Zähle von ${tok(a)} aus ${tok(b)} weiter.`],
      explanation: `${tok(a)} + ${tok(b)} = ${tok(sum)}.`,
      carry,
    };
  }
  const small = a < 100 ? a : b < 100 ? b : undefined;
  const hint1 =
    small !== undefined
      ? `${tok(small)} hat keine ganzen Euro. Rechne mit den Cent.`
      : `Rechne zuerst die Euro: ${String(pa.euro)} € + ${String(pb.euro)} €.`;
  let hint2: string;
  if (pa.cent > 0 && pb.cent > 0) {
    hint2 = `Jetzt die Cent: ${String(pa.cent)} Cent + ${String(pb.cent)} Cent.`;
    if (carry) hint2 += ` ${String(pa.cent + pb.cent)} Cent sind mehr als 1 €.`;
  } else {
    hint2 = `Dann kommen noch ${String(pa.cent + pb.cent)} Cent dazu.`;
  }
  let explanation = `${tok(a)} + ${tok(b)} = ${tok(sum)}.`;
  if (carry) {
    const cents = pa.cent + pb.cent;
    explanation = `${String(pa.cent)} Cent + ${String(pb.cent)} Cent = ${String(cents)} Cent = ${tok(cents)}.`;
    if (pa.euro + pb.euro > 0) explanation += ` Dazu die Euro: ${tok(sum)}.`;
  }
  return { hints: [hint1, hint2], explanation, carry };
}

/** Fehlerhinweise für money: nur ganze Beträge ≥ 0, ohne die richtige Antwort, ohne Doppelte. */
export function cleanMistakes(
  correct: number,
  candidates: readonly (Mistake | undefined)[],
): Mistake[] {
  const seen = new Set<number>([correct]);
  const result: Mistake[] = [];
  for (const m of candidates) {
    if (!m || !Number.isInteger(m.value) || m.value < 0 || seen.has(m.value)) continue;
    seen.add(m.value);
    result.push(m);
  }
  return result;
}

/** „Rechne 3-mal 1,20 €“-Rechnung als Text: „1,20 € + 1,20 € + 1,20 €“ bzw. „5 × 1,20 €“. */
export function timesText(n: number, price: Cents): string {
  return n <= 3
    ? Array.from({ length: n }, () => tok(price)).join(' + ')
    : `${String(n)} × ${tok(price)}`;
}

/** Zahlung aus cfg.money.payments, die größer als der Betrag ist (meist die kleinste passende). */
export function choosePayment(rng: Rng, cfg: StufeConfig, amount: Cents): MoneyPiece | null {
  const options = [...cfg.money.payments].sort((a, b) => a - b).filter((p) => p > amount);
  const first = options[0];
  if (first === undefined) return null;
  const second = options[1];
  return second !== undefined && rng() < 0.3 ? second : first;
}

/** Possessivpronomen: „sein“ / „ihr“. */
export function possessive(pron: 'sie' | 'er'): string {
  return pron === 'er' ? 'sein' : 'ihr';
}
