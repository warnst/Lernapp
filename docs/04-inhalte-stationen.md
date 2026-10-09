# 04 – Inhalte: Die 9 Stationen

Alle Texte sind fertig formuliert und alle Rechnungen sind geprüft. **Bitte wörtlich übernehmen** und in `src/content/worlds/schatzinsel/` als TypeScript-Daten (jede Aufgabe mit `authoredFor: 3` und `variant` laut `09`, Abschnitt 5.2) nach dem Modell aus `03` anlegen.

## Lesehilfe für dieses Dokument

- `{{120}}` ist ein Geld-Token (siehe `03`, Abschnitt 5.1). Es wird als „1,20 €“ angezeigt.
- **Typ** nennt den Antworttyp und die Parameter.
- Bei `choice` ist die richtige Option mit **✔** markiert. Nach dem Pfeil `→` steht der spezifische Hinweis für eine nicht richtige Option.
- **Fehler** (nur bei `money`): typische falsche Werte in Cent → Hinweis.
- **Tipp 1 / Tipp 2**, **Lösungsweg** und **Lob** (= `praise`) entsprechen den Feldern im Datenmodell.
- Mehrteilige Aufgaben haben die Teile **a)** und **b)**. „Zusatz“ entspricht `lead`.

## Überblick

| # | Station | Fähigkeit (`skillLabel`) | Fundstück | Übungsthema | Min. |
|---|---|---|---|---|---|
| 1 | Muschelstrand | Münzen erkennen und zählen | Glitzermuschel | muenzen-zaehlen | 6 |
| 2 | Markt am Palmenstrand | Preise zusammenrechnen | Strohhut | preise-addieren | 7 |
| 3 | Kokos-Kiosk | Rückgeld berechnen | Bambusflöte | rueckgeld | 7 |
| 4 | Die geheimnisvolle Geldbörse | Beträge mit verschiedenen Münzen legen | Goldener Schlüssel | muenzen-legen | 8 |
| 5 | Tante Pollys Laden | Prüfen, ob das Geld reicht | Bunte Feder | reicht-das-geld | 8 |
| 6 | Die Rätselbrücke | Sachaufgaben verstehen und prüfen | Kompass | sachaufgaben | 9 |
| 7 | Der Leuchtturm | Mehrere Einkäufe planen | Fernrohr | sachaufgaben | 9 |
| 8 | Die Piratenhöhle | Fehlende Beträge finden | Schatzkarte | knobeln | 9 |
| 9 | Die Schatztruhe | Knobeln mit allem, was du kannst | Goldene Krone | knobeln | 10 |

**Abwechslung der Antworttypen**

| Station | A1 | A2 | A3 | A4 | A5 |
|---|---|---|---|---|---|
| 1 | choice | pay | choice (bags) | money | order |
| 2 | choice | money | select (sum) | choice | money + money |
| 3 | choice | choice | money | pay | choice + money |
| 4 | money | pay-variants | pay (minimal) | choice (bags) | money + money |
| 5 | choice | choice | select (affordable) | choice + money | choice + money |
| 6 | money | choice (yesno) | choice + money | choice + money | choice + money |
| 7 | money | select (sum) | money + money | order | choice |
| 8 | choice (coins) | money | money | pay | money + money |
| 9 | money + money | money + money | pay-variants | pay (exactCount) | choice (coins) |

---

## Station 1 – Muschelstrand

- **id:** `muschelstrand` · **icon:** `station-muschel` · **minutes:** 6
- **skillLabel:** Münzen erkennen und zählen
- **intro:**
  1. Hallo, ich bin Kiko! Ich zeige dir die geheime Schatzinsel.
  2. Am Strand hat jemand Münzen verloren. Hilfst du mir, sie zu zählen?
- **findling:** `glitzermuschel` · Glitzermuschel · „Im Sand glitzert etwas: eine Glitzermuschel. Sie gehört jetzt dir.“
- **recap:** Du hast Münzen erkannt und zusammengezählt.

### 1.1 Drei Münzen im Sand
- **id:** `s1-t1` · **difficulty:** 1
- **Szene:** coins `[50, 20, 20]`
- **Geschichte:** Kiko hat drei Münzen im Sand gefunden.
- **Frage:** Wie viel Geld ist das zusammen?
- **Typ:** choice, layout `cards`, shuffle
  - ✔ `{{90}}`
  - `{{70}}` → Es liegen zwei 20-Cent-Münzen da. Hast du beide mitgezählt?
  - `{{72}}` → Schau genau hin: Beide kleinen Münzen sind 20-Cent-Münzen, keine 2-Cent-Münzen.
- **Tipp 1:** Fang mit der größten Münze an: 50 Cent.
- **Tipp 2:** Jetzt zählst du weiter: 50, 70, 90.
- **Lösungsweg:** 50 Cent + 20 Cent + 20 Cent = 90 Cent.
- **Lob:** Toll! Du hast mit der größten Münze angefangen.

### 1.2 Die Muschelkette
- **id:** `s1-t2` · **difficulty:** 1
- **Szene:** items `[{ muschelkette, "Muschelkette", 100 }]`
- **Geschichte:** Am Strand gibt es eine Muschelkette für {{100}}. Eine 1-Euro-Münze hat Kiko nicht.
- **Frage:** Lege genau 1 € mit den Münzen auf Kikos Tablett.
- **Typ:** pay · target `100` · palette `[50, 20, 10, 5]` · showTotal `true`
- **Tipp 1:** 1 Euro sind 100 Cent. Wie viele Cent liegen schon auf dem Tablett?
- **Tipp 2:** Probier es mit 50-Cent-Münzen. Wie viele brauchst du für 100 Cent?
- **Lösungsweg:** 1 € sind 100 Cent. Zum Beispiel: 50 Cent + 50 Cent = 100 Cent.
- **Lob:** Super! 100 Cent sind genau 1 Euro.

### 1.3 Zwei Beutel
- **id:** `s1-t3` · **difficulty:** 1
- **Szene:** none (die Beutel sind die Antwortkarten)
- **Geschichte:** Kiko hat zwei Beutel gefunden. Im Anker-Beutel ist eine Münze. Im Stern-Beutel sind vier Münzen.
- **Frage:** In welchem Beutel ist mehr Geld?
- **Typ:** choice, layout `bags`, kein shuffle
  - ✔ „Anker-Beutel“ · icon `anker` · pieces `[100]`
  - „Stern-Beutel“ · icon `stern` · pieces `[50, 20, 20, 5]` → Im Stern-Beutel sind mehr Münzen. Aber sind es auch mehr Cent? Zähle nach: 50 + 20 + 20 + 5.
  - „In beiden gleich viel“ (Textkarte) → Zähle den Stern-Beutel genau: 50 + 20 + 20 + 5. Sind das 100 Cent?
- **Tipp 1:** Mehr Münzen heißt nicht immer mehr Geld.
- **Tipp 2:** 1 Euro sind 100 Cent. Wie viele Cent sind im Stern-Beutel?
- **Lösungsweg:** Im Anker-Beutel ist 1 €, das sind 100 Cent. Im Stern-Beutel sind 50 + 20 + 20 + 5 = 95 Cent. 100 Cent sind mehr als 95 Cent.
- **Lob:** Gut aufgepasst! Wenige Münzen können mehr wert sein als viele.

### 1.4 Noch mehr Glitzer
- **id:** `s1-t4` · **difficulty:** 2
- **Szene:** coins `[200, 100, 50, 10]`
- **Geschichte:** Im Sand glitzern noch vier Münzen.
- **Frage:** Wie viel Geld ist das zusammen?
- **Typ:** money · correct `360`
- **Fehler:**
  - `351` → Schau auf die kleinste Münze: Da steht 10. Das sind 10 Cent.
  - `460` → Zähle die Euro noch einmal: eine 2-Euro-Münze und eine 1-Euro-Münze.
- **Tipp 1:** Zähle zuerst die Euro: 2 € + 1 €.
- **Tipp 2:** Jetzt die Cent: 50 Cent + 10 Cent.
- **Lösungsweg:** 2 € + 1 € = 3 €. 50 Cent + 10 Cent = 60 Cent. Zusammen sind das 3,60 €.
- **Lob:** Super! Erst die Euro, dann die Cent. So behältst du den Überblick.

