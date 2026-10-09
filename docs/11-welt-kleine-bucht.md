# 11 – Welt „Die kleine Bucht“ (Stufe 1, etwa 5 Jahre)

Die kleine Bucht ist die Welt für Kinder, die noch nicht lesen und bis etwa 10 zählen. Sie funktioniert wie die Schatzinsel, mit derselben App-Struktur, Kiko als Begleiter, Sternen und Fundstücken. Es gibt aber nur **5 Stationen** und alles ist auf Vorlesen und Bilder ausgelegt.

Wie in `04` gilt: **Texte wörtlich übernehmen.** Alle Rechnungen sind geprüft. Daten liegen in `src/content/worlds/kleine-bucht/`, jede Aufgabe mit `authoredFor: 1`.

**Kennungen:** Aufgaben-IDs `b{Station}-t{Aufgabe}` (z. B. `b1-t3`), Teile mit `-a`/`-b`. Stations-Icons `station-muschelufer`, `station-muenzquelle`, `station-kikos-laden`, `station-kruemels-wippe`, `station-muscheltruhe`. `difficulty`: Station 1–2 = 1, Station 3–4 = 2, Station 5 = 3. Münz- und Bildkarten bekommen als `label` den Namen („2-Cent-Münze“, „Stern“), er wird beim Antippen vorgelesen.

## Besonderheiten der Welt

- **Alles wird automatisch vorgelesen:** Einleitung, Geschichte, Frage, jede Rückmeldung und die Antwortoptionen beim Antippen. Bei Zahlenkarten wird die Zahl gesprochen („vier“).
- **Zählhilfe:** In Szenen mit Objekten (Muscheln, Seesterne, Fische) markiert Antippen ein Objekt mit einem Punkt. Ein zweites Antippen nimmt den Punkt weg. Das wird nicht ausgewertet, es hilft nur beim Zählen.
- **Antworten:** große Bildkarten (`choice`), Zahlenstrahl 0–10 (`number`), Münzen legen mit 1, 2, 5 und 10 Cent (`pay`), Reihenfolge (`order`), Zahlenschloss (`code`).
- **Texte:** Geschichte höchstens 14 Wörter, Frage höchstens 10 Wörter.
- **Karte:** eine kleine, runde Bucht mit 5 Stationen auf einem kurzen Weg, ohne Scrollen auf einen Handybildschirm passend. Gleicher Nebel-Mechanismus wie auf der Insel.
- **Nebenfigur:** Krümel, ein kleiner, freundlicher Krebs (Station 4).

## Datenmodell-Ergänzungen

Diese Felder ergänzen `03` und `10`:

```ts
// Szene mit zählbaren Dingen
| { kind: 'objects'; groups: { itemId: string; count: number; leaving?: number; label?: string }[] }
//   leaving: so viele Objekte dieser Gruppe schwimmen/laufen weg (halbtransparent, mit Pfeil)

// Antwortoptionen können Dinge statt Geld zeigen
interface ChoiceOption { /* … */ objects?: { itemId: string; count: number } }

// Reihenfolge-Einträge können Dinge zeigen
interface OrderEntry { /* … */ objects?: { itemId: string; count: number } }

// Muster-Elemente können Häufchen sein
type SeqItem = /* … */ | { kind: 'objects'; itemId: string; count: number };
```

## Überblick

| # | Station | Fähigkeit | Fundstück | Übungsthema |
|---|---|---|---|---|
| 1 | Das Muschelufer | Zählen bis 10 | Perlmuttmuschel | mengen-zahlen |
| 2 | Die Münzquelle | Münzen kennenlernen | Glücksstein | muenzen-zaehlen |
| 3 | Kikos kleiner Laden | Mit Cent bezahlen | Kleiner Eimer | preise-addieren |
| 4 | Krümels Wippe | Mehr, weniger, gleich viel | Möwenfeder | mengen-zahlen |
| 5 | Die Muscheltruhe | Muster und Rätsel | Perle | raetsel |

---

## Station 1 – Das Muschelufer

- **id:** `muschelufer` · **minutes:** 5 · **skillLabel:** Zählen bis 10
- **intro:**
  1. Hallo, ich bin Kiko! Das ist die kleine Bucht.
  2. Hier liegen viele Muscheln. Zählst du mit mir?
