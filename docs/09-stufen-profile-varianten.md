# 09 – Stufen, Profile und Aufgabenvarianten

Die App ist für Kinder von **5 bis 8 Jahren** gedacht. Zwei oder mehr Kinder können **ein Gerät** teilen. Jedes Kind hat ein eigenes Profil mit eigener Stufe und eigenem Fortschritt.

Das Ziel dieses Dokuments: **Schwierigkeit ist Konfiguration, nicht Code.** Eine Stufe anpassen oder eine neue hinzufügen heißt, einen Eintrag in einer Datei zu ändern.

## 1. Die vier Stufen

Das Kind sieht nur Tiername und Icon, nie ein Alter.

| Stufe | Name | etwa | Welt | Zahlen und Geld | Bedienung |
|---|---|---|---|---|---|
| 1 | **Muschel** | 5 J. (Vorschule) | Die kleine Bucht (`11`) | Mengen und Zahlen bis 10, Cent-Münzen bis 10 Cent, Münzen erkennen | alles wird automatisch vorgelesen, Antworten fast nur als Bilder oder Zahlenstrahl |
| 2 | **Seestern** | 6 J. (1. Klasse) | Schatzinsel | bis 20, nur ganze Euro, Zehnerübergang, einfaches Rückgeld | automatisch vorlesen, kurze Sätze, Geldeingabe nur in Euro |
| 3 | **Krebs** | 7 J. (2. Klasse) | Schatzinsel | Euro und Cent bis 10 € (Originalaufgaben aus `04`) | Vorlesen per Knopf |
| 4 | **Oktopus** | 8 J. (3. Klasse) | Schatzinsel | Euro und Cent bis 100 €, Malnehmen mit Preisen, bis zu 3 Rechenschritte | mehr Eingabe, 4 Antwortkarten |

## 2. Zentrale Konfiguration: `src/config/levels.ts`

**Alle** Generatoren, Rätsel, Antwortkarten-Raster, das Vorlesen und die Textlänge lesen ihre Parameter von hier. Stufenabhängige **Inhaltsdaten** (Preisbereiche im Sachen-Katalog, Rätsel-Parameter) stehen als `Record<Stufe, …>` in Datendateien (`items.ts`, `riddles/params.ts`). Nirgends sonst werden Alters- oder Zahlengrenzen fest im Code eingetragen (Review-Punkt in der PR-Vorlage).

```ts
export type Stufe = 1 | 2 | 3 | 4;
export type WorldId = 'kleine-bucht' | 'schatzinsel';

export interface StufeConfig {
  id: Stufe;
  name: string;                 // 'Muschel'
  icon: string;                 // Illustrations-ID
  ageHint: string;              // nur im Erwachsenenbereich: 'etwa 5 Jahre'
  world: WorldId;
  numbers: { max: number };     // Zahlenraum für reine Zahlenaufgaben
  money: {
    useCents: boolean;          // false: nur ganze Euro (Stufe 2)
    centOnly: boolean;          // true: nur Cent-Beträge, keine Euro (Stufe 1)
    step: Cents;                // kleinste Preiseinheit
    maxPrice: Cents;
    maxTotal: Cents;
    pieces: MoneyPiece[];       // Münzen/Scheine, die vorkommen dürfen
    payments: MoneyPiece[];     // womit in Rückgeld-Aufgaben bezahlt wird
  };
  carry: boolean;               // Übertrag / Zehnerübergang erlaubt
  multiply: 0 | 2 | 3 | 5;      // max. Faktor bei Mengen-Aufgaben (0 = keine)
  maxSteps: 1 | 2 | 3;          // max. Teile einer Aufgabe
  answerTypes: Answer['type'][];
  choiceCount: 2 | 3 | 4;
  numberInput: 'numberline' | 'keypad';
  autoRead: boolean;            // Geschichte + Frage beim Öffnen automatisch vorlesen
  maxStoryWords: number;        // Generatoren verwerfen längere Texte
  practiceTopics: PracticeTopicId[];
  riddles: { types: RiddleType[]; moneyShare: number }; // 0..1 Anteil Geld-Rätsel
}
```

