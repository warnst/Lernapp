import type {
  AppStateV2,
  Profile,
  StationProgress,
  TowerProgress,
  TowerType,
  Wardrobe,
  WorldId,
  WorldProgress,
} from '@/domain/types';
import { MAX_PROFILES, parseState, repairState } from './storage';

const SYNC_PATH = '/api/state';

function unionStrings(a: readonly string[], b: readonly string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}

function mergeStation(a: StationProgress | undefined, b: StationProgress): StationProgress {
  if (!a) return b;
  const completed = a.completed || b.completed;
  const completedAt = b.completedAt ?? a.completedAt;
  return {
    completed,
    ...(completedAt === undefined ? {} : { completedAt }),
    plays: Math.max(a.plays, b.plays),
    stufe: b.stufe,
  };
}

function mergeWorld(a: WorldProgress | undefined, b: WorldProgress | undefined): WorldProgress {
  if (!a) return b ?? { stations: {}, unlockAll: false, bonusSolved: [] };
  if (!b) return a;
  const stationIds = unionStrings(Object.keys(a.stations), Object.keys(b.stations));
  const stations: Record<string, StationProgress> = {};
  for (const id of stationIds) {
    const sa = a.stations[id];
    const sb = b.stations[id];
    if (sa && sb) stations[id] = mergeStation(sa, sb);
    else if (sb) stations[id] = sb;
    else if (sa) stations[id] = sa;
  }
  return {
    stations,
    unlockAll: a.unlockAll || b.unlockAll,
    bonusSolved: unionStrings(a.bonusSolved, b.bonusSolved),
  };
}

function mergeWardrobe(a: Wardrobe | undefined, b: Wardrobe | undefined): Wardrobe | undefined {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  const fresh = b.fresh ?? a.fresh;
  return {
    owned: unionStrings(a.owned, b.owned),
    chests: Math.max(a.chests, b.chests),
    kiko: { ...a.kiko, ...b.kiko },
    nest: { ...a.nest, ...b.nest },
    ...(fresh && fresh.length > 0 ? { fresh } : {}),
  };
}

function mergeTower(
  a: TowerProgress | undefined,
  b: TowerProgress | undefined,
): TowerProgress | undefined {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  const solvedKeys = unionStrings(Object.keys(a.solved), Object.keys(b.solved)) as TowerType[];
  const solved: Partial<Record<TowerType, number>> = {};
  for (const key of solvedKeys) {
    solved[key] = Math.max(a.solved[key] ?? 0, b.solved[key] ?? 0);
  }
  const wardrobe = mergeWardrobe(a.wardrobe, b.wardrobe);
  const facts = unionStrings(a.facts ?? [], b.facts ?? []);
  const cases = unionStrings(a.cases ?? [], b.cases ?? []);
  const sudoku = b.sudoku ?? a.sudoku;
  const candidateCase = b.caseSave ?? a.caseSave;
  const caseSave =
    candidateCase && !cases.includes(candidateCase.caseId) ? candidateCase : undefined;

  return {
    lamps: Math.max(a.lamps, b.lamps),
    solved,
    jokes: unionStrings(a.jokes, b.jokes),
    favorites: unionStrings(a.favorites, b.favorites),
    ...(wardrobe ? { wardrobe } : {}),
    ...(sudoku ? { sudoku } : {}),
    ...(facts.length > 0 ? { facts } : {}),
    ...(cases.length > 0 ? { cases } : {}),
    ...(caseSave ? { caseSave } : {}),
  };
}

function pickResume(
  a: Profile['resume'],
  b: Profile['resume'],
  worlds: Partial<Record<WorldId, WorldProgress>>,
): Profile['resume'] {
  const pick = (() => {
    if (!a) return b;
    if (!b) return a;
    if (a.stationId === b.stationId && a.seed === b.seed) {
      const posA = a.taskIndex * 100 + a.partIndex;
      const posB = b.taskIndex * 100 + b.partIndex;
      return posB >= posA ? b : a;
    }
    return b;
  })();
  if (!pick) return undefined;
  const station = worlds[pick.world]?.stations[pick.stationId];
  if (station?.completed && station.plays > pick.seed) return undefined;
  return pick;
}

