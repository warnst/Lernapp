# 05 – Üben: Themen und Aufgabengeneratoren

Im Üben-Bereich werden Aufgaben bei jeder Runde neu erzeugt. Dieselben Generatoren liefern auch die **Varianten der Stationsaufgaben** (`09`, Abschnitt 5). Alle Generatoren liefern **dasselbe `Task`-Format** wie die Stationen (`03`, Abschnitt 4). Der Spiel-Bildschirm muss also nichts Neues können.

Alle Grenzen (Zahlenraum, Preise, Münzen, Übertrag, Antworttypen, Textlänge) kommen aus der **Stufenkonfiguration** `STUFEN` in `src/config/levels.ts` (`09`, Abschnitt 2). In diesem Dokument stehen keine eigenen Grenzwerte, nur Regeln.

## 1. Grundsätze

- **Ganzzahlige Cent** überall. Zufallsbeträge entstehen als `step * zufallsZahl`, nie durch Rundung von Kommazahlen.
- **Saubere Sprache:** Sätze werden aus Vorlagen mit grammatisch korrekten Bausteinen gebaut (Artikel, Fälle, Plural). Keine Sätze mit „ein/e“ oder „(n)“.
- **Gute Fehloptionen:** Falsche Antworten entstehen aus typischen Denkfehlern und bringen ihren Hinweis gleich mit (Abschnitt 5).
- **Abwechslung:** In einer Runde wiederholt sich keine Vorlage zweimal hintereinander, und keine Sache kommt doppelt vor, solange der Katalog reicht.
- **Reproduzierbar:** Jeder Generator bekommt einen Seed (`mulberry32`). Gleicher Seed ergibt gleiche Aufgaben. Das brauchen Tests, Fortsetzen nach einer Pause und Übungsblätter zum Drucken.
- **Stufen-Treue:** Ein Generator, der eine Aufgabe nicht innerhalb der Grenzen der Stufe bauen kann, meldet `unsupported` statt die Grenzen zu verletzen.

```ts
type TemplateId = string;   // 'A1', 'R4', 'M2', …
interface Generator {
  id: TemplateId;
  topic: PracticeTopicId;
  stufen: Stufe[];                                   // wo die Vorlage überhaupt sinnvoll ist
  generate(cfg: StufeConfig, rng: Rng, opts?: { bind?: Record<string, string>; force?: Record<string, unknown> }): Task | 'unsupported';
}
```

## 2. Schwierigkeit im Üben

- Üben nutzt die Stufe des Kindes mit Verschiebung: **Etwas leichter** (−1) · **Genau richtig** (0) · **Etwas kniffliger** (+1), begrenzt auf 1–4 (`09`, Abschnitt 6).
- Angeboten werden nur Themen aus `STUFEN[stufe].practiceTopics` und nur Vorlagen, deren `stufen` die Stufe enthält.
- Innerhalb einer Runde steigt die Schwierigkeit leicht: Die erste Aufgabe kommt immer aus einer einfacheren Vorlage des Themas (Reihenfolge der Vorlagen in der Tabelle = von leicht nach schwer).

## 3. Bausteine

### 3.1 Sachen-Katalog (`content/items.ts`)

Jede Sache bringt Grammatik und Preisbereiche je Stufe mit. Eine Sache kommt nur auf Stufen vor, für die ein Preisbereich eingetragen ist.

```ts
interface Item {
  id: string;
  nom: string;        // 'ein Apfel'
  akk: string;        // 'einen Apfel'
  def: string;        // 'der Apfel' (bestimmter Artikel, für Fragen wie „Welche Farbe hat der Apfel?“)
  plural?: string;    // 'Äpfel' (fehlt = nicht für Mengen)
  prices: Partial<Record<Stufe, [min: Cents, max: Cents]>>;
}
```