### 2.1 Startwerte

```ts
export const STUFEN: Record<Stufe, StufeConfig> = {
  1: {
    id: 1, name: 'Muschel', icon: 'stufe-muschel', ageHint: 'etwa 5 Jahre', world: 'kleine-bucht',
    numbers: { max: 10 },
    money: { useCents: true, centOnly: true, step: 1, maxPrice: 10, maxTotal: 10,
             pieces: [1, 2, 5, 10, 50, 100, 200], payments: [] }, // 50, 100, 200 nur zum Erkennen; kein Rückgeld auf Stufe 1
    carry: false, multiply: 0, maxSteps: 2,
    answerTypes: ['choice', 'number', 'pay', 'order', 'grid', 'code'],
    choiceCount: 3, numberInput: 'numberline', autoRead: true, maxStoryWords: 14,
    practiceTopics: ['mengen-zahlen', 'muenzen-zaehlen', 'preise-addieren', 'muenzen-legen', 'reicht-das-geld', 'raetsel'],
    riddles: { types: ['sequence', 'balance', 'wall', 'code'], moneyShare: 0.3 },
  },
  2: {
    id: 2, name: 'Seestern', icon: 'stufe-seestern', ageHint: 'etwa 6 Jahre', world: 'schatzinsel',
    numbers: { max: 20 },
    money: { useCents: false, centOnly: false, step: 100, maxPrice: 1000, maxTotal: 2000,
             pieces: [100, 200, 500, 1000, 2000], payments: [500, 1000, 2000] },
    carry: true, multiply: 2, maxSteps: 2,
    answerTypes: ['choice', 'money', 'number', 'pay', 'order', 'select', 'grid', 'code'],
    choiceCount: 3, numberInput: 'keypad', autoRead: true, maxStoryWords: 22,
    practiceTopics: ['mengen-zahlen', 'muenzen-zaehlen', 'preise-addieren', 'rueckgeld', 'muenzen-legen', 'reicht-das-geld', 'sachaufgaben', 'raetsel'],
    riddles: { types: ['sequence', 'balance', 'wall', 'triangle', 'logic', 'code'], moneyShare: 0.5 },
  },
  3: {
    id: 3, name: 'Krebs', icon: 'stufe-krebs', ageHint: 'etwa 7 Jahre', world: 'schatzinsel',
    numbers: { max: 100 },
    money: { useCents: true, centOnly: false, step: 5, maxPrice: 500, maxTotal: 1000,
             pieces: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000], payments: [200, 500, 1000] },
    carry: true, multiply: 3, maxSteps: 2,
    answerTypes: ['choice', 'money', 'number', 'pay', 'pay-variants', 'order', 'select', 'grid', 'code'],
    choiceCount: 3, numberInput: 'keypad', autoRead: false, maxStoryWords: 32,
    practiceTopics: ['muenzen-zaehlen', 'preise-addieren', 'rueckgeld', 'muenzen-legen', 'reicht-das-geld', 'sachaufgaben', 'knobeln', 'raetsel'],
    riddles: { types: ['sequence', 'balance', 'wall', 'triangle', 'logic', 'code'], moneyShare: 0.6 },
  },
  4: {
    id: 4, name: 'Oktopus', icon: 'stufe-oktopus', ageHint: 'etwa 8 Jahre', world: 'schatzinsel',
    numbers: { max: 1000 },
    money: { useCents: true, centOnly: false, step: 5, maxPrice: 5000, maxTotal: 10000,
             pieces: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000], payments: [1000, 2000, 5000] },
    carry: true, multiply: 5, maxSteps: 3,
    answerTypes: ['choice', 'money', 'number', 'pay', 'pay-variants', 'order', 'select', 'grid', 'code'],
    choiceCount: 4, numberInput: 'keypad', autoRead: false, maxStoryWords: 40,
    practiceTopics: ['muenzen-zaehlen', 'preise-addieren', 'rueckgeld', 'muenzen-legen', 'reicht-das-geld', 'sachaufgaben', 'knobeln', 'raetsel'],
    riddles: { types: ['sequence', 'balance', 'wall', 'triangle', 'logic', 'code'], moneyShare: 0.6 },
  },
};

/** Vorschlag beim Anlegen eines Profils. Erwachsene können die Stufe jederzeit ändern. */
export const AGE_TO_STUFE: Record<number, Stufe> = { 5: 1, 6: 2, 7: 3, 8: 4 };
```

