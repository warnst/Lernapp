# 07 – Umsetzungsplan

Die Phasen bauen aufeinander auf. **Nach jeder Phase:** `npm run check` grün, Pull Request (siehe `08`), kurze Notiz in `docs/ENTSCHEIDUNGEN.md`, falls etwas von der Spezifikation abweicht.

Die Reihenfolge ist bewusst so gewählt, dass nach Phase 4 schon eine spielbare Station existiert, die man einem Kind zeigen kann.

---

## Phase 0 – Projekt aufsetzen

- `npm create vite@latest schatzinsel -- --template react-ts`, TypeScript `strict`.
- Abhängigkeiten: `wouter`, `@fontsource/andika`, `@fontsource-variable/fredoka`. Dev: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `@playwright/test`, `vite-plugin-pwa`.
- Komplette Qualitäts-Einrichtung aus `08`: TypeScript-Optionen, ESLint inkl. Projektregeln und Architekturgrenzen, Prettier, Stylelint, knip, Coverage-Schwellen, Lefthook-Hooks, commitlint, npm-Skripte, `.nvmrc`, `.editorconfig`, `.gitattributes`.
- GitHub: Repository, CI-Workflow, PR-Vorlage, Dependabot, Branch-Schutz für `main`. Vercel mit dem Repository verbinden.
- Ordnerstruktur aus `03`, Abschnitt 2 anlegen. `tokens.css`, `global.css` (Reset, Schriften). `<html lang="de">` in `index.html`.
- `vercel.json` aus `03`, Abschnitt 12.

**Abnahme:** `npm run dev` zeigt eine leere Seite mit Sand-Hintergrund und Andika-Schrift. `npm run check` läuft grün. Ein Test-Commit mit falscher Nachricht („test“) wird vom Hook abgelehnt. Der erste Pull Request hat eine grüne CI und eine Vercel-Vorschau.

## Phase 1 – Domänenlogik und Stufen (testgetrieben)

- `domain/types.ts` nach `03`, Abschnitt 4, inklusive der Ergänzungen aus `09`, `10` und `11`.
- `config/levels.ts` mit `STUFEN` und `AGE_TO_STUFE` exakt nach `09`, Abschnitt 2.
- `money.ts`, `text.ts`, `check.ts` (alle Antworttypen inkl. `number`, `grid`, `code`), `hints.ts`, `random.ts`.
- Löser für Zahlenmauer und Rechendreieck (`10`, Abschnitt 5).
- Unit-Tests aus `03`, Abschnitt 10.

**Abnahme:** 100 % Zeilenabdeckung in `src/domain/`. `parseMoney('1,5') === 150`, `formatMoney(85) === '85\u00A0Cent'`, `minPieces(75, [50,20,10,5,2,1]) === 3`. Die Beispiele aus `10`, Abschnitt 5 werden vom Löser korrekt gelöst.

## Phase 2 – Inhalte

- Alle 9 Inselstationen aus `04` und alle 5 Buchtstationen aus `11` als TypeScript-Daten. **Texte wörtlich.** `authoredFor` und `variant` laut `09`, Abschnitt 5.2 bzw. `11` eintragen.
- `feedback.ts` mit den Pools aus `01`, Abschnitt 3.
- `content.test.ts` mit allen Invarianten.

**Abnahme:** 45 + 25 Aufgaben, alle Inhaltstests grün. Ein Testlauf gibt eine Tabelle aus (Station, Aufgabe, Typ, richtige Antwort), die mit den Prüfprotokollen in `04` und `11` übereinstimmt.

## Phase 3 – Grundgerüst, Profile, Karte

- Komponenten: `Button`, `BottomNav`, `BottomSheet`, `StarPill`, `Kiko` (alle 5 Posen), `StationNode`, `Avatar`.
- Router mit allen Routen aus `03`, Abschnitt 3 (leere Platzhalter für noch fehlende Seiten).
- App-State mit Profilen, Persistenz, Export/Import (`09`, Abschnitt 3; `03`, Abschnitt 8).
- Ersteinrichtung, „Wer spielt?“, Erwachsenen-Frage und Erwachsenen-Bereich mit Profilverwaltung (`09`, Abschnitte 3 und 4).
- Weltkarte für Insel und Bucht mit Nebel, Weiter-Knopf, Stationskarte (`01`, 5.2 und 5.3; `11`).