| id | Nominativ | Akkusativ | Plural | Stufe 1 | Stufe 2 | Stufe 3 | Stufe 4 |
|---|---|---|---|---|---|---|---|
| bonbon | ein Bonbon | ein Bonbon | Bonbons | 1–5 | – | – | – |
| lolli | ein Lolli | einen Lolli | Lollis | 2–6 | – | – | – |
| kaugummi | ein Kaugummi | einen Kaugummi | Kaugummis | 1–4 | – | – | – |
| murmel | eine Murmel | eine Murmel | Murmeln | 1–5 | – | – | – |
| sticker | ein Sticker | einen Sticker | Sticker | 2–8 | – | – | – |
| muschel | eine Muschel | eine Muschel | Muscheln | 1–6 | 100–300 | 50–150 | – |
| keks | ein Keks | einen Keks | Kekse | 3–8 | 100–200 | 30–90 | – |
| apfel | ein Apfel | einen Apfel | Äpfel | 4–9 | 100–200 | 30–90 | – |
| banane | eine Banane | eine Banane | Bananen | – | 100–200 | 20–60 | – |
| kokosnuss | eine Kokosnuss | eine Kokosnuss | Kokosnüsse | – | 100–300 | 80–250 | 150–400 |
| mango | eine Mango | eine Mango | Mangos | – | 100–300 | 90–250 | 150–400 |
| eis | ein Eis | ein Eis | – | – | 100–300 | 100–250 | 150–450 |
| saft | ein Saft | einen Saft | Säfte | – | 100–300 | 90–200 | 150–400 |
| muffin | ein Muffin | einen Muffin | Muffins | – | 100–300 | 120–250 | 200–450 |
| brot | ein Brot | ein Brot | Brote | – | 200–400 | 150–350 | 250–600 |
| fischbroetchen | ein Fischbrötchen | ein Fischbrötchen | Fischbrötchen | – | 200–500 | 200–400 | 300–700 |
| strandball | ein Strandball | einen Strandball | Strandbälle | – | 300–800 | 250–500 | 400–1200 |
| eimer | ein Sandeimer | einen Sandeimer | Sandeimer | – | 200–600 | 150–400 | 300–900 |
| schaufel | eine Schaufel | eine Schaufel | Schaufeln | – | 100–500 | 100–300 | 200–700 |
| sonnenbrille | eine Sonnenbrille | eine Sonnenbrille | Sonnenbrillen | – | 300–1000 | 300–500 | 800–2500 |
| postkarte | eine Postkarte | eine Postkarte | Postkarten | – | 100–200 | 50–120 | 80–200 |
| stickerheft | ein Stickerheft | ein Stickerheft | Stickerhefte | – | 200–500 | 150–400 | 300–800 |
| muschelkette | eine Muschelkette | eine Muschelkette | Muschelketten | – | 200–800 | 150–500 | 400–1500 |
| kompass | ein Kompass | einen Kompass | Kompasse | – | 300–1000 | 300–500 | 800–2500 |
| seil | ein Seil | ein Seil | Seile | – | 200–600 | 150–450 | 300–1200 |
| laterne | eine Laterne | eine Laterne | Laternen | – | 300–900 | 200–500 | 500–2000 |
| kerze | eine Kerze | eine Kerze | Kerzen | – | 100–200 | 40–120 | 80–300 |
| hut | ein Hut | einen Hut | Hüte | – | 300–900 | 200–500 | 600–2000 |
| buch | ein Buch | ein Buch | Bücher | – | 400–1000 | 300–500 | 600–2000 |
| drachen | ein Drachen | einen Drachen | Drachen | – | 400–1000 | 300–500 | 800–3000 |
| taucherbrille | eine Taucherbrille | eine Taucherbrille | Taucherbrillen | – | – | – | 900–2500 |
| rucksack | ein Rucksack | einen Rucksack | Rucksäcke | – | – | – | 1500–4500 |
| zelt | ein Zelt | ein Zelt | Zelte | – | – | – | 2500–4500 |
| bananenbrot | ein Bananenbrot | ein Bananenbrot | Bananenbrote | – | 200–400 | 150–350 | 250–600 |
| wasser | eine Flasche Wasser | eine Flasche Wasser | Flaschen Wasser | – | 100–200 | 50–150 | 80–250 |
| melone | ein Stück Melone | ein Stück Melone | Stücke Melone | – | 100–300 | 100–250 | 150–400 |
| kokoskeks | ein Kokoskeks | einen Kokoskeks | Kokoskekse | – | 100–200 | 40–120 | 60–200 |
| seifenblasen | eine Dose Seifenblasen | eine Dose Seifenblasen | Dosen Seifenblasen | – | 100–300 | 100–250 | 150–500 |
| sonnencreme | eine Sonnencreme | eine Sonnencreme | – | – | 300–800 | 300–500 | 500–1500 |
| fernglas | ein Fernglas | ein Fernglas | Ferngläser | – | 300–1000 | 300–500 | 1000–3000 |
| muschelarmband | ein Muschel-Armband | ein Muschel-Armband | Muschel-Armbänder | – | 200–600 | 150–400 | 300–1200 |
| karte | eine Karte | eine Karte | Karten | – | 100–500 | 100–300 | 200–800 |
| lampenoel | eine Flasche Lampenöl | eine Flasche Lampenöl | – | – | 200–600 | 200–500 | 400–1500 |
| decke | eine warme Decke | eine warme Decke | warme Decken | – | 300–1000 | 200–500 | 800–3000 |
| kekse | eine Tüte Kekse | eine Tüte Kekse | Tüten Kekse | – | 100–300 | 100–250 | 150–400 |
| marmelade | ein Glas Marmelade | ein Glas Marmelade | Gläser Marmelade | – | 200–400 | 150–350 | 250–600 |
| piratenhut | ein Piratenhut | einen Piratenhut | Piratenhüte | – | 200–600 | 150–400 | 400–1200 |

Die Spalte „def“ (bestimmter Artikel) ist in der Tabelle nicht aufgeführt und wird im Code für jede Sache ergänzt („die Kokosnuss“, „der Saft“, „das Eis“ …). Alle `itemId`s, die in `04` oder in `bind` (`09`, Abschnitt 5.2) vorkommen, müssen im Katalog stehen (Test).

- Gewählter Preis = zufällig im Bereich, gerundet auf `cfg.money.step`, mindestens ein Schritt, höchstens `cfg.money.maxPrice`.
- Stufe 2: nur ganze Euro (`step: 100`).
- Preisbereiche je Stufe sind bewusst hier in den Daten und nicht in `levels.ts`: Es sind Inhaltsdaten mit `Record<Stufe, …>`. Ein Test prüft, dass jeder Bereich innerhalb von `STUFEN[stufe].money.maxPrice` liegt.
- Für Mengen („Lina kauft 3 Kekse“) gilt: Menge × Preis ≤ `maxTotal` und Menge ≤ `cfg.multiply`. Sachen ohne `plural` werden nicht verwendet.
- Fehlt ein Icon, zeigt `ItemCard` ein Paket-Icon (siehe `02`).

