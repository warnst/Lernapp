import { STUFEN } from '@/config/levels';
import { WORLDS } from '@/content/worlds';
import { hashSeed } from '@/domain/random';
import type { Profile, RiddleType, Station, Task } from '@/domain/types';
import { generatorById } from './generators';
import { generateValid, withId } from './round';

/**
 * Rätselart des Bonus-Rätsels (docs/10 6): reihum je Station aus den Rätseln der Stufe;
 * nach der letzten Station der Schatzinsel immer das Zahlenschloss für das Geheimfach der Truhe.
 */
export function bonusType(station: Station, profile: Profile): RiddleType {
  const stations = WORLDS[station.world].stations;
  if (station.world === 'schatzinsel' && station.id === stations.at(-1)?.id) return 'code';
  const types = STUFEN[profile.stufe].riddles.types;
  return types[(station.number - 1) % types.length] ?? 'code';
}

const KOSMOS_BONUS_TEMPLATES = ['PM4', 'PM5', 'PM6', 'PM7'] as const;

/** Das Bonus-Rätsel einer Station; der Seed kommt aus Profil und Station. */
export function bonusTask(station: Station, profile: Profile): Task | null {
  const templateId =
    station.world === 'kosmos'
      ? (KOSMOS_BONUS_TEMPLATES[(station.number - 1) % KOSMOS_BONUS_TEMPLATES.length] ?? 'PM4')
      : bonusType(station, profile);
  const generator = generatorById(templateId);
  if (!generator) return null;
  const task = generateValid(generator, profile.stufe, hashSeed(profile.id, station.id, 'bonus'));
  return task && withId(task, `bonus-${station.id}`);
}
