import { pick, randomInt } from '@/domain/random';
import type { StufeConfig } from '@/domain/types';
import { choice, makeTask, readBind, readForce } from '../build';
import type { Generator } from '../types';
import { numberMistakes } from './mengen-zahlen-parts';

// Zahlen und Zahlenstrahl (docs/13): Nachbarzahlen, fehlende Zahl am Zahlenstrahl, größer/kleiner.

/** Schritte am Zahlenstrahl je Zahlenraum */
function lineSteps(cfg: StufeConfig): number[] {
  const max = cfg.numbers.max;
  if (max <= 10) return [1];
  if (max <= 20) return [1, 2];
  if (max <= 100) return [5, 10];
  return [50, 100];
}

// ---------- ZR1: Nachbarzahlen ----------

const ZR1: Generator = {
  id: 'ZR1',
  topic: 'zahlenreihe',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const max = cfg.numbers.max;
    // auf Stufe 3 und 4 auch Zehner- bzw. Hunderternachbarn
    const step = max >= 1000 ? pick(rng, [1, 10, 100]) : max >= 100 ? pick(rng, [1, 10]) : 1;
    const n = randomInt(rng, step, max - step);
    const after = rng() < 0.5;
    const r = after ? n + step : n - step;
    const question =
      step === 1
        ? after
          ? `Welche Zahl kommt nach ${String(n)}?`
          : `Welche Zahl kommt vor ${String(n)}?`
        : `Rechne ${String(n)} ${after ? '+' : '−'} ${String(step)}.`;
    return makeTask(
      cfg,
      question,
      { kind: 'none' },
      'Kiko zählt mit dir.',
      [
        {
          question,
          answer: { type: 'number', correct: r },
          mistakes: numberMistakes(
            r,
            [
              {
                value: after ? n - step : n + step,
                feedback: after ? '„Nach“ heißt: eins weiter.' : '„Vor“ heißt: eins zurück.',
              },
              { value: n, feedback: `${String(n)} steht schon da. Gefragt ist eine andere Zahl.` },
            ],
            max,
          ),
          hints: [
            step === 1
              ? `Zähle laut bis ${String(n)} und dann ${after ? 'eins weiter' : 'eins zurück'}.`
              : `Nur die ${step === 10 ? 'Zehner' : 'Hunderter'} ändern sich.`,
            after ? `${String(n)}, dann …?` : `… dann ${String(n)}?`,
          ],
          explanation: after
            ? `Nach ${String(n)} kommt ${String(r)}.`
            : `Vor ${String(n)} kommt ${String(r)}.`,
        },
      ],
      1,
    );
  },
};

// ---------- ZR2: Zahlenstrahl ----------

const ZR2: Generator = {
  id: 'ZR2',
  topic: 'zahlenreihe',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const max = cfg.numbers.max;
    const step = pick(rng, lineSteps(cfg));
    const ticks = 6;
    const from = randomInt(rng, 0, Math.floor((max - step * (ticks - 1)) / step)) * step;
    const gap = randomInt(rng, 1, ticks - 2);
    const r = from + gap * step;
    const labels = Array.from({ length: ticks }, (_, i) => (i === gap ? null : from + i * step));
    return makeTask(
      cfg,
      'Zahlenstrahl',
      { kind: 'numberline', from, step, labels },
      'Kiko zeigt dir einen Zahlenstrahl.',
      [
        {
          question: 'Welche Zahl gehört in das gelbe Kästchen?',
          answer: { type: 'number', correct: r },
          mistakes: numberMistakes(
            r,
            [
              {
                value: r + 1,
                feedback:
                  step === 1
                    ? 'Fast! Schau auf die Zahl davor.'
                    : `Hier geht es in ${String(step)}er-Schritten.`,
              },
              {
                value: r - 1,
                feedback:
                  step === 1
                    ? 'Fast! Schau auf die Zahl danach.'
                    : `Hier geht es in ${String(step)}er-Schritten.`,
              },
              {
                value: r + step,
                feedback: 'Das ist die Zahl danach. Schau genau, wo das Kästchen ist.',
              },
            ],
            max,
          ),
          hints: [
            step === 1
              ? 'Die Zahlen gehen immer eins weiter.'
              : `Von Strich zu Strich geht es ${String(step)} weiter.`,
            `Vor dem Kästchen steht ${String(r - step)}.`,
          ],
          explanation: `${String(r - step)} + ${String(step)} = ${String(r)}. In das Kästchen gehört ${String(r)}.`,
        },
      ],
      2,
    );
  },
};

// ---------- ZR3: Größer oder kleiner? ----------

const ZR3: Generator = {
  id: 'ZR3',
  topic: 'zahlenreihe',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const max = cfg.numbers.max;
    const biggest = rng() < 0.5;
    const values = new Set<number>();
    while (values.size < cfg.choiceCount) values.add(randomInt(rng, 0, max));
    const sorted = [...values].sort((a, b) => a - b);
    const correct = biggest ? sorted[sorted.length - 1] : sorted[0];
    if (correct === undefined) return 'unsupported';
    const word = biggest ? 'größte' : 'kleinste';
    const answer = choice(
      { label: String(correct) },
      sorted
        .filter((v) => v !== correct)
        .map((v) => ({
          label: String(v),
          feedback: biggest
            ? `${String(v)} ist kleiner als ${String(correct)}.`
            : `${String(v)} ist größer als ${String(correct)}.`,
        })),
      cfg.choiceCount,
    );
    return makeTask(
      cfg,
      `Die ${word} Zahl`,
      { kind: 'none' },
      'Kiko vergleicht Zahlen.',
      [
        {
          question: `Welche Zahl ist die ${word}?`,
          answer,
          hints: [
            max > 10
              ? 'Vergleiche zuerst die vorderste Stelle.'
              : 'Welche Zahl kommt beim Zählen später?',
            biggest
              ? 'Die größte Zahl kommt beim Zählen zuletzt.'
              : 'Die kleinste Zahl kommt beim Zählen zuerst.',
          ],
          explanation: `${String(correct)} ist die ${word} Zahl: ${sorted.join(' < ')}.`,
        },
      ],
      1,
    );
  },
};

export const ZAHLENREIHE_GENERATORS: readonly Generator[] = [ZR1, ZR2, ZR3];
