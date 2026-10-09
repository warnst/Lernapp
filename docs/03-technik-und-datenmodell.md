# 03 – Technik und Datenmodell

## 1. Stack

| Bereich | Wahl | Begründung |
|---|---|---|
| Build | **Vite** (aktuelle stabile Version), Vorlage `react-ts` | schnell, statischer Build, kein Server |
| UI | **React** + **TypeScript** (`strict: true`) | große Auswahl an Beispielen, gut für Claude Code |
| Routing | **wouter** | ca. 2 KB, Hooks-API, reicht für alle Routen der App |
| Styles | **CSS Modules** + globale `tokens.css` | Druck-CSS und Tokens ohne Umwege, keine Klassenflut |
| State | React Context + `useReducer` | ein kleiner Fortschritts-Store reicht |
| Speicherung | `localStorage` mit Versionsfeld | wenige KB Daten, synchron, einfach |
| PWA | **vite-plugin-pwa** (`generateSW`) | Manifest, Service Worker, Offline in wenigen Zeilen |
| Schriften | `@fontsource/andika`, `@fontsource-variable/fredoka` | lokal gebündelt, offline |
| Tests | **Vitest** + **@testing-library/react**; **Playwright** für E2E | Unit, Inhalt, Komponenten, Ablauf |
| Hosting | **Vercel** (Framework-Preset „Vite“), Code auf **GitHub** | Auto-Deploy bei Push |

**Nicht verwenden:** Next.js, Tailwind, Redux/Zustand, Animationsbibliotheken, UI-Kits, Analytics oder Fehler-Tracking-Dienste.

## 2. Ordnerstruktur

```
schatzinsel/
├── CLAUDE.md
├── docs/                         # diese Spezifikation
├── public/
│   ├── icons/                    # PWA-Icons 192, 512, maskable-512, apple-touch-icon-180
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx                   # Router + Layout + Provider
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── print.css
│   ├── domain/                   # reine Logik, ohne React – 100 % getestet
│   │   ├── money.ts              # format, speak, parse, sum, minCoins
│   │   ├── text.ts               # Geld-Tokens in Text auflösen
│   │   ├── check.ts              # Antwortprüfung aller Typen
│   │   ├── hints.ts              # Tipp-Stufen, Rückmeldungs-Auswahl
│   │   ├── random.ts             # Seed-Zufall (mulberry32), shuffle, pick
│   │   └── types.ts
│   ├── config/
│   │   └── levels.ts             # STUFEN, AGE_TO_STUFE – einzige Quelle für Schwierigkeit (09)
│   ├── content/
│   │   ├── worlds/
│   │   │   ├── schatzinsel/      # s1-muschelstrand.ts … s9-schatztruhe.ts (04)
│   │   │   └── kleine-bucht/     # b1-muschelufer.ts … b5-muscheltruhe.ts (11)
│   │   ├── worlds.ts             # Welten mit Stationen in Reihenfolge
│   │   ├── feedback.ts           # Rückmeldungs-Pools aus 01
│   │   ├── items.ts              # Sachen-Katalog für Generatoren (05)
│   │   ├── things.ts             # zählbare Dinge für Mengen-Aufgaben (05, Anhang B)
│   │   ├── avatars.ts            # Profil-Tiere mit Artikel (09)
│   │   └── names.ts              # Vornamen + Pronomen
│   ├── practice/
│   │   ├── topics.ts             # Themen
│   │   ├── distractors.ts        # Fehlvorstellungen → falsche Optionen
│   │   ├── generators/           # eine Datei pro Vorlage oder Thema (05)
│   │   ├── riddles/              # Rätsel-Generatoren + Löser (10)
│   │   └── variants.ts           # wählt Original oder Variante für Stationsaufgaben (09, 5.1)
│   ├── state/
│   │   ├── app-state.tsx         # Context, Reducer, Profile, Persistenz
│   │   └── storage.ts            # load/save/migrate v1→v2, Export/Import, try/catch
│   ├── speech/speak.ts           # Web Speech API
│   ├── components/               # Button, AnswerCard, Coin, MoneyInput, …
│   ├── illustrations/            # Kiko, Map, StationIcons, Items, Fundstuecke …
│   ├── screens/
│   │   ├── Setup.tsx             # Ersteinrichtung (09, 3.3)
│   │   ├── WhoPlays.tsx          # „Wer spielt?“
│   │   ├── WorldMap.tsx          # Insel bzw. Bucht
│   │   ├── Play.tsx              # spielt Stationen UND Übungsrunden
│   │   ├── StationComplete.tsx
│   │   ├── Practice.tsx
│   │   ├── Treasures.tsx
│   │   ├── Adults.tsx            # Erwachsenen-Bereich (09, 4)
│   │   └── Print.tsx
│   └── print/                    # Arbeitsblatt-, Lösungs- und Urkunden-Komponenten
├── tests/e2e/                    # Playwright
├── vercel.json
└── vite.config.ts
```

