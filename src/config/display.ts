import type { Stufe } from '@/domain/types';

/** Schriftgröße je Stufe über --text-scale am <body> (docs/02 6.4, docs/09 Abschnitt 7). */
export const TEXT_SCALE: Record<Stufe, number> = { 1: 1.2, 2: 1.1, 3: 1, 4: 1 };
