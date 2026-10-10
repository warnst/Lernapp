import { pick, randomInt, type Rng } from '@/domain/random';
import type { StufeConfig } from '@/domain/types';
import { makeTask, readBind, readForce } from '../build';
import type { Generator } from '../types';
import { numberMistakes } from './mengen-zahlen-parts';

// Plus und Minus ohne Geld (docs/13): Rechnen, Ergänzen, Platzhalter. Zahlenraum aus levels.ts;
// auf Stufe 4 nur Zehnerzahlen, damit es im Kopf geht.

const THINGS = ['apfel', 'muschel', 'seestern', 'fisch', 'stern'] as const;

/** kleinster Schritt der Zahlen: Stufe 4 rechnet mit Zehnern bis 1000 */
function unit(cfg: StufeConfig): number {
  return cfg.numbers.max >= 1000 ? 10 : 1;
}

function rand(rng: Rng, cfg: StufeConfig, min: number, max: number): number {
  const u = unit(cfg);
  return randomInt(rng, Math.ceil(min / u), Math.floor(max / u)) * u;
}

/** Ohne Zehnerübergang: Einer bleiben unter 10 (Stufe 1). */
function noCarry(a: number, b: number, plus: boolean): boolean {
  return plus ? (a % 10) + (b % 10) < 10 : a % 10 >= b % 10;
}

function strategyHint(cfg: StufeConfig, plus: boolean): string {
  if (cfg.numbers.max <= 10)
    return plus ? 'Zähle mit den Fingern weiter.' : 'Zähle mit den Fingern rückwärts.';
  if (cfg.numbers.max <= 20)
    return plus
      ? 'Rechne erst bis zur 10, dann weiter.'
      : 'Rechne erst bis zur 10 zurück, dann weiter.';
  return 'Rechne erst mit den Zehnern, dann mit den Einern.';
}

// ---------- PM1: Rechne ----------

const PM1: Generator = {
  id: 'PM1',
  topic: 'plus-minus',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const max = cfg.numbers.max;
    const plus = rng() < 0.5;
    for (let tries = 0; tries < 50; tries++) {
      const r = plus ? rand(rng, cfg, 2 * unit(cfg), max) : rand(rng, cfg, 0, max - unit(cfg));
      const a = plus ? rand(rng, cfg, 1, r - unit(cfg)) : rand(rng, cfg, r + unit(cfg), max);
      const b = plus ? r - a : a - r;
      if (b <= 0 || a <= 0) continue;
      if (!cfg.carry && !noCarry(a, b, plus)) continue;
      const sign = plus ? '+' : '−';
      const small = max <= 10;
      const thing = pick(rng, THINGS);
      return makeTask(
        cfg,
        `${String(a)} ${sign} ${String(b)}`,
        small
          ? {
              kind: 'objects',
              groups: plus
                ? [
                    { itemId: thing, count: a },
                    { itemId: thing, count: b },
                  ]
                : [{ itemId: thing, count: a, leaving: b }],
            }
          : { kind: 'none' },
        'Kiko rechnet mit dir.',
        [
          {
            question: `Rechne: ${String(a)} ${sign} ${String(b)} = ?`,
            answer: { type: 'number', correct: r },
            mistakes: numberMistakes(
              r,
              [
                {
                  value: plus ? a - b : a + b,
                  feedback: plus
                    ? 'Schau auf das Zeichen: Plus heißt dazu.'
                    : 'Schau auf das Zeichen: Minus heißt weg.',
                },
                { value: r + unit(cfg), feedback: 'Fast! Zähle noch einmal genau.' },
                { value: r - unit(cfg), feedback: 'Fast! Zähle noch einmal genau.' },
              ],
              max,
            ),
            hints: [
              strategyHint(cfg, plus),
              plus
                ? `Fang bei ${String(a)} an und geh ${String(b)} weiter.`
                : `Fang bei ${String(a)} an und geh ${String(b)} zurück.`,
            ],
            explanation: `${String(a)} ${sign} ${String(b)} = ${String(r)}.`,
          },
        ],
        2,
      );
    }
    return 'unsupported';
  },
};

// ---------- PM2: Ergänze ----------

const PM2: Generator = {
  id: 'PM2',
  topic: 'plus-minus',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const max = cfg.numbers.max;
    // Ziel: 10, ein Zehner bis 20, 100 bzw. ein Hunderter
    const target =
      max <= 10
        ? 10
        : max <= 20
          ? pick(rng, [10, 20])
          : max <= 100
            ? pick(rng, [50, 100])
            : pick(rng, [100, 500, 1000]);
    const step = target >= 100 && max >= 1000 ? 10 : 1;
    const a = randomInt(rng, 1, target / step - 1) * step;
    const r = target - a;
    return makeTask(
      cfg,
      `${String(a)} + ? = ${String(target)}`,
      { kind: 'none' },
      'Kiko möchte genau bis zum Ziel kommen.',
      [
        {
          question: `Wie viel fehlt? ${String(a)} + ? = ${String(target)}`,
          answer: { type: 'number', correct: r },
          mistakes: numberMistakes(
            r,
            [
              {
                value: target,
                feedback: `${String(target)} ist das Ziel. Wie viel fehlt bis dahin?`,
              },
              {
                value: a + target,
                feedback: 'Nicht zusammenzählen: Wie viel fehlt noch bis zum Ziel?',
              },
              { value: r + step, feedback: 'Fast! Prüfe: Passt es genau?' },
              { value: r - step, feedback: 'Fast! Prüfe: Passt es genau?' },
            ],
            max,
          ),
          hints: [
            `Zähle von ${String(a)} weiter bis ${String(target)}.`,
            `Du kannst auch rechnen: ${String(target)} − ${String(a)}.`,
          ],
          explanation: `${String(a)} + ${String(r)} = ${String(target)}. Es fehlen ${String(r)}.`,
        },
      ],
      3,
    );
  },
};

// ---------- PM3: Platzhalter ----------

const PM3: Generator = {
  id: 'PM3',
  topic: 'plus-minus',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const max = cfg.numbers.max;
    const a = rand(rng, cfg, 4 * unit(cfg), max);
    const b = rand(rng, cfg, unit(cfg), a - unit(cfg));
    const c = a - b;
    return makeTask(
      cfg,
      `${String(a)} − ? = ${String(c)}`,
      { kind: 'none' },
      'Kiko hat eine Zahl versteckt.',
      [
        {
          question: `Welche Zahl fehlt? ${String(a)} − ? = ${String(c)}`,
          answer: { type: 'number', correct: b },
          mistakes: numberMistakes(
            b,
            [
              {
                value: c,
                feedback: `${String(c)} steht schon da. Was nimmst du von ${String(a)} weg?`,
              },
              { value: a + c, feedback: 'Minus heißt weg. Es muss weniger werden.' },
            ],
            max,
          ),
          hints: [
            `Wie weit ist es von ${String(c)} bis ${String(a)}?`,
            `Rechne ${String(a)} − ${String(c)}.`,
          ],
          explanation: `${String(a)} − ${String(b)} = ${String(c)}.`,
        },
      ],
      4,
    );
  },
};

export const PLUS_MINUS_GENERATORS: readonly Generator[] = [PM1, PM2, PM3];