## 3. Routen

| Pfad | Bildschirm |
|---|---|
| `/` | Welt des aktiven Kindes (Insel oder Bucht). Beim allerersten Start: Ersteinrichtung. Bei mehreren Profilen ohne aktives: „Wer spielt?“ |
| `/wer-spielt` | Profilauswahl |
| `/station/:stationId` | Spiel einer Station (Stationskarte ist ein Sheet auf `/`) |
| `/station/:stationId/geschafft` | Stationsabschluss (+ Angebot Bonus-Rätsel) |
| `/station/:stationId/bonus` | Bonus-Rätsel (`10`) |
| `/ueben` | Üben-Auswahl |
| `/ueben/spiel` | Übungsrunde (Parameter: `?thema=…&schwer=-1\|0\|1&anzahl=…`) |
| `/schaetze` | Schätze |
| `/schaetze/urkunde` | Vorschau der Urkunde für das Kind (ohne Druckknopf) |
| `/erwachsene` | Erwachsenen-Bereich (hinter Erwachsenen-Frage) |
| `/erwachsene/kind/:profileId` | Profil bearbeiten |
| `/erwachsene/drucken` | Drucken (Parameter: `?welt=…&stufe=…&stationen=1,2&loesungen=1`, Übungs-/Rätselblatt: `&uebung=rueckgeld&seed=1234`) |

`vercel.json` enthält eine Rewrite-Regel aller Pfade auf `/index.html`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## 4. Datenmodell

