# 01 – Produkt und UX

## 1. Worum es geht

„Mathe-Abenteuer – Die geheime Schatzinsel“ ist eine Lern-App für Kinder von **5 bis 8 Jahren**. Mehrere Kinder können ein Gerät teilen, jedes mit eigenem Profil und eigener **Stufe** (`09`). Der Schwerpunkt ist Rechnen mit Geld, dazu kommen Sachaufgaben und Rätsel (`10`). Die Originalaufgaben der Schatzinsel (`04`) sind für Stufe 3 (etwa 7 Jahre) geschrieben, Kinder um 5 Jahre spielen in der Welt „Die kleine Bucht“ (`11`).

Mathe soll sich nicht wie ein Arbeitsblatt anfühlen, sondern wie eine Reise: Das Kind erkundet mit dem Papagei **Kiko** eine Insel. Auf dem Weg kauft es auf dem Markt ein, zählt Rückgeld am Kiosk, löst die Rätsel der Krabbe Kalle und öffnet am Ende die Schatztruhe.

**Nutzung**
1. **Am Handy (Hauptfall):** kurze Aufgaben, sofortige freundliche Rückmeldung, Tipps.
2. **Auf Papier:** schwarz-weiße A4-Arbeitsblätter mit separatem Lösungsblatt (siehe `06-druck.md`).

**Nicht im MVP:** Statistiken für Erwachsene, Konten, Backend, Sound, automatische Stufenanpassung, weitere Fächer.

## 2. Leitprinzipien

| Prinzip | Was das konkret heißt |
|---|---|
| Freude statt Druck | Kein Zeitlimit, keine Punktzahl, keine Noten, keine Ranglisten, keine Streaks. |
| Fehler sind Hinweise | Falsche Antworten sind nie rot. Es gibt einen sachlichen Satz und einen passenden Tipp. Neuer Versuch ohne Verlust. |
| Denkweg statt richtig/falsch | Jede Aufgabe hat zwei Tipp-Stufen und einen Lösungsweg. Rückmeldungen erklären, *warum*. |
| Kurze Einheiten | Eine Station hat 5 Aufgaben und dauert etwa 5–10 Minuten. Nach jeder Station ist ein guter Moment zum Aufhören. |
| Wenig Text pro Bildschirm | Eine Aufgabe pro Bildschirm. Geschichte höchstens 3 kurze Sätze. Alles kann vorgelesen werden. |
| Geld sichtbar machen | Preise als Preisschilder, Geld als gezeichnete Münzen in echten Größenverhältnissen. |
| Abwechslung | 9 Antwortarten (siehe 6.2), die sich innerhalb jeder Station abwechseln. Wiederholte Stationen bekommen neue Zahlen. |
| Lob für Strategien | „Du hast zuerst die Euro und dann die Cent gerechnet.“ statt nur „Richtig!“ |

## 3. Ton und Sprache

- Kiko spricht das Kind mit **du** an. Freundlich, konkret, kurze Sätze (Ziel: höchstens 12 Wörter).
- **Keine Babysprache**, keine Ironie, keine Verkleinerungen wie „Rechenaufgäbchen“.
- Das Wort **„falsch“ kommt nie vor.** Stattdessen: „Noch nicht ganz.“, „Das passt noch nicht.“
- **Geschlechtsneutral zum Kind:** keine Wörter wie „Schatzsucher“ oder „Profi“ für das Kind. Stattdessen „du“, „Entdeckergeist“, „gut überlegt“.
- **Beträge immer als Ziffern**, Anzahlen bis zwölf dürfen als Wort stehen („drei Münzen“). Beträge im deutschen Format mit geschütztem Leerzeichen: `1,20 €`, `50 Cent` (siehe Formatierungsregeln in `03`).
- Figuren in Aufgaben haben vielfältige Vornamen: Lina, Ben, Mia, Emil, Noah, Ida, Paul, Mara, Lea, Yusuf, Aylin, Finn.

### Rückmeldungs-Pools

