# 06 – Druck: Arbeitsblätter, Lösungsblatt, Urkunde

Der Druck ist ein vollwertiger Teil der App. Die Arbeitsblätter müssen **ohne App verständlich** sein: Keine Aufgabe setzt eine Animation oder eine Erklärung am Bildschirm voraus.

## 1. Die Seite „Drucken“ (`/erwachsene/drucken`)

Sie liegt im Erwachsenen-Bereich (`09`, Abschnitt 4). Erwachsenen-Gestaltung: sachlich, ohne Kiko, normale Schriftgröße (16 px), aber dieselben Tokens. Die Ansprache ist „Sie“.

**Aufbau**
1. **Überschrift:** „Arbeitsblätter drucken“
2. **Für wen?** Auswahl des Kindes (Avatar + Name) oder „Ohne Kind“. Das legt Welt und Stufe fest. Die Stufe lässt sich hier zusätzlich frei wählen (4 Knöpfe), z. B. um ein schwereres Blatt zu drucken.
3. **Was drucken?**
   - **Stationen** der Welt mit Checkbox, Nummer und Name. Darüber „Alle auswählen“. Auf der Stufe `authoredFor` werden die Originalaufgaben gedruckt, sonst Varianten mit einem Seed (`09`, Abschnitt 5). Der Knopf „Andere Zahlen“ würfelt einen neuen Seed.
   - **Übungsblatt** (siehe Abschnitt 6): Thema, „Neue Aufgaben würfeln“.
   - **Rätselblatt:** 6 Rätsel der Stufe (`10`, Abschnitt 6), „Neue Rätsel würfeln“.
   - **Urkunde:** pro Welt. Name vorausgefüllt. Aktiv, wenn alle Stationen der Welt geschafft sind, mit dem Schalter „trotzdem erlauben“.
4. **Optionen**
   - [x] Lösungsblatt anhängen (Standard: an, steht immer auf eigenen Seiten am Ende)
   - [x] Name- und Datumsfeld
   - Schriftgröße: Normal / Groß (bei Stufe 1 immer Groß)
5. **Vorschau:** die echten Druckseiten, verkleinert untereinander (A4-Seitenverhältnis, Schatten). Die Vorschau nutzt dieselben Komponenten wie der Druck.
6. **Knopf „Drucken“** → `window.print()`.

Die Auswahl steht in der URL (`/erwachsene/drucken?welt=schatzinsel&stufe=2&stationen=1,2&loesungen=1&seed=4711`), damit ein Link oder ein Neuladen dieselbe Vorschau zeigt. Der Seed steht klein im Fuß jeder Seite, damit ein Blatt identisch nachgedruckt werden kann.

**Arbeitsblätter der kleinen Bucht (Stufe 1):** Für Kinder, die noch nicht lesen. Pro Aufgabe ein großes Bild, die Frage als kurzer Satz (zum Vorlesen durch Erwachsene) und ein Bild-Symbol für die Tätigkeit: Stift = „Kreise ein“, Hand mit Zahl = „Schreibe die Zahl“, Münze = „Male die Münzen“. Höchstens 3 Aufgaben pro Seite. Antwortfelder für Zahlen sind große Kästchen (2 × 2 cm). Bei Zahlenstrahl-Aufgaben wird ein Zahlenstrahl 0–10 zum Ankreuzen gedruckt.

> iOS: Wenn `window.print()` im installierten Modus nichts tut, zeigt die Seite den Hinweis: „Drucken klappt am besten im Browser. Öffne die Seite in Safari und tippe auf Teilen → Drucken.“

## 2. Seitenformat und Druck-CSS

```css
/* src/styles/print.css */
@page { size: A4 portrait; margin: 14mm 14mm 16mm; }

@media print {
  :root {
    --fill-main: #fff; --fill-shade: #fff; --fill-accent: #fff;   /* Illustrationen ohne Flächen */
    --stroke: #000;
  }
  html, body { background: #fff !important; color: #000; }
  .no-print, nav, header, .bottom-nav, .kiko-sheet, button { display: none !important; }
  .print-page { break-after: page; }
  .print-task { break-inside: avoid; }
  * { box-shadow: none !important; animation: none !important; transition: none !important; }
  body { font-size: 13pt; }
}
```

