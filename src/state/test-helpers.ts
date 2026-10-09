import type { AppStateV2, Profile } from '@/domain/types';
import { STORAGE_KEY } from './storage';

/** Ein gültiges Profil für Tests. */
export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'p1',
    avatar: 'delfin',
    stufe: 3,
    createdAt: '2026-10-09T10:00:00.000Z',
    worlds: {},
    practice: { pearls: 0 },
    celebrated: [],
    stats: {},
    ...overrides,
  };
}

export function makeState(overrides: Partial<AppStateV2> = {}): AppStateV2 {
  return { version: 2, profiles: [], setupDone: true, ...overrides };
}

/** localStorage-Ersatz im Speicher. */
export function memoryStorage(initial?: AppStateV2 | string): Storage {
  const data = new Map<string, string>();
  if (initial !== undefined) {
    data.set(STORAGE_KEY, typeof initial === 'string' ? initial : JSON.stringify(initial));
  }
  return {
    get length() {
      return data.size;
    },
    clear: () => {
      data.clear();
    },
    getItem: (key) => data.get(key) ?? null,
    key: () => null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}