Kiko wählt zufällig aus diesen Sätzen, aber nie zweimal hintereinander denselben.

**Richtig (erster Versuch)**
- Richtig! Du bist dem Schatz einen Schritt näher.
- Genau so! Gut gerechnet.
- Stimmt! Das hast du dir gut überlegt.
- Super, das passt!
- Klasse! Ich mache einen Freudensprung.

**Richtig nach Fehlversuchen**
- Geschafft! Du bist drangeblieben.
- Jetzt passt es! Dranbleiben lohnt sich.
- Richtig! Fehler sind Hinweise, und du hast sie genutzt.

**Erster Fehlversuch** (danach folgt der spezifische Hinweis oder Tipp 1)
- Noch nicht ganz. Schau dir meinen Tipp an.
- Fast! Probier es noch einmal.
- Das passt noch nicht. Fehler sind Hinweise.

**Zweiter Fehlversuch** (danach folgt Tipp 2)
- Lass uns zusammen rechnen.
- Ich helfe dir ein Stück weiter.

**Dritter Fehlversuch** (danach folgt der Lösungsweg)
- Ich zeige dir, wie es geht. Danach bist du dran.

**Pause**
- Gute Idee, mach eine Pause! Ich merke mir, wo wir waren.

## 4. Informationsarchitektur und Navigation

```
App
├── Ersteinrichtung (einmalig, durch Erwachsene, 09 Abschnitt 3.3)
├── Wer spielt? (nur bei mehreren Profilen)
├── Abenteuer (Startseite)          ← untere Navigation
│   │   Welt des Kindes: Schatzinsel (Stufe 2–4) oder kleine Bucht (Stufe 1)
│   ├── Avatar (oben links)         → Wer spielt?
│   ├── Zahnrad (oben rechts)       → Erwachsenen-Frage → Erwachsenen-Bereich
│   └── Stationskarte (Bottom Sheet)
│       └── Spiel: Aufgaben → Abschluss → optional Bonus-Rätsel
├── Üben                            ← untere Navigation
│   └── Thema → Wie schwer? → Anzahl → Spiel → Rundenabschluss
├── Schätze                         ← untere Navigation
│   └── Urkunde (wenn eine Welt komplett ist)
└── Erwachsene (hinter Erwachsenen-Frage, 09 Abschnitt 4)
    ├── Kinder: Name, Tier, Stufe, freischalten, zurücksetzen
    ├── Drucken: Arbeitsblätter, Lösungsblatt, Übungs- und Rätselblätter, Urkunde
    └── Daten sichern, Hinweise
```

**Untere Navigation:** 3 Tabs mit Icon und Beschriftung: **Abenteuer** (Icon der Welt: Palme bzw. Muschel), **Üben** (Münzstapel), **Schätze** (Truhe). Die Leiste wird im Spiel ausgeblendet (Fokusmodus). Bei Stufe 1 und 2 werden die Tab-Namen beim Antippen vorgelesen.

**Routen:** siehe `03`, Abschnitt 3.

**Zurück-Taste (Android und Browser):** Im Spiel öffnet sie den Pause-Dialog, statt die Seite zu verlassen. Auf allen anderen Seiten verhält sie sich normal.

**Klickweg zur ersten Aufgabe:** App öffnen → „Weiter“ → „Los geht's!“ = **2 Tipper**.

## 5. Bildschirme

Die Maße beziehen sich auf ein Handy mit 390 × 844 px. Ab 900 px Breite gelten die Desktop-Regeln aus Abschnitt 8.

### 5.1 Erster Start

Die Ersteinrichtung macht ein Erwachsener (Profile anlegen, Stufe wählen), siehe `09`, Abschnitt 3.3. Danach, beim ersten Spielen jedes Kindes:

1. Kiko fliegt ins Bild (Animation 600 ms) und sagt: „Hallo! Ich bin Kiko. Ich kenne eine geheime Schatzinsel. Kommst du mit?“ In der kleinen Bucht: „Hallo! Ich bin Kiko. Komm mit in die kleine Bucht!“
2. Danach geht es direkt zur Karte. Station 1 pulsiert.