- **Nur Schwarz auf Weiß.** Keine vollflächigen Hintergründe, keine Grautöne über 15 % Fläche. Linien mindestens 1,5 pt.
- **Schrift:** Andika, Fließtext 13 pt, Fragen 14 pt fett, Überschrift (Fredoka) 22 pt. Bei „Groß“ alles × 1,2.
- Bildschirm-Navigation, Knöpfe und Dialoge werden nie mitgedruckt.
- Die Seitenzählung erfolgt im Fuß: „{Welt} · Station 2 · Seite 1“, bei Varianten zusätzlich „Stufe Seestern · Nr. 4711“ (Seed).

## 3. Arbeitsblatt einer Station

Eine Station = in der Regel **eine Seite** (bei langen Stationen zwei, Umbruch nur zwischen Aufgaben).

```
┌──────────────────────────────────────────────────┐
│ ☐ Name: ________________   Datum: ___________    │
│                                                  │
│  [Station-Icon]  Station 2 · Markt am Palmenstrand│
│  Auf dem Markt duftet es nach Kokos und frischem │
│  Brot. Hier kaufen wir Proviant für unsere Reise.│
│──────────────────────────────────────────────────│
│ 1  Kokosnuss und Bananenbrot                     │
│    [Kokosnuss 1,20 €] [Bananenbrot 2,30 €]       │
│    Wie viel kosten beide zusammen?               │
│    ○ 3,50 €    ○ 4,50 €    ○ 3,05 €              │
│    ┌ Rechenkästchen (5-mm-Gitter, 4 Zeilen) ┐    │
│──────────────────────────────────────────────────│
│ 2  …                                             │
│                                                  │
│ Wie ging es dir?  ☆ ☆ ☆        [Truhe zum Ausmalen]│
└──────────────────────────────────────────────────┘
```

- **Kopf:** Name- und Datumsfeld (abschaltbar), Stations-Icon als Kontur, Titel, die `intro`-Sätze. Bei Station 1 entfällt im Druck der erste Eintrag (Kikos Begrüßung).
- **Aufgabe:** Nummer in einem Kreis, Titel, Szene als Konturzeichnung, Geschichte, Frage. Danach das Antwortelement (Abschnitt 4) und **Rechenkästchen**: ein 5-mm-Gitter in hellem Grau (`#BBB`, 0,5 pt), 4 Zeilen hoch, volle Breite. Daneben klein „Rechenweg“.
- **Mehrteilige Aufgaben:** a) und b) untereinander, jeweils mit eigener Antwortzeile.
- **Fuß:** „Wie ging es dir?“ mit 3 Stern-Umrissen zum Ausmalen und das Fundstück der Station als Ausmalbild (ca. 3 cm).
- **Geld-Tokens** werden im Druck genauso aufgelöst wie am Bildschirm.

## 4. Antworttypen auf Papier

| Typ | Darstellung im Druck | Anweisung (wird vor die Frage gesetzt, falls nötig) |
|---|---|---|
| `choice` (`cards`, `yesno`) | Optionen nebeneinander mit leerem Kreis ○ davor | „Kreuze an.“ |
| `choice` (`coins`, `bags`) | Münzen bzw. Geldbörsen als Kontur, darunter ○ | „Kreuze an.“ |
| `money` | „Antwort: ______ € ______ Cent“ | – |
| `pay` | Leere Münz-Ablage (gestrichelter Kasten) + Reihe aller Palettenmünzen als Kontur | „Male die Münzen in den Kasten.“ (bei `exactCount`: „Male genau 2 Münzen.“) |
| `pay-variants` | `required` gestrichelte Kästen untereinander, beschriftet „1. Möglichkeit“, „2. Möglichkeit“ … | „Male die Münzen in die Kästen.“ |
| `order` | Karten mit einem leeren Kästchen ☐ oben rechts | „Schreibe 1, 2, 3, 4 in die Kästchen. 1 = am wenigsten.“ |
| `select` (`sum`) | Sachen mit Preisschild | „Kreise die Sachen ein.“ |
| `select` (`affordable`) | Sachen mit Preisschild | „Kreise alle Sachen ein, für die das Geld reicht.“ |