### 3.2 Namen (`content/names.ts`)

```ts
const NAMES = [
  { name: 'Lina', pron: 'sie' }, { name: 'Ben', pron: 'er' }, { name: 'Mia', pron: 'sie' },
  { name: 'Emil', pron: 'er' }, { name: 'Noah', pron: 'er' }, { name: 'Ida', pron: 'sie' },
  { name: 'Paul', pron: 'er' }, { name: 'Mara', pron: 'sie' }, { name: 'Yusuf', pron: 'er' },
  { name: 'Aylin', pron: 'sie' }, { name: 'Finn', pron: 'er' }, { name: 'Lea', pron: 'sie' },
] as const;
```

Pronomen am Satzanfang werden großgeschrieben („Sie bezahlt …“). Dafür eine Hilfsfunktion `cap()` verwenden. Die Namen der Profile in der App werden **nie** in Aufgaben verwendet.

### 3.3 Zahlungsmittel im Dativ

| Wert | „bezahlt mit …“ |
|---|---|
| 5 | einer 5-Cent-Münze |
| 10 | einer 10-Cent-Münze |
| 100 | einer 1-Euro-Münze |
| 200 | einer 2-Euro-Münze |
| 500 | einem 5-Euro-Schein |
| 1000 | einem 10-Euro-Schein |
| 2000 | einem 20-Euro-Schein |
| 5000 | einem 50-Euro-Schein |

Die Zahlung wird aus `cfg.money.payments` gewählt und muss größer als der Preis sein.

## 4. Themen und Vorlagen

`{A}`, `{B}` und `{C}` sind Sachen, `{pA}`, `{pB}` und `{pC}` ihre Preise als Token, `{N}` ein Name, `{pron}` das Pronomen.

| Thema | ID | Stufen |
|---|---|---|
| Mengen und Zahlen | `mengen-zahlen` | 1, 2 (Anhang B) |
| Münzen zählen | `muenzen-zaehlen` | 1–4 |
| Preise addieren | `preise-addieren` | 1–4 |
| Rückgeld | `rueckgeld` | 2–4 |
| Münzen legen | `muenzen-legen` | 1–4 |
| Reicht das Geld? | `reicht-das-geld` | 1–4 |
| Sachaufgaben | `sachaufgaben` | 2–4 |
| Knobeln | `knobeln` | 3–4 |
| Rätsel | `raetsel` | 1–4 (siehe `10`) |

### 4.1 Münzen zählen (`muenzen-zaehlen`)

| Vorlage | Stufen | Szene | Geschichte | Frage | Antwort |
|---|---|---|---|---|---|
| Z1 | 1–4 | coins (Stufe 1: 2–3 Cent-Münzen; 2: 2–4 Euro-Münzen/Scheine; 3: 3–5; 4: 4–6) | Kiko hat dieses Geld gefunden. | Wie viel Geld ist das zusammen? | Stufe 1: `choice`/`number`; sonst `choice` oder `money` |
| Z2 | 2–4 | none (Beutel sind die Antwortkarten) | Kiko hat zwei Beutel gefunden. | In welchem Beutel ist mehr Geld? | `choice` (`bags` + Textkarte „In beiden gleich viel“) |
| Z3 | 2–4 | none | – | Tippe die Münzen der Reihe nach an. Fang mit der Münze an, die am wenigsten wert ist. | `order` (4 Münzen mit „Größenfalle“: 5/10 Cent oder 50 Cent/1 €; Stufe 2: Scheine und Euro-Münzen) |
| Z4 | 2–4 | none | Kiko hat drei kleine Geldbörsen gefunden. | In welcher Geldbörse sind genau {Betrag}? | `choice` (`bags`, Labels „Geldbörse 1/2/3“) — Anhang A |
| Z5 | 3–4 | items mit Preisschild in Kommaschreibweise | Auf dem Preisschild steht {Betrag als Text}. | Wie viel ist das? | `choice` — Anhang A |

- Bei Z2 müssen die Beträge verschieden sein. In mindestens jeder zweiten Aufgabe hat der Beutel mit **weniger** Münzen **mehr** Geld.
- **Tipps Z1:** „Fang mit der größten Münze an: {größte}.“ / „Zähle erst die Euro, dann die Cent.“ (ohne Euro: „Zähle weiter: {Teilsummen}.“)
- **Lösungsweg Z1:** „{Münzen mit +} = {Summe}.“

### 4.2 Preise addieren (`preise-addieren`)

| Vorlage | Stufen | Geschichte | Frage |
|---|---|---|---|
| A1 | 1–4 | {cap(A.nom)} kostet {pA}. {cap(B.nom)} kostet {pB}. | Wie viel kosten beide zusammen? |
| A2 | 2–4 | {N} kauft {A.akk} für {pA} und {B.akk} für {pB}. | Wie viel muss {pron} bezahlen? |
| A3 | 2–4 | {N} kauft {n} {A.plural}. {cap(A.nom)} kostet {pA}. | Wie viel kosten {n} {A.plural}? |
| A4 | 3–4 | {N} kauft {A.akk}, {B.akk} und {C.akk}. | Wie viel kostet alles zusammen? (`items`-Szene mit Preisen) |
| A5 | 2–4 | siehe Anhang A (genau X: Sachen auswählen) | |
| A6 | 2–4 | siehe Anhang A (Menge und Zusatz, zweiteilig) | |
| A7 | 2–4 | siehe Anhang A (zwei Kinder legen zusammen) | |