```ts
// src/domain/types.ts

/** Geld immer als ganze Zahl in Cent. 1,50 € = 150. */
export type Cents = number;

export type CoinValue = 1 | 2 | 5 | 10 | 20 | 50 | 100 | 200;
export type NoteValue = 500 | 1000 | 2000 | 5000;
export type MoneyPiece = CoinValue | NoteValue;

export type PracticeTopicId =
  | 'mengen-zahlen' | 'muenzen-zaehlen' | 'preise-addieren' | 'rueckgeld' | 'muenzen-legen'
  | 'reicht-das-geld' | 'sachaufgaben' | 'knobeln' | 'raetsel';

// Stufe, StufeConfig, WorldId: siehe 09 (src/config/levels.ts)
// RiddleType und Rätsel-Szenen/-Antworten: siehe 10

export interface Station {
  id: string;                 // 'muschelstrand'
  world: WorldId;             // 'schatzinsel' | 'kleine-bucht'
  number: number;             // 1–9 bzw. 1–5
  title: string;              // 'Muschelstrand'
  icon: string;               // Illustrations-ID
  skillLabel: string;         // 'Münzen erkennen und zählen' – für „Hier übst du: …“
  minutes: number;            // für „⏱ etwa 8 Minuten“
  intro: string[];            // Kikos Einleitung, eine Sprechblase je Eintrag
  findling: { id: string; name: string; text: string };
  recap: string;              // Rückblick beim Abschluss
  practiceTopic: PracticeTopicId; // für „Mehr davon üben“
  progressStyle?: 'shells' | 'locks'; // Standard 'shells'; Station 9: Schlösser, Truhe im Hintergrund
  tasks: Task[];              // genau 5
}

export interface Task {
  id: string;                 // 's2-t3' bzw. 'b1-t1'
  title: string;              // kurze Überschrift (für Druck und Lösungsblatt)
  difficulty: 1 | 2 | 3 | 4 | 5;
  authoredFor: Stufe;         // Stufe der Originalzahlen (Insel 3, Bucht 1)
  variant?: TaskVariant;      // Vorlage für neue Zahlen (09, Abschnitt 5)
  scene: Scene;
  story: string;              // mit Geld-Tokens, siehe Abschnitt 5
  parts: TaskPart[];          // mindestens 1; mehrere = Teil a), b)
}

export interface TaskPart {
  id: string;                 // 's2-t3-a'
  lead?: string;              // Zusatztext vor der Frage (nur ab Teil b)
  question: string;
  answer: Answer;
  hints: [string, string];    // genau zwei Stufen
  explanation: string;        // Lösungsweg in Kindersprache
  praise?: string;            // optionales Strategie-Lob bei richtig
  mistakes?: Mistake[];       // nur bei answer.type === 'money' oder 'number'
}

export interface Mistake { value: number; feedback: string } // Cent bei money, Zahl bei number

export type Scene =
  | { kind: 'none' }
  | { kind: 'coins'; pieces: MoneyPiece[]; groups?: MoneyPiece[][]; label?: string } // mit groups: mehrere Häufchen, pieces bleibt leer
  | {
      kind: 'items';
      items: SceneItem[];
      paidWith?: MoneyPiece[];                  // „bezahlt mit“ (Schein/Münze neben der Kasse)
      hand?: MoneyPiece[];                      // Geld, das die Figur schon hat
      decor?: { itemId: string; count: number }; // reine Deko, z. B. 7 Muscheln in 6.4
    }
  | { kind: 'people'; people: { name: string; amount?: Cents; avatar?: string }[] } // ohne amount bei Logik-Rätseln
  | { kind: 'note'; lines: string[] }          // Piratenbuch, '▢' = Tintenfleck, Tokens erlaubt
  | { kind: 'objects'; groups: { itemId: string; count: number; leaving?: number; label?: string }[] } // 11
  | { kind: 'sequence'; items: SeqItem[] }     // 10
  | { kind: 'balance'; left: BalanceSide; right: BalanceSide } // 10
  | { kind: 'clues'; clues: Clue[] };          // 10 (Zahlenschloss)

export interface SceneItem {
  itemId: string;
  label: string;
  price?: Cents;          // fehlt nur, wenn der Preis gesucht ist (Preisschild zeigt „? €“)
  priceFormat?: 'eur';    // Preisschild als „0,85 €“ statt „85 Cent“
  quantity?: number;      // Icon mehrfach zeichnen, z. B. 3 Kerzen
}

export type Answer =
  | ChoiceAnswer | MoneyAnswer | NumberAnswer | PayAnswer | PayVariantsAnswer
  | OrderAnswer | SelectAnswer | GridAnswer | CodeAnswer;   // NumberAnswer, GridAnswer, CodeAnswer: siehe 10

export interface ChoiceAnswer {
  type: 'choice';
  layout: 'cards' | 'yesno' | 'coins' | 'bags';
  shuffle: boolean;           // true: gemischt mit Seed aus task.id (gleich in App und Druck)
  options: ChoiceOption[];    // 2–4, genau eine mit correct: true
}
export interface ChoiceOption {
  id: string;
  label: string;              // darf Geld-Tokens enthalten
  correct?: true;
  feedback?: string;          // spezifischer Hinweis, wenn diese Option gewählt wurde
  pieces?: MoneyPiece[];      // bei layout 'coins' / 'bags': was auf der Karte zu sehen ist
  icon?: string;              // bei layout 'bags': Symbol auf dem Beutel (z. B. 'anker', 'stern'); bei Bildkarten das Bild
  objects?: { itemId: string; count: number }; // Eimer/Häufchen mit Dingen statt Geld (11)
}
// layout 'bags': Optionen mit pieces oder objects erscheinen als antippbare Beutel/Eimer/Geldbörsen.
// Eine Option ohne pieces und ohne objects (z. B. „In beiden gleich viel“) erscheint als breite Textkarte darunter.
// Jede Option hat ein label (auch Münz- und Bildkarten), es wird bei Stufe 1 beim Antippen vorgelesen.

export interface MoneyAnswer { type: 'money'; correct: Cents }

export interface PayAnswer {
  type: 'pay';
  target: Cents;
  palette: MoneyPiece[];
  showTotal: boolean;
  exactCount?: number;        // z. B. genau 2 Münzen
  minimal?: true;             // so wenige Münzen wie möglich
}

export interface PayVariantsAnswer {
  type: 'pay-variants';
  target: Cents;
  palette: MoneyPiece[];
  required: number;           // so viele verschiedene Möglichkeiten finden
  showTotal: boolean;
}

export interface OrderAnswer {
  type: 'order';
  entries: OrderEntry[];
  direction: 'asc';           // vom kleinsten zum größten Wert
}

export interface OrderEntry {
  id: string;
  label: string;              // Pflicht: wird vorgelesen und in Rückmeldungen genutzt
  value: number;
  piece?: MoneyPiece;
  itemId?: string;
  objects?: { itemId: string; count: number };
}

export interface SelectAnswer {
  type: 'select';
  items: SceneItem[];
  rule:
    | { kind: 'sum'; count: number; target: Cents }     // genau n Sachen mit Summe X
    | { kind: 'affordable'; budget: Cents };            // alle mit Preis ≤ Budget
}
```

