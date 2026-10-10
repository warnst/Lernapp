import { formatMoney } from '@/domain/money';
import type { Cents, Mistake, StufeConfig } from '@/domain/types';

// Fehloptionen aus typischen Denkfehlern, jede mit Hinweis (docs/05 Abschnitt 5).

export interface Distractor {
  value: number;
  feedback: string;
}

export function euroOff(correct: Cents): Distractor[] {
  const feedback = 'Zähle die Euro noch einmal.';
  return [
    { value: correct + 100, feedback },
    { value: correct - 100, feedback },
  ];
}

/** 3,50 € → 3,05 € */
export function centDigit(correct: Cents): Distractor[] {
  const cent = correct % 100;
  if (correct < 100 || cent === 0 || cent % 10 !== 0) return [];
  return [
    {
      value: correct - cent + cent / 10,
      feedback: `${String(cent)} Cent schreibt man mit zwei Ziffern hinter dem Komma.`,
    },
  ];
}

export function countStep(correct: number, smallest: number): Distractor[] {
  const feedback = 'Zähle die Münzen noch einmal, eine nach der anderen.';
  return [
    { value: correct + smallest, feedback },
    { value: correct - smallest, feedback },
  ];
}

export function addedInstead(a: number, b: number): Distractor[] {
  return [{ value: a + b, feedback: 'Du hast zusammengezählt. Hier wird es weniger.' }];
}

export function subtractedInstead(a: number, b: number): Distractor[] {
  return [{ value: Math.abs(a - b), feedback: 'Hier kommt etwas dazu. Dann wird es mehr.' }];
}

export function priceAsChange(price: Cents): Distractor[] {
  return [
    {
      value: price,
      feedback: `${formatMoney(price)} ist der Preis. Das Rückgeld ist das, was übrig bleibt.`,
    },
  ];
}

/** 5,00 € − 3,20 € → Euro und Cent getrennt: 2,20 € (nur wenn „geborgt“ werden müsste). */
export function naiveSubtract(price: Cents, payment: Cents): Distractor[] {
  const p = { euro: Math.floor(price / 100), cent: price % 100 };
  const z = { euro: Math.floor(payment / 100), cent: payment % 100 };
  if (z.cent >= p.cent) return [];
  return [
    {
      value: (z.euro - p.euro) * 100 + (p.cent - z.cent),
      feedback: `Zähle lieber vom Preis aus weiter bis ${formatMoney(payment)}.`,
    },
  ];
}

export function changeEuroOff(correct: Cents): Distractor[] {
  return [
    { value: correct + 100, feedback: 'Fast! Zähle zuerst bis zum nächsten Euro, dann weiter.' },
  ];
}

/** (n − 1) · p und (n + 1) · p bei Mengen. */
export function oneLessMore(
  n: number,
  price: Cents,
  item: { nom: string; plural?: string },
): Distractor[] {
  const plural = item.plural ?? '';
  const less: Distractor = {
    value: (n - 1) * price,
    feedback:
      n - 1 === 1 ? `Das ist erst ${item.nom}.` : `Das sind erst ${String(n - 1)} ${plural}.`,
  };
  return [less, { value: (n + 1) * price, feedback: `Das wären ${String(n + 1)} ${plural}.` }];
}

/**
 * Filtert Fehloptionen (≥ 0, ≠ richtig, verschieden, ≤ Grenze) und füllt mit richtig ± Schritt auf,
 * mit Richtungshinweis (docs/05 5).
 */
export function selectDistractors(
  correct: number,
  candidates: readonly Distractor[],
  cfg: StufeConfig,
  count: number,
  kind: 'money' | 'number' = 'money',
): Distractor[] {
  const limit = kind === 'money' ? 2 * cfg.money.maxTotal : cfg.numbers.max;
  const step = kind === 'money' ? cfg.money.step : 1;
  const seen = new Set<number>([correct]);
  const result: Distractor[] = [];
  const add = (d: Distractor) => {
    if (result.length >= count) return;
    if (!Number.isInteger(d.value) || d.value < 0 || d.value > limit || seen.has(d.value)) return;
    if (kind === 'money' && d.value % step !== 0) return;
    seen.add(d.value);
    result.push(d);
  };
  candidates.forEach(add);
  for (let k = 1; result.length < count && k <= 20; k++) {
    add({ value: correct + k * step, feedback: 'Das ist etwas zu viel.' });
    add({ value: correct - k * step, feedback: 'Das ist etwas zu wenig.' });
  }
  return result;
}

/** Fehlerhinweise für money/number aus Fehloptionen. */
export function toMistakes(distractors: readonly Distractor[]): Mistake[] {
  return distractors.map((d) => ({ value: d.value, feedback: d.feedback }));
}
