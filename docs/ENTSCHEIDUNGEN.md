# Entscheidungen

Kurze Notizen zu Abweichungen und offenen Punkten der Spezifikation. Format: Datum – Entscheidung – Grund.

## Phase 0

- 2026-10-09 – Das Vite-Projekt liegt direkt im Repository-Wurzelordner statt in `schatzinsel/`. – Das Repository ist das Projekt; ein Unterordner würde nur alle Pfade (CI, Vercel, Hooks) verlängern.
- 2026-10-09 – Die Vite-Vorlage bringt inzwischen `oxlint` mit; es wurde entfernt. – `docs/08` schreibt ESLint vor, zwei Linter wären doppelt.
- 2026-10-09 – ESLint bleibt auf Version 9 (statt 10). – `eslint-plugin-jsx-a11y` (Pflicht laut `docs/08`) unterstützt ESLint 10 noch nicht. Wechsel, sobald das Plugin es kann.
- 2026-10-09 – `eslint.config.js` nutzt `defineConfig` aus `eslint/config` statt `tseslint.config`. – `tseslint.config` ist veraltet.
- 2026-10-09 – Zusätzlich zu den Grenzen aus `docs/08` (2.1) darf `domain` nicht aus `content`/`practice` importieren, `state` nicht aus `components`/`screens` und `components` nicht aus `screens`. – Setzt „Abhängigkeiten zeigen nur nach unten“ vollständig durch.
- 2026-10-09 – Prettier ignoriert `CLAUDE.md` und die Spezifikation `docs/01`–`docs/11`. – Die Texte sollen wörtlich bleiben (Regel 3); ein Formatierlauf würde Tabellen und Hervorhebungen umschreiben.
- 2026-10-09 – Andika wird nur mit der Teilmenge `latin` eingebunden (Fredoka als Variable Font komplett). – Alle deutschen Zeichen inkl. „ “ € − liegen in `latin`; spart rund 400 KB im Bundle und später im Offline-Cache.
- 2026-10-09 – knip ignoriert vorerst `vite-plugin-pwa` und `@testing-library/user-event`. – Beide sind laut Phase 0 schon installiert, werden aber erst in Phase 9 bzw. mit den Komponententests genutzt. Den Eintrag dann entfernen.
- 2026-10-09 – Playwright-Projekt `mobile` nutzt das Gerät „iPhone 13“ (390 × 844, Touch, WebKit), `desktop` Chromium mit 1280 × 800. – Erfüllt Viewports aus `docs/08` und testet die Safari-Engine mit.
- 2026-10-09 – Leere Ordner aus `docs/03` (Abschnitt 2) sind mit `.gitkeep` angelegt. – Git speichert keine leeren Ordner. Die `.gitkeep` fällt weg, sobald der Ordner echte Dateien hat.
- 2026-10-09 – `src/screens/Home.tsx` ist ein leerer Platzhalter für `/`. – Phase 3 ersetzt ihn durch die Weltkarte.
- 2026-10-09 – Die GitHub-Actions laufen auf `checkout@v6`, `setup-node@v6`, `upload-artifact@v6`. – Aktuelle Hauptversionen; Dependabot hält sie aktuell.
- 2026-10-09 – Die CI läuft nur bei Push auf `main`, nicht bei Pull Requests (Abweichung von `docs/08`, Abschnitt 6). – Wunsch des Projektinhabers. Vor dem Mergen prüfen der pre-push-Hook und `npm run check` lokal; Pflicht-Checks im Branch-Schutz sind damit nicht möglich.

## Phase 1

