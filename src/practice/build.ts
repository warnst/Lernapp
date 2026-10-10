import { type Item, ITEMS, itemById } from '@/content/items';
import { NAMES, type PersonName } from '@/content/names';
import { pick, randomInt, type Rng, shuffle } from '@/domain/random';
import type {
  Cents,
  ChoiceAnswer,
  ChoiceOption,
  Scene,
  StufeConfig,
  Task,
  TaskPart,
} from '@/domain/types';
import type { GenerateOptions } from './types';

// Bausteine für Vorlagen: Geld-Tokens, Grammatik, Zufallspreise, Antwortkarten, force/bind.

/** Geld-Token für Texte: tok(120) → „{{120}}“ (wird zu „1,20 €“). */
export function tok(cents: Cents): string {
  return `{{${String(cents)}}}`;
}

/** Erster Buchstabe groß: „sie bezahlt“ → „Sie bezahlt“. */
export function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** „Yusufs Einkaufszettel“; Namen auf s, x, z, ß bekommen nur ein Apostroph. */
export function genitiv(name: string): string {
  return /[sxzß]$/.test(name) ? `${name}’` : `${name}s`;
}

/** Wörter eines Textes nach dem Auflösen der Tokens. */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** force-Schlüssel lesen; unbekannte Schlüssel brechen ab, damit Tippfehler auffallen. */
export function readForce(opts: GenerateOptions | undefined, allowed: readonly string[]) {
  const force = opts?.force ?? {};
  for (const key of Object.keys(force)) {
    if (!allowed.includes(key)) throw new Error(`Unbekannter force-Schlüssel: ${key}`);
  }
  return force;
}

/** bind-Schlüssel lesen (A, B, C …); unbekannte Schlüssel oder Sachen brechen ab. */
export function readBind(opts: GenerateOptions | undefined, allowed: readonly string[]) {
  const bind = opts?.bind ?? {};
  for (const [key, id] of Object.entries(bind)) {
    if (!allowed.includes(key)) throw new Error(`Unbekannter bind-Schlüssel: ${key}`);
    itemById(id);
  }
  return bind;
}

/** Sachen mit Preisbereich auf dieser Stufe (optional nur mit Plural). */
export function itemsFor(cfg: StufeConfig, needPlural = false): Item[] {
  return ITEMS.filter(
    (item) => item.prices[cfg.id] !== undefined && (!needPlural || item.plural !== undefined),
  );
}

/** Zufallspreis im Bereich der Sache, im Stufenschritt, höchstens maxPrice. null = nicht möglich. */
export function randomPrice(rng: Rng, cfg: StufeConfig, item: Item): Cents | null {
  const range = item.prices[cfg.id];
  if (!range) return null;
  const step = cfg.money.step;
  const low = Math.max(1, Math.ceil(range[0] / step));
  const high = Math.floor(Math.min(range[1], cfg.money.maxPrice) / step);
  if (low > high) return null;
  return randomInt(rng, low, high) * step;
}

/** Sache nach bind-Schlüssel oder zufällig (ohne die ausgeschlossenen). */
export function chooseItem(
  rng: Rng,
  cfg: StufeConfig,
  bound: string | undefined,
  exclude: readonly string[] = [],
  needPlural = false,
): Item | null {
  if (bound !== undefined) {
    const item = itemById(bound);
    return item.prices[cfg.id] === undefined ? null : item;
  }
  const choices = itemsFor(cfg, needPlural).filter((i) => !exclude.includes(i.id));
  return choices.length === 0 ? null : pick(rng, choices);
}

export function chooseName(rng: Rng, exclude: readonly string[] = []): PersonName {
  return pick(
    rng,
    NAMES.filter((n) => !exclude.includes(n.name)),
  );
}

export interface WrongOption {
  label: string;
  feedback?: string;
}

/**
 * Antwortkarten: richtige Option plus bis zu count − 1 falsche (gemischt, IDs a, b, c, d).
 * Doppelte Labels werden übersprungen.
 */
export function choice(
  correct: Omit<ChoiceOption, 'id' | 'correct'>,
  wrong: readonly (WrongOption & Partial<ChoiceOption>)[],
  count: number,
  layout: ChoiceAnswer['layout'] = 'cards',
  shuffled = true,
): ChoiceAnswer {
  const labels = new Set([correct.label]);
  const others = wrong.filter((w) => {
    if (labels.has(w.label)) return false;
    labels.add(w.label);
    return true;
  });
  const options = [{ ...correct, correct: true as const }, ...others.slice(0, count - 1)];
  return {
    type: 'choice',
    layout,
    shuffle: shuffled,
    options: options.map((option, i) => ({ ...option, id: 'abcd'.charAt(i) })),
  };
}

/** Ja/Nein-Karten in fester Reihenfolge. */
export function yesNo(
  yes: string,
  no: string,
  correctIsYes: boolean,
  feedback: { yes?: string; no?: string } = {},
): ChoiceAnswer {
  const option = (id: string, label: string, isCorrect: boolean, hint?: string): ChoiceOption => ({
    id,
    label,
    ...(isCorrect ? { correct: true as const } : {}),
    ...(!isCorrect && hint !== undefined ? { feedback: hint } : {}),
  });
  return {
    type: 'choice',
    layout: 'yesno',
    shuffle: false,
    options: [
      option('a', yes, correctIsYes, feedback.yes),
      option('b', no, !correctIsYes, feedback.no),
    ],
  };
}

type PartInput = Omit<TaskPart, 'id'>;

/** Aufgabe mit vorläufigen IDs; buildRound und die Varianten vergeben die endgültigen. */
export function makeTask(
  cfg: StufeConfig,
  title: string,
  scene: Scene,
  story: string,
  parts: PartInput[],
  difficulty: Task['difficulty'] = 3,
): Task {
  return {
    id: 'gen',
    title,
    difficulty,
    authoredFor: cfg.id,
    scene,
    story,
    parts: parts.map((part, i) => ({ ...part, id: `gen-${'abc'.charAt(i)}` })),
  };
}

/** Euro- und Cent-Anteil eines Betrags. */
export function split(cents: Cents): { euro: number; cent: number } {
  return { euro: Math.floor(cents / 100), cent: cents % 100 };
}

/** Mischt eine Liste reproduzierbar. */
export function mix<T>(rng: Rng, items: readonly T[]): T[] {
  return shuffle(rng, items);
}
