import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import type { Stufe } from '@/domain/types';
import { ITEMS, itemById } from './items';
import { WORLDS } from './worlds';

describe('Sachen-Katalog (docs/05 3.1)', () => {
  it('IDs sind eindeutig', () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('alle itemIds aus den Stationen und aus bind stehen im Katalog', () => {
    const tasks = Object.values(WORLDS).flatMap((w) => w.stations.flatMap((s) => s.tasks));
    const ids = new Set<string>();
    for (const task of tasks) {
      for (const id of Object.values(task.variant?.bind ?? {})) ids.add(id);
      if (task.scene.kind === 'items') for (const item of task.scene.items) ids.add(item.itemId);
      for (const part of task.parts) {
        if (part.answer.type === 'select')
          for (const item of part.answer.items) ids.add(item.itemId);
        if (part.answer.type === 'order') {
          for (const entry of part.answer.entries) if (entry.itemId) ids.add(entry.itemId);
        }
      }
    }
    for (const id of ids) expect(() => itemById(id), id).not.toThrow();
  });

  it('jeder Preisbereich liegt innerhalb von maxPrice und ist sinnvoll', () => {
    for (const item of ITEMS) {
      for (const [stufe, range] of Object.entries(item.prices)) {
        const cfg = STUFEN[Number(stufe) as Stufe]; // Schlüssel sind Stufen 1–4
        expect(range[0], item.id).toBeLessThanOrEqual(range[1]);
        expect(range[1], item.id).toBeLessThanOrEqual(cfg.money.maxPrice);
      }
    }
  });

  it('Artikel passen zum Fall', () => {
    for (const item of ITEMS) {
      expect(item.nom, item.id).toMatch(/^(ein|eine) /);
      expect(item.def, item.id).toMatch(/^(der|die|das) /);
      if (item.nom.startsWith('ein ') && item.def.startsWith('der '))
        expect(item.akk).toMatch(/^einen /);
      else expect(item.akk).toBe(item.nom);
    }
    expect(() => itemById('gibt-es-nicht')).toThrow();
  });
});