### 1.5 Münzen in einer Reihe
- **id:** `s1-t5` · **difficulty:** 2
- **Szene:** none (die Münzen sind die Antwortkarten)
- **Geschichte:** Kiko will seine Münzen ordnen.
- **Frage:** Tippe die Münzen der Reihe nach an. Fang mit der Münze an, die am wenigsten wert ist.
- **Typ:** order · direction `asc` · entries (gemischt anzeigen, in echter Größe):
  - `m10` · „10 Cent“ · 10 · piece 10
  - `m5` · „5 Cent“ · 5 · piece 5
  - `m50` · „50 Cent“ · 50 · piece 50
  - `m100` · „1 Euro“ · 100 · piece 100
- **Tipp 1:** Achtung: Große Münzen sind nicht immer mehr wert. Lies die Zahl auf der Münze.
- **Tipp 2:** Die 5-Cent-Münze ist größer als die 10-Cent-Münze, aber weniger wert.
- **Lösungsweg:** 5 Cent, 10 Cent, 50 Cent, 1 €. Die 50-Cent-Münze ist sogar größer als die 1-Euro-Münze. Trotzdem ist 1 € mehr wert.
- **Lob:** Klasse! Du hast auf die Zahl geschaut und nicht auf die Größe.

> Wichtig: Die Münzen müssen im echten Größenverhältnis gezeichnet sein (siehe `02`, 6.2), sonst funktioniert diese Aufgabe nicht.

---

## Station 2 – Markt am Palmenstrand

- **id:** `markt` · **icon:** `station-markt` · **minutes:** 7
- **skillLabel:** Preise zusammenrechnen
- **intro:**
  1. Auf dem Markt duftet es nach Kokos und frischem Brot.
  2. Hier kaufen wir Proviant für unsere Reise. Rechnest du die Preise aus?
- **findling:** `strohhut` · Strohhut · „Die Marktfrau schenkt dir einen Strohhut. Jetzt bist du gut gegen die Sonne geschützt.“
- **recap:** Du hast Preise zusammengerechnet.

### 2.1 Kokosnuss und Bananenbrot
- **id:** `s2-t1` · **difficulty:** 1
- **Szene:** items `[kokosnuss "Kokosnuss" 120, bananenbrot "Bananenbrot" 230]`
- **Geschichte:** Eine Kokosnuss kostet {{120}}. Ein Bananenbrot kostet {{230}}.
- **Frage:** Wie viel kosten beide zusammen?
- **Typ:** choice, layout `cards`, shuffle
  - ✔ `{{350}}`
  - `{{450}}` → Schau auf die Euro: 1 € + 2 € sind 3 €.
  - `{{305}}` → 20 Cent + 30 Cent sind 50 Cent. Wie schreibt man 3 Euro und 50 Cent?
- **Tipp 1:** Rechne zuerst die Euro: 1 € + 2 €.
- **Tipp 2:** Jetzt kommen 20 Cent + 30 Cent dazu.
- **Lösungsweg:** 1 € + 2 € = 3 €. 20 Cent + 30 Cent = 50 Cent. Zusammen sind das 3,50 €.
- **Lob:** Toller Rechenweg: Du hast zuerst die Euro und dann die Cent gerechnet.

### 2.2 Wasser und Fischbrötchen
- **id:** `s2-t2` · **difficulty:** 2
- **Szene:** items `[wasser "Wasser" 80, fischbroetchen "Fischbrötchen" 210]`
- **Geschichte:** Eine Flasche Wasser kostet {{80}}. Ein Fischbrötchen kostet {{210}}.
- **Frage:** Wie viel kostet beides zusammen?
- **Typ:** money · correct `290`
- **Fehler:**
  - `218` → 80 Cent sind 80 Cent, nicht 8 Cent. Rechne 10 Cent + 80 Cent.
  - `390` → Das Wasser kostet weniger als 1 Euro. Es bleibt bei 2 Euro.
- **Tipp 1:** Beim Wasser gibt es keine ganzen Euro, nur 80 Cent.
- **Tipp 2:** Das Fischbrötchen kostet 2 € und 10 Cent. Rechne 10 Cent + 80 Cent.
- **Lösungsweg:** 2,10 € + 80 Cent = 2,90 €, denn 10 Cent + 80 Cent = 90 Cent.

### 2.3 Genau 3 Euro
- **id:** `s2-t3` · **difficulty:** 2
- **Szene:** none (die Sachen sind die Auswahlkarten)
- **Geschichte:** Kiko hat genau {{300}}. Er möchte zwei Sachen kaufen. Es soll nichts übrig bleiben.
- **Frage:** Wähle zwei Sachen, die zusammen genau 3 € kosten.
- **Typ:** select · rule `sum` · count `2` · target `300` · items:
  - `kokosnuss` „Kokosnuss“ 120 · `mango` „Mango“ 180 · `eis` „Eis“ 150 · `saft` „Saft“ 140 · `muffin` „Muffin“ 160
  - Lösungen (geprüft): Kokosnuss + Mango, Saft + Muffin
- **Tipp 1:** Die Cent müssen zusammen genau einen Euro ergeben. Schau auf die Cent hinter dem Komma.
- **Tipp 2:** Probier es mit der Kokosnuss für 1,20 €. Welche Sache passt dazu?
- **Lösungsweg:** Kokosnuss und Mango: 1,20 € + 1,80 € = 3 €. Es geht auch mit Saft und Muffin: 1,40 € + 1,60 € = 3 €.
- **Lob:** Stimmt genau! Übrigens gibt es noch eine zweite Lösung. Findest du sie?

### 2.4 Melone und Keks
- **id:** `s2-t4` · **difficulty:** 2
- **Szene:** items `[melone "Melone" 160, kokoskeks "Kokoskeks" 70]`
- **Geschichte:** Ein Stück Melone kostet {{160}}. Ein Kokoskeks kostet {{70}}.
- **Frage:** Wie viel kostet beides zusammen?
- **Typ:** choice, layout `cards`, shuffle
  - ✔ `{{230}}`
  - `{{130}}` → 60 Cent + 70 Cent sind 130 Cent. Das ist mehr als 1 Euro! Dazu kommt noch der Euro von der Melone.
  - `{{220}}` → Rechne die Cent noch einmal: 60 + 70.
- **Tipp 1:** 60 Cent + 70 Cent sind mehr als 100 Cent.
- **Tipp 2:** 130 Cent sind 1 € und 30 Cent. Jetzt kommt noch der Euro von der Melone dazu.
- **Lösungsweg:** 60 Cent + 70 Cent = 130 Cent = 1,30 €. Dazu 1 € von der Melone: 2,30 €.
- **Lob:** Klasse! Du hast gemerkt, dass aus 100 Cent ein Euro wird.

### 2.5 Bananen und Saft
- **id:** `s2-t5` · **difficulty:** 2
- **Szene:** items `[banane "Banane" 40, quantity 3]` (der Saft kommt nur im Text von Teil b vor)
- **Geschichte:** Lina kauft drei Bananen. Eine Banane kostet {{40}}.
- **a) Frage:** Wie viel kosten drei Bananen?
  - **Typ:** money · correct `120`
  - **Fehler:** `80` → Das sind erst zwei Bananen. Lina kauft drei. · `160` → Das wären vier Bananen. Lina kauft drei.
  - **Tipp 1:** Rechne 40 Cent + 40 Cent + 40 Cent.
  - **Tipp 2:** 40, 80 … wie geht es weiter?
  - **Lösungsweg:** 40 + 40 + 40 = 120 Cent. Das sind 1,20 €.
- **b) Zusatz:** Dazu kauft Lina noch einen Saft für {{145}}.
  - **Frage:** Wie viel muss Lina jetzt insgesamt bezahlen?
  - **Typ:** money · correct `265`
  - **Fehler:** `185` → Du hast nur eine Banane gerechnet. Nimm das Ergebnis aus Teil a: 1,20 €. · `145` → Das ist nur der Saft. Die Bananen kommen noch dazu.
  - **Tipp 1:** Nimm das Ergebnis aus Teil a: 1,20 €. Dazu kommen 1,45 €.
  - **Tipp 2:** 1 € + 1 € = 2 €. 20 Cent + 45 Cent = 65 Cent.
  - **Lösungsweg:** 1,20 € + 1,45 € = 2,65 €.
  - **Lob:** Stark! Du hast zwei Rechenschritte hintereinander gelöst.

---

## Station 3 – Kokos-Kiosk

