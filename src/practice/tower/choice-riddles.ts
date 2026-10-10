import { ODD_CATEGORIES } from '@/content/odd';
import type { OddCategory } from '@/content/pictures-types';
import { QUIZ } from '@/content/quiz';
import type { QuizQuestion, QuizTopic } from '@/content/quiz/types';
import { SHADOW_THINGS } from '@/content/shadow';
import { UI } from '@/content/ui';
import { mulberry32, pick, randomInt, type Rng, shuffle } from '@/domain/random';
import type { ChoiceOption, Stufe, Task, TowerConfig } from '@/domain/types';

// Wissensfragen, „Was passt nicht?“ und Schattenrätsel als normale Aufgaben mit Antwortkarten
// (docs/12 3.3, 3.4, 3.10). So gelten Tipps, Vorlesen und Rückmeldungen wie überall.

const T = UI.choiceRiddles;

function task(id: string, scene: Task['scene'], part: Omit<Task['parts'][number], 'id'>): Task {
  return {
    id,
    title: part.question,
    difficulty: 1,
    authoredFor: 1,
    scene,
    story: '',
    parts: [{ id: `${id}-a`, ...part }],
  };
}

// ---------- Wissensfragen ----------

export function quizPool(stufe: Stufe, topic: QuizTopic | null): QuizQuestion[] {
  return QUIZ.filter(
    (q) => q.from <= stufe && stufe <= q.to && (topic === null || q.topic === topic),
  );
}

export function quizTask(question: QuizQuestion): Task {
  const options = question.answers.map((answer, i): ChoiceOption => ({
    id: `${question.id}-${String(i)}`,
    label: answer.text,
    ...(answer.icon === undefined ? {} : { icon: answer.icon }),
    ...(i === question.correct ? { correct: true as const } : {}),
  }));
  const wrong = question.answers.filter((_, i) => i !== question.correct);
  const lastWrong = wrong[wrong.length - 1]?.text ?? '';
  return task(
    `quiz-${question.id}`,
    { kind: 'none' },
    {
      question: question.question,
      answer: { type: 'choice', layout: 'cards', shuffle: false, options },
      hints: [question.hint, `${question.hint} ${T.notThis(lastWrong)}`],
      explanation: question.fact,
      praise: T.didYouKnow(question.fact),
    },
  );
}

/** Eine Runde: bevorzugt Fragen, deren Karte das Kind noch nicht hat. */
export function quizRound(
  stufe: Stufe,
  topic: QuizTopic | null,
  known: readonly string[],
  count: number,
  seed: number,
): QuizQuestion[] {
  const rng = mulberry32(seed);
  const pool = shuffle(rng, quizPool(stufe, topic));
  const fresh = pool.filter((q) => !known.includes(q.id));
  const old = pool.filter((q) => known.includes(q.id));
  return [...fresh, ...old].slice(0, count);
}

// ---------- Was passt nicht? ----------

/** Paare, bei denen das fremde Ding doch passen könnte (Möwe und Flugzeug sind auch am Himmel). */
const CLASHES: readonly [string, string][] = [
  ['himmel', 'voegel'],
  ['himmel', 'fahrzeuge'],
];

const clash = (a: string, b: string) =>
  CLASHES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

function pictureOdd(stufe: Stufe, rng: Rng, id: string): Task {
  const categories = ODD_CATEGORIES.filter((c) => c.from <= stufe);
  const group = pick(rng, categories);
  const other: OddCategory = pick(
    rng,
    categories.filter((c) => c.id !== group.id && !clash(c.id, group.id)),
  );
  const [a, b, c] = shuffle(rng, group.things);
  const stranger = pick(rng, other.things);
  if (!a || !b || !c) throw new Error(`Kategorie ${group.id} hat zu wenige Dinge`);
  const options = [a, b, c, stranger].map((thing): ChoiceOption => ({
    id: thing.icon,
    label: thing.name,
    icon: thing.icon,
    ...(thing === stranger ? { correct: true as const } : {}),
  }));
  return task(
    id,
    { kind: 'none' },
    {
      question: T.oddQuestion,
      answer: { type: 'choice', layout: 'cards', shuffle: true, options },
      hints: [T.oddHint1, T.oddHint2(a.name, b.name, group.are)],
      explanation: T.oddExplain(a.name, b.name, c.name, group.are, stranger.isA),
    },
  );
}

