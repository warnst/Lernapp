import type { PracticeTopicId } from '@/domain/types';

// Themen fürs Üben mit Bild (docs/01 5.7). Namen stehen in src/content/ui.ts.

export const TOPIC_ORDER: readonly PracticeTopicId[] = [
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

/** Sachen-Icon je Thema. */
export const TOPIC_ICON: Record<PracticeTopicId, string> = {
  'mengen-zahlen': 'muschel',
  'muenzen-zaehlen': 'schatzkaestchen',
  'preise-addieren': 'kokosnuss',
  rueckgeld: 'eis',
  'muenzen-legen': 'murmel',
  'reicht-das-geld': 'strandball',
  sachaufgaben: 'postkarte',
  knobeln: 'kompass',
  raetsel: 'stern',
};

/** Ersatz, wenn das Thema einer Station auf der Stufe des Kindes fehlt (docs/09 6). */
export const TOPIC_FALLBACK: Partial<Record<PracticeTopicId, PracticeTopicId>> = {
  knobeln: 'sachaufgaben',
  'mengen-zahlen': 'muenzen-zaehlen',
};
