import type {
  AppStateV2,
  AvatarId,
  CaseSave,
  Profile,
  Stufe,
  KikoSlot,
  SudokuSave,
  NestSlot,
  TowerProgress,
  TowerType,
  Wardrobe,
  WorldId,
} from '@/domain/types';
import { KIKO_ITEMS, NEST_ITEMS } from '@/content/outfits';
import { BEACON_FLOOR, floorInfo } from '@/domain/tower';
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
  | {
      type: 'update-profile';
      id: string;
      name?: string;
      avatar?: AvatarId;
      stufe?: Stufe;
      readAloud?: boolean;
    }
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
  | { type: 'tower-solved'; id: string; kind: TowerType }
  /** angefangenen Detektivfall merken bzw. verwerfen (null) */
  | { type: 'case-save'; id: string; save: CaseSave | null }
  /** Fall gelöst: Eintrag im Detektivbuch, angefangener Fall entfällt */
  | { type: 'case-solved'; id: string; caseId: string }
  /** Wissenskarte ins Wissensbuch */
  | { type: 'fact-learned'; id: string; factId: string }
  /** angefangenes Sudoku merken bzw. verwerfen (null) */
  | { type: 'sudoku-save'; id: string; save: SudokuSave | null }
  | { type: 'joke-heard'; id: string; jokeId: string }
  | { type: 'joke-favorite'; id: string; jokeId: string }
  /** Teil aus einer Truhe wählen (zählt die Truhe als geöffnet) und gleich anziehen */
  | { type: 'wardrobe-pick'; id: string; itemId: string }
  /** besonderes Teil ohne Truhe (Detektivhut, Krone …) */
  | { type: 'wardrobe-grant'; id: string; itemId: string }
  /** Teil an- oder ausziehen bzw. ins Nest stellen oder wegnehmen */
  | { type: 'wardrobe-toggle'; id: string; itemId: string }
  /** neue besondere Teile wurden im Schrank angesehen */
  | { type: 'wardrobe-seen'; id: string }
  /** ganzes Outfit auf einmal (Überrasch mich!) */
  | { type: 'wardrobe-outfit'; id: string; kiko: Partial<Record<KikoSlot, string>> }
  | { type: 'replace'; state: AppStateV2 };

export function wardrobeOf(tower: TowerProgress): Wardrobe {
  return tower.wardrobe ?? { owned: [], chests: 0, kiko: {}, nest: {} };
}

/** Platz eines Teils: an Kiko oder im Nest. */
function slotOf(
  itemId: string,
): { kind: 'kiko'; slot: KikoSlot } | { kind: 'nest'; slot: NestSlot } | null {
  const kiko = KIKO_ITEMS.find((item) => item.id === itemId);
  if (kiko) return { kind: 'kiko', slot: kiko.slot };
  const nest = NEST_ITEMS.find((item) => item.id === itemId);
  return nest ? { kind: 'nest', slot: nest.slot } : null;
}

function wear(wardrobe: Wardrobe, itemId: string): Wardrobe {
  const place = slotOf(itemId);
  if (!place) return wardrobe;
  return place.kind === 'kiko'
    ? { ...wardrobe, kiko: { ...wardrobe.kiko, [place.slot]: itemId } }
    : { ...wardrobe, nest: { ...wardrobe.nest, [place.slot]: itemId } };
}

function toggle(wardrobe: Wardrobe, itemId: string): Wardrobe {
  const place = slotOf(itemId);
  if (!place) return wardrobe;
  if (place.kind === 'kiko') {
    if (wardrobe.kiko[place.slot] !== itemId) return wear(wardrobe, itemId);
    const { [place.slot]: _removed, ...kiko } = wardrobe.kiko;
    return { ...wardrobe, kiko };
  }
  if (wardrobe.nest[place.slot] !== itemId) return wear(wardrobe, itemId);
  const { [place.slot]: _removed, ...nest } = wardrobe.nest;
  return { ...wardrobe, nest };
}

/** besonderes Teil schenken: anziehen und als neu merken (docs/12 4.1) */
function grant(wardrobe: Wardrobe, itemId: string): Wardrobe {
  if (wardrobe.owned.includes(itemId) || !slotOf(itemId)) return wardrobe;
  return wear(
    { ...wardrobe, owned: [...wardrobe.owned, itemId], fresh: [...(wardrobe.fresh ?? []), itemId] },
    itemId,
  );
}

/** Rätsel einer Art bis zum goldenen Stempel im Rätselpass */
export const GOLDEN_STAMP = 10;