- **findling:** `perlmuttmuschel` · Perlmuttmuschel · „Eine Muschel glänzt wie ein Regenbogen. Sie gehört jetzt dir!“
- **recap:** Du hast Muscheln und Seesterne gezählt.

### B1.1 Muscheln am Ufer
- **Szene:** objects `[{ muschel, 4 }]`
- **Geschichte:** Am Ufer liegen Muscheln.
- **Frage:** Wie viele Muscheln siehst du?
- **Typ:** choice, layout `cards`, kein shuffle: `3` · ✔ `4` · `5`
  - `3` → Hast du eine Muschel übersehen? Tippe jede Muschel an.
  - `5` → Hast du eine Muschel zweimal gezählt? Tippe jede nur einmal an.
- **Tipp 1:** Tippe jede Muschel an. Dann bekommt sie einen Punkt.
- **Tipp 2:** Zähle langsam mit: eins, zwei, drei …
- **Lösungsweg:** Eins, zwei, drei, vier. Es sind 4 Muscheln.
- **Lob:** Super gezählt!

### B1.2 Seesterne im Sand
- **Szene:** objects `[{ seestern, 7 }]`
- **Geschichte:** Im Sand liegen Seesterne.
- **Frage:** Wie viele Seesterne sind es?
- **Typ:** number · correct `7` (Zahlenstrahl)
- **Fehler:** `6` → Zähle noch einmal und tippe jeden Seestern an. · `8` → Hast du einen Seestern zweimal gezählt?
- **Tipp 1:** Tippe jeden Seestern an, während du zählst.
- **Tipp 2:** Es sind mehr als 5. Zähle ab 5 weiter: sechs …
- **Lösungsweg:** 1, 2, 3, 4, 5, 6, 7. Es sind 7 Seesterne.

### B1.3 Zwei Eimer
- **Szene:** none (die Eimer sind die Antwortkarten)
- **Geschichte:** Kiko hat zwei Eimer mit Muscheln.
- **Frage:** In welchem Eimer sind mehr Muscheln?
- **Typ:** choice, layout `bags`, kein shuffle
  - ✔ „Eimer mit Fisch“ · icon `fisch` · objects `{ muschel, 5 }`
  - „Eimer mit Stern“ · icon `stern` · objects `{ muschel, 3 }` → Im Stern-Eimer sind 3 Muscheln. Zähle jetzt den Fisch-Eimer.
  - „Gleich viele“ (Textkarte) → Zähle noch einmal. Sind es wirklich gleich viele?
- **Tipp 1:** Zähle zuerst den einen Eimer, dann den anderen.
- **Tipp 2:** Was ist mehr: 5 oder 3?
- **Lösungsweg:** Im Fisch-Eimer sind 5 Muscheln, im Stern-Eimer 3. 5 ist mehr als 3.

### B1.4 Noch mehr Muscheln
- **Szene:** objects `[{ muschel, 3, label: "zuerst" }, { muschel, 2, label: "dazu" }]`
- **Geschichte:** Kiko findet 3 Muscheln. Dann findet er noch 2.
- **Frage:** Wie viele Muscheln hat Kiko jetzt?
- **Typ:** number · correct `5`
- **Fehler:** `4` → Zähle alle Muscheln zusammen. Fang links an. · `1` → Kiko findet Muscheln dazu. Dann werden es mehr.
- **Tipp 1:** Zähle alle Muscheln: erst links, dann rechts.
- **Tipp 2:** Links sind 3. Zähle weiter: vier, fünf.
- **Lösungsweg:** 3 und 2 sind zusammen 5.
- **Lob:** Toll! Du hast weitergezählt.

### B1.5 Häufchen ordnen
- **Szene:** none
- **Geschichte:** Kiko hat drei Häufchen gemacht.
- **Frage:** Tippe die Häufchen an. Fang mit den wenigsten Muscheln an.
- **Typ:** order · direction `asc` · entries (gemischt): `h6` „6 Muscheln“ objects `{ muschel, 6 }` · `h2` „2 Muscheln“ objects `{ muschel, 2 }` · `h4` „4 Muscheln“ objects `{ muschel, 4 }` (Werte 6, 2, 4)
- Nach dem ersten Tipper liest Kiko: „Und jetzt das Häufchen mit etwas mehr!“
- **Tipp 1:** Zähle jedes Häufchen.
- **Tipp 2:** Ein Häufchen hat nur 2 Muscheln. Damit fängst du an.
- **Lösungsweg:** Zuerst 2 Muscheln, dann 4, dann 6.

