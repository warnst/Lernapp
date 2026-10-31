import { STUFEN } from '@/config/levels';
import { hashSeed } from '@/domain/random';
import type { Station, Stufe, Task } from '@/domain/types';
import { generatorById } from './generators';
import { generateValid, withId } from './round';

// Original oder Variante für Stationsaufgaben (docs/09 Abschnitt 5.1).

function worldStufen(station: Station): Stufe[] {
  if (station.world === 'kosmos') return [1, 2, 3, 4];
  return Object.values(STUFEN)
    .filter((cfg) => cfg.world === station.world)
    .map((cfg) => cfg.id);
}

/** Variante mit neuen Zahlen oder null, wenn die Vorlage die Stufe nicht kann. */
function variantOf(task: Task, station: Station, stufe: Stufe, seed: number): Task | null {
  const variant = task.variant;
  if (!variant) return null;
  if (!(variant.stufen ?? worldStufen(station)).includes(stufe)) return null;
  const generator = generatorById(variant.template);
  if (!generator?.stufen.includes(stufe)) return null;
  const opts = {
    ...(variant.bind ? { bind: variant.bind } : {}),
    ...(variant.force ? { force: variant.force } : {}),
  };
  const generated = generateValid(generator, stufe, seed, opts);
  return generated && withId({ ...generated, variant }, task.id);
}

/**
 * Die gespielten Aufgaben einer Station:
 * Stufe = authoredFor und erster Durchgang → Original; Wiederholung → Variante, sonst Original;
 * andere Stufe → Variante, sonst übersprungen. Seed aus Profil, Station, Aufgabe und Durchgang.
 */
export function stationTasks(
  station: Station,
  stufe: Stufe,
  plays: number,
  profileId: string,
): Task[] {
  return station.tasks.flatMap((task) => {
    const original = stufe === task.authoredFor;
    if (original && plays === 0) return [task];
    const variant = variantOf(
      task,
      station,
      stufe,
      hashSeed(profileId, station.id, task.id, plays),
    );
    if (variant) return [variant];
    return original ? [task] : [];
  });
}
