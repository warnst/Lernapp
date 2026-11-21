import type { Station } from '@/domain/types';
import { CHAPTERS_1_TO_4 } from './chapters-1-4';
import { CHAPTERS_5_TO_8 } from './chapters-5-8';
import type { LesenChapter } from './types';

export type { LesenChapter } from './types';

export const LESEN_CHAPTERS: LesenChapter[] = [...CHAPTERS_1_TO_4, ...CHAPTERS_5_TO_8];

export const LESEN_STATIONS: Station[] = LESEN_CHAPTERS.flatMap((chapter) => chapter.stations);

export function chapterById(id: string): LesenChapter | undefined {
  return LESEN_CHAPTERS.find((chapter) => chapter.id === id);
}

export function chapterOfStation(stationId: string): LesenChapter | undefined {
  return LESEN_CHAPTERS.find((chapter) => chapter.stations.some((s) => s.id === stationId));
}