---

## Station 2 – Die Münzquelle

- **id:** `muenzquelle` · **minutes:** 5 · **skillLabel:** Münzen kennenlernen
- **intro:**
  1. In dieser Quelle glitzern Münzen.
  2. Jede Münze hat eine Zahl. Schauen wir sie uns an!
- **findling:** `gluecksstein` · Glücksstein · „Zwischen den Münzen liegt ein glatter Glücksstein. Er gehört jetzt dir!“
- **recap:** Du hast Münzen erkannt und gezählt.

### B2.1 Die 2-Cent-Münze
- **Szene:** none
- **Geschichte:** Kiko sucht eine bestimmte Münze.
- **Frage:** Tippe die 2-Cent-Münze an.
- **Typ:** choice, layout `coins`, kein shuffle: „1-Cent-Münze“ pieces `[1]` · ✔ „2-Cent-Münze“ `[2]` · „5-Cent-Münze“ `[5]`
  - `[1]` → Auf dieser Münze steht 1. Suche die Münze mit der 2.
  - `[5]` → Auf dieser Münze steht 5. Suche die Münze mit der 2.
- **Tipp 1:** Schau auf die Zahl in der Mitte der Münze.
- **Tipp 2:** Suche die Zahl 2.
- **Lösungsweg:** Die 2-Cent-Münze hat eine 2 in der Mitte.

### B2.2 Der Euro
- **Szene:** none
- **Geschichte:** In der Quelle liegen drei Münzen.
- **Frage:** Welche Münze ist 1 Euro?
- **Typ:** choice, layout `coins`, kein shuffle: „10-Cent-Münze“ pieces `[10]` · ✔ „1-Euro-Münze“ `[100]` · „50-Cent-Münze“ `[50]`
  - `[10]` → Das ist die 10-Cent-Münze.
  - `[50]` → Das ist die 50-Cent-Münze. Die Euro-Münze hat zwei Farben.
- **Tipp 1:** Schau dir die Farben der Münzen genau an.
- **Tipp 2:** Die 1-Euro-Münze hat zwei Farben: innen silbern, außen golden.
- **Lösungsweg:** Die 1-Euro-Münze ist innen silbern und außen golden.

### B2.3 Groß oder viel?
- **Szene:** none
- **Geschichte:** Zwei Münzen liegen nebeneinander.
- **Frage:** Welche Münze ist mehr wert?
- **Typ:** choice, layout `coins`, kein shuffle: „5-Cent-Münze“ pieces `[5]` · ✔ „10-Cent-Münze“ `[10]` (in echter Größe: Die 5-Cent-Münze ist größer.)
  - `[5]` → Die 5-Cent-Münze ist größer. Aber 10 ist mehr als 5!
- **Tipp 1:** Schau nicht auf die Größe. Schau auf die Zahl.
- **Tipp 2:** Was ist mehr: 5 oder 10?
- **Lösungsweg:** 10 Cent sind mehr als 5 Cent, auch wenn die Münze kleiner ist.
- **Lob:** Klasse! Du hast auf die Zahl geschaut.

### B2.4 Drei kleine Münzen
- **Szene:** coins `[1, 1, 1]`
- **Geschichte:** Kiko hat drei 1-Cent-Münzen.
- **Frage:** Wie viel Cent sind das zusammen?
- **Typ:** number · correct `3`
- **Fehler:** `1` → Jede Münze ist 1 Cent. Zähle alle Münzen.
- **Tipp 1:** Jede dieser Münzen ist 1 Cent wert.
- **Tipp 2:** Zähle die Münzen: eins, zwei …
- **Lösungsweg:** 1 Cent und 1 Cent und 1 Cent sind 3 Cent.

### B2.5 Zwei Münzen
- **Szene:** coins `[2, 1]`
- **Geschichte:** Kiko hat eine 2-Cent-Münze und eine 1-Cent-Münze.
- **Frage:** Wie viel Cent sind das zusammen?
- **Typ:** choice, layout `cards`, kein shuffle: `{{2}}` · ✔ `{{3}}` · `{{4}}`
  - `{{2}}` → Du hast nur die 2-Cent-Münze gezählt. Die 1 kommt noch dazu.
  - `{{4}}` → Die kleine Münze ist 1 Cent, nicht 2 Cent.
