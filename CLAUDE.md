# Mathe-Abenteuer – Die geheime Schatzinsel

Eine Lern-App (PWA) für Kinder von 5 bis 8 Jahren: Rechnen mit Geld, Sachaufgaben und Rätsel als Abenteuer. Begleiter ist der Papagei Kiko. Mehrere Kinder teilen ein Gerät, jedes mit eigenem Profil und eigener Stufe (1–4). Stufe 1 spielt in der „kleinen Bucht“ (5 Stationen), Stufe 2–4 auf der „Schatzinsel“ (9 Stationen) mit passenden Zahlen. Die App läuft ohne Backend, ohne Konto und ohne Tracking, nur im Browser. Gehostet wird sie statisch auf Vercel.

Dieses Repository wird mit Claude Code gebaut. Die Spezifikation liegt in `docs/`. **Lies vor dem Programmieren alle Dokumente in dieser Reihenfolge:**

| Datei | Inhalt |
|---|---|
| `docs/01-produkt-und-ux.md` | Ziel, Prinzipien, Bildschirme, Navigation, Aufgabenfluss, Rückmeldungen |
| `docs/02-designsystem.md` | Farben, Schrift, Komponenten, Illustrationen, Animationen, Barrierefreiheit |
| `docs/03-technik-und-datenmodell.md` | Stack, Ordnerstruktur, TypeScript-Typen, Geldlogik, Prüflogik, Speicherung, PWA |
| `docs/04-inhalte-stationen.md` | Alle 9 Stationen mit allen Aufgaben, Tipps, Rückmeldungen und Lösungswegen |
| `docs/05-ueben-generatoren.md` | Freies Üben: Themen, Stufen, Aufgabengeneratoren, Satzvorlagen |
| `docs/06-druck.md` | Arbeitsblätter, Lösungsblatt, Urkunde, Druck-CSS |
| `docs/07-umsetzungsplan.md` | Phasen, Abnahmekriterien, Testliste |
| `docs/08-qualitaet-und-workflow.md` | Linting, Git-Hooks, Commits, CI, GitHub-Workflow, Code-Konventionen |
| `docs/09-stufen-profile-varianten.md` | Stufen 1–4 (`levels.ts`), Profile, Erwachsenen-Bereich, neue Zahlen für Stationsaufgaben |
| `docs/10-raetsel.md` | Muster, Waage, Zahlenmauer, Rechendreieck, Zahlenschloss, Logik |
| `docs/11-welt-kleine-bucht.md` | Welt für Stufe 1 (etwa 5 Jahre) mit allen 25 Aufgaben |
| `docs/12-raetselturm.md` | Rätselturm: Sudoku, Kinderrätsel, Wissensfragen, Detektivfall, Kikos Kleiderschrank, Witzekiste |
| `docs/13-ueben-ohne-geld.md` | Üben ohne Geld: Uhr, Kalender, Formen, Zahlenstrahl, Plus und Minus, Verdoppeln |

**Wichtig:** `09`–`13` erweitern und präzisieren `01`–`06`. Bei Widersprüchen gilt das Dokument mit der höheren Nummer.

## Goldene Regeln

1. **Geld ist immer eine ganze Zahl in Cent.** `1,50 €` wird als `150` gespeichert. Gleitkommazahlen sind für Geld verboten. Antworten werden über Cent-Werte geprüft, nie über formatierte Texte.
2. **Inhalte sind Daten, keine UI.** Alle Kindertexte stehen in `src/content/`. Komponenten enthalten keine Aufgabentexte.
3. **Texte aus `docs/04` und `docs/11` wörtlich übernehmen.** Die Sätze sind für 5- bzw. 7-Jährige formuliert und die Rechnungen sind geprüft. Wenn dir ein Satz falsch vorkommt, frag nach, statt ihn still umzuschreiben.
4. **Keine Strafen.** Kein Rot für Fehler, keine Minuspunkte, kein Zeitlimit, kein Sternverlust, keine Streaks.
5. **Keine externen Anfragen zur Laufzeit.** Schriften liegen lokal im Bundle (`@fontsource`), es gibt kein Analytics, keine CDNs, keine externen Links im Kindermodus.
6. **Mobile first.** Das Hauptgerät ist ein Smartphone im Hochformat. Touch-Ziele sind mindestens 56 × 56 px groß, wichtige Knöpfe sitzen im Daumenbereich unten.
7. **Barrierearm.** Information nie nur über Farbe, `prefers-reduced-motion` beachten, sichtbarer Fokus, `lang="de"`.
8. **Schwierigkeit ist Konfiguration.** Zahlenräume, Münzen, Antworttypen und Textlängen stehen nur in `src/config/levels.ts`. Nirgends sonst werden Alters- oder Zahlengrenzen fest eingetragen.
9. **Einfach bleiben.** Keine Bibliothek, wenn 30 Zeilen eigener Code reichen. Kein Backend, kein State-Framework.
10. **Qualitäts-Tore nie umgehen.** Kein `git commit --no-verify`, kein `eslint-disable` ohne Begründung im Kommentar, keine gesenkten Abdeckungsschwellen. Wenn ein Hook fehlschlägt, wird der Fehler behoben.

## Befehle

```bash
npm install        # installiert auch die Git-Hooks (lefthook)
npm run dev        # Entwicklungsserver
npm run test       # Vitest (Unit- und Inhaltstests)
npm run e2e        # Playwright (mobil + desktop)
npm run check      # alles wie in der CI, außer E2E – vor jedem PR
npm run build      # Typecheck + Produktions-Build nach dist/
npm run preview    # Build lokal ansehen (inkl. Service Worker)
```

## Arbeitsweise

- Nie direkt auf `main` committen. Pro Phase ein Branch (`feat/phase-4-spiel`), Conventional Commits, Pull Request mit Vorlage. Details in `docs/08`.
- Arbeite die Phasen aus `docs/07-umsetzungsplan.md` der Reihe nach ab. Prüfe am Ende jeder Phase deren Abnahmekriterien, dann `npm run check`, dann Pull Request.
- Schreib für Geldlogik, Prüflogik und Generatoren zuerst Tests.
- Prüfe jede Oberfläche im mobilen Viewport (390 × 844) und auf dem Desktop.
- Wenn die Spezifikation etwas offen lässt, nimm die einfachste Lösung, die zu den Prinzipien in `docs/01` passt, und notiere die Entscheidung in `docs/ENTSCHEIDUNGEN.md`.

## Definition of Done (gesamt)

- Alle Abnahmekriterien aus `docs/07` sind erfüllt.
- `npm run check` und `npm run e2e` laufen ohne Fehler, die CI auf GitHub ist grün.
- Die App lässt sich auf dem Handy installieren und funktioniert offline.
- Lighthouse (mobil): Accessibility ≥ 95, Best Practices ≥ 95, PWA installierbar.
