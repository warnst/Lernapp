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