- **Tipp 1:** Schau auf die Zahlen: 2 und 1.
- **Tipp 2:** Du hast 2. Zähle eins weiter.
- **Lösungsweg:** 2 Cent und 1 Cent sind 3 Cent.

---

## Station 3 – Kikos kleiner Laden

- **id:** `kikos-laden` · **minutes:** 6 · **skillLabel:** Mit Cent bezahlen
- **intro:**
  1. Willkommen in meinem kleinen Laden!
  2. Hier kostet alles nur ein paar Cent.
- **findling:** `kleiner-eimer` · Kleiner Eimer · „Kiko schenkt dir einen kleinen Eimer. Da passen alle deine Schätze hinein!“
- **recap:** Du hast mit Cent bezahlt.

### B3.1 Ein Bonbon
- **Szene:** items `[bonbon "Bonbon" 3]`
- **Geschichte:** Ein Bonbon kostet {{3}}.
- **Frage:** Lege 3 Cent auf das Tablett.
- **Typ:** pay · target `3` · palette `[1, 2]` · showTotal `true`
- **Tipp 1:** Auf jeder Münze steht, wie viel Cent sie wert ist.
- **Tipp 2:** Lege Münzen, bis auf dem Tablett 3 Cent stehen.
- **Lösungsweg:** 1 Cent und 1 Cent und 1 Cent sind 3 Cent. Oder: 2 Cent und 1 Cent sind 3 Cent.

### B3.2 Ein Lolli
- **Szene:** items `[lolli "Lolli" 5]`
- **Geschichte:** Ein Lolli kostet {{5}}.
- **Frage:** Lege 5 Cent mit nur einer Münze.
- **Typ:** pay · target `5` · palette `[1, 2, 5]` · showTotal `true` · exactCount `1`
- **Tipp 1:** Schau dir die Zahlen auf den Münzen an.
- **Tipp 2:** Auf einer Münze steht eine 5.
- **Lösungsweg:** Die 5-Cent-Münze. Eine Münze, 5 Cent.

### B3.3 Bonbon und Kaugummi
- **Szene:** items `[bonbon "Bonbon" 3, kaugummi "Kaugummi" 2]`
- **Geschichte:** Ein Bonbon kostet {{3}}. Ein Kaugummi kostet {{2}}.
- **Frage:** Wie viel kosten beide zusammen?
- **Typ:** choice, layout `cards`, kein shuffle: `{{4}}` · ✔ `{{5}}` · `{{6}}`
  - `{{4}}` und `{{6}}` → Zähle noch einmal: 3 und 2.
- **Tipp 1:** Halte 3 Finger hoch. Dann noch 2 Finger.
- **Tipp 2:** Zähle alle Finger.
- **Lösungsweg:** 3 Cent und 2 Cent sind 5 Cent.

### B3.4 Reicht es für den Keks?
- **Szene:** items `[keks "Keks" 4]` · hand `[5]`
- **Geschichte:** Du hast {{5}}. Ein Keks kostet {{4}}.
- **Frage:** Reicht dein Geld?
- **Typ:** choice, layout `yesno`, kein shuffle: ✔ „Ja“ · „Nein“
  - „Nein“ → 5 ist mehr als 4. Dein Geld reicht!
- **Tipp 1:** Was ist mehr: 5 oder 4?
- **Tipp 2:** Hast du genauso viel oder mehr Geld, dann reicht es.
- **Lösungsweg:** Du hast 5 Cent. Der Keks kostet 4 Cent. 5 ist mehr als 4. Es reicht.

### B3.5 Der Apfel
- **Szene:** items `[apfel "Apfel" 6]` · hand `[5]`
- **Geschichte:** Du hast {{5}}. Ein Apfel kostet {{6}}.
- **a) Frage:** Reicht dein Geld für den Apfel?
  - **Typ:** choice, layout `yesno`, kein shuffle: „Ja“ · ✔ „Nein“
    - „Ja“ → Der Apfel kostet 6 Cent. Du hast nur 5 Cent.
  - **Tipp 1:** Was ist mehr: 5 oder 6?
  - **Tipp 2:** Der Apfel kostet mehr, als du hast.
  - **Lösungsweg:** 6 ist mehr als 5. Das Geld reicht nicht.