### 5.2 Insel (Startseite)

**Aufbau von oben nach unten**
- **Kopfzeile (56 px):** links der Avatar des Kindes (40 px, führt zu „Wer spielt?“), daneben die Sterne-Pille „★ 3 von 9“ (die Gesamtzahl ist die Zahl der Stationen der Welt). Rechts ein kleines, dezentes Zahnrad (40 px, `aria-label="Für Erwachsene"`).
- **Begrüßung** in Kikos Sprechblase, eine Zeile: „Hallo Mila! Wohin geht's heute?“ (ohne Namen mit dem Tier aus dem Profil: „Hallo, kleiner Delfin! Wohin geht's heute?“). Erscheint nur beim Öffnen und blendet nach 4 Sekunden aus.
- **Inselkarte:** ein senkrechter Weg zum Scrollen. Unten der Strand mit Station 1, oben auf dem Hügel die Schatztruhe mit Station 9. Beim Öffnen scrollt die Karte automatisch zur aktuellen Station.
- **Großer Weiter-Knopf** fest über der Navigation: „▶ Weiter: Kokos-Kiosk“. Nach dem Ende der Insel lautet er: „Schatz ansehen“.
- **Untere Navigation.**

**Stationsknoten (Kreis 72 px, mit Icon der Station und Nummer)**

| Zustand | Darstellung |
|---|---|
| Geschafft | farbig, goldener Stern am Rand, Häkchen-Symbol |
| Aktuell | farbig, pulsiert sanft (Skalierung 1 → 1,06, 1,6 s), Kiko sitzt daneben |
| Gesperrt | in Nebel gehüllt (halbtransparente Wolke), kleines Schloss-Icon, nicht farbig |

- Gesperrte Gebiete der Karte liegen unter Nebelwolken. Nach jeder geschafften Station zieht der Nebel über dem nächsten Abschnitt einmalig mit Animation ab.
- **Freischaltung:** Die Stationen sind der Reihe nach freigeschaltet. Antippen einer gesperrten Station zeigt eine kleine Sprechblase: „Der Weg ist noch im Nebel. Schaffe zuerst die Station davor!“

### 5.3 Stationskarte (Bottom Sheet)

Sie öffnet sich beim Antippen einer Station oder über den Weiter-Knopf und deckt etwa 70 % des Bildschirms ab.

- Große Illustration der Station.
- Titel: „Station 3 · Kokos-Kiosk“.
- Kikos Einleitung (die `intro`-Sätze der Station), mit Vorlese-Knopf.
- Zwei Info-Chips: „⏱ etwa 7 Minuten“ und „Hier übst du: Rückgeld berechnen“.
- Hauptknopf: **„Los geht's!“** (wenn angefangen: „Weiterspielen“).
- Bei geschafften Stationen zusätzlich: „Noch einmal spielen“ (mit neuen Zahlen, `09` Abschnitt 5), „Mehr davon üben“ (öffnet Üben mit dem passenden Thema) und, falls noch offen, „Bonus-Rätsel“.
- Schließen: nach unten wischen oder X oben rechts.

### 5.4 Spiel-Bildschirm (Kern der App)

```
┌──────────────────────────────┐
│ ✕   ● ● ◐ ○ ○          🔊    │  Kopf: Pause · Fortschritt · Vorlesen
├──────────────────────────────┤
│                              │
│      SZENE (Illustration)    │  ca. 35 % Höhe: Münzen, Preisschilder,
│                              │  Beutel, Piratenbuch …
├──────────────────────────────┤
│ Eine Kokosnuss kostet 1,20 €.│  Geschichte (normal, 20 px)
│ Ein Bananenbrot kostet 2,30 €│
│ Wie viel kosten beide        │  Frage (fett, 24 px)
│ zusammen?                    │
├──────────────────────────────┤
│  [ 3,50 € ]                  │  Antwortbereich im Daumenbereich
│  [ 4,50 € ]                  │  (3 Optionen untereinander)
│  [ 3,05 € ]                  │
│                              │
│ (🦜 Tipp)        [ Prüfen ]  │  Tipp-Knopf · Hauptknopf
└──────────────────────────────┘
```

