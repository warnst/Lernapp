import type { Station } from '@/domain/types';

// Station 3 – Kikos kleiner Laden (docs/11). Texte wörtlich übernommen.
export const kikosLaden: Station = {
  id: 'kikos-laden',
  world: 'kleine-bucht',
  number: 3,
  title: 'Kikos kleiner Laden',
  icon: 'station-kikos-laden',
  skillLabel: 'Mit Cent bezahlen',
  minutes: 6,
  intro: ['Willkommen in meinem kleinen Laden!', 'Hier kostet alles nur ein paar Cent.'],
  findling: {
    id: 'kleiner-eimer',
    name: 'Kleiner Eimer',
    text: 'Kiko schenkt dir einen kleinen Eimer. Da passen alle deine Schätze hinein!',
  },
  recap: 'Du hast mit Cent bezahlt.',
  practiceTopic: 'preise-addieren',
  tasks: [
    {
      id: 'b3-t1',
      title: 'Ein Bonbon',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'L1' },
      scene: { kind: 'items', items: [{ itemId: 'bonbon', label: 'Bonbon', price: 3 }] },
      story: 'Ein Bonbon kostet {{3}}.',
      parts: [
        {
          id: 'b3-t1-a',
          question: 'Lege 3 Cent auf das Tablett.',
          answer: { type: 'pay', target: 3, palette: [1, 2], showTotal: true },
          hints: [
            'Auf jeder Münze steht, wie viel Cent sie wert ist.',
            'Lege Münzen, bis auf dem Tablett 3 Cent stehen.',
          ],
          explanation:
            '1 Cent und 1 Cent und 1 Cent sind 3 Cent. Oder: 2 Cent und 1 Cent sind 3 Cent.',
        },
      ],
    },
    {
      id: 'b3-t2',
      title: 'Ein Lolli',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'L1', force: { exactCount: 1 } },
      scene: { kind: 'items', items: [{ itemId: 'lolli', label: 'Lolli', price: 5 }] },
      story: 'Ein Lolli kostet {{5}}.',
      parts: [
        {
          id: 'b3-t2-a',
          question: 'Lege 5 Cent mit nur einer Münze.',
          answer: { type: 'pay', target: 5, palette: [1, 2, 5], showTotal: true, exactCount: 1 },
          hints: ['Schau dir die Zahlen auf den Münzen an.', 'Auf einer Münze steht eine 5.'],
          explanation: 'Die 5-Cent-Münze. Eine Münze, 5 Cent.',
        },
      ],
    },
    {
      id: 'b3-t3',
      title: 'Bonbon und Kaugummi',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'A1' },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'bonbon', label: 'Bonbon', price: 3 },
          { itemId: 'kaugummi', label: 'Kaugummi', price: 2 },
        ],
      },
      story: 'Ein Bonbon kostet {{3}}. Ein Kaugummi kostet {{2}}.',
      parts: [
        {
          id: 'b3-t3-a',
          question: 'Wie viel kosten beide zusammen?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: false,
            options: [
              { id: 'a', label: '{{4}}', feedback: 'Zähle noch einmal: 3 und 2.' },
              { id: 'b', label: '{{5}}', correct: true },
              { id: 'c', label: '{{6}}', feedback: 'Zähle noch einmal: 3 und 2.' },
            ],
          },
          hints: ['Halte 3 Finger hoch. Dann noch 2 Finger.', 'Zähle alle Finger.'],
          explanation: '3 Cent und 2 Cent sind 5 Cent.',
        },
      ],
    },
    {
      id: 'b3-t4',
      title: 'Reicht es für den Keks?',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'G1', force: { reicht: true, inDerHand: true } },
      scene: {
        kind: 'items',
        items: [{ itemId: 'keks', label: 'Keks', price: 4 }],
        hand: [5],
      },
      story: 'Du hast {{5}}. Ein Keks kostet {{4}}.',
      parts: [
        {
          id: 'b3-t4-a',
          question: 'Reicht dein Geld?',
          answer: {
            type: 'choice',
            layout: 'yesno',
            shuffle: false,
            options: [
              { id: 'a', label: 'Ja', correct: true },
              { id: 'b', label: 'Nein', feedback: '5 ist mehr als 4. Dein Geld reicht!' },
            ],
          },
          hints: [
            'Was ist mehr: 5 oder 4?',
            'Hast du genauso viel oder mehr Geld, dann reicht es.',
          ],
          explanation: 'Du hast 5 Cent. Der Keks kostet 4 Cent. 5 ist mehr als 4. Es reicht.',
        },
      ],
    },
    {
      id: 'b3-t5',
      title: 'Der Apfel',
      difficulty: 2,
      authoredFor: 1,
      variant: {
        template: 'G1',
        force: { reicht: false, inDerHand: true, zweiteilig: true },
      },
      scene: {
        kind: 'items',
        items: [{ itemId: 'apfel', label: 'Apfel', price: 6 }],
        hand: [5],
      },
      story: 'Du hast {{5}}. Ein Apfel kostet {{6}}.',
      parts: [
        {
          id: 'b3-t5-a',
          question: 'Reicht dein Geld für den Apfel?',
          answer: {
            type: 'choice',
            layout: 'yesno',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: 'Ja',
                feedback: 'Der Apfel kostet 6 Cent. Du hast nur 5 Cent.',
              },
              { id: 'b', label: 'Nein', correct: true },
            ],
          },
          hints: ['Was ist mehr: 5 oder 6?', 'Der Apfel kostet mehr, als du hast.'],
          explanation: '6 ist mehr als 5. Das Geld reicht nicht.',
        },
        {
          id: 'b3-t5-b',
          question: 'Wie viel Cent fehlen dir?',
          answer: { type: 'number', correct: 1 },
          mistakes: [
            { value: 2, feedback: 'Zähle von 5 weiter bis 6. Wie viele Schritte sind das?' },
          ],
          hints: ['Zähle von 5 bis 6.', 'Fünf … sechs. Das ist ein Schritt.'],
          explanation: 'Von 5 bis 6 ist es 1. Dir fehlt 1 Cent.',
          praise: 'Super! Du hast herausgefunden, was fehlt.',
        },
      ],
    },
  ],
};
