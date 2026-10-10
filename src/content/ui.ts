import type { PracticeTopicId, Stufe, WorldId } from '@/domain/types';

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
    bonusSolved: ', Bonus-Rätsel gelöst',
  },
  sheet: {
    title: (n: number, title: string) => `Station ${String(n)} · ${title}`,
    minutes: (n: number) => `etwa ${String(n)} Minuten`,
    skill: (skill: string) => `Hier übst du: ${skill}`,
    start: "Los geht's!",
    resume: 'Weiterspielen',
    again: 'Noch einmal spielen',
    morePractice: 'Mehr davon üben',
    bonus: 'Bonus-Rätsel',
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
    /** docs/11, Finale der Bucht (wörtlich) */
    bayDone: 'Die kleine Bucht ist geschafft. Vielleicht passt jetzt die Stufe Seestern?',
  },
  placeholder: { text: 'Hier wird noch gebaut.', back: 'Zur Karte' },
  /** Stationsabschluss und Finale (docs/01 5.6, docs/11) */
  complete: {
    toMap: 'Zurück zur Karte',
    nextStation: 'Nächste Station',
    starLabel: 'Ein neuer Stern',
    finale: {
      schatzinsel: 'Du hast die geheime Schatzinsel erkundet! Ich bin so stolz auf dich.',
      'kleine-bucht': 'Du hast die kleine Bucht erkundet! Ich bin so stolz auf dich.',
    } satisfies Record<WorldId, string>,
    myTreasures: 'Meine Schätze ansehen',
    finaleMap: 'Zur Karte',
  },
  /** Bonus-Rätsel nach einer Station (docs/10 6) */
  bonus: {
    offer: 'Kiko hat noch ein Bonus-Rätsel. Magst du?',
    yes: 'Ja!',
    later: 'Später',
    solved: 'Bonus-Rätsel gelöst! Dafür bekommst du einen Glitzerstein.',
    gemLabel: 'Ein neuer Glitzerstein',
    toMap: 'Zurück zur Karte',
    toTreasures: 'Meine Schätze ansehen',
  },
  /** Üben (docs/01 5.7, docs/09 6) */
  practice: {
    title: 'Üben',
    what: 'Was möchtest du üben?',
    how: 'Wie schwer?',
    easier: 'Etwas leichter',
    right: 'Genau richtig',
    harder: 'Etwas kniffliger',
    notHere: 'Gibt es hier nicht',
    count: 'Wie viele Aufgaben?',
    start: "Los geht's!",
    done: 'Runde geschafft! Eine neue Perle für deine Kette.',
    again: 'Noch eine Runde',
    finish: 'Fertig',
    topics: {
      'mengen-zahlen': 'Mengen und Zahlen',
      'muenzen-zaehlen': 'Münzen zählen',
      'preise-addieren': 'Preise addieren',
      rueckgeld: 'Rückgeld',
      'muenzen-legen': 'Münzen legen',
      'reicht-das-geld': 'Reicht das Geld?',
      sachaufgaben: 'Sachaufgaben',
      knobeln: 'Knobeln',
      raetsel: 'Rätsel',
    } satisfies Record<PracticeTopicId, string>,
    /** ein Wort für Stufe 1 und 2 (docs/09 6) */
    shortTopics: {
      'mengen-zahlen': 'Zählen',
      'muenzen-zaehlen': 'Münzen',
      'preise-addieren': 'Preise',
      rueckgeld: 'Rückgeld',
      'muenzen-legen': 'Legen',
      'reicht-das-geld': 'Reicht es?',
      sachaufgaben: 'Geschichten',
      knobeln: 'Knobeln',
      raetsel: 'Rätsel',
    } satisfies Record<PracticeTopicId, string>,
  },
  /** Schätze (docs/01 5.8) */
  treasures: {
    title: 'Schätze',
    worldTabs: { 'kleine-bucht': 'Kleine Bucht', schatzinsel: 'Schatzinsel' } satisfies Record<
      WorldId,
      string
    >,
    stars: 'Sterne',
    findlings: 'Fundstücke',
    unknown: 'Noch nicht gefunden',
    foundAt: (title: string) => `Fundort: ${title}`,
    pearls: 'Perlenkette',
    pearlCount: (n: number) => (n === 1 ? '1 Perle' : `${String(n)} Perlen`),
    gems: 'Glitzersteine',
    gemCount: (n: number, total: number) => `Bonus-Rätsel: ${String(n)} von ${String(total)}`,
    certificate: 'Meine Urkunde',
    certificateHint: 'Frag einen Erwachsenen, ob ihr sie ausdruckt.',
  },
  /** Spiel-Bildschirm (docs/01 5.4, 5.5, 6.2) */
  play: {
    pause: 'Pause',
    pauseQuestion: 'Pause machen? Ich merke mir, wo wir waren.',
    resume: 'Weiterspielen',
    toMap: 'Zur Karte',
    read: 'Vorlesen',
    progress: (done: number, total: number) => `Aufgabe ${String(done + 1)} von ${String(total)}`,
    check: 'Prüfen',
    open: 'Öffnen',
    hint: 'Tipp',
    solution: "So geht's",
    howTo: "So geht's: ",
    next: 'Weiter',
    retry: 'Nochmal versuchen',
    myTurn: 'Jetzt ich!',
    tried: 'probiert',
    solvedChip: (letter: string, answer: string) => `${letter}) ${answer}`,
    kikoSays: 'Kiko sagt',
  },
  money: {
    euro: '€',
    cent: 'Cent',
    euroField: 'Euro',
    centField: 'Cent',
    preview: (amount: string) => `Deine Antwort: ${amount}`,
    delete: 'Löschen',
    toCent: 'Zum Cent-Feld',
    number: 'Deine Zahl',
  },
  coins: {
    trayEmpty: 'Tippe unten auf eine Münze',
    trayTotal: (amount: string) => `Auf dem Tablett: ${amount}`,
    trayFull: 'Das Tablett ist voll! Nimm ein paar Münzen weg.',
    trayLabel: (count: number, amount: string) =>
      `Tablett: ${String(count)} ${count === 1 ? 'Münze' : 'Münzen'}, zusammen ${amount}`,
    palette: 'Münzen zum Hinlegen',
    remember: 'Diese Möglichkeit merken',
    variant: (n: number) => `${String(n)}. Möglichkeit`,
  },
  scene: {
    paidWith: 'Bezahlt mit',
    hand: 'Geld',
    unknownPrice: '? €',
    blot: 'Fleck',
    countHelp: (n: number) => `Zählen: ${String(n)}`,
    price: (amount: string) => `Preis: ${amount}`,
    blank: 'Leeres Feld',
    balance: (tilt: 'links' | 'rechts' | 'gerade') =>
      tilt === 'gerade' ? 'Waage, sie ist im Gleichgewicht' : `Waage, sie kippt nach ${tilt}`,
    left: 'Linke Schale',
    right: 'Rechte Schale',
    unknown: 'Fehlt',
    dots: (a: number, b: number) => `${String(a)} Punkte und ${String(b)} Punkte`,
  },
  riddle: {
    cellEmpty: 'Leeres Feld, antippen',
    cellValue: (value: string) => `Feld: ${value}, antippen zum Ändern`,
    cellLocked: (value: string) => `Feld: ${value}, stimmt`,
    cellTitle: 'Was gehört in dieses Feld?',
    cellDone: 'Fertig',
    wall: 'Zahlenmauer',
    triangle: 'Rechendreieck',
    lock: 'Zahlenschloss',
    wheel: (symbol: string, digit: number) => `Rad mit ${symbol}: ${String(digit)}`,
    up: (symbol: string) => `Rad mit ${symbol} höher`,
    down: (symbol: string) => `Rad mit ${symbol} niedriger`,
    symbols: { muschel: 'Muschel', stern: 'Stern', fisch: 'Fisch', krebs: 'Krebs' },
    stairs: 'Ordnungshilfe: Wer mehr hat, steht höher. Tippe ein Kind an, dann eine Stufe.',
    step: (n: number) => `Stufe ${String(n)}`,
    stepEmpty: 'leer',
  },
} as const;

/** „20-Cent-Münze“, „2-Euro-Münze“, „5-Euro-Schein“ – für aria-label und Vorlesen (docs/01 9). */
export function pieceLabel(value: number): string {
  if (value < 100) return `${String(value)}-Cent-Münze`;
  if (value <= 200) return `${String(value / 100)}-Euro-Münze`;
  return `${String(value / 100)}-Euro-Schein`;
}
