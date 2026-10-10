import { addMinutes, sameTime, timeDigital, timeDigitalSpoken, timeWords } from '@/domain/clock';
import { pick, randomInt, type Rng } from '@/domain/random';
import type { ClockTime, StufeConfig } from '@/domain/types';
import { cap, choice, makeTask, readBind, readForce } from '../build';
import type { Generator } from '../types';

// Uhrzeit (docs/13): Uhr lesen, passende Uhr finden, Uhr stellen, Zeitspannen.
// Der Minutenschritt kommt aus levels.ts (Stufe 1 volle, 2 halbe, 3 Viertel-, 4 Fünf-Minuten).

const HOUR_HINT = 'Der kleine Zeiger zeigt die Stunde. Der große Zeiger zeigt die Minuten.';

/** Zufällige Zeit im Minutenschritt der Stufe; 12 Uhr nur, wenn `noon` erlaubt ist. */
function randomTime(cfg: StufeConfig, rng: Rng, noon = true): ClockTime {
  const steps = 60 / cfg.clock.step;
  for (;;) {
    const time = {
      hour: randomInt(rng, 1, 12),
      minute: randomInt(rng, 0, steps - 1) * cfg.clock.step,
    };
    if (noon || time.hour !== 12 || time.minute !== 0) return time;
  }
}

/** Anzeige einer Zeit: auf Stufe 4 digital, sonst in Worten. */
function label(cfg: StufeConfig, time: ClockTime): string {
  return cfg.clock.digital ? timeDigital(time) : timeWords(time);
}

function spoken(cfg: StufeConfig, time: ClockTime): string {
  return cfg.clock.digital ? timeDigitalSpoken(time) : timeWords(time);
}

/** Typische Verwechslungen: Stunde daneben (vor allem bei „halb“), Zeiger vertauscht, Schritt daneben. */
function confusions(cfg: StufeConfig, time: ClockTime): { time: ClockTime; feedback: string }[] {
  const list: { time: ClockTime; feedback: string }[] = [
    {
      time: addMinutes(time, -60),
      feedback:
        time.minute >= 30
          ? 'Schau genau: Der kleine Zeiger ist schon über die Zahl hinaus. Bei „halb“ und „Viertel vor“ nennen wir die nächste Stunde.'
          : 'Schau genau, wo der kleine Zeiger steht.',
    },
    { time: addMinutes(time, 60), feedback: 'Schau genau, wo der kleine Zeiger steht.' },
  ];
  const swapped = { hour: time.minute === 0 ? 12 : time.minute / 5, minute: (time.hour % 12) * 5 };
  if (Number.isInteger(swapped.hour) && swapped.minute % cfg.clock.step === 0) {
    list.push({ time: swapped, feedback: HOUR_HINT });
  }
  if (cfg.clock.step < 60) {
    list.push({
      time: addMinutes(time, cfg.clock.step),
      feedback: 'Schau genau auf den großen Zeiger.',
    });
    list.push({
      time: addMinutes(time, -cfg.clock.step),
      feedback: 'Schau genau auf den großen Zeiger.',
    });
  }
  return list.filter((c) => !sameTime(c.time, time));
}

/** „der kleine Zeiger zwischen 3 und 4, der große auf der 6“ */
function hands(time: ClockTime): string {
  const next = time.hour === 12 ? 1 : time.hour + 1;
  const small =
    time.minute === 0
      ? `auf der ${String(time.hour)}`
      : `zwischen ${String(time.hour)} und ${String(next)}`;
  const big = time.minute === 0 ? 12 : time.minute / 5;
  return `Der kleine Zeiger steht ${small}, der große Zeiger auf der ${String(big)}.`;
}

function minuteHint(cfg: StufeConfig): string {
  switch (cfg.clock.step) {
    case 60:
      return 'Der große Zeiger zeigt nach oben auf die 12. Dann ist es eine volle Stunde.';
    case 30:
      return 'Zeigt der große Zeiger nach unten auf die 6, ist es „halb“.';
    case 15:
      return 'Großer Zeiger auf der 3: Viertel nach. Auf der 6: halb. Auf der 9: Viertel vor.';
    default:
      return 'Von Zahl zu Zahl sind es 5 Minuten. Zähle in Fünferschritten: 5, 10, 15 …';
  }
}

// ---------- U1: Wie spät ist es? ----------

const U1: Generator = {
  id: 'U1',
  topic: 'uhrzeit',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const time = randomTime(cfg, rng);
    const answer = choice(
      { label: label(cfg, time) },
      confusions(cfg, time).map((c) => ({ label: label(cfg, c.time), feedback: c.feedback })),
      cfg.choiceCount,
    );
    return makeTask(
      cfg,
      'Wie spät ist es?',
      { kind: 'clock', time },
      'Kiko schaut auf die Uhr.',
      [
        {
          question: 'Wie spät ist es?',
          answer,
          hints: [HOUR_HINT, minuteHint(cfg)],
          explanation: `${hands(time)} Es ist ${spoken(cfg, time)}.`,
        },
      ],
      2,
    );
  },
};