Der 50-Euro-Schein (`5000`) kommt neu dazu. Er wird im Spielgeld-Stil wie die anderen Scheine gezeichnet (`02`, 6.2), in Orange-Beige `#EBC79A`.

### 2.2 Erweiterbarkeit

- **Neue Stufe 5** (z. B. 9 Jahre): einen Eintrag in `STUFEN` ergänzen, `Stufe` um `5` erweitern, `AGE_TO_STUFE` anpassen. Generatoren und Rätsel funktionieren automatisch mit den neuen Grenzen.
- **Neue Welt:** Stationen in `src/content/worlds/<welt>/` anlegen, `WorldId` erweitern und die Welt in `STUFEN[x].world` eintragen.
- **Neues Fach** (später): eigener Ordner `src/subjects/<fach>/` mit eigener Konfiguration nach demselben Muster. Die Spiel-, Rückmeldungs- und Belohnungslogik bleibt gleich.
- **Tests** prüfen für jede Stufe: alle Generatoren und Rätsel × 300 Seeds halten die Grenzen ein (`maxTotal`, `numbers.max`, `step`, erlaubte `pieces`, `maxStoryWords`).

## 3. Profile

### 3.1 Datenmodell

```ts
export type AvatarId = 'delfin' | 'schildkroete' | 'seepferdchen' | 'pinguin' | 'robbe' | 'flamingo';

interface AppStateV2 {
  version: 2;
  profiles: Profile[];                     // 1–6 Profile
  activeProfileId?: string;
  setupDone: boolean;
}

interface Profile {
  id: string;                              // crypto.randomUUID()
  name?: string;                           // optional, nur lokal
  avatar: AvatarId;
  stufe: Stufe;
  createdAt: string;
  worlds: Partial<Record<WorldId, {
    stations: Record<string, { completed: boolean; completedAt?: string; plays: number; stufe: Stufe }>;
    unlockAll: boolean;
    bonusSolved: string[];                 // Stations-IDs mit gelöstem Bonus-Rätsel
  }>>;
  resume?: { world: WorldId; stationId: string; taskIndex: number; partIndex: number; seed: number };
  practice: { pearls: number; last?: { topic: PracticeTopicId; shift: -1 | 0 | 1; count: 5 | 10 } };
  celebrated: string[];
  stats: Record<string, { wrong: number; hints: number; stufe: Stufe }>;
}
```

- Speicher-Schlüssel: `schatzinsel.state.v2`. Es gibt noch keine Nutzerdaten in einem älteren Format, also **keine Migration**. Spätere Formatänderungen bekommen `version: 3` und eine Funktion `migrate2to3`.
- **Sterne und Fundstücke gehören zur Welt**, nicht zur Stufe. Wechselt ein Kind von Stufe 2 zu 3, behält es seine Sterne auf der Schatzinsel und spielt dieselben Stationen mit schwereren Zahlen. `stations[x].stufe` merkt sich, auf welcher Stufe abgeschlossen wurde.
- Wechselt ein Kind von Stufe 1 auf 2, wechselt auch die Welt. Die Kleine Bucht bleibt mit Sternen in den Schätzen sichtbar.

### 3.2 „Wer spielt?“

- Gibt es **mehr als ein Profil**, erscheint beim App-Start ein Auswahlbildschirm: große Karten (mindestens 140 × 160 px) mit Tier-Avatar und Name, zum Beispiel „Mila“ mit Delfin und „Ben“ mit Pinguin. Mit nur einem Profil wird der Bildschirm übersprungen.
- Antippen startet die Welt des Kindes. Der Avatar sitzt danach oben links in der Kopfzeile. Antippen dort führt zurück zu „Wer spielt?“.
- Kinder ohne Namen werden über das Tier erkannt. Die Begrüßung lautet dann „Hallo, kleiner Delfin!“, mit passendem Artikel aus der Avatar-Konfiguration.
- Die Avatare sind bewusst andere Tiere als die Stufen-Icons, damit nichts verwechselt wird.