- **id:** `kiosk` · **icon:** `station-kiosk` · **minutes:** 7
- **skillLabel:** Rückgeld berechnen
- **intro:**
  1. Am Kokos-Kiosk bezahlen alle mit großen Münzen und Scheinen.
  2. Dann gibt es Rückgeld. Hilfst du beim Nachzählen?
- **findling:** `bambusfloete` · Bambusflöte · „Der Kiosk schenkt dir eine Bambusflöte. Tüüüt!“
- **recap:** Du hast Rückgeld ausgerechnet. Der Trick: vom Preis aus weiterzählen.

### 3.1 Ein Eis
- **id:** `s3-t1` · **difficulty:** 1
- **Szene:** items `[eis "Eis" 150]` · paidWith `[200]`
- **Geschichte:** Ein Eis kostet {{150}}. Du bezahlst mit einer 2-Euro-Münze.
- **Frage:** Wie viel Rückgeld bekommst du?
- **Typ:** choice, layout `cards`, shuffle
  - ✔ `{{50}}`
  - `{{150}}` → 1,50 € ist der Preis vom Eis. Das Rückgeld ist das, was von deinen 2 € übrig bleibt.
  - `{{60}}` → Zähle von 1,50 € in 10er-Schritten bis 2 €: 1,60, 1,70, 1,80, 1,90, 2,00.
- **Tipp 1:** Zähle vom Preis aus weiter bis 2 €.
- **Tipp 2:** Von 1,50 € bis 2 € fehlen noch ein paar Cent. Wie viele?
- **Lösungsweg:** Von 1,50 € bis 2 € sind es 50 Cent. Du bekommst 50 Cent zurück.
- **Lob:** Super! Du hast vom Preis aus weitergezählt.

### 3.2 Proviant bezahlen
- **id:** `s3-t2` · **difficulty:** 2
- **Szene:** items `[kokosnuss "Kokosnuss" 120, bananenbrot "Bananenbrot" 230]` · paidWith `[500]`
- **Geschichte:** Eine Kokosnuss und ein Bananenbrot kosten zusammen {{350}}. Du bezahlst mit einem 5-Euro-Schein.
- **Frage:** Wie viel Rückgeld bekommst du?
- **Typ:** choice, layout `cards`, shuffle
  - ✔ `{{150}}`
  - `{{250}}` → Zähle von 3,50 € weiter: Bis 4 € sind es 50 Cent. Bis 5 € ist es noch 1 €.
  - `{{850}}` → Du hast zusammengezählt. Beim Rückgeld fragen wir: Wie viel bleibt von den 5 € übrig?
- **Tipp 1:** Zähle von 3,50 € weiter bis 4 €.
- **Tipp 2:** Von 4 € bis 5 € ist es noch 1 €. Wie viel ist es zusammen?
- **Lösungsweg:** Von 3,50 € bis 4 € sind es 50 Cent. Von 4 € bis 5 € ist es 1 €. Rückgeld: 50 Cent + 1 € = 1,50 €.

### 3.3 Der Strandball
- **id:** `s3-t3` · **difficulty:** 2
- **Szene:** items `[strandball "Strandball" 320]` · paidWith `[500]`
- **Geschichte:** Ben kauft einen Strandball für {{320}}. Er bezahlt mit einem 5-Euro-Schein.
- **Frage:** Wie viel Rückgeld bekommt Ben?
- **Typ:** money · correct `180`
- **Fehler:**
  - `280` → Fast! Von 3,20 € bis 4 € sind es 80 Cent. Von 4 € bis 5 € noch 1 €.
  - `820` → Du hast zusammengezählt. Beim Rückgeld wird es weniger.
  - `220` → Zähle lieber von 3,20 € aus weiter bis 5 €.
- **Tipp 1:** Zähle von 3,20 € bis 4 €. Wie viele Cent sind das?
- **Tipp 2:** Von 3,20 € bis 4 € sind es 80 Cent. Dann noch 1 € bis 5 €.
- **Lösungsweg:** 3,20 € + 80 Cent = 4 €. 4 € + 1 € = 5 €. Ben bekommt 80 Cent + 1 € = 1,80 € zurück.

### 3.4 Seifenblasen
- **id:** `s3-t4` · **difficulty:** 2
- **Szene:** items `[seifenblasen "Seifenblasen" 130]` · paidWith `[200]`
- **Geschichte:** Mia kauft Seifenblasen für {{130}}. Sie bezahlt mit einer 2-Euro-Münze.
- **Frage:** Lege das Rückgeld für Mia mit Münzen.
- **Typ:** pay · target `70` · palette `[50, 20, 10, 5, 2, 1]` · showTotal `false`
- **Tipp 1:** Rechne zuerst aus, wie viel Rückgeld Mia bekommt: von 1,30 € bis 2 €.
- **Tipp 2:** Mia bekommt 70 Cent. Welche Münzen ergeben 70 Cent?
- **Lösungsweg:** Von 1,30 € bis 2 € sind es 70 Cent. Zum Beispiel: 50 Cent + 20 Cent.
- **Lob:** Prima! Genau so zählt man an der Kasse Rückgeld.

### 3.5 Stimmt das Rückgeld?
- **id:** `s3-t5` · **difficulty:** 3
- **Szene:** items `[sonnencreme "Sonnencreme" 460]` · paidWith `[500]`
- **Geschichte:** Ida kauft Sonnencreme für {{460}}. Sie bezahlt mit einem 5-Euro-Schein. Sie bekommt {{50}} zurück.
- **a) Frage:** Stimmt das Rückgeld?
  - **Typ:** choice, layout `yesno`, kein shuffle
    - Ja, das stimmt → Mach die Probe: 4,60 € + 50 Cent. Sind das genau 5 €?
    - ✔ Nein, das stimmt nicht
  - **Tipp 1:** Mach die Probe: Preis + Rückgeld muss genau 5 € ergeben.
  - **Tipp 2:** Rechne 4,60 € + 50 Cent. Ist das genau 5 €?
  - **Lösungsweg:** 4,60 € + 50 Cent = 5,10 €. Das ist mehr als 5 €. Ida hat 10 Cent zu viel bekommen.
- **b) Frage:** Wie viel Rückgeld muss Ida bekommen?
  - **Typ:** money · correct `40`
  - **Fehler:** `140` → Von 4,60 € bis 5 € ist es weniger als ein Euro. · `60` → Mit 60 Cent wären es 5,20 €. Zähle von 4,60 € nur bis 5 €.
  - **Tipp 1:** Zähle von 4,60 € bis 5 €.
  - **Tipp 2:** 4,70, 4,80, 4,90, 5,00. Wie viele 10-Cent-Schritte sind das?
  - **Lösungsweg:** Von 4,60 € bis 5 € sind es 40 Cent.
  - **Lob:** Prima! Erst mit der Probe geprüft, dann richtig gerechnet.

---

## Station 4 – Die geheimnisvolle Geldbörse

- **id:** `geldboerse` · **icon:** `station-geldboerse` · **minutes:** 8
- **skillLabel:** Beträge mit verschiedenen Münzen legen
- **intro:**
  1. Hinter einer Palme liegt eine alte Geldbörse. Sie ist voller Münzen.
  2. Und drinnen klimpert noch etwas anderes. Was das wohl ist?
- **findling:** `goldener-schluessel` · Goldener Schlüssel · „Ganz unten in der Geldbörse liegt ein goldener Schlüssel. Wozu er wohl passt?“
- **recap:** Du hast herausgefunden: Ein Betrag lässt sich mit ganz verschiedenen Münzen legen.

### 4.1 Was ist in der Geldbörse?
- **id:** `s4-t1` · **difficulty:** 2
- **Szene:** coins `[200, 50, 20, 20]`, label „Geldbörse“
- **Geschichte:** In der Geldbörse sind vier Münzen.
- **Frage:** Wie viel Geld ist in der Geldbörse?
- **Typ:** money · correct `290`
- **Fehler:**
  - `270` → Es sind zwei 20-Cent-Münzen. Hast du beide gezählt?
  - `92` → Die größte Münze ist eine 2-Euro-Münze, nicht 2 Cent.
- **Tipp 1:** Zuerst die Euro: 2 €.
- **Tipp 2:** Jetzt die Cent: 50 + 20 + 20.
- **Lösungsweg:** 2 € + 50 Cent + 20 Cent + 20 Cent = 2,90 €.

