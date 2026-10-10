import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ItemIcon } from './ItemIcon';
import { ITEM_DRAWINGS } from './item-drawings';
import { ITEM_DRAWINGS_A } from './ItemIconsA';
import { ITEM_DRAWINGS_B } from './ItemIconsB';
import { ITEM_DRAWINGS_C } from './ItemIconsC';
import { ITEM_DRAWINGS_D } from './ItemIconsD';

// Sachen-Icons Teil D für „Was passt nicht?“ und Schattenrätsel (docs/12 3.3, 3.4).
const NEW_ICONS = [
  'moehre',
  'gurke',
  'tomate',
  'paprika',
  'brokkoli',
  'birne',
  'erdbeere',
  'kirschen',
  'zitrone',
  'auto',
  'fahrrad',
  'zug',
  'flugzeug',
  'rakete',
  'hammer',
  'schere',
  'saege',
  'schraubenzieher',
  'pinsel',
  'pullover',
  'socke',
  'hose',
  'muetze',
  'schuh',
  'eule',
  'ente',
  'huhn',
  'hund',
  'katze',
  'schnecke',
  'schmetterling',
  'regenschirm',
  'sonne',
  'wolke',
  'mond',
  'baum',
  'blume',
];

describe('Sachen-Icons Teil D', () => {
  it('enthält genau die neuen Icons, ohne Überschneidung mit Teil A bis C', () => {
    expect([...ITEM_DRAWINGS_D.keys()].sort()).toEqual([...NEW_ICONS].sort());
    for (const id of NEW_ICONS) {
      expect(
        ITEM_DRAWINGS_A.has(id) || ITEM_DRAWINGS_B.has(id) || ITEM_DRAWINGS_C.has(id),
        id,
      ).toBe(false);
      expect(ITEM_DRAWINGS.has(id), id).toBe(true);
    }
  });

  it.each(NEW_ICONS)('%s rendert als eigene Zeichnung, nicht als Paket', (id) => {
    const { container } = render(<ItemIcon itemId={id} size={48} />);
    const svg = container.querySelector('svg');
    if (svg === null) throw new Error('kein svg gerendert');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('data-icon', id);
    expect(svg).toHaveAttribute('width', '48');
    // Flächen nur über Tokens, keine festen Farben
    const fills = [...container.querySelectorAll('[fill]')].map((e) => e.getAttribute('fill'));
    expect(fills.every((f) => f === 'none' || /^var\(--[a-z0-9-]+\)$/.test(f ?? ''))).toBe(true);
  });
});
