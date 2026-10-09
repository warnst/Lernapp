import type { Station } from '@/domain/types';

// Station 8 – Die Piratenhöhle (docs/04). Texte wörtlich übernommen.
export const piratenhoehle: Station = {
  id: 'piratenhoehle',
  world: 'schatzinsel',
  number: 8,
  title: 'Die Piratenhöhle',
  icon: 'station-hoehle',
  skillLabel: 'Fehlende Beträge finden',
  minutes: 9,
  intro: [
    'In der Höhle liegt ein altes Piratenbuch. Es gehörte Pirat Hein.',
    'Leider sind manche Zahlen verwischt. Findest du sie heraus?',
  ],
  findling: {
    id: 'schatzkarte',
    name: 'Schatzkarte',
    text: 'Zwischen den Seiten steckt eine Schatzkarte! Das Kreuz zeigt zur Schatztruhe.',
  },
  recap: 'Du hast fehlende Beträge gefunden und rückwärts gerechnet.',
  practiceTopic: 'knobeln',
  tasks: [
    {
      id: 's8-t1',
      title: 'Eine Münze fehlt',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'K6', stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'schatzkaestchen', label: 'Schatzkästchen', price: 360 }],
        hand: [200, 100, 50],
      },
      story:
        'Ein Schatzkästchen kostet {{360}}. Du hast eine 2-Euro-Münze, eine 1-Euro-Münze und eine 50-Cent-Münze.',
      parts: [
        {
          id: 's8-t1-a',
          question: 'Welche Münze fehlt dir noch, damit du genau bezahlen kannst?',
          answer: {
            type: 'choice',
            layout: 'coins',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: '1-Cent-Münze',
                pieces: [1],
                feedback: 'Mit 1 Cent hättest du 3,51 €. Es fehlt mehr.',
              },
              { id: 'b', label: '10-Cent-Münze', correct: true, pieces: [10] },
              {
                id: 'c',
                label: '20-Cent-Münze',
                pieces: [20],
                feedback: 'Mit 20 Cent hättest du 3,70 €. Das sind 10 Cent zu viel.',
              },
              {
                id: 'd',
                label: '50-Cent-Münze',
                pieces: [50],
                feedback: 'Mit 50 Cent hättest du 4 €. Das ist zu viel.',
              },
            ],
          },
          hints: [
            'Zähle zuerst dein Geld: 2 € + 1 € + 50 Cent.',
            'Du hast 3,50 €. Wie viel fehlt bis 3,60 €?',
          ],
          explanation: '2 € + 1 € + 50 Cent = 3,50 €. Bis 3,60 € fehlen 10 Cent.',
        },
      ],
    },
    {
      id: 's8-t2',
      title: 'Der Tintenfleck',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'K1', stufen: [2, 3, 4] },
      scene: { kind: 'note', lines: ['{{140}} + ▢ = {{200}}'] },
      story:
        'Im Piratenbuch steht eine Rechnung. Eine Zahl ist unter einem Tintenfleck verschwunden.',
      parts: [
        {
          id: 's8-t2-a',
          question: 'Welcher Betrag ist unter dem Fleck?',
          answer: { type: 'money', correct: 60 },
          mistakes: [
            {
              value: 340,
              feedback: 'Du hast 1,40 € und 2 € zusammengezählt. Gesucht ist, was bis 2 € fehlt.',
            },
            {
              value: 160,
              feedback: 'Mit 1,60 € kämst du bis 3 €. Zähle von 1,40 € nur bis 2 €.',
            },
          ],
          hints: [
            'Zähle von 1,40 € bis 2 €.',
            '1,50, 1,60 … 2,00. Wie viele 10-Cent-Schritte sind das?',
          ],
          explanation: '1,40 € + 60 Cent = 2 €. Unter dem Fleck stehen 60 Cent.',
        },
      ],
    },
    {
      id: 's8-t3',
      title: 'Heins Beutel',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'K2', stufen: [2, 3, 4] },
      scene: {
        kind: 'note',
        lines: ['Ausgegeben: {{230}}', 'Noch im Beutel: {{170}}', 'Am Anfang: ▢'],
      },
      story:
        'Pirat Hein hatte Geld in seinem Beutel. Er hat {{230}} ausgegeben. Jetzt hat er noch {{170}}.',
      parts: [
        {
          id: 's8-t3-a',
          question: 'Wie viel Geld war am Anfang im Beutel?',
          answer: { type: 'money', correct: 400 },
          mistakes: [
            {
              value: 60,
              feedback:
                'Am Anfang war mehr Geld im Beutel, nicht weniger. Hein hat ja etwas ausgegeben.',
            },
            { value: 300, feedback: 'Rechne die Cent noch einmal: 70 Cent + 30 Cent.' },
          ],
          hints: [
            'Leg das ausgegebene Geld in Gedanken zurück in den Beutel.',
            'Rechne 1,70 € + 2,30 €.',
          ],
          explanation: '1,70 € + 2,30 € = 4 €. So viel war am Anfang im Beutel.',
          praise: 'Toll! Du hast rückwärts gerechnet.',
        },
      ],
    },
    {
      id: 's8-t4',
      title: 'Der Piratenhut',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'K7', bind: { A: 'piratenhut' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'piratenhut', label: 'Piratenhut', price: 200 }],
        hand: [100, 20, 5],
      },
      story: 'Ida hat schon {{125}} in der Hand. Ein Piratenhut kostet {{200}}.',
      parts: [
        {
          id: 's8-t4-a',
          question: 'Lege das Geld, das Ida noch fehlt.',
          answer: { type: 'pay', target: 75, palette: [50, 20, 10, 5, 2, 1], showTotal: false },
          hints: [
            'Wie viel fehlt von 1,25 € bis 2 €?',
            'Von 1,25 € bis 1,30 € sind es 5 Cent. Von 1,30 € bis 2 € sind es 70 Cent.',
          ],
          explanation: 'Ida fehlen 75 Cent. Zum Beispiel: 50 Cent + 20 Cent + 5 Cent.',
        },
      ],
    },
    {
      id: 's8-t5',
      title: 'Augenklappe und Kopftuch',
      difficulty: 4,
      authoredFor: 3,
      scene: {
        kind: 'items',
        items: [
          { itemId: 'augenklappe', label: 'Augenklappe' },
          { itemId: 'kopftuch', label: 'Kopftuch' },
        ],
        paidWith: [500],
      },
      story:
        'Im Piratenbuch steht: Pirat Hein hatte {{500}}. Er hat eine Augenklappe und ein Kopftuch gekauft. Er hat {{100}} zurückbekommen.',
      parts: [
        {
          id: 's8-t5-a',
          question: 'Wie viel hat Hein insgesamt bezahlt?',
          answer: { type: 'money', correct: 400 },
          mistakes: [
            {
              value: 600,
              feedback: 'Hein hat Geld zurückbekommen. Er hat also weniger als 5 € bezahlt.',
            },
          ],
          hints: ['Hein hatte 5 € und hat 1 € zurückbekommen.', 'Rechne 5 € − 1 €.'],
          explanation: '5 € − 1 € = 4 €. Hein hat 4 € bezahlt.',
        },
        {
          id: 's8-t5-b',
          lead: 'Die Augenklappe kostet {{180}}.',
          question: 'Wie viel kostet das Kopftuch?',
          answer: { type: 'money', correct: 220 },
          mistakes: [
            {
              value: 580,
              feedback:
                'Augenklappe und Kopftuch kosten zusammen 4 €. Das Kopftuch kostet also weniger als 4 €.',
            },
            { value: 320, feedback: 'Zähle noch einmal von 1,80 € bis 4 €.' },
          ],
          hints: [
            'Beides zusammen kostet 4 €. Die Augenklappe kostet 1,80 €.',
            'Zähle von 1,80 € bis 2 €. Dann weiter bis 4 €.',
          ],
          explanation:
            'Von 1,80 € bis 2 € sind es 20 Cent. Von 2 € bis 4 € sind es 2 €. Das Kopftuch kostet 2,20 €.',
          praise: 'Klasse! Das Piratenbuch hat keine Geheimnisse mehr vor dir.',
        },
      ],
    },
  ],
};