function numberOdd(max: number, rng: Rng, id: string): Task {
  const tens = rng() < 0.4;
  let same: number[];
  let stranger: number;
  let are: string;
  let isA: string;
  let hint: string;
  if (tens) {
    same = shuffle(
      rng,
      Array.from({ length: Math.floor(max / 10) }, (_, i) => (i + 1) * 10),
    ).slice(0, 3);
    do stranger = randomInt(rng, 11, max - 1);
    while (stranger % 10 === 0);
    are = T.tens;
    isA = T.notTens(stranger);
    hint = T.tensHint;
  } else {
    const even = rng() < 0.5;
    const fits = (n: number) => (n % 2 === 0) === even;
    const candidates = Array.from({ length: Math.min(max, 40) }, (_, i) => i + 2).filter(fits);
    same = shuffle(rng, candidates).slice(0, 3);
    do stranger = randomInt(rng, 2, Math.min(max, 40) + 1);
    while (fits(stranger));
    are = even ? T.even : T.odd;
    isA = even ? T.isOdd(stranger) : T.isEven(stranger);
    hint = T.evenHint;
  }
  const [a = 0, b = 0, c = 0] = same.sort((x, y) => x - y);
  const options = [a, b, c, stranger].map((n): ChoiceOption => ({
    id: String(n),
    label: String(n),
    ...(n === stranger ? { correct: true as const } : {}),
  }));
  return task(
    id,
    { kind: 'none' },
    {
      question: T.oddQuestion,
      answer: { type: 'choice', layout: 'cards', shuffle: true, options },
      hints: [T.numberHint1, hint],
      explanation: T.oddExplain(String(a), String(b), String(c), are, isA),
    },
  );
}

export function oddRound(
  cfg: TowerConfig['odd'],
  stufe: Stufe,
  count: number,
  seed: number,
): Task[] {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const id = `odd-${String(seed)}-${String(i)}`;
    return cfg.numbers && rng() < 0.4 ? numberOdd(cfg.max, rng, id) : pictureOdd(stufe, rng, id);
  });
}

// ---------- Schattenrätsel ----------

const TURNS = [90, 180, 270] as const;

export function shadowRound(cfg: TowerConfig['shadow'], count: number, seed: number): Task[] {
  const rng = mulberry32(seed);
  const targets = shuffle(rng, SHADOW_THINGS).slice(0, count);
  return targets.map((target, i) => {
    const others = shuffle(
      rng,
      SHADOW_THINGS.filter((t) => t.icon !== target.icon),
    ).slice(0, cfg.options - 1);
    const turn = () => ({
      rotate: cfg.rotate ? pick(rng, [0, ...TURNS] as const) : (0 as const),
      mirror: cfg.mirror && rng() < 0.5,
    });
    const options = [target, ...others].map((thing, n): ChoiceOption => ({
      id: thing.icon,
      label: T.shadowLabel(n + 1),
      icon: thing.icon,
      // der richtige Schatten ist ab Stufe 3 sicher gedreht, ab Stufe 4 auch gespiegelt
      shadow:
        thing === target && cfg.rotate ? { rotate: pick(rng, TURNS), mirror: cfg.mirror } : turn(),
      ...(thing === target ? { correct: true as const } : {}),
    }));
    // Nummern nach dem Mischen vergeben, damit „Schatten 1“ nicht immer richtig ist
    const mixed = shuffle(rng, options).map((o, n) => ({ ...o, label: T.shadowLabel(n + 1) }));
    return task(
      `shadow-${String(seed)}-${String(i)}`,
      {
        kind: 'items',
        items: [{ itemId: target.icon, label: target.name, noPrice: true }],
      },
      {
        question: cfg.rotate ? T.shadowQuestionTurned : T.shadowQuestion,
        answer: { type: 'choice', layout: 'cards', shuffle: false, options: mixed },
        hints: [T.shadowHint1, T.shadowHint2(target.name)],
        explanation: T.shadowExplain(target.name),
      },
    );
  });
}
