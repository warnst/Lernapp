import type { TemplateId } from '@/domain/types';
import type { Generator } from '../types';
import { RIDDLE_GENERATORS } from '../riddles';
import { FORMEN_GENERATORS } from './formen';
import { KALENDER_GENERATORS } from './kalender';
import { KNOBELN_GENERATORS } from './knobeln';
import { MENGEN_ZAHLEN_GENERATORS } from './mengen-zahlen';
import { MUENZEN_LEGEN_GENERATORS } from './muenzen-legen';
import { PLUS_MINUS_GENERATORS } from './plus-minus';
import { MUENZEN_ZAEHLEN_GENERATORS } from './muenzen-zaehlen';
import { PREISE_ADDIEREN_GENERATORS } from './preise-addieren';
import { REICHT_DAS_GELD_GENERATORS } from './reicht-das-geld';
import { RUECKGELD_GENERATORS } from './rueckgeld';
import { SACHAUFGABEN_GENERATORS } from './sachaufgaben';
import { UHRZEIT_GENERATORS } from './uhrzeit';
import { VERDOPPELN_GENERATORS } from './verdoppeln';
import { ZAHLENREIHE_GENERATORS } from './zahlenreihe';

/** Alle Vorlagen inklusive Rätsel (docs/10 5.1), je Thema in der Reihenfolge leicht → schwer (docs/05). */
export const GENERATORS: readonly Generator[] = [
  ...MENGEN_ZAHLEN_GENERATORS,
  ...MUENZEN_ZAEHLEN_GENERATORS,
  ...PREISE_ADDIEREN_GENERATORS,
  ...RUECKGELD_GENERATORS,
  ...MUENZEN_LEGEN_GENERATORS,
  ...REICHT_DAS_GELD_GENERATORS,
  ...SACHAUFGABEN_GENERATORS,
  ...KNOBELN_GENERATORS,
  ...RIDDLE_GENERATORS,
  ...PLUS_MINUS_GENERATORS,
  ...VERDOPPELN_GENERATORS,
  ...ZAHLENREIHE_GENERATORS,
  ...UHRZEIT_GENERATORS,
  ...KALENDER_GENERATORS,
  ...FORMEN_GENERATORS,
];

export function generatorById(id: TemplateId): Generator | undefined {
  return GENERATORS.find((g) => g.id === id);
}
