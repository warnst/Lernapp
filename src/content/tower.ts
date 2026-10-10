import type { TowerType } from '@/domain/types';

// Rätselarten im Turm: Adresse und Bild (docs/12 3). Namen stehen in src/content/ui.ts.

export const TOWER_ORDER: readonly TowerType[] = [
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

/** Adresse `/raetsel/:slug` */
export const TOWER_SLUG: Record<TowerType, string> = {
  sudoku: 'sudoku',
  memory: 'memory',
  odd: 'was-passt-nicht',
  shadow: 'schatten',
  maze: 'labyrinth',
  dots: 'punkte',
  nonogram: 'bilderraetsel',
  cipher: 'geheimschrift',
  case: 'detektivfall',
  quiz: 'wissensfragen',
  riddles: 'muster',
};

/** Sachen-Icon je Rätselart */
export const TOWER_ICON: Record<TowerType, string> = {
  sudoku: 'muschelkette',
  memory: 'muschel',
  odd: 'apfel',
  shadow: 'fisch',
  maze: 'karte',
  dots: 'seestern',
  nonogram: 'postkarte',
  cipher: 'federstift',
  case: 'fernglas',
  quiz: 'stickerheft',
  riddles: 'stern',
};
