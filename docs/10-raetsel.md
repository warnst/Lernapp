# 10 – Rätsel

Rätsel bringen Abwechslung neben Sach- und Rechenaufgaben. Es sind bekannte Grundschulformate, die auf der Insel spielen. Etwa die Hälfte dreht sich um Geld, der Rest um Zahlen, Muscheln und Figuren. Der Anteil steht pro Stufe in `levels.ts` (`riddles.moneyShare`).

## 1. Rätselarten

| Typ | Name im Spiel | Idee | ab Stufe |
|---|---|---|---|
| `sequence` | Muster | Wie geht die Reihe weiter? Welches Feld fehlt? | 1 |
| `balance` | Waage | Beide Seiten der Wippe sollen gleich viel wert sein. Was fehlt? | 1 |
| `wall` | Zahlenmauer | Jeder Stein ist die Summe der zwei Steine darunter. | 1 |
| `code` | Zahlenschloss | Mini-Rätsel lösen, die Ergebnisse ergeben den Code. | 1 |
| `triangle` | Rechendreieck | Jede Zahl außen ist die Summe der zwei Punktefelder daneben. | 2 |
| `logic` | Wer hat am meisten? | Aus Sätzen eine Reihenfolge erschließen | 2 |

## 2. Datenmodell (Ergänzung zu `03`, Abschnitt 4)

```ts
export type RiddleType = 'sequence' | 'balance' | 'wall' | 'triangle' | 'logic' | 'code';

// Neue Szenen
type Scene =
  | /* … bestehende … */
  | { kind: 'sequence'; items: SeqItem[] }
  | { kind: 'balance'; left: BalanceSide; right: BalanceSide }
  | { kind: 'clues'; clues: Clue[] };

export interface Clue { symbol: 'muschel' | 'stern' | 'fisch' | 'krebs'; text: string; dots?: [number, number] }

type SeqItem =
  | { kind: 'number'; value: number }
  | { kind: 'money'; cents: Cents }
  | { kind: 'icon'; icon: string }
  | { kind: 'blank' };

interface BalanceSide { pieces?: MoneyPiece[]; objects?: { itemId: string; count: number }; unknown?: number }
// unknown bei pieces: Anzahl fehlender Münzen (je ein „?“-Kreis). Bei objects: immer 1 = ein „?“-Feld für eine unbekannte Menge.

// Neue Antworttypen
export interface NumberAnswer { type: 'number'; correct: number }   // ganze Zahlen, kein Geld; Fehlerhinweise über TaskPart.mistakes

export interface GridAnswer {
  type: 'grid';
  shape: 'wall' | 'triangle';
  unit: 'number' | 'cents';
  cells: { id: string; value: number; given: boolean }[];
  // wall: id = 'r{reihe}c{spalte}', Reihe 0 = unten
  // triangle: ids 'a','b','c' (Punktefelder innen) und 'ab','bc','ca' (außen)
}

export interface CodeAnswer { type: 'code'; digits: number[] }   // 3 oder 4 Räder, Ziffern 0–9
```

`logic` braucht keinen eigenen Typ: Szene `people` (ohne Beträge, mit Avatar) + `choice`, oder `money`/`number` bei Rechenlogik (Stufe 4).

## 3. Bedienung

### Muster (`sequence`)
- Die Reihe steht waagerecht als große Karten in der Szene, das gesuchte Feld ist ein gestrichelter Rahmen mit „?“. Bei mehr als 5 Elementen wird umgebrochen.
- Antwort: `choice` (Bilder oder Zahlen) oder Eingabe (`number` bzw. `money`). Stufe 1 überwiegend `choice`, ab Stufe 2 etwa halb und halb. `force: { antwort }` legt es fest.
- Nach richtiger Antwort springt die Lösung in das leere Feld, und die Reihe wird vorgelesen.

### Waage (`balance`)
- Eine Holzwippe mit zwei Schalen. Liegt links mehr, kippt sie sichtbar nach links. Fehlende Teile sind gestrichelte Kreise mit „?“.
- Antwort: `choice` mit Münzen bzw. Mengenbildern, bei Mengen auch `number` („Wie viele muss … dazulegen?“). Nach der Antwort legt die Animation das Teil bzw. die Menge in die Schale. Ist es richtig, kommt die Wippe ins Gleichgewicht.
- Ist es nicht richtig, kippt die Wippe zur schwereren Seite, sanft und ohne Ton. Das ist selbst schon die Rückmeldung.