### 3.3 Ersteinrichtung

Die Einrichtung macht ein Erwachsener, das Kind spielt danach.

1. **Willkommen:** „Mathe-Abenteuer für Kinder von 5 bis 8 Jahren. Richten wir kurz ein, wer spielt.“
2. **Kind anlegen:** Name (optional), Tier wählen (6 große Kacheln), „Wie alt ist das Kind?“ mit den Knöpfen **5 · 6 · 7 · 8**. Darunter der Vorschlag: „Wir empfehlen die Stufe {STUFEN[AGE_TO_STUFE[alter]].name}. Sie können das jederzeit ändern.“ Daneben ein Link „Was bedeuten die Stufen?“, der die Tabelle aus Abschnitt 1 in einfachen Worten zeigt.
3. „**Noch ein Kind hinzufügen**“ oder „**Fertig**“.
4. Danach kommt „Wer spielt?“ (bei mehreren Kindern) und Kikos Begrüßung für das Kind.

## 4. Erwachsenen-Bereich (`/erwachsene`)

Mit mehreren Kindern und Stufen braucht es einen kleinen Bereich für Erwachsene. Er enthält bewusst **keine Statistiken**.

- **Zugang:** Zahnrad-Symbol oben rechts (40 px, dezent). Davor eine **Erwachsenen-Frage**: „Für Erwachsene: Wie viel ist 14 × 6?“ (zufällig: zweistellige Zahl × einstellige Zahl, Ergebnis über 60), Eingabe über Zifferntastatur. Für Kinder bis 8 Jahre ist das kaum im Kopf lösbar. Nach richtiger Antwort bleibt der Bereich 10 Minuten offen.
- **Inhalt:**
  1. **Kinder:** Liste der Profile. Pro Kind: Name, Tier, **Stufe** (4 Knöpfe mit Tiericon und Altershinweis), „Alle Stationen freischalten“, „Fortschritt zurücksetzen“, „Profil löschen“ (jeweils mit Bestätigung). Darunter „Kind hinzufügen“.
  2. **Drucken:** führt zu `/erwachsene/drucken` (Inhalt wie `06`, zusätzlich Kind- bzw. Stufenauswahl).
  3. **Daten sichern:** „Sicherung herunterladen“ (JSON-Datei) und „Sicherung laden“. Das schützt vor gelöschten Browserdaten und hilft beim Gerätewechsel.
  4. **Hinweise:** Speicherung nur auf diesem Gerät, Installation als App, Version.
- Routen: `/erwachsene`, `/erwachsene/drucken`, `/erwachsene/kind/:profileId`.

## 5. Aufgabenvarianten: gleiche Geschichte, neue Zahlen

### 5.1 Regel

Jede Stationsaufgabe hat ein optionales Feld:

```ts
interface Task {
  // … wie in 03
  authoredFor: Stufe;               // für welche Stufe die Originalzahlen geschrieben sind (Insel: 3, Bucht: 1)
  variant?: TaskVariant;
}

interface TaskVariant {
    template: TemplateId;           // Vorlage aus 05 oder 10
    bind?: Record<string, string>;  // feste Sachen/Namen, z. B. { A: 'kokosnuss', B: 'bananenbrot' }
    force?: Record<string, unknown>;// feste Eigenschaften, z. B. { carry: true } oder { stimmt: false }
    stufen?: Stufe[];               // nur für diese Stufen erzeugen (Standard: alle der Welt)
}
```

**Welche Version gespielt wird:**

