import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { WORLDS } from '@/content/worlds';
import { validateTask } from './validate';
import { stationTasks } from './variants';

const worlds = Object.values(WORLDS);

describe('Stationsvarianten (docs/09 5.1)', () => {
  it.each(worlds)(
    '$id: jede Station hat auf jeder Stufe der Welt mindestens 3 Aufgaben',
    (world) => {
      const stufen = Object.values(STUFEN).filter((c) => c.world === world.id);
      for (const station of world.stations) {
        for (const cfg of stufen) {
          for (const plays of [0, 1, 2]) {
            const tasks = stationTasks(station, cfg.id, plays, 'kind');
            expect(
              tasks.length,
              `${station.id}, Stufe ${String(cfg.id)}, Durchgang ${String(plays)}`,
            ).toBeGreaterThanOrEqual(3);
            for (const task of tasks) {
              const original = station.tasks.find((t) => t.id === task.id);
              expect(original, task.id).toBeDefined();
              if (task !== original) expect(validateTask(task, cfg), task.id).toEqual([]);
            }
          }
        }
      }
    },
  );

  it('erster Durchgang auf der Original-Stufe spielt die Originale', () => {
    const station = WORLDS.schatzinsel.stations[1];
    if (!station) throw new Error('Station fehlt');
    expect(stationTasks(station, 3, 0, 'kind')).toEqual(station.tasks);
  });

  it('ist reproduzierbar und ändert sich mit dem Durchgang', () => {
    const station = WORLDS.schatzinsel.stations[1];
    if (!station) throw new Error('Station fehlt');
    const first = stationTasks(station, 3, 1, 'kind');
    expect(stationTasks(station, 3, 1, 'kind')).toEqual(first);
    expect(stationTasks(station, 3, 2, 'kind')).not.toEqual(first);
    expect(stationTasks(station, 3, 1, 'anderes-kind')).not.toEqual(first);
  });

  it('8.5 hat keine Variante: auf Stufe 2 und 4 übersprungen, auf Stufe 3 wiederholt', () => {
    const station = WORLDS.schatzinsel.stations[7];
    if (!station) throw new Error('Station fehlt');
    expect(stationTasks(station, 2, 0, 'kind').map((t) => t.id)).not.toContain('s8-t5');
    expect(stationTasks(station, 4, 0, 'kind').map((t) => t.id)).not.toContain('s8-t5');
    expect(stationTasks(station, 3, 1, 'kind').find((t) => t.id === 's8-t5')).toBe(
      station.tasks[4],
    );
  });

  it('bind setzt die Sachen der Variante (2.1: Kokosnuss und Bananenbrot)', () => {
    const station = WORLDS.schatzinsel.stations[1];
    if (!station) throw new Error('Station fehlt');
    const variant = stationTasks(station, 4, 0, 'kind').find((t) => t.id === 's2-t1');
    const scene = variant?.scene;
    const ids = scene?.kind === 'items' ? scene.items.map((i) => i.itemId) : [];
    expect(ids).toEqual(expect.arrayContaining(['kokosnuss', 'bananenbrot']));
  });
});
