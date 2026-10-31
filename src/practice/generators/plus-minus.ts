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
  stufen: [1, 2, 3, 4],
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

// ---------- PM4: Zahlenhaus ----------

const PM4: Generator = {
  id: 'PM4',
  topic: 'plus-minus',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['etagen', 'dachFehlt']);
    readBind(opts, []);
    if (force.etagen !== undefined && force.etagen !== 2 && force.etagen !== 3) {
      throw new Error('PM4: etagen');
    }
    if (force.dachFehlt !== undefined && typeof force.dachFehlt !== 'boolean') {
      throw new Error('PM4: dachFehlt');
    }
    const u = unit(cfg);
    const max = cfg.numbers.max;
    const floors = force.etagen ?? (cfg.id === 1 ? 2 : 3);
    const dach = rand(rng, cfg, (floors + 2) * u, max);
    const usedLeft = new Set<number>();
    const pairs: [number, number][] = [];
    for (let tries = 0; tries < 60 && pairs.length < floors; tries++) {
      const left = rand(rng, cfg, u, dach - u);
      if (usedLeft.has(left)) continue;
      usedLeft.add(left);
      pairs.push([left, dach - left]);
    }
    if (pairs.length < floors) return 'unsupported';

    const roofOpen = force.dachFehlt === true;
    const cells = [
      { id: 'dach', value: dach, given: !roofOpen },
      ...pairs.flatMap(([l, r], row) => {
        if (roofOpen && row === 0) {
          return [
            { id: `r${String(row)}l`, value: l, given: true },
            { id: `r${String(row)}r`, value: r, given: true },
          ];
        }
        const hideLeft = row % 2 === 1;
        return [
          { id: `r${String(row)}l`, value: l, given: !hideLeft },
          { id: `r${String(row)}r`, value: r, given: hideLeft },
        ];
      }),
    ];
    const firstPair = pairs[roofOpen ? 0 : 0] ?? [u, dach - u];
    const knownRoom = roofOpen ? firstPair[0] : firstPair[0];
    return makeTask(
      cfg,
      `Zahlenhaus ${String(dach)}`,
      { kind: 'none' },
      'Zwei Zimmer nebeneinander ergeben zusammen die Zahl im Dach.',
      [
        {
          question: 'Fülle die leeren Felder im Zahlenhaus aus.',
          answer: { type: 'grid', shape: 'house', unit: 'number', cells },
          hints: [
            'Beide Zimmer einer Etage ergeben zusammen die Dachzahl.',
            roofOpen
              ? `Rechne zuerst oben das Dach aus: ${String(firstPair[0])} + ${String(firstPair[1])}.`
              : `Im ersten Zimmer steht ${String(knownRoom)}. Wie viel fehlt bis ${String(dach)}?`,
          ],
          explanation: pairs
            .map(([l, r]) => `${String(l)} + ${String(r)} = ${String(dach)}.`)
            .join(' '),
        },
      ],
      3,
    );
  },
};

// ---------- PM5: Zahlenmauer ohne Geld ----------

const PM5: Generator = {
  id: 'PM5',
  topic: 'plus-minus',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['unten']);
    readBind(opts, []);
    if (force.unten !== undefined && typeof force.unten !== 'boolean') {
      throw new Error('PM5: unten');
    }
    const u = unit(cfg);
    const max = cfg.numbers.max;
    const bottomGap = force.unten === true;
    if (cfg.id === 1) {
      const a = rand(rng, cfg, u, Math.floor(max / 2));
      const b = rand(rng, cfg, u, max - a);
      const top = a + b;
      const cells = [
        { id: 'r1c0', value: top, given: bottomGap },
        { id: 'r0c0', value: a, given: true },
        { id: 'r0c1', value: b, given: !bottomGap },
      ];
      return makeTask(
        cfg,
        'Die Zahlenmauer',
        { kind: 'none' },
        'Auf dem Planeten steht eine Zahlenmauer.',
        [
          {
            question: 'Welche Zahl gehört auf den leeren Stein?',
            answer: { type: 'grid', shape: 'wall', unit: 'number', cells },
            hints: [
              'Zwei Steine nebeneinander ergeben zusammen den Stein darüber.',
              bottomGap
                ? `Rechne ${String(top)} − ${String(a)}.`
                : `Rechne ${String(a)} + ${String(b)}.`,
            ],
            explanation: `${String(a)} + ${String(b)} = ${String(top)}.`,
          },
        ],
        3,
      );
    }
    const third = Math.floor(max / 4 / u) * u;
    if (third < u) return 'unsupported';
    const b0 = rand(rng, cfg, u, third);
    const b1 = rand(rng, cfg, u, third);
    const b2 = rand(rng, cfg, u, third);
    const m0 = b0 + b1;
    const m1 = b1 + b2;
    const top = m0 + m1;
    if (top > max) return 'unsupported';
    // DOM-Reihenfolge von oben (Reihe 2) nach unten (Reihe 0)
    const cells = [
      { id: 'r2c0', value: top, given: false },
      { id: 'r1c0', value: m0, given: true },
      { id: 'r1c1', value: m1, given: bottomGap },
      { id: 'r0c0', value: b0, given: true },
      { id: 'r0c1', value: b1, given: !bottomGap },
      { id: 'r0c2', value: b2, given: true },
    ];
    return makeTask(
      cfg,
      'Die Zahlenmauer',
      { kind: 'none' },
      'Zwei Steine nebeneinander ergeben zusammen den Stein darüber.',
      [
        {
          question: 'Fülle die leeren Steine der Zahlenmauer aus.',
          answer: { type: 'grid', shape: 'wall', unit: 'number', cells },
          hints: [
            'Zwei Steine nebeneinander ergeben zusammen den Stein darüber.',
            bottomGap
              ? `Unten fehlt ein Stein: Rechne ${String(m0)} − ${String(b0)}.`
              : `Rechne zuerst ${String(b1)} + ${String(b2)}.`,
          ],
          explanation: `${String(b0)} + ${String(b1)} = ${String(m0)}. ${String(b1)} + ${String(b2)} = ${String(m1)}. ${String(m0)} + ${String(m1)} = ${String(top)}.`,
        },
      ],
      3,
    );
  },
};