| Situation | Gespielt wird |
|---|---|
| Stufe = `authoredFor` **und** erster Durchgang (`plays === 0`) | Original aus `04` bzw. `11` |
| Stufe = `authoredFor`, Wiederholung | Variante (falls vorhanden), sonst Original |
| Stufe ≠ `authoredFor` | Variante. Unterstützt die Vorlage die Stufe nicht, wird die Aufgabe **übersprungen**. |

- Der Seed der Variante ist `hash(profileId, stationId, taskId, plays)`. Beim Fortsetzen nach einer Pause entstehen also dieselben Zahlen.
- **Invariante (Test):** Jede Station hat für jede Stufe ihrer Welt **mindestens 3** spielbare Aufgaben.
- Varianten übernehmen Szene, Sachen und Namen aus `bind`. Die Texte entstehen aus der Vorlage, sie sind also nicht wortgleich mit dem Original, aber inhaltlich dieselbe Situation.
- Bei Stufe 2 und 4 ist die Fortschrittsanzeige der Station so lang wie die Zahl der spielbaren Aufgaben.

### 5.2 Zuordnung der 45 Inselaufgaben

Vorlagen-IDs aus `05` (Abschnitt 4 und Anhang A) und `10`. „–“ heißt: keine Variante, die Aufgabe ist fest.

| Aufgabe | Vorlage | bind / force | Stufen der Variante |
|---|---|---|---|
| 1.1 | Z1 | – | 2, 3, 4 |
| 1.2 | L1 | `{ ziel: 'rund' }` | 2, 3, 4 |
| 1.3 | Z2 | `{ falle: true }` (weniger Münzen = mehr Geld) | 2, 3, 4 |
| 1.4 | Z1 | – | 2, 3, 4 |
| 1.5 | Z3 | – | 2, 3, 4 |
| 2.1 | A1 | A kokosnuss, B bananenbrot | 2, 3, 4 |
| 2.2 | A1 | A wasser, B fischbroetchen; `{ einPreisUnterEinemEuro: true }` | 3, 4 |
| 2.3 | A5 | `{ count: 2 }` | 2, 3, 4 |
| 2.4 | A1 | A melone, B kokoskeks; `{ carry: true }` | 2, 3, 4 |
| 2.5 | A6 | A banane, B saft | 2, 3, 4 |
| 3.1 | R2 | A eis | 2, 3, 4 |
| 3.2 | R2 | – | 2, 3, 4 |
| 3.3 | R1 | A strandball | 2, 3, 4 |
| 3.4 | R3 | A seifenblasen | 2, 3, 4 |
| 3.5 | R4 | A sonnencreme; `{ stimmt: false }` | 2, 3, 4 |
| 4.1 | Z1 | – | 2, 3, 4 |
| 4.2 | L3 | – | 3, 4 |
| 4.3 | L2 | – | 2, 3, 4 |
| 4.4 | Z4 | – | 2, 3, 4 |
| 4.5 | S1 | A keks, B apfel | 2, 3, 4 |
| 5.1 | G1 | A saft; `{ genau: true, inDerHand: true }` | 2, 3, 4 |
| 5.2 | Z5 | – | 3, 4 |
| 5.3 | G3 | – | 2, 3, 4 |
| 5.4 | G4 | `{ zweiteilig: true }` | 2, 3, 4 |
| 5.5 | G2 | A fernglas, B hut; `{ reicht: false }` | 2, 3, 4 |
| 6.1 | A7 | – | 2, 3, 4 |
| 6.2 | R4 | A muschelarmband; `{ stimmt: true }` | 2, 3, 4 |
| 6.3 | S3 | A eis | 2, 3, 4 |
| 6.4 | S2 | A seil | 2, 3, 4 |
| 6.5 | G2 | A kompass, B karte; `{ reicht: true }` | 2, 3, 4 |
| 7.1 | A3 | A kerze | 2, 3, 4 |
| 7.2 | A5 | `{ count: 3 }` | 3, 4 |
| 7.3 | S1 | A lampenoel, B decke | 2, 3, 4 |
| 7.4 | O1 | – | 2, 3, 4 |
| 7.5 | UE1 | A kekse, B marmelade | 3, 4 |
| 8.1 | K6 | – | 2, 3, 4 |
| 8.2 | K1 | – | 2, 3, 4 |
| 8.3 | K2 | – | 2, 3, 4 |
| 8.4 | K7 | A piratenhut | 2, 3, 4 |
| 8.5 | – | – | keine Variante: nur auf Stufe 3 (Original), auf Stufe 2 und 4 übersprungen |
| 9.1 | S1 | – | 2, 3, 4 |
| 9.2 | K5 | `{ zweiteilig: true }` | 3, 4 |
| 9.3 | L3 | `{ required: 3 }` | 3, 4 |
| 9.4 | K4 | – | 2, 3, 4 |
| 9.5 | K3 | – | 2, 3, 4 |