### Zahlenmauer (`wall`) und Rechendreieck (`triangle`)
- Gegebene Felder: dicke Schrift auf Sandstein-Fläche. Leere Felder: gestrichelt, antippbar.
- Antippen eines leeren Felds öffnet die passende Eingabe der Stufe (Zahlenstrahl, Tastatur oder Geldeingabe) als Sheet. Der Wert erscheint im Feld.
- „Prüfen“ prüft alle Felder. Richtige Felder werden fest (✓, nicht mehr änderbar), die anderen bleiben bearbeitbar. Rückmeldung: „2 Steine stimmen schon. Schau dir den letzten noch einmal an.“
- Wie bei allen Aufgaben: Fehlversuche führen zu Tipp 1, Tipp 2, Lösungsweg.

### Zahlenschloss (`code`)
- Szene `clues`: 3 oder 4 kleine Rätselkarten, jede mit einem Symbol (Muschel, Stern, Fisch, Krebs).
- Darunter ein Schloss mit Rädern, die dieselben Symbole tragen. Jedes Rad hat ▲/▼-Knöpfe (56 px) und zeigt eine Ziffer 0–9. Wischen nach oben oder unten geht auch.
- „Öffnen“ prüft alle Räder. Stimmt eines nicht: „Das Schloss klemmt noch. Das Rad mit dem Stern stimmt noch nicht.“ Richtig: Das Schloss springt auf.
- Stufe 1: Die Rätselkarten zeigen Punktebilder (`dots: [2, 1]` heißt „●● + ●“) und werden vorgelesen.

### Wer hat am meisten? (`logic`)
- Szene `people`: die Kinder als Avatare mit Namen, ohne Beträge.
- Die Sätze erscheinen einzeln untereinander und werden nacheinander vorgelesen.
- Ab Tipp 2 erscheint die **Ordnungshilfe**: eine leere Treppe mit drei Stufen. Das Kind kann die Avatare per Antippen auf die Stufen stellen (oben = am meisten). Die Hilfe wird nicht geprüft, sie ist nur zum Denken.

## 4. Parameter je Stufe

| Typ | Stufe 1 | Stufe 2 | Stufe 3 | Stufe 4 |
|---|---|---|---|---|
| **Muster** | Bildmuster AB, AAB, ABC; Zahlen +1 / −1 bis 10; Mengen wachsen um 1; Lücke am Ende oder in der Mitte | +2, +5, +10, −1, −2 bis 20; ganze Euro +1 € / +2 € | +5, +10, +20 bis 100; Geld +20 Cent, +50 Cent, −10 Cent | Verdoppeln, +25 Cent, +1,50 €, zwei Regeln im Wechsel (+2, +3, +2, +3) |
| **Waage** | Muscheln zählen (bis 10) oder Cent-Münzen bis 10 Cent, 1 Feld „?“ | ganze Euro (Münzen und Scheine), 1 „?“ | Cent und Euro, 1 „?“ | 2 gleiche „?“-Münzen („Welche zwei gleichen Münzen fehlen?“) |
| **Zahlenmauer** | 2 Steine unten, Summe bis 10, nur der obere Stein fehlt | 3 Steine unten, Spitze bis 20, 1–2 Lücken | 3 unten, Geld in 10-Cent-Schritten, Spitze bis 5 €, 2 Lücken, davon oft 1 unten (rückwärts rechnen) | 4 unten, Zahlen bis 200 oder Geld bis 20 €, 3 Lücken, mindestens 1 unten |
| **Rechendreieck** | – | innen gegeben (bis 10), außen ausrechnen | gemischt gegeben, Zahlen bis 50 oder Geld bis 2 € | nur außen gegeben, innen finden |
| **Zahlenschloss** | 3 Räder, Punktebilder bis 9 | 3 Räder, + und − bis 10 | 4 Räder, Geldfragen mit einstelliger Antwort („Wie viele 20-Cent-Münzen sind 1 €?“) | 4 Räder, Malnehmen und Teilen („Wie viele 50-Cent-Münzen sind 4 €?“) |
| **Logik** | – | 3 Kinder, 2 Sätze „mehr als“, Frage „am meisten“ | 3 Kinder, Frage „am meisten“, „am wenigsten“ oder „in der Mitte“ | 3–4 Kinder mit Beträgen: „Mara hat 3 € mehr als Ben. Ben hat 5 €. Wie viel hat Mara?“ |

