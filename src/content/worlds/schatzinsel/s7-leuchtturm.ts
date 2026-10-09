import type { Station } from '@/domain/types';

// Station 7 – Der Leuchtturm (docs/04). Texte wörtlich übernommen.
export const leuchtturm: Station = {
  id: 'leuchtturm',
  world: 'schatzinsel',
  number: 7,
  title: 'Der Leuchtturm',
  icon: 'station-leuchtturm',
  skillLabel: 'Mehrere Einkäufe planen',
  minutes: 9,
  intro: [
    'Oben auf dem Felsen steht ein Leuchtturm. Hier wohnt Frida, die Leuchtturmwärterin.',
    'Frida braucht Vorräte für die Nacht. Gehst du für sie einkaufen?',
  ],
  findling: {
    id: 'fernrohr',
    name: 'Fernrohr',
    text: 'Frida schenkt dir ein Fernrohr. Damit kannst du schon die Piratenhöhle sehen!',
  },
  recap: 'Du hast mehrere Einkäufe zusammengerechnet und dein Geld eingeteilt.',
  practiceTopic: 'sachaufgaben',
  tasks: [
    {
      id: 's7-t1',
      title: 'Drei Kerzen',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'A3', bind: { A: 'kerze' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'kerze', label: 'Kerze', price: 60, quantity: 3 }],
      },
      story: 'Frida braucht drei Kerzen. Eine Kerze kostet {{60}}.',
      parts: [
        {
          id: 's7-t1-a',
          question: 'Wie viel kosten drei Kerzen?',
          answer: { type: 'money', correct: 180 },
          mistakes: [
            { value: 120, feedback: 'Das sind erst zwei Kerzen. Frida braucht drei.' },
            { value: 63, feedback: 'Du hast 60 + 3 gerechnet. Nimm 60 Cent dreimal.' },
          ],
          hints: [
            'Rechne 60 Cent + 60 Cent + 60 Cent.',
            '60 + 60 = 120. Und dann noch einmal 60 dazu.',
          ],
          explanation: '60 + 60 + 60 = 180 Cent. Das sind 1,80 €.',
        },
      ],
    },
    {
      id: 's7-t2',
      title: 'Kein Geld übrig',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'A5', force: { count: 3 }, stufen: [3, 4] },
      scene: { kind: 'coins', pieces: [500], label: 'Von Frida' },
      story:
        'Frida gibt dir einen 5-Euro-Schein. Du sollst drei Sachen kaufen. Es soll kein Geld übrig bleiben.',
      parts: [
        {
          id: 's7-t2-a',
          question: 'Wähle drei Sachen, die zusammen genau 5 € kosten.',
          answer: {
            type: 'select',
            items: [
              { itemId: 'brot', label: 'Brot', price: 220 },
              { itemId: 'kaese', label: 'Käse', price: 180 },
              { itemId: 'tee', label: 'Tee', price: 100 },
              { itemId: 'streichhoelzer', label: 'Streichhölzer', price: 50 },
              { itemId: 'aepfel', label: 'Äpfel', price: 150 },
              { itemId: 'honig', label: 'Honig', price: 230 },
            ],
            rule: { kind: 'sum', count: 3, target: 500 },
          },
          hints: [
            'Fang mit dem Brot an. Dann fehlen noch 2,80 €.',
            'Welche zwei Sachen kosten zusammen 2,80 €? Schau dir Käse und Tee an.',
          ],
          explanation:
            'Brot, Käse und Tee: 2,20 € + 1,80 € + 1 € = 5 €. Es geht auch mit Brot, Streichhölzern und Honig: 2,20 € + 50 Cent + 2,30 € = 5 €.',
          praise: 'Toll geplant! Kein Cent bleibt übrig.',
        },
      ],
    },
    {
      id: 's7-t3',
      title: 'Lampenöl und Decke',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'S1', bind: { A: 'lampenoel', B: 'decke' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'lampenoel', label: 'Lampenöl', price: 450 },
          { itemId: 'decke', label: 'Decke', price: 320 },
        ],
        paidWith: [1000],
      },
      story:
        'Frida hat einen 10-Euro-Schein. Sie kauft Lampenöl für {{450}} und eine warme Decke für {{320}}.',
      parts: [
        {
          id: 's7-t3-a',
          question: 'Wie viel kostet beides zusammen?',
          answer: { type: 'money', correct: 770 },
          mistakes: [
            {
              value: 130,
              feedback: 'Du hast abgezogen. Frida kauft beides, also rechnen wir plus.',
            },
            { value: 870, feedback: 'Zähle die Euro noch einmal: 4 € + 3 €.' },
          ],
          hints: ['4 € + 3 € = 7 €.', 'Jetzt die Cent: 50 + 20.'],
          explanation: '4,50 € + 3,20 € = 7,70 €.',
        },
        {
          id: 's7-t3-b',
          question: 'Wie viel Rückgeld bekommt Frida?',
          answer: { type: 'money', correct: 230 },
          mistakes: [
            {
              value: 330,
              feedback: 'Von 7,70 € bis 8 € sind es 30 Cent. Dann bis 10 € noch 2 €.',
            },
            {
              value: 1770,
              feedback: 'Du hast zusammengezählt. Beim Rückgeld bleibt etwas übrig.',
            },
          ],
          hints: [
            'Zähle von 7,70 € bis 8 €.',
            'Von 7,70 € bis 8 € sind es 30 Cent. Von 8 € bis 10 € sind es noch 2 €.',
          ],
          explanation: '30 Cent + 2 € = 2,30 €. Frida bekommt 2,30 € zurück.',
        },
      ],
    },
    {
      id: 's7-t4',
      title: 'Der Einkaufszettel',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'O1', stufen: [2, 3, 4] },
      scene: { kind: 'none' },
      story: 'Auf Fridas Einkaufszettel stehen vier Sachen mit Preisen.',
      parts: [
        {
          id: 's7-t4-a',
          question: 'Tippe sie der Reihe nach an. Fang mit der billigsten Sache an.',
          answer: {
            type: 'order',
            direction: 'asc',
            entries: [
              { id: 'seil', label: 'Seil', value: 205, itemId: 'seil' },
              { id: 'laterne', label: 'Laterne', value: 250, itemId: 'laterne' },
              { id: 'fisch', label: 'Fisch', value: 215, itemId: 'fisch' },
              { id: 'eimer', label: 'Eimer', value: 195, itemId: 'eimer' },
            ],
          },
          hints: [
            'Vergleiche zuerst die Euro vor dem Komma.',
            'Haben zwei Preise gleich viele Euro, vergleichst du die Cent.',
          ],
          explanation:
            'Der Eimer (1,95 €) ist am billigsten. Dann kommen Seil (2,05 €), Fisch (2,15 €) und Laterne (2,50 €).',
          praise: 'Klasse! Erst die Euro, dann die Cent vergleichen.',
        },
      ],
    },
    {
      id: 's7-t5',
      title: 'Ungefähr reicht',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'UE1', bind: { A: 'kekse', B: 'marmelade' }, stufen: [3, 4] },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'kekse', label: 'Kekse', price: 190 },
          { itemId: 'marmelade', label: 'Marmelade', price: 295 },
        ],
      },
      story: 'Frida kauft eine Tüte Kekse für {{190}} und ein Glas Marmelade für {{295}}.',
      parts: [
        {
          id: 's7-t5-a',
          question: 'Ungefähr wie viel kostet beides? Du musst nicht genau rechnen.',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: 'ungefähr 3 €',
                feedback: '1,90 € ist schon fast 2 €. Und 2,95 € ist fast 3 €.',
              },
              { id: 'b', label: 'ungefähr 5 €', correct: true },
              {
                id: 'c',
                label: 'ungefähr 10 €',
                feedback:
                  'Beide Sachen kosten weniger als 3 €. Zusammen können es keine 10 € sein.',
              },
            ],
          },
          hints: [
            'Runde die Preise. 1,90 € ist fast …?',
            '1,90 € ist fast 2 €. 2,95 € ist fast 3 €.',
          ],
          explanation: 'Ungefähr 2 € + 3 € = 5 €. Ganz genau sind es 4,85 €.',
          praise: 'Gut geschätzt! Überschlagen hilft beim Einkaufen.',
        },
      ],
    },
  ],
};
