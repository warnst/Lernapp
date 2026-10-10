// Datenmodell aus docs/03 (Abschnitt 4) mit den Ergänzungen aus docs/09, docs/10 und docs/11.

/** Geld immer als ganze Zahl in Cent. 1,50 € = 150. */
export type Cents = number;

export type CoinValue = 1 | 2 | 5 | 10 | 20 | 50 | 100 | 200;
export type NoteValue = 500 | 1000 | 2000 | 5000;
export type MoneyPiece = CoinValue | NoteValue;

export type PracticeTopicId =
  | 'mengen-zahlen'
  | 'muenzen-zaehlen'
  | 'preise-addieren'
  | 'rueckgeld'
  | 'muenzen-legen'
  | 'reicht-das-geld'
  | 'sachaufgaben'
  | 'knobeln'
  | 'raetsel';

// ---------- Stufen (docs/09, Abschnitt 2) ----------

export type Stufe = 1 | 2 | 3 | 4;
export type WorldId = 'kleine-bucht' | 'schatzinsel';

export interface StufeConfig {
  id: Stufe;
  name: string; // 'Muschel'
  icon: string; // Illustrations-ID
  ageHint: string; // nur im Erwachsenenbereich: 'etwa 5 Jahre'
  world: WorldId;
  numbers: { max: number }; // Zahlenraum für reine Zahlenaufgaben
  money: {
    useCents: boolean; // false: nur ganze Euro (Stufe 2)
    centOnly: boolean; // true: nur Cent-Beträge, keine Euro (Stufe 1)
    step: Cents; // kleinste Preiseinheit
    maxPrice: Cents;
    maxTotal: Cents;
    pieces: MoneyPiece[]; // Münzen/Scheine, die vorkommen dürfen
    payments: MoneyPiece[]; // womit in Rückgeld-Aufgaben bezahlt wird
  };
  carry: boolean; // Übertrag / Zehnerübergang erlaubt
  multiply: 0 | 2 | 3 | 5; // max. Faktor bei Mengen-Aufgaben (0 = keine)
  maxSteps: 1 | 2 | 3; // max. Teile einer Aufgabe
  answerTypes: Answer['type'][];
  choiceCount: 2 | 3 | 4;
  numberInput: 'numberline' | 'keypad';
  autoRead: boolean; // Geschichte + Frage beim Öffnen automatisch vorlesen
  maxStoryWords: number; // Generatoren verwerfen längere Texte
  practiceTopics: PracticeTopicId[];
  /** Rätselarten im Rätselturm (docs/12) */
  tower: { types: TowerType[] };
  riddles: {
    types: RiddleType[];
    moneyShare: number; // 0..1 Anteil Geld-Rätsel
    params: RiddleParams; // Startwerte je Rätselart (docs/10 4)
  };
}

// ---------- Profile (docs/09, Abschnitt 3.1) ----------

export type AvatarId =
  'delfin' | 'schildkroete' | 'seepferdchen' | 'pinguin' | 'robbe' | 'flamingo';

export interface StationProgress {
  completed: boolean;
  completedAt?: string;
  plays: number;
  stufe: Stufe;
}

export interface WorldProgress {
  stations: Record<string, StationProgress>;
  unlockAll: boolean;
  bonusSolved: string[]; // Stations-IDs mit gelöstem Bonus-Rätsel
}

export interface Profile {
  id: string; // crypto.randomUUID()
  name?: string; // optional, nur lokal
  avatar: AvatarId;
  stufe: Stufe;
  createdAt: string;
  worlds: Partial<Record<WorldId, WorldProgress>>;
  resume?: {
    world: WorldId;
    stationId: string;
    taskIndex: number;
    partIndex: number;
    seed: number;
  };
  practice: {
    pearls: number;
    last?: { topic: PracticeTopicId; shift: -1 | 0 | 1; count: 5 | 10 };
  };
  celebrated: string[];
  stats: Record<string, { wrong: number; hints: number; stufe: Stufe }>;
  /** Rätselturm (docs/12); fehlt, solange das Kind noch nicht im Turm war */
  tower?: TowerProgress;
}

