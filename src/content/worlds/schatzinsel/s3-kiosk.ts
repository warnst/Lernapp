import type { Station } from '@/domain/types';

// Station 3 – Kokos-Kiosk (docs/04). Texte wörtlich übernommen.
export const kiosk: Station = {
  id: 'kiosk',
  world: 'schatzinsel',
  number: 3,
  title: 'Kokos-Kiosk',
  icon: 'station-kiosk',
  skillLabel: 'Rückgeld berechnen',
  minutes: 7,
  intro: [
    'Am Kokos-Kiosk bezahlen alle mit großen Münzen und Scheinen.',
    'Dann gibt es Rückgeld. Hilfst du beim Nachzählen?',
  ],
  findling: {
    id: 'bambusfloete',
    name: 'Bambusflöte',
    text: 'Der Kiosk schenkt dir eine Bambusflöte. Tüüüt!',
  },
  recap: 'Du hast Rückgeld ausgerechnet. Der Trick: vom Preis aus weiterzählen.',
  practiceTopic: 'rueckgeld',
  tasks: [
    {
      id: 's3-t1',
      title: 'Ein Eis',
      difficulty: 1,
      authoredFor: 3,
      variant: { template: 'R2', bind: { A: 'eis' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'eis', label: 'Eis', price: 150 }],
        paidWith: [200],
      },
      story: 'Ein Eis kostet {{150}}. Du bezahlst mit einer 2-Euro-Münze.',
      parts: [
        {
          id: 's3-t1-a',
          question: 'Wie viel Rückgeld bekommst du?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: true,
            options: [
              { id: 'a', label: '{{50}}', correct: true },
              {
                id: 'b',
                label: '{{150}}',
                feedback:
                  '1,50 € ist der Preis vom Eis. Das Rückgeld ist das, was von deinen 2 € übrig bleibt.',
              },
              {
                id: 'c',
                label: '{{60}}',
                feedback:
                  'Zähle von 1,50 € in 10er-Schritten bis 2 €: 1,60, 1,70, 1,80, 1,90, 2,00.',
              },
            ],
          },
          hints: [
            'Zähle vom Preis aus weiter bis 2 €.',
            'Von 1,50 € bis 2 € fehlen noch ein paar Cent. Wie viele?',
          ],
          explanation: 'Von 1,50 € bis 2 € sind es 50 Cent. Du bekommst 50 Cent zurück.',
          praise: 'Super! Du hast vom Preis aus weitergezählt.',
        },
      ],
    },
    {
      id: 's3-t2',
      title: 'Proviant bezahlen',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'R2', stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'kokosnuss', label: 'Kokosnuss', price: 120 },
          { itemId: 'bananenbrot', label: 'Bananenbrot', price: 230 },
        ],
        paidWith: [500],
      },
      story:
        'Eine Kokosnuss und ein Bananenbrot kosten zusammen {{350}}. Du bezahlst mit einem 5-Euro-Schein.',
      parts: [
        {
          id: 's3-t2-a',
          question: 'Wie viel Rückgeld bekommst du?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: true,
            options: [
              { id: 'a', label: '{{150}}', correct: true },
              {
                id: 'b',
                label: '{{250}}',
                feedback:
                  'Zähle von 3,50 € weiter: Bis 4 € sind es 50 Cent. Bis 5 € ist es noch 1 €.',
              },
              {
                id: 'c',
                label: '{{850}}',
                feedback:
                  'Du hast zusammengezählt. Beim Rückgeld fragen wir: Wie viel bleibt von den 5 € übrig?',
              },
            ],
          },
          hints: [
            'Zähle von 3,50 € weiter bis 4 €.',
            'Von 4 € bis 5 € ist es noch 1 €. Wie viel ist es zusammen?',
          ],
          explanation:
            'Von 3,50 € bis 4 € sind es 50 Cent. Von 4 € bis 5 € ist es 1 €. Rückgeld: 50 Cent + 1 € = 1,50 €.',
        },
      ],
    },
    {
      id: 's3-t3',
      title: 'Der Strandball',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'R1', bind: { A: 'strandball' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'strandball', label: 'Strandball', price: 320 }],
        paidWith: [500],
      },
      story: 'Ben kauft einen Strandball für {{320}}. Er bezahlt mit einem 5-Euro-Schein.',
      parts: [
        {
          id: 's3-t3-a',
          question: 'Wie viel Rückgeld bekommt Ben?',
          answer: { type: 'money', correct: 180 },
          mistakes: [
            {
              value: 280,
              feedback: 'Fast! Von 3,20 € bis 4 € sind es 80 Cent. Von 4 € bis 5 € noch 1 €.',
            },
            { value: 820, feedback: 'Du hast zusammengezählt. Beim Rückgeld wird es weniger.' },
            { value: 220, feedback: 'Zähle lieber von 3,20 € aus weiter bis 5 €.' },
          ],
          hints: [
            'Zähle von 3,20 € bis 4 €. Wie viele Cent sind das?',
            'Von 3,20 € bis 4 € sind es 80 Cent. Dann noch 1 € bis 5 €.',
          ],
          explanation:
            '3,20 € + 80 Cent = 4 €. 4 € + 1 € = 5 €. Ben bekommt 80 Cent + 1 € = 1,80 € zurück.',
        },
      ],
    },
    {
      id: 's3-t4',
      title: 'Seifenblasen',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'R3', bind: { A: 'seifenblasen' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'seifenblasen', label: 'Seifenblasen', price: 130 }],
        paidWith: [200],
      },
      story: 'Mia kauft Seifenblasen für {{130}}. Sie bezahlt mit einer 2-Euro-Münze.',
      parts: [
        {
          id: 's3-t4-a',
          question: 'Lege das Rückgeld für Mia mit Münzen.',
          answer: { type: 'pay', target: 70, palette: [50, 20, 10, 5, 2, 1], showTotal: false },
          hints: [
            'Rechne zuerst aus, wie viel Rückgeld Mia bekommt: von 1,30 € bis 2 €.',
            'Mia bekommt 70 Cent. Welche Münzen ergeben 70 Cent?',
          ],
          explanation: 'Von 1,30 € bis 2 € sind es 70 Cent. Zum Beispiel: 50 Cent + 20 Cent.',
          praise: 'Prima! Genau so zählt man an der Kasse Rückgeld.',
        },
      ],
    },
    {
      id: 's3-t5',
      title: 'Stimmt das Rückgeld?',
      difficulty: 3,
      authoredFor: 3,
      variant: {
        template: 'R4',
        bind: { A: 'sonnencreme' },
        force: { stimmt: false },
        stufen: [2, 3, 4],
      },
      scene: {
        kind: 'items',
        items: [{ itemId: 'sonnencreme', label: 'Sonnencreme', price: 460 }],
        paidWith: [500],
      },
      story:
        'Ida kauft Sonnencreme für {{460}}. Sie bezahlt mit einem 5-Euro-Schein. Sie bekommt {{50}} zurück.',
      parts: [
        {
          id: 's3-t5-a',
          question: 'Stimmt das Rückgeld?',
          answer: {
            type: 'choice',
            layout: 'yesno',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: 'Ja, das stimmt',
                feedback: 'Mach die Probe: 4,60 € + 50 Cent. Sind das genau 5 €?',
              },
              { id: 'b', label: 'Nein, das stimmt nicht', correct: true },
            ],
          },
          hints: [
            'Mach die Probe: Preis + Rückgeld muss genau 5 € ergeben.',
            'Rechne 4,60 € + 50 Cent. Ist das genau 5 €?',
          ],
          explanation:
            '4,60 € + 50 Cent = 5,10 €. Das ist mehr als 5 €. Ida hat 10 Cent zu viel bekommen.',
        },
        {
          id: 's3-t5-b',
          question: 'Wie viel Rückgeld muss Ida bekommen?',
          answer: { type: 'money', correct: 40 },
          mistakes: [
            { value: 140, feedback: 'Von 4,60 € bis 5 € ist es weniger als ein Euro.' },
            {
              value: 60,
              feedback: 'Mit 60 Cent wären es 5,20 €. Zähle von 4,60 € nur bis 5 €.',
            },
          ],
          hints: [
            'Zähle von 4,60 € bis 5 €.',
            '4,70, 4,80, 4,90, 5,00. Wie viele 10-Cent-Schritte sind das?',
          ],
          explanation: 'Von 4,60 € bis 5 € sind es 40 Cent.',
          praise: 'Prima! Erst mit der Probe geprüft, dann richtig gerechnet.',
        },
      ],
    },
  ],
};
