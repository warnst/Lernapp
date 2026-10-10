import type { AppStateV2, AvatarId, PracticeTopicId, Profile, Stufe } from '@/domain/types';

// Speicherung in localStorage (docs/03 Abschnitt 8, docs/09 Abschnitt 3.1).
// Jeder Zugriff in try/catch: Scheitert er, läuft die App mit Sitzungsdaten weiter.

export const STORAGE_KEY = 'schatzinsel.state.v2';
/** Hier landen gespeicherte Daten, die sich nicht vollständig lesen ließen, bevor sie überschrieben werden. */
export const BROKEN_KEY = 'schatzinsel.state.v2.unlesbar';
export const MAX_PROFILES = 6;

const AVATAR_IDS: readonly AvatarId[] = [
  'delfin',
  'schildkroete',
  'seepferdchen',
  'pinguin',
  'robbe',
  'flamingo',
];
const STUFE_IDS: readonly number[] = [1, 2, 3, 4];
const TOPIC_IDS: readonly PracticeTopicId[] = [
  'mengen-zahlen',
  'muenzen-zaehlen',
  'preise-addieren',
  'rueckgeld',
  'muenzen-legen',
  'reicht-das-geld',
  'sachaufgaben',
  'knobeln',
  'raetsel',
];
const WORLD_IDS: readonly string[] = ['kleine-bucht', 'schatzinsel'];

