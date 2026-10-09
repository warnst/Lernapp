import type { Station } from '@/domain/types';

// Station 1 – Das Muschelufer (docs/11). Texte wörtlich übernommen.
export const muschelufer: Station = {
  id: 'muschelufer',
  world: 'kleine-bucht',
  number: 1,
  title: 'Das Muschelufer',
  icon: 'station-muschelufer',
  skillLabel: 'Zählen bis 10',
  minutes: 5,
  intro: [
    'Hallo, ich bin Kiko! Das ist die kleine Bucht.',
    'Hier liegen viele Muscheln. Zählst du mit mir?',
  ],
  findling: {
    id: 'perlmuttmuschel',
    name: 'Perlmuttmuschel',
    text: 'Eine Muschel glänzt wie ein Regenbogen. Sie gehört jetzt dir!',
  },
  recap: 'Du hast Muscheln und Seesterne gezählt.',
  practiceTopic: 'mengen-zahlen',
  tasks: [
    {
      id: 'b1-t1',
      title: 'Muscheln am Ufer',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'M1' },
      scene: { kind: 'objects', groups: [{ itemId: 'muschel', count: 4 }] },
      story: 'Am Ufer liegen Muscheln.',
      parts: [
        {
          id: 'b1-t1-a',
          question: 'Wie viele Muscheln siehst du?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: '3',
                feedback: 'Hast du eine Muschel übersehen? Tippe jede Muschel an.',
              },
              { id: 'b', label: '4', correct: true },
              {
                id: 'c',
                label: '5',
                feedback: 'Hast du eine Muschel zweimal gezählt? Tippe jede nur einmal an.',
              },
            ],
          },
          hints: [
            'Tippe jede Muschel an. Dann bekommt sie einen Punkt.',
            'Zähle langsam mit: eins, zwei, drei …',
          ],
          explanation: 'Eins, zwei, drei, vier. Es sind 4 Muscheln.',
          praise: 'Super gezählt!',
        },
      ],
    },
    {
      id: 'b1-t2',
      title: 'Seesterne im Sand',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'M1', force: { eingabe: 'number' } },
      scene: { kind: 'objects', groups: [{ itemId: 'seestern', count: 7 }] },
      story: 'Im Sand liegen Seesterne.',
      parts: [
        {
          id: 'b1-t2-a',
          question: 'Wie viele Seesterne sind es?',
          answer: { type: 'number', correct: 7 },
          mistakes: [
            { value: 6, feedback: 'Zähle noch einmal und tippe jeden Seestern an.' },
            { value: 8, feedback: 'Hast du einen Seestern zweimal gezählt?' },
          ],
          hints: [
            'Tippe jeden Seestern an, während du zählst.',
            'Es sind mehr als 5. Zähle ab 5 weiter: sechs …',
          ],
          explanation: '1, 2, 3, 4, 5, 6, 7. Es sind 7 Seesterne.',
        },
      ],
    },
    {
      id: 'b1-t3',
      title: 'Zwei Eimer',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'M2' },
      scene: { kind: 'none' },
      story: 'Kiko hat zwei Eimer mit Muscheln.',
      parts: [
        {
          id: 'b1-t3-a',
          question: 'In welchem Eimer sind mehr Muscheln?',
          answer: {
            type: 'choice',
            layout: 'bags',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: 'Eimer mit Fisch',
                correct: true,
                icon: 'fisch',
                objects: { itemId: 'muschel', count: 5 },
              },
              {
                id: 'b',
                label: 'Eimer mit Stern',
                icon: 'stern',
                objects: { itemId: 'muschel', count: 3 },
                feedback: 'Im Stern-Eimer sind 3 Muscheln. Zähle jetzt den Fisch-Eimer.',
              },
              {
                id: 'c',
                label: 'Gleich viele',
                feedback: 'Zähle noch einmal. Sind es wirklich gleich viele?',
              },
            ],
          },
          hints: ['Zähle zuerst den einen Eimer, dann den anderen.', 'Was ist mehr: 5 oder 3?'],
          explanation: 'Im Fisch-Eimer sind 5 Muscheln, im Stern-Eimer 3. 5 ist mehr als 3.',
        },
      ],
    },
    {
      id: 'b1-t4',
      title: 'Noch mehr Muscheln',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'M3' },
      scene: {
        kind: 'objects',
        groups: [
          { itemId: 'muschel', count: 3, label: 'zuerst' },
          { itemId: 'muschel', count: 2, label: 'dazu' },
        ],
      },
      story: 'Kiko findet 3 Muscheln. Dann findet er noch 2.',
      parts: [
        {
          id: 'b1-t4-a',
          question: 'Wie viele Muscheln hat Kiko jetzt?',
          answer: { type: 'number', correct: 5 },
          mistakes: [
            { value: 4, feedback: 'Zähle alle Muscheln zusammen. Fang links an.' },
            { value: 1, feedback: 'Kiko findet Muscheln dazu. Dann werden es mehr.' },
          ],
          hints: [
            'Zähle alle Muscheln: erst links, dann rechts.',
            'Links sind 3. Zähle weiter: vier, fünf.',
          ],
          explanation: '3 und 2 sind zusammen 5.',
          praise: 'Toll! Du hast weitergezählt.',
        },
      ],
    },
    {
      id: 'b1-t5',
      title: 'Häufchen ordnen',
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'O2' },
      scene: { kind: 'none' },
      story: 'Kiko hat drei Häufchen gemacht.',
      parts: [
        {
          id: 'b1-t5-a',
          question: 'Tippe die Häufchen an. Fang mit den wenigsten Muscheln an.',
          answer: {
            type: 'order',
            direction: 'asc',
            entries: [
              {
                id: 'h6',
                label: '6 Muscheln',
                value: 6,
                objects: { itemId: 'muschel', count: 6 },
              },
              {
                id: 'h2',
                label: '2 Muscheln',
                value: 2,
                objects: { itemId: 'muschel', count: 2 },
              },
              {
                id: 'h4',
                label: '4 Muscheln',
                value: 4,
                objects: { itemId: 'muschel', count: 4 },
              },
            ],
          },
          hints: ['Zähle jedes Häufchen.', 'Ein Häufchen hat nur 2 Muscheln. Damit fängst du an.'],
          explanation: 'Zuerst 2 Muscheln, dann 4, dann 6.',
        },
      ],
    },
  ],
};
