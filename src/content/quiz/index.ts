import { QUIZ_KOERPER } from './koerper';
import { QUIZ_MEER } from './meer';
import { QUIZ_NATUR } from './natur';
import { QUIZ_TIERE } from './tiere';
import type { QuizQuestion, QuizTopic } from './types';
import { QUIZ_WELT } from './welt';
import { QUIZ_WELTALL } from './weltall';

// Kikos Wissenskiste (docs/12, Abschnitt 3.10): alle Fragen und die Themen in fester Reihenfolge.

export const QUIZ_TOPICS: { id: QuizTopic; name: string; icon: string }[] = [
  { id: 'tiere', name: 'Tiere', icon: 'moewe' },
  { id: 'meer', name: 'Meer', icon: 'muschel' },
  { id: 'natur', name: 'Natur und Wetter', icon: 'apfel' },
  { id: 'koerper', name: 'Mein Körper', icon: 'ball' },
  { id: 'weltall', name: 'Weltall', icon: 'stern' },
  { id: 'welt', name: 'Welt und Alltag', icon: 'karte' },
];

export const QUIZ: readonly QuizQuestion[] = [
  ...QUIZ_TIERE,
  ...QUIZ_MEER,
  ...QUIZ_NATUR,
  ...QUIZ_KOERPER,
  ...QUIZ_WELTALL,
  ...QUIZ_WELT,
];
