import type { Station } from '@/domain/types';

// Station 2 – Markt am Palmenstrand (docs/04). Texte wörtlich übernommen.
export const markt: Station = {
  id: 'markt',
  world: 'schatzinsel',
  number: 2,
  title: 'Markt am Palmenstrand',
  icon: 'station-markt',
  skillLabel: 'Preise zusammenrechnen',
  minutes: 7,
  intro: [
    'Auf dem Markt duftet es nach Kokos und frischem Brot.',
    'Hier kaufen wir Proviant für unsere Reise. Rechnest du die Preise aus?',
  ],
  findling: {
    id: 'strohhut',
    name: 'Strohhut',
    text: 'Die Marktfrau schenkt dir einen Strohhut. Jetzt bist du gut gegen die Sonne geschützt.',
  },
  recap: 'Du hast Preise zusammengerechnet.',
  practiceTopic: 'preise-addieren',
  tasks: [
    {
      id: 's2-t1',
      title: 'Kokosnuss und Bananenbrot',
      difficulty: 1,
      authoredFor: 3,
      variant: { template: 'A1', bind: { A: 'kokosnuss', B: 'bananenbrot' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'kokosnuss', label: 'Kokosnuss', price: 120 },
          { itemId: 'bananenbrot', label: 'Bananenbrot', price: 230 },
        ],
      },
      story: 'Eine Kokosnuss kostet {{120}}. Ein Bananenbrot kostet {{230}}.',
      parts: [
        {
          id: 's2-t1-a',
          question: 'Wie viel kosten beide zusammen?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: true,
            options: [
              { id: 'a', label: '{{350}}', correct: true },
              { id: 'b', label: '{{450}}', feedback: 'Schau auf die Euro: 1 € + 2 € sind 3 €.' },
              {
                id: 'c',
                label: '{{305}}',
                feedback: '20 Cent + 30 Cent sind 50 Cent. Wie schreibt man 3 Euro und 50 Cent?',
              },
            ],
          },
          hints: ['Rechne zuerst die Euro: 1 € + 2 €.', 'Jetzt kommen 20 Cent + 30 Cent dazu.'],
          explanation: '1 € + 2 € = 3 €. 20 Cent + 30 Cent = 50 Cent. Zusammen sind das 3,50 €.',
          praise: 'Toller Rechenweg: Du hast zuerst die Euro und dann die Cent gerechnet.',
        },
      ],
    },
    {
      id: 's2-t2',
      title: 'Wasser und Fischbrötchen',
      difficulty: 2,
      authoredFor: 3,
      variant: {
        template: 'A1',
        bind: { A: 'wasser', B: 'fischbroetchen' },
        force: { einPreisUnterEinemEuro: true },
        stufen: [3, 4],
      },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'wasser', label: 'Wasser', price: 80 },
          { itemId: 'fischbroetchen', label: 'Fischbrötchen', price: 210 },
        ],
      },
      story: 'Eine Flasche Wasser kostet {{80}}. Ein Fischbrötchen kostet {{210}}.',
      parts: [
        {
          id: 's2-t2-a',
          question: 'Wie viel kostet beides zusammen?',
          answer: { type: 'money', correct: 290 },
          mistakes: [
            {
              value: 218,
              feedback: '80 Cent sind 80 Cent, nicht 8 Cent. Rechne 10 Cent + 80 Cent.',
            },
            {
              value: 390,
              feedback: 'Das Wasser kostet weniger als 1 Euro. Es bleibt bei 2 Euro.',
            },
          ],
          hints: [
            'Beim Wasser gibt es keine ganzen Euro, nur 80 Cent.',
            'Das Fischbrötchen kostet 2 € und 10 Cent. Rechne 10 Cent + 80 Cent.',
          ],
          explanation: '2,10 € + 80 Cent = 2,90 €, denn 10 Cent + 80 Cent = 90 Cent.',
        },
      ],
    },
    {
      id: 's2-t3',
      title: 'Genau 3 Euro',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'A5', force: { count: 2 }, stufen: [2, 3, 4] },
      scene: { kind: 'none' },
      story: 'Kiko hat genau {{300}}. Er möchte zwei Sachen kaufen. Es soll nichts übrig bleiben.',
      parts: [
        {
          id: 's2-t3-a',
          question: 'Wähle zwei Sachen, die zusammen genau 3 € kosten.',
          answer: {
            type: 'select',
            items: [
              { itemId: 'kokosnuss', label: 'Kokosnuss', price: 120 },
              { itemId: 'mango', label: 'Mango', price: 180 },
              { itemId: 'eis', label: 'Eis', price: 150 },
              { itemId: 'saft', label: 'Saft', price: 140 },
              { itemId: 'muffin', label: 'Muffin', price: 160 },
            ],
            rule: { kind: 'sum', count: 2, target: 300 },
          },
          hints: [
            'Die Cent müssen zusammen genau einen Euro ergeben. Schau auf die Cent hinter dem Komma.',
            'Probier es mit der Kokosnuss für 1,20 €. Welche Sache passt dazu?',
          ],
          explanation:
            'Kokosnuss und Mango: 1,20 € + 1,80 € = 3 €. Es geht auch mit Saft und Muffin: 1,40 € + 1,60 € = 3 €.',
          praise: 'Stimmt genau! Übrigens gibt es noch eine zweite Lösung. Findest du sie?',
        },
      ],
    },
    {
      id: 's2-t4',
      title: 'Melone und Keks',
      difficulty: 2,
      authoredFor: 3,
      variant: {
        template: 'A1',
        bind: { A: 'melone', B: 'kokoskeks' },
        force: { carry: true },
        stufen: [2, 3, 4],
      },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'melone', label: 'Melone', price: 160 },
          { itemId: 'kokoskeks', label: 'Kokoskeks', price: 70 },
        ],
      },
      story: 'Ein Stück Melone kostet {{160}}. Ein Kokoskeks kostet {{70}}.',
      parts: [
        {
          id: 's2-t4-a',
          question: 'Wie viel kostet beides zusammen?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: true,
            options: [
              { id: 'a', label: '{{230}}', correct: true },
              {
                id: 'b',
                label: '{{130}}',
                feedback:
                  '60 Cent + 70 Cent sind 130 Cent. Das ist mehr als 1 Euro! Dazu kommt noch der Euro von der Melone.',
              },
              { id: 'c', label: '{{220}}', feedback: 'Rechne die Cent noch einmal: 60 + 70.' },
            ],
          },
          hints: [
            '60 Cent + 70 Cent sind mehr als 100 Cent.',
            '130 Cent sind 1 € und 30 Cent. Jetzt kommt noch der Euro von der Melone dazu.',
          ],
          explanation: '60 Cent + 70 Cent = 130 Cent = 1,30 €. Dazu 1 € von der Melone: 2,30 €.',
          praise: 'Klasse! Du hast gemerkt, dass aus 100 Cent ein Euro wird.',
        },
      ],
    },
    {
      id: 's2-t5',
      title: 'Bananen und Saft',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'A6', bind: { A: 'banane', B: 'saft' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'banane', label: 'Banane', price: 40, quantity: 3 }],
      },
      story: 'Lina kauft drei Bananen. Eine Banane kostet {{40}}.',
      parts: [
        {
          id: 's2-t5-a',
          question: 'Wie viel kosten drei Bananen?',
          answer: { type: 'money', correct: 120 },
          mistakes: [
            { value: 80, feedback: 'Das sind erst zwei Bananen. Lina kauft drei.' },
            { value: 160, feedback: 'Das wären vier Bananen. Lina kauft drei.' },
          ],
          hints: ['Rechne 40 Cent + 40 Cent + 40 Cent.', '40, 80 … wie geht es weiter?'],
          explanation: '40 + 40 + 40 = 120 Cent. Das sind 1,20 €.',
        },
        {
          id: 's2-t5-b',
          lead: 'Dazu kauft Lina noch einen Saft für {{145}}.',
          question: 'Wie viel muss Lina jetzt insgesamt bezahlen?',
          answer: { type: 'money', correct: 265 },
          mistakes: [
            {
              value: 185,
              feedback: 'Du hast nur eine Banane gerechnet. Nimm das Ergebnis aus Teil a: 1,20 €.',
            },
            { value: 145, feedback: 'Das ist nur der Saft. Die Bananen kommen noch dazu.' },
          ],
          hints: [
            'Nimm das Ergebnis aus Teil a: 1,20 €. Dazu kommen 1,45 €.',
            '1 € + 1 € = 2 €. 20 Cent + 45 Cent = 65 Cent.',
          ],
          explanation: '1,20 € + 1,45 € = 2,65 €.',
          praise: 'Stark! Du hast zwei Rechenschritte hintereinander gelöst.',
        },
      ],
    },
  ],
};
