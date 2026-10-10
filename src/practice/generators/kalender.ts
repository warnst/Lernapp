import { MONTHS, WEEKDAYS } from '@/content/calendar';
import { pick, randomInt } from '@/domain/random';
import { choice, makeTask, readBind, readForce } from '../build';
import type { Generator } from '../types';

// Wochentage und Monate (docs/13): Reihenfolge, „übermorgen“, „in 3 Tagen“, Monate ab Stufe 3.

function at<T>(list: readonly T[], index: number): T {
  const item = list[((index % list.length) + list.length) % list.length];
  if (item === undefined) throw new Error('leere Liste');
  return item;
}

const OFFSET_WORDS: Record<number, string> = { 1: 'morgen', 2: 'übermorgen' };

// ---------- KA1: Welcher Tag kommt danach? ----------

const KA1: Generator = {
  id: 'KA1',
  topic: 'kalender',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const today = randomInt(rng, 0, 6);
    const offset = randomInt(rng, 1, cfg.calendar.maxOffset);
    const before = offset === 1 && rng() < 0.4;
    const target = before ? today - 1 : today + offset;
    const day = at(WEEKDAYS, today);
    const question = before
      ? `Welcher Tag kommt vor ${day}?`
      : offset <= 2
        ? `Heute ist ${day}. Welcher Tag ist ${OFFSET_WORDS[offset] ?? ''}?`
        : `Heute ist ${day}. Welcher Tag ist in ${String(offset)} Tagen?`;
    const answer = choice(
      { label: at(WEEKDAYS, target) },
      [
        {
          label: at(WEEKDAYS, before ? today + 1 : today - offset),
          feedback: before
            ? '„Vor“ heißt: der Tag davor.'
            : 'Geh in der Woche vorwärts, nicht zurück.',
        },
        { label: at(WEEKDAYS, target + 1), feedback: 'Zähle die Tage noch einmal genau.' },
        { label: at(WEEKDAYS, target - 1), feedback: 'Zähle die Tage noch einmal genau.' },
        { label: day, feedback: `Heute ist ${day}. Gefragt ist ein anderer Tag.` },
      ],
      cfg.choiceCount,
    );
    return makeTask(
      cfg,
      'Wochentage',
      { kind: 'none' },
      'Kiko schaut in den Kalender.',
      [
        {
          question,
          answer,
          hints: [
            'Sag die Wochentage der Reihe nach auf: Montag, Dienstag, Mittwoch …',
            before
              ? `Welcher Tag kommt direkt vor ${day}?`
              : `Fang bei ${day} an und zähle ${String(offset)} Tage weiter.`,
          ],
          explanation: before
            ? `Vor ${day} kommt ${at(WEEKDAYS, target)}.`
            : offset === 1
              ? `Nach ${day} kommt ${at(WEEKDAYS, target)}.`
              : `Nach ${day} kommen ${Array.from({ length: offset }, (_, i) => at(WEEKDAYS, today + i + 1)).join(', ')}. Es ist ${at(WEEKDAYS, target)}.`,
        },
      ],
      2,
    );
  },
};

// ---------- KA2: Monate ----------

const KA2: Generator = {
  id: 'KA2',
  topic: 'kalender',
  stufen: [3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.calendar.months) return 'unsupported';
    const month = randomInt(rng, 0, 11);
    const after = rng() < 0.6;
    const target = after ? month + 1 : month - 1;
    const name = at(MONTHS, month);
    const answer = choice(
      { label: at(MONTHS, target) },
      [
        {
          label: at(MONTHS, after ? month - 1 : month + 1),
          feedback: after ? '„Nach“ heißt: der Monat danach.' : '„Vor“ heißt: der Monat davor.',
        },
        { label: at(MONTHS, target + (after ? 1 : -1)), feedback: 'Das ist einen Monat zu weit.' },
        { label: name, feedback: `Gefragt ist ein anderer Monat als ${name}.` },
      ],
      cfg.choiceCount,
    );
    return makeTask(
      cfg,
      'Monate',
      { kind: 'none' },
      'Kiko schaut in den Kalender.',
      [
        {
          question: after
            ? `Welcher Monat kommt nach ${name}?`
            : `Welcher Monat kommt vor ${name}?`,
          answer,
          hints: [
            'Sag die Monate der Reihe nach auf: Januar, Februar, März …',
            'Nach Dezember fängt das Jahr wieder mit Januar an.',
          ],
          explanation: after
            ? `Nach ${name} kommt ${at(MONTHS, target)}.`
            : `Vor ${name} kommt ${at(MONTHS, target)}.`,
        },
      ],
      3,
    );
  },
};

// ---------- KA3: Wie viele? ----------

const FACTS = [
  {
    question: 'Wie viele Tage hat eine Woche?',
    correct: 7,
    hint: 'Zähle die Wochentage von Montag bis Sonntag.',
    explanation: 'Eine Woche hat 7 Tage: Montag bis Sonntag.',
  },
  {
    question: 'Wie viele Monate hat ein Jahr?',
    correct: 12,
    hint: 'Zähle die Monate von Januar bis Dezember.',
    explanation: 'Ein Jahr hat 12 Monate: Januar bis Dezember.',
  },
  {
    question: 'Wie viele Tage hat das Wochenende?',
    correct: 2,
    hint: 'Das Wochenende sind Samstag und Sonntag.',
    explanation: 'Das Wochenende hat 2 Tage: Samstag und Sonntag.',
  },
  {
    question: 'Wie viele Stunden hat ein Tag?',
    correct: 24,
    hint: 'Der kleine Zeiger geht an einem Tag zweimal ganz herum.',
    explanation: 'Ein Tag hat 24 Stunden. Der kleine Zeiger geht zweimal herum: 2 mal 12.',
  },
] as const;

const KA3: Generator = {
  id: 'KA3',
  topic: 'kalender',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const fact = pick(
      rng,
      FACTS.filter((f) => f.correct <= cfg.numbers.max),
    );
    return makeTask(
      cfg,
      fact.question,
      { kind: 'none' },
      'Kiko hat eine Frage.',
      [
        {
          question: fact.question,
          answer: { type: 'number', correct: fact.correct },
          hints: [fact.hint, 'Zähle mit den Fingern mit.'],
          explanation: fact.explanation,
        },
      ],
      2,
    );
  },
};

export const KALENDER_GENERATORS: readonly Generator[] = [KA1, KA2, KA3];
