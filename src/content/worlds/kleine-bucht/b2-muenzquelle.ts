import type { Station } from '@/domain/types';

// Station 2 – Die Münzquelle (docs/11). Texte wörtlich übernommen.
export const muenzquelle: Station = {
  id: 'muenzquelle',
  world: 'kleine-bucht',
  number: 2,
  title: 'Die Münzquelle',
  icon: 'station-muenzquelle',
  skillLabel: 'Münzen kennenlernen',
  minutes: 5,
  intro: ['In dieser Quelle glitzern Münzen.', 'Jede Münze hat eine Zahl. Schauen wir sie uns an!'],
  findling: {
    id: 'gluecksstein',
    name: 'Glücksstein',
    text: 'Zwischen den Münzen liegt ein glatter Glücksstein. Er gehört jetzt dir!',
  },
  recap: 'Du hast Münzen erkannt und gezählt.',
  practiceTopic: 'muenzen-zaehlen',
  tasks: [
    {
      id: 'b2-t1',
      title: 'Die 2-Cent-Münze',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'C1' },
      scene: { kind: 'none' },
      story: 'Kiko sucht eine bestimmte Münze.',
      parts: [
        {
          id: 'b2-t1-a',
          question: 'Tippe die 2-Cent-Münze an.',
          answer: {
            type: 'choice',
            layout: 'coins',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: '1-Cent-Münze',
                pieces: [1],
                feedback: 'Auf dieser Münze steht 1. Suche die Münze mit der 2.',
              },
              { id: 'b', label: '2-Cent-Münze', correct: true, pieces: [2] },
              {
                id: 'c',
                label: '5-Cent-Münze',
                pieces: [5],
                feedback: 'Auf dieser Münze steht 5. Suche die Münze mit der 2.',
              },
            ],
          },
          hints: ['Schau auf die Zahl in der Mitte der Münze.', 'Suche die Zahl 2.'],
          explanation: 'Die 2-Cent-Münze hat eine 2 in der Mitte.',
        },
      ],
    },
    {
      id: 'b2-t2',
      title: 'Der Euro',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'C1', force: { euro: true } },
      scene: { kind: 'none' },
      story: 'In der Quelle liegen drei Münzen.',
      parts: [
        {
          id: 'b2-t2-a',
          question: 'Welche Münze ist 1 Euro?',
          answer: {
            type: 'choice',
            layout: 'coins',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: '10-Cent-Münze',
                pieces: [10],
                feedback: 'Das ist die 10-Cent-Münze.',
              },
              { id: 'b', label: '1-Euro-Münze', correct: true, pieces: [100] },
              {
                id: 'c',
                label: '50-Cent-Münze',
                pieces: [50],
                feedback: 'Das ist die 50-Cent-Münze. Die Euro-Münze hat zwei Farben.',
              },
            ],
          },
          hints: [
            'Schau dir die Farben der Münzen genau an.',
            'Die 1-Euro-Münze hat zwei Farben: innen silbern, außen golden.',
          ],
          explanation: 'Die 1-Euro-Münze ist innen silbern und außen golden.',
        },
      ],
    },
    {
      id: 'b2-t3',
      title: 'Groß oder viel?',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'C2' },
      scene: { kind: 'none' },
      story: 'Zwei Münzen liegen nebeneinander.',
      parts: [
        {
          id: 'b2-t3-a',
          question: 'Welche Münze ist mehr wert?',
          answer: {
            type: 'choice',
            layout: 'coins',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: '5-Cent-Münze',
                pieces: [5],
                feedback: 'Die 5-Cent-Münze ist größer. Aber 10 ist mehr als 5!',
              },
              { id: 'b', label: '10-Cent-Münze', correct: true, pieces: [10] },
            ],
          },
          hints: ['Schau nicht auf die Größe. Schau auf die Zahl.', 'Was ist mehr: 5 oder 10?'],
          explanation: '10 Cent sind mehr als 5 Cent, auch wenn die Münze kleiner ist.',
          praise: 'Klasse! Du hast auf die Zahl geschaut.',
        },
      ],
    },
    {
      id: 'b2-t4',
      title: 'Drei kleine Münzen',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'Z1', force: { antwort: 'number' } },
      scene: { kind: 'coins', pieces: [1, 1, 1] },
      story: 'Kiko hat drei 1-Cent-Münzen.',
      parts: [
        {
          id: 'b2-t4-a',
          question: 'Wie viel Cent sind das zusammen?',
          answer: { type: 'number', correct: 3 },
          mistakes: [{ value: 1, feedback: 'Jede Münze ist 1 Cent. Zähle alle Münzen.' }],
          hints: ['Jede dieser Münzen ist 1 Cent wert.', 'Zähle die Münzen: eins, zwei …'],
          explanation: '1 Cent und 1 Cent und 1 Cent sind 3 Cent.',
        },
      ],
    },
    {
      id: 'b2-t5',
      title: 'Zwei Münzen',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'Z1', force: { antwort: 'choice' } },
      scene: { kind: 'coins', pieces: [2, 1] },
      story: 'Kiko hat eine 2-Cent-Münze und eine 1-Cent-Münze.',
      parts: [
        {
          id: 'b2-t5-a',
          question: 'Wie viel Cent sind das zusammen?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: '{{2}}',
                feedback: 'Du hast nur die 2-Cent-Münze gezählt. Die 1 kommt noch dazu.',
              },
              { id: 'b', label: '{{3}}', correct: true },
              {
                id: 'c',
                label: '{{4}}',
                feedback: 'Die kleine Münze ist 1 Cent, nicht 2 Cent.',
              },
            ],
          },
          hints: ['Schau auf die Zahlen: 2 und 1.', 'Du hast 2. Zähle eins weiter.'],
          explanation: '2 Cent und 1 Cent sind 3 Cent.',
        },
      ],
    },
  ],
};
