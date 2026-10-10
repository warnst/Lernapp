import { pick, randomInt, type Rng } from '@/domain/random';
import type { Clue, ClueSymbol, MoneyPiece, StufeConfig } from '@/domain/types';
import { makeTask, mix, readBind, readForce, tok } from '../build';
import { piecePlural } from '../generators/muenzen-zaehlen-parts';
import type { Generator } from '../types';
import { type CodeClueKind, paramsFor, riddleStufen } from './params';
import { ALL_SYMBOLS, attempt, symbolWords, WHEEL_WORDS } from './shared';

// Zahlenschloss (docs/10): 3 oder 4 Rätselkarten, jede mit genau einer Lösung 0–9.

interface Riddle {
  text: string;
  dots?: [number, number];
  digit: number;
  /** Tipp 2, wenn diese Karte die erste ist (ohne „Beim Stern:“) */
  hint: string;
  /** Teil des Lösungswegs (ohne „Stern:“) */
  solution: string;
}

function points(n: number): string {
  if (n === 0) return 'kein Punkt';
  return n === 1 ? '1 Punkt' : `${String(n)} Punkte`;
}

/** Stücke für Geldfragen: im Stufenschritt. */
function moneyPieces(cfg: StufeConfig): MoneyPiece[] {
  return cfg.money.pieces.filter((p) => p % cfg.money.step === 0);
}

function makeRiddle(
  cfg: StufeConfig,
  rng: Rng,
  kind: CodeClueKind | 'dots',
  operandMax: number,
): Riddle | null {
  switch (kind) {
    case 'dots': {
      const a = randomInt(rng, 0, 5);
      const b = randomInt(rng, 0, 5);
      const sum = a + b;
      if (sum < 1 || sum > 9) return null;
      return {
        text: `${String(a)} + ${String(b)}`,
        dots: [a, b],
        digit: sum,
        hint: `${points(a)} und ${points(b)}. Wie viele sind das?`,
        solution: `${String(a)} + ${String(b)} = ${String(sum)}.`,
      };
    }
    case 'plus':
    case 'plusminus': {
      const minus = kind === 'plusminus' && rng() < 0.5;
      const a = randomInt(rng, 0, operandMax);
      const b = randomInt(rng, 0, operandMax);
      const result = minus ? a - b : a + b;
      if (result < 0 || result > 9) return null;
      const text = `${String(a)} ${minus ? '−' : '+'} ${String(b)}`;
      return { text, digit: result, hint: `${text} = ?`, solution: `${text} = ${String(result)}.` };
    }
    case 'money': {
      // „Wie viele 20-Cent-Münzen sind 1 €?“
      const piece = pick(rng, moneyPieces(cfg));
      const k = randomInt(rng, 2, 9);
      const total = k * piece;
      if (total > cfg.money.maxTotal || total % cfg.money.step !== 0) return null;
      const steps = [1, 2, 3]
        .filter((n) => n < k)
        .map((n) => tok(n * piece))
        .join(', ');
      return {
        text: `Wie viele ${piecePlural(piece)} sind ${tok(total)}?`,
        digit: k,
        hint: `Zähle in Schritten: ${steps} … bis ${tok(total)}.`,
        solution: `${String(k)} mal ${tok(piece)} sind ${tok(total)}.`,
      };
    }
    case 'times': {
      // „Wie viele Euro sind 4 mal 2 €?“
      const piece = pick(
        rng,
        moneyPieces(cfg).filter((p) => p >= 20 && p <= 500),
      );
      const k = randomInt(rng, 2, 9);
      const total = k * piece;
      if (total % 100 !== 0 || total / 100 > 9 || total > cfg.money.maxTotal) return null;
      return {
        text: `Wie viele Euro sind ${String(k)} mal ${tok(piece)}?`,
        digit: total / 100,
        hint: `Zähle ${String(k)}-mal ${tok(piece)}: ${tok(piece)}, ${tok(2 * piece)} …`,
        solution: `${String(k)} mal ${tok(piece)} sind ${tok(total)}.`,
      };
    }
    case 'divide': {
      const d = randomInt(rng, 2, 9);
      const q = randomInt(rng, 2, 9);
      const n = d * q;
      if (n > cfg.numbers.max) return null;
      return {
        text: `${String(n)} geteilt durch ${String(d)}`,
        digit: q,
        hint: `Wie oft passt ${String(d)} in ${String(n)}?`,
        solution: `${String(n)} geteilt durch ${String(d)} ist ${String(q)}.`,
      };
    }
  }
}

export const code: Generator = {
  id: 'code',
  topic: 'raetsel',
  stufen: riddleStufen('code'),
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['raeder', 'punkte']);
    readBind(opts, []);
    if (force.raeder !== undefined && force.raeder !== 3 && force.raeder !== 4)
      throw new Error('code: raeder');
    if (force.punkte !== undefined && typeof force.punkte !== 'boolean')
      throw new Error('code: punkte');
    if (!cfg.riddles.types.includes('code') || !cfg.answerTypes.includes('code'))
      return 'unsupported';
    const p = paramsFor(cfg).code;
    const wheels = force.raeder ?? p.wheels;
    const dots = force.punkte ?? p.dots;
    const symbols: ClueSymbol[] = mix(rng, ALL_SYMBOLS).slice(0, wheels);
    const riddles: Riddle[] = [];
    for (let i = 0; i < wheels; i++) {
      const riddle = attempt(60, () => {
        const r = makeRiddle(cfg, rng, dots ? 'dots' : pick(rng, p.kinds), p.operandMax);
        if (!r) return null;
        // Der Code beginnt nicht mit 0; keine Karte doppelt.
        if (i === 0 && r.digit === 0) return null;
        return riddles.some((x) => x.text === r.text) ? null : r;
      });
      if (!riddle) return 'unsupported';
      riddles.push(riddle);
    }
    const clues: Clue[] = riddles.map((r, i) => ({
      symbol: symbols[i] ?? 'stern',
      text: r.text,
      ...(r.dots ? { dots: r.dots } : {}),
    }));
    const digits = riddles.map((r) => r.digit);
    const word = WHEEL_WORDS[wheels] ?? String(wheels);
    const first = riddles[0];
    const firstSymbol = symbolWords(symbols[0] ?? 'stern');
    return makeTask(
      cfg,
      'Das Zahlenschloss',
      { kind: 'clues', clues },
      `Die Truhe hat ein Zahlenschloss mit ${word} Rädern.`,
      [
        {
          question: `Löse die ${word} Rätsel. Stelle die Zahlen am Schloss ein.`,
          answer: { type: 'code', digits },
          hints: [
            dots
              ? 'Zähle bei jedem Rätsel die Punkte zusammen.'
              : 'Löse jedes kleine Rätsel einzeln und stelle die Zahl am passenden Rad ein.',
            `${firstSymbol.beim}: ${first?.hint ?? ''}`,
          ],
          explanation: `${riddles
            .map((r, i) => `${symbolWords(symbols[i] ?? 'stern').name}: ${r.solution}`)
            .join(' ')} Der Code ist ${digits.join(', ')}.`,
          praise: 'Klick! Die Truhe ist offen!',
        },
      ],
      3,
    );
  },
};
