import type { TowerType, PracticeTopicId, Stufe, WorldId } from '@/domain/types';

// Texte der Oberfläche (docs/01 Abschnitt 4–5, docs/09 Abschnitt 3–4). Wörtlich, wo die Docs sie vorgeben.

export const UI = {
  nav: {
    adventure: 'Abenteuer',
    practice: 'Üben',
    riddles: 'Rätsel',
    treasures: 'Schätze',
    label: 'Hauptmenü',
  },
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
    storage: 'Speichern auf diesem Gerät',
    storageOk: 'Der Fortschritt wird in diesem Browser gespeichert.',
    storageOff:
      'Achtung: Dieser Browser speichert gerade nichts, zum Beispiel im privaten Modus. Bitte die App in einem normalen Fenster öffnen.',
    persisted: 'Der Browser hat zugesagt, die Daten nicht von selbst zu löschen.',
    notPersisted:
      'Der Browser darf die Daten löschen, wenn der Speicher knapp wird oder die Seite lange nicht genutzt wurde. Eine Sicherung schützt davor.',
    address: (host: string) =>
      `Gespeichert wird für die Adresse ${host}. Öffnen Sie die App immer über genau diese Adresse. Jede andere Adresse, zum Beispiel ein Vorschau-Link von Vercel, hat eigene, leere Daten.`,
    apple:
      'iPhone und iPad: Safari und die App auf dem Home-Bildschirm haben getrennte Speicher, und Safari löscht Daten von Seiten, die 7 Tage nicht geöffnet wurden. Am zuverlässigsten ist es, die App über „Teilen → Zum Home-Bildschirm“ zu installieren und nur noch von dort zu starten. Bisherige Spielstände ziehen um mit „Sicherung herunterladen“ in Safari und „Sicherung laden“ in der installierten App.',
    broken:
      'Beim Start waren gespeicherte Daten nicht vollständig lesbar. Was ging, wurde gerettet. Die ursprünglichen Daten können Sie hier herunterladen.',
    brokenDownload: 'Ursprüngliche Daten herunterladen',
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
  /** Kikos Rätselturm (docs/12) */
  tower: {
    title: 'Kikos Rätselturm',
    what: 'Was möchtest du knobeln?',
    toNext: (n: number) =>
      n === 1
        ? 'Noch 1 Lampe bis zur nächsten Etage!'
        : `Noch ${String(n)} Lampen bis zur nächsten Etage!`,
    label: (floors: number, lit: number, size: number) =>
      `Turm mit ${String(floors)} ${floors === 1 ? 'Etage' : 'Etagen'}, ${String(lit)} von ${String(size)} Lampen leuchten`,
    beacon: 'Das Leuchtfeuer brennt!',
    types: {
      riddles: 'Muster & Co.',
      sudoku: 'Sudoku',
      memory: 'Memory',
      odd: 'Was passt nicht?',
      shadow: 'Schattenrätsel',
      maze: 'Labyrinth',
      dots: 'Punkte verbinden',
      nonogram: 'Bilderrätsel',
      cipher: 'Geheimschrift',
      case: 'Detektivfall',
      quiz: 'Wissensfragen',
    } satisfies Record<TowerType, string>,
    shortTypes: {
      riddles: 'Muster',
      sudoku: 'Sudoku',
      memory: 'Memory',
      odd: 'Passt nicht',
      shadow: 'Schatten',
      maze: 'Labyrinth',
      dots: 'Punkte',
      nonogram: 'Bilder',
      cipher: 'Geheim',
      case: 'Detektiv',
      quiz: 'Wissen',
    } satisfies Record<TowerType, string>,
    done: 'Geschafft! Eine neue Lampe leuchtet im Turm.',
    newFloor: (n: number) =>
      n === 1
        ? 'Juhu, die erste Etage ist fertig! Der Turm wächst.'
        : `Juhu, eine neue Etage! Der Turm ist jetzt ${String(n)} Etagen hoch.`,
    again: 'Noch eins',
    toTower: 'Zum Turm',
  },
  /** Kikos Kleiderschrank und Nest (docs/12 4.1) */
  wardrobe: {
    title: 'Kikos Kleiderschrank',
    open: 'Kleiderschrank',
    chestWaiting: 'Eine Truhe wartet auf dich!',
    chestTitle: 'Eine Schatztruhe! Was möchtest du?',
    chestPick: (name: string) => `${name} nehmen`,
    later: 'Das andere Teil kommt später wieder.',
    tabKiko: 'Kiko',
    tabNest: 'Nest',
    surprise: 'Überrasch mich!',
    locked: 'Noch nicht gefunden',
    nextChest: (n: number) =>
      n === 1 ? 'Nächste Truhe nach 1 Lampe' : `Nächste Truhe nach ${String(n)} Lampen`,
    empty: 'Löse Rätsel im Turm. Dann findest du Truhen mit Sachen für Kiko und sein Nest!',
    nest: 'Kikos Nest',
    nestLabel: 'Kikos Nest im Turm',
    special: 'Ein besonderes Teil!',
  },
  /** Sudoku im Rätselturm (docs/12 3.1, 5) */
  sudoku: {
    title: 'Sudoku',
    /** Regel je Art: „jedes Bild“, „jede Zahl“, „jede Münze“ */
    rule: (each: string) =>
      `In jeder Reihe, jeder Spalte und jedem Kasten kommt ${each} genau einmal vor.`,
    each: { bilder: 'jedes Bild', zahlen: 'jede Zahl', muenzen: 'jede Münze' },
    cages: 'Die kleine Zahl in der Ecke ist die Summe aller Zahlen in ihrem Kasten.',
    first: (one: string) => `Tipp hier und such ${one} aus!`,
    one: { bilder: 'ein Bild', zahlen: 'eine Zahl', muenzen: 'eine Münze' },
    kinds: {
      bilder: 'Bilder',
      zahlen4: 'Zahlen',
      muenzen: 'Münzen',
      zahlen6: 'Großes Sudoku',
      rechnen: 'Rechen-Sudoku',
    },
    chooseKind: 'Welches Sudoku?',
    chooseStars: 'Wie knifflig?',
    stars: ['leicht', 'mittel', 'knifflig'],
    starsLabel: (name: string, n: number) =>
      `${name}, ${String(n)} ${n === 1 ? 'Stern' : 'Sterne'}`,
    resume: 'Dein Sudoku wartet auf dich!',
    resumeButton: 'Weiterspielen',
    newPuzzle: 'Neues Rätsel',
    board: 'Sudoku-Feld',
    pad: 'Auswahl',
    erase: 'Radiergummi',
    notes: 'Notizen',
    check: 'Prüfen',
    pickCell: 'Tippe zuerst ein leeres Feld an.',
    partly: 'Die Felder mit ✓ stimmen schon. Schau dir die anderen noch einmal an.',
    cell: (row: number, col: number, value: string | null) =>
      `Reihe ${String(row)}, Feld ${String(col)}: ${value ?? 'leer'}`,
    cellFixed: (row: number, col: number, value: string) =>
      `Reihe ${String(row)}, Feld ${String(col)}: ${value}, fest`,
    cage: (sum: number) => `Summe ${String(sum)}`,
    /** Tipp 2: ein Feld, das sich sicher füllen lässt */
    safe: {
      last: {
        row: (one: string) => `In dieser Reihe fehlt nur noch ${one}.`,
        col: (one: string) => `In dieser Spalte fehlt nur noch ${one}.`,
        box: (one: string) => `In diesem Kasten fehlt nur noch ${one}.`,
      },
      cage: 'Schau auf die kleine Zahl in der Ecke. Was fehlt noch bis dahin?',
      single: 'Schau auf die Reihe, die Spalte und den Kasten. Hier passt nur noch eins.',
      hidden: {
        row: (name: string) => `In dieser Reihe passt ${name} nur in dieses Feld.`,
        col: (name: string) => `In dieser Spalte passt ${name} nur in dieses Feld.`,
        box: (name: string) => `In diesem Kasten passt ${name} nur in dieses Feld.`,
      },
    },
    /** Namen mit Artikel für die Tipps */
    names: {
      bilder: ['die Muschel', 'der Stern', 'der Fisch', 'der Krebs'],
      muenzen: ['die 1-Cent-Münze', 'die 2-Cent-Münze', 'die 5-Cent-Münze', 'die 10-Cent-Münze'],
      number: (n: number) => `die ${String(n)}`,
    },
    /** Namen ohne Artikel für Felder und Knöpfe */
    labels: {
      bilder: ['Muschel', 'Stern', 'Fisch', 'Krebs'],
      muenzen: ['1 Cent', '2 Cent', '5 Cent', '10 Cent'],
    },
    showSolution: "So geht's",
    solution: 'So sieht das fertige Sudoku aus. Beim nächsten klappt es bestimmt!',
    tricky: 'Wow, das war ein kniffliges!',
    effort: ['Du hast nicht aufgegeben!', 'Das war knifflig, und du hast es geschafft.'],
  },
  /** Kikos Witzekiste (docs/12 4.2) */
  jokes: {
    box: 'Kikos Witzekiste',
    open: 'Witz anhören',
    guess: 'Was meinst du? Rate laut!',
    reveal: 'Auflösen!',
    laugh: 'Hihihi!',
    readAgain: 'Nochmal vorlesen',
    tell: 'Erzähl ihn weiter!',
    close: 'Schließen',
    book: 'Witzebuch',
    bookCount: (n: number) => (n === 1 ? '1 Witz gesammelt' : `${String(n)} Witze gesammelt`),
    bookEmpty:
      'Hier sammelst du Kikos Witze. Löse ein Rätsel im Turm, dann erzählt Kiko dir einen.',
    favorite: 'Lieblingswitz',
    read: 'Vorlesen',
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