**Prüfung Mindestanzahl:** Auf Stufe 2 fallen 2.2, 4.2, 5.2, 7.2, 7.5, 8.5, 9.2 und 9.3 weg. Jede Station behält trotzdem mindestens 3 Aufgaben, Station 7 und 9 genau 3 (7.1, 7.3, 7.4 bzw. 9.1, 9.4, 9.5). Auf Stufe 4 fällt nur 8.5 weg.

## 6. Üben mit Stufen

Üben nutzt die **Stufe des Kindes** mit einer kleinen Verschiebung:

- Auswahl „Wie schwer?“: **Etwas leichter** (Stufe − 1) · **Genau richtig** (Stufe) · **Etwas kniffliger** (Stufe + 1). Begrenzt auf 1–4.
- Die **Themen** kommen aus der Stufe des Kindes (`STUFEN[stufe].practiceTopics`). Hat das gewählte Thema auf der verschobenen Stufe keine Vorlage, ist der passende „Wie schwer?“-Knopf deaktiviert (ausgegraut mit Hinweis „Gibt es hier nicht“).
- **„Mehr davon üben“** öffnet das `practiceTopic` der Station. Gibt es das Thema auf der Stufe des Kindes nicht, wird ersatzweise genommen: `knobeln` → `sachaufgaben`, `mengen-zahlen` → `muenzen-zaehlen`.
- Die Themenkarten zeigen bei Stufe 1 und 2 nur Icon und ein Wort und werden beim Antippen vorgelesen.

## 7. Stufenabhängige Darstellung

| Merkmal | Stufe 1 | Stufe 2 | Stufe 3 | Stufe 4 |
|---|---|---|---|---|
| Schrift Geschichte / Frage | 24 / 28 px | 22 / 26 px | 20 / 24 px | 20 / 24 px |
| Vorlesen | automatisch beim Öffnen und bei jeder Rückmeldung | automatisch | per Knopf | per Knopf |
| Zahleneingabe | Zahlenstrahl 0–10 zum Antippen | Tastatur | Tastatur | Tastatur |
| Geldeingabe | – (nur Cent über Zahlenstrahl) | nur Euro-Feld | Euro + Cent | Euro + Cent |
| Antwortkarten | 3, groß mit Bild | 3 | 3 | 4 |
| Tipps | zusätzlich Zählhilfe: Objekte in der Szene antippen markiert sie mit einem Punkt | wie 3 | Text | Text |

**Zahlenstrahl (`numberInput: 'numberline'`):** eine waagerechte Leiste 0–10 mit großen Feldern (mindestens 56 px breit). Passt die Leiste nicht in eine Reihe (unter etwa 700 px Breite), wird sie zweizeilig: 0–5 und 6–10. Antippen wählt die Zahl, sie wird vorgelesen („sieben“) und erscheint groß im Antwortfeld. Danach „Prüfen“.

## 8. Später: Stufe vorschlagen

Noch nicht im ersten Release, aber die Daten werden schon gesammelt (`stats` mit Stufe).

- Löst ein Kind 3 Stationen hintereinander mit höchstens einem Tipp pro Station, zeigt Kiko einmal: „Das klappt richtig gut! Frag doch mal, ob du es schwerer probieren darfst.“
- Die Stufe ändert sich **nie automatisch**. Das entscheidet ein Erwachsener im Erwachsenen-Bereich.