- A3: n von 2 bis `cfg.multiply`. Einzahl und Mehrzahl korrekt: „Wie viel kosten 3 Kekse?“
- **Übertrag:** Nur wenn `cfg.carry`. Dann in mindestens jeder dritten Aufgabe mit Übertrag (`force: { carry: true }` erzwingt ihn).
- **Tipps:** „Rechne zuerst die Euro: {eA} € + {eB} €.“ / „Jetzt die Cent: {cA} Cent + {cB} Cent.“ Bei Übertrag zusätzlich: „{cA + cB} Cent sind mehr als 1 €.“
  - Hat ein Preis keine ganzen Euro, lautet Tipp 1: „{pA} hat keine ganzen Euro. Rechne mit den Cent.“
  - Ohne Cent (Stufe 2) und bei reinen Cent-Beträgen (Stufe 1): „Halte {a} Finger hoch. Dann noch {b} Finger.“ (Stufe 1) bzw. „Rechne {a} + {b}.“ / „Zähle von {a} aus {b} weiter.“
- **Lösungsweg:** „{pA} + {pB} = {Summe}.“ Bei Übertrag: „{cA} Cent + {cB} Cent = {cA+cB} Cent = {format}. Dazu die Euro: {Summe}.“

### 4.3 Rückgeld (`rueckgeld`)

| Vorlage | Stufen | Geschichte | Frage | Antwort |
|---|---|---|---|---|
| R1 | 2–4 | {N} kauft {A.akk} für {pA}. {cap(pron)} bezahlt mit {Zahlung.dativ}. | Wie viel Rückgeld bekommt {pron}? | `choice` / `money` |
| R2 | 2–4 | Du kaufst {A.akk} für {pA}. Du bezahlst mit {Zahlung.dativ}. | Wie viel Rückgeld bekommst du? | `choice` / `money` |
| R3 | 2–4 | {N} kauft {A.akk} für {pA}. {cap(pron)} bezahlt mit {Zahlung.dativ}. | Lege das Rückgeld mit Münzen. | `pay` (Rückgeld höchstens 2 €, Stufe 4: 5 €; Palette ohne Scheine) |
| R4 | 2–4 | {N} kauft {A.akk} für {pA} und bezahlt mit {Zahlung.dativ}. {cap(pron)} bekommt {genanntes Rückgeld} zurück. | a) Stimmt das Rückgeld? b) Wie viel Rückgeld muss {pron} bekommen? (b nur, wenn a „Nein“) | `choice yesno` (+ `money`) |

- R4: Ohne `force` ist das genannte Rückgeld zu 50 % richtig. Sonst weicht es um einen Schritt, 50 Cent oder 1 € ab (Stufe 2: 1 € oder 2 €). Ist es richtig, hat die Aufgabe nur Teil a. `force: { stimmt: true | false }` legt es fest.
- **Tipps (Ergänzen):** „Zähle von {pA} weiter bis {nächsterEuro}.“ / „Von {pA} bis {nächsterEuro} sind es {x}. Dann noch {y} bis {Zahlung}.“ Bei ganzen Euro: „Zähle von {pA} in Euro-Schritten bis {Zahlung}.“
- **Lösungsweg:** „{pA} + {x} = {nächsterEuro}. {nächsterEuro} + {y} = {Zahlung}. Rückgeld: {Rückgeld}.“

### 4.4 Münzen legen (`muenzen-legen`)

| Vorlage | Stufen | Frage | Antwort |
|---|---|---|---|
| L1 | 1–4 | Lege genau {Betrag} mit Münzen. | `pay` (Stufe 1–2 mit Summenanzeige). `force: { exactCount: 1 }`: „Lege {Betrag} mit nur einer Münze.“ `force: { ziel: 'rund' }`: Betrag ist ein runder Wert (1 €, 2 €, 50 Cent …) und die gleichwertige Münze fehlt in der Palette. |
| L2 | 2–4 | Lege {Betrag} mit so wenigen Münzen wie möglich. | `pay` + `minimal` |
| L3 | 3–4 | Lege {Betrag} auf zwei verschiedene Arten. Die {größte passende Münze} darfst du nicht benutzen. | `pay-variants`, required 2 (Stufe 4: 3; `force: { required }` legt es fest) |

- Beträge und Palette kommen aus `cfg.money` (Stufe 1: 2–10 Cent mit 1, 2, 5, 10 Cent; Stufe 2: 2–20 € mit Euro-Münzen und Scheinen).
- L3: Die ausgeschlossene Münze fehlt in der Palette. Der Generator prüft mit `ways()`, dass genug Möglichkeiten existieren.
- Geschichte zufällig aus: „Kiko braucht Kleingeld für den Kiosk.“ / „Im Münzschlitz muss genau der richtige Betrag landen.“ / „Tante Polly möchte passend bezahlt werden.“ In der kleinen Bucht (Stufe 1): „Kiko braucht Kleingeld für seinen Laden.“ / „Krümel möchte passend bezahlt werden.“

