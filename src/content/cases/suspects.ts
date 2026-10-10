import type { Suspect } from './types';

// Verdächtige für die Detektivfälle (docs/12 3.9). Die Merkmale (trait) sind das, was die Kinder
// auf der Karte sehen. Jeder Hinweis bezieht sich wörtlich auf ein Merkmal (Test in cases.test.ts).

export const MIA_FEDERN_FLIEGEN: Suspect = {
  id: 'mia',
  name: 'Möwe Mia',
  animal: 'moewe',
  trait: 'hat weiße Federn und kann fliegen',
};

export const MIA_FEDERN_SCHNABEL: Suspect = {
  id: 'mia',
  name: 'Möwe Mia',
  animal: 'moewe',
  trait: 'hat weiße Federn und einen gelben Schnabel',
};

export const KALLE_SCHEREN: Suspect = {
  id: 'kalle',
  name: 'Krebs Kalle',
  animal: 'krebs',
  trait: 'hat rote Scheren und läuft seitwärts',
};

export const RUDI_SCHNURRBART: Suspect = {
  id: 'rudi',
  name: 'Robbe Rudi',
  animal: 'robbe',
  trait: 'hat einen Schnurrbart und Flossen',
};

export const RUDI_FLOSSEN: Suspect = {
  id: 'rudi',
  name: 'Robbe Rudi',
  animal: 'robbe',
  trait: 'hat breite Flossen und ein glattes Fell',
};

export const PAUL_FLIEGT_NICHT: Suspect = {
  id: 'paul',
  name: 'Pinguin Paul',
  animal: 'pinguin',
  trait: 'hat einen schwarzen Frack und kann nicht fliegen',
};

export const PAUL_WATSCHELT: Suspect = {
  id: 'paul',
  name: 'Pinguin Paul',
  animal: 'pinguin',
  trait: 'hat einen schwarzen Frack und watschelt',
};

export const FINE_LANGE_BEINE: Suspect = {
  id: 'fine',
  name: 'Flamingo Fine',
  animal: 'flamingo',
  trait: 'hat rosa Federn und lange Beine',
};

export const FINE_EIN_BEIN: Suspect = {
  id: 'fine',
  name: 'Flamingo Fine',
  animal: 'flamingo',
  trait: 'hat rosa Federn und steht auf einem Bein',
};

export const TILDA_KURZE_BEINE: Suspect = {
  id: 'tilda',
  name: 'Schildkröte Tilda',
  animal: 'schildkroete',
  trait: 'hat einen Panzer und kurze Beine',
};

export const TILDA_LANGSAM: Suspect = {
  id: 'tilda',
  name: 'Schildkröte Tilda',
  animal: 'schildkroete',
  trait: 'hat einen grünen Panzer und geht ganz langsam',
};

export const SINA: Suspect = {
  id: 'sina',
  name: 'Seepferdchen Sina',
  animal: 'seepferdchen',
  trait: 'hat einen Ringelschwanz und eine lange Schnauze',
};

export const DINO_PFEIFT: Suspect = {
  id: 'dino',
  name: 'Delfin Dino',
  animal: 'delfin',
  trait: 'hat eine Rückenflosse und pfeift laut',
};

export const DINO_SCHNELL: Suspect = {
  id: 'dino',
  name: 'Delfin Dino',
  animal: 'delfin',
  trait: 'hat eine Rückenflosse und schwimmt schnell',
};

export const DINO_SPRINGT: Suspect = {
  id: 'dino',
  name: 'Delfin Dino',
  animal: 'delfin',
  trait: 'hat eine Rückenflosse und springt hoch',
};

export const STELLA_PLATT: Suspect = {
  id: 'stella',
  name: 'Seestern Stella',
  animal: 'seestern',
  trait: 'hat fünf Arme und ist ganz platt',
};

export const STELLA_SAUGNAEPFE: Suspect = {
  id: 'stella',
  name: 'Seestern Stella',
  animal: 'seestern',
  trait: 'hat fünf Arme und kleine Saugnäpfe',
};