**Invarianten (werden in Tests geprüft, siehe 10)**
- Alle `Cents`-Werte sind ganze Zahlen ≥ 0.
- `choice` hat genau eine richtige Option, alle Labels sind verschieden.
- `pay`: Das Ziel ist mit der Palette erreichbar. Bei `exactCount` gibt es mindestens eine Lösung mit genau so vielen Münzen.
- `pay-variants`: Es gibt mindestens `required` verschiedene Möglichkeiten.
- `select` mit `sum`: Es gibt mindestens eine Lösung. Alle Sachen in `select` haben einen Preis.
- `SceneItem.price` fehlt nur in Szenen, in denen der Preis gesucht ist (8.5, 9.2).
- `order`: Alle Werte sind verschieden.
- Jede Station hat genau 5 Aufgaben. IDs sind global eindeutig.
- Jede Station hat für jede Stufe ihrer Welt mindestens 3 spielbare Aufgaben (Original oder Variante, `09`, 5.1).
- `grid`: eindeutig lösbar (Löser aus `10`). `code`: jede Ziffer 0–9, erste Ziffer ≠ 0.
- `number`: ganzzahlig, 0 ≤ Wert ≤ `numbers.max` der Stufe.

## 5. Geld formatieren, vorlesen, einlesen

### 5.1 Geld-Tokens im Text

In Geschichten, Fragen und Szenen werden Beträge aus den Daten als Token geschrieben:

| Token | Anzeige | Vorlesen |
|---|---|---|
| `{{120}}` | 1,20 € | „1 Euro 20“ |
| `{{200}}` | 2 € | „2 Euro“ |
| `{{85}}` | 85 Cent | „85 Cent“ |
| `{{85\|eur}}` | 0,85 € | „0 Euro 85“ |
| `{{200\|full}}` | 2,00 € | „2 Euro“ |