### 4.5 Reicht das Geld? (`reicht-das-geld`)

| Vorlage | Stufen | Geschichte | Frage | Antwort |
|---|---|---|---|---|
| G1 | 1–4 | {N} hat {Budget}. {cap(pron)} möchte {A.akk} für {pA} kaufen. (Stufe 1: „Du hast {Budget}. {cap(A.nom)} kostet {pA}.“, immer mit `hand`-Szene) | Reicht das Geld? | `choice yesno` (+ `force: { zweiteilig: true }`: b) „Wie viel Geld fehlt?“ / „Wie viel Geld bleibt übrig?“, auf Stufe 1 als `number`: „Wie viel Cent fehlen dir?“ / „Wie viel Cent bleiben übrig?“) |
| G2 | 2–4 | {N} hat {Budget}. {cap(pron)} möchte {A.akk} für {pA} und {B.akk} für {pB} kaufen. | a) Reicht das Geld für beides? b) Wie viel Geld bleibt übrig? / Wie viel Geld fehlt? | `yesno` + `money` |
| G3 | 2–4 | Du hast {Budget}. | Tippe alle Sachen an, für die dein Geld reicht. | `select affordable` (4–5 Sachen, mindestens eine kostet genau das Budget) |
| G4 | 2–4 | {N1} hat {X}. {N2} hat {Y}. | Wer hat mehr Geld? (`force: { zweiteilig: true }` oder Stufe 4: + „Wie viel mehr?“) | `choice` (+ `money`) |

- G1/G2: Etwa die Hälfte reicht, die andere Hälfte nicht (`force: { reicht }` legt es fest). Bei G1 ist in jeder vierten Aufgabe das Budget **genau** gleich dem Preis (Kiko ergänzt: „Es reicht genau!“). Mit `force: { genau: true, inDerHand: true }` liegt das Budget als Münzen in der Hand (Szene `hand`). Bei G2 ist das Budget nie genau gleich der Summe, damit Teil b nie 0 ergibt.
- G4: Die Beträge sind „Zahlendreher“ voneinander, wenn möglich (3,40 € / 4,30 €), sonst ähnlich.

### 4.6 Sachaufgaben (`sachaufgaben`)

| Vorlage | Stufen | Geschichte | Teile |
|---|---|---|---|
| S1 | 2–4 | {N} hat {Zahlung}. {cap(pron)} kauft {A.akk} für {pA} und {B.akk} für {pB}. | a) Wie viel kostet beides zusammen? b) Wie viel Geld bleibt {N} übrig? |
| S2 | 2–4 | {N} hat {k} Murmeln und {Budget}. {cap(pron)} kauft {A.akk} für {pA}. | a) {N} will wissen, wie viel Geld {pron} noch hat. Welche Angabe brauchst du dafür nicht? (`choice`) b) Wie viel Geld hat {N} noch? |
| S3 | 2–4 | {N} hat {Budget}. {cap(pron)} kauft {A.akk} für {pA}. | a) Welche Frage kannst du mit dieser Geschichte beantworten? (`choice` mit 1 passenden und 2 unpassenden Fragen) b) Rechne sie aus. |
| S4 | 3–4 | {N} kauft {n} {A.plural}. {cap(A.nom)} kostet {pA}. {cap(pron)} bezahlt mit {Zahlung.dativ}. | a) Wie viel kosten {n} {A.plural}? b) Wie viel Rückgeld bekommt {pron}? |
| S5 | 4 | {N} hat {Budget}. {cap(pron)} kauft {n} {A.plural} für je {pA} und {B.akk} für {pB}. | a) Wie viel kosten die {A.plural}? b) Wie viel kostet alles? c) Wie viel bleibt übrig? |
| UE1 | 3–4 | siehe Anhang A (Überschlagen) | |

**Pool unpassender Fragen (S3):** „Wie alt ist {N}?“, „Wie viele Geschwister hat {N}?“, „Welche Farbe hat {A.def}?“, „Wie heißt der Verkäufer?“

S2: Die Anzahl der Murmeln ist mindestens 2.

### 4.7 Knobeln (`knobeln`)

| Vorlage | Stufen | Inhalt | Antwort |
|---|---|---|---|
| K1 Tintenfleck | 2–4 | Szene `note`: „{a} + ▢ = {b}“ oder „{b} − ▢ = {a}“. Frage: Welcher Betrag ist unter dem Fleck? | `money` |
| K2 Rückwärts | 2–4 | {N} hatte Geld im Beutel. {cap(pron)} hat {x} ausgegeben. Jetzt hat {pron} noch {y}. Frage: Wie viel Geld war am Anfang im Beutel? | `money` |
| K3 Münzrätsel | 2–4 | (Stufe 2: „Ich bin eine Münze oder ein Schein …“)  „Ich bin eine Münze, mehr wert als {u}, aber weniger als {o}. Welche bin ich?“ | `choice coins` (genau eine Münze dazwischen) |
| K4 Zwei Münzen | 2–4 | (Stufe 2: „zwei Münzen oder Scheine“) „Gib mir genau zwei Münzen. Zusammen sollen sie {Betrag} wert sein.“ | `pay` mit `exactCount: 2` (nur Beträge mit genau einer Lösung) |
| K5 Doppelt | 3–4 | {cap(A.nom)} kostet {pA}. {cap(B.nom)} kostet doppelt so viel. Frage: Wie viel kosten beide zusammen? (`force: { zweiteilig: true }`: a) Wie viel kostet {B.def}? b) …) | `money` |
| K6 | 2–4 | siehe Anhang A (Welche Münze fehlt?) | |
| K7 | 2–4 | siehe Anhang A (fehlendes Geld legen) | |