- **b) Frage:** Wie viel Cent fehlen dir?
  - **Typ:** number · correct `1`
  - **Fehler:** `2` → Zähle von 5 weiter bis 6. Wie viele Schritte sind das?
  - **Tipp 1:** Zähle von 5 bis 6.
  - **Tipp 2:** Fünf … sechs. Das ist ein Schritt.
  - **Lösungsweg:** Von 5 bis 6 ist es 1. Dir fehlt 1 Cent.
  - **Lob:** Super! Du hast herausgefunden, was fehlt.

---

## Station 4 – Krümels Wippe

- **id:** `kruemels-wippe` · **minutes:** 6 · **skillLabel:** Mehr, weniger, gleich viel
- **intro:**
  1. Das ist mein Freund Krümel, der kleine Krebs.
  2. Krümels Wippe ist nur gerade, wenn auf beiden Seiten gleich viel liegt.
- **findling:** `moewenfeder` · Möwenfeder · „Eine Möwe hat eine Feder verloren. Krümel schenkt sie dir!“
- **recap:** Du hast verglichen, dazugelegt und weggenommen.

### B4.1 Ist die Wippe gerade?
- **Szene:** balance · left objects `{ muschel, 4 }` · right objects `{ muschel, 4 }`
- **Geschichte:** Auf der Wippe liegen Muscheln.
- **Frage:** Liegen auf beiden Seiten gleich viele Muscheln?
- **Typ:** choice, layout `yesno`, kein shuffle: ✔ „Ja“ · „Nein“
  - „Nein“ → Zähle beide Seiten. Links sind 4. Und rechts?
- **Tipp 1:** Zähle zuerst links, dann rechts.
- **Tipp 2:** Links sind 4 Muscheln. Wie viele sind rechts?
- **Lösungsweg:** Links 4, rechts 4. Das ist gleich viel. Die Wippe ist gerade.

### B4.2 Was muss dazu?
- **Szene:** balance · left objects `{ muschel, 6 }` · right objects `{ muschel, 4 }`, unknown `1`
- **Geschichte:** Links liegen mehr Muscheln. Die Wippe kippt.
- **Frage:** Wie viele Muscheln muss Krümel rechts dazulegen?
- **Typ:** number · correct `2`
- **Fehler:** `6` → Rechts liegen schon 4. Wie viele fehlen bis 6? · `10` → Rechts sollen es so viele sein wie links, also 6.
- **Tipp 1:** Links sind 6 Muscheln. Rechts sollen es auch 6 werden.
- **Tipp 2:** Rechts sind schon 4. Zähle weiter bis 6: fünf, sechs.
- **Lösungsweg:** 4 und 2 sind 6. Krümel legt 2 Muscheln dazu.
- Nach der richtigen Antwort legt die Animation 2 Muscheln rechts dazu, und die Wippe wird gerade.

### B4.3 Krümels Schritte
- **Szene:** sequence `[6, 7, blank]` (Zahlen auf Steinen)
- **Geschichte:** Krümel zählt seine Schritte.
- **Frage:** Welche Zahl kommt nach der 7?
- **Typ:** choice, layout `cards`, kein shuffle: `6` · ✔ `8` · `9`
  - `6` → Die 6 kommt vor der 7. Wir suchen die Zahl danach.
  - `9` → Zwischen 7 und 9 kommt noch eine Zahl.
- **Tipp 1:** Zähle laut: sechs, sieben …
- **Tipp 2:** Was sagst du nach sieben?
- **Lösungsweg:** 6, 7, 8. Nach der 7 kommt die 8.

### B4.4 Fische schwimmen weg
- **Szene:** objects `[{ fisch, 5, leaving: 2 }]`
- **Geschichte:** Im Wasser sind 5 Fische. 2 schwimmen weg.
- **Frage:** Wie viele Fische bleiben da?
- **Typ:** number · correct `3`
- **Fehler:** `7` → Die Fische schwimmen weg. Dann werden es weniger. · `2` → 2 Fische schwimmen weg. Wie viele bleiben übrig?
- **Tipp 1:** Halte 5 Finger hoch. Klappe 2 Finger ein.
- **Tipp 2:** Zähle die Finger, die noch stehen.
- **Lösungsweg:** 5 weniger 2 sind 3. Es bleiben 3 Fische.

