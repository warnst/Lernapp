export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // zusätzlicher Typ „content“ für Aufgaben und Texte (docs/08, Abschnitt 4)
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'content',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
};
