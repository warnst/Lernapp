import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist', 'dev-dist', 'coverage', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // JS-Konfigurationsdateien gehören zu keinem tsconfig, also ohne Typprüfung
  { files: ['**/*.js'], extends: [tseslint.configs.disableTypeChecked] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.strict,
    ],
  },
  {
    files: ['*.{js,ts}', 'api/**/*.ts', 'tests/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  // Projektregeln: setzen die goldenen Regeln aus CLAUDE.md technisch durch (docs/08, 2.1)
  {
    rules: {
      // Felder per Rest-Destrukturierung weglassen ({ resume, ...rest }) ist erlaubt
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      // widerspricht no-non-null-assertion (strict): „!“ ist verboten, begründete „as“ sind erlaubt
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      // Geld nur in ganzen Cent: keine Gleitkomma-Helfer
      'no-restricted-properties': [
        'error',
        {
          object: 'Number',
          property: 'parseFloat',
          message: 'Geld nur als ganze Cent (parseMoney nutzen).',
        },
        { property: 'toFixed', message: 'Geld nur als ganze Cent (formatMoney nutzen).' },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'parseFloat', message: 'Geld nur als ganze Cent.' },
      ],
      // Keine externen Requests aus der App
      'no-restricted-syntax': [
        'error',
        // erlaubt nur den SVG-Namespace (xmlns="http://www.w3.org/2000/svg")
        {
          selector: 'Literal[value=/^https?:\\/\\/(?!www\\.w3\\.org\\/)/]',
          message: 'Keine externen URLs im Code.',
        },
      ],
    },
  },
  // Konfigurationsdateien, API-Routen und E2E-Tests dürfen externe/localhost-URLs enthalten
  {
    files: ['*.{js,ts}', 'api/**/*.ts', 'tests/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  // Architekturgrenzen: screens → components → state → practice / content → domain
  {
    files: ['src/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'react',
            'react-dom',
            '@/components/*',
            '@/screens/*',
            '@/state/*',
            '@/content/*',
            '@/practice/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/content/**', 'src/practice/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['react', '@/components/*', '@/screens/*', '@/state/*'] },
      ],
    },
  },
  {
    files: ['src/state/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['@/components/*', '@/screens/*'] }],
    },
  },
  {
    files: ['src/components/**', 'src/print/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: ['@/screens/*'] }] },
  },
);
