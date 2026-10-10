import { pick, randomInt } from '@/domain/random';
import type { StufeConfig } from '@/domain/types';
import { makeTask, readBind, readForce } from '../build';
import type { Generator } from '../types';
import { numberMistakes } from './mengen-zahlen-parts';

// Verdoppeln und Halbieren (docs/13). Auf Stufe 1 mit Dingen zum Zählen, ab Stufe 3 größere
// Zahlen; auf Stufe 4 Zehnerzahlen.

const PAIRS = [
  { id: 'kirschen', name: 'Kirschen' },
  { id: 'muschel', name: 'Muscheln' },
  { id: 'apfel', name: 'Äpfel' },
  { id: 'seestern', name: 'Seesterne' },
] as const;

const NAMES = ['Mia und Ben', 'Lina und Noah', 'Ida und Emil', 'Kiko und Krümel'] as const;

/** größte Zahl, die verdoppelt wird */
function doubleMax(cfg: StufeConfig): number {
  return Math.floor(cfg.numbers.max / 2);
}

function unit(cfg: StufeConfig): number {
  return cfg.numbers.max >= 1000 ? 10 : 1;
}

// ---------- V1: Verdoppeln ----------

const V1: Generator = {
  id: 'V1',
  topic: 'verdoppeln',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const u = unit(cfg);
    const small = cfg.numbers.max <= 10;
    // ab 2, damit „2 Kirschen“ statt „1 Kirschen“
    const n = randomInt(rng, small ? 2 : 1, doubleMax(cfg) / u) * u;
    const r = 2 * n;
    const thing = pick(rng, PAIRS);
    return makeTask(
      cfg,
      `Das Doppelte von ${String(n)}`,
      small
        ? {
            kind: 'objects',
            groups: [
              { itemId: thing.id, count: n },
              { itemId: thing.id, count: n },
            ],
          }
        : { kind: 'none' },
      small ? `Links liegen ${String(n)} ${thing.name}, rechts genauso viele.` : 'Kiko verdoppelt.',
      [
        {
          question: small
            ? 'Wie viele sind es zusammen?'
            : `Verdopple ${String(n)}. Wie viel ist das?`,
          answer: { type: 'number', correct: r },
          mistakes: numberMistakes(
            r,
            [
              {
                value: n,
                feedback: `Verdoppeln heißt: ${String(n)} und noch einmal ${String(n)}.`,
              },
              {
                value: n + 2 * u,
                feedback: 'Verdoppeln heißt: die gleiche Zahl noch einmal dazu.',
              },
              { value: r + u, feedback: 'Fast! Zähle noch einmal genau.' },
              { value: r - u, feedback: 'Fast! Zähle noch einmal genau.' },
            ],
            cfg.numbers.max,
          ),
          hints: [
            `Das Doppelte ist die gleiche Zahl zweimal: ${String(n)} + ${String(n)}.`,
            n > 10 && u === 1
              ? `Verdopple erst die Zehner, dann die Einer.`
              : `Fang bei ${String(n)} an und zähle ${String(n)} weiter.`,
          ],
          explanation: `${String(n)} + ${String(n)} = ${String(r)}. Das Doppelte von ${String(n)} ist ${String(r)}.`,
        },
      ],
      2,
    );
  },
};

// ---------- V2: Halbieren (gerecht teilen) ----------

const V2: Generator = {
  id: 'V2',
  topic: 'verdoppeln',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const u = unit(cfg);
    const small = cfg.numbers.max <= 10;
    const half = randomInt(rng, small ? 1 : 2, doubleMax(cfg) / u) * u;
    const n = 2 * half;
    const thing = pick(rng, PAIRS);
    const kids = pick(rng, NAMES);
    return makeTask(
      cfg,
      `Die Hälfte von ${String(n)}`,
      small ? { kind: 'objects', groups: [{ itemId: thing.id, count: n }] } : { kind: 'none' },
      small
        ? `${kids} teilen ${String(n)} ${thing.name} gerecht.`
        : `${kids} teilen ${String(n)} ${thing.name} gerecht. Beide bekommen gleich viele.`,
      [
        {
          question: small
            ? 'Wie viele bekommt jedes Kind?'
            : `Wie viel ist die Hälfte von ${String(n)}?`,
          answer: { type: 'number', correct: half },
          mistakes: numberMistakes(
            half,
            [
              { value: n, feedback: 'Das sind alle zusammen. Wie viele bekommt jedes Kind?' },
              { value: n * 2, feedback: 'Beim Teilen wird es weniger, nicht mehr.' },
              { value: half + u, feedback: 'Prüfe: Bekommen beide gleich viele?' },
              { value: half - u, feedback: 'Prüfe: Bekommen beide gleich viele?' },
            ],
            cfg.numbers.max,
          ),
          hints: [
            small
              ? 'Gib immer abwechselnd eins nach links und eins nach rechts.'
              : 'Die Hälfte ist die Zahl, die verdoppelt wieder alles ergibt.',
            `Welche Zahl plus die gleiche Zahl ergibt ${String(n)}?`,
          ],
          explanation: `${String(half)} + ${String(half)} = ${String(n)}. Die Hälfte von ${String(n)} ist ${String(half)}.`,
        },
      ],
      3,
    );
  },
};

export const VERDOPPELN_GENERATORS: readonly Generator[] = [V1, V2];
