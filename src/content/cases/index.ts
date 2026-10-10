import {
  DINO_PFEIFT,
  DINO_SCHNELL,
  DINO_SPRINGT,
  FINE_EIN_BEIN,
  FINE_LANGE_BEINE,
  KALLE_SCHEREN,
  MIA_FEDERN_FLIEGEN,
  MIA_FEDERN_SCHNABEL,
  PAUL_FLIEGT_NICHT,
  PAUL_WATSCHELT,
  RUDI_FLOSSEN,
  RUDI_SCHNURRBART,
  SINA,
  STELLA_PLATT,
  STELLA_SAUGNAEPFE,
  TILDA_KURZE_BEINE,
  TILDA_LANGSAM,
} from './suspects';
import type { DetectiveCase } from './types';

// Die 6 Detektivfälle zum Start (docs/12 3.9), in dieser Reihenfolge.
// Aufbau jedes Falls (geprüft in cases.test.ts):
// - Hinweis 1 und 2 entlasten nur einen der ersten 3 Verdächtigen, Hinweis 3 den zweiten.
// - Hinweis 4 entlastet den 4. Verdächtigen, Hinweis 5 bestätigt den Täter.
// So bleibt es auf jeder Stufe bis zum letzten Hinweis spannend.

export type { DetectiveCase, Suspect } from './types';

