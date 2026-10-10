import { KIKO_ITEMS, NEST_ITEMS } from '@/content/outfits';
import { floorInfo } from '@/domain/tower';
import { hashSeed, mulberry32, shuffle } from '@/domain/random';
import type { KikoSlot, Profile } from '@/domain/types';
import { towerOf, wardrobeOf } from './reducer';

// Truhen im Rätselturm (docs/12 4.1): die erste nach dem ersten gelösten Rätsel, dann eine je Etage.

/** Verdiente Truhen: eine für das erste Rätsel, dann eine je fertige Etage. */
export function chestsEarned(lamps: number): number {
  return lamps === 0 ? 0 : 1 + floorInfo(lamps).floors;
}

export function pendingChests(profile: Profile): number {
  const tower = towerOf(profile);
  return Math.max(0, chestsEarned(tower.lamps) - wardrobeOf(tower).chests);
}

export interface Offer {
  id: string;
  kind: 'kiko' | 'nest';
}

/**
 * Zwei Teile zur Wahl: meist eins für Kiko und eins fürs Nest, beide noch nicht im Schrank.
 * Besondere Teile kommen nie aus der Truhe. Fest gemischt aus Profil und Truhennummer.
 */
export function chestOffer(profile: Profile): Offer[] {
  const wardrobe = wardrobeOf(towerOf(profile));
  const rng = mulberry32(hashSeed(profile.id, 'truhe', wardrobe.chests));
  const kiko = shuffle(
    rng,
    KIKO_ITEMS.filter((item) => !item.special && !wardrobe.owned.includes(item.id)),
  ).map((item): Offer => ({ id: item.id, kind: 'kiko' }));
  const nest = shuffle(
    rng,
    NEST_ITEMS.filter((item) => !wardrobe.owned.includes(item.id)),
  ).map((item): Offer => ({ id: item.id, kind: 'nest' }));
  const pair = [kiko[0], nest[0]].filter((o): o is Offer => o !== undefined);
  if (pair.length === 2) return pair;
  return [...kiko, ...nest].slice(0, 2);
}

/** Überrasch mich!: je Platz zufällig ein freigeschaltetes Teil oder nichts. */
export function surpriseOutfit(
  profile: Profile,
  roll: () => number,
): Partial<Record<KikoSlot, string>> {
  const owned = wardrobeOf(towerOf(profile)).owned;
  const outfit: Partial<Record<KikoSlot, string>> = {};
  for (const item of shuffle(
    roll,
    KIKO_ITEMS.filter((i) => owned.includes(i.id)),
  )) {
    if (outfit[item.slot] === undefined && roll() < 0.7) outfit[item.slot] = item.id;
  }
  return outfit;
}
