import type { Station } from '@/domain/types';

// Station 4 – Die geheimnisvolle Geldbörse (docs/04). Texte wörtlich übernommen.
export const geldboerse: Station = {
  id: 'geldboerse',
  world: 'schatzinsel',
  number: 4,
  title: 'Die geheimnisvolle Geldbörse',
  icon: 'station-geldboerse',
  skillLabel: 'Beträge mit verschiedenen Münzen legen',
  minutes: 8,
  intro: [
    'Hinter einer Palme liegt eine alte Geldbörse. Sie ist voller Münzen.',
    'Und drinnen klimpert noch etwas anderes. Was das wohl ist?',
  ],
  findling: {
    id: 'goldener-schluessel',
    name: 'Goldener Schlüssel',
    text: 'Ganz unten in der Geldbörse liegt ein goldener Schlüssel. Wozu er wohl passt?',
  },
  recap: 'Du hast herausgefunden: Ein Betrag lässt sich mit ganz verschiedenen Münzen legen.',
  practiceTopic: 'muenzen-legen',
  tasks: [
    {
      id: 's4-t1',
      title: 'Was ist in der Geldbörse?',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'Z1', stufen: [2, 3, 4] },
      scene: { kind: 'coins', pieces: [200, 50, 20, 20], label: 'Geldbörse' },
      story: 'In der Geldbörse sind vier Münzen.',
      parts: [
        {
          id: 's4-t1-a',
          question: 'Wie viel Geld ist in der Geldbörse?',
          answer: { type: 'money', correct: 290 },
          mistakes: [
            { value: 270, feedback: 'Es sind zwei 20-Cent-Münzen. Hast du beide gezählt?' },
            { value: 92, feedback: 'Die größte Münze ist eine 2-Euro-Münze, nicht 2 Cent.' },
          ],
          hints: ['Zuerst die Euro: 2 €.', 'Jetzt die Cent: 50 + 20 + 20.'],
          explanation: '2 € + 50 Cent + 20 Cent + 20 Cent = 2,90 €.',
        },
      ],
    },
    {
      id: 's4-t2',
      title: 'Viele Wege zu 1 Euro',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'L3', stufen: [3, 4] },
      scene: { kind: 'none' },
      story: 'Kiko möchte 1 € mit kleinen Münzen legen. Eine 1-Euro-Münze hat er nicht.',
      parts: [
        {
          id: 's4-t2-a',
          question: 'Lege 1 € auf zwei verschiedene Arten.',
          answer: {
            type: 'pay-variants',
            target: 100,
            palette: [50, 20, 10],
            required: 2,
            showTotal: true,
          },
          hints: [
            'Eine Möglichkeit: zwei Münzen, die gleich aussehen.',
            'Für die zweite Möglichkeit: Probier es mit 20-Cent-Münzen oder 10-Cent-Münzen.',
          ],
          explanation:
            'Zum Beispiel: 50 Cent + 50 Cent. Oder: 50 Cent + 20 Cent + 20 Cent + 10 Cent. Oder: fünf 20-Cent-Münzen.',
          praise: 'Klasse! Es gibt viele Wege zu 1 Euro.',
        },
      ],
    },
    {
      id: 's4-t3',
      title: 'So wenige Münzen wie möglich',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'L2', stufen: [2, 3, 4] },
      scene: { kind: 'none' },
      story: 'Die Geldbörse ist schon ziemlich voll.',
      parts: [
        {
          id: 's4-t3-a',
          question: 'Lege 75 Cent mit so wenigen Münzen wie möglich.',
          answer: {
            type: 'pay',
            target: 75,
            palette: [50, 20, 10, 5, 2, 1],
            showTotal: true,
            minimal: true,
          },
          hints: [
            'Nimm zuerst die größte Münze, die passt.',
            'Nach 50 Cent fehlen noch 25 Cent. Welche zwei Münzen ergeben 25 Cent?',
          ],
          explanation: '50 Cent + 20 Cent + 5 Cent = 75 Cent. Das sind nur drei Münzen.',
          praise: 'Super! Mit den großen Münzen zuerst brauchst du die wenigsten Münzen.',
        },
      ],
    },
    {
      id: 's4-t4',
      title: 'Welche Geldbörse passt?',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'Z4', stufen: [2, 3, 4] },
      scene: { kind: 'none' },
      story: 'Kiko hat drei kleine Geldbörsen gefunden.',
      parts: [
        {
          id: 's4-t4-a',
          question: 'In welcher Geldbörse sind genau {{150}}?',
          answer: {
            type: 'choice',
            layout: 'bags',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: 'Geldbörse 1',
                pieces: [100, 50, 20],
                feedback: 'In dieser Geldbörse sind 1,70 €. Das sind 20 Cent zu viel.',
              },
              { id: 'b', label: 'Geldbörse 2', correct: true, pieces: [100, 20, 20, 10] },
              {
                id: 'c',
                label: 'Geldbörse 3',
                pieces: [50, 50, 20, 20],
                feedback: 'In dieser Geldbörse sind 1,40 €. Da fehlen 10 Cent.',
              },
            ],
          },
          hints: [
            'Zähle jede Geldbörse einzeln. Fang mit der größten Münze an.',
            '1,50 € sind 1 € und 50 Cent.',
          ],
          explanation: '1 € + 20 Cent + 20 Cent + 10 Cent = 1,50 €.',
        },
      ],
    },
    {
      id: 's4-t5',
      title: 'Keks und Apfel',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'S1', bind: { A: 'keks', B: 'apfel' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'keks', label: 'Keks', price: 85 },
          { itemId: 'apfel', label: 'Apfel', price: 55 },
        ],
        hand: [200, 100],
      },
      story:
        'In der Geldbörse sind {{300}}. Kiko kauft einen Keks für {{85}} und einen Apfel für {{55}}.',
      parts: [
        {
          id: 's4-t5-a',
          question: 'Wie viel kosten Keks und Apfel zusammen?',
          answer: { type: 'money', correct: 140 },
          mistakes: [
            { value: 130, feedback: 'Rechne 85 + 55 noch einmal. Tipp: 85 + 15 = 100.' },
            { value: 40, feedback: '85 Cent + 55 Cent sind mehr als 1 €.' },
          ],
          hints: [
            'Zähle zuerst bis 1 €: 85 Cent + 15 Cent = 100 Cent.',
            'Von den 55 Cent hast du 15 verbraucht. Es bleiben noch 40 Cent.',
          ],
          explanation: '85 Cent + 55 Cent = 140 Cent. Das sind 1,40 €.',
        },
        {
          id: 's4-t5-b',
          question: 'Wie viel Geld bleibt in der Geldbörse?',
          answer: { type: 'money', correct: 160 },
          mistakes: [
            {
              value: 440,
              feedback: 'Du hast zusammengezählt. Kiko gibt Geld aus, also wird es weniger.',
            },
            {
              value: 260,
              feedback: 'Zähle noch einmal von 1,40 € bis 3 €. Bis 2 € sind es 60 Cent.',
            },
          ],
          hints: [
            'Ziehe von 3 € den Preis aus Teil a ab.',
            'Zähle von 1,40 € bis 2 €. Dann weiter bis 3 €.',
          ],
          explanation:
            'Von 1,40 € bis 2 € sind es 60 Cent. Von 2 € bis 3 € ist es 1 €. Es bleiben 1,60 €.',
          praise: 'Stark! Du hast zwei Rechenschritte hintereinander gelöst.',
        },
      ],
    },
  ],
};