- 2026-10-09 – `Stufe`, `WorldId`, `StufeConfig` sowie `Profile` und `AppStateV2` stehen in `src/domain/types.ts`; `src/config/levels.ts` enthält nur die Werte `STUFEN` und `AGE_TO_STUFE`. – `domain` ist die unterste Schicht und darf nichts von oben importieren; die Typen brauchen ohnehin `Answer`, `MoneyPiece` usw. aus `domain`.
- 2026-10-09 – Die Rückmeldungssätze der Antwortprüfung stehen in `src/content/check-texts.ts`. `checkAnswer` bekommt sie als Parameter (`CheckTexts`). – Kindertexte gehören nach `src/content/` (Regel 2), und `domain` darf `content` nicht importieren.
- 2026-10-09 – Einheiten und Rechenzeichen zum Vorlesen („Euro“, „Cent“, „minus“, „plus“, „gleich“, „Fleck“) stehen in `money.ts` und `text.ts`. – Das ist Formatierung laut `docs/03` (5.1/5.2), kein Aufgabentext.
- 2026-10-09 – `pay-variants`: Eine neue, gültige Möglichkeit ergibt `correct` mit `remaining` (wie viele noch fehlen); erst bei `remaining` = 0 bzw. ohne `remaining` ist der Teil gelöst. Eine doppelte Möglichkeit ist `partial` und zählt nicht als Fehlversuch. – `docs/03` sagt nur „pro Möglichkeit“ und „fertig, wenn required erreicht“; so braucht es keinen neuen Status und keinen neuen Kindertext.
- 2026-10-09 – `CheckResult` hat bei `wrong` zusätzlich `correctCells` (Felder bei `grid`, die fest werden). Die Eingabe für `code` enthält die Symbole der Räder aus der Szene. – Beides braucht die Oberfläche bzw. der Satz „Das Rad mit dem Stern …“.
- 2026-10-09 – `planFeedback` (hints.ts) setzt die Tabelle aus `docs/01` 5.5 um. Beim 2. Fehlversuch bleibt der spezifische Hinweis nur bei `grid` und `code` sichtbar (Zählung bzw. Rad, `docs/10` 5: „zusätzlich“); die Richtung „zu viel/zu wenig“ bleibt immer sichtbar. – Sonst würde beim 2. Versuch nur Tipp 2 ohne den Hinweis aus der Prüfung erscheinen.
- 2026-10-09 – Programmierfehler in den Daten (unbekannte Option, Sache ohne Preis in `select`, Rad ohne Symbol, unvollständige Reihenfolge, falsche Eingabeart) werfen einen Fehler statt still „nicht richtig“ zu melden. – Fällt so in Tests auf und nie beim Kind.
- 2026-10-09 – knip wertet exportierte Typen, die in derselben Datei benutzt werden, als benutzt (`ignoreExportsUsedInFile` für Typen). `AppStateV2` ist bis Phase 3 mit `@public` markiert (`Station` wird seit Phase 2 genutzt). – Das Datenmodell aus `docs/03` ist vollständig angelegt, wird aber erst nach und nach verwendet. Die `@public`-Markierungen entfallen, sobald die Typen benutzt werden.
- 2026-10-09 – Rückmeldung bei `grid` nach `docs/10` (3), vom Projektinhaber bestätigt: „2 Steine stimmen schon. Schau dir den letzten noch einmal an.“ Beim Rechendreieck heißt es „Felder“ („das letzte“). Bei mehr als einem offenen Fehler: „Schau dir die anderen noch einmal an.“, bei keinem richtigen: „Schau dir die Steine/Felder noch einmal an.“ – `docs/10` gibt nur das Beispiel für die Mauer; die übrigen Fälle folgen demselben Muster.

## Phase 2

- 2026-10-09 – Choice-Optionen haben die IDs `a`, `b`, `c`, `d` in der Reihenfolge des Dokuments. Teil-IDs enden immer auf `-a`/`-b`, auch bei einteiligen Aufgaben. – Einheitlich und stabil für Druck und Fortsetzen.
- 2026-10-09 – Münzkarten ohne Namen im Dokument (8.1, 9.5) bekommen ein Label nach dem Muster „10-Cent-Münze“ bzw. „1-Euro-Münze“ wie in `docs/11`. – Jede Option braucht ein Label zum Vorlesen (`docs/03`).
- 2026-10-09 – Hinweise ohne Datenfeld werden erst in der Oberfläche umgesetzt: „gemischt anzeigen“ bei `order` (1.5, 7.4, B1.5), „? €“ auf Preisschildern ohne Preis (8.5, 9.2), Truhe im Hintergrund (Station 9), echte Münzgröße (1.5, B2.3), Kikos Satz nach dem ersten Tipper in B1.5 („Und jetzt das Häufchen mit etwas mehr!“), die Animation in B4.2. – Gehört zu Phase 4/5; das Datenmodell aus `docs/03` hat dafür keine Felder.
- 2026-10-09 – B5.5: Als Tipp 2 steht das Beispiel aus `docs/11` in den Daten („Beim Stern: 1 Punkt und 1 Punkt. Wie viele sind das?“). Der Tipp passend zum ersten falschen Rad kommt mit den Rätseln in Phase 7. – `hints` muss genau zwei Texte enthalten.
- 2026-10-09 – Ein Inhaltstest schickt für jeden Aufgabenteil eine richtige Eingabe durch `checkAnswer` und gibt die Tabelle Station · Aufgabe · Typ · Antwort aus (`npx vitest run src/content -t Tabelle`). – Abnahme Phase 2: Abgleich mit den Prüfprotokollen.

