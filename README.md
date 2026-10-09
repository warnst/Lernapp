# Mathe-Abenteuer – Die geheime Schatzinsel

Lern-App (PWA) für Kinder von 5 bis 8 Jahren: Rechnen mit Geld, Sachaufgaben und Rätsel als Abenteuer mit dem Papagei Kiko. Ohne Backend, ohne Konto, ohne Tracking.

Einstieg für die Umsetzung mit Claude Code: [`CLAUDE.md`](CLAUDE.md), Spezifikation in [`docs/`](docs/), Umsetzungsplan in [`docs/07-umsetzungsplan.md`](docs/07-umsetzungsplan.md).

## Start

Voraussetzung: Node.js laut [`.nvmrc`](.nvmrc).

```bash
npm install        # installiert auch die Git-Hooks (lefthook)
npm run dev        # Entwicklungsserver
```

## Skripte

| Befehl                      | Zweck                                                        |
| --------------------------- | ------------------------------------------------------------ |
| `npm run dev`               | Entwicklungsserver                                           |
| `npm run build`             | Typecheck und Produktions-Build nach `dist/`                 |
| `npm run preview`           | Build lokal ansehen                                          |
| `npm run test`              | Unit- und Inhaltstests (Vitest)                              |
| `npm run coverage`          | Tests mit Abdeckungsschwellen                                |
| `npm run e2e`               | Playwright (mobil + desktop), braucht vorher `npm run build` |
| `npm run lint` / `lint:css` | ESLint / Stylelint                                           |
| `npm run format`            | Prettier                                                     |
| `npm run knip`              | ungenutzte Dateien, Exporte und Abhängigkeiten               |
| `npm run check`             | alles wie in der CI außer E2E – vor jedem Pull Request       |

## Deployment

Statisch auf Vercel (Preset „Vite“, Build `npm run build`, Output `dist`). Jeder Push auf `main` geht in die Produktion, jeder Pull Request bekommt eine Vorschau-URL. Details in [`docs/03-technik-und-datenmodell.md`](docs/03-technik-und-datenmodell.md), Abschnitt 12, und [`docs/08-qualitaet-und-workflow.md`](docs/08-qualitaet-und-workflow.md).
