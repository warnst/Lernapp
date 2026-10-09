import type { Station } from '@/domain/types';

// Station 9 – Die Schatztruhe (docs/04). Texte wörtlich übernommen.
export const schatztruhe: Station = {
  id: 'schatztruhe',
  world: 'schatzinsel',
  number: 9,
  title: 'Die Schatztruhe',
  icon: 'station-truhe',
  skillLabel: 'Knobeln mit allem, was du kannst',
  minutes: 10,
  intro: [
    'Da ist sie: die Schatztruhe! Dein goldener Schlüssel passt ins Schloss.',
    'Aber die Truhe hat Rätselschlösser. Jedes Rätsel öffnet ein Schloss.',
  ],
  findling: {
    id: 'goldene-krone',
    name: 'Goldene Krone',
    text: 'Die Truhe ist offen! Darin liegt eine goldene Krone. Du hast die geheime Schatzinsel erkundet!',
  },
  recap: 'Du hast alle Rätselschlösser geknackt.',
  practiceTopic: 'knobeln',
  progressStyle: 'locks',
  tasks: [
    {
      id: 's9-t1',
      title: 'Funde im Sand',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'S1', stufen: [2, 3, 4] },
      scene: {
        kind: 'coins',
        pieces: [],
        groups: [
          [100, 20],
          [200, 20, 10, 5],
        ],
      },
      story: 'Vor der Truhe findest du {{120}} und {{235}} im Sand.',
      parts: [
        {
          id: 's9-t1-a',
          question: 'Wie viel Geld hast du gefunden?',
          answer: { type: 'money', correct: 355 },
          mistakes: [{ value: 255, feedback: 'Rechne die Euro noch einmal: 1 € + 2 €.' }],
          hints: ['1 € + 2 € = 3 €.', 'Jetzt die Cent: 20 + 35.'],
          explanation: '1,20 € + 2,35 € = 3,55 €.',
        },
        {
          id: 's9-t1-b',
          lead: 'Später kaufst du davon eine Laterne für {{175}}.',
          question: 'Wie viel Geld bleibt dir?',
          answer: { type: 'money', correct: 180 },
          mistakes: [
            {
              value: 530,
              feedback: 'Du hast zusammengezählt. Die Laterne kostet Geld, also bleibt weniger.',
            },
            {
              value: 220,
              feedback:
                'Bei den Cent geht 55 − 75 nicht einfach. Zähle lieber von 1,75 € bis 3,55 €.',
            },
          ],
          hints: [
            'Zähle von 1,75 € bis 2 €. Das sind 25 Cent.',
            'Von 2 € bis 3,55 € sind es 1,55 €. Jetzt rechne beides zusammen.',
          ],
          explanation: '25 Cent + 1,55 € = 1,80 €. Dir bleiben 1,80 €.',
        },
      ],
    },
    {
      id: 's9-t2',
      title: 'Muschel, Ball und Feder',
      difficulty: 5,
      authoredFor: 3,
      variant: { template: 'K5', force: { zweiteilig: true }, stufen: [3, 4] },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'muschel', label: 'Muschel', price: 150 },
          { itemId: 'ball', label: 'Ball' },
          { itemId: 'feder', label: 'Feder' },
        ],
      },
      story:
        'Drei Dinge kosten zusammen {{500}}: eine Muschel, ein Ball und eine Feder. Die Muschel kostet {{150}}. Der Ball kostet doppelt so viel wie die Muschel.',
      parts: [
        {
          id: 's9-t2-a',
          question: 'Wie viel kostet der Ball?',
          answer: { type: 'money', correct: 300 },
          mistakes: [
            {
              value: 150,
              feedback: 'Doppelt so viel heißt: zweimal so viel wie die Muschel.',
            },
          ],
          hints: ['Doppelt heißt: zweimal.', 'Rechne 1,50 € + 1,50 €.'],
          explanation: '1,50 € + 1,50 € = 3 €. Der Ball kostet 3 €.',
        },
        {
          id: 's9-t2-b',
          question: 'Wie viel kostet die Feder?',
          answer: { type: 'money', correct: 50 },
          mistakes: [
            {
              value: 200,
              feedback: 'Du hast nur den Ball abgezogen. Zieh auch die Muschel ab.',
            },
            {
              value: 350,
              feedback: 'Du hast nur die Muschel abgezogen. Zieh auch den Ball ab.',
            },
            {
              value: 950,
              feedback:
                'Hier wird nicht zusammengezählt. Die Feder kostet das, was von 5 € übrig bleibt.',
            },
          ],
          hints: [
            'Rechne zuerst Muschel und Ball zusammen: 1,50 € + 3 €.',
            'Muschel und Ball kosten 4,50 €. Was fehlt bis 5 €?',
          ],
          explanation:
            '1,50 € + 3 € = 4,50 €. Von 4,50 € bis 5 € sind es 50 Cent. Die Feder kostet 50 Cent.',
          praise: 'Wow! Das war ein richtig schweres Rätsel.',
        },
      ],
    },
    {
      id: 's9-t3',
      title: 'Der Münzschlitz',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'L3', force: { required: 3 }, stufen: [3, 4] },
      scene: { kind: 'none' },
      story:
        'Das dritte Schloss hat einen Münzschlitz. Es öffnet sich nur mit 50 Cent. Eine 50-Cent-Münze hast du nicht.',
      parts: [
        {
          id: 's9-t3-a',
          question: 'Lege 50 Cent auf drei verschiedene Arten.',
          answer: {
            type: 'pay-variants',
            target: 50,
            palette: [20, 10, 5],
            required: 3,
            showTotal: true,
          },
          hints: [
            'Fang mit 20-Cent-Münzen an. Wie viel fehlt dann noch bis 50 Cent?',
            'Du kannst auch 10-Cent-Münzen und 5-Cent-Münzen mischen.',
          ],
          explanation:
            'Zum Beispiel: 20 + 20 + 10. Oder: 20 + 10 + 10 + 10. Oder: fünfmal 10 Cent.',
          praise: 'Klick! Das dritte Schloss ist offen.',
        },
      ],
    },
    {
      id: 's9-t4',
      title: 'Genau zwei Münzen',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'K4', stufen: [2, 3, 4] },
      scene: { kind: 'none' },
      story:
        'Das vierte Schloss sagt: „Gib mir genau zwei Münzen. Zusammen sollen sie 1,50 € wert sein.“',
      parts: [
        {
          id: 's9-t4-a',
          question: 'Welche zwei Münzen passen?',
          answer: {
            type: 'pay',
            target: 150,
            palette: [1, 2, 5, 10, 20, 50, 100, 200],
            showTotal: false,
            exactCount: 2,
          },
          hints: [
            'Eine der beiden Münzen ist eine Euro-Münze.',
            '1 € ist schon da. Welche Münze fehlt bis 1,50 €?',
          ],
          explanation: '1 € + 50 Cent = 1,50 €. Mit zwei Münzen geht es nur so.',
        },
      ],
    },
    {
      id: 's9-t5',
      title: 'Das letzte Rätsel',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'K3', stufen: [2, 3, 4] },
      scene: { kind: 'none' },
      story:
        'Das letzte Schloss flüstert: „Ich bin eine Münze, mehr wert als 10 Cent, aber weniger als 50 Cent. Welche bin ich?“',
      parts: [
        {
          id: 's9-t5-a',
          question: 'Tippe die richtige Münze an.',
          answer: {
            type: 'choice',
            layout: 'coins',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: '5-Cent-Münze',
                pieces: [5],
                feedback: '5 Cent sind weniger als 10 Cent.',
              },
              { id: 'b', label: '20-Cent-Münze', correct: true, pieces: [20] },
              {
                id: 'c',
                label: '50-Cent-Münze',
                pieces: [50],
                feedback:
                  'Die gesuchte Münze ist weniger wert als 50 Cent. Die 50-Cent-Münze passt also nicht.',
              },
              {
                id: 'd',
                label: '1-Euro-Münze',
                pieces: [100],
                feedback: '1 € ist mehr als 50 Cent.',
              },
            ],
          },
          hints: [
            'Welche Münzen liegen zwischen 10 Cent und 50 Cent?',
            'Zwischen 10 Cent und 50 Cent gibt es nur eine einzige Münze.',
          ],
          explanation: 'Die 20-Cent-Münze: 20 Cent sind mehr als 10 Cent und weniger als 50 Cent.',
          praise: 'Klick! Alle Schlösser sind offen!',
        },
      ],
    },
  ],
};
