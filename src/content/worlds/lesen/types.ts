import type { Station, SyllableWord } from '@/domain/types';
import { LETTERS, type LetterInfo } from './phonics';

export interface LesenStoryPage {
  id: string;
  chapterNumber: number;
  title: string;
  itemId: string;
  sentences: SyllableWord[][];
  fullSpeak: string;
}

export interface LesenWorkshopConfig {
  /** Konsonanten links auf der Silbenrutsche */
  consonants: string[];
  /** Vokale rechts auf der Silbenrutsche */
  vowels: string[];
  /** Silben für den antippbaren Silbenteppich */
  carpetSyllables: string[];
  /** Startet die Werkstatt in GROSSBUCHSTABEN (Kapitel 1 & 2)? */
  defaultUppercase?: boolean;
}

export interface LesenChapter {
  id: string;
  number: number; // 1–8
  name: string;
  shortName: string;
  subtitle: string;
  icon: string;
  catchphrase: string;
  story: string[];
  /** Neu gelernte Buchstaben dieses Kapitels */
  letters: LetterInfo[];
  /** Kurze Wiederholungs-Buchstaben aus früheren Kapiteln */
  reviewLetters: LetterInfo[];
  workshop: LesenWorkshopConfig;
  stations: [Station, Station, Station];
  storyBookPage: LesenStoryPage;
}

export function pickLetters(ids: readonly string[]): LetterInfo[] {
  return ids.map((id) => {
    const info = LETTERS[id];
    if (!info) throw new Error(`Unbekannter Buchstabe: ${id}`);
    return info;
  });
}

export function w(syllables: string[], speak?: string): SyllableWord {
  return speak ? { syllables, speak } : { syllables };
}
