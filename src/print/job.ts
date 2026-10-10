import { STUFEN } from '@/config/levels';
import { WORLDS } from '@/content/worlds';
import type { PracticeTopicId, Profile, Station, Stufe, Task, WorldId } from '@/domain/types';
import { buildRound } from '@/practice/round';
import { TOPIC_ORDER } from '@/practice/topics';
import { stationTasks } from '@/practice/variants';
import { type TowerPrint, towerPrint } from './tower-print';

// Was gedruckt wird: Auswahl aus der URL (docs/06 1) und die daraus erzeugten Blätter.

export interface PrintOptions {
  profileId?: string;
  stufe: Stufe;
  /** Stationsnummern */
  stations: number[];
  practice?: PracticeTopicId;
  riddles: boolean;
  certificate: boolean;
  /** Urkunde auch ohne alle Stationen */
  certificateAnyway: boolean;
  solutions: boolean;
  nameField: boolean;
  large: boolean;
  /** 0 = Originalaufgaben auf ihrer Stufe */
  seed: number;
  practiceSeed: number;
  riddleSeed: number;
  /** Rätselturm-Blatt (docs/12 8) */
  tower: boolean;
  towerSeed: number;
}

export type Sheet =
  | { kind: 'station'; station: Station; tasks: Task[] }
  | { kind: 'practice'; topic: PracticeTopicId; tasks: Task[] }
  | { kind: 'riddles'; tasks: Task[] }
  | { kind: 'tower'; puzzles: TowerPrint }
  | { kind: 'certificate'; world: WorldId; name?: string };

const STUFE_IDS = Object.values(STUFEN).map((cfg) => cfg.id);

function int(value: string | null, fallback: number): number {
  const n = Number(value);
  return value !== null && Number.isInteger(n) && n >= 0 ? n : fallback;
}

export function worldFor(stufe: Stufe): WorldId {
  return STUFEN[stufe].world;
}

/** Liest die Auswahl aus der URL; unbekannte Werte fallen auf sinnvolle Startwerte zurück. */
export function parsePrintOptions(search: string, profiles: readonly Profile[]): PrintOptions {
  const params = new URLSearchParams(search);
  const profile = profiles.find((p) => p.id === params.get('kind'));
  const stufe =
    STUFE_IDS.find((s) => String(s) === params.get('stufe')) ?? profile?.stufe ?? STUFE_IDS[2] ?? 3;
  const count = WORLDS[worldFor(stufe)].stations.length;
  const stations = (params.get('stationen') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= count);
  const practice = TOPIC_ORDER.find((t) => t === params.get('uebung'));
  return {
    ...(profile ? { profileId: profile.id } : {}),
    stufe,
    stations: [...new Set(stations)].sort((a, b) => a - b),
    ...(practice ? { practice } : {}),
    riddles: params.get('raetsel') === '1',
    certificate: params.get('urkunde') === '1',
    certificateAnyway: params.get('trotzdem') === '1',
    solutions: params.get('loesungen') !== '0',
    nameField: params.get('namensfeld') !== '0',
    large: stufe === 1 || params.get('gross') === '1',
    seed: int(params.get('seed'), 0),
    practiceSeed: int(params.get('useed'), 1),
    riddleSeed: int(params.get('rseed'), 1),
    tower: params.get('turm') === '1',
    towerSeed: int(params.get('tseed'), 1),
  };
}

/** Die Auswahl als Query-String (ohne „?“), Gegenstück zu parsePrintOptions. */
export function printSearch(o: PrintOptions): string {
  const params = new URLSearchParams();
  params.set('welt', worldFor(o.stufe));
  params.set('stufe', String(o.stufe));
  if (o.profileId) params.set('kind', o.profileId);
  if (o.stations.length > 0) params.set('stationen', o.stations.join(','));
  if (o.practice) params.set('uebung', o.practice);
  if (o.riddles) params.set('raetsel', '1');
  if (o.certificate) params.set('urkunde', '1');
  if (o.certificateAnyway) params.set('trotzdem', '1');
  params.set('loesungen', o.solutions ? '1' : '0');
  if (!o.nameField) params.set('namensfeld', '0');
  if (o.large) params.set('gross', '1');
  params.set('seed', String(o.seed));
  params.set('useed', String(o.practiceSeed));
  params.set('rseed', String(o.riddleSeed));
  if (o.tower) params.set('turm', '1');
  params.set('tseed', String(o.towerSeed));
  return params.toString();
}

/** Darf die Urkunde gedruckt werden? Alle Stationen geschafft oder „trotzdem erlauben“. */
export function certificateAllowed(o: PrintOptions, profile: Profile | undefined): boolean {
  if (o.certificateAnyway) return true;
  const world = worldFor(o.stufe);
  const progress = profile?.worlds[world]?.stations ?? {};
  return WORLDS[world].stations.every((s) => progress[s.id]?.completed === true);
}

/** Die Blätter in Druckreihenfolge: Stationen, Übungsblatt, Rätselblatt, Rätselturm, Urkunde. */
export function buildSheets(o: PrintOptions, profile: Profile | undefined): Sheet[] {
  const world = worldFor(o.stufe);
  const sheets: Sheet[] = WORLDS[world].stations
    .filter((station) => o.stations.includes(station.number))
    .map((station) => ({
      kind: 'station' as const,
      station,
      tasks: stationTasks(station, o.stufe, o.seed, 'druck'),
    }));
  if (o.practice) {
    const tasks = buildRound(o.practice, o.stufe, 6, o.practiceSeed);
    if (tasks.length > 0) sheets.push({ kind: 'practice', topic: o.practice, tasks });
  }
  if (o.riddles) {
    const tasks = buildRound('raetsel', o.stufe, 6, o.riddleSeed);
    if (tasks.length > 0) sheets.push({ kind: 'riddles', tasks });
  }
  if (o.tower) sheets.push({ kind: 'tower', puzzles: towerPrint(o.stufe, o.towerSeed) });
  if (o.certificate && certificateAllowed(o, profile)) {
    sheets.push({
      kind: 'certificate',
      world,
      ...(profile?.name ? { name: profile.name } : {}),
    });
  }
  return sheets;
}
