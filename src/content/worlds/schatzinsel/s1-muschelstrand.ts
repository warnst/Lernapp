import type { Station } from '@/domain/types';

// Station 1 – Muschelstrand (docs/04). Texte wörtlich übernommen.
export const muschelstrand: Station = {
  id: 'muschelstrand',
  world: 'schatzinsel',
  number: 1,
  title: 'Muschelstrand',
  icon: 'station-muschel',
  skillLabel: 'Münzen erkennen und zählen',
  minutes: 6,
  intro: [
    'Hallo, ich bin Kiko! Ich zeige dir die geheime Schatzinsel.',
    'Am Strand hat jemand Münzen verloren. Hilfst du mir, sie zu zählen?',
  ],
  findling: {
    id: 'glitzermuschel',
    name: 'Glitzermuschel',
    text: 'Im Sand glitzert etwas: eine Glitzermuschel. Sie gehört jetzt dir.',
  },
  recap: 'Du hast Münzen erkannt und zusammengezählt.',
  practiceTopic: 'muenzen-zaehlen',
  tasks: [
    {
      id: 's1-t1',
      title: 'Drei Münzen im Sand',
      difficulty: 1,
      authoredFor: 3,
      variant: { template: 'Z1', stufen: [2, 3, 4] },
      scene: { kind: 'coins', pieces: [50, 20, 20] },
      story: 'Kiko hat drei Münzen im Sand gefunden.',
      parts: [
        {
          id: 's1-t1-a',
          question: 'Wie viel Geld ist das zusammen?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: true,
            options: [
              { id: 'a', label: '{{90}}', correct: true },
              {
                id: 'b',
                label: '{{70}}',
                feedback: 'Es liegen zwei 20-Cent-Münzen da. Hast du beide mitgezählt?',
              },
              {
                id: 'c',
                label: '{{72}}',
                feedback:
                  'Schau genau hin: Beide kleinen Münzen sind 20-Cent-Münzen, keine 2-Cent-Münzen.',
              },
            ],
          },
          hints: ['Fang mit der größten Münze an: 50 Cent.', 'Jetzt zählst du weiter: 50, 70, 90.'],
          explanation: '50 Cent + 20 Cent + 20 Cent = 90 Cent.',
          praise: 'Toll! Du hast mit der größten Münze angefangen.',
        },
      ],
    },
    {
      id: 's1-t2',
      title: 'Die Muschelkette',
      difficulty: 1,
      authoredFor: 3,
      variant: { template: 'L1', force: { ziel: 'rund' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'muschelkette', label: 'Muschelkette', price: 100 }],
      },
      story: 'Am Strand gibt es eine Muschelkette für {{100}}. Eine 1-Euro-Münze hat Kiko nicht.',
      parts: [
        {
          id: 's1-t2-a',
          question: 'Lege genau 1 € mit den Münzen auf Kikos Tablett.',
          answer: { type: 'pay', target: 100, palette: [50, 20, 10, 5], showTotal: true },
          hints: [
            '1 Euro sind 100 Cent. Wie viele Cent liegen schon auf dem Tablett?',
            'Probier es mit 50-Cent-Münzen. Wie viele brauchst du für 100 Cent?',
          ],
          explanation: '1 € sind 100 Cent. Zum Beispiel: 50 Cent + 50 Cent = 100 Cent.',
          praise: 'Super! 100 Cent sind genau 1 Euro.',
        },
      ],
    },
    {
      id: 's1-t3',
      title: 'Zwei Beutel',
      difficulty: 1,
      authoredFor: 3,
      variant: { template: 'Z2', force: { falle: true }, stufen: [2, 3, 4] },
      scene: { kind: 'none' },
      story:
        'Kiko hat zwei Beutel gefunden. Im Anker-Beutel ist eine Münze. Im Stern-Beutel sind vier Münzen.',
      parts: [
        {
          id: 's1-t3-a',
          question: 'In welchem Beutel ist mehr Geld?',
          answer: {
            type: 'choice',
            layout: 'bags',
            shuffle: false,
            options: [
              { id: 'a', label: 'Anker-Beutel', correct: true, icon: 'anker', pieces: [100] },
              {
                id: 'b',
                label: 'Stern-Beutel',
                icon: 'stern',
                pieces: [50, 20, 20, 5],
                feedback:
                  'Im Stern-Beutel sind mehr Münzen. Aber sind es auch mehr Cent? Zähle nach: 50 + 20 + 20 + 5.',
              },
              {
                id: 'c',
                label: 'In beiden gleich viel',
                feedback: 'Zähle den Stern-Beutel genau: 50 + 20 + 20 + 5. Sind das 100 Cent?',
              },
            ],
          },
          hints: [
            'Mehr Münzen heißt nicht immer mehr Geld.',
            '1 Euro sind 100 Cent. Wie viele Cent sind im Stern-Beutel?',
          ],
          explanation:
            'Im Anker-Beutel ist 1 €, das sind 100 Cent. Im Stern-Beutel sind 50 + 20 + 20 + 5 = 95 Cent. 100 Cent sind mehr als 95 Cent.',
          praise: 'Gut aufgepasst! Wenige Münzen können mehr wert sein als viele.',
        },
      ],
    },
    {
      id: 's1-t4',
      title: 'Noch mehr Glitzer',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'Z1', stufen: [2, 3, 4] },
      scene: { kind: 'coins', pieces: [200, 100, 50, 10] },
      story: 'Im Sand glitzern noch vier Münzen.',
      parts: [
        {
          id: 's1-t4-a',
          question: 'Wie viel Geld ist das zusammen?',
          answer: { type: 'money', correct: 360 },
          mistakes: [
            {
              value: 351,
              feedback: 'Schau auf die kleinste Münze: Da steht 10. Das sind 10 Cent.',
            },
            {
              value: 460,
              feedback: 'Zähle die Euro noch einmal: eine 2-Euro-Münze und eine 1-Euro-Münze.',
            },
          ],
          hints: ['Zähle zuerst die Euro: 2 € + 1 €.', 'Jetzt die Cent: 50 Cent + 10 Cent.'],
          explanation: '2 € + 1 € = 3 €. 50 Cent + 10 Cent = 60 Cent. Zusammen sind das 3,60 €.',
          praise: 'Super! Erst die Euro, dann die Cent. So behältst du den Überblick.',
        },
      ],
    },
    {
      id: 's1-t5',
      title: 'Münzen in einer Reihe',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'Z3', stufen: [2, 3, 4] },
      scene: { kind: 'none' },
      story: 'Kiko will seine Münzen ordnen.',
      parts: [
        {
          id: 's1-t5-a',
          question:
            'Tippe die Münzen der Reihe nach an. Fang mit der Münze an, die am wenigsten wert ist.',
          answer: {
            type: 'order',
            direction: 'asc',
            entries: [
              { id: 'm10', label: '10 Cent', value: 10, piece: 10 },
              { id: 'm5', label: '5 Cent', value: 5, piece: 5 },
              { id: 'm50', label: '50 Cent', value: 50, piece: 50 },
              { id: 'm100', label: '1 Euro', value: 100, piece: 100 },
            ],
          },
          hints: [
            'Achtung: Große Münzen sind nicht immer mehr wert. Lies die Zahl auf der Münze.',
            'Die 5-Cent-Münze ist größer als die 10-Cent-Münze, aber weniger wert.',
          ],
          explanation:
            '5 Cent, 10 Cent, 50 Cent, 1 €. Die 50-Cent-Münze ist sogar größer als die 1-Euro-Münze. Trotzdem ist 1 € mehr wert.',
          praise: 'Klasse! Du hast auf die Zahl geschaut und nicht auf die Größe.',
        },
      ],
    },
  ],
};