/** Rätselarten im Turm (docs/12, Abschnitt 3). */
export type TowerType =
  | 'sudoku'
  | 'memory'
  | 'odd'
  | 'shadow'
  | 'maze'
  | 'dots'
  | 'nonogram'
  | 'cipher'
  | 'case'
  | 'quiz'
  | 'riddles';

export interface TowerProgress {
  /** gelöste Rätsel bzw. Runden insgesamt (je eine Lampe) */
  lamps: number;
  /** gelöste Rätsel je Art (Rätselpass) */
  solved: Partial<Record<TowerType, number>>;
  /** IDs der gehörten Witze, in der Reihenfolge des Hörens */
  jokes: string[];
  /** Lieblingswitze (Herz) */
  favorites: string[];
  /** Kikos Kleiderschrank und Nest (docs/12 4.1); fehlt, bis die erste Truhe geöffnet wurde */
  wardrobe?: Wardrobe;
}

/** Plätze an Kiko (docs/12 4.1) */
export type KikoSlot = 'kopf' | 'augen' | 'gesicht' | 'hals' | 'ruecken' | 'hand' | 'fuesse';
/** Plätze im Nest */
export type NestSlot = 'boden' | 'wand' | 'decke' | 'fenster' | 'haustier';

export interface Wardrobe {
  /** freigeschaltete Teile (Kiko und Nest) */
  owned: string[];
  /** geöffnete Truhen */
  chests: number;
  /** was Kiko gerade trägt */
  kiko: Partial<Record<KikoSlot, string>>;
  /** was im Nest steht */
  nest: Partial<Record<NestSlot, string>>;
}

export interface AppStateV2 {
  version: 2;
  profiles: Profile[]; // 1–6 Profile
  activeProfileId?: string;
  setupDone: boolean;
}

// ---------- Stationen und Aufgaben (docs/03, Abschnitt 4) ----------

export interface Station {
  id: string; // 'muschelstrand'
  world: WorldId;
  number: number; // 1–9 bzw. 1–5
  title: string; // 'Muschelstrand'
  icon: string; // Illustrations-ID
  skillLabel: string; // für „Hier übst du: …“
  minutes: number; // für „⏱ etwa 8 Minuten“
  intro: string[]; // Kikos Einleitung, eine Sprechblase je Eintrag
  findling: { id: string; name: string; text: string };
  recap: string; // Rückblick beim Abschluss
  practiceTopic: PracticeTopicId; // für „Mehr davon üben“
  progressStyle?: 'shells' | 'locks'; // Standard 'shells'
  tasks: Task[]; // genau 5
}

/** Vorlage aus docs/05 oder docs/10, z. B. 'A1', 'R4', 'wall'. */
export type TemplateId = string;

/** Vorlage für neue Zahlen bei Stationsaufgaben (docs/09, Abschnitt 5). */
export interface TaskVariant {
  template: TemplateId;
  bind?: Record<string, string>; // feste Sachen/Namen, z. B. { A: 'kokosnuss' }
  force?: Record<string, unknown>; // feste Eigenschaften, z. B. { carry: true }
  stufen?: Stufe[]; // nur für diese Stufen erzeugen (Standard: alle der Welt)
}

export interface Task {
  id: string; // 's2-t3' bzw. 'b1-t1'
  title: string; // kurze Überschrift (für Druck und Lösungsblatt)
  difficulty: 1 | 2 | 3 | 4 | 5;
  authoredFor: Stufe; // Stufe der Originalzahlen (Insel 3, Bucht 1)
  variant?: TaskVariant;
  scene: Scene;
  story: string; // mit Geld-Tokens
  parts: TaskPart[]; // mindestens 1; mehrere = Teil a), b)
}

