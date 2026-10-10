import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { type AnswerInput, checkAnswer } from '@/domain/check';
import { solveGrid } from '@/domain/grid';
import { minPieces, payCombinations, sumPieces } from '@/domain/money';
import { renderText } from '@/domain/text';
import type { Answer, Scene, SelectAnswer, Station, Stufe, Task, TaskPart } from '@/domain/types';
import { CHECK_TEXTS } from './check-texts';
import { DIRECTION_TEXTS, FEEDBACK_POOLS, PAUSE_TEXT } from './feedback';
import { WORLDS } from './worlds';

// Inhaltstests: Invarianten aus docs/03 (Abschnitt 4 und 10), docs/09 (5.1) und die Prüfprotokolle aus docs/04 und docs/11.

const MONEY_PIECES = new Set<number>([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]);
/** Nur hier fehlt ein Preis, weil er gesucht ist (docs/04, Hinweis zu 8.5 und 9.2). */
const TASKS_WITH_HIDDEN_PRICE = new Set(['s8-t5', 's9-t2']);

const worlds = Object.values(WORLDS);
const stations = worlds.flatMap((world) => world.stations);
const tasks = stations.flatMap((station) => station.tasks.map((task) => ({ station, task })));
const parts = tasks.flatMap(({ station, task }) =>
  task.parts.map((part) => ({ station, task, part })),
);

function findTask(id: string): Task {
  const found = tasks.find(({ task }) => task.id === id);
  if (!found) throw new Error(`Aufgabe ${id} fehlt`);
  return found.task;
}

function onlyPart(id: string): TaskPart {
  const part = findTask(id).parts[0];
  if (!part) throw new Error(`Aufgabe ${id} hat keinen Teil`);
  return part;
}

function sceneTexts(scene: Scene): string[] {
  switch (scene.kind) {
    case 'coins':
      return scene.label === undefined ? [] : [scene.label];
    case 'items':
      return scene.items.map((item) => item.label);
    case 'people':
      return scene.people.map((person) => person.name);
    case 'note':
      return scene.lines;
    case 'objects':
      return scene.groups.flatMap((group) => (group.label === undefined ? [] : [group.label]));
    case 'clues':
      return scene.clues.map((clue) => clue.text);
    default:
      return [];
  }
}

function answerTexts(answer: Answer): string[] {
  switch (answer.type) {
    case 'choice':
      return answer.options.flatMap((o) => [
        o.label,
        ...(o.feedback === undefined ? [] : [o.feedback]),
      ]);
    case 'order':
      return answer.entries.map((entry) => entry.label);
    case 'select':
      return answer.items.map((item) => item.label);
    default:
      return [];
  }
}

function stationTexts(station: Station): string[] {
  return [
    station.title,
    station.skillLabel,
    ...station.intro,
    station.findling.name,
    station.findling.text,
    station.recap,
    ...station.tasks.flatMap((task) => [
      task.title,
      task.story,
      ...sceneTexts(task.scene),
      ...task.parts.flatMap((part) => [
        ...(part.lead === undefined ? [] : [part.lead]),
        part.question,
        ...part.hints,
        part.explanation,
        ...(part.praise === undefined ? [] : [part.praise]),
        ...(part.mistakes ?? []).map((m) => m.feedback),
        ...answerTexts(part.answer),
      ]),
    ]),
  ];
}

function sceneCents(scene: Scene): number[] {
  switch (scene.kind) {
    case 'coins':
      return [...scene.pieces, ...(scene.groups ?? []).flat()];
    case 'items':
      return [
        ...scene.items.flatMap((item) => (item.price === undefined ? [] : [item.price])),
        ...(scene.paidWith ?? []),
        ...(scene.hand ?? []),
      ];
    case 'people':
      return scene.people.flatMap((p) => (p.amount === undefined ? [] : [p.amount]));
    default:
      return [];
  }
}

function selectSolutions(answer: SelectAnswer): string[][] {
  const { items, rule } = answer;
  if (rule.kind === 'affordable') {
    return [items.filter((item) => (item.price ?? Infinity) <= rule.budget).map((i) => i.itemId)];
  }
  const solutions: string[][] = [];
  const walk = (from: number, chosen: typeof items) => {
    if (chosen.length === rule.count) {
      if (chosen.reduce((sum, item) => sum + (item.price ?? 0), 0) === rule.target) {
        solutions.push(chosen.map((item) => item.itemId));
      }
      return;
    }
    items.slice(from).forEach((item, offset) => {
      walk(from + offset + 1, [...chosen, item]);
    });
  };
  walk(0, []);
  return solutions;
}