**Abnahme:** Zwei Profile (Stufe 1 und Stufe 3) lassen sich anlegen. Je nach Profil erscheint die Bucht oder die Insel. Neu laden behält alles. Die Erwachsenen-Frage schützt den Bereich.

## Phase 4 – Spiel-Bildschirm (Kern)

- `Scene` mit allen Varianten, `Coin`/`Note` in echter Größe, `PriceTag`, `ItemCard`, Objekt-Szenen mit Zählhilfe.
- Alle Antworttypen: `AnswerCard`-Raster, `MoneyInput` + `Keypad`, Zahlenstrahl, `CoinTray` + `CoinPalette`, Varianten-Liste, `order`, `select`. (`grid` und `code` folgen in Phase 7.)
- `KikoSheet` mit dem kompletten Ablauf aus `01`, 5.5 und 6.1: Fehlversuche, Tipp-Stufen, Lösungsweg, „Jetzt ich!“.
- Stufenabhängige Darstellung aus `09`, Abschnitt 7, inklusive automatischem Vorlesen.
- Mehrteilige Aufgaben mit Chips. Pause-Dialog, Zurück-Taste, Fortsetzen nach dem Neuladen.

**Abnahme:** Insel-Station 1 und 4 sowie Bucht-Station 1 und 3 lassen sich komplett spielen. Jeder Antworttyp wurde mit richtig, falsch, Tipp und Lösungsweg getestet. Im Spiel gibt es keine roten Elemente.

## Phase 5 – Belohnung und Schätze

- Stationsabschluss mit Fundstück, Sternflug, Rückblick (`01`, 5.6).
- Freischaltung der nächsten Station, Nebel-Animation (einmalig über `celebrated`).
- Finale nach Insel-Station 9 und Bucht-Station 5.
- Bildschirm „Schätze“ mit Welten-Reitern (`01`, 5.8).
- `prefers-reduced-motion` für alle Animationen.

**Abnahme:** Alle Stationen beider Welten (bis auf Bucht-Station 4 und 5, die Waage und Muster aus Phase 7 brauchen) sind durchspielbar. Die Schätze zeigen Sterne und Fundstücke je Welt.

## Phase 6 – Generatoren, Üben und Stationsvarianten

- `items.ts`, `things.ts`, `names.ts`, `distractors.ts`, alle Vorlagen aus `05` inklusive Anhang A und B.
- `variants.ts`: Auswahl Original oder Variante nach `09`, Abschnitt 5.1.
- Generator-Tests aus `05`, Abschnitt 7, für alle Stufen.
- Üben-Bildschirm mit „Wie schwer?“ (`01`, 5.7), Rundenabschluss mit Perle, „Mehr davon üben“.

**Abnahme:** Alle Themen × Stufen erzeugen spielbare Runden. Die Insel ist auf Stufe 2, 3 (Wiederholung) und 4 mit passenden Zahlen spielbar, jede Station hat mindestens 3 Aufgaben. 20 zufällige Aufgaben pro Thema und Stufe wurden manuell gelesen, und die Sätze sind grammatisch korrekt.

## Phase 7 – Rätsel

- Antworttypen `grid` (Mauer, Dreieck) und `code` (Zahlenschloss), Szenen `sequence`, `balance`, `clues`, Logik mit Ordnungshilfe.
- Rätsel-Generatoren für alle Typen und Stufen (`10`).
- Üben-Thema „Rätsel“, Bonus-Rätsel nach jeder Station, Glitzersteine.
- Bucht-Station 5 vollständig.

**Abnahme:** Alle Punkte aus `10`, Abschnitt 7. Ein Bonus-Rätsel lässt sich spielen und überspringen, ohne dass etwas verloren geht.

## Phase 8 – Druck

- Druckseite im Erwachsenen-Bereich, Arbeitsblätter (Insel und Bucht), Lösungsblatt, Übungs- und Rätselblatt, Urkunden nach `06`.

**Abnahme:** Alle Punkte aus `06`, Abschnitt 8.

