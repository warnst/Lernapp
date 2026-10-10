import type { ChoiceAnswer, ChoiceOption, ClueSymbol, Mistake } from '@/domain/types';
import { tok } from '../build';

// Bausteine für die Rätsel (docs/10): Symbole mit Grammatik, Zahl- und Geldkarten, Wiederholen.

export const ALL_SYMBOLS: readonly ClueSymbol[] = ['stern', 'muschel', 'fisch', 'krebs'];

interface SymbolWords {
  name: string;
  /** „eine Muschel“ / „ein Stern“ */
  ein: string;
  /** „jeder Muschel“ / „jedem Stern“ */
  jedem: string;
  /** „einer Muschel“ / „einem Stern“ */
  einem: string;
  /** „Bei der Muschel“ / „Beim Stern“ */
  beim: string;
}

const FEMININE: readonly ClueSymbol[] = ['muschel'];

export function symbolWords(symbol: ClueSymbol): SymbolWords {
  const name = { stern: 'Stern', muschel: 'Muschel', fisch: 'Fisch', krebs: 'Krebs' }[symbol];
  const f = FEMININE.includes(symbol);
  return {
    name,
    ein: `${f ? 'eine' : 'ein'} ${name}`,
    jedem: `${f ? 'jeder' : 'jedem'} ${name}`,
    einem: `${f ? 'einer' : 'einem'} ${name}`,
    beim: f ? `Bei der ${name}` : `Beim ${name}`,
  };
}

/** Wiederholt `fn`, bis es etwas liefert (höchstens `tries`-mal). */
export function attempt<T>(tries: number, fn: () => T | null): T | null {
  for (let i = 0; i < tries; i++) {
    const result = fn();
    if (result !== null) return result;
  }
  return null;
}

export interface Wrong {
  value: number;
  feedback: string;
}

/**
 * Fehloptionen filtern: ganzzahlig, im Raster, in [min, max], ≠ richtig, verschieden.
 * Reichen sie nicht, wird mit richtig ± k · unit aufgefüllt.
 */
export function pickWrong(
  correct: number,
  candidates: readonly Wrong[],
  count: number,
  bounds: { min: number; max: number; unit: number },
  fmt: (value: number) => string,
): Wrong[] {
  const seen = new Set([correct]);
  const result: Wrong[] = [];
  const add = (w: Wrong) => {
    if (result.length >= count) return;
    const ok =
      Number.isInteger(w.value) &&
      w.value % bounds.unit === 0 &&
      w.value >= bounds.min &&
      w.value <= bounds.max &&
      !seen.has(w.value);
    if (!ok) return;
    seen.add(w.value);
    result.push(w);
  };
  candidates.forEach(add);
  for (let k = 1; result.length < count && k <= 20; k++) {
    add({
      value: correct + k * bounds.unit,
      feedback: `${fmt(correct + k * bounds.unit)} ist etwas zu viel.`,
    });
    add({
      value: correct - k * bounds.unit,
      feedback: `${fmt(correct - k * bounds.unit)} ist etwas zu wenig.`,
    });
  }
  return result;
}

/** Zahl- oder Geldkarten aufsteigend, ohne Mischen (wie B5.3). */
export function valueCards(
  correct: number,
  wrong: readonly Wrong[],
  label: (value: number) => string,
): ChoiceAnswer {
  const options = [
    { value: correct, correct: true as const },
    ...wrong.map((w) => ({ value: w.value, feedback: w.feedback })),
  ].sort((a, b) => a.value - b.value);
  return {
    type: 'choice',
    layout: 'cards',
    shuffle: false,
    options: options.map(({ value, ...rest }, i): ChoiceOption => ({
      id: 'abcd'.charAt(i),
      label: label(value),
      ...rest,
    })),
  };
}

export function toMistakes(wrong: readonly Wrong[]): Mistake[] {
  return wrong.map((w) => ({ value: w.value, feedback: w.feedback }));
}

/** Wert als Text: Geld als Token, Zahlen als Ziffern. */
export function formatter(money: boolean): (value: number) => string {
  return money ? (value) => tok(value) : (value) => String(value);
}

export const WHEEL_WORDS: Record<number, string> = { 3: 'drei', 4: 'vier' };

/** force-Schlüssel von Mauer und Dreieck (docs/10 5.1). */
export function gridForce(force: Record<string, unknown>): { luecken?: number; unten?: boolean } {
  const { luecken, unten } = force;
  if (
    luecken !== undefined &&
    (typeof luecken !== 'number' || !Number.isInteger(luecken) || luecken < 1)
  )
    throw new Error('luecken: ganze Zahl ab 1');
  if (unten !== undefined && typeof unten !== 'boolean') throw new Error('unten: boolean');
  return {
    ...(luecken === undefined ? {} : { luecken }),
    ...(unten === undefined ? {} : { unten }),
  };
}