export interface TaskPart {
  id: string; // 's2-t3-a'
  lead?: string; // Zusatztext vor der Frage (nur ab Teil b)
  question: string;
  answer: Answer;
  hints: [string, string]; // genau zwei Stufen
  explanation: string; // Lösungsweg in Kindersprache
  praise?: string; // optionales Strategie-Lob bei richtig
  mistakes?: Mistake[]; // nur bei answer.type === 'money' oder 'number'
}

export interface Mistake {
  value: number; // Cent bei money, Zahl bei number
  feedback: string;
}

// ---------- Szenen ----------

export interface ObjectGroup {
  itemId: string;
  count: number;
}

export type Scene =
  | { kind: 'none' }
  | { kind: 'coins'; pieces: MoneyPiece[]; groups?: MoneyPiece[][]; label?: string }
  | {
      kind: 'items';
      items: SceneItem[];
      paidWith?: MoneyPiece[]; // „bezahlt mit“
      hand?: MoneyPiece[]; // Geld, das die Figur schon hat
      decor?: ObjectGroup; // reine Deko
    }
  | { kind: 'people'; people: { name: string; amount?: Cents; avatar?: string }[] }
  | { kind: 'note'; lines: string[] } // Piratenbuch, '▢' = Tintenfleck
  | {
      kind: 'objects';
      groups: (ObjectGroup & { leaving?: number; label?: string })[];
    } // docs/11
  | { kind: 'sequence'; items: SeqItem[] } // docs/10
  | { kind: 'balance'; left: BalanceSide; right: BalanceSide } // docs/10
  | { kind: 'clues'; clues: Clue[] }; // docs/10 (Zahlenschloss)

export interface SceneItem {
  itemId: string;
  label: string;
  price?: Cents; // fehlt nur, wenn der Preis gesucht ist
  priceFormat?: 'eur'; // Preisschild als „0,85 €“ statt „85 Cent“
  quantity?: number; // Icon mehrfach zeichnen
}

// ---------- Rätsel (docs/10, docs/11) ----------

export type RiddleType = 'sequence' | 'balance' | 'wall' | 'triangle' | 'logic' | 'code';

export type ClueSymbol = 'muschel' | 'stern' | 'fisch' | 'krebs';

export interface Clue {
  symbol: ClueSymbol;
  text: string;
  dots?: [number, number];
}

export type SeqItem =
  | { kind: 'number'; value: number }
  | { kind: 'money'; cents: Cents }
  | { kind: 'icon'; icon: string }
  | { kind: 'objects'; itemId: string; count: number }
  | { kind: 'blank' };

/** unknown bei pieces: Anzahl fehlender Münzen; bei objects immer 1. */
export interface BalanceSide {
  pieces?: MoneyPiece[];
  objects?: ObjectGroup;
  unknown?: number;
}

// ---------- Antworten ----------

export type Answer =
  | ChoiceAnswer
  | MoneyAnswer
  | NumberAnswer
  | PayAnswer
  | PayVariantsAnswer
  | OrderAnswer
  | SelectAnswer
  | GridAnswer
  | CodeAnswer;

export interface ChoiceAnswer {
  type: 'choice';
  layout: 'cards' | 'yesno' | 'coins' | 'bags';
  shuffle: boolean; // true: gemischt mit Seed aus task.id
  options: ChoiceOption[]; // 2–4, genau eine mit correct: true
}

export interface ChoiceOption {
  id: string;
  label: string; // darf Geld-Tokens enthalten
  correct?: true;
  feedback?: string; // spezifischer Hinweis, wenn diese Option gewählt wurde
  pieces?: MoneyPiece[]; // bei layout 'coins' / 'bags'
  icon?: string;
  objects?: ObjectGroup; // Eimer/Häufchen mit Dingen statt Geld (docs/11)
}

export interface MoneyAnswer {
  type: 'money';
  correct: Cents;
}

/** Ganze Zahlen, kein Geld; Fehlerhinweise über TaskPart.mistakes. */
export interface NumberAnswer {
  type: 'number';
  correct: number;
}