`src/domain/text.ts` exportiert `renderText(s): string` und `speakText(s): string`. Zwischen Zahl und Einheit steht ein geschütztes Leerzeichen (` `).

**Wörtliche Beträge:** Tipps, Hinweise, Lösungswege und einige Fragen enthalten Beträge wörtlich („1,50 €“, „50 Cent“), z. B. in Station 5.2, wo es um die Schreibweise selbst geht. Damit auch sie richtig vorgelesen werden, erkennt `speakText` zusätzlich die Muster `/(\d+),(\d{2})\s?€/` → „1 Euro 50“, `/(\d+)\s?€/` → „2 Euro“ und `/(\d+)\s?Cent/` → „50 Cent“. Für „0,85 €“ wird „0 Euro 85“ gelesen. Das Zeichen „−“ wird als „minus“ gelesen, „+“ als „plus“, „=“ als „gleich“, „▢“ als „Fleck“.

### 5.2 Funktionen in `money.ts`

```ts
formatMoney(cents: Cents, mode?: 'auto' | 'eur' | 'full'): string
//  auto: < 100 → "85 Cent"; ganze Euro → "2 €"; sonst "1,20 €"
//  eur:  immer "0,85 €" / "2,00 €"
//  full: wie auto, aber ganze Euro als "2,00 €"

speakMoney(cents: Cents): string
//  85 → "85 Cent"; 200 → "2 Euro"; 120 → "1 Euro 20"; 105 → "1 Euro 5"

parseMoney(input: string): Cents | null
//  tolerant: "1,5" "1,50" "1,50 €" "1.50" "1 €" "150 ct" "150 Cent" "0,85"
//  "1,5" → 150; "1,05" → 105; "150 ct" → 150; "3" → 300 (ohne Komma = Euro)
//  ungültig ("1,555", "abc", "") → null
//  Wird im MVP für Inhaltstests und künftige Freitexteingaben genutzt.

moneyFromFields(euro: string, cent: string): Cents
//  leere Felder = 0; euro * 100 + cent (cent darf ≥ 100 sein)

sumPieces(pieces: MoneyPiece[]): Cents
minPieces(target: Cents, palette: MoneyPiece[]): number | null   // dynamische Programmierung
sameMultiset(a: MoneyPiece[], b: MoneyPiece[]): boolean          // für pay-variants
```

## 6. Antwortprüfung (`check.ts`)

```ts
type CheckResult =
  | { status: 'correct'; note?: string }                 // note z. B. „120 Cent sind übrigens 1,20 €.“
  | { status: 'wrong'; feedback?: string; direction?: 'too-much' | 'too-little' }
  | { status: 'partial'; feedback: string };             // richtig, aber Bedingung fehlt (minimal)
```

| Typ | Regel |
|---|---|
| `choice` | gewählte Option `correct` → richtig, sonst `feedback` der Option |
| `money` | `moneyFromFields` === `correct`. Sonst passender `mistakes`-Eintrag, sonst `direction`. Richtig mit Cent ≥ 100 → `note`. |
| `pay` | Summe === Ziel und (`exactCount` erfüllt) und (`minimal` → Anzahl === `minPieces`). Summe richtig, aber nicht minimal → `partial`: „Richtig, das sind {Ziel}! Geht es auch mit weniger Münzen?“ Falsche Anzahl bei `exactCount` → „Es müssen genau {exactCount} Münzen sein.“ Sonst `direction`. |
| `pay-variants` | pro Möglichkeit: Summe === Ziel und nicht `sameMultiset` mit einer gespeicherten. Doppelt → „Diese Möglichkeit hast du schon. Findest du eine andere?“ Fertig, wenn `required` erreicht. |
| `number` | Wert === `correct`. Sonst `mistakes`, sonst `direction` („etwas zu viel“ / „etwas zu wenig“). |
| `grid` | jedes offene Feld einzeln; richtige Felder werden fest. Sonst: „Ein Feld stimmt schon.“ bzw. „{n} Felder stimmen schon.“ + „Schau dir die anderen noch einmal an.“ (bei 0 richtigen nur der zweite Satz) |
| `code` | alle Ziffern gleich. Sonst: „Das Schloss klemmt noch. Das Rad mit {dem Stern \| der Muschel \| dem Fisch \| dem Krebs} stimmt noch nicht.“ (erstes falsches Rad) |
| `order` | Reihenfolge der Werte streng aufsteigend. Sonst: „{Label} steht noch nicht an der richtigen Stelle.“ (erste falsche Position). |
| `select` / `sum` | Anzahl === `count` und Summe === `target`. Falsche Anzahl → „Wähle genau {count} Sachen.“ Sonst: „Deine Sachen kosten zusammen {Summe}. Das ist zu viel.“ / „… zu wenig.“ |
| `select` / `affordable` | Auswahl === Menge aller Sachen mit Preis ≤ Budget. Zu teure Sache gewählt → „{Name} kostet {Preis}. Das ist mehr als {Budget}.“ Fehlt eine Sache mit Preis = Budget → „Es fehlt noch etwas. Denk dran: Genau {Budget} reicht auch!“ Fehlt eine andere → „Es fehlt noch eine Sache, die du dir leisten kannst.“ |