### 4.2 Viele Wege zu 1 Euro
- **id:** `s4-t2` · **difficulty:** 2
- **Szene:** none
- **Geschichte:** Kiko möchte 1 € mit kleinen Münzen legen. Eine 1-Euro-Münze hat er nicht.
- **Frage:** Lege 1 € auf zwei verschiedene Arten.
- **Typ:** pay-variants · target `100` · palette `[50, 20, 10]` · required `2` · showTotal `true`
- **Tipp 1:** Eine Möglichkeit: zwei Münzen, die gleich aussehen.
- **Tipp 2:** Für die zweite Möglichkeit: Probier es mit 20-Cent-Münzen oder 10-Cent-Münzen.
- **Lösungsweg:** Zum Beispiel: 50 Cent + 50 Cent. Oder: 50 Cent + 20 Cent + 20 Cent + 10 Cent. Oder: fünf 20-Cent-Münzen.
- **Lob:** Klasse! Es gibt viele Wege zu 1 Euro.

### 4.3 So wenige Münzen wie möglich
- **id:** `s4-t3` · **difficulty:** 3
- **Szene:** none
- **Geschichte:** Die Geldbörse ist schon ziemlich voll.
- **Frage:** Lege 75 Cent mit so wenigen Münzen wie möglich.
- **Typ:** pay · target `75` · palette `[50, 20, 10, 5, 2, 1]` · showTotal `true` · minimal (Minimum: 3 Münzen, geprüft)
- Rückmeldung bei richtiger Summe, aber zu vielen Münzen (`partial`): Richtig, das sind 75 Cent! Geht es auch mit weniger Münzen?
- **Tipp 1:** Nimm zuerst die größte Münze, die passt.
- **Tipp 2:** Nach 50 Cent fehlen noch 25 Cent. Welche zwei Münzen ergeben 25 Cent?
- **Lösungsweg:** 50 Cent + 20 Cent + 5 Cent = 75 Cent. Das sind nur drei Münzen.
- **Lob:** Super! Mit den großen Münzen zuerst brauchst du die wenigsten Münzen.

### 4.4 Welche Geldbörse passt?
- **id:** `s4-t4` · **difficulty:** 2
- **Szene:** none
- **Geschichte:** Kiko hat drei kleine Geldbörsen gefunden.
- **Frage:** In welcher Geldbörse sind genau {{150}}?
- **Typ:** choice, layout `bags`, kein shuffle (die richtige steht bewusst in der Mitte)
  - „Geldbörse 1“ · pieces `[100, 50, 20]` → In dieser Geldbörse sind 1,70 €. Das sind 20 Cent zu viel.
  - ✔ „Geldbörse 2“ · pieces `[100, 20, 20, 10]`
  - „Geldbörse 3“ · pieces `[50, 50, 20, 20]` → In dieser Geldbörse sind 1,40 €. Da fehlen 10 Cent.
- **Tipp 1:** Zähle jede Geldbörse einzeln. Fang mit der größten Münze an.
- **Tipp 2:** 1,50 € sind 1 € und 50 Cent.
- **Lösungsweg:** 1 € + 20 Cent + 20 Cent + 10 Cent = 1,50 €.

### 4.5 Keks und Apfel
- **id:** `s4-t5` · **difficulty:** 3
- **Szene:** items `[keks "Keks" 85, apfel "Apfel" 55]` · hand `[200, 100]`
- **Geschichte:** In der Geldbörse sind {{300}}. Kiko kauft einen Keks für {{85}} und einen Apfel für {{55}}.
- **a) Frage:** Wie viel kosten Keks und Apfel zusammen?
  - **Typ:** money · correct `140`
  - **Fehler:** `130` → Rechne 85 + 55 noch einmal. Tipp: 85 + 15 = 100. · `40` → 85 Cent + 55 Cent sind mehr als 1 €.
  - **Tipp 1:** Zähle zuerst bis 1 €: 85 Cent + 15 Cent = 100 Cent.
  - **Tipp 2:** Von den 55 Cent hast du 15 verbraucht. Es bleiben noch 40 Cent.
  - **Lösungsweg:** 85 Cent + 55 Cent = 140 Cent. Das sind 1,40 €.
- **b) Frage:** Wie viel Geld bleibt in der Geldbörse?
  - **Typ:** money · correct `160`
  - **Fehler:** `440` → Du hast zusammengezählt. Kiko gibt Geld aus, also wird es weniger. · `260` → Zähle noch einmal von 1,40 € bis 3 €. Bis 2 € sind es 60 Cent.
  - **Tipp 1:** Ziehe von 3 € den Preis aus Teil a ab.
  - **Tipp 2:** Zähle von 1,40 € bis 2 €. Dann weiter bis 3 €.
  - **Lösungsweg:** Von 1,40 € bis 2 € sind es 60 Cent. Von 2 € bis 3 € ist es 1 €. Es bleiben 1,60 €.
  - **Lob:** Stark! Du hast zwei Rechenschritte hintereinander gelöst.

---

## Station 5 – Tante Pollys Laden

- **id:** `pollys-laden` · **icon:** `station-laden` · **minutes:** 8
- **skillLabel:** Prüfen, ob das Geld reicht
- **intro:**
  1. Das ist der Laden von meiner Tante Polly! Hier gibt es Federn, Pfeifen und Postkarten.
  2. Bevor wir etwas kaufen, prüfen wir: Reicht unser Geld?
- **findling:** `bunte-feder` · Bunte Feder · „Tante Polly schenkt dir eine bunte Feder. Sie lacht: ‚Die hat Kiko extra für dich verloren!‘“
- **recap:** Du hast geprüft, ob das Geld reicht, und Beträge verglichen.

### 5.1 Ein Saft
- **id:** `s5-t1` · **difficulty:** 2
- **Szene:** items `[saft "Saft" 145]` · hand `[100, 20, 20, 5]`
- **Geschichte:** Ein Saft kostet {{145}}. Du hast eine 1-Euro-Münze, zwei 20-Cent-Münzen und eine 5-Cent-Münze.
- **Frage:** Reicht dein Geld genau für den Saft?
- **Typ:** choice, layout `cards`, kein shuffle
  - ✔ Ja, genau
  - Nein, es fehlt Geld → Zähle dein Geld noch einmal: 1 € + 20 Cent + 20 Cent + 5 Cent.
  - Es bleibt Geld übrig → Zähle dein Geld noch einmal: 1 € + 20 Cent + 20 Cent + 5 Cent.
- **Tipp 1:** Zähle dein Geld zusammen. Fang mit dem Euro an.
- **Tipp 2:** 1 € + 40 Cent + 5 Cent. Wie viel ist das?
- **Lösungsweg:** 1 € + 20 Cent + 20 Cent + 5 Cent = 1,45 €. Das ist genau der Preis.

### 5.2 Das Preisschild
- **id:** `s5-t2` · **difficulty:** 2
- **Szene:** items `[postkarte "Postkarte" 85, priceFormat "eur"]` → Preisschild zeigt „0,85 €“
- **Geschichte:** Auf dem Preisschild einer Postkarte steht 0,85 €.
- **Frage:** Wie viel ist das?
- **Typ:** choice, layout `cards`, shuffle · Labels **wörtlich, ohne Token**
  - ✔ 85 Cent
  - 8,50 € → Vor dem Komma steht eine 0. Das heißt: 0 Euro. 8,50 € wären mehr als 8 Euro!
  - 85 € → Hinter dem Komma stehen die Cent. Vor dem Komma steht 0 Euro.
- **Tipp 1:** Vor dem Komma stehen die Euro, hinter dem Komma die Cent.
- **Tipp 2:** Vor dem Komma steht eine 0. Wie viele Cent stehen dahinter?
- **Lösungsweg:** 0,85 € heißt: 0 Euro und 85 Cent. Also 85 Cent.
- **Lob:** Genau! Du kannst Preisschilder lesen.

### 5.3 Was kann ich mir leisten?
- **id:** `s5-t3` · **difficulty:** 3
- **Szene:** none (Sachen sind die Auswahlkarten)
- **Geschichte:** Du hast {{200}}. Du möchtest dir eine Sache aussuchen.
- **Frage:** Tippe alle Sachen an, für die deine 2 € reichen.
- **Typ:** select · rule `affordable` · budget `200` · items:
  - `federstift` „Federstift“ 190 · `vogelpfeife` „Vogelpfeife“ 210 · `postkarte` „Postkarte“ 85 · `stickerheft` „Stickerheft“ 200 · `muschelkette` „Muschelkette“ 250
  - Richtige Auswahl (geprüft): Federstift, Postkarte, Stickerheft