- Das Thema „Knobeln“ wird im Üben ab Stufe 3 angeboten. Die Vorlagen ab Stufe 2 dienen den Stationsvarianten.
- **K3-Paare** berechnet der Generator aus `cfg.money.pieces`: zwei Werte, zwischen denen genau ein erlaubtes Stück liegt (z. B. 10 Cent und 50 Cent → 20 Cent).

## 5. Fehloptionen und Fehlerhinweise (`distractors.ts`)

Jede Regel liefert einen Wert und einen Hinweis. Ein Generator ruft die passenden Regeln auf, filtert und wählt `cfg.choiceCount − 1` aus (bei `choice`). Bei `money` und `number` werden alle gültigen Regeln als `mistakes` hinterlegt.

| Regel | Für | Wert | Hinweis |
|---|---|---|---|
| `euroOff` | Addition, Zählen | richtig ± 100 | „Zähle die Euro noch einmal.“ |
| `forgotCarry` | Addition mit Übertrag | richtig − 100 | „{cA} Cent + {cB} Cent sind mehr als 1 €. Vergiss den Euro aus den Cent nicht.“ |
| `centDigit` | Addition | Euro gleich, Cent als einstellige Zahl (3,50 € → 3,05 €) | „{c} Cent schreibt man mit zwei Ziffern hinter dem Komma.“ |
| `countStep` | Zählen | richtig ± kleinster Münzwert | „Zähle die Münzen noch einmal, eine nach der anderen.“ |
| `countOne` | Stufe 1, Mengen | richtig ± 1 | „Hast du etwas übersehen oder doppelt gezählt? Tippe jedes einzeln an.“ |
| `addedInstead` | Rückgeld, Rest, weg | Preis + Zahlung bzw. a + b | „Du hast zusammengezählt. Hier wird es weniger.“ |
| `subtractedInstead` | Addition, dazu | a − b | „Hier kommt etwas dazu. Dann wird es mehr.“ |
| `priceAsChange` | Rückgeld | Preis | „{p} ist der Preis. Das Rückgeld ist das, was übrig bleibt.“ |
| `naiveSubtract` | Rückgeld mit „Borgen“ | Euro und Cent getrennt abgezogen (5,00 − 3,20 → 2,20 €) | „Zähle lieber vom Preis aus weiter bis {Zahlung}.“ |
| `changeEuroOff` | Rückgeld | richtig + 100 | „Fast! Zähle zuerst bis zum nächsten Euro, dann weiter.“ |
| `oneLess` / `oneMore` | Mengen (A3, S4, S5) | (n − 1) · p bzw. (n + 1) · p | „Das sind erst {n−1} {Plural}.“ (bei n − 1 = 1: „Das ist erst {A.nom}.“) / „Das wären {n+1} {Plural}.“ |

**Filter für Fehloptionen:** ≥ 0 (bei `number` auch 0 erlaubt, wenn sinnvoll), ≠ richtig, untereinander verschieden, ≤ 2 × `maxTotal` bzw. ≤ `numbers.max` bei Zahlenstrahl. Reichen die Regeln nicht, wird mit `richtig ± step` aufgefüllt, mit dem Richtungshinweis („etwas zu viel“ / „etwas zu wenig“).

## 6. Ablauf einer Übungsrunde

```ts
function buildRound(topic: PracticeTopicId, stufe: Stufe, count: 5 | 10, seed: number): Task[]
```

1. Die Vorlagen des Themas sammeln, deren `stufen` die Stufe enthalten.
2. Reihum mischen (keine Vorlage zweimal hintereinander), die erste Aufgabe aus der ersten Hälfte der Vorlagenliste. Hat ein Thema auf der Stufe nur eine Vorlage, entfällt diese Regel. Dann dürfen keine zwei Aufgaben mit denselben Zahlen aufeinander folgen.
3. Jede Aufgabe prüft vor der Rückgabe ihre Invarianten (`03`, Abschnitt 4) und die Stufengrenzen. Schlägt die Prüfung fehl, wird neu gewürfelt (höchstens 20 Versuche, dann eine andere Vorlage).
4. Die Aufgaben-IDs lauten `p-{topic}-s{stufe}-{seed}-{i}`.

## 7. Tests für Generatoren

