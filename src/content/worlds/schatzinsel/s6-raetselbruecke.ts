import type { Station } from '@/domain/types';

// Station 6 – Die Rätselbrücke (docs/04). Texte wörtlich übernommen.
export const raetselbruecke: Station = {
  id: 'raetselbruecke',
  world: 'schatzinsel',
  number: 6,
  title: 'Die Rätselbrücke',
  icon: 'station-bruecke',
  skillLabel: 'Sachaufgaben verstehen und prüfen',
  minutes: 9,
  intro: [
    'Über die Schlucht führt eine wackelige Brücke. Hier wohnt die Krabbe Kalle.',
    'Kalle ruft: „Nur wer meine Rätsel löst, darf hinüber!“',
  ],
  findling: {
    id: 'kompass',
    name: 'Kompass',
    text: 'Kalle ist beeindruckt und schenkt dir einen Kompass. Jetzt findest du immer den Weg.',
  },
  recap: 'Du hast Sachaufgaben genau gelesen und Rechnungen geprüft.',
  practiceTopic: 'sachaufgaben',
  tasks: [
    {
      id: 's6-t1',
      title: 'Mia und Ben legen zusammen',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'A7', stufen: [2, 3, 4] },
      scene: {
        kind: 'people',
        people: [
          { name: 'Mia', amount: 250 },
          { name: 'Ben', amount: 180 },
        ],
      },
      story: 'Mia und Ben legen ihr Geld zusammen. Mia hat {{250}}. Ben hat {{180}}.',
      parts: [
        {
          id: 's6-t1-a',
          question: 'Wie viel Geld haben beide zusammen?',
          answer: { type: 'money', correct: 430 },
          mistakes: [
            {
              value: 330,
              feedback: '50 Cent + 80 Cent sind mehr als 1 €. Vergiss den Euro aus den Cent nicht.',
            },
            {
              value: 70,
              feedback: 'Du hast abgezogen. Mia und Ben legen zusammen, also rechnen wir plus.',
            },
          ],
          hints: [
            '2 € + 1 € = 3 €. Jetzt die Cent: 50 + 80.',
            '50 Cent + 80 Cent = 130 Cent. Das ist 1 € und 30 Cent.',
          ],
          explanation: '2,50 € + 1,80 € = 4,30 €.',
        },
      ],
    },
    {
      id: 's6-t2',
      title: 'Das Muschel-Armband',
      difficulty: 3,
      authoredFor: 3,
      variant: {
        template: 'R4',
        bind: { A: 'muschelarmband' },
        force: { stimmt: true },
        stufen: [2, 3, 4],
      },
      scene: {
        kind: 'items',
        items: [{ itemId: 'muschelarmband', label: 'Muschel-Armband', price: 275 }],
        paidWith: [500],
      },
      story:
        'Lea kauft ein Muschel-Armband für {{275}}. Sie bezahlt mit einem 5-Euro-Schein und bekommt {{225}} zurück.',
      parts: [
        {
          id: 's6-t2-a',
          question: 'Stimmt das Rückgeld?',
          answer: {
            type: 'choice',
            layout: 'yesno',
            shuffle: false,
            options: [
              { id: 'a', label: 'Ja, das stimmt', correct: true },
              {
                id: 'b',
                label: 'Nein, das stimmt nicht',
                feedback: 'Mach die Probe: Preis + Rückgeld. Rechne 2,75 € + 2,25 €.',
              },
            ],
          },
          hints: [
            'Mach die Probe: Rechne Preis + Rückgeld.',
            '75 Cent + 25 Cent = 1 €. Und 2 € + 2 € = 4 €.',
          ],
          explanation: '2,75 € + 2,25 € = 5 €. Das Rückgeld stimmt.',
          praise: 'Genau! Mit der Probe hast du es sicher geprüft.',
        },
      ],
    },
    {
      id: 's6-t3',
      title: 'Die richtige Frage',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'S3', bind: { A: 'eis' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'eis', label: 'Eis', price: 150 }],
        hand: [200, 200],
      },
      story: 'Noah hat {{400}}. Er kauft ein Eis für {{150}}.',
      parts: [
        {
          id: 's6-t3-a',
          question: 'Kalle fragt: „Welche Frage kannst du mit dieser Geschichte beantworten?“',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: true,
            options: [
              { id: 'a', label: 'Wie viel Geld hat Noah noch?', correct: true },
              {
                id: 'b',
                label: 'Wie viel Geld hat Noahs Schwester?',
                feedback: 'Von Noahs Schwester steht nichts in der Geschichte.',
              },
              {
                id: 'c',
                label: 'Wie alt ist Noah?',
                feedback: 'Das steht nicht in der Geschichte. Hier geht es um Geld!',
              },
            ],
          },
          hints: [
            'Lies die Geschichte noch einmal. Was wissen wir über Noah?',
            'Wir wissen, wie viel Geld Noah hat und was er kauft.',
          ],
          explanation:
            'Noah hat 4 € und gibt 1,50 € aus. Also können wir ausrechnen, wie viel er noch hat.',
        },
        {
          id: 's6-t3-b',
          question: 'Wie viel Geld hat Noah noch?',
          answer: { type: 'money', correct: 250 },
          mistakes: [
            { value: 550, feedback: 'Noah gibt Geld aus. Dann hat er weniger, nicht mehr.' },
            { value: 350, feedback: 'Zähle noch einmal von 1,50 € bis 4 €.' },
          ],
          hints: [
            'Rechne 4 € − 1,50 €.',
            'Von 1,50 € bis 2 € sind es 50 Cent. Von 2 € bis 4 € noch 2 €.',
          ],
          explanation: '4 € − 1,50 € = 2,50 €. Noah hat noch 2,50 €.',
          praise: 'Super! Erst verstehen, dann rechnen.',
        },
      ],
    },
    {
      id: 's6-t4',
      title: 'Kalles Seil',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'S2', bind: { A: 'seil' }, stufen: [2, 3, 4] },
      scene: {
        kind: 'items',
        items: [{ itemId: 'seil', label: 'Seil', price: 240 }],
        hand: [200, 100],
        decor: { itemId: 'muschel', count: 7 },
      },
      story: 'Kalle hat 7 Muscheln und {{300}}. Er kauft ein Seil für {{240}}.',
      parts: [
        {
          id: 's6-t4-a',
          question:
            'Kalle will wissen, wie viel Geld er noch hat. Welche Angabe brauchst du dafür nicht?',
          answer: {
            type: 'choice',
            layout: 'cards',
            shuffle: true,
            options: [
              { id: 'a', label: '7 Muscheln', correct: true },
              {
                id: 'b',
                label: '3 €',
                feedback: 'Die 3 € brauchst du: So viel Geld hat Kalle am Anfang.',
              },
              {
                id: 'c',
                label: '2,40 €',
                feedback: 'Die 2,40 € brauchst du: So viel kostet das Seil.',
              },
            ],
          },
          hints: [
            'Kalle will etwas über sein Geld wissen.',
            'Welche Zahl hat nichts mit Geld zu tun?',
          ],
          explanation: 'Die 7 Muscheln haben nichts mit dem Geld zu tun. Die brauchst du nicht.',
        },
        {
          id: 's6-t4-b',
          question: 'Wie viel Geld hat Kalle noch?',
          answer: { type: 'money', correct: 60 },
          mistakes: [
            { value: 540, feedback: 'Kalle gibt Geld aus. Es wird weniger.' },
            { value: 160, feedback: 'Zähle von 2,40 € bis 3 €. Ist das mehr als 1 €?' },
          ],
          hints: ['Rechne 3 € − 2,40 €.', 'Zähle von 2,40 € bis 3 €: 2,50, 2,60 …'],
          explanation: 'Von 2,40 € bis 3 € sind es 60 Cent. Kalle hat noch 60 Cent.',
          praise: 'Klasse! Du hast die unwichtige Angabe erkannt und richtig gerechnet.',
        },
      ],
    },
    {
      id: 's6-t5',
      title: 'Kompass und Karte',
      difficulty: 3,
      authoredFor: 3,
      variant: {
        template: 'G2',
        bind: { A: 'kompass', B: 'karte' },
        force: { reicht: true },
        stufen: [2, 3, 4],
      },
      scene: {
        kind: 'items',
        items: [
          { itemId: 'kompass', label: 'Kompass', price: 240 },
          { itemId: 'karte', label: 'Karte', price: 130 },
        ],
        hand: [200, 200],
      },
      story: 'Du hast {{400}}. Ein Kompass kostet {{240}}. Eine Karte kostet {{130}}.',
      parts: [
        {
          id: 's6-t5-a',
          question: 'Reicht dein Geld für beides?',
          answer: {
            type: 'choice',
            layout: 'yesno',
            shuffle: false,
            options: [
              { id: 'a', label: 'Ja, es reicht', correct: true },
              {
                id: 'b',
                label: 'Nein, es reicht nicht',
                feedback: 'Rechne aus: 2,40 € + 1,30 €. Ist das mehr als 4 €?',
              },
            ],
          },
          hints: [
            'Rechne zuerst aus, was beides zusammen kostet.',
            '2 € + 1 € = 3 €. 40 Cent + 30 Cent = 70 Cent.',
          ],
          explanation: '2,40 € + 1,30 € = 3,70 €. Das ist weniger als 4 €. Es reicht!',
        },
        {
          id: 's6-t5-b',
          question: 'Wie viel Geld bleibt dir übrig?',
          answer: { type: 'money', correct: 30 },
          mistakes: [
            {
              value: 370,
              feedback: '3,70 € kostet alles zusammen. Wie viel bleibt von 4 € übrig?',
            },
            { value: 130, feedback: 'Von 3,70 € bis 4 € ist es weniger als 1 €.' },
          ],
          hints: [
            'Zähle von 3,70 € bis 4 €.',
            '3,80, 3,90, 4,00. Wie viele 10-Cent-Schritte sind das?',
          ],
          explanation: 'Von 3,70 € bis 4 € sind es 30 Cent.',
          praise: 'Geschafft! Kalle lässt dich über die Brücke.',
        },
      ],
    },
  ],
};
