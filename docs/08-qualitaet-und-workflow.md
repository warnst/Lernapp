# 08 – Codequalität, Git-Hooks und GitHub-Workflow

## 1. Grundidee: drei Ebenen

Qualität wird **automatisch erzwungen**, nicht durch Disziplin. Jede Ebene fängt Fehler so früh und so billig wie möglich ab.

| Ebene | Wann | Was | Dauer | Umgehbar? |
|---|---|---|---|---|
| **Editor** | beim Speichern | Prettier formatiert, ESLint markiert | sofort | – |
| **Git-Hooks** (lokal) | bei Commit und Push | nur betroffene Dateien prüfen, dann Typen und Tests | Commit < 5 s, Push < 60 s | ja (`--no-verify`) |
| **CI** (GitHub Actions) | bei jedem Pull Request und Push auf `main` | alles: Lint, Typen, Tests, Abdeckung, Build, E2E | ca. 3–6 min | **nein**, Pflicht zum Mergen |

Hooks sind Frühwarnung und Komfort. **Das eigentliche Tor ist die CI**, weil sich Hooks lokal überspringen lassen. Deshalb gilt beides.

## 2. Werkzeuge

| Zweck | Werkzeug | Einstellung |
|---|---|---|
| Typen | TypeScript | `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` |
| Linting | ESLint (Flat Config) | `typescript-eslint` `strictTypeChecked` + `stylisticTypeChecked`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, **`eslint-plugin-jsx-a11y`** (Barrierefreiheit) |
| Formatierung | Prettier | `singleQuote: true`, `printWidth: 100`, `trailingComma: 'all'` |
| CSS | Stylelint | `stylelint-config-standard`, `stylelint-config-css-modules` |
| Tote Teile | **knip** | findet ungenutzte Dateien, Exporte und Abhängigkeiten |
| Tests | Vitest + `@vitest/coverage-v8` | Schwellen: `src/domain/**` 100 % Zeilen und Zweige; gesamt ≥ 80 % Zeilen |
| E2E | Playwright | Projekte `mobile` (390 × 844, Touch) und `desktop` (1280 × 800) |
| Commits | commitlint | `@commitlint/config-conventional` |
| Hooks | **Lefthook** | eine YAML-Datei, läuft parallel, schnell |

> **Lefthook statt Husky:** Beide sind etabliert. Lefthook braucht nur eine Konfigurationsdatei, führt Befehle parallel aus und kann geänderte Dateien direkt wieder stagen. Husky + lint-staged funktioniert genauso gut, wenn das bevorzugt wird.

### 2.1 Projektspezifische ESLint-Regeln (wichtig)

Diese Regeln setzen die goldenen Regeln aus `CLAUDE.md` technisch durch:

```js
// eslint.config.js (Auszug)
{
  rules: {
    // Geld nur in ganzen Cent: keine Gleitkomma-Helfer
    'no-restricted-properties': ['error',
      { object: 'Number', property: 'parseFloat', message: 'Geld nur als ganze Cent (parseMoney nutzen).' },
      { property: 'toFixed', message: 'Geld nur als ganze Cent (formatMoney nutzen).' },
    ],
    'no-restricted-globals': ['error', { name: 'parseFloat', message: 'Geld nur als ganze Cent.' }],
    // Keine externen Requests aus der App
    'no-restricted-syntax': ['error',
      // erlaubt nur den SVG-Namespace (xmlns="http://www.w3.org/2000/svg")
      { selector: "Literal[value=/^https?:\\/\\/(?!www\\.w3\\.org\\/)/]", message: 'Keine externen URLs im Code.' },
    ],
  },
},
// Architekturgrenzen
{
  files: ['src/domain/**'],
  rules: { 'no-restricted-imports': ['error', { patterns: ['react', 'react-dom', '@/components/*', '@/screens/*', '@/state/*'] }] },
},
{
  files: ['src/content/**', 'src/practice/**'],
  rules: { 'no-restricted-imports': ['error', { patterns: ['react', '@/components/*', '@/screens/*', '@/state/*'] }] },
},
```

**Schichten (Abhängigkeiten zeigen nur nach unten):**

```
screens  →  components  →  state  →  practice / content  →  domain
```

