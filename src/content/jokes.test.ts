import { describe, expect, it } from 'vitest';
import { JOKE_CATEGORIES, JOKES } from './jokes';

describe('Witzekiste (docs/12 4.2)', () => {
  it('IDs eindeutig, Frage mit ? und Antwort vorhanden, bekannte Kategorie', () => {
    const ids = JOKES.map((joke) => joke.id);
    expect(new Set(ids).size).toBe(ids.length);
    const categories = JOKE_CATEGORIES.map((c) => c.id);
    for (const joke of JOKES) {
      expect(joke.question, joke.id).toMatch(/\?(“)?$/);
      expect(joke.answer.length, joke.id).toBeGreaterThan(2);
      expect(categories, joke.id).toContain(joke.category);
    }
  });

  it('genug Witze für jede Stufe, damit sich nichts schnell wiederholt', () => {
    for (const stufe of [1, 2, 3, 4]) {
      expect(JOKES.filter((joke) => joke.from <= stufe).length).toBeGreaterThanOrEqual(15);
    }
  });
});