`partial` zählt nicht als Fehlversuch und erhöht `wrongCount` nicht. Kiko zeigt dabei die Pose `zeigt`.

## 7. Tipps und Rückmeldungen (`hints.ts`)

```ts
interface PartState { wrongCount: number; hintsOpened: number; solved: boolean }
hintLevel = Math.min(3, Math.max(wrongCount, hintsOpened))
// 0: nichts · 1: hints[0] · 2: hints[1] · 3: explanation
```

- `pickFeedback(pool, lastUsed)` wählt zufällig einen Satz, nie denselben wie zuletzt.
- Die Reihenfolge der Rückmeldung bei einem Fehlversuch steht in `01`, Abschnitt 5.5.

## 8. Fortschritt und Speicherung

Das Datenmodell mit **Profilen** (`AppStateV2`) steht in `09`, Abschnitt 3.1. Allgemeine Regeln:

- Schlüssel: `schatzinsel.state.v2`. Jeder Lese- und Schreibzugriff in `try/catch`. Scheitert der Zugriff, läuft die App mit Sitzungsdaten weiter.
- Beim ersten Start `navigator.storage?.persist?.()` aufrufen, damit der Browser die Daten seltener löscht.
- `migrate(raw)` prüft `version`: v1 → v2 nach `09`, 3.1. Unbekannte oder kaputte Daten ergeben einen frischen Zustand, ohne Absturz.
- **Export/Import:** `exportState()` liefert JSON mit Datum, `importState(json)` prüft Version und Aufbau, bevor es überschreibt.
- **Freischaltung:** Station n einer Welt ist spielbar, wenn n = 1 oder Station n − 1 `completed` ist oder `unlockAll` für diese Welt gilt.
- **Fortsetzen:** `resume` (mit Seed der Varianten) wird nach jedem gelösten Teil gespeichert und beim Stationsabschluss gelöscht.

## 9. Sprachausgabe (`speak.ts`)

- Web Speech API: `speechSynthesis` mit `lang = 'de-DE'`. Bevorzugt eine lokale deutsche Stimme (`voice.localService`), `rate = 0.9`.
- Gesprochen wird `speakText(story)` + Pause + `speakText(question)`, bei Teil b mit `lead`.
- Ein zweites Antippen stoppt die Ausgabe. Beim Seitenwechsel wird `speechSynthesis.cancel()` aufgerufen.
- Gibt es keine `speechSynthesis` oder keine deutsche Stimme, wird der Knopf ausgeblendet.
- Bei `autoRead` (Stufe 1 und 2) startet das Vorlesen beim Öffnen jeder Aufgabe und bei jeder Rückmeldung automatisch. Antippen von Antwortkarten liest deren Text vor (Stufe 1). Browser verlangen vor der ersten Sprachausgabe eine Nutzeraktion; der Tipper auf „Los geht's!“ zählt dafür.

