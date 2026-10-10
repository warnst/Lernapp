import { pick, randomInt, shuffle } from '@/domain/random';
import type { ShapeKind } from '@/domain/types';
import { choice, makeTask, readBind, readForce } from '../build';
import type { Generator } from '../types';
import { numberMistakes } from './mengen-zahlen-parts';

// Formen (docs/13): erkennen, benennen, zählen, Ecken zählen.

const NAMES: Record<ShapeKind, { name: string; plural: string; corners: number; tip: string }> = {
  kreis: {
    name: 'Kreis',
    plural: 'Kreise',
    corners: 0,
    tip: 'Ein Kreis ist ganz rund und hat keine Ecken.',
  },
  dreieck: {
    name: 'Dreieck',
    plural: 'Dreiecke',
    corners: 3,
    tip: 'Ein Dreieck hat 3 Ecken und 3 Seiten.',
  },
  quadrat: {
    name: 'Quadrat',
    plural: 'Quadrate',
    corners: 4,
    tip: 'Ein Quadrat hat 4 Ecken und 4 gleich lange Seiten.',
  },
  rechteck: {
    name: 'Rechteck',
    plural: 'Rechtecke',
    corners: 4,
    tip: 'Ein Rechteck hat 4 Ecken. Zwei Seiten sind lang, zwei sind kurz.',
  },
  fuenfeck: { name: 'Fünfeck', plural: 'Fünfecke', corners: 5, tip: 'Ein Fünfeck hat 5 Ecken.' },
  sechseck: { name: 'Sechseck', plural: 'Sechsecke', corners: 6, tip: 'Ein Sechseck hat 6 Ecken.' },
};

// ---------- F1: Welche Form ist ein …? ----------

const F1: Generator = {
  id: 'F1',
  topic: 'formen',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const [target, ...others] = shuffle(rng, cfg.shapes.kinds);
    if (!target) return 'unsupported';
    const info = NAMES[target];
    const answer = choice(
      { label: info.name, shape: target },
      others.map((shape) => ({
        label: NAMES[shape].name,
        shape,
        feedback: `Das ist ein ${NAMES[shape].name}. ${info.tip}`,
      })),
      cfg.choiceCount,
    );
    return makeTask(
      cfg,
      `Welche Form ist ein ${info.name}?`,
      { kind: 'none' },
      'Kiko sucht Formen.',
      [
        {
          question: `Welche Form ist ein ${info.name}?`,
          answer,
          hints: [info.tip, 'Zähle die Ecken.'],
          explanation: info.tip,
        },
      ],
      1,
    );
  },
};

// ---------- F2: Wie heißt diese Form? ----------

const F2: Generator = {
  id: 'F2',
  topic: 'formen',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const [target, ...others] = shuffle(rng, cfg.shapes.kinds);
    if (!target) return 'unsupported';
    const info = NAMES[target];
    const answer = choice(
      { label: info.name },
      others.map((shape) => ({ label: NAMES[shape].name, feedback: NAMES[shape].tip })),
      cfg.choiceCount,
    );
    return makeTask(
      cfg,
      'Wie heißt diese Form?',
      { kind: 'shapes', shapes: [{ shape: target, color: randomInt(rng, 0, 4) }] },
      'Kiko hat eine Form gefunden.',
      [
        {
          question: 'Wie heißt diese Form?',
          answer,
          hints: ['Zähle die Ecken.', 'Sind alle Seiten gleich lang?'],
          explanation: `Das ist ein ${info.name}. ${info.tip}`,
        },
      ],
      1,
    );
  },
};

// ---------- F3: Wie viele … siehst du? ----------

const F3: Generator = {
  id: 'F3',
  topic: 'formen',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const target = pick(rng, cfg.shapes.kinds);
    const total = randomInt(rng, 5, Math.min(9, cfg.numbers.max));
    const count = randomInt(rng, 1, Math.min(4, total - 1));
    const others = cfg.shapes.kinds.filter((k) => k !== target);
    const shapes = shuffle(rng, [
      ...Array.from({ length: count }, () => target),
      ...Array.from({ length: total - count }, () => pick(rng, others)),
    ]).map((shape) => ({ shape, color: randomInt(rng, 0, 4) }));
    const info = NAMES[target];
    return makeTask(
      cfg,
      `Wie viele ${info.plural}?`,
      { kind: 'shapes', shapes },
      'Kiko hat viele Formen gemalt.',
      [
        {
          question: `Wie viele ${info.plural} siehst du?`,
          answer: { type: 'number', correct: count },
          mistakes: numberMistakes(
            count,
            [
              { value: total, feedback: `Das sind alle Formen. Zähle nur die ${info.plural}.` },
              {
                value: count + 1,
                feedback: `Schau genau: Ist jede davon wirklich ein ${info.name}?`,
              },
              { value: count - 1, feedback: 'Fast! Hast du eins übersehen?' },
            ],
            cfg.numbers.max,
          ),
          hints: [info.tip, 'Zeige mit dem Finger auf jede Form und zähle mit.'],
          explanation:
            count === 1 ? `Es ist 1 ${info.name}.` : `Es sind ${String(count)} ${info.plural}.`,
        },
      ],
      2,
    );
  },
};

// ---------- F4: Wie viele Ecken? ----------

const F4: Generator = {
  id: 'F4',
  topic: 'formen',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.shapes.corners) return 'unsupported';
    const target = pick(rng, cfg.shapes.kinds);
    const info = NAMES[target];
    return makeTask(
      cfg,
      `Ecken: ${info.name}`,
      { kind: 'shapes', shapes: [{ shape: target, color: randomInt(rng, 0, 4) }] },
      'Kiko zählt Ecken.',
      [
        {
          question: `Wie viele Ecken hat ein ${info.name}?`,
          answer: { type: 'number', correct: info.corners },
          mistakes: numberMistakes(
            info.corners,
            [
              { value: info.corners + 1, feedback: 'Zähle jede Ecke nur einmal.' },
              { value: info.corners - 1, feedback: 'Hast du eine Ecke übersehen?' },
            ],
            cfg.numbers.max,
          ),
          hints: [
            'Eine Ecke ist da, wo zwei Seiten zusammenstoßen.',
            'Fahr mit dem Finger am Rand entlang und zähle die Ecken.',
          ],
          explanation: info.tip,
        },
      ],
      2,
    );
  },
};

export const FORMEN_GENERATORS: readonly Generator[] = [F1, F2, F3, F4];
