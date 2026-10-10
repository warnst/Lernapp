import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import type { PracticeTopicId, Stufe } from '@/domain/types';
import { buildRound, hasTopic, shiftStufe } from './round';
import { TOPIC_ORDER } from './topics';
import { validateTask } from './validate';

const combos = TOPIC_ORDER.flatMap((topic) =>
  Object.values(STUFEN)
    .filter((cfg) => hasTopic(topic, cfg.id))
    .map((cfg) => [topic, cfg.id] as [PracticeTopicId, Stufe]),
);

describe('buildRound (docs/05 6)', () => {
  it.each(combos)('%s auf Stufe %i: 5 und 10 gültige Aufgaben mit IDs', (topic, stufe) => {
    for (const count of [5, 10] as const) {
      const tasks = buildRound(topic, stufe, count, 1234);
      expect(tasks).toHaveLength(count);
      tasks.forEach((task, i) => {
        expect(task.id).toBe(`p-${topic}-s${String(stufe)}-1234-${String(i)}`);
        expect(task.parts[0]?.id).toBe(`${task.id}-a`);
        expect(validateTask(task, STUFEN[stufe])).toEqual([]);
      });
    }
    expect(buildRound(topic, stufe, 5, 99)).toEqual(buildRound(topic, stufe, 5, 99));
  });

  it('jedes Thema jeder Stufe hat Vorlagen (außer Rätsel bis Phase 7)', () => {
    for (const cfg of Object.values(STUFEN)) {
      for (const topic of cfg.practiceTopics) {
        if (topic === 'raetsel') continue;
        expect(hasTopic(topic, cfg.id), `${topic} auf Stufe ${String(cfg.id)}`).toBe(true);
      }
    }
  });

  it('ohne Vorlagen gibt es keine Runde', () => {
    expect(buildRound('raetsel', 3, 5, 1)).toEqual([]);
  });

  it('„Wie schwer?“ verschiebt die Stufe und bleibt in 1–4', () => {
    expect(shiftStufe(1, -1)).toBe(1);
    expect(shiftStufe(2, -1)).toBe(1);
    expect(shiftStufe(3, 1)).toBe(4);
    expect(shiftStufe(4, 1)).toBe(4);
    expect(shiftStufe(3, 0)).toBe(3);
  });
});