## 10. Tests

**Unit (Vitest)**
- `money.ts`: Formatierung aller Modi, Vorlesen, `parseMoney` mit mindestens 20 Fällen (gültig und ungültig), `minPieces`, `sameMultiset`.
- `check.ts`: jeder Antworttyp mit richtig, falsch, `partial`, Mehrfachlösungen, inklusive `number`, `grid` und `code`.
- `hints.ts`: Stufenlogik.

**Inhaltstests** (`content.test.ts`) prüfen die Invarianten aus Abschnitt 4 für alle 45 Inselaufgaben und 25 Buchtaufgaben. Zusätzlich:
- Kein Text enthält `undefined`, `NaN` oder unaufgelöste `{{`.
- Kein Kindertext enthält das Wort „falsch“.
- Jede `mistakes`-Zahl ist verschieden von der richtigen Antwort.

**Generatoren:** siehe `05`, Abschnitt 7.

**Komponenten** (Testing Library): Geldeingabe (Tastatur, Feldwechsel, Vorschau), Münz-Tablett (hinzufügen, entfernen, Summe), Antwortkarte (probiert ist nicht mehr wählbar).

**E2E** (Playwright, Viewport 390 × 844):
1. Ersteinrichtung (ein Profil, Alter 7 → Stufe Krebs) → Insel-Station 1 komplett lösen (mit einem absichtlichen Fehlversuch) → Stern sichtbar → Station 2 ist freigeschaltet.
2. Neu laden → Fortschritt ist noch da.
3. Üben → Thema „Rückgeld“, „Etwas leichter“, 5 Aufgaben → Rundenabschluss → Perle in den Schätzen.
4. Zahnrad → Erwachsenen-Frage lösen → Drucken → Station 1 mit Lösungen → Druckvorschau enthält die Aufgaben und das Lösungsblatt (per `page.emulateMedia({ media: 'print' })`).
5. Offline: nach dem ersten Laden Netzwerk aus → App lädt neu und funktioniert.
6. Zwei Profile anlegen (Alter 5 und 7) → „Wer spielt?“ erscheint → Profil 1 zeigt die Bucht, Profil 2 die Insel → Fortschritte bleiben getrennt.

## 11. PWA

```ts
// vite.config.ts (Auszug)
VitePWA({
  registerType: 'prompt',          // nie mitten in einer Station neu laden
  injectRegister: 'auto',
  workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
  manifest: {
    name: 'Mathe-Abenteuer – Die geheime Schatzinsel',
    short_name: 'Schatzinsel',
    lang: 'de',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFF9EF',
    theme_color: '#0F7F88',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }
})
```

- **Updates:** Eine neue Version wird im Hintergrund geladen und beim nächsten App-Start aktiv. Der Kindermodus zeigt keinen Update-Dialog. Auf der Druckseite steht dezent „Neue Version verfügbar – neu laden“.
- **iOS:** `apple-touch-icon` (180 px), `<meta name="apple-mobile-web-app-capable" content="yes">`, Statusleiste `default`. Hinweis auf der Druckseite: „Zum Installieren: Teilen → Zum Home-Bildschirm“.
- **App-Icon:** Schatztruhe auf türkisem Grund mit Kikos Schopf dahinter. SVG-Quelle in `public/`, PNGs daraus erzeugen.

## 12. Deployment

1. Repository auf GitHub anlegen und pushen.
2. In Vercel „Add New Project“ → Repository wählen → Preset **Vite**. Build `npm run build`, Output `dist`.
3. `vercel.json` mit Rewrite (Abschnitt 3) und Header für den Service Worker:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/sw.js", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] }
  ]
}
```

4. Jeder Push auf `main` deployt automatisch. Pull-Requests bekommen Vorschau-URLs.