## Phase 3

- 2026-10-09 – Alle Oberflächentexte stehen in `src/content/ui.ts`. Wo die Docs keinen Wortlaut vorgeben, sind die Texte neu formuliert und sachlich: Knöpfe der Einrichtung („Kind anlegen“, „Kind speichern“, „… ist angelegt.“), die Kurzbeschreibung der Stufen (aus der Tabelle in `docs/09` 1), der Hinweis bei falscher Erwachsenen-Antwort, die Lösch-Bestätigung, Meldungen beim Laden einer Sicherung und der Platzhaltertext „Hier wird noch gebaut.“ – Die Docs nennen nur die Inhalte dieser Stellen.
- 2026-10-09 – Mit nur einem Profil ist dieses immer aktiv (`activeProfile`), „Wer spielt?“ entfällt. – `docs/09` 3.2.
- 2026-10-09 – Kikos erste Begrüßung pro Welt (`docs/01` 5.1) wird über `celebrated` mit dem Schlüssel `welcome:<welt>` nur einmal gezeigt, danach die normale Begrüßung. Beide blenden nach 4 Sekunden aus. – Kein neues Feld im Datenmodell nötig.
- 2026-10-09 – Stationskarte: Bei geschafften Stationen ist der Hauptknopf „Noch einmal spielen“ (statt „Los geht's!“ und „Noch einmal spielen“ doppelt); bei angefangenen bleibt „Weiterspielen“ der Hauptknopf. „Bonus-Rätsel“ folgt in Phase 7. – Zwei Knöpfe mit demselben Ziel wären verwirrend.
- 2026-10-09 – Der Erwachsenen-Bereich bleibt nach richtiger Antwort 10 Minuten offen, aber nur bis zum Neuladen (Zustand im Speicher, nicht gespeichert). – Einfachste sichere Lösung.
- 2026-10-09 – Die Versionsangabe unter „Hinweise“ und der Installationshinweis kommen mit Phase 9 (PWA). – Erst dann gibt es eine sinnvolle Version und Installation.
- 2026-10-09 – Die Lage der Stationen auf den Karten steht in `src/screens/WorldMap.tsx` (Prozentwerte). – Reine Darstellung, keine Inhaltsdaten.
- 2026-10-09 – Schriftgröße je Stufe (`--text-scale`) steht in `src/config/display.ts`. – Darstellung, keine Schwierigkeit; `levels.ts` bleibt wie in `docs/09` 2.1.
- 2026-10-09 – Stylelint erlaubt in `*.module.css` Klassen in camelCase (`styles.withNav`), globale CSS-Dateien bleiben kebab-case. ESLint erlaubt unbenutzte Variablen beim Weglassen von Feldern per Rest-Destrukturierung (`ignoreRestSiblings`). – Üblicher Stil für CSS Modules bzw. unveränderliche Updates.
- 2026-10-09 – Illustrationen nutzen eigene Farb-Tokens (`--kiko-*`, `--ill-*`) in `tokens.css`; im Druck werden sie auf Weiß gesetzt. – Komponenten enthalten keine Hex-Werte (`docs/02` 2), Druck nur Konturen (`docs/06`).
- 2026-10-09 – Platzhalter für alle Routen späterer Phasen (Spiel, Abschluss, Bonus, Üben, Schätze, Urkunde, Drucken). – Abnahme Phase 3: alle Routen aus `docs/03` 3 vorhanden.
- 2026-10-09 – Die Inhaltstests prüfen pro Station in einem Test statt pro Text und Aufgabenteil (389 statt 1466 Testfälle, gleiche Prüfungen). Fehlermeldungen nennen die betroffene Aufgabe. – Übersichtlicher, Wunsch des Projektinhabers.
- 2026-10-09 – Dependabot schlägt für npm nur noch Minor- und Patch-Updates vor; Hauptversionen werden bewusst von Hand gehoben. Die ersten Major-PRs (ESLint 10, @eslint/js 10, TypeScript 7, jsdom 30, @types/node 26) wurden geschlossen. – ESLint 10 passt noch nicht zu `eslint-plugin-jsx-a11y`, @types/node 26 nicht zu Node 24; da die CI nur auf `main` läuft, würden kaputte Updates erst dort auffallen.

## Phase 4

- 2026-10-09 – „Es müssen genau {n} Münzen sein.“ (`docs/03` 6) lautet bei n = 1 „Es muss genau eine Münze sein.“ – Sonst entstünde bei B3.2 der falsche Satz „Es müssen genau 1 Münzen sein.“
- 2026-10-09 – Bis zu den Generatoren (Phase 6) werden auf allen Stufen die Originalaufgaben gespielt (`playableTasks`); der Varianten-Seed ist so lange 0. – Sonst wären die Stationen auf Stufe 2 und 4 leer.
- 2026-10-09 – Das Kiko-Sheet ist kein modaler Dialog, sondern ein Bereich mit `aria-live`, der den Aufgabenbereich sichtbar lässt; ab 900 px rechts unten. Der Tipp-Knopf zeigt seinen Tipp im selben Sheet mit dem Knopf „Nochmal versuchen“. – `docs/01` 5.5.
- 2026-10-09 – Fortsetzen: Die Stelle wird nach jedem gelösten Teil gespeichert, die Statistik (`stats`) pro Teil mit Fehlversuchen und geöffneten Tipps. Nach der letzten Aufgabe wird die Station abgeschlossen und es geht zu `/station/:id/geschafft` (Abschluss-Bildschirm in Phase 5). – `docs/03` 8.
- 2026-10-09 – Antworttypen `grid` und `code` sowie die Szenen `sequence`, `balance` und `clues` sind bis Phase 7 nur einfach dargestellt (Zahlen- und Symbolkarten). – Laut `docs/07` gehören sie zu Phase 7; Bucht-Station 4 und 5 werden dann vollständig.
- 2026-10-09 – Neue Oberflächentexte ohne Wortlaut in den Docs: „Bezahlt mit“, „Geld“ (Szenen-Beschriftungen), „Zählen: n“ (Vorlesename der Zählhilfe), „Aufgabe n von m“ (Fortschritt für Screenreader). – Sachliche, kurze Beschriftungen.
- 2026-10-09 – Der Zahlenstrahl steht unter 700 px in zwei Reihen (0–5, 6–10). Bei 360 px Breite sind die Felder etwa 50 px breit statt 56 px. – Sechs Felder à 56 px plus Abstände passen nicht in 328 px; die Höhe bleibt 56 px.

## Phase 5

- 2026-10-09 – Im Fundstück-Detail steht „Fundort: {Station}“ statt „Gefunden am {Station}“ (`docs/01` 5.8). – Viele Stationsnamen haben einen Artikel („Die Rätselbrücke“, „Das Muschelufer“); „Gefunden am Die Rätselbrücke“ wäre falsch.
- 2026-10-09 – Das Angebot „Bonus-Rätsel“ auf dem Abschluss-Bildschirm und in der Stationskarte kommt mit Phase 7; die Glitzersteine in den Schätzen zählen schon `bonusSolved`. – Die Bonus-Rätsel selbst gehören zu Phase 7.
- 2026-10-09 – Die Urkunden-Vorschau (`/schaetze/urkunde`) zeigt bis Phase 8 nur den Hinweis „Frag einen Erwachsenen, ob ihr sie ausdruckt.“ – Die Urkunde wird in Phase 8 (Druck) gestaltet.
- 2026-10-09 – Der Nebel zieht einmalig über jeder neu freigeschalteten Station ab (`celebrated` mit „fog:<id>“), auch wenn Erwachsene alle Stationen freischalten. – Einfachste Regel ohne Sonderfälle.
- 2026-10-09 – Neue Texte ohne Wortlaut in den Docs: Überschriften „Sterne“, „Fundstücke“, „Perlenkette“, „Glitzersteine“, „1 Perle / n Perlen“, „Noch nicht gefunden“ (Screenreader-Name nicht gefundener Fundstücke), „Ein neuer Stern“. – Die Docs nennen die Inhalte, aber keine Beschriftungen.
- 2026-10-09 – Ein Test spielt jede Station über die Oberfläche mit richtigen Antworten durch (alle 9 Insel-Stationen, Bucht 1–4; Bucht 5 braucht das Zahlenschloss aus Phase 7). – Abnahme Phase 5.

## Phase 6

- 2026-10-10 – Die Satzvorlagen der Generatoren stehen in `src/practice/generators/` neben der Logik, nicht in `src/content/`. – Vorlage und Rechnung gehören zusammen; Regel 2 („Komponenten enthalten keine Aufgabentexte“) bleibt erfüllt, denn `practice` ist keine Oberfläche. Die Wörter selbst (Sachen, Dinge, Namen, Zahlungsmittel) stehen in `src/content/`.
- 2026-10-10 – Wo `docs/05` für eine Vorlage keinen Tipp- oder Lösungsweg-Text vorgibt, sind kurze Sätze im Stil der Originale aus `docs/04`/`docs/11` formuliert. – Jede Aufgabe braucht zwei Tipps und einen Lösungsweg.
- 2026-10-10 – Der Sachen-Katalog enthält zusätzlich alle Sachen aus `docs/04`, die in der Tabelle in `docs/05` 3.1 fehlen (z. B. Augenklappe, Ball, Tee), ohne Preisbereich. – `docs/05` verlangt, dass alle `itemId`s aus `docs/04` im Katalog stehen; ohne Preisbereich werden sie nie erzeugt.
- 2026-10-10 – Das Grammatikmuster aus `docs/05` 7 prüft nur ganze Wörter ohne Bindestrich danach („ein Muschel-Armband“ ist richtig). – Sonst schlägt die Prüfung bei einem korrekten Satz an.
- 2026-10-10 – Münzen legen (L1–L3): Gibt es mehr als 600 Möglichkeiten, einen Betrag zu legen, fallen die kleinsten Münzen aus der Palette weg (sonst wird neu gewürfelt). Auf Stufe 4 sind die Beträge dadurch meist runder. – Die Prüfung zählt alle Möglichkeiten auf; bei 47,85 € mit allen Münzen wären es zu viele.
- 2026-10-10 – Regeln „Stufe 1–2“ bzw. „Stufe 4“ aus `docs/05` werden über die Stufenkonfiguration ausgedrückt (Summenanzeige bei `centOnly` oder ohne Cent; drei Möglichkeiten bzw. zweiteilig bei `maxSteps > 2`). – Keine Stufennummern im Code (Regel 8).
- 2026-10-10 – Übungsrunden werden nicht fortgesetzt; nach dem Neuladen beginnt eine neue Runde. – `resume` gilt laut `docs/09` nur für Stationen.
- 2026-10-10 – Zwei Themen-Labels für Stufe 1–2 („nur Icon und ein Wort“, `docs/09` 6): „Zählen“, „Münzen“, „Preise“, „Rückgeld“, „Legen“, „Reicht es?“, „Geschichten“, „Knobeln“, „Rätsel“. – Die Docs nennen nur die langen Namen.
- 2026-10-10 – Das Thema „Rätsel“ erscheint im Üben erst mit Phase 7 (Rätsel-Generatoren). – Ohne Vorlagen gäbe es keine Runde.
- 2026-10-10 – Die Varianten 2.5 (Banane) und 4.5 (Keks, Apfel) entfallen auf Stufe 4, weil diese Sachen laut Katalog (`docs/05` 3.1) dort keinen Preisbereich haben. – Katalog und Variantentabelle (`docs/09` 5.2) widersprechen sich; jede Station behält trotzdem mindestens 3 Aufgaben (Test).
- 2026-10-10 – Preise addieren: „Übertrag“ heißt auf Stufe 2 (ganze Euro) Zehnerübergang. Lässt sich ein erzwungener Übertrag mit den gebundenen Sachen nicht bilden (2.4 auf Stufe 2), entsteht die Aufgabe ohne Übertrag. Mengen stehen als Ziffern („3 Kekse“). – `docs/05` 4.2.
- 2026-10-10 – Prüfung von Münzaufgaben: Möglichkeiten werden gezählt bzw. gezielt gesucht (`countWays`, `findCombination`) statt alle aufzuzählen. – Die Generatortests (alle Vorlagen × Stufen × 300 Seeds) laufen so in etwa 12 Sekunden statt rund 10 Minuten und ohne Speicherprobleme.
- 2026-10-10 – Das JS-Bundle ist mit den Generatoren etwa 550 kB groß (161 kB gzip), Vite warnt ab 500 kB. Aufteilen (lazy geladene Spiel- und Übungsseiten) erst in Phase 10. – Suspense viele Oberflächentests asynchron machen würde; offline wird ohnehin alles vorab geladen.
- 2026-10-10 – Der große Generator-Test (Vorlage × Stufe × 300 Seeds) hat ein eigenes Zeitlimit von 60 s. – Stufe 4 mit großen Beträgen unter Coverage-Instrumentierung länger als 5 s braucht. In der App dauert eine Aufgabe etwa 1 ms.
- 2026-10-10 – Zahlenschloss: „Öffnen“ wird erst aktiv, wenn ein Rad gedreht wurde. – Alle Räder stehen anfangs auf 0, und ein Code beginnt nie mit 0 (`docs/10` 5).
- 2026-10-10 – Waage und Muster ohne eigene Antwort-Animation: Die Wippe zeigt das Gewicht der bekannten Teile; ob eine Antwort stimmt, sagt Kikos Rückmeldung. – Einfachste Lösung; die Rückmeldung ist ohnehin da (`docs/01` 5.5).
- 2026-10-10 – Die Ordnungshilfe (Treppe) erscheint ab Tipp 2 bei jeder Aufgabe mit Kindern ohne Beträge in der Szene, also bei Logik-Rätseln. – Keine eigene Kennung im Datenmodell nötig.
- 2026-10-10 – Bonus-Rätsel: Rätselart reihum nach Stationsnummer aus `STUFEN[stufe].riddles.types`, nach der letzten Insel-Station immer das Zahlenschloss; Seed aus Profil und Station. „Später“ blendet das Angebot nur aus, das Rätsel bleibt über die Stationskarte erreichbar. – `docs/10` 6.
- 2026-10-10 – Die optionalen Filter-Chips im Thema „Rätsel“ entfallen vorerst. – `docs/10` 6 nennt sie optional; Runden mischen alle Rätselarten der Stufe.
- 2026-10-10 – Die Rätsel-Startwerte je Stufe (Mauerbreite, Spitze, Regeln der Reihen, Räder usw.) stehen in `levels.ts` unter `riddles.params` und werden zusätzlich auf die allgemeinen Grenzen der Stufe begrenzt. – Regel 8; `docs/10` 4 nennt sie als Startwerte.
- 2026-10-10 – Selbst gewählte Grenzen, wo `docs/10` nichts vorgibt: Dreieck Stufe 4 bis 100 bzw. 10 €; Geldraster 10 Cent (Mauer Stufe 3, Dreieck), 5 Cent (Mauer Stufe 4); Logik-Beträge in 50-Cent-Schritten (Stufe 2 ganze Euro). Muster „+10 bis 20“ auf Stufe 2 entfällt, weil es mit 3 Feldern vor der Lücke über 20 hinausginge. Mauer und Dreieck ab Stufe 3 mischen Zahlen und Geld nach `moneyShare`.
- 2026-10-10 – Waage: Die volle Seite ist nie genau „leichte Seite + fehlendes Stück“; auf Stufe 4 fehlen nur Münzen, keine Scheine. Bildmuster nutzen die Schloss-Symbole Muschel, Stern, Fisch, Krebs.
- 2026-10-10 – Logik „in der Mitte“ heißt im Spiel „Wer hat nicht am meisten und nicht am wenigsten Geld?“; Teilen beim Schloss steht als Wort („42 geteilt durch 6“), damit es vorgelesen wird. Tipp 2 beim Schloss bezieht sich auf das erste Rad (wie B5.5).
- 2026-10-10 – Arbeitsblätter: Szene und Rechenkästchen (4 Zeilen, 5-mm-Gitter) stehen rechts neben Geschichte und Frage statt in voller Breite darunter; es gibt sie einmal pro Aufgabe und nur, wo gerechnet wird (nicht beim Münzenmalen, Ordnen und bei Rätselfeldern). Breite Antworten (Karten, Münzen) stehen darunter in voller Breite. – Nur so passt jede Station auf 1–2 A4-Seiten (Abnahme `docs/06` 8, E2E-Test).
- 2026-10-10 – Münzen in echter Größe (2 € = 26 mm) dort, wo das Kind Münzen abmalt; in Auswahl- und Ordnungskarten im selben Verhältnis auf 60 % verkleinert. – Drei Geldbörsen mit je vier Münzen in echter Größe passen sonst nicht nebeneinander.
- 2026-10-10 – Seitenfuß der Insel-Blätter ohne Seitennummer („Die geheime Schatzinsel · Station 2“), weil der Browser eine Station selbst umbricht; Bucht-Blätter werden fest aufgeteilt (2 Aufgaben auf der ersten Seite, dann je 3) und tragen „Seite n“.
- 2026-10-10 – Druckseite: je ein eigener Seed für Stationen (`seed`, 0 = Originale), Übungsblatt (`useed`) und Rätselblatt (`rseed`), damit „Neue Aufgaben würfeln“ die Stationsblätter nicht verändert. Das Übungsblatt bietet die Themen der Stufe außer „Rätsel“ (dafür gibt es das Rätselblatt).
- 2026-10-10 – Bild-Symbole der Bucht-Blätter: Stift („Kreise ein“), Hand mit Zahl („Schreibe die Zahl“), Münzen („Male die Münzen“) als neue Kontur-Icons in `UiIcon`. Die Urkunde der Bucht zeigt die Perle statt der Truhe.
- 2026-10-10 – PWA: `injectRegister: false`, der Service Worker wird in `src/state/pwa.ts` registriert, damit die Druckseite „Neue Version verfügbar – neu laden“ anbieten kann (`registerType: 'prompt'`, ohne Dialog im Kindermodus). Die App-Icons entstehen per Skript (`npm run icons`) aus `public/app-icon.svg`; maskable mit 80 % sicherer Zone.
- 2026-10-10 – Lighthouse 12 hat keine PWA-Kategorie mehr; die Installierbarkeit sichert ein E2E-Test (Manifest mit `standalone`, maskable Icon, Apple-Touch-Icon) zusammen mit dem Offline-Test (Chromium). Lighthouse mobil lokal: Accessibility 100, Best Practices 100, Performance 96.
- 2026-10-10 – Das Bundle bleibt ungeteilt (Vite warnt ab 500 kB): Lighthouse mobil erreicht Performance 96, und der Service Worker lädt ohnehin alles vorab. Lazy Loading hätte viele Oberflächentests asynchron gemacht, ohne dass es spürbar hilft.
- 2026-10-10 – E2E-Liste aus `docs/03` 10: Punkt 3 (Üben → Rückgeld, etwas leichter, 5 Aufgaben → Perle) ist ein Integrationstest der ganzen App mit festem Seed (`Practice.test.tsx`); im Browser wären die gewürfelten Aufgaben ohne Seed nicht beantwortbar. Alle anderen Punkte und „zwei Profile, getrennte Fortschritte“ laufen in Playwright.
- 2026-10-10 – Antwortkarten mit ganzen Sätzen (länger als 16 Zeichen) nutzen die kleinere Textschrift; die Spalten sind auf `minmax(0, 1fr)` begrenzt und trennen lange Wörter. – Sonst lief eine Aufgabe auf Stufe 4 bei 360 px über den Rand (geprüft: alle Stationsaufgaben und Varianten auf Stufe 1–4).
