import { LESEN_CHAPTERS, LESEN_STATIONS, type LesenChapter } from '@/content/worlds/lesen/chapters';
import { mulberry32, shuffle } from '@/domain/random';
import type { Profile, Task } from '@/domain/types';
import { isCompleted, isUnlocked, worldOf } from './progress';

export function isLesenStationUnlocked(profile: Profile, stationIndex: number): boolean {
  if (profile.worlds[worldOf(profile)]?.unlockAll === true) return true;
  if (profile.worlds.lesen?.unlockAll === true) return true;
  return isUnlocked(profile, LESEN_STATIONS, stationIndex);
}

export function isChapterUnlocked(profile: Profile, chapterIndex: number): boolean {
  if (chapterIndex === 0) return true;
  return isLesenStationUnlocked(profile, chapterIndex * 3);
}

export function chapterStars(profile: Profile, chapter: LesenChapter): number {
  return chapter.stations.filter((s) => isCompleted(profile, 'lesen', s.id)).length;
}

/**
 * Stellt eine spielerische tägliche Wiederholungs-Runde (6 Aufgaben) zusammen:
 * Zieht ausschließlich aus den Kapiteln, die das Kind bereits freigeschaltet hat,
 * betont das aktuellste Kapitel und mischt gezielt frühere Silben & Wörter unter!
 */
export function buildLesenReviewTasks(profile: Profile, seed: number): Task[] {
  const unlockedChapters = LESEN_CHAPTERS.filter((_, index) => isChapterUnlocked(profile, index));
  const fallbackChapter = LESEN_CHAPTERS[0];
  const activePool =
    unlockedChapters.length > 0 ? unlockedChapters : fallbackChapter ? [fallbackChapter] : [];
  const latest = activePool.at(-1);
  if (!latest) return [];
  const earlier = activePool.slice(0, -1);

  const rng = mulberry32(seed);
  const latestTasks = shuffle(
    rng,
    latest.stations.flatMap((s) => s.tasks),
  );
  const earlierTasks = shuffle(
    rng,
    earlier.flatMap((c) => c.stations.flatMap((s) => s.tasks)),
  );

  // Wenn schon frühere Kapitel freigeschaltet sind: 3 aus dem aktuellen + 3 aus früheren Kapiteln!
  const chosen: Task[] =
    earlierTasks.length >= 3
      ? [...latestTasks.slice(0, 3), ...earlierTasks.slice(0, 3)]
      : [...latestTasks.slice(0, 6 - earlierTasks.length), ...earlierTasks];

  return shuffle(rng, chosen).map((task, idx) => ({
    ...task,
    id: `review-${String(seed)}-${String(idx)}-${task.id}`,
  }));
}