Für **jede Vorlage × jede ihrer Stufen × 300 Seeds**:
- Alle Invarianten aus `03` sind erfüllt.
- Richtige Antwort ≥ 0, ≤ `maxTotal` bzw. `numbers.max`, ganzzahlig, im Stufenschritt. Nur erlaubte Münzen und Scheine kommen vor.
- Geschichte höchstens `maxStoryWords` Wörter. Nur erlaubte Antworttypen.
- Kein Text enthält `undefined`, `NaN`, `{{` ohne Auflösung oder doppelte Leerzeichen. Verbotene Grammatikmuster: `/\bein (Kokosnuss|Banane|Mango|Schaufel|Laterne|Kerze|Murmel|Muschel|Taucherbrille)\b/`, `/\beinen (Eis|Brot|Seil|Buch|Bonbon|Zelt)\b/`.
- Stufe 2: keine Cent-Beträge. Stufe 1: Beträge und Zahlen bis 10, Münzbilder nur aus `cfg.money.pieces`. Ohne `cfg.carry`: kein Übertrag.
- Alle `itemId`s aus `04` und aus `bind` stehen im Katalog. Alle Preisbereiche liegen innerhalb von `maxPrice`.
- `yesno`-Aufgaben ohne `force`: Über 300 Seeds liegt der Anteil „Ja“ zwischen 35 % und 65 %.
- Gleicher Seed ergibt identische Aufgaben (Snapshot).
- `force` und `bind` aus der Variantentabelle in `09` und `11` werden respektiert.

---

## Anhang A – Zusätzliche Vorlagen für die Inselvarianten

| ID | Thema | Stufen | Geschichte | Frage / Teile | Antwort und Regeln |
|---|---|---|---|---|---|
| **Z4** | muenzen-zaehlen | 2–4 | Kiko hat drei kleine Geldbörsen gefunden. | In welcher Geldbörse sind genau {Betrag}? | `choice bags`, feste Labels „Geldbörse 1/2/3“, kein shuffle. Die richtige Position wird per Seed gewählt. Die anderen weichen um einen Schritt und um eine Münze ab. Hinweis: „In dieser Geldbörse sind {Summe}. Das sind {Diff} zu viel/wenig.“ |
| **Z5** | muenzen-zaehlen | 3–4 | Auf dem Preisschild steht {Betrag wörtlich, z. B. 0,45 €}. | Wie viel ist das? | `choice`, Labels wörtlich: „45 Cent“ ✔ · „4,50 €“ → „Vor dem Komma steht eine 0. Das heißt: 0 Euro.“ · „45 €“ → „Hinter dem Komma stehen die Cent.“ Stufe 4 auch 1,05 € ↔ „105 Cent“. |
| **A5** | preise-addieren | 2–4 | {N} hat genau {Ziel}. {cap(pron)} möchte {count} Sachen kaufen. Es soll nichts übrig bleiben. | Wähle {count} Sachen, die zusammen genau {Ziel} kosten. | `select sum`; 5–6 Sachen; mindestens eine, möglichst zwei Lösungen; `count` aus `force` (Standard 2; 3 nur ab Stufe 3). |
| **A6** | preise-addieren | 2–4 | {N} kauft {n} {A.plural}. {cap(A.nom)} kostet {pA}. | a) Wie viel kosten {n} {A.plural}? b) Zusatz: „Dazu kauft {pron} noch {B.akk} für {pB}.“ Wie viel muss {N} jetzt insgesamt bezahlen? | 2× `money`; n ≤ `cfg.multiply`. |
| **A7** | preise-addieren | 2–4 | {N1} und {N2} legen ihr Geld zusammen. {N1} hat {X}. {N2} hat {Y}. | Wie viel Geld haben beide zusammen? | `money`; Fehler `forgotCarry`, `subtractedInstead`. |
| **O1** | preise-addieren | 2–4 | Auf {N}s Einkaufszettel stehen vier Sachen mit Preisen. | Tippe sie der Reihe nach an. Fang mit der billigsten Sache an. | `order`; ab Stufe 3 haben mindestens zwei Preise denselben Euro-Betrag (Vergleich über die Cent). Genitiv bei Namen auf -s/-x: „Yusufs“, aber nie „Finns's“ (Hilfsfunktion `genitiv()`). |
| **UE1** | sachaufgaben | 3–4 | {N} kauft {A.akk} für {pA} und {B.akk} für {pB}. | Ungefähr wie viel kostet beides? Du musst nicht genau rechnen. | `choice`: „ungefähr {gerundete Summe}“ ✔, „ungefähr {gerundet − 2 €}“ (mindestens 1 €), „ungefähr {gerundet × 2}“. Preise liegen höchstens 10 Cent neben ganzen Euro (x,90 / x,95 / x,05 / x,10). |
| **K6** | knobeln | 2–4 | {cap(A.nom)} kostet {pA}. Du hast {Münzen in Worten}. | Welche Münze fehlt dir noch, damit du genau bezahlen kannst? | `choice coins` (Stufe 2: Münzen und Scheine, Frage „Welche Münze oder welcher Schein fehlt …?“). Fehlbetrag = genau ein erlaubtes Stück. Fehloptionen: benachbarte Stücke mit Hinweis „Mit {x} hättest du {Summe}.“ |
| **K7** | knobeln | 2–4 | {N} hat schon {H} in der Hand. {cap(A.nom)} kostet {pA}. | Lege das Geld, das {N} noch fehlt. | `pay`, showTotal false; Fehlbetrag ≤ 2 € (Stufe 4: ≤ 5 €). |

## Anhang B – Vorlagen für Stufe 1 (und 2): Mengen, Zahlen, Münzen kennen