- **Fortschritt:** pro Aufgabe eine Muschel. Gefüllt heißt erledigt, halb gefüllt heißt aktuell. In Stationen mit `progressStyle: 'locks'` (Insel 9, Bucht 5) ist es stattdessen ein Schloss pro Aufgabe, das aufspringt.
- **Pause (✕):** Dialog „Pause machen? Ich merke mir, wo wir waren.“ mit den Knöpfen „Weiterspielen“ (Hauptknopf) und „Zur Karte“.
- **Vorlesen (🔊):** liest Geschichte und Frage vor (siehe `03`, Sprachausgabe). Fehlt die Sprachausgabe im Browser, wird der Knopf ausgeblendet.
- **Tipp-Knopf:** Kiko-Kopf mit Glühbirne und „Tipp“. Er zeigt immer die nächste Tipp-Stufe und zählt nicht als Fehlversuch.
- **Prüfen:** Hauptknopf für alle Antwortarten außer Antwortkarten. Er ist deaktiviert, solange keine vollständige Antwort vorliegt. Bei Antwortkarten wird direkt beim Antippen geprüft.
- **Mehrteilige Aufgaben:** Teil a) und b) erscheinen nacheinander. Ein gelöster Teil bleibt als kleiner Chip über der Frage stehen: „✓ a) 1,20 €“. Ein optionaler Zusatztext für Teil b (`lead`) erscheint über der neuen Frage.

### 5.5 Rückmeldung (Kiko-Sheet)

Nach dem Prüfen fährt von unten ein Sheet hoch (250 ms). Es enthält Kiko in passender Pose, eine Sprechblase und einen Knopf. Der Aufgabenbereich darüber bleibt sichtbar.

| Situation | Kiko-Pose | Inhalt | Knopf |
|---|---|---|---|
| Richtig | freut sich | Satz aus dem Pool + Strategie-Lob (`praise`, falls vorhanden) + Kurzerklärung „So geht's: …“ | „Weiter“ |
| 1. Fehlversuch | denkt | Satz aus dem Pool + spezifischer Hinweis (`feedback`/`mistakes`) oder Tipp 1 | „Nochmal versuchen“ |
| 2. Fehlversuch | zeigt | Satz aus dem Pool + Tipp 2 | „Nochmal versuchen“ |
| 3. Fehlversuch | zeigt | „Ich zeige dir, wie es geht. Danach bist du dran.“ + Lösungsweg | „Jetzt ich!“ |

- Nach dem Lösungsweg löst das Kind die Aufgabe selbst. Die App springt nie automatisch weiter. Die Antwort wird nicht vorausgefüllt.
- Ist ein spezifischer Hinweis vorhanden, ersetzt er beim 1. Fehlversuch den Tipp 1. Der Tipp 1 bleibt über den Tipp-Knopf erreichbar.
- Bei Geldeingaben ohne passenden `mistakes`-Eintrag wird als Hinweis angezeigt: „Das ist etwas zu viel.“ oder „Das ist etwas zu wenig.“ Danach folgt der Tipp.
- **Bei Antwortkarten** wird eine probierte falsche Karte gestrichelt umrandet und blass dargestellt, mit dem Icon „↺ probiert“. Sie lässt sich nicht erneut wählen. Sie wird **nicht rot**.
- Die richtige Antwort wird mit grünem Rand, Häkchen-Icon und einer kleinen Hüpf-Animation markiert. Die Information steckt also nie nur in der Farbe.
- **Wiederholung:** Das Sheet schließt sich bei „Nochmal versuchen“. Die Eingabe bleibt stehen, damit das Kind sie korrigieren kann, statt neu anzufangen. Bei Münz- und Auswahlaufgaben bleibt die Auswahl ebenfalls liegen.

### 5.6 Stationsabschluss

