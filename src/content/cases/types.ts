// Detektivfälle (docs/12 3.9): feste, freundliche Geschichten. Die Rätsel dazu erzeugt das Spiel.

/** Tiere mit vorhandener Zeichnung (Avatar oder Sachen-Icon) */
export type SuspectAnimal =
  | 'moewe'
  | 'robbe'
  | 'flamingo'
  | 'krebs'
  | 'pinguin'
  | 'schildkroete'
  | 'seepferdchen'
  | 'delfin'
  | 'seestern';

export interface Suspect {
  id: string;
  /** „Möwe Mia“ */
  name: string;
  animal: SuspectAnimal;
  /** auffälliges Merkmal, kurz: „hat weiße Federn“ */
  trait: string;
}

export interface CaseClue {
  id: string;
  /** ab Stufe 3: ganzer Satz, z. B. „Der Täter hat keine Scheren.“ */
  text: string;
  /** Stufe 2: sehr kurzer Satz zum Bild, z. B. „Eine weiße Feder!“ */
  short: string;
  /** Bild zum Hinweis (ItemIcon-ID) */
  icon: string;
  /** IDs der Verdächtigen, die dieser Hinweis entlastet */
  excludes: string[];
}

export interface DetectiveCase {
  id: string;
  title: string;
  /** Einstiegssatz zur Fallakte, vorgelesen */
  intro: string;
  /** Bild vom Tatort (ItemIcon-ID) */
  sceneIcon: string;
  /** genau 4; Stufe 2 nutzt nur die ersten 3 (der Täter ist immer unter den ersten 3) */
  suspects: Suspect[];
  /** ID des „Täters“ (niemand ist böse) */
  culprit: string;
  /** genau 5, in dieser Reihenfolge angepinnt; Stufe 2 nutzt 3, Stufe 3 nutzt 4, Stufe 4 alle 5 */
  clues: CaseClue[];
  /** freundliche Auflösung, 1–3 kurze Sätze */
  resolution: string;
  /** Satz für das Detektivbuch, z. B. „Möwe Mia hat den Keks geteilt.“ */
  bookLine: string;
}