/**
 * Führt zwei Stände desselben Kindes zusammen. Einstellungen (Name, Tier, Stufe, Vorlesen)
 * kommen aus `incoming`, beim Fortschritt gewinnt jeweils der weitere Stand.
 */
export function mergeProfiles(base: Profile, incoming: Profile): Profile {
  const worldKeys = unionStrings(
    Object.keys(base.worlds),
    Object.keys(incoming.worlds),
  ) as WorldId[];
  const worlds: Partial<Record<WorldId, WorldProgress>> = {};
  for (const w of worldKeys) {
    worlds[w] = mergeWorld(base.worlds[w], incoming.worlds[w]);
  }
  const resume = pickResume(base.resume, incoming.resume, worlds);
  const last = incoming.practice.last ?? base.practice.last;
  const tower = mergeTower(base.tower, incoming.tower);
  const name = incoming.name ?? base.name;
  const readAloud = incoming.readAloud ?? base.readAloud;

  return {
    id: incoming.id,
    ...(name === undefined ? {} : { name }),
    avatar: incoming.avatar,
    stufe: incoming.stufe,
    ...(readAloud === undefined ? {} : { readAloud }),
    createdAt: base.createdAt <= incoming.createdAt ? base.createdAt : incoming.createdAt,
    worlds,
    ...(resume ? { resume } : {}),
    practice: {
      pearls: Math.max(base.practice.pearls, incoming.practice.pearls),
      ...(last ? { last } : {}),
    },
    celebrated: unionStrings(base.celebrated, incoming.celebrated),
    stats: { ...base.stats, ...incoming.stats },
    ...(tower ? { tower } : {}),
  };
}

/**
 * Führt lokalen und Cloud-Zustand zusammen, sodass weder Kinderprofile noch
 * erspielte Sterne, Perlen oder Turm-Fortschritte verloren gehen.
 */
export function mergeStates(base: AppStateV2, incoming: AppStateV2): AppStateV2 {
  const byId = new Map<string, Profile>();
  for (const p of base.profiles) {
    byId.set(p.id, p);
  }
  for (const p of incoming.profiles) {
    const existing = byId.get(p.id);
    if (existing) {
      byId.set(p.id, mergeProfiles(existing, p));
    } else if (byId.size < MAX_PROFILES) {
      byId.set(p.id, p);
    }
  }
  const profiles = Array.from(byId.values());
  const setupDone = base.setupDone || incoming.setupDone || profiles.length > 0;
  const candidateActive =
    incoming.activeProfileId ??
    base.activeProfileId ??
    (profiles.length === 1 ? profiles[0]?.id : undefined);
  const hasActive = candidateActive !== undefined && profiles.some((p) => p.id === candidateActive);

  return {
    version: 2,
    profiles,
    setupDone,
    ...(hasActive ? { activeProfileId: candidateActive } : {}),
  };
}

function extractCloudState(payload: unknown): AppStateV2 | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const raw = (payload as { state?: unknown }).state;
  if (raw === null || raw === undefined) return null;
  return parseState(raw) ?? repairState(raw);
}

/** Lädt den gespeicherten Cloud-Spielstand von `/api/state`. */
export async function pullCloudState(): Promise<AppStateV2 | null> {
  try {
    const res = await fetch(SYNC_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return extractCloudState(data);
  } catch {
    return null;
  }
}

/** Speichert den Spielstand in der Cloud unter `/api/state` und gibt den zusammengeführten Stand zurück. */
export async function pushCloudState(
  state: AppStateV2,
  overwrite = false,
): Promise<AppStateV2 | null> {
  try {
    const res = await fetch(SYNC_PATH, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ state, overwrite }),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return extractCloudState(data);
  } catch {
    return null;
  }
}