// ---------- PM6: Rechendreieck ohne Geld ----------

const PM6: Generator = {
  id: 'PM6',
  topic: 'plus-minus',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const u = unit(cfg);
    const max = cfg.numbers.max;
    const half = Math.floor(max / 2 / u) * u;
    if (half < 2 * u) return 'unsupported';
    const a = rand(rng, cfg, u, half);
    const b = rand(rng, cfg, u, half);
    const c = rand(rng, cfg, u, half);
    const ab = a + b;
    const bc = b + c;
    const ca = c + a;
    if (ab > max || bc > max || ca > max) return 'unsupported';
    const cells = [
      { id: 'a', value: a, given: true },
      { id: 'b', value: b, given: true },
      { id: 'c', value: c, given: cfg.id <= 2 },
      { id: 'ab', value: ab, given: false },
      { id: 'bc', value: bc, given: false },
      { id: 'ca', value: ca, given: cfg.id !== 2 },
    ];
    return makeTask(
      cfg,
      'Das Rechendreieck',
      { kind: 'none' },
      'Zwei Zahlen innen ergeben zusammen die Zahl außen.',
      [
        {
          question: 'Fülle die leeren Felder im Rechendreieck aus.',
          answer: { type: 'grid', shape: 'triangle', unit: 'number', cells },
          hints: [
            'Jede Zahl außen ist so groß wie die zwei Zahlen innen daneben zusammen.',
            cfg.id >= 3
              ? `Rechne zuerst ${String(ca)} − ${String(a)} für das leere Innenfeld.`
              : `Rechne ${String(a)} + ${String(b)}.`,
          ],
          explanation: `${String(a)} + ${String(b)} = ${String(ab)}. ${String(b)} + ${String(c)} = ${String(bc)}. ${String(c)} + ${String(a)} = ${String(ca)}.`,
        },
      ],
      4,
    );
  },
};

// ---------- PM7: Kettenaufgabe ----------

const PM7: Generator = {
  id: 'PM7',
  topic: 'plus-minus',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const u = unit(cfg);
    const max = cfg.numbers.max;
    for (let tries = 0; tries < 50; tries++) {
      const a = rand(rng, cfg, 2 * u, max - 2 * u);
      const b = rand(rng, cfg, u, max - a);
      const mid = a + b;
      const c = rand(rng, cfg, u, mid - u);
      const r = mid - c;
      if (!cfg.carry && (!noCarry(a, b, true) || !noCarry(mid, c, false))) continue;
      return makeTask(
        cfg,
        `${String(a)} + ${String(b)} − ${String(c)}`,
        { kind: 'none' },
        'Kikos Rakete fliegt in zwei Schritten.',
        [
          {
            question: `Rechne Schritt für Schritt: ${String(a)} + ${String(b)} − ${String(c)} = ?`,
            answer: { type: 'number', correct: r },
            mistakes: numberMistakes(
              r,
              [
                {
                  value: mid,
                  feedback: `${String(mid)} ist der erste Schritt. Ziehe jetzt noch ${String(c)} ab.`,
                },
                {
                  value: mid + c,
                  feedback: `Beim zweiten Schritt steht Minus: Ziehe ${String(c)} ab.`,
                },
                { value: r + u, feedback: 'Fast! Rechne noch einmal genau nach.' },
              ],
              max,
            ),
            hints: [
              `Rechne zuerst ${String(a)} + ${String(b)}.`,
              `${String(a)} + ${String(b)} = ${String(mid)}. Jetzt noch Minus ${String(c)}.`,
            ],
            explanation: `Erst ${String(a)} + ${String(b)} = ${String(mid)}, dann ${String(mid)} − ${String(c)} = ${String(r)}.`,
          },
        ],
        4,
      );
    }
    return 'unsupported';
  },
};

export const PLUS_MINUS_GENERATORS: readonly Generator[] = [PM1, PM2, PM3, PM4, PM5, PM6, PM7];
