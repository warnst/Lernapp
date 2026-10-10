import type { Stufe } from '@/domain/types';

// Kikos Wissenskiste (docs/12 3.10): fester, geprüfter Fragenkatalog.

export type QuizTopic = 'tiere' | 'meer' | 'natur' | 'koerper' | 'weltall' | 'welt';

export interface QuizAnswer {
  text: string;
  /** optionales Sachen-Icon (ItemIcon-ID) für Stufe 1–2 */
  icon?: string;
}

export interface QuizQuestion {
  /** eindeutig, z. B. 'tiere-spinne-beine' */
  id: string;
  topic: QuizTopic;
  /** Stufenbereich, für den die Frage passt */
  from: Stufe;
  to: Stufe;
  question: string;
  /** 3 Antworten (from ≤ 2) oder 3–4 Antworten (from ≥ 3); genau eine richtig */
  answers: QuizAnswer[];
  /** Index der richtigen Antwort */
  correct: number;
  /** Tipp nach dem zweiten Fehlversuch, verrät die Antwort nicht direkt */
  hint: string;
  /** „Wusstest du?“-Satz mit dem Fakt (1–2 kurze Sätze) */
  fact: string;
}
