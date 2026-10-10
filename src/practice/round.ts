import { STUFEN } from '@/config/levels';
import { mulberry32, pick } from '@/domain/random';
import type { PracticeTopicId, Stufe, Task } from '@/domain/types';
import { GENERATORS } from './generators';
import type { Generator, GenerateOptions } from './types';
import { validateTask } from './validate';

// Übungsrunden und geprüfte Einzelaufgaben aus Vorlagen (docs/05 Abschnitt 6).

const MAX_TRIES = 20;

const ALL_STUFEN = Object.values(STUFEN).map((cfg) => cfg.id);

/** Verschobene Stufe für „Wie schwer?“, begrenzt auf die vorhandenen Stufen (docs/09 6). */
export function shiftStufe(stufe: Stufe, shift: -1 | 0 | 1): Stufe {
  const index = ALL_STUFEN.indexOf(stufe) + shift;
  return ALL_STUFEN[Math.min(ALL_STUFEN.length - 1, Math.max(0, index))] ?? stufe;
}

function generatorsFor(topic: PracticeTopicId, stufe: Stufe): Generator[] {
  return GENERATORS.filter((g) => g.topic === topic && g.stufen.includes(stufe));
}

/** Gibt es für das Thema auf dieser Stufe Vorlagen? */
export function hasTopic(topic: PracticeTopicId, stufe: Stufe): boolean {
  return generatorsFor(topic, stufe).length > 0;
}

/** Versucht bis zu 20 Seeds; liefert nur Aufgaben, die alle Prüfungen bestehen. */
export function generateValid(
  generator: Generator,
  stufe: Stufe,
  seed: number,
  opts?: GenerateOptions,
): Task | null {
  const cfg = STUFEN[stufe];
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const task = generator.generate(cfg, mulberry32(seed + attempt * 7919), opts);
    if (task !== 'unsupported' && validateTask(task, cfg).length === 0) return task;
  }
  return null;
}

/** Vergibt Aufgaben- und Teil-IDs. */
export function withId(task: Task, id: string): Task {
  return {
    ...task,
    id,
    parts: task.parts.map((part, i) => ({ ...part, id: `${id}-${'abc'.charAt(i)}` })),
  };
}

/**
 * Eine Übungsrunde: keine Vorlage zweimal hintereinander, die erste aus der leichteren Hälfte.
 * IDs `p-{topic}-s{stufe}-{seed}-{i}`.
 */
export function buildRound(
  topic: PracticeTopicId,
  stufe: Stufe,
  count: 5 | 10,
  seed: number,
): Task[] {
  const generators = generatorsFor(topic, stufe);
  if (generators.length === 0) return [];
  const rng = mulberry32(seed);
  const tasks: Task[] = [];
  let previous: Generator | undefined;
  for (let i = 0; tasks.length < count && i < count * 4; i++) {
    const pool =
      tasks.length === 0
        ? generators.slice(0, Math.ceil(generators.length / 2))
        : generators.filter((g) => generators.length === 1 || g !== previous);
    const generator = pick(rng, pool);
    const task = generateValid(generator, stufe, Math.floor(rng() * 2 ** 31));
    if (!task) continue;
    const last = tasks.at(-1);
    if (
      last &&
      JSON.stringify(last.parts.map((p) => p.answer)) ===
        JSON.stringify(task.parts.map((p) => p.answer))
    ) {
      continue;
    }
    previous = generator;
    tasks.push(
      withId(task, `p-${topic}-s${String(stufe)}-${String(seed)}-${String(tasks.length)}`),
    );
  }
  return tasks;
}