/** Eine richtige Eingabe pro Teil – damit wird jede Lösung einmal durch checkAnswer geschickt. */
function correctInputs(task: Task, part: TaskPart): AnswerInput[] {
  const answer = part.answer;
  switch (answer.type) {
    case 'choice':
      return answer.options
        .filter((o) => o.correct)
        .map((o) => ({ type: 'choice', optionId: o.id }));
    case 'money':
      return [
        {
          type: 'money',
          euro: String(Math.floor(answer.correct / 100)),
          cent: String(answer.correct % 100),
        },
      ];
    case 'number':
      return [{ type: 'number', value: answer.correct }];
    case 'pay': {
      const combos = payCombinations(answer.target, answer.palette).filter(
        (combo) =>
          (answer.exactCount === undefined || combo.length === answer.exactCount) &&
          (!answer.minimal || combo.length === minPieces(answer.target, answer.palette)),
      );
      return combos.slice(0, 1).map((pieces) => ({ type: 'pay', pieces }));
    }
    case 'pay-variants': {
      const combos = payCombinations(answer.target, answer.palette).slice(0, answer.required);
      const last = combos.at(-1);
      return last ? [{ type: 'pay-variants', pieces: last, found: combos.slice(0, -1) }] : [];
    }
    case 'order':
      return [
        {
          type: 'order',
          ids: [...answer.entries].sort((a, b) => a.value - b.value).map((e) => e.id),
        },
      ];
    case 'select':
      return selectSolutions(answer)
        .slice(0, 1)
        .map((itemIds) => ({ type: 'select', itemIds }));
    case 'grid':
      return [
        {
          type: 'grid',
          values: Object.fromEntries(
            answer.cells.filter((c) => !c.given).map((c) => [c.id, c.value]),
          ),
        },
      ];
    case 'code': {
      const symbols = task.scene.kind === 'clues' ? task.scene.clues.map((c) => c.symbol) : [];
      return [{ type: 'code', digits: answer.digits, symbols }];
    }
    case 'clock':
      return [{ type: 'clock', time: answer.correct }];
  }
}

function describeAnswer(answer: Answer): string {
  switch (answer.type) {
    case 'choice': {
      const correct = answer.options.find((o) => o.correct);
      return renderText(correct?.label ?? '?');
    }
    case 'money':
      return renderText(`{{${String(answer.correct)}}}`);
    case 'number':
      return String(answer.correct);
    case 'pay':
    case 'pay-variants':
      return `${renderText(`{{${String(answer.target)}}}`)} legen`;
    case 'order':
      return [...answer.entries]
        .sort((a, b) => a.value - b.value)
        .map((e) => e.label)
        .join(' < ');
    case 'select':
      return selectSolutions(answer)
        .map((s) => s.join(' + '))
        .join(' | ');
    case 'grid':
      return answer.cells
        .filter((c) => !c.given)
        .map((c) => `${c.id}=${String(c.value)}`)
        .join(', ');
    case 'code':
      return answer.digits.join(' ');
    case 'clock':
      return `${String(answer.correct.hour)}:${String(answer.correct.minute)}`;
  }
}