Die Grenzen kommen aus `STUFEN[stufe]` (z. B. `money.step`, `numbers.max`). Die Tabelle beschreibt die Startwerte.

## 5. Generatoren (`src/practice/riddles/`)

Ein Generator pro Typ: `generateRiddle(type, stufeConfig, seed): Task`. Alle liefern das normale `Task`-Format, mit einem Teil.

**Pflichtprüfungen in jedem Generator:**
- **Eindeutig lösbar:** Mauer und Dreieck erzeugen erst die volle Lösung, dann werden Lücken entfernt. Ein **Löser** füllt per Propagation auf: Oben = links + rechts, links = oben − rechts, rechts = oben − links; beim Dreieck zusätzlich `a = (ab + ca − bc) / 2`. Eine Lücke wird nur entfernt, wenn der Löser danach weiterhin alles eindeutig füllen kann.
- **Waage:** Es fehlt genau **ein** erlaubtes Stück aus `pieces` (Stufe 4: zwei gleiche Stücke). Bei Mengen (`objects`) fehlt eine Anzahl von 1 bis `numbers.max`. Die Fehloptionen sind andere erlaubte Stücke bzw. Anzahlen ± 1.
- **Muster:** Zahlenreihen: mindestens 3 Elemente vor der Lücke (bei zwei Regeln im Wechsel mindestens 4). Bildmuster: Die Reihe beginnt am Periodenanfang, und vor der Lücke stehen mindestens zwei volle Perioden (AB AB ?, AAB AAB ?).
- **Zahlenschloss:** Jede Rätselkarte hat genau eine einstellige Lösung 0–9. Der Code beginnt nicht mit 0.
- **Logik:** Die Frage hat genau eine Antwort. Ab Stufe 3 legen die Sätze zusätzlich die ganze Reihenfolge eindeutig fest.
- Ganzzahlige Werte, alles innerhalb der Stufengrenzen.

### Beispiele (geprüft)

| Stufe | Typ | Inhalt | Lösung |
|---|---|---|---|
| 1 | Mauer | unten 2 und 3, oben ? | 5 |
| 2 | Mauer | unten 4 · 3 · 5, Mitte 7 · ?, oben ? | 8, 15 |
| 3 | Mauer | unten 1,20 € · ? · 1,50 €, Mitte 2,00 € · 2,30 €, oben ? | 0,80 € (80 Cent), 4,30 € |
| 4 | Mauer | unten 12 · ? · 8 · 30, Mitte 37 · 33 · 38, darüber 70 · ?, oben ? | 25, 71, 141 |
| 2 | Dreieck | innen 3, 5, 4 | außen 8, 9, 7 |
| 4 | Dreieck | außen 8 (a+b), 9 (b+c), 7 (c+a) | innen 3, 5, 4 |
| 3 | Waage | links 50 + 20 Cent, rechts 50 Cent + ? | 20 Cent |
| 2 | Schloss | ★ 3 + 4 · 🐚 10 − 2 · 🐟 5 + 0 | 7 · 8 · 5 |
| 3 | Logik | Emil hat mehr Geld als Lina. Lina hat mehr Geld als Noah. Wer hat am wenigsten? | Noah |

(Die Symbole in der Tabelle stehen nur für die Spiel-Icons. In der App werden gezeichnete Symbole verwendet, keine Emojis.)

### Tipps und Lösungsweg je Typ

| Typ | Tipp 1 | Tipp 2 (konkret zur ersten offenen Stelle) | Lösungsweg |
|---|---|---|---|
| Mauer | Ein Stein ist immer so viel wie die zwei Steine darunter zusammen. | „Rechne {a} + {b}.“ oder, wenn unten etwas fehlt: „Was musst du zu {b} dazurechnen, damit {oben} herauskommt?“ | Alle Schritte der Reihe nach: „4 + 3 = 7. 3 + 5 = 8. 7 + 8 = 15.“ |
| Dreieck | Jede Zahl außen ist so viel wie die zwei Punktefelder daneben zusammen. | „Rechne {a} + {b}.“ / „{außen} − {a} = ?“ | Alle drei Rechnungen |
| Muster | Schau, wie es von einem Feld zum nächsten weitergeht. | je nach Regel: „Es kommt immer {d} dazu.“ / „Es wird immer {d} weniger.“ / „Die Zahl wird immer doppelt so groß.“ / „Es kommt abwechselnd {d1} und {d2} dazu.“ / Bilder: „Sprich das Muster laut: Muschel, Stern, Muschel, Stern …“ | Die Regel + die Reihe mit Lösung |
| Waage | Auf beiden Seiten muss gleich viel liegen. | „Links sind {L}. Rechts sind schon {R}. Was fehlt noch?“ | „{L} − {R} = {x}. Es fehlt {x}.“ |
| Schloss | Löse jedes kleine Rätsel einzeln und stelle die Zahl am passenden Rad ein. | Konkretes Rätsel des ersten falschen Rads: „Beim Stern: 3 + 4 = ?“ | Alle Rätsel mit Ergebnis, dann der Code |
| Logik | Lies jeden Satz einzeln. | „Stell die Kinder auf die Treppe: Wer mehr hat, steht höher.“ (Ordnungshilfe erscheint) | „Emil hat mehr als Lina, Lina mehr als Noah. Also: Emil, Lina, Noah. Noah hat am wenigsten.“ |