/** Turm-Fortschritt eines Profils, leer, solange das Kind noch nicht im Turm war. */
export function towerOf(profile: Profile): TowerProgress {
  return profile.tower ?? { lamps: 0, solved: {}, jokes: [], favorites: [] };
}

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
          ...(action.readAloud === undefined ? {} : { readAloud: action.readAloud }),
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
    case 'tower-solved':
      return updateProfile(state, action.id, (profile) => {
        const { sudoku: saved, ...tower } = towerOf(profile);
        const lamps = tower.lamps + 1;
        const count = (tower.solved[action.kind] ?? 0) + 1;
        let wardrobe = wardrobeOf(tower);
        if (count === GOLDEN_STAMP) wardrobe = grant(wardrobe, 'zauberhut');
        if (floorInfo(lamps).floors >= BEACON_FLOOR) wardrobe = grant(wardrobe, 'krone');
        return {
          ...profile,
          tower: {
            ...tower,
            // ein gelöstes Sudoku ist kein angefangenes mehr
            ...(action.kind === 'sudoku' || !saved ? {} : { sudoku: saved }),
            ...(wardrobe.owned.length > 0 ? { wardrobe } : {}),
            lamps,
            solved: { ...tower.solved, [action.kind]: count },
          },
        };
      });
    case 'case-save':
      return updateProfile(state, action.id, (profile) => {
        const { caseSave: _old, ...tower } = towerOf(profile);
        return { ...profile, tower: action.save ? { ...tower, caseSave: action.save } : tower };
      });
    case 'case-solved':
      return updateProfile(state, action.id, (profile) => {
        const { caseSave: _old, ...tower } = towerOf(profile);
        const cases = tower.cases ?? [];
        return {
          ...profile,
          tower: {
            ...tower,
            cases: cases.includes(action.caseId) ? cases : [...cases, action.caseId],
          },
        };
      });
    case 'fact-learned':
      return updateProfile(state, action.id, (profile) => {
        const tower = towerOf(profile);
        const facts = tower.facts ?? [];
        if (facts.includes(action.factId)) return profile;
        return { ...profile, tower: { ...tower, facts: [...facts, action.factId] } };
      });
    case 'sudoku-save':
      return updateProfile(state, action.id, (profile) => {
        const { sudoku: _old, ...tower } = towerOf(profile);
        return {
          ...profile,
          tower: action.save ? { ...tower, sudoku: action.save } : tower,
        };
      });
    case 'joke-heard':
      return updateProfile(state, action.id, (profile) => {
        const tower = towerOf(profile);
        if (tower.jokes.includes(action.jokeId)) return profile;
        return { ...profile, tower: { ...tower, jokes: [...tower.jokes, action.jokeId] } };
      });
    case 'joke-favorite':
      return updateProfile(state, action.id, (profile) => {
        const tower = towerOf(profile);
        const favorites = tower.favorites.includes(action.jokeId)
          ? tower.favorites.filter((id) => id !== action.jokeId)
          : [...tower.favorites, action.jokeId];
        return { ...profile, tower: { ...tower, favorites } };
      });
    case 'wardrobe-grant':
      return updateProfile(state, action.id, (profile) => {
        const tower = towerOf(profile);
        const wardrobe = wardrobeOf(tower);
        const next = grant(wardrobe, action.itemId);
        return next === wardrobe ? profile : { ...profile, tower: { ...tower, wardrobe: next } };
      });
    case 'wardrobe-seen':
      return updateProfile(state, action.id, (profile) => {
        const tower = towerOf(profile);
        if (!tower.wardrobe?.fresh) return profile;
        const { fresh: _fresh, ...wardrobe } = tower.wardrobe;
        return { ...profile, tower: { ...tower, wardrobe } };
      });
    case 'wardrobe-pick':
      return updateProfile(state, action.id, (profile) => {
        const tower = towerOf(profile);
        const wardrobe = wardrobeOf(tower);
        if (wardrobe.owned.includes(action.itemId) || !slotOf(action.itemId)) return profile;
        const chests = wardrobe.chests + 1;
        const owned = [...wardrobe.owned, action.itemId];
        return {
          ...profile,
          tower: { ...tower, wardrobe: wear({ ...wardrobe, owned, chests }, action.itemId) },
        };
      });
    case 'wardrobe-toggle':
      return updateProfile(state, action.id, (profile) => {
        const tower = towerOf(profile);
        const wardrobe = wardrobeOf(tower);
        if (!wardrobe.owned.includes(action.itemId)) return profile;
        return { ...profile, tower: { ...tower, wardrobe: toggle(wardrobe, action.itemId) } };
      });
    case 'wardrobe-outfit':
      return updateProfile(state, action.id, (profile) => {
        const tower = towerOf(profile);
        const wardrobe = wardrobeOf(tower);
        const kiko = Object.fromEntries(
          Object.entries(action.kiko).filter(([, id]: [string, string]) =>
            wardrobe.owned.includes(id),
          ),
        );
        return { ...profile, tower: { ...tower, wardrobe: { ...wardrobe, kiko } } };
      });
    case 'reset-progress':
      return updateProfile(state, action.id, (profile) => {
        const { resume: _resume, tower: _tower, ...rest } = profile;
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
