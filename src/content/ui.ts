import type { Stufe, WorldId } from '@/domain/types';

// Texte der Oberfläche (docs/01 Abschnitt 4–5, docs/09 Abschnitt 3–4). Wörtlich, wo die Docs sie vorgeben.

export const UI = {
  nav: { adventure: 'Abenteuer', practice: 'Üben', treasures: 'Schätze', label: 'Hauptmenü' },
  header: {
    adults: 'Für Erwachsene',
    whoPlays: 'Wer spielt?',
    stars: (count: number, total: number) => `${String(count)} von ${String(total)}`,
    starsLabel: (count: number, total: number) => `${String(count)} von ${String(total)} Sternen`,
  },
  map: {
    firstVisit: {
      schatzinsel: 'Hallo! Ich bin Kiko. Ich kenne eine geheime Schatzinsel. Kommst du mit?',
      'kleine-bucht': 'Hallo! Ich bin Kiko. Komm mit in die kleine Bucht!',
    } satisfies Record<WorldId, string>,
    greeting: (who: string) => `Hallo ${who}! Wohin geht's heute?`,
    greetingAnimal: (small: string) => `Hallo, ${small}! Wohin geht's heute?`,
    next: (title: string) => `Weiter: ${title}`,
    allDone: 'Schatz ansehen',
    locked: 'Der Weg ist noch im Nebel. Schaffe zuerst die Station davor!',
    stationLabel: (n: number, title: string, state: 'done' | 'current' | 'open' | 'locked') =>
      `Station ${String(n)}: ${title}${
        { done: ', geschafft', current: ', als Nächstes', open: '', locked: ', noch im Nebel' }[
          state
        ]
      }`,
  },
  sheet: {
    title: (n: number, title: string) => `Station ${String(n)} · ${title}`,
    minutes: (n: number) => `etwa ${String(n)} Minuten`,
    skill: (skill: string) => `Hier übst du: ${skill}`,
    start: "Los geht's!",
    resume: 'Weiterspielen',
    again: 'Noch einmal spielen',
    morePractice: 'Mehr davon üben',
    close: 'Schließen',
    read: 'Vorlesen',
  },
  whoPlays: { title: 'Wer spielt?' },
  setup: {
    title: 'Mathe-Abenteuer',
    welcome: 'Mathe-Abenteuer für Kinder von 5 bis 8 Jahren. Richten wir kurz ein, wer spielt.',
    start: 'Kind anlegen',
    name: 'Name (optional)',
    animal: 'Tier wählen',
    age: 'Wie alt ist das Kind?',
    recommend: (stufe: string) =>
      `Wir empfehlen die Stufe ${stufe}. Sie können das jederzeit ändern.`,
    explainLink: 'Was bedeuten die Stufen?',
    addAnother: 'Noch ein Kind hinzufügen',
    done: 'Fertig',
    save: 'Kind speichern',
    added: (who: string) => `${who} ist angelegt.`,
    full: 'Es können höchstens 6 Kinder angelegt werden.',
  },
  /** Die Stufen in einfachen Worten (docs/09 Abschnitt 1). */
  stufen: {
    1: 'Die kleine Bucht: Mengen und Zahlen bis 10, Cent-Münzen bis 10 Cent, Münzen erkennen. Alles wird automatisch vorgelesen.',
    2: 'Schatzinsel: Zahlen bis 20, nur ganze Euro, einfaches Rückgeld. Wird automatisch vorgelesen.',
    3: 'Schatzinsel: Euro und Cent bis 10 €. Vorlesen per Knopf.',
    4: 'Schatzinsel: Euro und Cent bis 100 €, Malnehmen mit Preisen, bis zu 3 Rechenschritte.',
  } satisfies Record<Stufe, string>,
  gate: {
    question: (a: number, b: number) => `Für Erwachsene: Wie viel ist ${String(a)} × ${String(b)}?`,
    answer: 'Ergebnis',
    submit: 'Öffnen',
    retry: 'Das Ergebnis passt nicht. Bitte noch einmal rechnen.',
    back: 'Zurück zum Spiel',
  },
  adults: {
    title: 'Für Erwachsene',
    children: 'Kinder',
    addChild: 'Kind hinzufügen',
    edit: 'Bearbeiten',
    print: 'Drucken',
    printLink: 'Arbeitsblätter und Urkunden drucken',
    backup: 'Daten sichern',
    download: 'Sicherung herunterladen',
    upload: 'Sicherung laden',
    imported: 'Die Sicherung wurde geladen.',
    importFailed: 'Diese Datei ist keine gültige Sicherung. Es wurde nichts geändert.',
    notes: 'Hinweise',
    storageNote:
      'Der Fortschritt wird nur auf diesem Gerät gespeichert. Mit ‚Sicherung herunterladen‘ können Sie ihn aufbewahren.',
    back: 'Zurück zum Spiel',
    stufe: 'Stufe',
    name: 'Name',
    animal: 'Tier',
    unlockAll: 'Alle Stationen freischalten',
    unlockAllOn: 'Alle Stationen sind freigeschaltet.',
    lockAgain: 'Freischaltung aufheben',
    reset: 'Fortschritt zurücksetzen',
    resetConfirm: (who: string) =>
      `Wirklich alles von ${who} zurücksetzen? Sterne, Fundstücke und Perlen werden gelöscht.`,
    resetDo: 'Zurücksetzen',
    delete: 'Profil löschen',
    deleteConfirm: (who: string) => `Das Profil von ${who} wirklich löschen?`,
    deleteDo: 'Löschen',
    cancel: 'Abbrechen',
    toList: 'Zur Übersicht',
    unknownChild: 'Dieses Kind gibt es nicht mehr.',
  },
  placeholder: { text: 'Hier wird noch gebaut.', back: 'Zur Karte' },
} as const;
