import { STUFEN } from '@/config/levels';
import { hashSeed, mulberry32, pick } from '@/domain/random';
import type { Profile, TowerType } from '@/domain/types';

// Rätsel des Tages (docs/12 4): je Kind und Kalendertag eine Rätselart. Kein Zähler, kein Verlust.

export function dailyType(profile: Profile, now: Date): TowerType {
  const day = `${String(now.getFullYear())}-${String(now.getMonth() + 1)}-${String(now.getDate())}`;
  return pick(mulberry32(hashSeed(profile.id, 'tag', day)), STUFEN[profile.stufe].tower.types);
}
