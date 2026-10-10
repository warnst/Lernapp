import type { Item } from '@/content/items';
import type { Rng } from '@/domain/random';
import type { Answer, Cents, Mistake, StufeConfig } from '@/domain/types';
import { choice, mix, tok } from '../build';
import { type Distractor, selectDistractors, toMistakes } from '../distractors';

// Bausteine für „preise-addieren“ und „rueckgeld“: Preislisten, Übertrag, Tipps, Antworten.

/** Alle gültigen Preise einer Sache auf dieser Stufe (im Stufenschritt, ≤ maxPrice). */
export function priceOptions(cfg: StufeConfig, item: Item): Cents[] {
  const range = item.prices[cfg.id];
  if (!range) return [];
  const step = cfg.money.step;
  const low = Math.max(1, Math.ceil(range[0] / step));
  const high = Math.floor(Math.min(range[1], cfg.money.maxPrice) / step);
  const result: Cents[] = [];
  for (let k = low; k <= high; k++) result.push(k * step);
  return result;
}

/** Versucht `fn` bis zu `tries` Mal; null = nichts Gültiges gefunden. */
export function attempt<T>(tries: number, fn: () => T | null): T | null {
  for (let i = 0; i < tries; i++) {
    const result = fn();
    if (result !== null) return result;
  }
  return null;
}

/** Stufe mit Euro und Cent (3, 4)? */
export function withCents(cfg: StufeConfig): boolean {
  return cfg.money.useCents && !cfg.money.centOnly;
}

/**
 * Übertrag beim Zusammenzählen: Mit Cent wird aus den Cent ein Euro (60 + 70 Cent),
 * bei ganzen Euro (Stufe 2) ist es der Zehnerübergang (7 € + 5 €). Bei reinen Cent-Beträgen
 * (Stufe 1) gibt es keinen.
 */
export function hasCarry(cfg: StufeConfig, prices: readonly Cents[]): boolean {
  if (cfg.money.centOnly) return false;
  if (withCents(cfg)) return prices.reduce((t, p) => t + (p % 100), 0) >= 100;
  return prices.reduce((t, p) => t + (Math.floor(p / 100) % 10), 0) >= 10;
}

export function sum(values: readonly number[]): number {
  return values.reduce((t, v) => t + v, 0);
}

/** Antwortart für „choice / money“: abwechselnd per rng, wenn `money` erlaubt ist. */
export function answerKind(cfg: StufeConfig, rng: Rng): 'choice' | 'money' {
  const coin = rng();
  return cfg.answerTypes.includes('money') && coin < 0.5 ? 'money' : 'choice';
}

/** Geld-Antwort als Karten oder Eingabefeld, Fehloptionen aus den Kandidaten. */
export function moneyPart(
  cfg: StufeConfig,
  kind: 'choice' | 'money',
  correct: Cents,
  candidates: readonly Distractor[],
): { answer: Answer; mistakes?: Mistake[] } {
  if (kind === 'money') {
    return { answer: { type: 'money', correct }, mistakes: mistakesFrom(cfg, correct, candidates) };
  }
  const wrong = selectDistractors(
    correct,
    candidates.filter((d) => d.value > 0),
    cfg,
    cfg.choiceCount - 1,
  ).filter((d) => d.value > 0);
  return {
    answer: choice(
      { label: tok(correct) },
      wrong.map((d) => ({ label: tok(d.value), feedback: d.feedback })),
      cfg.choiceCount,
    ),
  };
}

/** Fehlerhinweise für money: nur gültige Regeln (> 0, ≠ richtig, verschieden), ohne Auffüllen. */
export function mistakesFrom(
  cfg: StufeConfig,
  correct: Cents,
  candidates: readonly Distractor[],
): Mistake[] {
  const positive = candidates.filter((d) => d.value > 0);
  return toMistakes(
    selectDistractors(correct, positive, cfg, positive.length).filter((d) => positive.includes(d)),
  );
}

/** „Von 9 € bis 10 € ist es 1 €.“ / „… sind es 80 Cent.“ */
export function sindEs(amount: Cents): string {
  return amount === 100 ? 'ist es' : 'sind es';
}

/** Wichtigste Fehloption zuerst, die übrigen gemischt. */
export function ordered(
  rng: Rng,
  first: readonly Distractor[],
  rest: readonly Distractor[],
): Distractor[] {
  return [...first, ...mix(rng, rest)];
}

/** Für beliebig viele Preise: Euro aus den Cent vergessen. */
export function forgotCarryMany(cfg: StufeConfig, prices: readonly Cents[]): Distractor[] {
  if (!withCents(cfg)) return [];
  const cents = prices.map((p) => p % 100).filter((c) => c > 0);
  const centSum = sum(cents);
  if (centSum < 100) return [];
  return [
    {
      value: sum(prices) - Math.floor(centSum / 100) * 100,
      feedback: `${cents.map((c) => `${String(c)} Cent`).join(' + ')} sind ${
        centSum === 100 ? 'genau' : 'mehr als'
      } 1 €. Vergiss den Euro aus den Cent nicht.`,
    },
  ];
}

const euros = (p: Cents) => Math.floor(p / 100);
const joinPlus = (parts: readonly string[]) => parts.join(' + ');

/** Satz über die Cent-Summe beim Übertrag („130 Cent sind mehr als 1 €.“). */
function carrySentence(centSum: number): string {
  return centSum === 100
    ? '100 Cent sind genau 1 €.'
    : `${String(centSum)} Cent sind mehr als 1 €.`;
}