## Phase 9 – PWA und Auslieferung

- `vite-plugin-pwa` nach `03`, Abschnitt 11. App-Icons erzeugen.
- Offline-Test, Update-Verhalten.
- Lighthouse mobil.
- README mit Start, Test und Deployment.

**Abnahme:** Die App lässt sich auf Android (Chrome) und iPhone (Safari: Teilen → Zum Home-Bildschirm) installieren und startet im Flugmodus.

## Phase 10 – Qualitätsrunde

- Alle E2E-Tests aus `03`, Abschnitt 10, plus: zwei Profile anlegen, zwischen ihnen wechseln, Fortschritte bleiben getrennt.
- Manuelle Geräteprobe: iPhone (klein, z. B. SE), Android-Handy, iPad quer, Desktop.
- Sprachprüfung: alle sichtbaren Texte einmal vollständig vorlesen lassen und auf Verständlichkeit prüfen. Für die Bucht zusätzlich: Ein 5-jähriges Kind kann eine Station **ohne Lesen** spielen.

## Phase 11 ff. – Rätselturm (`12`)

Die Schritte aus `12`, Abschnitt 9, je ein Pull Request: Navigation und Turm mit Witzekiste · Kleiderschrank und Nest · Sudoku · Wissensfragen · Memory, Was passt nicht?, Schattenrätsel · Labyrinth, Punkte verbinden, Bilderrätsel · Geheimschrift und Detektivfall · Rätselpass, Rätsel des Tages, Druckblatt.

**Abnahme:** `12`, Abschnitt 10.

---

## Abnahmekriterien MVP

- [ ] Mehrere Kinder können ein Gerät teilen. Jedes hat Profil, Stufe und Fortschritt für sich.
- [ ] Die Stufe ist pro Kind im Erwachsenen-Bereich änderbar. Alle Grenzen kommen aus `levels.ts`.
- [ ] Das Kind startet vom Startbildschirm mit höchstens 2 Tippern eine Station (bei mehreren Profilen: 3).
- [ ] Aufgaben erscheinen einzeln, groß und gut lesbar. Alles kann vorgelesen werden, auf Stufe 1 und 2 automatisch.
- [ ] Antworten werden geprüft, und es erscheinen passende, freundliche Rückmeldungen.
- [ ] Bei nicht richtigen Antworten gibt es einen spezifischen Hinweis oder einen Tipp, dann einen zweiten Tipp, dann den Lösungsweg.
- [ ] Das Kind kann beliebig oft neu antworten, ohne Fortschritt oder Sterne zu verlieren.
- [ ] Alle Antworttypen funktionieren mit Finger und Tastatur.
- [ ] Jede geschaffte Station vergibt einen Stern und ein Fundstück. Die Karte zeigt den Fortschritt.
- [ ] Insel (45 Aufgaben) und Bucht (25 Aufgaben) entsprechen `04` und `11` wörtlich.
- [ ] Wiederholte Stationen und andere Stufen bekommen neue Zahlen.
- [ ] Üben erzeugt Aufgaben für alle Themen der Stufe, inklusive Rätsel.
- [ ] Jede Station ist als Schwarz-Weiß-Arbeitsblatt mit Platz zum Rechnen druckbar. Das Lösungsblatt ist separat.
- [ ] Geld wird überall als ganze Cent gerechnet und geprüft.
- [ ] Die Oberfläche funktioniert am Handy (ab 360 px Breite), auf dem Tablet und auf dem Desktop.
- [ ] Es gibt keine Werbung, keine Anmeldung, kein Tracking und keine externen Anfragen.
- [ ] Die App ist installierbar und funktioniert offline.
- [ ] Der Fortschritt bleibt nach dem Schließen erhalten, lässt sich sichern und pro Kind zurücksetzen.

## Bewusst später

Statistiken für Erwachsene · Sound und Musik · Stufe vorschlagen (`09`, Abschnitt 8) · Sync über mehrere Geräte (z. B. Supabase) · weitere Welten (Bäckerei, Flohmarkt, Tierladen) · Stufe 5 (9 Jahre) · weitere Fächer · „Laden spielen“-Modus mit Warenkorb · eigene Aufgaben von Erwachsenen.