describe('Welten und Stationen', () => {
  it('die Insel hat 9 Stationen mit 45 Aufgaben, die Bucht 5 mit 25', () => {
    expect(WORLDS.schatzinsel.stations).toHaveLength(9);
    expect(WORLDS['kleine-bucht'].stations).toHaveLength(5);
    expect(WORLDS.schatzinsel.stations.flatMap((s) => s.tasks)).toHaveLength(45);
    expect(WORLDS['kleine-bucht'].stations.flatMap((s) => s.tasks)).toHaveLength(25);
  });

  it.each(worlds)('$id: Stationen sind fortlaufend nummeriert und gehören zur Welt', (world) => {
    world.stations.forEach((station, i) => {
      expect(station.world).toBe(world.id);
      expect(station.number).toBe(i + 1);
      expect(station.tasks).toHaveLength(5);
    });
  });

  it('IDs von Stationen, Aufgaben, Teilen und Fundstücken sind eindeutig', () => {
    const ids = [
      ...stations.map((s) => s.id),
      ...tasks.map(({ task }) => task.id),
      ...parts.map(({ part }) => part.id),
      ...stations.map((s) => s.findling.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(stations)('$id: ID-Schema, Stufe und Teile', (station) => {
    for (const task of station.tasks) {
      const prefix = station.world === 'schatzinsel' ? 's' : 'b';
      expect(task.id).toBe(
        `${prefix}${String(station.number)}-t${String(station.tasks.indexOf(task) + 1)}`,
      );
      expect(task.authoredFor).toBe(station.world === 'schatzinsel' ? 3 : 1);
      expect(task.parts.length).toBeGreaterThanOrEqual(1);
      expect(task.parts.length).toBeLessThanOrEqual(STUFEN[task.authoredFor].maxSteps);
      task.parts.forEach((part, i) => {
        expect(part.id).toBe(`${task.id}-${'abc'.charAt(i)}`);
        if (i === 0) expect(part.lead).toBeUndefined();
      });
    }
  });
});

describe('Texte', () => {
  it.each(stations)('$id: alle Kindertexte sind sauber', (station) => {
    for (const text of stationTexts(station)) {
      const shown = renderText(text);
      expect(text.trim(), text).not.toBe('');
      expect(shown, text).not.toMatch(/\{\{|\}\}|undefined|NaN/);
      expect(shown.toLowerCase(), text).not.toContain('falsch');
    }
  });

  it('Rückmeldungs-Pools enthalten nie „falsch“', () => {
    const all = [
      ...Object.values(FEEDBACK_POOLS).flat(),
      PAUSE_TEXT,
      ...Object.values(DIRECTION_TEXTS),
    ];
    for (const text of all) expect(text.toLowerCase()).not.toContain('falsch');
    for (const pool of Object.values(FEEDBACK_POOLS)) expect(pool.length).toBeGreaterThan(0);
  });
});

describe('Aufgaben-Invarianten', () => {
  it.each(stations)('$id: Szenen', (station) => {
    for (const task of station.tasks) {
      for (const cents of sceneCents(task.scene)) {
        expect(Number.isInteger(cents) && cents >= 0).toBe(true);
      }
      if (task.scene.kind === 'coins') {
        for (const piece of [...task.scene.pieces, ...(task.scene.groups ?? []).flat()]) {
          expect(MONEY_PIECES.has(piece)).toBe(true);
        }
        if (task.scene.groups) expect(task.scene.pieces).toEqual([]);
      }
      if (task.scene.kind === 'items') {
        const missing = task.scene.items.filter((item) => item.price === undefined);
        expect(missing.length > 0, task.id).toBe(TASKS_WITH_HIDDEN_PRICE.has(task.id));
      }
    }
  });

  it.each(stations)('$id: Antworten sind gültig und werden als richtig erkannt', (station) => {
    for (const task of station.tasks) {
      for (const part of task.parts) {
        const answer = part.answer;
        const max = STUFEN[task.authoredFor].numbers.max;
        expect(part.hints).toHaveLength(2);
        if (part.mistakes) {
          expect(['money', 'number']).toContain(answer.type);
          const values = part.mistakes.map((m) => m.value);
          expect(new Set(values).size).toBe(values.length);
          if (answer.type === 'money' || answer.type === 'number') {
            expect(values).not.toContain(answer.correct);
          }
        }

        switch (answer.type) {
          case 'choice': {
            expect(answer.options.length).toBeGreaterThanOrEqual(2);
            expect(answer.options.length).toBeLessThanOrEqual(4);
            expect(answer.options.filter((o) => o.correct)).toHaveLength(1);
            expect(new Set(answer.options.map((o) => o.label)).size).toBe(answer.options.length);
            expect(new Set(answer.options.map((o) => o.id)).size).toBe(answer.options.length);
            for (const piece of answer.options.flatMap((o) => o.pieces ?? [])) {
              expect(MONEY_PIECES.has(piece)).toBe(true);
            }
            if (answer.layout === 'coins') {
              for (const o of answer.options) expect(o.pieces?.length).toBeGreaterThan(0);
            }
            break;
          }
          case 'money':
            expect(Number.isInteger(answer.correct) && answer.correct >= 0).toBe(true);
            break;
          case 'number':
            expect(Number.isInteger(answer.correct)).toBe(true);
            expect(answer.correct).toBeGreaterThanOrEqual(0);
            expect(answer.correct).toBeLessThanOrEqual(max);
            break;
          case 'pay':
            expect(minPieces(answer.target, answer.palette)).not.toBeNull();
            if (answer.exactCount !== undefined) {
              const count = answer.exactCount;
              expect(
                payCombinations(answer.target, answer.palette).some((c) => c.length === count),
              ).toBe(true);
            }
            break;
          case 'pay-variants':
            expect(payCombinations(answer.target, answer.palette).length).toBeGreaterThanOrEqual(
              answer.required,
            );
            break;
          case 'order': {
            const values = answer.entries.map((e) => e.value);
            expect(new Set(values).size).toBe(values.length);
            break;
          }
          case 'select':
            for (const item of answer.items) expect(item.price).toBeDefined();
            expect(selectSolutions(answer).length).toBeGreaterThan(0);
            expect(selectSolutions(answer)[0]?.length).toBeGreaterThan(0);
            break;
          case 'grid': {
            const solved = solveGrid(
              answer.shape,
              answer.cells.map((c) => (c.given ? { id: c.id, value: c.value } : { id: c.id })),
            );
            expect(solved).toEqual(Object.fromEntries(answer.cells.map((c) => [c.id, c.value])));
            break;
          }
          case 'code':
            expect(answer.digits.length).toBeGreaterThanOrEqual(3);
            expect(answer.digits.length).toBeLessThanOrEqual(4);
            for (const d of answer.digits)
              expect(Number.isInteger(d) && d >= 0 && d <= 9).toBe(true);
            expect(answer.digits[0]).not.toBe(0);
            expect(task.scene.kind === 'clues' && task.scene.clues.length).toBe(
              answer.digits.length,
            );
            break;
        }

        const inputs = correctInputs(task, part);
        expect(inputs.length, part.id).toBeGreaterThan(0);
        for (const input of inputs) {
          expect(checkAnswer(answer, input, CHECK_TEXTS, part.mistakes).status, part.id).toBe(
            'correct',
          );
        }
      }
    }
  });
});

describe('Varianten (docs/09, 5.1)', () => {
  it.each(worlds)(
    '$id: jede Station hat für jede Stufe der Welt mindestens 3 spielbare Aufgaben',
    (world) => {
      const worldStufen = Object.values(STUFEN)
        .filter((config) => config.world === world.id)
        .map((config) => config.id);
      const playable = (task: Task, stufe: Stufe) =>
        stufe === task.authoredFor ||
        (task.variant !== undefined && (task.variant.stufen ?? worldStufen).includes(stufe));
      for (const station of world.stations) {
        for (const stufe of worldStufen) {
          const count = station.tasks.filter((task) => playable(task, stufe)).length;
          expect(count, `${station.id} auf Stufe ${String(stufe)}`).toBeGreaterThanOrEqual(3);
        }
      }
    },
  );

  it('nur 8.5 hat keine Variante', () => {
    const without = tasks
      .filter(({ task }) => task.variant === undefined)
      .map(({ task }) => task.id);
    expect(without).toEqual(['s8-t5']);
  });
});

describe('Prüfprotokoll docs/04', () => {
  const answerOf = (id: string, index = 0) => findTask(id).parts[index]?.answer;

  it('2.3: genau zwei Paare mit 3 €', () => {
    const answer = answerOf('s2-t3');
    expect(answer?.type === 'select' && selectSolutions(answer)).toEqual([
      ['kokosnuss', 'mango'],
      ['saft', 'muffin'],
    ]);
  });

  it('4.2: 10 verschiedene Möglichkeiten für 1 € mit 50, 20, 10 Cent', () => {
    expect(payCombinations(100, [50, 20, 10])).toHaveLength(10);
    expect(onlyPart('s4-t2').answer).toMatchObject({ target: 100, palette: [50, 20, 10] });
  });

  it('4.3: Minimum für 75 Cent sind 3 Münzen', () => {
    const answer = answerOf('s4-t3');
    expect(answer?.type === 'pay' && minPieces(answer.target, answer.palette)).toBe(3);
  });

  it('5.3: genau 3 leistbare Sachen', () => {
    const answer = answerOf('s5-t3');
    expect(answer?.type === 'select' && selectSolutions(answer)).toEqual([
      ['federstift', 'postkarte', 'stickerheft'],
    ]);
  });

  it('7.2: genau zwei Dreiergruppen mit 5 €', () => {
    const answer = answerOf('s7-t2');
    expect(answer?.type === 'select' && selectSolutions(answer)).toEqual([
      ['brot', 'kaese', 'tee'],
      ['brot', 'streichhoelzer', 'honig'],
    ]);
  });

  it('7.4: Reihenfolge 1,95 € < 2,05 € < 2,15 € < 2,50 €', () => {
    const answer = answerOf('s7-t4');
    expect(
      answer?.type === 'order' &&
        [...answer.entries].sort((a, b) => a.value - b.value).map((e) => e.value),
    ).toEqual([195, 205, 215, 250]);
  });

  it('9.4: 1 € + 50 Cent ist die einzige Zwei-Münzen-Lösung für 1,50 €', () => {
    const answer = answerOf('s9-t4');
    expect(
      answer?.type === 'pay' &&
        payCombinations(answer.target, answer.palette).filter((c) => c.length === 2),
    ).toEqual([[100, 50]]);
  });

  it('9.5: 20 Cent ist die einzige Münze zwischen 10 und 50 Cent', () => {
    const between = [...MONEY_PIECES].filter((p) => p > 10 && p < 50);
    expect(between).toEqual([20]);
    const answer = answerOf('s9-t5');
    expect(answer?.type === 'choice' && answer.options.find((o) => o.correct)?.pieces).toEqual([
      20,
    ]);
  });

  it('4.5: 85 + 55 = 140; 300 − 140 = 160', () => {
    const task = findTask('s4-t5');
    expect(task.scene.kind === 'items' && sumPieces(task.scene.hand ?? [])).toBe(300);
    expect(answerOf('s4-t5', 0)).toEqual({ type: 'money', correct: 140 });
    expect(answerOf('s4-t5', 1)).toEqual({ type: 'money', correct: 160 });
  });
});

describe('Prüfprotokoll docs/11', () => {
  const correct = (id: string, index = 0) => {
    const answer = findTask(id).parts[index]?.answer;
    if (answer?.type === 'number') return answer.correct;
    if (answer?.type === 'choice') return answer.options.find((o) => o.correct)?.label;
    if (answer?.type === 'code') return answer.digits;
    return undefined;
  };

  it('Ergebnisse der Bucht', () => {
    expect(correct('b1-t4')).toBe(3 + 2);
    expect(correct('b2-t4')).toBe(1 + 1 + 1);
    expect(correct('b2-t5')).toBe('{{3}}');
    expect(correct('b3-t3')).toBe('{{5}}');
    expect(correct('b3-t4')).toBe('Ja');
    expect(correct('b3-t5', 1)).toBe(6 - 5);
    expect(correct('b4-t2')).toBe(6 - 4);
    expect(correct('b4-t4')).toBe(5 - 2);
    expect(correct('b4-t5')).toBe(6 - 2);
    expect(correct('b5-t5')).toEqual([2, 4, 3]);
  });

  it('B4.5: Krümel hat 5 + 1 = 6 Cent', () => {
    const scene = findTask('b4-t5').scene;
    expect(scene.kind === 'items' && sumPieces(scene.hand ?? [])).toBe(6);
  });

  it('B5.4: 2 + 2 + 1 = 5; mit 2: 6; mit 5: 9', () => {
    const scene = findTask('b5-t4').scene;
    if (scene.kind !== 'balance') throw new Error('B5.4 braucht eine Waage');
    const left = sumPieces(scene.left.pieces ?? []);
    const right = sumPieces(scene.right.pieces ?? []);
    const answer = onlyPart('b5-t4').answer;
    if (answer.type !== 'choice') throw new Error('B5.4 ist eine Auswahl');
    const totals = answer.options.map((o) => right + sumPieces(o.pieces ?? []));
    expect(left).toBe(5);
    expect(totals).toEqual([5, 6, 9]);
  });
});

describe('Übersicht', () => {
  it('gibt die Tabelle Station · Aufgabe · Typ · richtige Antwort aus', () => {
    const rows = parts.map(({ station, part }) => ({
      Station: station.id,
      Aufgabe: part.id,
      Typ: part.answer.type,
      Antwort: describeAnswer(part.answer),
    }));
    console.table(rows);
    expect(rows.length).toBeGreaterThanOrEqual(70);
  });
});
