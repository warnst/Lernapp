import { type Thing, THINGS } from '@/content/things';
import type { Mistake } from '@/domain/types';
import type { Distractor } from '../distractors';

// Bausteine für „mengen-zahlen“ (docs/05 Anhang B): Zahlwörter, Grammatik der Dinge, Fehlerhinweise.

const WORDS = [
  'null',
  'eins',
  'zwei',
  'drei',
  'vier',
  'fünf',
  'sechs',
  'sieben',
  'acht',
  'neun',
  'zehn',
  'elf',
  'zwölf',
  'dreizehn',
  'vierzehn',
  'fünfzehn',
  'sechzehn',
  'siebzehn',
  'achtzehn',
  'neunzehn',
  'zwanzig',
];

/** Zahlwort zum Vorlesen und Mitzählen („sieben“); ab 21 die Ziffern. */
function zahlwort(n: number): string {
  return WORDS[n] ?? String(n);
}

/** Zahlwörter von `from` bis `to` (aufwärts oder abwärts), lange Reihen enden mit „…“. */
export function countWords(from: number, to: number, max = 3): string {
  const dir = to >= from ? 1 : -1;
  const words: string[] = [];
  for (let n = from; dir > 0 ? n <= to : n >= to; n += dir) words.push(zahlwort(n));
  return words.length > max ? `${words.slice(0, 2).join(', ')} …` : words.join(', ');
}

/** Punkt ans Satzende, außer nach „…“. */
export function withDot(text: string): string {
  return text.endsWith('…') ? text : `${text}.`;
}

type Genus = 'f' | 'm' | 'n';

/** Grammatisches Geschlecht der Dinge aus `content/things.ts`. */
const GENUS: Record<string, Genus> = {
  muschel: 'f',
  seestern: 'm',
  fisch: 'm',
  krebs: 'm',
  stein: 'm',
  feder: 'f',
  moewe: 'f',
  boot: 'n',
};

export interface ThingWords extends Thing {
  /** „eine Muschel“ / „einen Seestern“ / „ein Boot“ */
  akk: string;
  /** „Eine Muschel“ / „Ein Seestern“ */
  nomCap: string;
  /** „jede Muschel“ / „jeden Seestern“ / „jedes Boot“ */
  jedeAkk: string;
  /** „jede“ / „jeden“ / „jedes“ (Akkusativ ohne Nomen) */
  jede: string;
  /** „sie“ / „er“ / „es“ */
  pron: string;
  /** Dativ Plural: „mit Steinen“, „mit Muscheln“ */
  dativ: string;
}

function thingWords(thing: Thing): ThingWords {
  const genus = GENUS[thing.id] ?? 'f';
  const art = {
    f: ['eine', 'Eine', 'jede', 'sie'],
    m: ['einen', 'Ein', 'jeden', 'er'],
    n: ['ein', 'Ein', 'jedes', 'es'],
  }[genus];
  const [akk = '', nom = '', jede = '', pron = ''] = art;
  return {
    ...thing,
    akk: `${akk} ${thing.singular}`,
    nomCap: `${nom} ${thing.singular}`,
    jedeAkk: `${jede} ${thing.singular}`,
    jede,
    pron,
    dativ: thing.plural.endsWith('n') ? thing.plural : `${thing.plural}n`,
  };
}

export function thingById(id: string): ThingWords {
  const thing = THINGS.find((t) => t.id === id);
  if (!thing) throw new Error(`Unbekanntes Ding: ${id}`);
  return thingWords(thing);
}

/** Dinge, die liegen bleiben (Häufchen, Eimer, Finden). */
export const STILL_THINGS = ['muschel', 'seestern', 'stein', 'feder'] as const;

/** Dinge, die weggehen können (M4): Ort, Verb im Plural und Singular. */
export const MOVERS: Record<string, { place: string; plural: string; singular: string }> = {
  fisch: { place: 'Im Wasser', plural: 'schwimmen', singular: 'schwimmt' },
  moewe: { place: 'Am Himmel', plural: 'fliegen', singular: 'fliegt' },
  krebs: { place: 'Am Strand', plural: 'krabbeln', singular: 'krabbelt' },
  boot: { place: 'Im Hafen', plural: 'fahren', singular: 'fährt' },
};

/** „1, 2, 3, 4. Es sind 4 Muscheln.“ – ab 11 in Fünferschritten. */
export function countAloud(n: number): string {
  const steps: number[] = [];
  if (n <= 10) {
    for (let k = 1; k <= n; k++) steps.push(k);
  } else {
    for (let k = 5; k <= n; k += 5) steps.push(k);
    for (let k = (steps.at(-1) ?? 0) + 1; k <= n; k++) steps.push(k);
  }
  return steps.join(', ');
}

/** Fehloptionen filtern: ganzzahlig, 0 … max, ≠ richtig, verschieden. */
export function numberMistakes(
  correct: number,
  candidates: readonly Distractor[],
  max: number,
): Mistake[] {
  const seen = new Set<number>([correct]);
  const result: Mistake[] = [];
  for (const d of candidates) {
    if (!Number.isInteger(d.value) || d.value < 0 || d.value > max || seen.has(d.value)) continue;
    seen.add(d.value);
    result.push({ value: d.value, feedback: d.feedback });
  }
  return result;
}

/** Bildsymbole der Eimer/Beutel (Illustrationen) mit Namen für „Fisch-Eimer“. */
export const SYMBOLS: { icon: string; name: string }[] = [
  { icon: 'anker', name: 'Anker' },
  { icon: 'stern', name: 'Stern' },
  { icon: 'fisch', name: 'Fisch' },
  { icon: 'muschel', name: 'Muschel' },
];