- **Tipp 1:** Schau bei jedem Preis zuerst auf die Euro.
- **Tipp 2:** Alles, was weniger als 2 € kostet, reicht. Und genau 2 € reicht auch.
- **Lösungsweg:** Federstift (1,90 €), Postkarte (85 Cent) und Stickerheft (2 €) kannst du kaufen. Die Vogelpfeife und die Muschelkette kosten mehr als 2 €.
- **Lob:** Super! Du hast an das Stickerheft für genau 2 € gedacht.

### 5.4 Emil und Mara
- **id:** `s5-t4` · **difficulty:** 3
- **Szene:** people `[Emil 340, Mara 430]`
- **Geschichte:** Emil hat {{340}}. Mara hat {{430}}.
- **a) Frage:** Wer hat mehr Geld?
  - **Typ:** choice, layout `cards`, kein shuffle
    - Emil → Schau zuerst auf die Euro: Emil hat 3 Euro, Mara hat 4 Euro.
    - ✔ Mara
    - Beide gleich viel → Die Zahlen sehen ähnlich aus, aber sie sind verschieden. Vergleiche die Euro.
  - **Tipp 1:** Vergleiche zuerst die Euro vor dem Komma.
  - **Tipp 2:** 3 Euro oder 4 Euro: Was ist mehr?
  - **Lösungsweg:** Mara hat 4,30 €, Emil hat 3,40 €. 4 Euro sind mehr als 3 Euro.
- **b) Frage:** Wie viel Geld hat Mara mehr als Emil?
  - **Typ:** money · correct `90`
  - **Fehler:** `110` → Rechne nicht Euro und Cent getrennt. Zähle von 3,40 € weiter bis 4,30 €. · `770` → Du hast zusammengezählt. Gesucht ist der Unterschied.
  - **Tipp 1:** Zähle von 3,40 € bis 4 €.
  - **Tipp 2:** Von 3,40 € bis 4 € sind es 60 Cent. Von 4 € bis 4,30 € noch 30 Cent.
  - **Lösungsweg:** 60 Cent + 30 Cent = 90 Cent. Mara hat 90 Cent mehr.
  - **Lob:** Toll! Weiterzählen klappt auch beim Vergleichen.

### 5.5 Fernglas und Hut
- **id:** `s5-t5` · **difficulty:** 3
- **Szene:** items `[fernglas "Fernglas" 380, hut "Hut" 150]` · hand `[500]`
- **Geschichte:** Paul hat {{500}}. Er möchte ein Fernglas für {{380}} und einen Hut für {{150}} kaufen.
- **a) Frage:** Reicht Pauls Geld für beides?
  - **Typ:** choice, layout `yesno`, kein shuffle
    - Ja, es reicht → Rechne zuerst aus, was beides zusammen kostet: 3,80 € + 1,50 €.
    - ✔ Nein, es reicht nicht
  - **Tipp 1:** Rechne aus, was beides zusammen kostet.
  - **Tipp 2:** 3 € + 1 € = 4 €. 80 Cent + 50 Cent = 130 Cent = 1,30 €.
  - **Lösungsweg:** 3,80 € + 1,50 € = 5,30 €. Das ist mehr als 5 €.
- **b) Frage:** Wie viel Geld fehlt Paul?
  - **Typ:** money · correct `30`
  - **Fehler:** `530` → 5,30 € kostet alles zusammen. Wie viel fehlt von 5 € bis 5,30 €?
  - **Tipp 1:** Paul hat 5 €. Alles zusammen kostet 5,30 €.
  - **Tipp 2:** Von 5 € bis 5,30 €: Wie viele Cent sind das?
  - **Lösungsweg:** Von 5 € bis 5,30 € sind es 30 Cent. Paul fehlen 30 Cent.

---

## Station 6 – Die Rätselbrücke

- **id:** `raetselbruecke` · **icon:** `station-bruecke` · **minutes:** 9
- **skillLabel:** Sachaufgaben verstehen und prüfen
- **intro:**
  1. Über die Schlucht führt eine wackelige Brücke. Hier wohnt die Krabbe Kalle.
  2. Kalle ruft: „Nur wer meine Rätsel löst, darf hinüber!“
- **findling:** `kompass` · Kompass · „Kalle ist beeindruckt und schenkt dir einen Kompass. Jetzt findest du immer den Weg.“
- **recap:** Du hast Sachaufgaben genau gelesen und Rechnungen geprüft.

### 6.1 Mia und Ben legen zusammen
- **id:** `s6-t1` · **difficulty:** 3
- **Szene:** people `[Mia 250, Ben 180]`
- **Geschichte:** Mia und Ben legen ihr Geld zusammen. Mia hat {{250}}. Ben hat {{180}}.
- **Frage:** Wie viel Geld haben beide zusammen?
- **Typ:** money · correct `430`
- **Fehler:**
  - `330` → 50 Cent + 80 Cent sind mehr als 1 €. Vergiss den Euro aus den Cent nicht.
  - `70` → Du hast abgezogen. Mia und Ben legen zusammen, also rechnen wir plus.
- **Tipp 1:** 2 € + 1 € = 3 €. Jetzt die Cent: 50 + 80.
- **Tipp 2:** 50 Cent + 80 Cent = 130 Cent. Das ist 1 € und 30 Cent.
- **Lösungsweg:** 2,50 € + 1,80 € = 4,30 €.

### 6.2 Das Muschel-Armband
- **id:** `s6-t2` · **difficulty:** 3
- **Szene:** items `[muschelarmband "Muschel-Armband" 275]` · paidWith `[500]`
- **Geschichte:** Lea kauft ein Muschel-Armband für {{275}}. Sie bezahlt mit einem 5-Euro-Schein und bekommt {{225}} zurück.
- **Frage:** Stimmt das Rückgeld?
- **Typ:** choice, layout `yesno`, kein shuffle
  - ✔ Ja, das stimmt
  - Nein, das stimmt nicht → Mach die Probe: Preis + Rückgeld. Rechne 2,75 € + 2,25 €.
- **Tipp 1:** Mach die Probe: Rechne Preis + Rückgeld.
- **Tipp 2:** 75 Cent + 25 Cent = 1 €. Und 2 € + 2 € = 4 €.
- **Lösungsweg:** 2,75 € + 2,25 € = 5 €. Das Rückgeld stimmt.
- **Lob:** Genau! Mit der Probe hast du es sicher geprüft.

### 6.3 Die richtige Frage
- **id:** `s6-t3` · **difficulty:** 3
- **Szene:** items `[eis "Eis" 150]` · hand `[200, 200]`
- **Geschichte:** Noah hat {{400}}. Er kauft ein Eis für {{150}}.
- **a) Frage:** Kalle fragt: „Welche Frage kannst du mit dieser Geschichte beantworten?“
  - **Typ:** choice, layout `cards`, shuffle
    - ✔ Wie viel Geld hat Noah noch?
    - Wie viel Geld hat Noahs Schwester? → Von Noahs Schwester steht nichts in der Geschichte.
    - Wie alt ist Noah? → Das steht nicht in der Geschichte. Hier geht es um Geld!
  - **Tipp 1:** Lies die Geschichte noch einmal. Was wissen wir über Noah?
  - **Tipp 2:** Wir wissen, wie viel Geld Noah hat und was er kauft.
  - **Lösungsweg:** Noah hat 4 € und gibt 1,50 € aus. Also können wir ausrechnen, wie viel er noch hat.
- **b) Frage:** Wie viel Geld hat Noah noch?
  - **Typ:** money · correct `250`
  - **Fehler:** `550` → Noah gibt Geld aus. Dann hat er weniger, nicht mehr. · `350` → Zähle noch einmal von 1,50 € bis 4 €.
  - **Tipp 1:** Rechne 4 € − 1,50 €.
  - **Tipp 2:** Von 1,50 € bis 2 € sind es 50 Cent. Von 2 € bis 4 € noch 2 €.
  - **Lösungsweg:** 4 € − 1,50 € = 2,50 €. Noah hat noch 2,50 €.
  - **Lob:** Super! Erst verstehen, dann rechnen.