**Rückmeldung bei Fehlversuchen:** wie in `01`, Abschnitt 5.5. Bei `grid` zusätzlich die Zählung richtiger Felder, bei `code` das Symbol des ersten klemmenden Rads.

### 5.1 Rätsel als Vorlagen für Varianten

Die Rätsel-Generatoren haben dieselbe Schnittstelle wie die Vorlagen in `05` (`generate(cfg, rng, opts)`) und dieselben IDs wie ihr Typ: `sequence`, `balance`, `wall`, `triangle`, `logic`, `code`. So können sie in Variantentabellen (`11`) und im Bonus-Rätsel genutzt werden.

| Vorlage | `force`-Schlüssel |
|---|---|
| `sequence` | `muster: 'bild' \| 'zahl' \| 'menge' \| 'geld'`, `luecke: 'ende' \| 'mitte'`, `antwort: 'choice' \| 'number' \| 'money'` |
| `balance` | `frage: 'gleich' \| 'fehlt'` (gleich: Ja/Nein „Liegt auf beiden Seiten gleich viel?“), `geld: boolean`, `antwort: 'choice' \| 'number'` |
| `wall`, `triangle` | `luecken: number`, `unten: boolean` (mindestens eine Lücke in der unteren Reihe bzw. innen) |
| `logic` | `frage: 'meisten' \| 'wenigsten' \| 'mitte' \| 'betrag'` |
| `code` | `raeder: 3 \| 4`, `punkte: boolean` (Punktebilder statt Text) |

## 6. Wo Rätsel vorkommen

1. **Üben → Thema „Rätsel“** (neues Thema `raetsel`). Gemischt aus `STUFEN[stufe].riddles.types`. Optional darunter Filter-Chips: Alle · Muster · Waage · Mauer · Dreieck · Schloss · Logik.
2. **Bonus-Rätsel nach jeder Station.** Auf dem Abschlussbildschirm erscheint unter den Knöpfen eine Karte: „Kiko hat noch ein Bonus-Rätsel. Magst du?“ mit **„Ja!“** und **„Später“**.
   - Der Typ wechselt reihum je Station, der Seed kommt aus Profil und Station.
   - Gelöst: Die Station bekommt auf der Karte ein Glitzern, und in den Schätzen gibt es einen **Glitzerstein** („Bonus-Rätsel: 3 von 9“, Gesamtzahl je Welt).
   - „Später“: Das Rätsel bleibt über die Stationskarte erreichbar („Bonus-Rätsel“).
   - Es ist völlig freiwillig. Ohne Bonus-Rätsel geht nichts verloren.
3. **Station 9** (Schatzinsel): Das Bonus-Rätsel ist immer ein **Zahlenschloss** für das Geheimfach der Truhe.
4. **Kleine Bucht** (Stufe 1): Station 5 besteht aus Rätseln (siehe `11`).
5. **Druck:** Mauern, Dreiecke, Muster und Schlösser lassen sich gut auf Papier lösen. Auf der Druckseite steht „Rätselblatt“ als eigene Auswahl (6 Rätsel + Lösungen).

## 7. Tests

- Pro Typ × Stufe × 300 Seeds: alle Pflichtprüfungen aus Abschnitt 5.
- Der Löser für Mauer und Dreieck hat eigene Unit-Tests, inklusive unlösbarer Fälle (dann wirft der Generator neu).
- Die Beispiele aus Abschnitt 5 sind als feste Testfälle hinterlegt.