export const CASES: readonly DetectiveCase[] = [
  {
    id: 'keks',
    title: 'Der verschwundene Keks',
    intro: 'Krümels Keks ist verschwunden! Nur ein paar Krümel liegen im Sand.',
    sceneIcon: 'keks',
    suspects: [KALLE_SCHEREN, MIA_FEDERN_FLIEGEN, RUDI_SCHNURRBART, PAUL_FLIEGT_NICHT],
    culprit: 'mia',
    clues: [
      {
        id: 'keine-scheren',
        text: 'Im Sand ist kein Abdruck von Scheren. Der Täter hat keine Scheren.',
        short: 'Kein Scheren-Abdruck!',
        icon: 'krebs',
        excludes: ['kalle'],
      },
      {
        id: 'geradeaus',
        text: 'Die Spur im Sand geht geradeaus. Der Täter läuft nicht seitwärts.',
        short: 'Die Spur geht geradeaus!',
        icon: 'fernglas',
        excludes: ['kalle'],
      },
      {
        id: 'kein-barthaar',
        text: 'Am Teller hängt kein Barthaar. Der Täter hat keinen Schnurrbart.',
        short: 'Kein Barthaar!',
        icon: 'kekse',
        excludes: ['rudi'],
      },
      {
        id: 'felsen',
        text: 'Die Krümel liegen hoch oben auf dem Felsen. Der Täter kann fliegen.',
        short: 'Krümel oben auf dem Felsen!',
        icon: 'stein',
        excludes: ['kalle', 'rudi', 'paul'],
      },
      {
        id: 'weisse-feder',
        text: 'Am Tatort liegt eine weiße Feder. Der Täter hat weiße Federn.',
        short: 'Eine weiße Feder!',
        icon: 'feder',
        excludes: ['kalle', 'rudi', 'paul'],
      },
    ],
    resolution:
      'Möwe Mia wollte den Keks nur mit ihren Küken teilen. Krümel backt einfach neue, für alle!',
    bookLine: 'Möwe Mia hat den Keks mit ihren Küken geteilt.',
  },
  {
    id: 'muschel',
    title: 'Die bemalte Muschel',
    intro: 'Über Nacht ist eine Muschel ganz bunt angemalt! Wer war der heimliche Maler?',
    sceneIcon: 'muschel',
    suspects: [DINO_PFEIFT, STELLA_PLATT, FINE_LANGE_BEINE, TILDA_KURZE_BEINE],
    culprit: 'fine',
    clues: [
      {
        id: 'kein-pfeifen',
        text: 'In der Nacht hat niemand ein Pfeifen gehört. Der Täter pfeift nicht.',
        short: 'Kein Pfeifen in der Nacht!',
        icon: 'vogelpfeife',
        excludes: ['dino'],
      },
      {
        id: 'keine-flosse',
        text: 'Im Sand ist keine Spur von einer Flosse. Der Täter hat keine Rückenflosse.',
        short: 'Keine Flossen-Spur!',
        icon: 'eimer',
        excludes: ['dino'],
      },
      {
        id: 'fussspuren',
        text: 'Neben der Muschel sind Fußspuren. Der Täter hat Beine.',
        short: 'Fußspuren im Sand!',
        icon: 'muschel',
        excludes: ['dino', 'stella'],
      },
      {
        id: 'rosa-feder',
        text: 'Neben der Muschel liegt eine rosa Feder. Der Täter hat rosa Federn.',
        short: 'Eine rosa Feder!',
        icon: 'feder',
        excludes: ['dino', 'stella', 'tilda'],
      },
      {
        id: 'grosse-schritte',
        text: 'Die Fußspuren sind weit auseinander. Der Täter hat lange Beine.',
        short: 'Riesige Schritte!',
        icon: 'fernglas',
        excludes: ['dino', 'stella', 'tilda'],
      },
    ],
    resolution:
      'Flamingo Fine hat die Muschel für Kiko bemalt. Es sollte eine Überraschung sein! Kiko freut sich riesig.',
    bookLine: 'Flamingo Fine hat Kiko mit einer bunten Muschel überrascht.',
  },
  {
    id: 'fussspuren',
    title: 'Nasse Fußspuren im Leuchtturm',
    intro: 'Im Leuchtturm sind nasse Fußspuren! Sie führen die Treppe hinauf.',
    sceneIcon: 'laterne',
    suspects: [RUDI_FLOSSEN, FINE_EIN_BEIN, KALLE_SCHEREN, SINA],
    culprit: 'rudi',
    clues: [
      {
        id: 'keine-feder',
        text: 'Auf der Treppe liegt keine Feder. Der Täter hat keine Federn.',
        short: 'Keine Feder auf der Treppe!',
        icon: 'laterne',
        excludes: ['fine'],
      },
      {
        id: 'zwei-abdruecke',
        text: 'Auf jeder Stufe sind zwei Abdrücke. Der Täter steht nicht auf einem Bein.',
        short: 'Immer zwei Abdrücke!',
        icon: 'kerze',
        excludes: ['fine'],
      },
      {
        id: 'kein-kratzer',
        text: 'Am Geländer ist kein Kratzer von Scheren. Der Täter hat keine Scheren.',
        short: 'Kein Scheren-Kratzer!',
        icon: 'krebs',
        excludes: ['kalle'],
      },
      {
        id: 'kein-kringel',
        text: 'Auf dem Boden ist kein Kringel von einem Ringelschwanz. Der Täter hat keinen Ringelschwanz.',
        short: 'Kein Kringel am Boden!',
        icon: 'seil',
        excludes: ['sina'],
      },
      {
        id: 'breite-spuren',
        text: 'Die nassen Spuren sind breit und flach. Der Täter hat breite Flossen.',
        short: 'Breite, nasse Spuren!',
        icon: 'wasser',
        excludes: ['fine', 'kalle', 'sina'],
      },
    ],
    resolution:
      'Robbe Rudi war im Leuchtturm. Draußen hat es so doll geregnet! Er hat nur ein trockenes Plätzchen gesucht.',
    bookLine: 'Robbe Rudi hat im Leuchtturm Schutz vor dem Regen gesucht.',
  },
  {
    id: 'feder',
    title: 'Wo ist Kikos Feder?',
    intro: 'Kikos schönste Feder ist weg! Gestern lag sie noch in seinem Nest.',
    sceneIcon: 'feder',
    suspects: [MIA_FEDERN_SCHNABEL, KALLE_SCHEREN, TILDA_LANGSAM, DINO_SCHNELL],
    culprit: 'kalle',
    clues: [
      {
        id: 'kein-schnabel',
        text: 'Am Nest ist kein Abdruck von einem Schnabel. Der Täter hat keinen Schnabel.',
        short: 'Kein Schnabel-Abdruck!',
        icon: 'moewe',
        excludes: ['mia'],
      },
      {
        id: 'keine-weisse-feder',
        text: 'Am Nest liegt keine weiße Feder. Der Täter hat keine weißen Federn.',
        short: 'Keine weiße Feder!',
        icon: 'feder',
        excludes: ['mia'],
      },
      {
        id: 'schnelle-spur',
        text: 'Kiko hat jemanden schnell weglaufen sehen. Der Täter geht nicht langsam.',
        short: 'Jemand war schnell!',
        icon: 'fernglas',
        excludes: ['tilda'],
      },
      {
        id: 'keine-flosse',
        text: 'Im Sand ist keine Spur von einer Flosse. Der Täter hat keine Rückenflosse.',
        short: 'Keine Flossen-Spur!',
        icon: 'eimer',
        excludes: ['dino'],
      },
      {
        id: 'knick',
        text: 'Die Feder hat einen kleinen Knick, wie von einer Schere. Der Täter hat Scheren.',
        short: 'Ein Knick in der Feder!',
        icon: 'krebs',
        excludes: ['mia', 'tilda', 'dino'],
      },
    ],
    resolution:
      'Krebs Kalle hat die Feder am Strand gefunden. Er hat sie als Segel für sein Floß benutzt! Jetzt bringt er sie zurück und lädt Kiko zur Floßfahrt ein.',
    bookLine: 'Krebs Kalle hat Kikos Feder als Segel für sein Floß benutzt.',
  },
  {
    id: 'geheimbrief',
    title: 'Der Geheimbrief im Sand',
    intro: 'Im Sand steckt ein Brief in Geheimschrift! Wer hat ihn geschrieben?',
    sceneIcon: 'postkarte',
    suspects: [TILDA_LANGSAM, PAUL_WATSCHELT, SINA, DINO_SPRINGT],
    culprit: 'paul',
    clues: [
      {
        id: 'kein-panzer',
        text: 'Neben dem Brief ist kein Abdruck von einem Panzer. Der Täter hat keinen Panzer.',
        short: 'Kein Panzer-Abdruck!',
        icon: 'stein',
        excludes: ['tilda'],
      },
      {
        id: 'davongeflitzt',
        text: 'Kiko hat jemanden davonflitzen sehen. Der Täter geht nicht langsam.',
        short: 'Jemand ist geflitzt!',
        icon: 'fernglas',
        excludes: ['tilda'],
      },
      {
        id: 'kein-kringel',
        text: 'Im Sand ist kein Kringel von einem Ringelschwanz. Der Täter hat keinen Ringelschwanz.',
        short: 'Kein Kringel im Sand!',
        icon: 'seil',
        excludes: ['sina'],
      },
      {
        id: 'keine-flosse',
        text: 'Im Sand ist keine Spur von einer Flosse. Der Täter hat keine Rückenflosse.',
        short: 'Keine Flossen-Spur!',
        icon: 'eimer',
        excludes: ['dino'],
      },
      {
        id: 'watschelspuren',
        text: 'Neben dem Brief sind Watschel-Spuren. Der Täter watschelt.',
        short: 'Watschel-Spuren!',
        icon: 'postkarte',
        excludes: ['tilda', 'sina', 'dino'],
      },
    ],
    resolution:
      'Pinguin Paul hat den Brief geschrieben. Es ist eine Einladung zu Kikos Überraschungsfest! Alle feiern zusammen.',
    bookLine: 'Pinguin Paul hat Kiko zum Überraschungsfest eingeladen.',
  },
  {
    id: 'glocke',
    title: 'Die Glocke um Mitternacht',
    intro: 'Um Mitternacht hat die Turmglocke geläutet: Bimm, bamm! Aber niemand war zu sehen.',
    sceneIcon: 'stern',
    suspects: [STELLA_SAUGNAEPFE, PAUL_WATSCHELT, DINO_PFEIFT, MIA_FEDERN_SCHNABEL],
    culprit: 'stella',
    clues: [
      {
        id: 'keine-watschelspuren',
        text: 'Auf der Treppe sind keine Watschel-Spuren. Der Täter watschelt nicht.',
        short: 'Keine Watschel-Spuren!',
        icon: 'laterne',
        excludes: ['paul'],
      },
      {
        id: 'nichts-schwarzes',
        text: 'Im Turm hat niemand etwas Schwarzes gesehen. Der Täter hat keinen schwarzen Frack.',
        short: 'Nichts Schwarzes gesehen!',
        icon: 'fernglas',
        excludes: ['paul'],
      },
      {
        id: 'kein-pfeifen',
        text: 'In der Nacht hat niemand ein Pfeifen gehört. Der Täter pfeift nicht.',
        short: 'Kein Pfeifen in der Nacht!',
        icon: 'vogelpfeife',
        excludes: ['dino'],
      },
      {
        id: 'kein-schnabel',
        text: 'Am Glockenseil ist kein Abdruck von einem Schnabel. Der Täter hat keinen Schnabel.',
        short: 'Kein Schnabel-Abdruck!',
        icon: 'seil',
        excludes: ['mia'],
      },
      {
        id: 'saugnapf',
        text: 'Am Glockenseil sind winzige runde Abdrücke. Der Täter hat kleine Saugnäpfe.',
        short: 'Winzige runde Abdrücke!',
        icon: 'seestern',
        excludes: ['paul', 'dino', 'mia'],
      },
    ],
    resolution:
      'Seestern Stella wollte die Glocke nur einmal ansehen. Sie hat sich ans Seil geklebt, und der Wind hat sie hin und her geschaukelt. Bimm, bamm!',
    bookLine: 'Seestern Stella und der Wind haben die Glocke geläutet.',
  },
];

/** Kurze Detektivsätze für Kiko zwischen den Rätseln */
export const DETECTIVE_LINES: readonly string[] = [
  'Hmm, eine Spur! Wir kommen der Sache näher.',
  'Gut gemacht, Partner! Weiter geht es.',
  'Ich spüre es in meinen Federn: Wir sind ganz nah dran!',
  'Lupe raus! Hier gibt es noch mehr zu entdecken.',
  'Ein guter Detektiv gibt nie auf. Du auch nicht!',
  'Spannend! Wer war es nur?',
  'Noch ein Rätsel, dann wissen wir mehr.',
  'Psst! Wir schauen ganz genau hin.',
];
