import type { AppStateV2, AvatarId, Profile, Stufe, WorldId } from '@/domain/types';
import { MAX_PROFILES } from './storage';

// Reiner Reducer für den App-Zustand. IDs und Zeiten kommen von außen, damit alles testbar bleibt.

export type AppAction =
  | {
      type: 'add-profile';
      id: string;
      createdAt: string;
      avatar: AvatarId;
      stufe: Stufe;
      name?: string;
    }
  | { type: 'update-profile'; id: string; name?: string; avatar?: AvatarId; stufe?: Stufe }
  | { type: 'delete-profile'; id: string }
  | { type: 'set-active'; id: string | undefined }
  | { type: 'finish-setup' }
  | { type: 'set-unlock-all'; id: string; world: WorldId; value: boolean }
  | { type: 'reset-progress'; id: string }
  | { type: 'mark-celebrated'; id: string; key: string }
  | { type: 'save-resume'; id: string; resume: NonNullable<Profile['resume']> }
  | { type: 'record-part'; id: string; partId: string; wrong: number; hints: number }
  | { type: 'complete-station'; id: string; world: WorldId; stationId: string; at: string }
  | { type: 'set-practice-last'; id: string; last: NonNullable<Profile['practice']['last']> }
  | { type: 'add-pearl'; id: string }
  | { type: 'solve-bonus'; id: string; world: WorldId; stationId: string }
  | { type: 'replace'; state: AppStateV2 };

function cleanName(name: string | undefined): string | undefined {
  const trimmed = name?.trim();
  return trimmed === '' ? undefined : trimmed;
}

function newProfile(action: Extract<AppAction, { type: 'add-profile' }>): Profile {
  const name = cleanName(action.name);
  return {
    id: action.id,
    ...(name === undefined ? {} : { name }),
    avatar: action.avatar,
    stufe: action.stufe,
    createdAt: action.createdAt,
    worlds: {},
    practice: { pearls: 0 },
    celebrated: [],
    stats: {},
  };
}

function updateProfile(
  state: AppStateV2,
  id: string,
  change: (profile: Profile) => Profile,
): AppStateV2 {
  return { ...state, profiles: state.profiles.map((p) => (p.id === id ? change(p) : p)) };
}

export function appReducer(state: AppStateV2, action: AppAction): AppStateV2 {
  switch (action.type) {
    case 'add-profile':
      if (state.profiles.length >= MAX_PROFILES) return state;
      return { ...state, profiles: [...state.profiles, newProfile(action)] };
    case 'update-profile':
      return updateProfile(state, action.id, (profile) => {
        const { name: _oldName, ...rest } = profile;
        const name = action.name === undefined ? profile.name : cleanName(action.name);
        return {
          ...rest,
          ...(name === undefined ? {} : { name }),
          avatar: action.avatar ?? profile.avatar,
          stufe: action.stufe ?? profile.stufe,
        };
      });
    case 'delete-profile': {
      const profiles = state.profiles.filter((p) => p.id !== action.id);
      const { activeProfileId, ...rest } = state;
      return activeProfileId === action.id || activeProfileId === undefined
        ? { ...rest, profiles }
        : { ...rest, profiles, activeProfileId };
    }
    case 'set-active': {
      const { activeProfileId: _old, ...rest } = state;
      const exists = state.profiles.some((p) => p.id === action.id);
      return action.id !== undefined && exists ? { ...rest, activeProfileId: action.id } : rest;
    }
    case 'finish-setup':
      return { ...state, setupDone: true };
    case 'set-unlock-all':
      return updateProfile(state, action.id, (profile) => {
        const world = profile.worlds[action.world] ?? { stations: {}, bonusSolved: [] };
        return {
          ...profile,
          worlds: { ...profile.worlds, [action.world]: { ...world, unlockAll: action.value } },
        };
      });
    case 'reset-progress':
      return updateProfile(state, action.id, (profile) => {
        const { resume: _resume, ...rest } = profile;
        return { ...rest, worlds: {}, practice: { pearls: 0 }, celebrated: [], stats: {} };
      });
    case 'mark-celebrated':
      return updateProfile(state, action.id, (profile) =>
        profile.celebrated.includes(action.key)
          ? profile
          : { ...profile, celebrated: [...profile.celebrated, action.key] },
      );
    case 'solve-bonus':
      return updateProfile(state, action.id, (profile) => {
        const world = profile.worlds[action.world] ?? {
          stations: {},
          unlockAll: false,
          bonusSolved: [],
        };
        if (world.bonusSolved.includes(action.stationId)) return profile;
        return {
          ...profile,
          worlds: {
            ...profile.worlds,
            [action.world]: { ...world, bonusSolved: [...world.bonusSolved, action.stationId] },
          },
        };
      });
    case 'save-resume':
      return updateProfile(state, action.id, (profile) => ({ ...profile, resume: action.resume }));
    case 'record-part':
      return updateProfile(state, action.id, (profile) => ({
        ...profile,
        stats: {
          ...profile.stats,
          [action.partId]: { wrong: action.wrong, hints: action.hints, stufe: profile.stufe },
        },
      }));
    case 'complete-station':
      return updateProfile(state, action.id, (profile) => {
        const { resume: _resume, ...rest } = profile;
        const world = profile.worlds[action.world] ?? {
          stations: {},
          unlockAll: false,
          bonusSolved: [],
        };
        const before = world.stations[action.stationId];
        return {
          ...rest,
          worlds: {
            ...profile.worlds,
            [action.world]: {
              ...world,
              stations: {
                ...world.stations,
                [action.stationId]: {
                  completed: true,
                  completedAt: action.at,
                  plays: (before?.plays ?? 0) + 1,
                  stufe: profile.stufe,
                },
              },
            },
          },
        };
      });
    case 'set-practice-last':
      return updateProfile(state, action.id, (profile) => ({
        ...profile,
        practice: { ...profile.practice, last: action.last },
      }));
    case 'add-pearl':
      return updateProfile(state, action.id, (profile) => ({
        ...profile,
        practice: { ...profile.practice, pearls: profile.practice.pearls + 1 },
      }));
    case 'replace':
      return action.state;
  }
}
