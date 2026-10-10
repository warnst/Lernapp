import { describe, expect, it } from 'vitest';
import { ITEM_DRAWINGS } from '@/illustrations/item-drawings';
import { ODD_CATEGORIES } from './odd';

describe('„Was passt nicht?“ (docs/12 3.3)', () => {
  it('jede Kategorie hat mindestens 4 Dinge und eine eindeutige ID', () => {
    for (const cat of ODD_CATEGORIES) expect(cat.things.length, cat.id).toBeGreaterThanOrEqual(4);
    const ids = ODD_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('alle Icons sind gezeichnet', () => {
    for (const thing of ODD_CATEGORIES.flatMap((c) => c.things))
      expect(ITEM_DRAWINGS.has(thing.icon), thing.icon).toBe(true);
  });

  it('jedes Ding steht in genau einer Kategorie (Icon und Name)', () => {
    const things = ODD_CATEGORIES.flatMap((c) => c.things);
    const icons = things.map((t) => t.icon);
    const names = things.map((t) => t.name);
    expect(new Set(icons).size).toBe(icons.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('Sätze sind vollständig: isA nennt das Ding und endet mit Punkt', () => {
    for (const cat of ODD_CATEGORIES) {
      expect(cat.are, cat.id).toMatch(/^sind /);
      for (const thing of cat.things) {
        expect(thing.isA, thing.icon).toMatch(/^(Der|Die|Das) .+\.$/);
        expect(thing.isA, thing.icon).toContain(thing.name);
      }
    }
  });

  it('from liegt zwischen 1 und 3, Stufe 1 hat mindestens 4 Kategorien', () => {
    for (const cat of ODD_CATEGORIES) {
      expect(cat.from, cat.id).toBeGreaterThanOrEqual(1);
      expect(cat.from, cat.id).toBeLessThanOrEqual(3);
    }
    expect(ODD_CATEGORIES.filter((c) => c.from === 1).length).toBeGreaterThanOrEqual(4);
  });
});