`domain` kennt kein React. `content` und `practice` sind reine Daten und Funktionen.

## 3. Git-Hooks

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    format:
      glob: '*.{ts,tsx,js,json,css,md,yml}'
      run: npx prettier --write {staged_files}
      stage_fixed: true
    lint:
      glob: '*.{ts,tsx}'
      run: npx eslint --fix --max-warnings=0 {staged_files}
      stage_fixed: true
    css:
      glob: '*.css'
      run: npx stylelint --fix {staged_files}
      stage_fixed: true

commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}

pre-push:
  parallel: true
  commands:
    typecheck:
      run: npm run typecheck
    test:
      run: npm run test
    knip:
      run: npm run knip

post-merge:
  commands:
    deps:
      glob: 'package-lock.json'
      run: npm ci
```

- **pre-commit:** Nur die gestagten Dateien werden formatiert und gelintet. Das ist schnell, deshalb wird es nicht übersprungen.
- **commit-msg:** Erzwingt Conventional Commits.
- **pre-push:** Typen und Unit-Tests über das ganze Projekt. E2E läuft nur in der CI, weil es zu langsam für jeden Push ist.
- **post-commit nutzen wir nicht.** Ein post-commit-Hook läuft erst nach dem Commit und kann nichts mehr verhindern. Für Qualität bringt er nichts. Sinnvoll ist nur **post-merge**: Er installiert Abhängigkeiten neu, wenn sich `package-lock.json` geändert hat.
- Installation: `lefthook` als devDependency, dazu `"prepare": "lefthook install"` in `package.json`.

## 4. Commit-Konvention

Format: `typ(bereich): beschreibung`. Der Typ steht auf Englisch, die Beschreibung auf Deutsch, im Imperativ und klein geschrieben.

| Typ | Wofür | Beispiel |
|---|---|---|
| `feat` | neue Funktion | `feat(spiel): münz-tablett mit summenanzeige` |
| `fix` | Fehlerbehebung | `fix(geld): 1,05 € wird nicht mehr als 1,5 € gelesen` |
| `content` | Aufgaben und Texte | `content(station-3): rückgeld-aufgaben ergänzt` |
| `test` | nur Tests | `test(check): fälle für pay-variants` |
| `refactor` | Umbau ohne Verhaltensänderung | `refactor(insel): karte in eigene komponente` |
| `style` | Formatierung | `style: prettier auf alle dateien` |
| `docs` | Dokumentation | `docs: entscheidung zu lefthook notiert` |
| `chore` / `ci` / `build` | Werkzeuge, Pipeline, Abhängigkeiten | `ci: playwright-bericht als artefakt` |

`content` wird in `commitlint.config.js` als zusätzlicher Typ erlaubt.

## 5. npm-Skripte

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b",
    "lint": "eslint . --max-warnings=0",
    "lint:css": "stylelint \"src/**/*.css\"",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "e2e": "playwright test",
    "knip": "knip",
    "check": "npm run format:check && npm run lint && npm run lint:css && npm run typecheck && npm run coverage && npm run knip && npm run build",
    "prepare": "lefthook install"
  }
}
```

`npm run check` macht lokal dasselbe wie die CI (ohne E2E). Vor jedem Pull Request ausführen.

## 6. CI mit GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npm run format:check
      - run: npm run lint
      - run: npm run lint:css
      - run: npm run typecheck
      - run: npm run coverage
      - run: npm run knip
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium webkit
      - run: npm run build
      - run: npm run e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report, retention-days: 7 }