### 6.4 Kalles Seil
- **id:** `s6-t4` · **difficulty:** 3
- **Szene:** items `[seil "Seil" 240]` · hand `[200, 100]` · decor `{ muschel, 7 }` (7 Muscheln neben Kalle)
- **Geschichte:** Kalle hat 7 Muscheln und {{300}}. Er kauft ein Seil für {{240}}.
- **a) Frage:** Kalle will wissen, wie viel Geld er noch hat. Welche Angabe brauchst du dafür nicht?
  - **Typ:** choice, layout `cards`, shuffle
    - ✔ 7 Muscheln
    - 3 € → Die 3 € brauchst du: So viel Geld hat Kalle am Anfang.
    - 2,40 € → Die 2,40 € brauchst du: So viel kostet das Seil.
  - **Tipp 1:** Kalle will etwas über sein Geld wissen.
  - **Tipp 2:** Welche Zahl hat nichts mit Geld zu tun?
  - **Lösungsweg:** Die 7 Muscheln haben nichts mit dem Geld zu tun. Die brauchst du nicht.
- **b) Frage:** Wie viel Geld hat Kalle noch?
  - **Typ:** money · correct `60`
  - **Fehler:** `540` → Kalle gibt Geld aus. Es wird weniger. · `160` → Zähle von 2,40 € bis 3 €. Ist das mehr als 1 €?
  - **Tipp 1:** Rechne 3 € − 2,40 €.
  - **Tipp 2:** Zähle von 2,40 € bis 3 €: 2,50, 2,60 …
  - **Lösungsweg:** Von 2,40 € bis 3 € sind es 60 Cent. Kalle hat noch 60 Cent.
  - **Lob:** Klasse! Du hast die unwichtige Angabe erkannt und richtig gerechnet.

### 6.5 Kompass und Karte
- **id:** `s6-t5` · **difficulty:** 3
- **Szene:** items `[kompass "Kompass" 240, karte "Karte" 130]` · hand `[200, 200]`
- **Geschichte:** Du hast {{400}}. Ein Kompass kostet {{240}}. Eine Karte kostet {{130}}.
- **a) Frage:** Reicht dein Geld für beides?
  - **Typ:** choice, layout `yesno`, kein shuffle
    - ✔ Ja, es reicht
    - Nein, es reicht nicht → Rechne aus: 2,40 € + 1,30 €. Ist das mehr als 4 €?
  - **Tipp 1:** Rechne zuerst aus, was beides zusammen kostet.
  - **Tipp 2:** 2 € + 1 € = 3 €. 40 Cent + 30 Cent = 70 Cent.
  - **Lösungsweg:** 2,40 € + 1,30 € = 3,70 €. Das ist weniger als 4 €. Es reicht!
- **b) Frage:** Wie viel Geld bleibt dir übrig?
  - **Typ:** money · correct `30`
  - **Fehler:** `370` → 3,70 € kostet alles zusammen. Wie viel bleibt von 4 € übrig? · `130` → Von 3,70 € bis 4 € ist es weniger als 1 €.
  - **Tipp 1:** Zähle von 3,70 € bis 4 €.
  - **Tipp 2:** 3,80, 3,90, 4,00. Wie viele 10-Cent-Schritte sind das?
  - **Lösungsweg:** Von 3,70 € bis 4 € sind es 30 Cent.
  - **Lob:** Geschafft! Kalle lässt dich über die Brücke.

---

## Station 7 – Der Leuchtturm

- **id:** `leuchtturm` · **icon:** `station-leuchtturm` · **minutes:** 9
- **skillLabel:** Mehrere Einkäufe planen
- **intro:**
  1. Oben auf dem Felsen steht ein Leuchtturm. Hier wohnt Frida, die Leuchtturmwärterin.
  2. Frida braucht Vorräte für die Nacht. Gehst du für sie einkaufen?
- **findling:** `fernrohr` · Fernrohr · „Frida schenkt dir ein Fernrohr. Damit kannst du schon die Piratenhöhle sehen!“
- **recap:** Du hast mehrere Einkäufe zusammengerechnet und dein Geld eingeteilt.

### 7.1 Drei Kerzen
- **id:** `s7-t1` · **difficulty:** 3
- **Szene:** items `[kerze "Kerze" 60, quantity 3]`
- **Geschichte:** Frida braucht drei Kerzen. Eine Kerze kostet {{60}}.
- **Frage:** Wie viel kosten drei Kerzen?
- **Typ:** money · correct `180`
- **Fehler:**
  - `120` → Das sind erst zwei Kerzen. Frida braucht drei.
  - `63` → Du hast 60 + 3 gerechnet. Nimm 60 Cent dreimal.
- **Tipp 1:** Rechne 60 Cent + 60 Cent + 60 Cent.
- **Tipp 2:** 60 + 60 = 120. Und dann noch einmal 60 dazu.
- **Lösungsweg:** 60 + 60 + 60 = 180 Cent. Das sind 1,80 €.

### 7.2 Kein Geld übrig
- **id:** `s7-t2` · **difficulty:** 4
- **Szene:** coins `[500]`, label „Von Frida“
- **Geschichte:** Frida gibt dir einen 5-Euro-Schein. Du sollst drei Sachen kaufen. Es soll kein Geld übrig bleiben.
- **Frage:** Wähle drei Sachen, die zusammen genau 5 € kosten.
- **Typ:** select · rule `sum` · count `3` · target `500` · items:
  - `brot` „Brot“ 220 · `kaese` „Käse“ 180 · `tee` „Tee“ 100 · `streichhoelzer` „Streichhölzer“ 50 · `aepfel` „Äpfel“ 150 · `honig` „Honig“ 230
  - Lösungen (geprüft): Brot + Käse + Tee; Brot + Streichhölzer + Honig
- **Tipp 1:** Fang mit dem Brot an. Dann fehlen noch 2,80 €.
- **Tipp 2:** Welche zwei Sachen kosten zusammen 2,80 €? Schau dir Käse und Tee an.
- **Lösungsweg:** Brot, Käse und Tee: 2,20 € + 1,80 € + 1 € = 5 €. Es geht auch mit Brot, Streichhölzern und Honig: 2,20 € + 50 Cent + 2,30 € = 5 €.
- **Lob:** Toll geplant! Kein Cent bleibt übrig.

### 7.3 Lampenöl und Decke
- **id:** `s7-t3` · **difficulty:** 4
- **Szene:** items `[lampenoel "Lampenöl" 450, decke "Decke" 320]` · paidWith `[1000]`
- **Geschichte:** Frida hat einen 10-Euro-Schein. Sie kauft Lampenöl für {{450}} und eine warme Decke für {{320}}.
- **a) Frage:** Wie viel kostet beides zusammen?
  - **Typ:** money · correct `770`
  - **Fehler:** `130` → Du hast abgezogen. Frida kauft beides, also rechnen wir plus. · `870` → Zähle die Euro noch einmal: 4 € + 3 €.
  - **Tipp 1:** 4 € + 3 € = 7 €.
  - **Tipp 2:** Jetzt die Cent: 50 + 20.
  - **Lösungsweg:** 4,50 € + 3,20 € = 7,70 €.
- **b) Frage:** Wie viel Rückgeld bekommt Frida?
  - **Typ:** money · correct `230`
  - **Fehler:** `330` → Von 7,70 € bis 8 € sind es 30 Cent. Dann bis 10 € noch 2 €. · `1770` → Du hast zusammengezählt. Beim Rückgeld bleibt etwas übrig.
  - **Tipp 1:** Zähle von 7,70 € bis 8 €.
  - **Tipp 2:** Von 7,70 € bis 8 € sind es 30 Cent. Von 8 € bis 10 € sind es noch 2 €.
  - **Lösungsweg:** 30 Cent + 2 € = 2,30 €. Frida bekommt 2,30 € zurück.

### 7.4 Der Einkaufszettel
- **id:** `s7-t4` · **difficulty:** 4
- **Szene:** none (Sachen sind die Karten)
- **Geschichte:** Auf Fridas Einkaufszettel stehen vier Sachen mit Preisen.
- **Frage:** Tippe sie der Reihe nach an. Fang mit der billigsten Sache an.
- **Typ:** order · direction `asc` · entries (gemischt anzeigen):
  - `seil` „Seil“ 205 · `laterne` „Laterne“ 250 · `fisch` „Fisch“ 215 · `eimer` „Eimer“ 195
- **Tipp 1:** Vergleiche zuerst die Euro vor dem Komma.
- **Tipp 2:** Haben zwei Preise gleich viele Euro, vergleichst du die Cent.
- **Lösungsweg:** Der Eimer (1,95 €) ist am billigsten. Dann kommen Seil (2,05 €), Fisch (2,15 €) und Laterne (2,50 €).
- **Lob:** Klasse! Erst die Euro, dann die Cent vergleichen.

