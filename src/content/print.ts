import type { WorldId } from '@/domain/types';

// Texte der Druckseite und der Arbeitsblätter (docs/06). Erwachsenen-Ansprache mit „Sie“.

export const PRINT = {
  title: 'Arbeitsblätter drucken',
  forWhom: 'Für wen?',
  noChild: 'Ohne Kind',
  stufe: 'Stufe',
  what: 'Was drucken?',
  stations: 'Stationen',
  selectAll: 'Alle auswählen',
  otherNumbers: 'Andere Zahlen',
  practice: 'Übungsblatt',
  practiceNone: 'Kein Übungsblatt',
  practiceTopic: 'Thema',
  rollPractice: 'Neue Aufgaben würfeln',
  riddles: 'Rätselblatt (6 Rätsel)',
  rollRiddles: 'Neue Rätsel würfeln',
  certificate: 'Urkunde',
  certificateLocked: 'Die Urkunde gibt es, wenn alle Stationen der Welt geschafft sind.',
  certificateAnyway: 'trotzdem erlauben',
  options: 'Optionen',
  solutions: 'Lösungsblatt anhängen',
  nameField: 'Name- und Datumsfeld',
  size: 'Schriftgröße',
  sizeNormal: 'Normal',
  sizeLarge: 'Groß',
  sizeLargeFixed: 'Bei Stufe Muschel immer groß.',
  preview: 'Vorschau',
  empty: 'Wählen Sie oben aus, was gedruckt werden soll.',
  print: 'Drucken',
  iosHint:
    'Drucken klappt am besten im Browser. Öffne die Seite in Safari und tippe auf Teilen → Drucken.',

  // Arbeitsblatt
  name: 'Name:',
  date: 'Datum:',
  stationTitle: (n: number, title: string) => `Station ${String(n)} · ${title}`,
  workings: 'Rechenweg',
  howWasIt: 'Wie ging es dir?',
  /** page nur bei aufgeteilten Bucht-Blättern; sonst kann der Browser umbrechen */
  footerStation: (world: string, n: number, page?: number) =>
    `${world} · Station ${String(n)}${page === undefined ? '' : ` · Seite ${String(page)}`}`,
  footerVariant: (stufe: string, seed: number) => `Stufe ${stufe} · Nr. ${String(seed)}`,
  practiceTitle: (topic: string, stufe: string) => `Übungsblatt · ${topic} · Stufe ${stufe}`,
  riddleTitle: (stufe: string) => `Rätselblatt · Stufe ${stufe}`,
  footerSheet: (title: string, seed: number) => `${title} · Nr. ${String(seed)}`,

  // Anweisungen vor der Frage (docs/06 4)
  cross: 'Kreuze an.',
  drawCoins: 'Male die Münzen in den Kasten.',
  drawExact: (n: number) =>
    n === 1 ? 'Male genau eine Münze.' : `Male genau ${String(n)} Münzen.`,
  drawVariants: 'Male die Münzen in die Kästen.',
  variant: (n: number) => `${String(n)}. Möglichkeit`,
  orderNumbers: (n: number) =>
    `Schreibe ${Array.from({ length: n }, (_, i) => String(i + 1)).join(', ')} in die Kästchen. 1 = am wenigsten.`,
  circleSum: 'Kreise die Sachen ein.',
  circleAffordable: 'Kreise alle Sachen ein, für die das Geld reicht.',
  fillGrid: 'Schreibe die Zahlen in die leeren Felder.',
  answer: 'Antwort:',
  number: 'Zahl:',
  euro: '€',
  cent: 'Cent',
  /** Bild-Symbole der Bucht-Blätter (docs/06 1) */
  activity: { cross: 'Kreise ein', write: 'Schreibe die Zahl', coins: 'Male die Münzen' },

  // Lösungsblatt
  solutionsTitle: 'Lösungen für Erwachsene',
  solutionsHint:
    'Einen Stern gibt es fürs Bearbeiten, nicht für Fehlerfreiheit. Fragen Sie lieber: Wie hast du gerechnet?',
  colNumber: 'Nr.',
  colTask: 'Aufgabe',
  colSolution: 'Lösung',
  colWorkings: 'Rechenweg',

  // Urkunde (docs/06 7)
  certTitle: 'URKUNDE',
  certExplored: {
    schatzinsel: 'hat die geheime Schatzinsel erkundet!',
    'kleine-bucht': 'hat die kleine Bucht erkundet!',
  } satisfies Record<WorldId, string>,
  certSkills: {
    schatzinsel:
      'Du kannst jetzt: Münzen zählen · Preise addieren · Rückgeld berechnen · Beträge legen · prüfen, ob das Geld reicht · Sachaufgaben lösen · knobeln',
    'kleine-bucht':
      'Du kannst jetzt: Zählen · Münzen kennen · mit Cent bezahlen · vergleichen · Rätsel lösen',
  } satisfies Record<WorldId, string>,
  certSignature: 'Kiko',
} as const;