/** Zwei Tipps zum Zusammenzählen von Preisen (docs/05 4.2). */
export function additionHints(cfg: StufeConfig, prices: readonly Cents[]): [string, string] {
  if (cfg.money.centOnly) {
    const [a = 0, b = 0] = prices;
    return [`Halte ${String(a)} Finger hoch. Dann noch ${String(b)} Finger.`, 'Zähle alle Finger.'];
  }
  if (prices.every((p) => p % 100 === 0)) {
    const e = prices.map(euros);
    const tip1 = `Rechne ${joinPlus(e.map((x) => `${String(x)} €`))}.`;
    if (e.length === 2) {
      const [a = 0, b = 0] = [...e].sort((x, y) => y - x);
      return [tip1, `Zähle von ${String(a)} aus ${String(b)} weiter.`];
    }
    const [a = 0, b = 0, ...more] = e;
    return [
      tip1,
      `Rechne zuerst ${String(a)} € + ${String(b)} €. Dann kommen noch ${joinPlus(
        more.map((x) => `${String(x)} €`),
      )} dazu.`,
    ];
  }
  const cents = prices.map((p) => p % 100).filter((c) => c > 0);
  const centSum = sum(cents);
  const carry = centSum >= 100;
  const centText = joinPlus(cents.map((c) => `${String(c)} Cent`));
  if (prices.every((p) => p < 100)) {
    const [a = 0, b = 0] = prices;
    return [
      `Rechne nur mit den Cent: ${centText}.`,
      carry
        ? `${carrySentence(centSum)} 100 Cent sind 1 €.`
        : `Zähle von ${String(a)} Cent aus ${String(b)} Cent weiter.`,
    ];
  }
  const euroParts = prices.map(euros).filter((e) => e > 0);
  const noEuro = prices.filter((p) => p < 100);
  let tip1: string;
  if (euroParts.length >= 2) {
    tip1 = `Rechne zuerst die Euro: ${joinPlus(euroParts.map((e) => `${String(e)} €`))}.`;
  } else if (noEuro.length === 1) {
    tip1 = `${tok(noEuro[0] ?? 0)} hat keine ganzen Euro. Rechne mit den Cent.`;
  } else {
    tip1 = `${noEuro.map(tok).join(' und ')} haben keine ganzen Euro. Rechne mit den Cent.`;
  }
  let tip2 =
    cents.length >= 2
      ? `Jetzt die Cent: ${centText}.`
      : `Jetzt kommen noch ${String(cents[0] ?? 0)} Cent dazu.`;
  if (carry) tip2 += ` ${carrySentence(centSum)}`;
  return [tip1, tip2];
}

/** Lösungsweg zum Zusammenzählen (docs/05 4.2; Stufe 1 wie docs/11 B3.3). */
export function additionExplanation(cfg: StufeConfig, prices: readonly Cents[]): string {
  const total = sum(prices);
  if (cfg.money.centOnly) return `${prices.map(tok).join(' und ')} sind ${tok(total)}.`;
  const cents = prices.map((p) => p % 100).filter((c) => c > 0);
  const centSum = sum(cents);
  if (withCents(cfg) && centSum >= 100 && prices.some((p) => p >= 100)) {
    return `${joinPlus(cents.map((c) => `${String(c)} Cent`))} = ${String(centSum)} Cent = ${tok(
      centSum,
    )}. Dazu die Euro: ${tok(total)}.`;
  }
  return `${joinPlus(prices.map(tok))} = ${tok(total)}.`;
}

/** Ergänzen beim Rückgeld: vom Preis bis zum nächsten Euro, dann bis zur Zahlung. */
function complement(price: Cents, payment: Cents) {
  const nextEuro = Math.ceil(price / 100) * 100;
  return { nextEuro, x: nextEuro - price, y: payment - nextEuro };
}

/** Zwei Tipps zum Ergänzen (docs/05 4.3). */
export function changeHints(price: Cents, payment: Cents): [string, string] {
  const { nextEuro, x, y } = complement(price, payment);
  if (x === 0) {
    return [
      `Zähle vom Preis aus weiter bis ${tok(payment)}.`,
      `Zähle von ${tok(price)} in Euro-Schritten bis ${tok(payment)}.`,
    ];
  }
  if (y === 0) {
    return [
      `Zähle vom Preis aus weiter bis ${tok(payment)}.`,
      `Von ${tok(price)} bis ${tok(payment)} fehlen noch ein paar Cent. Wie viele?`,
    ];
  }
  return [
    `Zähle von ${tok(price)} weiter bis ${tok(nextEuro)}.`,
    `Von ${tok(price)} bis ${tok(nextEuro)} ${sindEs(x)} ${tok(x)}. Dann noch ${tok(y)} bis ${tok(
      payment,
    )}.`,
  ];
}

/** Lösungsweg zum Ergänzen (docs/05 4.3). */
export function changeExplanation(price: Cents, payment: Cents): string {
  const { nextEuro, x, y } = complement(price, payment);
  if (x === 0 || y === 0) {
    const change = payment - price;
    return `${tok(price)} + ${tok(change)} = ${tok(payment)}. Rückgeld: ${tok(change)}.`;
  }
  return `${tok(price)} + ${tok(x)} = ${tok(nextEuro)}. ${tok(nextEuro)} + ${tok(y)} = ${tok(
    payment,
  )}. Rückgeld: ${tok(payment - price)}.`;
}
