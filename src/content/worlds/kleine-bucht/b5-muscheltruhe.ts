import type { Station } from '@/domain/types';

// Station 5 – Die Muscheltruhe (docs/11). Texte wörtlich übernommen.
export const muscheltruhe: Station = {
  id: 'muscheltruhe',
  world: 'kleine-bucht',
  number: 5,
  title: 'Die Muscheltruhe',
  icon: 'station-muscheltruhe',
  skillLabel: 'Muster und Rätsel',
  minutes: 6,
  intro: ['Da hinten steht eine kleine Truhe!', 'Sie geht nur mit Rätseln auf. Rätselst du mit?'],
  findling: {
    id: 'perle',
    name: 'Perle',
    text: 'Die Truhe ist offen! Darin liegt eine Perle. Du hast die kleine Bucht erkundet!',
  },
  recap: 'Du hast alle Rätsel gelöst.',
  practiceTopic: 'raetsel',
  progressStyle: 'locks',
  tasks: [
    {
      id: 'b5-t1',
      title: 'Muschel, Stern, Muschel …',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'sequence', force: { muster: 'bild' } },
      scene: {
        kind: 'sequence',
        items: [
          { kind: 'icon', icon: 'muschel' },
          { kind: 'icon', icon: 'stern' },
          { kind: 'icon', icon: 'muschel' },
          { kind: 'icon', icon: 'stern' },
          { kind: 'icon', icon: 'muschel' },
          { kind: 'blank' },
        ],
      },
      story: 'Kiko legt eine Reihe.',
      parts: [
        {
          id: 'b5-t1-a',
          question: 'Was kommt als Nächstes?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: false,
            options: [
              { id: 'a', label: 'Stern', icon: 'stern', correct: true },
              {
                id: 'b',
                label: 'Muschel',
                icon: 'muschel',
                feedback: 'Schau genau: Nach jeder Muschel kommt ein …?',
              },
              {
                id: 'c',
                label: 'Fisch',
                icon: 'fisch',
                feedback: 'Ein Fisch kommt in der Reihe gar nicht vor.',
              },
            ],
          },
          hints: [
            'Sprich die Reihe laut: Muschel, Stern, Muschel, Stern …',
            'Nach einer Muschel kommt immer ein Stern.',
          ],
          explanation: 'Muschel, Stern, Muschel, Stern, Muschel, Stern.',
        },
      ],
    },
    {
      id: 'b5-t2',
      title: 'Der leere Stein',
      difficulty: 3,
      authoredFor: 1,
      variant: {
        template: 'sequence',
        force: { muster: 'zahl', luecke: 'mitte', antwort: 'number' },
      },
      scene: {
        kind: 'sequence',
        items: [
          { kind: 'number', value: 1 },
          { kind: 'number', value: 2 },
          { kind: 'number', value: 3 },
          { kind: 'blank' },
          { kind: 'number', value: 5 },
        ],
      },
      story: 'Auf den Steinen stehen Zahlen. Ein Stein ist leer.',
      parts: [
        {
          id: 'b5-t2-a',
          question: 'Welche Zahl fehlt?',
          answer: { type: 'number', correct: 4 },
          mistakes: [
            {
              value: 6,
              feedback: 'Die 6 kommt erst nach der 5. Welche Zahl steht zwischen 3 und 5?',
            },
          ],
          hints: ['Zähle von 1 an laut mit.', 'Was kommt nach der 3?'],
          explanation: '1, 2, 3, 4, 5. Es fehlt die 4.',
        },
      ],
    },
    {
      id: 'b5-t3',
      title: 'Es werden immer mehr',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'sequence', force: { muster: 'menge' } },
      scene: {
        kind: 'sequence',
        items: [
          { kind: 'objects', itemId: 'muschel', count: 1 },
          { kind: 'objects', itemId: 'muschel', count: 2 },
          { kind: 'objects', itemId: 'muschel', count: 3 },
          { kind: 'blank' },
        ],
      },
      story: 'Kiko legt Muscheln in Felder.',
      parts: [
        {
          id: 'b5-t3-a',
          question: 'Wie viele Muscheln kommen ins nächste Feld?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: '3',
                feedback: 'In jedem Feld werden es mehr. 3 gab es schon.',
              },
              { id: 'b', label: '4', correct: true },
              { id: 'c', label: '5', feedback: 'Es kommt immer nur eine Muschel dazu.' },
            ],
          },
          hints: ['Zähle die Muscheln in jedem Feld.', 'Es kommt immer eine Muschel dazu.'],
          explanation: '1, 2, 3, 4. Ins nächste Feld kommen 4 Muscheln.',
        },
      ],
    },
    {
      id: 'b5-t4',
      title: 'Die Münzwippe',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'balance', force: { frage: 'fehlt', geld: true } },
      scene: {
        kind: 'balance',
        left: { pieces: [5] },
        right: { pieces: [2, 2], unknown: 1 },
      },
      story: 'Auf der Wippe liegen Münzen.',
      parts: [
        {
          id: 'b5-t4-a',
          question: 'Welche Münze fehlt rechts?',
          answer: {
            type: 'choice',
            layout: 'coins',
            shuffle: false,
            options: [
              { id: 'a', label: '1-Cent-Münze', correct: true, pieces: [1] },
              {
                id: 'b',
                label: '2-Cent-Münze',
                pieces: [2],
                feedback: 'Dann wären es rechts 6 Cent. Das ist zu viel.',
              },
              {
                id: 'c',
                label: '5-Cent-Münze',
                pieces: [5],
                feedback: 'Dann wären es rechts 9 Cent. Das ist viel zu viel.',
              },
            ],
          },
          hints: [
            'Links liegen 5 Cent. Rechts sollen es auch 5 Cent werden.',
            'Rechts sind schon 2 und 2, also 4 Cent. Was fehlt bis 5?',
          ],
          explanation: '2 Cent und 2 Cent und 1 Cent sind 5 Cent. Es fehlt die 1-Cent-Münze.',
        },
      ],
    },
    {
      id: 'b5-t5',
      title: 'Das Zahlenschloss',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'code', force: { raeder: 3, punkte: true } },
      scene: {
        kind: 'clues',
        clues: [
          { symbol: 'stern', text: '1 + 1', dots: [1, 1] },
          { symbol: 'muschel', text: '2 + 2', dots: [2, 2] },
          { symbol: 'fisch', text: '3 + 0', dots: [3, 0] },
        ],
      },
      story: 'Die Truhe hat ein Zahlenschloss mit drei Rädern.',
      parts: [
        {
          id: 'b5-t5-a',
          question: 'Löse die drei Rätsel. Stelle die Zahlen am Schloss ein.',
          answer: { type: 'code', digits: [2, 4, 3] },
          hints: [
            'Zähle bei jedem Rätsel die Punkte zusammen.',
            'Beim Stern: 1 Punkt und 1 Punkt. Wie viele sind das?',
          ],
          explanation:
            'Stern: 1 + 1 = 2. Muschel: 2 + 2 = 4. Fisch: 3 + 0 = 3. Der Code ist 2, 4, 3.',
          praise: 'Klick! Die Truhe ist offen!',
        },
      ],
    },
  ],
};