### 7.5 Ungefähr reicht
- **id:** `s7-t5` · **difficulty:** 4
- **Szene:** items `[kekse "Kekse" 190, marmelade "Marmelade" 295]`
- **Geschichte:** Frida kauft eine Tüte Kekse für {{190}} und ein Glas Marmelade für {{295}}.
- **Frage:** Ungefähr wie viel kostet beides? Du musst nicht genau rechnen.
- **Typ:** choice, layout `cards`, kein shuffle
  - ungefähr 3 € → 1,90 € ist schon fast 2 €. Und 2,95 € ist fast 3 €.
  - ✔ ungefähr 5 €
  - ungefähr 10 € → Beide Sachen kosten weniger als 3 €. Zusammen können es keine 10 € sein.
- **Tipp 1:** Runde die Preise. 1,90 € ist fast …?
- **Tipp 2:** 1,90 € ist fast 2 €. 2,95 € ist fast 3 €.
- **Lösungsweg:** Ungefähr 2 € + 3 € = 5 €. Ganz genau sind es 4,85 €.
- **Lob:** Gut geschätzt! Überschlagen hilft beim Einkaufen.

---

## Station 8 – Die Piratenhöhle

- **id:** `piratenhoehle` · **icon:** `station-hoehle` · **minutes:** 9
- **skillLabel:** Fehlende Beträge finden
- **intro:**
  1. In der Höhle liegt ein altes Piratenbuch. Es gehörte Pirat Hein.
  2. Leider sind manche Zahlen verwischt. Findest du sie heraus?
- **findling:** `schatzkarte` · Schatzkarte · „Zwischen den Seiten steckt eine Schatzkarte! Das Kreuz zeigt zur Schatztruhe.“
- **recap:** Du hast fehlende Beträge gefunden und rückwärts gerechnet.

### 8.1 Eine Münze fehlt
- **id:** `s8-t1` · **difficulty:** 3
- **Szene:** items `[schatzkaestchen "Schatzkästchen" 360]` · hand `[200, 100, 50]`
- **Geschichte:** Ein Schatzkästchen kostet {{360}}. Du hast eine 2-Euro-Münze, eine 1-Euro-Münze und eine 50-Cent-Münze.
- **Frage:** Welche Münze fehlt dir noch, damit du genau bezahlen kannst?
- **Typ:** choice, layout `coins`, kein shuffle (aufsteigend)
  - pieces `[1]` → Mit 1 Cent hättest du 3,51 €. Es fehlt mehr.
  - ✔ pieces `[10]`
  - pieces `[20]` → Mit 20 Cent hättest du 3,70 €. Das sind 10 Cent zu viel.
  - pieces `[50]` → Mit 50 Cent hättest du 4 €. Das ist zu viel.
- **Tipp 1:** Zähle zuerst dein Geld: 2 € + 1 € + 50 Cent.
- **Tipp 2:** Du hast 3,50 €. Wie viel fehlt bis 3,60 €?
- **Lösungsweg:** 2 € + 1 € + 50 Cent = 3,50 €. Bis 3,60 € fehlen 10 Cent.

### 8.2 Der Tintenfleck
- **id:** `s8-t2` · **difficulty:** 3
- **Szene:** note `["{{140}} + ▢ = {{200}}"]`
- **Geschichte:** Im Piratenbuch steht eine Rechnung. Eine Zahl ist unter einem Tintenfleck verschwunden.
- **Frage:** Welcher Betrag ist unter dem Fleck?
- **Typ:** money · correct `60`
- **Fehler:**
  - `340` → Du hast 1,40 € und 2 € zusammengezählt. Gesucht ist, was bis 2 € fehlt.
  - `160` → Mit 1,60 € kämst du bis 3 €. Zähle von 1,40 € nur bis 2 €.
- **Tipp 1:** Zähle von 1,40 € bis 2 €.
- **Tipp 2:** 1,50, 1,60 … 2,00. Wie viele 10-Cent-Schritte sind das?
- **Lösungsweg:** 1,40 € + 60 Cent = 2 €. Unter dem Fleck stehen 60 Cent.

### 8.3 Heins Beutel
- **id:** `s8-t3` · **difficulty:** 4
- **Szene:** note `["Ausgegeben: {{230}}", "Noch im Beutel: {{170}}", "Am Anfang: ▢"]`
- **Geschichte:** Pirat Hein hatte Geld in seinem Beutel. Er hat {{230}} ausgegeben. Jetzt hat er noch {{170}}.
- **Frage:** Wie viel Geld war am Anfang im Beutel?
- **Typ:** money · correct `400`
- **Fehler:**
  - `60` → Am Anfang war mehr Geld im Beutel, nicht weniger. Hein hat ja etwas ausgegeben.
  - `300` → Rechne die Cent noch einmal: 70 Cent + 30 Cent.
- **Tipp 1:** Leg das ausgegebene Geld in Gedanken zurück in den Beutel.
- **Tipp 2:** Rechne 1,70 € + 2,30 €.
- **Lösungsweg:** 1,70 € + 2,30 € = 4 €. So viel war am Anfang im Beutel.
- **Lob:** Toll! Du hast rückwärts gerechnet.

### 8.4 Der Piratenhut
- **id:** `s8-t4` · **difficulty:** 4
- **Szene:** items `[piratenhut "Piratenhut" 200]` · hand `[100, 20, 5]`
- **Geschichte:** Ida hat schon {{125}} in der Hand. Ein Piratenhut kostet {{200}}.
- **Frage:** Lege das Geld, das Ida noch fehlt.
- **Typ:** pay · target `75` · palette `[50, 20, 10, 5, 2, 1]` · showTotal `false`
- **Tipp 1:** Wie viel fehlt von 1,25 € bis 2 €?
- **Tipp 2:** Von 1,25 € bis 1,30 € sind es 5 Cent. Von 1,30 € bis 2 € sind es 70 Cent.
- **Lösungsweg:** Ida fehlen 75 Cent. Zum Beispiel: 50 Cent + 20 Cent + 5 Cent.

### 8.5 Augenklappe und Kopftuch
- **id:** `s8-t5` · **difficulty:** 4
- **Szene:** items `[augenklappe "Augenklappe" (ohne Preis), kopftuch "Kopftuch" (ohne Preis)]` · paidWith `[500]`. Beide Preisschilder zeigen „? €“, denn der Preis der Augenklappe kommt erst in Teil b.
- **Geschichte:** Im Piratenbuch steht: Pirat Hein hatte {{500}}. Er hat eine Augenklappe und ein Kopftuch gekauft. Er hat {{100}} zurückbekommen.
- **a) Frage:** Wie viel hat Hein insgesamt bezahlt?
  - **Typ:** money · correct `400`
  - **Fehler:** `600` → Hein hat Geld zurückbekommen. Er hat also weniger als 5 € bezahlt.
  - **Tipp 1:** Hein hatte 5 € und hat 1 € zurückbekommen.
  - **Tipp 2:** Rechne 5 € − 1 €.
  - **Lösungsweg:** 5 € − 1 € = 4 €. Hein hat 4 € bezahlt.
- **b) Zusatz:** Die Augenklappe kostet {{180}}.
  - **Frage:** Wie viel kostet das Kopftuch?
  - **Typ:** money · correct `220`
  - **Fehler:** `580` → Augenklappe und Kopftuch kosten zusammen 4 €. Das Kopftuch kostet also weniger als 4 €. · `320` → Zähle noch einmal von 1,80 € bis 4 €.
  - **Tipp 1:** Beides zusammen kostet 4 €. Die Augenklappe kostet 1,80 €.
  - **Tipp 2:** Zähle von 1,80 € bis 2 €. Dann weiter bis 4 €.
  - **Lösungsweg:** Von 1,80 € bis 2 € sind es 20 Cent. Von 2 € bis 4 € sind es 2 €. Das Kopftuch kostet 2,20 €.
  - **Lob:** Klasse! Das Piratenbuch hat keine Geheimnisse mehr vor dir.

> Hinweis zu 8.5 und 9.2: Gesuchte Preise werden nicht verraten. `SceneItem.price` fehlt dort, und das Preisschild zeigt „? €“. Die Inhaltstests erlauben fehlende Preise nur in diesen beiden Szenen.

---

## Station 9 – Die Schatztruhe