| ID | Thema | Stufen | Szene | Geschichte / Frage | Antwort und Regeln |
|---|---|---|---|---|---|
| **M1** | mengen-zahlen | 1–2 | objects: eine Gruppe (Stufe 1: 3–10; Stufe 2: 8–20, in Fünferreihen angeordnet) | {Ort-Satz des Dings}, z. B. „Am Ufer liegen Muscheln.“ / „Im Wasser schwimmen Fische.“ / Wie viele {Plural} siehst du? | `choice` (3 Zahlen: richtig, ±1) oder `force: { eingabe: 'number' }`. Fehler `countOne`. |
| **M2** | mengen-zahlen | 1–2 | none | Kiko hat zwei Eimer mit {Plural}. / In welchem Eimer sind mehr {Plural}? | `choice bags` mit `objects` + Textkarte „Gleich viele“. In jeder fünften Aufgabe sind es gleich viele. |
| **M3** | mengen-zahlen | 1–2 | objects: zwei Gruppen | Kiko findet {a} {Plural}. Dann findet er noch {b}. / Wie viele {Plural} hat Kiko jetzt? | `number`; a, b ≥ 2; a + b ≤ `numbers.max`; Fehler `countOne`, `subtractedInstead`. |
| **M4** | mengen-zahlen | 1–2 | objects mit `leaving: b` (oder Geld: `force: { geld: true }` → hand-Münzen + Sache) | Im Wasser sind {a} Fische. {b} schwimmen weg. / Wie viele Fische bleiben da? (Geld: „{N} hat {{a}}. {cap(pron)} kauft {A.akk} für {{b}}.“ / „Wie viel Cent hat {pron} noch?“) | `number`; b ≥ 2 (sonst Satz „Ein Fisch schwimmt weg.“); Fehler `addedInstead`, `countOne`. |
| **N1** | mengen-zahlen | 1–2 | sequence mit Zahlen | Kiko zählt. / Welche Zahl kommt nach der {n}? bzw. vor der {n}? | `choice`: bei „nach“ (n − 1, n + 1 ✔, n + 2), bei „vor“ (n − 2, n − 1 ✔, n + 1); alle Optionen zwischen 0 und `numbers.max`. Hinweise wie in `11`, B4.3. |
| **C1** | muenzen-zaehlen | 1–2 | none | Kiko sucht eine bestimmte Münze. / Tippe die {Wert}-Münze an. | `choice coins` mit 3 Stücken aus `cfg.money.pieces`; `force: { euro: true }`: gesucht ist 1 € oder 2 €. Hinweis bei falschem Stück: „Auf dieser Münze steht {Zahl}. Suche die Münze mit der {Zahl gesucht}.“ |
| **C2** | muenzen-zaehlen | 1–2 | none | Zwei Münzen liegen nebeneinander. / Welche Münze ist mehr wert? | `choice coins`, 2 Stücke; in mindestens jeder zweiten Aufgabe ist die physisch größere Münze weniger wert (5/10 Cent, 50 Cent/1 €). |
| **O2** | mengen-zahlen | 1–2 | none | Kiko hat drei Häufchen gemacht. / Tippe zuerst das Häufchen mit den wenigsten {Plural} an. | `order` mit `objects`; drei verschiedene Anzahlen ≤ `numbers.max`, Abstand ≥ 2. |

**Dinge für Mengen-Aufgaben** (`content/things.ts`, mit Singular, Plural und Ort-Satz): Muschel/Muscheln („Am Ufer liegen Muscheln.“), Seestern/Seesterne („Im Sand liegen Seesterne.“), Fisch/Fische („Im Wasser schwimmen Fische.“), Krebs/Krebse („Am Strand krabbeln Krebse.“), Stein/Steine („Am Ufer liegen Steine.“), Feder/Federn („Im Sand liegen Federn.“), Möwe/Möwen („Am Himmel fliegen Möwen.“), Boot/Boote („Im Hafen liegen Boote.“).

## Anhang C – `force`-Schlüssel

| Vorlage | Schlüssel | Wirkung |
|---|---|---|
| Z1 | `antwort: 'choice' \| 'number' \| 'money'` | Antwortart festlegen |
| Z2 | `falle: true` | Beutel mit weniger Münzen hat mehr Geld |
| L1 | `exactCount: n`, `ziel: 'rund'` | siehe 4.4 |
| L3 | `required: n` | Anzahl Möglichkeiten |
| A1 | `carry: true`, `einPreisUnterEinemEuro: true` | Übertrag erzwingen / ein Preis unter 1 € |
| A5 | `count: 2 \| 3` | Anzahl Sachen |
| R4 | `stimmt: boolean` | genanntes Rückgeld richtig oder nicht |
| G1 | `reicht`, `genau`, `inDerHand`, `zweiteilig` | siehe 4.5 |
| G2 | `reicht: boolean` | |
| G4, K5 | `zweiteilig: true` | zweiter Teil mit Rechnung |
| M1 | `eingabe: 'number'` | Zahlenstrahl statt Karten |
| M4 | `geld: true` | Geld statt Fische |
| C1 | `euro: true` | gesucht ist 1 € oder 2 € |
| Rätsel | siehe `10`, Abschnitt 5.1 | |

Unbekannte Schlüssel lassen den Generator mit einem Fehler abbrechen (Test), damit Tippfehler in Variantentabellen auffallen.