### B4.5 Krümel kauft ein
- **Szene:** items `[muschel "Muschel" 2]` · hand `[5, 1]`
- **Geschichte:** Krümel hat {{6}}. Er kauft eine Muschel für {{2}}.
- **Frage:** Wie viel Cent hat Krümel noch?
- **Typ:** number · correct `4`
- **Fehler:** `8` → Krümel gibt Geld aus. Dann hat er weniger.
- **Tipp 1:** Krümel hat 6 Cent und gibt 2 Cent aus.
- **Tipp 2:** Zähle von 6 rückwärts: fünf, vier.
- **Lösungsweg:** 6 weniger 2 sind 4. Krümel hat noch 4 Cent.
- **Lob:** Toll! Du hast rückwärts gezählt.

---

## Station 5 – Die Muscheltruhe

- **id:** `muscheltruhe` · **minutes:** 6 · **skillLabel:** Muster und Rätsel · **progressStyle:** `locks`
- **intro:**
  1. Da hinten steht eine kleine Truhe!
  2. Sie geht nur mit Rätseln auf. Rätselst du mit?
- **findling:** `perle` · Perle · „Die Truhe ist offen! Darin liegt eine Perle. Du hast die kleine Bucht erkundet!“
- **recap:** Du hast alle Rätsel gelöst.

### B5.1 Muschel, Stern, Muschel …
- **Szene:** sequence `[icon muschel, icon stern, icon muschel, icon stern, icon muschel, blank]`
- **Geschichte:** Kiko legt eine Reihe.
- **Frage:** Was kommt als Nächstes?
- **Typ:** choice, layout `cards`, kein shuffle (Bildkarten): ✔ „Stern“ (icon) · „Muschel“ (icon) · „Fisch“ (icon)
  - „Muschel“ → Schau genau: Nach jeder Muschel kommt ein …?
  - „Fisch“ → Ein Fisch kommt in der Reihe gar nicht vor.
- **Tipp 1:** Sprich die Reihe laut: Muschel, Stern, Muschel, Stern …
- **Tipp 2:** Nach einer Muschel kommt immer ein Stern.
- **Lösungsweg:** Muschel, Stern, Muschel, Stern, Muschel, Stern.

### B5.2 Der leere Stein
- **Szene:** sequence `[1, 2, 3, blank, 5]`
- **Geschichte:** Auf den Steinen stehen Zahlen. Ein Stein ist leer.
- **Frage:** Welche Zahl fehlt?
- **Typ:** number · correct `4`
- **Fehler:** `6` → Die 6 kommt erst nach der 5. Welche Zahl steht zwischen 3 und 5?
- **Tipp 1:** Zähle von 1 an laut mit.
- **Tipp 2:** Was kommt nach der 3?
- **Lösungsweg:** 1, 2, 3, 4, 5. Es fehlt die 4.

### B5.3 Es werden immer mehr
- **Szene:** sequence `[objects muschel 1, objects muschel 2, objects muschel 3, blank]`
- **Geschichte:** Kiko legt Muscheln in Felder.
- **Frage:** Wie viele Muscheln kommen ins nächste Feld?
- **Typ:** choice, layout `cards`, kein shuffle: `3` · ✔ `4` · `5`
  - `3` → In jedem Feld werden es mehr. 3 gab es schon.
  - `5` → Es kommt immer nur eine Muschel dazu.
- **Tipp 1:** Zähle die Muscheln in jedem Feld.
- **Tipp 2:** Es kommt immer eine Muschel dazu.
- **Lösungsweg:** 1, 2, 3, 4. Ins nächste Feld kommen 4 Muscheln.

### B5.4 Die Münzwippe
- **Szene:** balance · left pieces `[5]` · right pieces `[2, 2]`, unknown `1`
- **Geschichte:** Auf der Wippe liegen Münzen.
- **Frage:** Welche Münze fehlt rechts?
- **Typ:** choice, layout `coins`, kein shuffle: ✔ „1-Cent-Münze“ `[1]` · „2-Cent-Münze“ `[2]` · „5-Cent-Münze“ `[5]`
  - `[2]` → Dann wären es rechts 6 Cent. Das ist zu viel.
  - `[5]` → Dann wären es rechts 9 Cent. Das ist viel zu viel.