- **id:** `schatztruhe` · **icon:** `station-truhe` · **minutes:** 10
- **skillLabel:** Knobeln mit allem, was du kannst
- **intro:**
  1. Da ist sie: die Schatztruhe! Dein goldener Schlüssel passt ins Schloss.
  2. Aber die Truhe hat Rätselschlösser. Jedes Rätsel öffnet ein Schloss.
- **findling:** `goldene-krone` · Goldene Krone · „Die Truhe ist offen! Darin liegt eine goldene Krone. Du hast die geheime Schatzinsel erkundet!“
- **recap:** Du hast alle Rätselschlösser geknackt.
- **progressStyle:** `locks`. Die Fortschrittsanzeige ist ein Schloss pro spielbarer Aufgabe (auf Stufe 3: 5, auf Stufe 2: 3). Nach jeder gelösten Aufgabe springt eins auf. Hinter jeder Szene steht die Truhe als Hintergrundbild.

### 9.1 Funde im Sand
- **id:** `s9-t1` · **difficulty:** 4
- **Szene:** coins mit groups `[[100, 20], [200, 20, 10, 5]]` (zwei Fundhäufchen)
- **Geschichte:** Vor der Truhe findest du {{120}} und {{235}} im Sand.
- **a) Frage:** Wie viel Geld hast du gefunden?
  - **Typ:** money · correct `355`
  - **Fehler:** `255` → Rechne die Euro noch einmal: 1 € + 2 €.
  - **Tipp 1:** 1 € + 2 € = 3 €.
  - **Tipp 2:** Jetzt die Cent: 20 + 35.
  - **Lösungsweg:** 1,20 € + 2,35 € = 3,55 €.
- **b) Zusatz:** Später kaufst du davon eine Laterne für {{175}}.
  - **Frage:** Wie viel Geld bleibt dir?
  - **Typ:** money · correct `180`
  - **Fehler:** `530` → Du hast zusammengezählt. Die Laterne kostet Geld, also bleibt weniger. · `220` → Bei den Cent geht 55 − 75 nicht einfach. Zähle lieber von 1,75 € bis 3,55 €.
  - **Tipp 1:** Zähle von 1,75 € bis 2 €. Das sind 25 Cent.
  - **Tipp 2:** Von 2 € bis 3,55 € sind es 1,55 €. Jetzt rechne beides zusammen.
  - **Lösungsweg:** 25 Cent + 1,55 € = 1,80 €. Dir bleiben 1,80 €.

### 9.2 Muschel, Ball und Feder
- **id:** `s9-t2` · **difficulty:** 5
- **Szene:** items `[muschel "Muschel" 150, ball "Ball" (ohne Preis), feder "Feder" (ohne Preis)]`
- **Geschichte:** Drei Dinge kosten zusammen {{500}}: eine Muschel, ein Ball und eine Feder. Die Muschel kostet {{150}}. Der Ball kostet doppelt so viel wie die Muschel.
- **a) Frage:** Wie viel kostet der Ball?
  - **Typ:** money · correct `300`
  - **Fehler:** `150` → Doppelt so viel heißt: zweimal so viel wie die Muschel.
  - **Tipp 1:** Doppelt heißt: zweimal.
  - **Tipp 2:** Rechne 1,50 € + 1,50 €.
  - **Lösungsweg:** 1,50 € + 1,50 € = 3 €. Der Ball kostet 3 €.
- **b) Frage:** Wie viel kostet die Feder?
  - **Typ:** money · correct `50`
  - **Fehler:**
    - `200` → Du hast nur den Ball abgezogen. Zieh auch die Muschel ab.
    - `350` → Du hast nur die Muschel abgezogen. Zieh auch den Ball ab.
    - `950` → Hier wird nicht zusammengezählt. Die Feder kostet das, was von 5 € übrig bleibt.
  - **Tipp 1:** Rechne zuerst Muschel und Ball zusammen: 1,50 € + 3 €.
  - **Tipp 2:** Muschel und Ball kosten 4,50 €. Was fehlt bis 5 €?
  - **Lösungsweg:** 1,50 € + 3 € = 4,50 €. Von 4,50 € bis 5 € sind es 50 Cent. Die Feder kostet 50 Cent.
  - **Lob:** Wow! Das war ein richtig schweres Rätsel.

### 9.3 Der Münzschlitz
- **id:** `s9-t3` · **difficulty:** 4
- **Szene:** none (Truhe im Hintergrund, das dritte Schloss mit Münzschlitz hervorgehoben)
- **Geschichte:** Das dritte Schloss hat einen Münzschlitz. Es öffnet sich nur mit 50 Cent. Eine 50-Cent-Münze hast du nicht.
- **Frage:** Lege 50 Cent auf drei verschiedene Arten.
- **Typ:** pay-variants · target `50` · palette `[20, 10, 5]` · required `3` · showTotal `true`
- **Tipp 1:** Fang mit 20-Cent-Münzen an. Wie viel fehlt dann noch bis 50 Cent?
- **Tipp 2:** Du kannst auch 10-Cent-Münzen und 5-Cent-Münzen mischen.
- **Lösungsweg:** Zum Beispiel: 20 + 20 + 10. Oder: 20 + 10 + 10 + 10. Oder: fünfmal 10 Cent.
- **Lob:** Klick! Das dritte Schloss ist offen.

### 9.4 Genau zwei Münzen
- **id:** `s9-t4` · **difficulty:** 4
- **Szene:** none (Truhe im Hintergrund)
- **Geschichte:** Das vierte Schloss sagt: „Gib mir genau zwei Münzen. Zusammen sollen sie 1,50 € wert sein.“
- **Frage:** Welche zwei Münzen passen?
- **Typ:** pay · target `150` · palette `[1, 2, 5, 10, 20, 50, 100, 200]` · showTotal `false` · exactCount `2` (einzige Lösung: 1 € + 50 Cent, geprüft)
- **Tipp 1:** Eine der beiden Münzen ist eine Euro-Münze.
- **Tipp 2:** 1 € ist schon da. Welche Münze fehlt bis 1,50 €?
- **Lösungsweg:** 1 € + 50 Cent = 1,50 €. Mit zwei Münzen geht es nur so.

### 9.5 Das letzte Rätsel
- **id:** `s9-t5` · **difficulty:** 3
- **Szene:** none (Truhe im Hintergrund)
- **Geschichte:** Das letzte Schloss flüstert: „Ich bin eine Münze, mehr wert als 10 Cent, aber weniger als 50 Cent. Welche bin ich?“
- **Frage:** Tippe die richtige Münze an.
- **Typ:** choice, layout `coins`, kein shuffle (aufsteigend)
  - pieces `[5]` → 5 Cent sind weniger als 10 Cent.
  - ✔ pieces `[20]`
  - pieces `[50]` → Die gesuchte Münze ist weniger wert als 50 Cent. Die 50-Cent-Münze passt also nicht.
  - pieces `[100]` → 1 € ist mehr als 50 Cent.
- **Tipp 1:** Welche Münzen liegen zwischen 10 Cent und 50 Cent?
- **Tipp 2:** Zwischen 10 Cent und 50 Cent gibt es nur eine einzige Münze.
- **Lösungsweg:** Die 20-Cent-Münze: 20 Cent sind mehr als 10 Cent und weniger als 50 Cent.
- **Lob:** Klick! Alle Schlösser sind offen!

**Finale** nach 9.5: siehe `01`, Abschnitt 5.6.

---

## Anhang: Prüfprotokoll

Alle Ergebnisse wurden per Skript nachgerechnet, unter anderem:
- 2.3: genau zwei Paare mit 3 € (Kokosnuss + Mango, Saft + Muffin)
- 4.2: 10 verschiedene Möglichkeiten für 1 € mit 50, 20, 10 Cent
- 4.3: Minimum für 75 Cent sind 3 Münzen
- 5.3: genau 3 leistbare Sachen
- 7.2: genau zwei Dreiergruppen mit 5 € (Brot + Käse + Tee, Brot + Streichhölzer + Honig)
- 7.4: Reihenfolge 1,95 € < 2,05 € < 2,15 € < 2,50 €
- 9.4: 1 € + 50 Cent ist die einzige Zwei-Münzen-Lösung für 1,50 €
- 9.5: 20 Cent ist die einzige Münze zwischen 10 und 50 Cent
- 4.5: 85 + 55 = 140; 300 − 140 = 160 (Teil a und b haben bewusst verschiedene Ergebnisse)

Die Inhaltstests in `03`, Abschnitt 10 sollen diese Eigenschaften im Code erneut prüfen.
