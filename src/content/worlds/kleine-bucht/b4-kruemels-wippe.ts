import type { Station } from '@/domain/types';

// Station 4 – Krümels Wippe (docs/11). Texte wörtlich übernommen.
export const kruemelsWippe: Station = {
  id: 'kruemels-wippe',
  world: 'kleine-bucht',
  number: 4,
  title: 'Krümels Wippe',
  icon: 'station-kruemels-wippe',
  skillLabel: 'Mehr, weniger, gleich viel',
  minutes: 6,
  intro: [
    'Das ist mein Freund Krümel, der kleine Krebs.',
    'Krümels Wippe ist nur gerade, wenn auf beiden Seiten gleich viel liegt.',
  ],
  findling: {
    id: 'moewenfeder',
    name: 'Möwenfeder',
    text: 'Eine Möwe hat eine Feder verloren. Krümel schenkt sie dir!',
  },
  recap: 'Du hast verglichen, dazugelegt und weggenommen.',
  practiceTopic: 'mengen-zahlen',
  tasks: [
    {
      id: 'b4-t1',
      title: 'Ist die Wippe gerade?',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'balance', force: { frage: 'gleich' } },
      scene: {
        kind: 'balance',
        left: { objects: { itemId: 'muschel', count: 4 } },
        right: { objects: { itemId: 'muschel', count: 4 } },
      },
      story: 'Auf der Wippe liegen Muscheln.',
      parts: [
        {
          id: 'b4-t1-a',
          question: 'Liegen auf beiden Seiten gleich viele Muscheln?',
          answer: {
            type: 'choice',
            layout: 'yesno',
            shuffle: false,
            options: [
              { id: 'a', label: 'Ja', correct: true },
              {
                id: 'b',
                label: 'Nein',
                feedback: 'Zähle beide Seiten. Links sind 4. Und rechts?',
              },
            ],
          },
          hints: [
            'Zähle zuerst links, dann rechts.',
            'Links sind 4 Muscheln. Wie viele sind rechts?',
          ],
          explanation: 'Links 4, rechts 4. Das ist gleich viel. Die Wippe ist gerade.',
        },
      ],
    },
    {
      id: 'b4-t2',
      title: 'Was muss dazu?',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'balance', force: { frage: 'fehlt', antwort: 'number' } },
      scene: {
        kind: 'balance',
        left: { objects: { itemId: 'muschel', count: 6 } },
        right: { objects: { itemId: 'muschel', count: 4 }, unknown: 1 },
      },
      story: 'Links liegen mehr Muscheln. Die Wippe kippt.',
      parts: [
        {
          id: 'b4-t2-a',
          question: 'Wie viele Muscheln muss Krümel rechts dazulegen?',
          answer: { type: 'number', correct: 2 },
          mistakes: [
            { value: 6, feedback: 'Rechts liegen schon 4. Wie viele fehlen bis 6?' },
            { value: 10, feedback: 'Rechts sollen es so viele sein wie links, also 6.' },
          ],
          hints: [
            'Links sind 6 Muscheln. Rechts sollen es auch 6 werden.',
            'Rechts sind schon 4. Zähle weiter bis 6: fünf, sechs.',
          ],
          explanation: '4 und 2 sind 6. Krümel legt 2 Muscheln dazu.',
        },
      ],
    },
    {
      id: 'b4-t3',
      title: 'Krümels Schritte',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'N1' },
      scene: {
        kind: 'sequence',
        items: [{ kind: 'number', value: 6 }, { kind: 'number', value: 7 }, { kind: 'blank' }],
      },
      story: 'Krümel zählt seine Schritte.',
      parts: [
        {
          id: 'b4-t3-a',
          question: 'Welche Zahl kommt nach der 7?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: '6',
                feedback: 'Die 6 kommt vor der 7. Wir suchen die Zahl danach.',
              },
              { id: 'b', label: '8', correct: true },
              { id: 'c', label: '9', feedback: 'Zwischen 7 und 9 kommt noch eine Zahl.' },
            ],
          },
          hints: ['Zähle laut: sechs, sieben …', 'Was sagst du nach sieben?'],
          explanation: '6, 7, 8. Nach der 7 kommt die 8.',
        },
      ],
    },
    {
      id: 'b4-t4',
      title: 'Fische schwimmen weg',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'M4' },
      scene: { kind: 'objects', groups: [{ itemId: 'fisch', count: 5, leaving: 2 }] },
      story: 'Im Wasser sind 5 Fische. 2 schwimmen weg.',
      parts: [
        {
          id: 'b4-t4-a',
          question: 'Wie viele Fische bleiben da?',
          answer: { type: 'number', correct: 3 },
          mistakes: [
            { value: 7, feedback: 'Die Fische schwimmen weg. Dann werden es weniger.' },
            { value: 2, feedback: '2 Fische schwimmen weg. Wie viele bleiben übrig?' },
          ],
          hints: [
            'Halte 5 Finger hoch. Klappe 2 Finger ein.',
            'Zähle die Finger, die noch stehen.',
          ],
          explanation: '5 weniger 2 sind 3. Es bleiben 3 Fische.',
        },
      ],
    },
    {
      id: 'b4-t5',
      title: 'Krümel kauft ein',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'M4', force: { geld: true } },
      scene: {
        kind: 'items',
        items: [{ itemId: 'muschel', label: 'Muschel', price: 2 }],
        hand: [5, 1],
      },
      story: 'Krümel hat {{6}}. Er kauft eine Muschel für {{2}}.',
      parts: [
        {
          id: 'b4-t5-a',
          question: 'Wie viel Cent hat Krümel noch?',
          answer: { type: 'number', correct: 4 },
          mistakes: [{ value: 8, feedback: 'Krümel gibt Geld aus. Dann hat er weniger.' }],
          hints: ['Krümel hat 6 Cent und gibt 2 Cent aus.', 'Zähle von 6 rückwärts: fünf, vier.'],
          explanation: '6 weniger 2 sind 4. Krümel hat noch 4 Cent.',
          praise: 'Toll! Du hast rückwärts gezählt.',
        },
      ],
    },
  ],
};
