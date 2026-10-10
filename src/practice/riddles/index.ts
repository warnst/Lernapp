import type { Generator } from '../types';
import { balance } from './balance';
import { code } from './code';
import { logic } from './logic';
import { sequence } from './sequence';
import { triangle } from './triangle';
import { wall } from './wall';

/** Rätsel-Vorlagen (docs/10 Abschnitt 5 und 5.1), IDs wie ihr Typ; Reihenfolge leicht → schwer. */
export const RIDDLE_GENERATORS: readonly Generator[] = [
  sequence,
  balance,
  wall,
  code,
  triangle,
  logic,
];
