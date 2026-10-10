import type { Stufe } from '@/domain/types';

// Datenformate für Bilderrätsel, Punkte verbinden und „Was passt nicht?“ (docs/12 3.3, 3.6, 3.7).

/**
 * Bilderrätsel (Nonogramm): Zeilen von oben nach unten, ein Zeichen je Kästchen.
 * '.' = leer, jeder andere Buchstabe = ausgemalt in der Farbe aus `palette`.
 */
export interface NonogramPicture {
  id: string;
  /** „Palme“ */
  name: string;
  rows: string[];
  /** Buchstabe → CSS-Farbe (nur Tokens, z. B. 'var(--ill-palm)') */
  palette: Record<string, string>;
}

/** Punkte verbinden: Umriss in Zeichenreihenfolge im Feld 0..100 × 0..100. */
export interface DotsPicture {
  id: string;
  /** „Schiff“ */
  name: string;
  points: [number, number][];
  /** letzter Punkt wird mit dem ersten verbunden */
  closed: boolean;
  /** Füllfarbe des fertigen Umrisses (Token) */
  fill: string;
  /** Verzierungen, die nach dem Verbinden farbig erscheinen (SVG-Pfade im selben Feld) */
  extras: { d: string; fill: string }[];
}

/** Ein Ding in „Was passt nicht?“ (Sachen-Icon) mit Namen für Kikos Erklärung. */
export interface OddThing {
  /** ItemIcon-ID */
  icon: string;
  /** „Möhre“ */
  name: string;
  /** „Die Möhre ist ein Gemüse.“ */
  isA: string;
}

export interface OddCategory {
  id: string;
  /** „sind Obst“ → „Apfel, Banane und Birne sind Obst.“ */
  are: string;
  /** ab welcher Stufe die Kategorie vorkommt */
  from: Stufe;
  things: OddThing[];
}
