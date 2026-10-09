import type { Station } from '@/domain/types';

// Station 5 – Tante Pollys Laden (docs/04). Texte wörtlich übernommen.
export const pollysLaden: Station = {
  id: 'pollys-laden',
  world: 'schatzinsel',
  number: 5,
  title: 'Tante Pollys Laden',
  icon: 'station-laden',
  skillLabel: 'Prüfen, ob das Geld reicht',
  minutes: 8,
  intro: [
    'Das ist der Laden von meiner Tante Polly! Hier gibt es Federn, Pfeifen und Postkarten.',
    'Bevor wir etwas kaufen, prüfen wir: Reicht unser Geld?',
  ],
  findling: {
    id: 'bunte-feder',
    name: 'Bunte Feder',
    text: 'Tante Polly schenkt dir eine bunte Feder. Sie lacht: ‚Die hat Kiko extra für dich verloren!‘',
  },
  recap: 'Du hast geprüft, ob das Geld reicht, und Beträge verglichen.',
  practiceTopic: 'reicht-das-geld',
  tasks: [
    {
      id: 's5-t1',
      title: 'Ein Saft',
      difficulty: 2,
      authoredFor: 3,
      variant: {
        template: 'G1',
        bind: { A: 'saft' },
        force: { genau: true, inDerHand: true },
        stufen: [2, 3, 4],
      },
      scene: {
        kind: 'items',
        items: [{ itemId: 'saft', label: 'Saft', price: 145 }],
        hand: [100, 20, 20, 5],
      },
      story:
        'Ein Saft kostet {{145}}. Du hast eine 1-Euro-Münze, zwei 20-Cent-Münzen und eine 5-Cent-Münze.',
      parts: [
        {
          id: 's5-t1-a',
          question: 'Reicht dein Geld genau für den Saft?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: false,
            options: [
              { id: 'a', label: 'Ja, genau', correct: true },
              {
                id: 'b',
                label: 'Nein, es fehlt Geld',
                feedback: 'Zähle dein Geld noch einmal: 1 € + 20 Cent + 20 Cent + 5 Cent.',
              },
              {
                id: 'c',
                label: 'Es bleibt Geld übrig',
                feedback: 'Zähle dein Geld noch einmal: 1 € + 20 Cent + 20 Cent + 5 Cent.',
              },
            ],
          },
          hints: [
            'Zähle dein Geld zusammen. Fang mit dem Euro an.',
            '1 € + 40 Cent + 5 Cent. Wie viel ist das?',
          ],
          explanation: '1 € + 20 Cent + 20 Cent + 5 Cent = 1,45 €. Das ist genau der Preis.',
        },
      ],
    },
    {
      id: 's5-t2',
      title: 'Das Preisschild',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'Z5', stufen: [3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'postkarte', label: 'Postkarte', price: 85, priceFormat: 'eur' }],
      },
      story: 'Auf dem Preisschild einer Postkarte steht 0,85 €.',
      parts: [
        {
          id: 's5-t2-a',
          question: 'Wie viel ist das?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: true,
            options: [
              { id: 'a', label: '85 Cent', correct: true },
              {
                id: 'b',
                label: '8,50 €',
                feedback:
                  'Vor dem Komma steht eine 0. Das heißt: 0 Euro. 8,50 € wären mehr als 8 Euro!',
              },
              {
                id: 'c',
                label: '85 €',
                feedback: 'Hinter dem Komma stehen die Cent. Vor dem Komma steht 0 Euro.',
              },
            ],
          },
          hints: [
            'Vor dem Komma stehen die Euro, hinter dem Komma die Cent.',
            'Vor dem Komma steht eine 0. Wie viele Cent stehen dahinter?',
          ],
          explanation: '0,85 € heißt: 0 Euro und 85 Cent. Also 85 Cent.',
          praise: 'Genau! Du kannst Preisschilder lesen.',
        },
      ],
    },
    {
      id: 's5-t3',
      title: 'Was kann ich mir leisten?',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'G3', stufen: [2, 3, 4] },
      scene: { kind: 'none' },
      story: 'Du hast {{200}}. Du möchtest dir eine Sache aussuchen.',
      parts: [
        {
          id: 's5-t3-a',
          question: 'Tippe alle Sachen an, für die deine 2 € reichen.',
          answer: {
            type: 'select',
            items: [
              { itemId: 'federstift', label: 'Federstift', price: 190 },
              { itemId: 'vogelpfeife', label: 'Vogelpfeife', price: 210 },
              { itemId: 'postkarte', label: 'Postkarte', price: 85 },
              { itemId: 'stickerheft', label: 'Stickerheft', price: 200 },
              { itemId: 'muschelkette', label: 'Muschelkette', price: 250 },
            ],
            rule: { kind: 'affordable', budget: 200 },
          },
          hints: [
            'Schau bei jedem Preis zuerst auf die Euro.',
            'Alles, was weniger als 2 € kostet, reicht. Und genau 2 € reicht auch.',
          ],
          explanation:
            'Federstift (1,90 €), Postkarte (85 Cent) und Stickerheft (2 €) kannst du kaufen. Die Vogelpfeife und die Muschelkette kosten mehr als 2 €.',
          praise: 'Super! Du hast an das Stickerheft für genau 2 € gedacht.',
        },
      ],
    },
    {
      id: 's5-t4',
      title: 'Emil und Mara',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'G4', force: { zweiteilig: true }, stufen: [2, 3, 4] },
      scene: {
        kind: 'people',
        people: [
          { name: 'Emil', amount: 340 },
          { name: 'Mara', amount: 430 },
        ],
      },
      story: 'Emil hat {{340}}. Mara hat {{430}}.',
      parts: [
        {
          id: 's5-t4-a',
          question: 'Wer hat mehr Geld?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: 'Emil',
                feedback: 'Schau zuerst auf die Euro: Emil hat 3 Euro, Mara hat 4 Euro.',
              },
              { id: 'b', label: 'Mara', correct: true },
              {
                id: 'c',
                label: 'Beide gleich viel',
                feedback:
                  'Die Zahlen sehen ähnlich aus, aber sie sind verschieden. Vergleiche die Euro.',
              },
            ],
          },
          hints: ['Vergleiche zuerst die Euro vor dem Komma.', '3 Euro oder 4 Euro: Was ist mehr?'],
          explanation: 'Mara hat 4,30 €, Emil hat 3,40 €. 4 Euro sind mehr als 3 Euro.',
        },
        {
          id: 's5-t4-b',
          question: 'Wie viel Geld hat Mara mehr als Emil?',
          answer: { type: 'money', correct: 90 },
          mistakes: [
            {
              value: 110,
              feedback: 'Rechne nicht Euro und Cent getrennt. Zähle von 3,40 € weiter bis 4,30 €.',
            },
            { value: 770, feedback: 'Du hast zusammengezählt. Gesucht ist der Unterschied.' },
          ],
          hints: [
            'Zähle von 3,40 € bis 4 €.',
            'Von 3,40 € bis 4 € sind es 60 Cent. Von 4 € bis 4,30 € noch 30 Cent.',
          ],
          explanation: '60 Cent + 30 Cent = 90 Cent. Mara hat 90 Cent mehr.',
          praise: 'Toll! Weiterzählen klappt auch beim Vergleichen.',
        },
      ],
    },
    {
      id: 's5-t5',
      title: 'Fernglas und Hut',
      difficulty: 3,
      authoredFor: 3,
      variant: {
        template: 'G2',
        bind: { A: 'fernglas', B: 'hut' },
        force: { reicht: false },
        stufen: [2, 3, 4],
      },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'fernglas', label: 'Fernglas', price: 380 },
          { itemId: 'hut', label: 'Hut', price: 150 },
        ],
        hand: [500],
      },
      story:
        'Paul hat {{500}}. Er möchte ein Fernglas für {{380}} und einen Hut für {{150}} kaufen.',
      parts: [
        {
          id: 's5-t5-a',
          question: 'Reicht Pauls Geld für beides?',
          answer: {
            type: 'choice',
            layout: 'yesno',
            shuffle: false,
            options: [
              {
                id: 'a',
                label: 'Ja, es reicht',
                feedback: 'Rechne zuerst aus, was beides zusammen kostet: 3,80 € + 1,50 €.',
              },
              { id: 'b', label: 'Nein, es reicht nicht', correct: true },
            ],
          },
          hints: [
            'Rechne aus, was beides zusammen kostet.',
            '3 € + 1 € = 4 €. 80 Cent + 50 Cent = 130 Cent = 1,30 €.',
          ],
          explanation: '3,80 € + 1,50 € = 5,30 €. Das ist mehr als 5 €.',
        },
        {
          id: 's5-t5-b',
          question: 'Wie viel Geld fehlt Paul?',
          answer: { type: 'money', correct: 30 },
          mistakes: [
            {
              value: 530,
              feedback: '5,30 € kostet alles zusammen. Wie viel fehlt von 5 € bis 5,30 €?',
            },
          ],
          hints: [
            'Paul hat 5 €. Alles zusammen kostet 5,30 €.',
            'Von 5 € bis 5,30 €: Wie viele Cent sind das?',
          ],
          explanation: 'Von 5 € bis 5,30 € sind es 30 Cent. Paul fehlen 30 Cent.',
        },
      ],
    },
  ],
};