1. Der Bildschirm wird ruhig, Kiko landet in der Mitte.
2. Das **Fundstück** erscheint (Pop-Animation) mit seinem Text, zum Beispiel: „Im Sand glitzert etwas: eine Glitzermuschel. Sie gehört jetzt dir.“
3. Ein **Stern** fliegt nach oben in die Sterne-Pille. Dazu dezentes Konfetti, das bei `prefers-reduced-motion` entfällt.
4. Rückblick in einer Zeile (`recap`): „Du hast Rückgeld ausgerechnet.“
5. Knöpfe: **„Zurück zur Karte“** (Hauptknopf) und „Nächste Station“ (sekundär).
6. Darunter das freiwillige Angebot: „Kiko hat noch ein Bonus-Rätsel. Magst du?“ mit „Ja!“ und „Später“ (`10`, Abschnitt 6).
7. Auf der Karte zieht danach einmalig der Nebel über der nächsten Station ab.

**Finale (Station 9):** Die Truhe öffnet sich. Die goldene Krone und alle 9 Fundstücke erscheinen nacheinander. Dazu der Text: „Du hast die geheime Schatzinsel erkundet! Ich bin so stolz auf dich.“ Knöpfe: „Meine Schätze ansehen“ und „Zur Karte“. In „Schätze“ erscheint danach die Urkunde. Das Finale der kleinen Bucht steht in `11`.

### 5.7 Üben

Hier gibt es freies Üben ohne Story und ohne Sterne. Die Aufgaben werden jedes Mal neu erzeugt (siehe `05`).

**Ablauf auf einem Bildschirm, von oben nach unten:**
1. **„Was möchtest du üben?“** Themenkarten im 2-Spalten-Raster, jeweils mit Icon und kurzem Namen. Es erscheinen nur die Themen der Stufe (`09`, `STUFEN[stufe].practiceTopics`): Mengen und Zahlen, Münzen zählen, Preise addieren, Rückgeld, Münzen legen, Reicht das Geld?, Sachaufgaben, Knobeln, Rätsel.
2. **„Wie schwer?“** 3 große Wahlknöpfe: **Etwas leichter** · **Genau richtig** (vorausgewählt) · **Etwas kniffliger**. Sie verschieben die Stufe um −1, 0 oder +1 (`09`, Abschnitt 6).
3. **„Wie viele Aufgaben?“** ein Umschalter mit **5** und **10**.
4. Hauptknopf **„Los geht's!“**.

- Die letzte Auswahl wird gespeichert und ist beim nächsten Mal vorausgewählt.
- Gespielt wird auf demselben Spiel-Bildschirm wie bei den Stationen.
- **Rundenabschluss:** „Runde geschafft! Eine neue Perle für deine Kette.“ Eine Perle rollt auf eine Kette. Knöpfe: „Noch eine Runde“ und „Fertig“.

### 5.8 Schätze

- **Sterne:** 9 Sternplätze, gefüllte und leere.
- **Fundstücke:** ein 3 × 3-Raster. Gefundene Stücke sind farbig, noch nicht gefundene erscheinen als graue Silhouette mit „?“. Antippen zeigt Name, Text und den Fundort („Gefunden am Muschelstrand“).
- **Perlenkette:** zeigt alle gesammelten Perlen aus dem Üben. Die Kette wächst und geht nie verloren.
- **Glitzersteine:** einer pro gelöstem Bonus-Rätsel („Bonus-Rätsel: 3 von 9“, Gesamtzahl je Welt), siehe `10`, Abschnitt 6.
- **Welten:** Hat das Kind schon in der kleinen Bucht gespielt, gibt es oben zwei Reiter „Kleine Bucht“ und „Schatzinsel“ mit jeweils eigenen Sternen und Fundstücken.
- **Urkunde:** sobald alle Sterne einer Welt da sind. Knopf „Meine Urkunde“ öffnet `/schaetze/urkunde`. Das Drucken selbst passiert im Erwachsenen-Bereich, das Kind sieht hier eine Vorschau und den Hinweis „Frag einen Erwachsenen, ob ihr sie ausdruckt.“