- Optionen mit `shuffle: true` werden im Druck **und** in der App mit einem festen Seed aus der Aufgaben-ID gemischt (`seedFrom(task.id)`). So steht die richtige Antwort nicht immer an derselben Stelle, und Arbeitsblatt und Lösungsblatt zeigen dieselbe Reihenfolge. Optionen mit `shuffle: false` bleiben in der Reihenfolge der Daten.
- Münzen im Druck im echten Größenverhältnis in Millimetern: 2 € = 26 mm, 1 € = 23 mm, 50 Cent = 24 mm, 20 Cent = 22 mm, 10 Cent = 20 mm, 5 Cent = 21 mm, 2 Cent = 19 mm, 1 Cent = 16 mm.

## 5. Lösungsblatt

Es steht immer auf eigenen Seiten **hinter** allen Arbeitsblättern. Die Überschrift lautet „Lösungen für Erwachsene“, das Layout ist kompakt mit 3–4 Stationen pro Seite.

Pro Station eine Tabelle:

| Nr. | Aufgabe | Lösung | Rechenweg |
|---|---|---|---|
| 1 | Kokosnuss und Bananenbrot | 3,50 € | 1 € + 2 € = 3 €. 20 Cent + 30 Cent = 50 Cent. Zusammen sind das 3,50 €. |
| 3 | Genau 3 Euro | Kokosnuss + Mango **oder** Saft + Muffin | … |

- „Lösung“ wird aus den Daten erzeugt: richtige Option, `correct`-Betrag, Beispiel-Lösung bei `pay` (minimale Münzkombination), alle Lösungen bei `select` (`sum`), die Reihenfolge bei `order`.
- „Rechenweg“ ist der `explanation`-Text.
- Ein Hinweis unter der Überschrift: „Einen Stern gibt es fürs Bearbeiten, nicht für Fehlerfreiheit. Fragen Sie lieber: Wie hast du gerechnet?“

## 6. Übungsblatt (aus den Generatoren)

- Thema wählen, die Stufe kommt aus Abschnitt 1. Der Seed wird gewürfelt und in der URL gespeichert (`&seed=…`).
- 6 Aufgaben auf einer Seite + Lösungsblatt. Knopf „Neue Aufgaben würfeln“ setzt einen neuen Seed.
- Überschrift: „Übungsblatt · Rückgeld · Stufe Krebs“.
- Neue Antworttypen im Druck: `number` → großes Kästchen „Zahl: ☐“; `grid` → Mauer/Dreieck als Kästchen zum Ausfüllen; `code` → Schloss mit leeren Kästchen unter den Symbolen; Muster → Reihe mit leerem Feld; Waage → Wippe mit leerem Kreis.

## 7. Urkunde

Eine A4-Seite im Hochformat mit Zierrahmen aus Wellen und Muscheln (Kontur).

```
                URKUNDE
     [Truhe offen mit Krone, Kontur]

        ____________ Mila ____________
     hat die geheime Schatzinsel erkundet!

   ☆ ☆ ☆ ☆ ☆ ☆ ☆ ☆ ☆   (9 Sterne zum Ausmalen)

 Du kannst jetzt: Münzen zählen · Preise addieren ·
 Rückgeld berechnen · Beträge legen · prüfen, ob das
 Geld reicht · Sachaufgaben lösen · knobeln

   Datum: __________       [Kiko-Kontur] „Kiko“ als Unterschrift
```

- Name groß in Fredoka. Ohne gespeicherten Namen bleibt eine Linie zum Selbstschreiben.
- **Urkunde der kleinen Bucht:** „hat die kleine Bucht erkundet!“, 5 Sterne, Fähigkeiten: „Zählen · Münzen kennen · mit Cent bezahlen · vergleichen · Rätsel lösen“, Perle statt Krone.
- Die Fähigkeiten-Zeile ist fester Text je Welt. Schatzinsel: „Münzen zählen · Preise addieren · Rückgeld berechnen · Beträge legen · prüfen, ob das Geld reicht · Sachaufgaben lösen · knobeln“.

## 8. Abnahme Druck

- In Chrome und Safari (Desktop) passt jede Seite auf A4, nichts wird abgeschnitten, keine Aufgabe wird über zwei Seiten geteilt.
- Graustufen-Druck: Alles bleibt lesbar, und keine Information hängt an Farbe.
- Ohne Lösungsblatt enthält der Ausdruck keine einzige Lösung, auch nicht in versteckten Elementen.
- Die Playwright-Prüfung mit `emulateMedia({ media: 'print' })` und `page.pdf()` erzeugt pro Station genau 1–2 Seiten.
