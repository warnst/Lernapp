import type { TemplateId } from '@/domain/types';
import type { Generator } from '../types';
import { KNOBELN_GENERATORS } from './knobeln';
import { MENGEN_ZAHLEN_GENERATORS } from './mengen-zahlen';
import { MUENZEN_LEGEN_GENERATORS } from './muenzen-legen';
import { MUENZEN_ZAEHLEN_GENERATORS } from './muenzen-zaehlen';
import { PREISE_ADDIEREN_GENERATORS } from './preise-addieren';
import { REICHT_DAS_GELD_GENERATORS } from './reicht-das-geld';
import { RUECKGELD_GENERATORS } from './rueckgeld';
import { SACHAUFGABEN_GENERATORS } from './sachaufgaben';

/** Alle Vorlagen, je Thema in der Reihenfolge leicht → schwer (docs/05). */
export const GENERATORS: readonly Generator[] = [
  ...MENGEN_ZAHLEN_GENERATORS,
  ...MUENZEN_ZAEHLEN_GENERATORS,
  ...PREISE_ADDIEREN_GENERATORS,
  ...RUECKGELD_GENERATORS,
  ...MUENZEN_LEGEN_GENERATORS,
  ...REICHT_DAS_GELD_GENERATORS,
  ...SACHAUFGABEN_GENERATORS,
  ...KNOBELN_GENERATORS,
];

export function generatorById(id: TemplateId): Generator | undefined {
  return GENERATORS.find((g) => g.id === id);
}
