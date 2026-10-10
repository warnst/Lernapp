import { JOKES, type Joke } from '@/content/jokes';
import { hashSeed, mulberry32, shuffle } from '@/domain/random';
import type { Profile } from '@/domain/types';
import { towerOf } from './reducer';

/** Witze der Stufe in fester, je Profil gemischter Reihenfolge. */
function jokesFor(profile: Profile): Joke[] {
  const own = JOKES.filter((joke) => joke.from <= profile.stufe);
  return shuffle(mulberry32(hashSeed(profile.id, 'witze')), own);
}

/**
 * Der nächste Witz für die Witzekiste (docs/12 4.2): erst alle ungehörten der Stufe,
 * danach wieder von vorn in derselben Reihenfolge.
 */
export function nextJoke(profile: Profile): Joke {
  const order = jokesFor(profile);
  const heard = towerOf(profile).jokes;
  const fresh = order.find((joke) => !heard.includes(joke.id));
  if (fresh) return fresh;
  const fallback = order[heard.length % order.length] ?? JOKES[0];
  if (!fallback) throw new Error('Keine Witze vorhanden');
  return fallback;
}

/** Gehörte Witze in der Reihenfolge des Hörens. */
export function heardJokes(profile: Profile): Joke[] {
  return towerOf(profile).jokes.flatMap((id) => JOKES.filter((joke) => joke.id === id));
}