export function createInitialState(): AppStateV2 {
  return { version: 2, profiles: [], setupDone: false };
}

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStufe(value: unknown): value is Stufe {
  return typeof value === 'number' && STUFE_IDS.includes(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isWorldProgress(value: unknown): boolean {
  if (!isObject(value) || !isObject(value.stations)) return false;
  const stationsOk = Object.values(value.stations).every(
    (s) =>
      isObject(s) &&
      typeof s.completed === 'boolean' &&
      isOptionalString(s.completedAt) &&
      isCount(s.plays) &&
      isStufe(s.stufe),
  );
  return stationsOk && typeof value.unlockAll === 'boolean' && isStringArray(value.bonusSolved);
}

function isResume(value: unknown): boolean {
  if (value === undefined) return true;
  return (
    isObject(value) &&
    typeof value.world === 'string' &&
    WORLD_IDS.includes(value.world) &&
    typeof value.stationId === 'string' &&
    isCount(value.taskIndex) &&
    isCount(value.partIndex) &&
    isCount(value.seed)
  );
}

function isPractice(value: unknown): boolean {
  if (!isObject(value) || !isCount(value.pearls)) return false;
  const last = value.last;
  if (last === undefined) return true;
  return (
    isObject(last) &&
    typeof last.topic === 'string' &&
    (TOPIC_IDS as readonly string[]).includes(last.topic) &&
    (last.shift === -1 || last.shift === 0 || last.shift === 1) &&
    (last.count === 5 || last.count === 10)
  );
}

const TOWER_TYPES: readonly string[] = [
  'sudoku',
  'memory',
  'odd',
  'shadow',
  'maze',
  'dots',
  'nonogram',
  'cipher',
  'case',
  'quiz',
  'riddles',
];

function isStringRecord(value: unknown): boolean {
  return isObject(value) && Object.values(value).every((v) => typeof v === 'string');
}

function isWardrobe(value: unknown): boolean {
  if (value === undefined) return true;
  return (
    isObject(value) &&
    isStringArray(value.owned) &&
    isCount(value.chests) &&
    isStringRecord(value.kiko) &&
    isStringRecord(value.nest) &&
    (value.fresh === undefined || isStringArray(value.fresh))
  );
}

const SUDOKU_KINDS: readonly string[] = ['bilder', 'zahlen4', 'muenzen', 'zahlen6', 'rechnen'];

function isCountArray(value: unknown): boolean {
  return Array.isArray(value) && value.every(isCount);
}

function isSudokuSave(value: unknown): boolean {
  if (value === undefined) return true;
  return (
    isObject(value) &&
    typeof value.kind === 'string' &&
    SUDOKU_KINDS.includes(value.kind) &&
    (value.stars === 1 || value.stars === 2 || value.stars === 3) &&
    isCount(value.seed) &&
    isCountArray(value.entries) &&
    isCountArray(value.locked) &&
    isCountArray(value.notes)
  );
}

function isCaseSave(value: unknown): boolean {
  if (value === undefined) return true;
  return (
    isObject(value) &&
    typeof value.caseId === 'string' &&
    isCount(value.solved) &&
    isCount(value.seed)
  );
}

function isTower(value: unknown): boolean {
  if (value === undefined) return true;
  return (
    isObject(value) &&
    isCount(value.lamps) &&
    isObject(value.solved) &&
    Object.entries(value.solved).every(([type, n]) => TOWER_TYPES.includes(type) && isCount(n)) &&
    isStringArray(value.jokes) &&
    isStringArray(value.favorites) &&
    isWardrobe(value.wardrobe) &&
    isSudokuSave(value.sudoku) &&
    (value.facts === undefined || isStringArray(value.facts)) &&
    (value.cases === undefined || isStringArray(value.cases)) &&
    isCaseSave(value.caseSave)
  );
}

function isProfile(value: unknown): value is Profile {
  if (!isObject(value)) return false;
  return (
    typeof value.id === 'string' &&
    value.id !== '' &&
    isOptionalString(value.name) &&
    typeof value.avatar === 'string' &&
    (AVATAR_IDS as readonly string[]).includes(value.avatar) &&
    isStufe(value.stufe) &&
    typeof value.createdAt === 'string' &&
    isObject(value.worlds) &&
    Object.entries(value.worlds).every(
      ([world, progress]) => WORLD_IDS.includes(world) && isWorldProgress(progress),
    ) &&
    isResume(value.resume) &&
    isPractice(value.practice) &&
    isTower(value.tower) &&
    isStringArray(value.celebrated) &&
    isObject(value.stats) &&
    Object.values(value.stats).every(
      (s) => isObject(s) && isCount(s.wrong) && isCount(s.hints) && isStufe(s.stufe),
    )
  );
}

/** Prüft Version und Aufbau. Unbekannte oder kaputte Daten → null. */
export function parseState(raw: unknown): AppStateV2 | null {
  if (!isObject(raw) || raw.version !== 2 || typeof raw.setupDone !== 'boolean') return null;
  const profiles = raw.profiles;
  if (!Array.isArray(profiles) || profiles.length > MAX_PROFILES) return null;
  if (!profiles.every(isProfile)) return null;
  const ids = profiles.map((p) => p.id);
  if (new Set(ids).size !== ids.length) return null;
  const active = raw.activeProfileId;
  if (active !== undefined && (typeof active !== 'string' || !ids.includes(active))) return null;
  return raw as unknown as AppStateV2; // Aufbau oben vollständig geprüft
}

/**
 * Rettet, was sich retten lässt: Angefangene Spiele, Statistik und kaputte Turm-Teile fallen weg,
 * Profile und Fortschritt bleiben. Profile, die auch so nicht lesbar sind, entfallen.
 */
function repairProfile(value: unknown): Profile | null {
  if (isProfile(value)) return value;
  if (!isObject(value)) return null;
  const { resume: _resume, tower, ...rest } = value;
  const practice = value.practice;
  const pearls = isObject(practice) && isCount(practice.pearls) ? practice.pearls : 0;
  const towers = isObject(tower)
    ? [
        tower,
        { ...tower, sudoku: undefined, caseSave: undefined },
        { ...tower, sudoku: undefined, caseSave: undefined, wardrobe: undefined },
      ]
    : [];
  const repairedTower = towers.find(isTower);
  const candidate = {
    ...rest,
    practice: isPractice(practice) ? practice : { pearls },
    celebrated: isStringArray(value.celebrated) ? value.celebrated : [],
    stats: {},
    ...(repairedTower ? { tower: JSON.parse(JSON.stringify(repairedTower)) as unknown } : {}),
  };
  return isProfile(candidate) ? candidate : null;
}

export function repairState(raw: unknown): AppStateV2 | null {
  if (!isObject(raw) || raw.version !== 2 || !Array.isArray(raw.profiles)) return null;
  const profiles: Profile[] = [];
  for (const value of raw.profiles) {
    const profile = repairProfile(value);
    if (profile && profiles.length < MAX_PROFILES && !profiles.some((p) => p.id === profile.id)) {
      profiles.push(profile);
    }
  }
  const active = raw.activeProfileId;
  const setupDone = typeof raw.setupDone === 'boolean' ? raw.setupDone : profiles.length > 0;
  return profiles.some((p) => p.id === active) && typeof active === 'string'
    ? { version: 2, profiles, setupDone, activeProfileId: active }
    : { version: 2, profiles, setupDone };
}

/**
 * Liest den gespeicherten Zustand. Fehlt er, gibt es einen frischen. Ist er nicht vollständig
 * lesbar, wird der Text unter BROKEN_KEY aufgehoben und so viel wie möglich gerettet, damit ein
 * Fehler nie still den ganzen Fortschritt löscht.
 */
export function loadState(storage: Storage | undefined): AppStateV2 {
  let text: string | null | undefined;
  try {
    text = storage?.getItem(STORAGE_KEY);
  } catch {
    return createInitialState();
  }
  if (text === null || text === undefined) return createInitialState();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    raw = undefined;
  }
  const state = parseState(raw);
  if (state) return state;
  try {
    storage?.setItem(BROKEN_KEY, text);
  } catch {
    // ohne Platz bleibt nur das Retten unten
  }
  return repairState(raw) ?? createInitialState();
}

export function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** Lässt sich in diesem Browser gerade überhaupt etwas speichern? (privates Surfen, gesperrt …) */
export function canStore(storage: Storage | undefined): boolean {
  try {
    if (!storage) return false;
    storage.setItem('schatzinsel.test', '1');
    storage.removeItem('schatzinsel.test');
    return true;
  } catch {
    return false;
  }
}

/** Speichert den Zustand. Liefert false, wenn das nicht ging (privater Modus, voller Speicher …). */
export function saveState(storage: Storage | undefined, state: AppStateV2): boolean {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

interface Backup {
  app: 'schatzinsel';
  exportedAt: string;
  state: AppStateV2;
}

/** Sicherung als JSON mit Datum. */
export function exportState(state: AppStateV2, now: Date): string {
  const backup: Backup = { app: 'schatzinsel', exportedAt: now.toISOString(), state };
  return JSON.stringify(backup, null, 2);
}

/** Liest eine Sicherung. Ungültig → null, der bestehende Zustand bleibt dann unverändert. */
export function importState(json: string): AppStateV2 | null {
  try {
    const raw: unknown = JSON.parse(json);
    if (!isObject(raw) || raw.app !== 'schatzinsel') return null;
    return parseState(raw.state);
  } catch {
    return null;
  }
}