export interface PayAnswer {
  type: 'pay';
  target: Cents;
  palette: MoneyPiece[];
  showTotal: boolean;
  exactCount?: number; // z. B. genau 2 Münzen
  minimal?: true; // so wenige Münzen wie möglich
}

export interface PayVariantsAnswer {
  type: 'pay-variants';
  target: Cents;
  palette: MoneyPiece[];
  required: number; // so viele verschiedene Möglichkeiten finden
  showTotal: boolean;
}

export interface OrderAnswer {
  type: 'order';
  entries: OrderEntry[];
  direction: 'asc'; // vom kleinsten zum größten Wert
}

export interface OrderEntry {
  id: string;
  label: string; // wird vorgelesen und in Rückmeldungen genutzt
  value: number;
  piece?: MoneyPiece;
  itemId?: string;
  objects?: ObjectGroup;
}

export interface SelectAnswer {
  type: 'select';
  items: SceneItem[];
  rule:
    | { kind: 'sum'; count: number; target: Cents } // genau n Sachen mit Summe X
    | { kind: 'affordable'; budget: Cents }; // alle mit Preis ≤ Budget
}

export interface GridCell {
  id: string;
  value: number;
  given: boolean;
}

export interface GridAnswer {
  type: 'grid';
  shape: 'wall' | 'triangle';
  unit: 'number' | 'cents';
  // wall: id = 'r{reihe}c{spalte}', Reihe 0 = unten
  // triangle: 'a','b','c' (Punktefelder innen) und 'ab','bc','ca' (außen)
  cells: GridCell[];
}

/** 3 oder 4 Räder, Ziffern 0–9. */
export interface CodeAnswer {
  type: 'code';
  digits: number[];
}

// ---------- Rätsel-Startwerte je Stufe (docs/10 Abschnitt 4) ----------

/** Regel einer Zahlen- oder Geldreihe. */
export type SeqRule =
  { kind: 'add'; d: number } | { kind: 'double' } | { kind: 'alt'; d1: number; d2: number };

export type PicturePeriod = 'AB' | 'AAB' | 'ABC' | 'ABB' | 'AABB';

export type CodeClueKind = 'plus' | 'plusminus' | 'money' | 'divide' | 'times';

export type LogicFrage = 'meisten' | 'wenigsten' | 'mitte' | 'betrag';

export interface RiddleGridMoney {
  step: number;
  maxTop: number;
}

export interface RiddleParams {
  sequence: {
    numberRules: SeqRule[];
    moneyRules: SeqRule[];
    periods: PicturePeriod[];
    /** Wachstum je Feld bei Mengen; leer = keine Mengenmuster */
    mengeSteps: number[];
    mengeMax: number;
    numberMax: number;
  };
  balance: {
    /** größte Anzahl bei Mengen (Muscheln …); 0 = keine Mengen */
    objectsMax: number;
    /** ohne force: Mengen statt Geld (Anteil Geld dann `riddles.moneyShare`) */
    objectsByDefault: boolean;
    /** zwei gleiche fehlende Stücke statt einem */
    twoEqual: boolean;
  };
  wall: {
    width: number;
    numberMaxTop: number;
    /** null = keine Geldmauern */
    money: RiddleGridMoney | null;
    gaps: number[];
    /** Anteil der Mauern mit mindestens einer Lücke unten (0 = nie, 1 = immer) */
    bottomShare: number;
  };
  triangle: {
    /** welche Felder standardmäßig fehlen */
    mode: 'outer' | 'mixed' | 'inner';
    numberMaxOuter: number;
    money: RiddleGridMoney | null;
  };
  code: {
    wheels: 3 | 4;
    dots: boolean;
    kinds: CodeClueKind[];
    /** größte Zahl in Plus- und Minus-Rätseln */
    operandMax: number;
  };
  logic: {
    fragen: LogicFrage[];
    kids: number;
    /** ab Stufe 3: Die Sätze legen die ganze Reihenfolge fest. */
    fullOrder: boolean;
    moneyStep: number;
    moneyMax: number;
  };
}