### 5.9 Erwachsenen-Bereich und Drucken

Der Erwachsenen-Bereich ist über das Zahnrad erreichbar, hinter einer Erwachsenen-Frage (`09`, Abschnitt 4). Er hat eine sachliche Gestaltung ohne Kiko. Drucken ist ein Teil davon, Details in `06-druck.md`.

Pro Kind gibt es dort „Alle Stationen freischalten“ und „Fortschritt zurücksetzen“. Der Bestätigungsdialog lautet: „Wirklich alles von {Name} zurücksetzen? Sterne, Fundstücke und Perlen werden gelöscht.“ Knöpfe: „Abbrechen“ (Hauptknopf) und „Zurücksetzen“. Dazu kommt der Hinweis: „Der Fortschritt wird nur auf diesem Gerät gespeichert. Mit ‚Sicherung herunterladen‘ können Sie ihn aufbewahren.“

## 6. Aufgabenfluss im Detail

### 6.1 Zustandsmodell eines Aufgabenteils

```
bereit → (Antwort) → prüfen ─┬─ richtig → Rückmeldung richtig → nächster Teil / nächste Aufgabe
                             └─ nicht richtig → Fehlversuch n (1, 2, 3+) → bereit
```

- `wrongCount` zählt die Fehlversuche pro Aufgabenteil.
- `hintLevel` = max(Fehlversuche, über den Tipp-Knopf geöffnete Tipps), höchstens 3. Hilfestufe 3 bedeutet: Lösungsweg sichtbar.
- Ab `hintLevel` 2 erscheint neben dem Tipp-Knopf zusätzlich „So geht's“, das den Lösungsweg zeigt.
- Intern wird `wrongCount` pro Teil gespeichert, für spätere Auswertungen. Das Kind sieht diese Zahl nie.

### 6.2 Antwortarten

| Typ | Interaktion | Prüfen |
|---|---|---|
| `choice` | 2–4 große Antwortkarten (Text, Betrag, Münze oder Geldbörse). Varianten: `cards`, `yesno`, `coins`, `bags`. | sofort beim Antippen |
| `money` | Geldeingabe mit zwei Feldern „__ €“ und „__ Cent“ und einer eigenen Zifferntastatur | Knopf „Prüfen“ |
| `pay` | Münzen aus einer Palette auf Kikos Tablett legen. Optional mit angezeigter Summe, fester Münzanzahl oder „so wenige Münzen wie möglich“. | Knopf „Prüfen“ |
| `pay-variants` | wie `pay`, aber mehrere verschiedene Möglichkeiten finden. Jede wird mit „Diese Möglichkeit merken“ gespeichert. | pro Möglichkeit |
| `order` | Karten der Reihe nach antippen. Sie bekommen Nummern-Plaketten 1, 2, 3 … Erneutes Antippen der letzten Karte nimmt die Nummer zurück. | Knopf „Prüfen“, sobald alle nummeriert sind |
| `select` | Sachen mit Preisschild an- und abwählen (Häkchen). Regel: genau n Sachen mit Summe X, oder alle Sachen, für die das Geld reicht. | Knopf „Prüfen“ |
| `number` | ganze Zahl über Zahlenstrahl 0–10 (Stufe 1) oder Zifferntastatur | Knopf „Prüfen“ |
| `grid` | Zahlenmauer oder Rechendreieck: leere Felder antippen und ausfüllen (`10`) | Knopf „Prüfen“, richtige Felder werden fest |
| `code` | Zahlenschloss mit 3–4 Rädern (`10`) | Knopf „Öffnen“ |