- **Tipp 1:** Links liegen 5 Cent. Rechts sollen es auch 5 Cent werden.
- **Tipp 2:** Rechts sind schon 2 und 2, also 4 Cent. Was fehlt bis 5?
- **Lösungsweg:** 2 Cent und 2 Cent und 1 Cent sind 5 Cent. Es fehlt die 1-Cent-Münze.

### B5.5 Das Zahlenschloss
- **Szene:** clues
  - Stern · „1 + 1“ · dots `[1, 1]`
  - Muschel · „2 + 2“ · dots `[2, 2]`
  - Fisch · „3 + 0“ · dots `[3, 0]`
- **Geschichte:** Die Truhe hat ein Zahlenschloss mit drei Rädern.
- **Frage:** Löse die drei Rätsel. Stelle die Zahlen am Schloss ein.
- **Typ:** code · digits `[2, 4, 3]` (Räder: Stern, Muschel, Fisch)
- **Tipp 1:** Zähle bei jedem Rätsel die Punkte zusammen.
- **Tipp 2:** Konkret für das erste falsche Rad, z. B. „Beim Stern: 1 Punkt und 1 Punkt. Wie viele sind das?“
- **Lösungsweg:** Stern: 1 + 1 = 2. Muschel: 2 + 2 = 4. Fisch: 3 + 0 = 3. Der Code ist 2, 4, 3.
- **Lob:** Klick! Die Truhe ist offen!

**Finale der Bucht:** wie in `01`, Abschnitt 5.6, mit der Perle und allen 5 Fundstücken. Kiko sagt: „Du hast die kleine Bucht erkundet! Ich bin so stolz auf dich.“ Im Erwachsenen-Bereich erscheint beim Profil der Hinweis: „Die kleine Bucht ist geschafft. Vielleicht passt jetzt die Stufe Seestern?“

---

## Varianten für Wiederholungen

Alle Bucht-Aufgaben werden ab dem zweiten Durchgang mit neuen Zahlen gespielt (Regel aus `09`, Abschnitt 5). Die Vorlagen stehen in `05`, Anhang B, und in `10`.

| Aufgabe | Vorlage | Aufgabe | Vorlage | Aufgabe | Vorlage |
|---|---|---|---|---|---|
| B1.1 | M1 | B2.1 | C1 | B3.1 | L1 |
| B1.2 | M1 `{ eingabe: 'number' }` | B2.2 | C1 `{ euro: true }` | B3.2 | L1 `{ exactCount: 1 }` |
| B1.3 | M2 | B2.3 | C2 | B3.3 | A1 |
| B1.4 | M3 | B2.4 | Z1 `{ antwort: 'number' }` | B3.4 | G1 `{ reicht: true, inDerHand: true }` |
| B1.5 | O2 | B2.5 | Z1 `{ antwort: 'choice' }` | B3.5 | G1 `{ reicht: false, inDerHand: true, zweiteilig: true }` |
| B4.1 | balance `{ frage: 'gleich' }` | B4.2 | balance `{ frage: 'fehlt', antwort: 'number' }` | B4.3 | N1 |
| B4.4 | M4 | B4.5 | M4 `{ geld: true }` | B5.1 | sequence `{ muster: 'bild' }` |
| B5.2 | sequence `{ muster: 'zahl', luecke: 'mitte', antwort: 'number' }` | B5.3 | sequence `{ muster: 'menge' }` | B5.4 | balance `{ frage: 'fehlt', geld: true }` |
| B5.5 | code `{ raeder: 3, punkte: true }` | | | | |

## Prüfprotokoll

B1.4: 3 + 2 = 5 · B2.4: 1 + 1 + 1 = 3 · B2.5: 2 + 1 = 3 · B3.3: 3 + 2 = 5 · B3.4: 5 ≥ 4 · B3.5: 6 − 5 = 1 · B4.2: 6 − 4 = 2 · B4.4: 5 − 2 = 3 · B4.5: 5 + 1 = 6; 6 − 2 = 4 · B5.4: 2 + 2 + 1 = 5; mit 2: 6; mit 5: 9 · B5.5: 2, 4, 3.