```

- Die Action-Versionen beim Einrichten auf die jeweils aktuelle Hauptversion prüfen.
- `webkit` wird mitgetestet, weil das Kind vermutlich auch auf einem iPhone oder iPad spielt (Safari-Engine).
- **Optional später:** Lighthouse CI gegen die Vercel-Vorschau mit Budgets (Accessibility ≥ 95, Best Practices ≥ 95, Performance ≥ 90).

## 7. GitHub-Einstellungen

**Branch-Schutz für `main`** (Settings → Rules → Rulesets):
- Änderungen nur per Pull Request.
- Pflicht-Checks: `quality` und `e2e`.
- Nur Squash-Merge. Der PR-Titel wird zur Commit-Nachricht und muss deshalb auch der Konvention folgen.
- Kein Force-Push, kein Löschen.

**Arbeitsablauf (auch für Claude Code):**
1. Pro Phase aus `07` einen Branch: `feat/phase-4-spiel`.
2. Kleine, thematische Commits.
3. `npm run check` lokal, dann Pull Request mit Vorlage (siehe unten).
4. **Vercel erstellt automatisch eine Vorschau-URL pro Pull Request.** Diese Vorschau auf dem Handy öffnen und mit dem Kind ausprobieren, bevor gemergt wird.
5. Wenn die CI grün ist: Squash-Merge, dann deployt Vercel `main` in die Produktion.

**Dependabot** (`.github/dependabot.yml`): npm wöchentlich, Minor- und Patch-Updates gruppiert in einem PR. GitHub Actions monatlich. Updates laufen durch dieselbe CI.

**Pull-Request-Vorlage** (`.github/pull_request_template.md`):

```markdown
## Was ändert sich?

## Phase / Bezug
<!-- z. B. Phase 4 aus docs/07 -->

## Geprüft
- [ ] `npm run check` lokal grün
- [ ] Am Handy (390 px) angesehen – Screenshot unten
- [ ] Kindertexte stammen wörtlich aus docs/04 bzw. docs/11, Satzvorlagen aus docs/05 bzw. docs/10
- [ ] Keine Alters- oder Zahlengrenzen außerhalb von `levels.ts` bzw. der `Record<Stufe, …>`-Datendateien
- [ ] Keine roten Fehlerzustände, keine Zeitlimits
- [ ] Druckansicht geprüft (falls betroffen)
- [ ] Abweichungen von der Spezifikation in docs/ENTSCHEIDUNGEN.md notiert

## Screenshots
```

## 8. Weitere Projektdateien

| Datei | Inhalt |
|---|---|
| `.nvmrc` | aktuelle Node-LTS-Hauptversion (z. B. `24`) |
| `package.json` → `engines` | `"node": ">=24"` passend zu `.nvmrc` |
| `.editorconfig` | UTF-8, LF, 2 Leerzeichen, abschließende Leerzeile |
| `.gitattributes` | `* text=auto eol=lf` |
| `.gitignore` | `node_modules`, `dist`, `coverage`, `playwright-report`, `test-results`, `.vercel`, `.env*` |
| `.vscode/settings.json` + `extensions.json` | Format on Save, ESLint- und Prettier-Erweiterung empfohlen |
| `docs/ENTSCHEIDUNGEN.md` | kurze Notizen: Datum, Entscheidung, Grund (eine Zeile reicht) |
| `README.md` | Zweck, Start, Skripte, Deployment, Link auf `docs/` |

## 9. Code-Konventionen

- **Benennung:** Bezeichner auf Englisch (`checkAnswer`, `CoinTray`). Kindertexte auf Deutsch, nur in `src/content/`. Kommentare dürfen deutsch sein.
- **Dateien:** Komponenten in `PascalCase.tsx` mit `PascalCase.module.css` daneben. Eine Komponente pro Datei. Nur benannte Exporte (keine `export default`, außer wo ein Werkzeug es verlangt).
- **Typen:** kein `any`, kein `as` ohne Kommentar mit Begründung. Für Antworttypen diskriminierte Unions und `switch` mit `assertNever` im `default`-Zweig, damit ein neuer Typ überall einen Compilerfehler auslöst.
- **Reine Funktionen** in `domain/` und `practice/`: keine Seiteneffekte, kein `Date.now()`, kein `Math.random()` (Zufall nur über `random.ts` mit Seed).
- **Komponenten** klein halten (Richtwert < 150 Zeilen). Logik in Hooks oder `domain/` auslagern.
- **Barrierefreiheit:** echte `<button>`-Elemente, keine klickbaren `<div>`s. `jsx-a11y` muss fehlerfrei sein.
- **Imports** über den Alias `@/` (`@/domain/money`), eingerichtet in `tsconfig.json` und `vite.config.ts`.
- **Kein toter Code**, keine auskommentierten Blöcke. knip hält das sauber.
