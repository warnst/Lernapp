import type { ReactNode } from 'react';
import { ITEM_DRAWINGS_A } from './ItemIconsA';
import { ITEM_DRAWINGS_B } from './ItemIconsB';
import { ITEM_DRAWINGS_C } from './ItemIconsC';

// Alle Sachen-Zeichnungen (viewBox 0 0 64 64), Schlüssel = itemId aus docs/04, 05 und 11.
export const ITEM_DRAWINGS: ReadonlyMap<string, ReactNode> = new Map([
  ...ITEM_DRAWINGS_A,
  ...ITEM_DRAWINGS_B,
  ...ITEM_DRAWINGS_C,
]);
