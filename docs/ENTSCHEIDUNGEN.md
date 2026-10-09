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
