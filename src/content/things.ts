// Zählbare Dinge für Mengen-Aufgaben (docs/05, Anhang B).

export interface Thing {
  id: string;
  singular: string;
  plural: string;
  /** Ort-Satz, z. B. „Am Ufer liegen Muscheln.“ */
  place: string;
}

export const THINGS: readonly Thing[] = [
  { id: 'muschel', singular: 'Muschel', plural: 'Muscheln', place: 'Am Ufer liegen Muscheln.' },
  { id: 'seestern', singular: 'Seestern', plural: 'Seesterne', place: 'Im Sand liegen Seesterne.' },
  { id: 'fisch', singular: 'Fisch', plural: 'Fische', place: 'Im Wasser schwimmen Fische.' },
  { id: 'krebs', singular: 'Krebs', plural: 'Krebse', place: 'Am Strand krabbeln Krebse.' },
  { id: 'stein', singular: 'Stein', plural: 'Steine', place: 'Am Ufer liegen Steine.' },
  { id: 'feder', singular: 'Feder', plural: 'Federn', place: 'Im Sand liegen Federn.' },
  { id: 'moewe', singular: 'Möwe', plural: 'Möwen', place: 'Am Himmel fliegen Möwen.' },
  { id: 'boot', singular: 'Boot', plural: 'Boote', place: 'Im Hafen liegen Boote.' },
];