**Geldeingabe (`money`) im Detail**
- Zwei Felder nebeneinander: `[ 3 ] €   [ 50 ] Cent`. Das aktive Feld hat einen dicken Rahmen, beim Start ist es das Euro-Feld.
- Eigene Zifferntastatur (3 × 4) unten: Ziffern 0–9, „⌫“ (löschen) und „→“ (zum Cent-Feld wechseln). Die Systemtastatur wird nie geöffnet.
- Das Euro-Feld nimmt höchstens 2 Ziffern, das Cent-Feld höchstens 3. Tippt das Kind zum Beispiel „0 €  120 Cent“, ist das richtig, wenn 120 Cent gesucht sind. Kiko ergänzt dann: „120 Cent sind übrigens 1,20 €.“
- Leere Felder zählen als 0. „Prüfen“ ist aktiv, sobald mindestens ein Feld eine Ziffer enthält.
- Unter den Feldern steht in klein die Live-Vorschau: „Deine Antwort: 3,50 €“.

**Münzen legen (`pay`) im Detail**
- Unten liegt die Palette mit je einer Münze pro Wert (unbegrenzter Vorrat). Darüber liegt das Tablett.
- Antippen einer Palettenmünze lässt eine Kopie aufs Tablett springen (200 ms). Antippen einer Tablettmünze legt sie zurück.
- Auf dem Tablett werden die Münzen automatisch nach Wert sortiert angezeigt, größte zuerst.
- Bei `showTotal: true` steht unter dem Tablett: „Auf dem Tablett: 85 Cent“.
- Es passen höchstens 15 Münzen aufs Tablett. Danach sagt Kiko: „Das Tablett ist voll! Nimm ein paar Münzen weg.“

## 7. Motivation ohne Druck

- **Sterne:** einer pro geschaffter Station. Den Stern gibt es fürs Abschließen, nicht für Fehlerfreiheit.
- **Fundstücke:** 9 Sammelobjekte (Bucht: 5) mit kleiner Geschichte. Der goldene Schlüssel aus Station 4 öffnet in Station 9 die Truhe.
- **Inselkarte:** Der Nebel lichtet sich sichtbar.
- **Perlenkette:** wächst mit jeder Übungsrunde.
- **Glitzersteine:** für freiwillige Bonus-Rätsel nach einer Station.
- **Neue Zahlen beim Wiederholen:** Geschaffte Stationen lassen sich mit neuen Zahlen erneut spielen.
- **Urkunde** zum Ausdrucken am Ende.
- Es gibt **keine** Streaks, Tageszähler, Push-Nachrichten, Ranglisten oder Vergleiche.

## 8. Responsives Verhalten

| Breite | Layout |
|---|---|
| < 600 px | Eine Spalte wie oben beschrieben. Die Navigation unten. |
| 600–899 px (Tablet hochkant) | Wie Handy, Inhalt maximal 560 px breit und mittig. Größere Szene. |
| ≥ 900 px (Tablet quer, Desktop) | Spiel zweispaltig: links Szene und Text, rechts Antwortbereich, Kiko-Sheet rechts. App-Rahmen maximal 1040 px, Hintergrund mit Meeresmuster. Die Navigation wird zur linken Seitenleiste. |

- Querformat am Handy: Szene und Text links, Antwort rechts, wie beim Desktop, nur kompakter.
- Sichere Bereiche (Notch, Home-Indikator) über `env(safe-area-inset-*)` berücksichtigen.

## 9. Barrierefreiheit

- Touch-Ziele mindestens 56 × 56 px, Antwortkarten mindestens 72 px hoch, Abstand zwischen Zielen mindestens 12 px.
- Kontraste mindestens WCAG AA (Werte in `02`).
- Richtig und probiert werden immer zusätzlich mit Icon und Text gekennzeichnet.
- Rückmeldungen stehen in einer `aria-live="polite"`-Region.
- Alle Münzen haben `aria-label`s wie „20-Cent-Münze“ und „2-Euro-Münze“. Münzen auf dem Tablett: „Tablett: 2 Münzen, zusammen 70 Cent“.
- Alles lässt sich auch per Tastatur bedienen (Desktop): Tab-Reihenfolge, Enter/Leertaste, Ziffern tippen in der Geldeingabe.
- `prefers-reduced-motion`: keine Pulse, kein Konfetti, kein Fliegen. Stattdessen einfache Überblendungen.