// ---------- U2: Welche Uhr zeigt …? ----------

const U2: Generator = {
  id: 'U2',
  topic: 'uhrzeit',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    const time = randomTime(cfg, rng);
    const answer = choice(
      { label: label(cfg, time), clock: time },
      confusions(cfg, time).map((c) => ({
        label: label(cfg, c.time),
        clock: c.time,
        feedback: `Diese Uhr zeigt ${spoken(cfg, c.time)}. ${c.feedback}`,
      })),
      cfg.choiceCount,
    );
    return makeTask(
      cfg,
      `Welche Uhr zeigt ${label(cfg, time)}?`,
      { kind: 'none' },
      'Kiko hat viele Uhren.',
      [
        {
          question: `Welche Uhr zeigt ${label(cfg, time)}?`,
          answer,
          hints: [HOUR_HINT, minuteHint(cfg)],
          explanation: `${hands(time)} Das ist ${spoken(cfg, time)}.`,
        },
      ],
      2,
    );
  },
};

// ---------- U3: Stell die Uhr ----------

const U3: Generator = {
  id: 'U3',
  topic: 'uhrzeit',
  stufen: [1, 2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    // die Uhr zum Stellen startet auf 12 Uhr, also nie 12 Uhr fragen
    const time = randomTime(cfg, rng, false);
    return makeTask(
      cfg,
      `Stell die Uhr auf ${label(cfg, time)}`,
      { kind: 'none' },
      'Kiko möchte die Uhr stellen.',
      [
        {
          question: `Stell die Uhr auf ${label(cfg, time)}.`,
          answer: { type: 'clock', correct: time, step: cfg.clock.step },
          hints: [
            cfg.clock.step === 60
              ? `Der große Zeiger bleibt oben. Dreh den kleinen Zeiger auf die ${String(time.hour)}.`
              : 'Stell zuerst den großen Zeiger, dann den kleinen.',
            minuteHint(cfg),
          ],
          explanation: `${cap(spoken(cfg, time))}: ${hands(time)}`,
        },
      ],
      3,
    );
  },
};

// ---------- U4: Wie lange? Wann ist es zu Ende? ----------

const ACTIVITIES = [
  'Kiko spielt am Strand',
  'Mia baut eine Sandburg',
  'Ben fährt mit dem Boot',
  'Die Kinder schwimmen im Meer',
  'Opa liest ein Buch',
] as const;

function duration(minutes: number): string {
  if (minutes === 15) return 'eine Viertelstunde';
  if (minutes === 30) return 'eine halbe Stunde';
  if (minutes === 60) return 'eine Stunde';
  if (minutes % 60 === 0) return `${String(minutes / 60)} Stunden`;
  if (minutes === 90) return 'anderthalb Stunden';
  return `${String(minutes)} Minuten`;
}

const U4: Generator = {
  id: 'U4',
  topic: 'uhrzeit',
  stufen: [3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    readBind(opts, []);
    if (!cfg.clock.spans) return 'unsupported';
    const start = randomTime(cfg, rng);
    const lengths = cfg.clock.step <= 5 ? [15, 30, 45, 60, 90, 120] : [30, 60, 120, 180];
    const minutes = pick(rng, lengths);
    const end = addMinutes(start, minutes);
    const who = pick(rng, ACTIVITIES);
    const answer = choice(
      { label: label(cfg, end) },
      [
        { time: addMinutes(start, -minutes), feedback: 'Die Zeit läuft weiter, nicht zurück.' },
        { time: addMinutes(end, 60), feedback: `Es dauert nur ${duration(minutes)}.` },
        { time: addMinutes(end, -30), feedback: `Rechne genau ${duration(minutes)} weiter.` },
        {
          time: start,
          feedback: `Das ist die Zeit am Anfang. Rechne ${duration(minutes)} weiter.`,
        },
      ]
        .filter((c) => !sameTime(c.time, end))
        .map((c) => ({ label: label(cfg, c.time), feedback: c.feedback })),
      cfg.choiceCount,
    );
    return makeTask(
      cfg,
      'Wann ist es zu Ende?',
      { kind: 'clock', time: start },
      `${who} ab ${label(cfg, start)}. Das dauert ${duration(minutes)}.`,
      [
        {
          question: 'Wann ist es zu Ende?',
          answer,
          hints: [
            'Fang bei der Uhrzeit auf der Uhr an und drehe in Gedanken weiter.',
            minutes >= 60
              ? 'Eine Stunde: Der große Zeiger dreht sich einmal ganz herum.'
              : 'Eine halbe Stunde: Der große Zeiger dreht sich halb herum.',
          ],
          explanation: `${spoken(cfg, start)} und ${duration(minutes)} dazu: Dann ist es ${spoken(cfg, end)}.`,
        },
      ],
      4,
    );
  },
};

export const UHRZEIT_GENERATORS: readonly Generator[] = [U1, U2, U3, U4];
