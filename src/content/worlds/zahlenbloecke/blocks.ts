import type { Station, Task } from '@/domain/types';

export interface ZahlenblockHero {
  id: string;
  number: number; // 1–10
  name: string;
  shortName: string;
  subtitle: string;
  icon: string;
  catchphrase: string;
  story: string[];
  friendCard: {
    id: string;
    title: string;
    fact: string;
  };
  stations: [Station, Station, Station];
}

interface HeroSeed {
  id: string;
  number: number;
  name: string;
  shortName: string;
  subtitle: string;
  icon: string;
  catchphrase: string;
  story: string[];
  cardTitle: string;
  cardFact: string;
  s1Title: string;
  s2Title: string;
  s3Title: string;
  findlinge: [
    { id: string; name: string; text: string },
    { id: string; name: string; text: string },
    { id: string; name: string; text: string },
  ];
}

/**
 * Station 1: Visueller Block-Zauber (Zusammenklatschen, Teilen/Hatschi, Zauberspiegel & Zehner-Sprung).
 * Für Block 10 sind Station 2 und 3 komplett den großen Zehner-Schritten bis 100 gewidmet!
 */
function blockMagicTasks(prefix: string, n: number): Task[] {
  // Für jeden Zahlenblock n (1..10) 5 maßgeschneiderte visuelle Block-Aufgaben
  const partA = Math.max(1, Math.floor(n / 2));
  const partB = Math.max(1, n - partA);
  const sumAB = partA + partB;

  const dbl = n * 2;
  const tenStepA = n * 10;
  const tenStepB = n <= 5 ? n * 10 : (10 - n) * 10;
  const tenSum = tenStepA + tenStepB;

  const splitTotal = n <= 2 ? n + 3 : n;
  const splitTake = 1;
  const splitRest = splitTotal - splitTake;

  const plusExtra = n <= 5 ? n + 2 : n + (10 - n);
  const addPartner = plusExtra - n;

  return [
    {
      id: `${prefix}-t1`,
      title: `Klatsch! ${String(partA)} + ${String(partB)}`,
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'PM1' },
      scene: {
        kind: 'blocks',
        mode: 'combine',
        blocks: [partA, partB],
        result: '?',
      },
      story: `Zahlenblock ${String(partA)} und Zahlenblock ${String(partB)} hüpfen aufeinander zu: Klatsch!`,
      parts: [
        {
          id: `${prefix}-t1-a`,
          question: `Welcher Zahlenblock entsteht? ${String(partA)} + ${String(partB)} = ?`,
          answer: { type: 'number', correct: sumAB },
          mistakes: [
            {
              value: sumAB + 1,
              feedback: 'Zähle die einzelnen Würfel der beiden Zahlenblöcke noch einmal genau.',
            },
            {
              value: Math.max(0, sumAB - 1),
              feedback: 'Fast! Ein kleiner Block fehlt noch beim Zusammenzählen.',
            },
          ],
          hints: [
            `Zähle die Würfel von Block ${String(partA)} und Block ${String(partB)} zusammen.`,
            `Fang bei ${String(partA)} an und zähle ${String(partB)} Blöcke dazu.`,
          ],
          explanation: `Klatsch! ${String(partA)} + ${String(partB)} = ${String(sumAB)}. Das ist Zahlenblock ${String(sumAB)}!`,
        },
      ],
    },
    {
      id: `${prefix}-t2`,
      title: `Zauberspiegel: ${String(n)} + ${String(n)}`,
      difficulty: 2,
      authoredFor: n * 2 > 10 ? 2 : 1,
      variant: { template: 'V1' },
      scene: {
        kind: 'blocks',
        mode: 'mirror',
        blocks: [n],
        result: '?',
      },
      story: `Zahlenblock ${String(n)} stellt sich vor den glitzernden Zauberspiegel. Schwupps, stehen zwei gleiche ${String(n)}er da!`,
      parts: [
        {
          id: `${prefix}-t2-a`,
          question: `Verdopple im Zauberspiegel: ${String(n)} + ${String(n)} = ?`,
          answer: { type: 'number', correct: dbl },
          mistakes: [
            {
              value: n,
              feedback: `Im Zauberspiegel siehst du Zahlenblock ${String(n)} zweimal: ${String(n)} + ${String(n)}.`,
            },
            { value: dbl + 1, feedback: 'Fast! Zähle beide Blöcke noch einmal zusammen.' },
          ],
          hints: [
            `Vor dem Spiegel steht ${String(n)} und im Spiegel noch einmal ${String(n)}.`,
            `Rechne ${String(n)} + ${String(n)}.`,
          ],
          explanation: `Doppelt so groß! ${String(n)} + ${String(n)} = ${String(dbl)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t3`,
      title: `Hatschi! ${String(splitTotal)} − ${String(splitTake)}`,
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'PM3' },
      scene: {
        kind: 'blocks',
        mode: 'split',
        blocks: [splitTotal, splitTake],
        result: '?',
      },
      story:
        splitTotal === 9
          ? 'Bei Zahlenblock 9 kitzelt die Nase: Hatschi! Ein einzelner Block hüpft heraus!'
          : `Von Zahlenblock ${String(splitTotal)} hüpft ${String(splitTake)} Block weg.`,
      parts: [
        {
          id: `${prefix}-t3-a`,
          question: `Welcher Zahlenblock bleibt übrig? ${String(splitTotal)} − ${String(splitTake)} = ?`,
          answer: { type: 'number', correct: splitRest },
          mistakes: [
            {
              value: splitTotal + splitTake,
              feedback: 'Ein Block hüpft weg – es wird also weniger (Minus).',
            },
          ],
          hints: [
            `Nimm von ${String(splitTotal)} Blöcken ${String(splitTake)} Block weg.`,
            `Zähle von ${String(splitTotal)} einen Schritt rückwärts.`,
          ],
          explanation: `${String(splitTotal)} − ${String(splitTake)} = ${String(splitRest)}. Es bleibt Zahlenblock ${String(splitRest)}!`,
        },
      ],
    },
    {
      id: `${prefix}-t4`,
      title: `Block-Freunde: ${String(n)} + ? = ${String(plusExtra)}`,
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM2' },
      scene: {
        kind: 'blocks',
        mode: 'combine',
        blocks: [n],
        result: plusExtra,
      },
      story: `Zahlenblock ${String(n)} möchte sich in Zahlenblock ${String(plusExtra)} verwandeln.`,
      parts: [
        {
          id: `${prefix}-t4-a`,
          question: `Welcher Block muss dazuklatschen? ${String(n)} + ? = ${String(plusExtra)}`,
          answer: { type: 'number', correct: addPartner },
          mistakes: [
            {
              value: plusExtra,
              feedback: `${String(plusExtra)} ist das Ziel. Wie viele Blöcke fehlen von ${String(n)} bis ${String(plusExtra)}?`,
            },
          ],
          hints: [
            `Zähle von ${String(n)} weiter bis ${String(plusExtra)}.`,
            `Rechne ${String(plusExtra)} − ${String(n)}.`,
          ],
          explanation: `${String(n)} + ${String(addPartner)} = ${String(plusExtra)}. Zahlenblock ${String(addPartner)} hat gefehlt!`,
        },
      ],
    },
    {
      id: `${prefix}-t5`,
      title: `Zehner-Blöcke: ${String(tenStepA)} + ${String(tenStepB)}`,
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'PM7' },
      scene: {
        kind: 'blocks',
        mode: 'combine',
        blocks: [tenStepA, tenStepB],
        result: '?',
      },
      story: `Im großen Zehner-Land treffen sich die großen Brüder: Block ${String(tenStepA)} und Block ${String(tenStepB)}!`,
      parts: [
        {
          id: `${prefix}-t5-a`,
          question: `Rechne in Zehner-Schritten: ${String(tenStepA)} + ${String(tenStepB)} = ?`,
          answer: { type: 'number', correct: tenSum },
          mistakes: [
            {
              value: Math.round(tenSum / 10),
              feedback: `Vergiss die Null am Ende nicht: Es sind Zehner-Blöcke (${String(tenStepA)} + ${String(tenStepB)})!`,
            },
          ],
          hints: [
            `Denk an die kleinen Blöcke: ${String(tenStepA / 10)} + ${String(tenStepB / 10)} = ${String(tenSum / 10)}.`,
            `${String(tenStepA / 10)} Zehner plus ${String(tenStepB / 10)} Zehner sind ${String(tenSum / 10)} Zehner, also ${String(tenSum)}.`,
          ],
          explanation: `${String(tenStepA)} + ${String(tenStepB)} = ${String(tenSum)}!`,
        },
      ],
    },
  ];
}

/**
 * Spezielle Station 2 für Block 10: Große Zehner-Schritte bis 100 (10, 20, 30 … 100).
 */
function tensToHundredMagicTasks(prefix: string): Task[] {
  return [
    {
      id: `${prefix}-t1`,
      title: '10 + 10 = 20',
      difficulty: 1,
      authoredFor: 2,
      variant: { template: 'V1' },
      scene: {
        kind: 'blocks',
        mode: 'combine',
        blocks: [10, 10],
        result: '?',
      },
      story: 'Zwei Zehn-Raketen klatschen zusammen! Aus zwei Zehnern wird der große Block Zwanzig.',
      parts: [
        {
          id: `${prefix}-t1-a`,
          question: 'Zwei Zehner zusammen: 10 + 10 = ?',
          answer: { type: 'number', correct: 20 },
          mistakes: [{ value: 11, feedback: '10 und noch einmal 10 sind zwei volle Zehner.' }],
          hints: ['1 + 1 = 2, also ist 10 + 10 = 20.', 'Zähle in Zehner-Schritten: 10, 20!'],
          explanation: '10 + 10 = 20. Hallo, Zahlenblock Zwanzig!',
        },
      ],
    },
    {
      id: `${prefix}-t2`,
      title: '20 + 30 = 50',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'PM1' },
      scene: {
        kind: 'blocks',
        mode: 'combine',
        blocks: [20, 30],
        result: '?',
      },
      story: 'Zahlenblock 20 (zwei Zehner) und Zahlenblock 30 (drei Zehner) starten gemeinsam!',
      parts: [
        {
          id: `${prefix}-t2-a`,
          question: 'Rechne im Zehner-Schritt: 20 + 30 = ?',
          answer: { type: 'number', correct: 50 },
          mistakes: [{ value: 5, feedback: '5 Zehner heißen 50 (mit einer 0 am Ende)!' }],
          hints: ['Rechne erst 2 + 3 = 5.', 'Aus 2 Zehnern + 3 Zehnern werden 5 Zehner, also 50.'],
          explanation: '20 + 30 = 50. Das ist der Rockstar-Block Fünfzig!',
        },
      ],
    },
    {
      id: `${prefix}-t3`,
      title: '50 + 50 = 100',
      difficulty: 2,
      authoredFor: 3,
      variant: { template: 'V1' },
      scene: {
        kind: 'blocks',
        mode: 'mirror',
        blocks: [50],
        result: '?',
      },
      story:
        'Zahlenblock 50 schaut in den Riesen-Zauberspiegel! Zwei Fünfziger verschmelzen zum größten Quadrat von allen!',
      parts: [
        {
          id: `${prefix}-t3-a`,
          question: 'Wie viel ist 50 + 50 zusammen?',
          answer: { type: 'number', correct: 100 },
          mistakes: [{ value: 10, feedback: '5 + 5 = 10, aber 50 + 50 sind zehn Zehner!' }],
          hints: [
            '5 + 5 = 10, also sind 5 Zehner + 5 Zehner = 10 Zehner.',
            '10 Zehner sind genau 100!',
          ],
          explanation: '50 + 50 = 100! Juhu, das ist die große Hundert (10 mal 10)!',
        },
      ],
    },
    {
      id: `${prefix}-t4`,
      title: '80 − 30 = 50',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'PM3' },
      scene: {
        kind: 'blocks',
        mode: 'split',
        blocks: [80, 30],
        result: '?',
      },
      story: 'Super-Oktoblock 80 teilt sich: Ein 30er-Block saust davon!',
      parts: [
        {
          id: `${prefix}-t4-a`,
          question: 'Welcher Zehner-Block bleibt übrig? 80 − 30 = ?',
          answer: { type: 'number', correct: 50 },
          mistakes: [
            { value: 5, feedback: 'Denk an die Zehner-Null: 8 Zehner minus 3 Zehner sind 50!' },
          ],
          hints: ['Rechne 8 − 3 = 5.', '8 Zehner minus 3 Zehner sind 5 Zehner, also 50.'],
          explanation: '80 − 30 = 50.',
        },
      ],
    },
    {
      id: `${prefix}-t5`,
      title: '40 + ? = 100',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'PM2' },
      scene: {
        kind: 'blocks',
        mode: 'combine',
        blocks: [40],
        result: 100,
      },
      story: 'Zahlenblock 40 möchte zusammen mit seinem Zehner-Freund die große 100 bauen!',
      parts: [
        {
          id: `${prefix}-t5-a`,
          question: 'Verliebte Zehner-Zahlen: 40 + ? = 100',
          answer: { type: 'number', correct: 60 },
          mistakes: [
            { value: 6, feedback: 'Fast! Zu 40 gehört der große Zehner-Block 60.' },
            { value: 50, feedback: '40 + 50 wäre 90. Es fehlt noch ein Zehner bis 100!' },
          ],
          hints: [
            'Denk an die verliebten Zahlen bis 10: 4 + ? = 10.',
            '4 + 6 = 10, also ist 40 + 60 = 100!',
          ],
          explanation: '40 + 60 = 100! Vierzig und Sechzig ergeben zusammen die große Hundert.',
        },
      ],
    },
  ];
}

/**
 * Station 2 (für Block 1–9): Das Block-Haus (Zerlegungen im Zahlenhaus).
 */
function blockHouseTasks(prefix: string, n: number): Task[] {
  const roof1 = Math.max(4, n);
  const roof2 = Math.max(5, n + 1 <= 10 ? n + 1 : 10);
  const roof3 = Math.max(6, n + 2 <= 10 ? n + 2 : 9);
  const roof4 = 10;
  const roof5 = n * 10; // Zehner-Haus (z. B. 40, 50, 80)!

  return [
    {
      id: `${prefix}-t1`,
      title: `Block-Haus ${String(roof1)}`,
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'PM4', force: { etagen: 2, dachFehlt: false } },
      scene: { kind: 'blocks', mode: 'combine', blocks: [1, roof1 - 1], result: roof1 },
      story: `Im Dach wohnt Zahlenblock ${String(roof1)}. In jeder Etage wohnen zwei Block-Freunde, die zusammen ${String(roof1)} ergeben.`,
      parts: [
        {
          id: `${prefix}-t1-a`,
          question: `Welcher Zahlenblock fehlt im Block-Haus ${String(roof1)}?`,
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: roof1, given: true },
              { id: 'r0l', value: 1, given: true },
              { id: 'r0r', value: roof1 - 1, given: false },
              { id: 'r1l', value: roof1 - 2, given: true },
              { id: 'r1r', value: 2, given: true },
            ],
          },
          hints: [
            `Beide Zimmer einer Etage ergeben zusammen ${String(roof1)}.`,
            `Links wohnt die 1. Wie viele Blöcke fehlen von 1 noch bis ${String(roof1)}?`,
          ],
          explanation: `1 + ${String(roof1 - 1)} = ${String(roof1)} und ${String(roof1 - 2)} + 2 = ${String(roof1)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t2`,
      title: `Zwei Zimmer für Block ${String(roof2)}`,
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'PM4', force: { etagen: 2, dachFehlt: false } },
      scene: { kind: 'none' },
      story: `Zahlenblock ${String(roof2)} kann sich auf verschiedene Arten in zwei kleinere Zahlenblöcke teilen.`,
      parts: [
        {
          id: `${prefix}-t2-a`,
          question: 'Fülle die zwei leeren Zimmer im Block-Haus aus.',
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: roof2, given: true },
              { id: 'r0l', value: 2, given: true },
              { id: 'r0r', value: roof2 - 2, given: false },
              { id: 'r1l', value: roof2 - 3, given: false },
              { id: 'r1r', value: 3, given: true },
            ],
          },
          hints: [
            `Jede Etage ergibt zusammen genau ${String(roof2)}.`,
            `Oben: 2 + ? = ${String(roof2)}. Unten: ? + 3 = ${String(roof2)}.`,
          ],
          explanation: `2 + ${String(roof2 - 2)} = ${String(roof2)} und ${String(roof2 - 3)} + 3 = ${String(roof2)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t3`,
      title: 'Welcher Zahlenblock wohnt im Dach?',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM4', force: { etagen: 2, dachFehlt: true } },
      scene: { kind: 'none' },
      story:
        'Nanu, das Dach ist noch leer! Aber die erste Etage verrät dir sofort, welcher Zahlenblock dort oben wohnt.',
      parts: [
        {
          id: `${prefix}-t3-a`,
          question: 'Rechne erst das Dach aus und dann das freie Zimmer.',
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: roof3, given: false },
              { id: 'r0l', value: 3, given: true },
              { id: 'r0r', value: roof3 - 3, given: true },
              { id: 'r1l', value: 1, given: true },
              { id: 'r1r', value: roof3 - 1, given: false },
            ],
          },
          hints: [
            `In der oberen Etage wohnen 3 und ${String(roof3 - 3)}. Klatsch sie zusammen für das Dach!`,
            `Im Dach wohnt ${String(roof3)}. Unten fehlt noch ${String(roof3)} − 1.`,
          ],
          explanation: `3 + ${String(roof3 - 3)} = ${String(roof3)}. Und unten: 1 + ${String(roof3 - 1)} = ${String(roof3)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t4`,
      title: 'Das Haus der Zehn-Rakete',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM4', force: { etagen: 3, dachFehlt: false } },
      scene: { kind: 'none' },
      story:
        'Oben im Dach leuchtet die Zehn-Rakete (10). Finde die verliebten Zahlenblöcke, die zusammen 10 ergeben!',
      parts: [
        {
          id: `${prefix}-t4-a`,
          question: 'Fülle die freien Zimmer im 10er-Haus aus.',
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: roof4, given: true },
              { id: 'r0l', value: (n % 4) + 1, given: true },
              { id: 'r0r', value: 10 - ((n % 4) + 1), given: false },
              { id: 'r1l', value: 5, given: false },
              { id: 'r1r', value: 5, given: true },
              { id: 'r2l', value: 7, given: true },
              { id: 'r2r', value: 3, given: true },
            ],
          },
          hints: [
            'Jede Etage ergibt zusammen genau 10.',
            `Wie viel fehlt von ${String((n % 4) + 1)} bis 10? Und zwei Fünfer (5 + 5) ergeben auch 10!`,
          ],
          explanation: `${String((n % 4) + 1)} + ${String(10 - ((n % 4) + 1))} = 10, 5 + 5 = 10, 7 + 3 = 10.`,
        },
      ],
    },
    {
      id: `${prefix}-t5`,
      title: `Das große Zehner-Haus ${String(roof5)}`,
      difficulty: 4,
      authoredFor: roof5 > 10 ? 3 : 1,
      variant: { template: 'PM4', force: { etagen: 2, dachFehlt: false } },
      scene: { kind: 'none' },
      story:
        roof5 === 10
          ? 'Auch mit ganzen Zehnern klappt das Block-Haus kinderleicht!'
          : `Im großen Zehner-Haus wohnt oben Block ${String(roof5)}!`,
      parts: [
        {
          id: `${prefix}-t5-a`,
          question: `Welche Zahl fehlt im Haus von Block ${String(roof5)}?`,
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells:
              roof5 === 10
                ? [
                    { id: 'dach', value: 20, given: true },
                    { id: 'r0l', value: 10, given: true },
                    { id: 'r0r', value: 10, given: false },
                    { id: 'r1l', value: 15, given: true },
                    { id: 'r1r', value: 5, given: true },
                  ]
                : [
                    { id: 'dach', value: roof5, given: true },
                    { id: 'r0l', value: 10, given: true },
                    { id: 'r0r', value: roof5 - 10, given: false },
                    { id: 'r1l', value: roof5 - 10, given: true },
                    { id: 'r1r', value: 10, given: true },
                  ],
          },
          hints: [
            roof5 === 10
              ? 'Beide Zimmer ergeben zusammen 20.'
              : `Beide Zimmer ergeben zusammen ${String(roof5)}.`,
            roof5 === 10
              ? '10 + ? = 20.'
              : `Links steht 10. Wie viele Zehner fehlen noch bis ${String(roof5)}?`,
          ],
          explanation:
            roof5 === 10 ? '10 + 10 = 20.' : `10 + ${String(roof5 - 10)} = ${String(roof5)}.`,
        },
      ],
    },
  ];
}

/**
 * Station 3 für Block 10: Das große Hunderter-Haus & Zehner-Pyramide bis 100!
 */
function hundredPyramidTasks(prefix: string): Task[] {
  return [
    {
      id: `${prefix}-t1`,
      title: 'Das große Hunderter-Haus (100)',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'PM4', force: { etagen: 3, dachFehlt: false } },
      scene: { kind: 'blocks', mode: 'combine', blocks: [50, 50], result: 100 },
      story:
        'Im Dach des riesigen Hunderter-Hauses wohnt die große 100! Jede Etage besteht aus zwei Zehner-Blöcken, die zusammen 100 ergeben.',
      parts: [
        {
          id: `${prefix}-t1-a`,
          question: 'Fülle die leeren Zimmer im Hunderter-Haus (100) aus.',
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: 100, given: true },
              { id: 'r0l', value: 60, given: true },
              { id: 'r0r', value: 40, given: false },
              { id: 'r1l', value: 30, given: false },
              { id: 'r1r', value: 70, given: true },
              { id: 'r2l', value: 50, given: true },
              { id: 'r2r', value: 50, given: true },
            ],
          },
          hints: [
            'Jede Etage ergibt zusammen genau 100.',
            'Oben: 60 + ? = 100 (denk an 6 + 4 = 10). Mitte: ? + 70 = 100 (denk an 3 + 7 = 10).',
          ],
          explanation: '60 + 40 = 100, 30 + 70 = 100 und 50 + 50 = 100!',
        },
      ],
    },
    {
      id: `${prefix}-t2`,
      title: 'Zehner-Pyramide bis 70',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'PM5', force: { unten: false } },
      scene: { kind: 'blocks', mode: 'combine', blocks: [30, 40], result: '?' },
      story: 'Die großen Zehner-Blöcke 30 und 40 bauen eine Pyramide!',
      parts: [
        {
          id: `${prefix}-t2-a`,
          question: 'Welcher Zehner-Block thront oben auf der Zahlenmauer?',
          answer: {
            type: 'grid',
            shape: 'wall',
            unit: 'number',
            cells: [
              { id: 'r1c0', value: 70, given: false },
              { id: 'r0c0', value: 30, given: true },
              { id: 'r0c1', value: 40, given: true },
            ],
          },
          hints: [
            'Rechne die beiden unteren Steine zusammen: 30 + 40.',
            '3 + 4 = 7, also ist 30 + 40 = 70.',
          ],
          explanation: '30 + 40 = 70. Oben steht der große Regenbogen-Block 70!',
        },
      ],
    },
    {
      id: `${prefix}-t3`,
      title: 'Hunderter-Pyramide (100)',
      difficulty: 3,
      authoredFor: 3,
      variant: { template: 'PM5', force: { unten: true } },
      scene: { kind: 'none' },
      story:
        'Ganz oben auf der Pyramide leuchtet schon die große 100, und unten links steht Block 20.',
      parts: [
        {
          id: `${prefix}-t3-a`,
          question: 'Welcher Zehner-Block fehlt unten rechts in der Mauer?',
          answer: {
            type: 'grid',
            shape: 'wall',
            unit: 'number',
            cells: [
              { id: 'r1c0', value: 100, given: true },
              { id: 'r0c0', value: 20, given: true },
              { id: 'r0c1', value: 80, given: false },
            ],
          },
          hints: [
            'Unten links steht 20, oben steht 100.',
            'Wie viel fehlt von 20 noch bis 100? (2 + ? = 10)',
          ],
          explanation: '20 + 80 = 100! Unten rechts gehört Oktoblock 80 hin.',
        },
      ],
    },
    {
      id: `${prefix}-t4`,
      title: 'Zehner-Treppe bis 100',
      difficulty: 3,
      authoredFor: 3,
      variant: {
        template: 'sequence',
        force: { muster: 'zahl', luecke: 'ende', antwort: 'number' },
      },
      scene: {
        kind: 'sequence',
        items: [
          { kind: 'number', value: 60 },
          { kind: 'number', value: 70 },
          { kind: 'number', value: 80 },
          { kind: 'number', value: 90 },
          { kind: 'blank' },
        ],
      },
      story: 'Die großen Zehner-Blöcke steigen Stufe für Stufe immer um 10 höher!',
      parts: [
        {
          id: `${prefix}-t4-a`,
          question: 'Welche Zahl kommt nach 60, 70, 80, 90?',
          answer: { type: 'number', correct: 100 },
          mistakes: [{ value: 91, feedback: 'Es geht in 10er-Schritten weiter: + 10!' }],
          hints: ['Es kommen immer 10 dazu.', 'Rechne 90 + 10.'],
          explanation: '60, 70, 80, 90, 100! Ganz oben wartet die große Hundert!',
        },
      ],
    },
    {
      id: `${prefix}-t5`,
      title: 'Das große Zehner-Dreieck',
      difficulty: 4,
      authoredFor: 3,
      variant: { template: 'PM6' },
      scene: { kind: 'none' },
      story: 'Im großen Zehner-Dreieck wohnen innen die Blöcke 20, 30 und 50.',
      parts: [
        {
          id: `${prefix}-t5-a`,
          question: 'Rechne die zwei offenen Außenfelder im Zehner-Dreieck aus.',
          answer: {
            type: 'grid',
            shape: 'triangle',
            unit: 'number',
            cells: [
              { id: 'a', value: 20, given: true },
              { id: 'b', value: 30, given: true },
              { id: 'c', value: 50, given: true },
              { id: 'ab', value: 50, given: false },
              { id: 'bc', value: 80, given: false },
              { id: 'ca', value: 70, given: true },
            ],
          },
          hints: [
            'Rechne immer die zwei inneren Zehner-Zahlen an einer Seite zusammen.',
            'Links oben: 20 + 30. Unten: 30 + 50.',
          ],
          explanation: '20 + 30 = 50 und 30 + 50 = 80!',
        },
      ],
    },
  ];
}

/**
 * Station 3 (für Block 1–9): Treppen-Team (Step Squad), Block-Pyramiden, Rechendreieck & Block-Tresor.
 */
function blockStairsAndRiddlesTasks(prefix: string, n: number): Task[] {
  const w1a = (n % 4) + 2;
  const w1b = ((n + 1) % 4) + 2;
  const w1top = w1a + w1b;

  const w2top = Math.max(6, n + 2 <= 10 ? n + 2 : 10);
  const w2a = Math.max(2, Math.floor(w2top / 2) - 1);
  const w2b = w2top - w2a;

  const ta = (n % 3) + 1;
  const tb = ((n + 1) % 3) + 2;
  const tc = (n % 2) + 2;

  // In geraden Blöcken (2, 4, 6, 8) eine 10er-Schritt-Folge bis 100, sonst eine Stufen-Folge!
  const isTenSeq = n % 2 === 0;
  const seqVals = isTenSeq
    ? [n * 10 - 10, n * 10, n * 10 + 10, n * 10 + 20]
    : [n, n + 2, n + 4, n + 6];
  const seqStep = isTenSeq ? 10 : 2;

  const c1 = (n % 4) + 2;
  const c2 = ((n + 1) % 4) + 3;
  const c3 = ((n + 2) % 4) + 2;

  return [
    {
      id: `${prefix}-t1`,
      title: 'Block-Pyramide bauen',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'PM5', force: { unten: false } },
      scene: {
        kind: 'blocks',
        mode: 'combine',
        blocks: [w1a, w1b],
        result: '?',
      },
      story: `Zahlenblock ${String(w1a)} und Zahlenblock ${String(w1b)} bauen gemeinsam eine Pyramide.`,
      parts: [
        {
          id: `${prefix}-t1-a`,
          question: 'Welcher Zahlenblock gehört oben auf die Spitze?',
          answer: {
            type: 'grid',
            shape: 'wall',
            unit: 'number',
            cells: [
              { id: 'r1c0', value: w1top, given: false },
              { id: 'r0c0', value: w1a, given: true },
              { id: 'r0c1', value: w1b, given: true },
            ],
          },
          hints: [
            'Klatsch die zwei unteren Zahlenblöcke zusammen.',
            `Rechne ${String(w1a)} + ${String(w1b)}.`,
          ],
          explanation: `${String(w1a)} + ${String(w1b)} = ${String(w1top)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t2`,
      title: 'Welcher Block stützt unten?',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM5', force: { unten: true } },
      scene: { kind: 'none' },
      story: `Oben auf der Mauer steht schon Zahlenblock ${String(w2top)}, und unten links steht Block ${String(w2a)}.`,
      parts: [
        {
          id: `${prefix}-t2-a`,
          question: 'Welcher Zahlenblock fehlt unten rechts?',
          answer: {
            type: 'grid',
            shape: 'wall',
            unit: 'number',
            cells: [
              { id: 'r1c0', value: w2top, given: true },
              { id: 'r0c0', value: w2a, given: true },
              { id: 'r0c1', value: w2b, given: false },
            ],
          },
          hints: [
            `Unten links steht ${String(w2a)} und oben steht ${String(w2top)}.`,
            `Wie viele Blöcke fehlen von ${String(w2a)} noch bis ${String(w2top)}?`,
          ],
          explanation: `${String(w2a)} + ${String(w2b)} = ${String(w2top)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t3`,
      title: 'Das Block-Dreieck',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM6' },
      scene: { kind: 'none' },
      story:
        'Im Rechendreieck klatschen immer zwei innere Zahlenblöcke zusammen und bilden die Zahl außen.',
      parts: [
        {
          id: `${prefix}-t3-a`,
          question: 'Fülle die zwei leeren Außenfelder im Block-Dreieck aus.',
          answer: {
            type: 'grid',
            shape: 'triangle',
            unit: 'number',
            cells: [
              { id: 'a', value: ta, given: true },
              { id: 'b', value: tb, given: true },
              { id: 'c', value: tc, given: true },
              { id: 'ab', value: ta + tb, given: false },
              { id: 'bc', value: tb + tc, given: false },
              { id: 'ca', value: tc + ta, given: true },
            ],
          },
          hints: [
            'Rechne immer zwei innere Zahlen nebeneinander zusammen.',
            `Links oben: ${String(ta)} + ${String(tb)}. Unten: ${String(tb)} + ${String(tc)}.`,
          ],
          explanation: `${String(ta)} + ${String(tb)} = ${String(ta + tb)} und ${String(tb)} + ${String(tc)} = ${String(tb + tc)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t4`,
      title: isTenSeq ? 'Zehner-Treppe im Zahlenland' : 'Treppen-Team in 2er-Schritten',
      difficulty: 3,
      authoredFor: (seqVals[3] ?? 10) > 20 ? 3 : (seqVals[3] ?? 10) > 10 ? 2 : 1,
      variant: {
        template: 'sequence',
        force: { muster: 'zahl', luecke: 'ende', antwort: 'number' },
      },
      scene: {
        kind: 'sequence',
        items: [
          { kind: 'number', value: seqVals[0] ?? 1 },
          { kind: 'number', value: seqVals[1] ?? 2 },
          { kind: 'number', value: seqVals[2] ?? 3 },
          { kind: 'blank' },
        ],
      },
      story: isTenSeq
        ? 'Die großen Zehner-Blöcke hüpfen in 10er-Schritten über die Zahlen-Steine!'
        : 'Das Treppen-Team hüpft immer im gleichen Schritt weiter!',
      parts: [
        {
          id: `${prefix}-t4-a`,
          question: `Welcher Zahlenblock kommt als Nächstes nach ${String(seqVals[0])}, ${String(seqVals[1])}, ${String(seqVals[2])}?`,
          answer: { type: 'number', correct: seqVals[3] ?? 4 },
          mistakes: [
            {
              value: (seqVals[2] ?? 3) + 1,
              feedback: `Schau genau auf den Abstand: Es kommen immer ${String(seqStep)} dazu!`,
            },
          ],
          hints: [
            'Schau, um wie viel die Zahlen von Stein zu Stein wachsen.',
            `Es kommen immer ${String(seqStep)} dazu: ${String(seqVals[2])} + ${String(seqStep)}.`,
          ],
          explanation: `${seqVals.join(', ')}. Als Nächstes kommt ${String(seqVals[3])}!`,
        },
      ],
    },
    {
      id: `${prefix}-t5`,
      title: 'Der Zahlenland-Tresor',
      difficulty: 4,
      authoredFor: 1,
      variant: { template: 'code', force: { raeder: 3, punkte: true } },
      scene: {
        kind: 'clues',
        clues: [
          { symbol: 'stern', text: `${String(c1 - 1)} + 1`, dots: [c1 - 1, 1] },
          { symbol: 'muschel', text: `${String(c2 - 2)} + 2`, dots: [c2 - 2, 2] },
          { symbol: 'fisch', text: `${String(c3 - 1)} + 1`, dots: [c3 - 1, 1] },
        ],
      },
      story: `Die Schatztruhe von Zahlenblock ${String(n)} hat ein Zahlenschloss mit drei Rädern.`,
      parts: [
        {
          id: `${prefix}-t5-a`,
          question: 'Rechne die drei Block-Aufgaben aus und stelle den Code ein.',
          answer: { type: 'code', digits: [c1, c2, c3] },
          hints: [
            'Löse jede Hinweis-Karte einzeln und drehe das passende Rad.',
            `Beim Stern: ${String(c1 - 1)} + 1 = ${String(c1)}.`,
          ],
          explanation: `Stern: ${String(c1)}. Muschel: ${String(c2)}. Fisch: ${String(c3)}. Der Code heißt ${String(c1)}, ${String(c2)}, ${String(c3)}.`,
          praise: 'Klick! Die Zahlenblock-Schatztruhe springt auf!',
        },
      ],
    },
  ];
}

const HERO_SEEDS: readonly HeroSeed[] = [
  {
    id: 'eins',
    number: 1,
    name: 'Zahlenblock Eins',
    shortName: 'Eins (1)',
    subtitle: 'Ein einzelner roter Block mit einem runden Auge',
    icon: 'nb-1',
    catchphrase: 'Eins! Ein wunderbarer Block!',
    story: [
      'Hallo! Ich bin Eins! Ich bestehe aus genau einem knallroten Würfel-Block und habe ein großes rundes Auge genau in der Mitte!',
      'Über meinem Kopf schwebt immer meine Ziffer 1. Überall im Zahlenland entdecke ich einzelne Dinge: eine Sonne, eine rote Nase, einen besten Freund!',
      'Und wenn ich vor den glitzernden Zauberspiegel hüpfe – Klatsch! –, dann werden aus 1 + 1 plötzlich zwei Blöcke!',
    ],
    cardTitle: 'Freundeskarte: Zahlenblock 1',
    cardFact:
      'Eins ist der allererste Zahlenblock! Weil jede größere Zahl aus einzelnen 1er-Blöcken gebaut wird, steckt die rote Eins in jedem anderen Zahlenblock mit drin.',
    s1Title: 'Eins und der Zauberspiegel',
    s2Title: 'Das erste Block-Haus',
    s3Title: 'Eins baut Pyramiden',
    findlinge: [
      {
        id: 'nb-eins-wuerfel',
        name: 'Roter Eins-Würfel',
        text: 'Der allererste rote Einheits-Block aus dem Zahlenland.',
      },
      {
        id: 'nb-eins-hut',
        name: 'Kleiner roter Zylinder',
        text: 'Der schicke rote Hut von Zahlenblock Eins.',
      },
      {
        id: 'nb-eins-stern',
        name: 'Eins-Zifferling',
        text: 'Schwebt stolz über dem Kopf von Zahlenblock Eins.',
      },
    ],
  },
  {
    id: 'zwei',
    number: 2,
    name: 'Zahlenblock Zwei',
    shortName: 'Zwei (2)',
    subtitle: 'Zwei orange Blöcke mit goldener Tanzbrille',
    icon: 'nb-2',
    catchphrase: 'Eins, zwei – Tanzerei!',
    story: [
      'Hallo, ich bin Zwei! Ich bestehe aus zwei orangen Blöcken, trage eine goldene Brille und liebe meine klackernden Tanzschuhe!',
      'Zu zweit macht alles doppelt so viel Spaß: zwei Schuhe, zwei Socken, zwei Hände zum Klatschen und zwei Augen zum Zwinkern!',
      'Ich bin die erste gerade Zahl – man kann mich gerecht in zwei gleiche Einsen teilen: 1 + 1 = 2!',
    ],
    cardTitle: 'Freundeskarte: Zahlenblock 2',
    cardFact:
      'Zwei (2) ist die erste gerade Zahl! Alle Zahlenblöcke, die man wie die Zwei in zwei genau gleiche Reihen aufstellen kann (2, 4, 6, 8, 10), heißen gerade Zahlen.',
    s1Title: 'Paare & Doppel-Tanz',
    s2Title: 'Zweier-Blockhäuser',
    s3Title: 'Der Zweier-Sprung',
    findlinge: [
      {
        id: 'nb-zwei-brille',
        name: 'Goldene Zwei-Brille',
        text: 'Durch ihre zwei Gläser sieht man jedes Paar sofort.',
      },
      {
        id: 'nb-zwei-schuh',
        name: 'Oranger Steppschuh',
        text: 'Klack-klack! Tanzt immer im Zweier-Takt.',
      },
      {
        id: 'nb-zwei-spiegel',
        name: 'Kleiner Zauberspiegel',
        text: 'Verdoppelt jeden Zahlenblock, der hineinschaut!',
      },
    ],
  },
  {
    id: 'drei',
    number: 3,
    name: 'Zahlenblock Drei',
    shortName: 'Drei (3)',
    subtitle: 'Drei gelbe Blöcke mit drei roten Jonglierbällen',
    icon: 'nb-3',
    catchphrase: 'Eins, zwei, drei – Manege frei!',
    story: [
      'Tadaaa! Schaut alle her, hier kommt Drei! Ich habe drei leuchtend gelbe Blöcke und drei rote Knöpfe an meinem Bauch!',
      'Ich liebe es, mit drei Bällen zu jonglieren, und alle guten Märchen-Dinge kommen immer zu dritt!',
      'Und kennst du mein Geheimnis? Wenn Eins (1) und Zwei (2) sich neben mich stellen, bilden wir die erste echte Stufen-Treppe: 1 + 2 = 3!',
    ],
    cardTitle: 'Freundeskarte: Zahlenblock 3',
    cardFact:
      'Drei (3) ist die erste Treppen-Zahl! Wenn man 1 Block und daneben 2 Blöcke stellt, entsteht eine Treppe aus 1 + 2 = 3 Blöcken.',
    s1Title: 'Zirkus-Zauber mit Drei',
    s2Title: 'Dreier-Blockhäuser',
    s3Title: 'Die erste Stufen-Treppe',
    findlinge: [
      {
        id: 'nb-drei-baelle',
        name: 'Drei Jonglierbälle',
        text: 'Fliegen im hohen Bogen: eins, zwei, drei!',
      },
      {
        id: 'nb-drei-krone',
        name: 'Zirkus-Krönchen',
        text: 'Mit drei goldenen Spitzen für die große Vorstellung.',
      },
      {
        id: 'nb-drei-treppe',
        name: 'Goldene Treppenstufe',
        text: 'Das Abzeichen für das erste Treppen-Team (1 + 2 = 3).',
      },
    ],
  },
  {
    id: 'vier',
    number: 4,
    name: 'Zahlenblock Vier',
    shortName: 'Vier (4)',
    subtitle: 'Vier grüne Blöcke im stabilen 2×2-Quadrat',
    icon: 'nb-4',
    catchphrase: 'Ich bin Vier – und ich bin ein Quadrat!',
    story: [
      'Hallo! Ich bin Vier! Schau mich genau an: Zwei grüne Blöcke unten und zwei grüne Blöcke oben – ich bin genauso breit wie hoch!',
      'Deshalb bin ich stolzes Mitglied im Quadrat-Club! Sogar meine Augen sind quadratisch!',
      'Ich liebe alles, was vier Ecken hat oder auf vier Beinen steht: einen Tisch, ein Auto mit vier Rädern und mein starkes 2-mal-2-Quadrat!',
    ],
    cardTitle: 'Freundeskarte: Zahlenblock 4 (Quadrat-Club)',
    cardFact:
      'Vier (4) ist ein echtes Quadrat aus 2 mal 2 grünen Blöcken (2 + 2 = 4). Im Zahlenland erkennt man alle Quadrat-Zahlen sofort an ihren quadratischen Augen!',
    s1Title: 'Der grüne Quadrat-Club',
    s2Title: 'Vierer-Blockhäuser',
    s3Title: 'Quadrat-Pyramiden',
    findlinge: [
      {
        id: 'nb-vier-quadrat',
        name: 'Grünes Quadrat-Abzeichen',
        text: 'Hat vier Ecken und vier genau gleich lange Seiten.',
      },
      {
        id: 'nb-vier-baustein',
        name: 'Vierer-Baustein',
        text: 'Zwei mal zwei grüne Würfel, fest verbunden.',
      },
      {
        id: 'nb-vier-wappen',
        name: 'Schild des Quadrat-Clubs',
        text: 'Nur für echte Quadrat-Zahlen wie 1, 4, 9 und 100!',
      },
    ],
  },
  {
    id: 'fuenf',
    number: 5,
    name: 'Zahlenblock Fünf',
    shortName: 'Fünf (5)',
    subtitle: 'Fünf blaue Blöcke mit glitzerndem Rockstar-Stern',
    icon: 'nb-5',
    catchphrase: 'Gib mir Fünf – High-Five!',
    story: [
      'Yeah, gib mir Fünf! Ich bin Zahlenblock Fünf! Meine fünf hellblauen Blöcke leuchten wie der Himmel, und um mein Auge funkelt ein großer goldener Stern!',
      'Streck mal deine Hand aus: Eins, zwei, drei, vier, fünf Finger! Darum trage ich auch einen weißen Handschuh für das beste High-Five der Welt!',
      'Und wenn zwei Fünfen zusammenklatschen (5 + 5), entsteht die große Zehn-Rakete!',
    ],
    cardTitle: 'Freundeskarte: Zahlenblock 5',
    cardFact:
      'Fünf (5) hat genauso viele Blöcke wie eine Hand Finger hat – und fünf Zacken wie ihr goldener Stern! Zwei Fünfen ergeben zusammen genau 10 (5 + 5 = 10).',
    s1Title: 'High-Five Block-Show',
    s2Title: 'Fünfer-Blockhäuser',
    s3Title: 'Sternen-Pyramiden',
    findlinge: [
      {
        id: 'nb-fuenf-stern',
        name: 'Goldener Fünf-Stern',
        text: 'Mit fünf leuchtenden Zacken wie am Auge von Block Fünf.',
      },
      {
        id: 'nb-fuenf-gitarre',
        name: 'Blaue Rockstar-Gitarre',
        text: 'Spielt die coolsten Zahlen-Lieder im ganzen Zahlenland.',
      },
      {
        id: 'nb-fuenf-handschuh',
        name: 'High-Five-Handschuh',
        text: 'Fünf Finger für einen kräftigen Abklatscher!',
      },
    ],
  },
  {
    id: 'sechs',
    number: 6,
    name: 'Zahlenblock Sechs',
    shortName: 'Sechs (6)',
    subtitle: 'Sechs lila Blöcke mit sechs weißen Würfelpunkten',
    icon: 'nb-6',
    catchphrase: 'Würfel los, der Spaß wird groß!',
    story: [
      'Hallo, ich bin Sechs! Auf meinen sechs lila Blöcken siehst du sechs weiße Würfelpunkte – genau wie die höchste Zahl auf einem Spielwürfel!',
      'Ich kann mich als 2-mal-3-Rechteck aufstellen (zwei Dreier oder drei Zweier).',
      'Und aufgepasst: Wenn sich 1, 2 und 3 aufeinanderstapeln (1 + 2 + 3 = 6), verwandle ich mich in eine dreistufige Treppe vom Treppen-Team!',
    ],
    cardTitle: 'Freundeskarte: Zahlenblock 6',
    cardFact:
      'Sechs (6) ist ein echtes Multitalent: Sie besteht aus zwei Dreiern (3 + 3 = 6), aus drei Zweiern (2 + 2 + 2 = 6) und bildet die Stufen-Treppe 1 + 2 + 3 = 6!',
    s1Title: 'Würfel-Party mit Sechs',
    s2Title: 'Sechser-Blockhäuser',
    s3Title: 'Das 6er-Treppen-Team',
    findlinge: [
      {
        id: 'nb-sechs-wuerfel',
        name: 'Lila Glückswürfel',
        text: 'Zeigt oben stolz alle sechs weißen Würfelpunkte.',
      },
      {
        id: 'nb-sechs-treppe',
        name: 'Dreistufige Block-Treppe',
        text: '1 + 2 + 3 ergibt zusammen genau 6!',
      },
      {
        id: 'nb-sechs-pokal',
        name: 'Spiele-Meisterpokal',
        text: 'Gewonnen beim großen Würfelspiel mit Zahlenblock Sechs.',
      },
    ],
  },
  {
    id: 'sieben',
    number: 7,
    name: 'Zahlenblock Sieben',
    shortName: 'Sieben (7)',
    subtitle: 'Sieben bunte Blöcke in allen Regenbogenfarben',
    icon: 'nb-7',
    catchphrase: 'Sieben Farben im Sonnenschein – ich bin die Glücks-Sieben!',
    story: [
      'Was für ein Glückstag! Ich bin Sieben! Meine sieben Blöcke leuchten in allen sieben Farben des Regenbogens: Rot, Orange, Gelb, Grün, Blau, Indigo und Violett!',
      'Selbst bei Regenwetter habe ich immer gute Laune, denn wenn Sonne und Regen sich treffen, spanne ich einen bunten Regenbogen über das Zahlenland!',
      'Übrigens hat auch jede Woche genau 7 Tage – von Montag bis Sonntag!',
    ],
    cardTitle: 'Freundeskarte: Zahlenblock 7',
    cardFact:
      'Sieben (7) trägt die Farben der Zahlenblöcke 1 bis 6 plus ihr eigenes Violett! Zusammen mit der Drei ergibt sie die Zehn (7 + 3 = 10).',
    s1Title: 'Regenbogen-Zauber',
    s2Title: 'Siebener-Blockhäuser',
    s3Title: 'Glücks-Pyramiden',
    findlinge: [
      {
        id: 'nb-sieben-regenbogen',
        name: 'Sieben-Farben-Bogen',
        text: 'Leuchtet in Rot, Orange, Gelb, Grün, Blau, Indigo und Violett.',
      },
      {
        id: 'nb-sieben-klee',
        name: 'Glücks-Kleeblatt',
        text: 'Ein persönlicher Glücksbringer von Zahlenblock Sieben.',
      },
      {
        id: 'nb-sieben-prisma',
        name: 'Funkelnder Regenbogen-Stein',
        text: 'Zaubert bunte Lichtpunkte ins ganze Zimmer.',
      },
    ],
  },
  {
    id: 'acht',
    number: 8,
    name: 'Zahlenblock Acht (Oktoblock)',
    shortName: 'Acht (8)',
    subtitle: 'Acht pinke Blöcke mit Superhelden-Maske & 8 Tentakeln',
    icon: 'nb-8',
    catchphrase: 'Oktoblock: Achtung, fertig – helfen!',
    story: [
      'Tadaaa, hier ist Oktoblock Acht! Ich habe acht leuchtend pinke Blöcke, eine coole Superhelden-Brille mit acht Zacken und acht flinke Okto-Arme!',
      'Wie ein Oktopus im Meer kann ich acht Dinge gleichzeitig: klettern, laufen, winken, jonglieren, lachen, tanzen, rechnen und helfen!',
      'Aus zwei starken Vieren gebaut (4 + 4 = 8), fehlen mir nur noch 2 Blöcke bis zur großen Zehn (8 + 2 = 10)!',
    ],
    cardTitle: 'Freundeskarte: Oktoblock 8',
    cardFact:
      'Oktoblock Acht (8) ist das Doppelte von Vier (4 + 4 = 8) und besteht aus vier Zweiern (2 + 2 + 2 + 2 = 8). Im Zauberspiegel wird aus 8 + 8 sogar 16!',
    s1Title: 'Oktoblock im Einsatz',
    s2Title: 'Achter-Blockhäuser',
    s3Title: 'Okto-Pyramiden & Zehner',
    findlinge: [
      {
        id: 'nb-acht-maske',
        name: 'Pinke Oktoblock-Brille',
        text: 'Die echte Superhelden-Brille mit acht Zacken.',
      },
      {
        id: 'nb-acht-tentakel',
        name: 'Achter-Wirbelstern',
        text: 'Dreht sich so flink wie die acht Arme von Oktoblock.',
      },
      {
        id: 'nb-acht-schild',
        name: 'Okto-Heldenwappen',
        text: 'Verliehen für blitzschnelles Rechnen mit der Acht.',
      },
    ],
  },
  {
    id: 'neun',
    number: 9,
    name: 'Zahlenblock Neun',
    shortName: 'Neun (9)',
    subtitle: 'Neun graue Blöcke im 3×3-Quadrat mit Kitzel-Nase',
    icon: 'nb-9',
    catchphrase: 'Drei mal drei ist Neun … ha-ha-HATSCHI!',
    story: [
      'Hallo! Ich bin Neun! Schau dir meine neun Blöcke in drei schicken Graustufen an: drei dunkelgraue unten, drei mittelgraue in der Mitte und drei hellgraue oben!',
      'Genau wie mein Freund Vier habe ich quadratische Augen, denn 3 + 3 + 3 = 9 ist ein großes 3-mal-3-Quadrat!',
      'Nur manchmal kitzelt meine Nase ganz doll: Ha-ha-HATSCHI! Dann hüpft die rote 1 mitten aus mir heraus und ich werde kurz zu Oktoblock 8 (9 − 1 = 8)!',
    ],
    cardTitle: 'Freundeskarte: Zahlenblock 9 (Quadrat-Club)',
    cardFact:
      'Neun (9) besteht aus drei Dreiern (3 + 3 + 3 = 9) und ist das nächstgrößere Quadrat nach der Vier! Wenn 1 dazukommt, wird aus 9 + 1 sofort die Zehn-Rakete (10).',
    s1Title: 'Hatschi-Zauber & 3×3-Quadrat',
    s2Title: 'Neuner-Blockhäuser',
    s3Title: 'Quadrat-Rätsel mit Neun',
    findlinge: [
      {
        id: 'nb-neun-quadrat',
        name: 'Graues 3×3-Quadrat',
        text: 'Drei Reihen in drei Grautönen – ein echtes Groß-Quadrat!',
      },
      {
        id: 'nb-neun-taschentuch',
        name: 'Punkte-Taschentuch',
        text: 'Immer griffbereit, wenn Zahlenblock Neun wieder niesen muss!',
      },
      {
        id: 'nb-neun-medaille',
        name: 'Meister-Quadratmedaille',
        text: 'Für alle, die das Geheimnis von 3 + 3 + 3 = 9 kennen.',
      },
    ],
  },
  {
    id: 'zehn',
    number: 10,
    name: 'Zehn-Rakete & die Zehner bis 100',
    shortName: 'Zehn bis 100',
    subtitle: 'Zehn weiße Blöcke mit rotem Rand – und Zehner-Schritte bis 100!',
    icon: 'nb-10',
    catchphrase: '10, 9, 8, 7, 6, 5, 4, 3, 2, 1 – Start frei bis zur 100!',
    story: [
      'Zehn, neun, acht, sieben, sechs, fünf, vier, drei, zwei, eins – START FREI! Ich bin Zahlenblock Zehn, die Zehn-Rakete! Meine zehn weißen Blöcke haben einen leuchtend roten Rand und zwei rote Stern-Augen!',
      'Ich bin zehn einzelne Einsen, zwei starke Fünfen (5 + 5 = 10) und sogar die große Vier-Stufen-Treppe (1 + 2 + 3 + 4 = 10)!',
      'Und das Beste: Wenn viele Zehn-Raketen zusammenklatschen, fliegen wir in Zehner-Schritten (10, 20, 30, 40, 50, 60, 70, 80, 90) bis zum riesigen Quadrat-Block Hundert (100)!',
    ],
    cardTitle: 'Freundeskarte: Zehn-Rakete & die große 100',
    cardFact:
      'Aus Zehn-Raketen entstehen alle großen Zehner: 2 Zehner = 20, 3 Zehner = 30, 5 Zehner = 50 – und 10 Zehner nebeneinander bilden das riesige 10×10-Quadrat Hundert (100)!',
    s1Title: 'Countdown & Zehn-Rakete',
    s2Title: 'Zehner-Raketen bis 100',
    s3Title: 'Das große 100er-Haus & Pyramide',
    findlinge: [
      {
        id: 'nb-zehn-rakete',
        name: 'Weiß-rote Zehn-Rakete',
        text: 'Fliegt mit zehn Blöcken bis zu den Sternen.',
      },
      {
        id: 'nb-zehn-helm',
        name: 'Roter Sternen-Helm',
        text: 'Mit dem leuchtenden roten Stern von Kapitän Zehn.',
      },
      {
        id: 'nb-hundert-krone',
        name: 'Goldene Hunderter-Krone (100)',
        text: 'Das große Meisterstück aus zehn Zehn-Raketen (10 × 10 = 100)!',
      },
    ],
  },
];

export const ZAHLENBLOCK_HEROES: readonly ZahlenblockHero[] = HERO_SEEDS.map((seed) => {
  const n = seed.number;
  const s1Num = (n - 1) * 3 + 1;
  const s2Num = (n - 1) * 3 + 2;
  const s3Num = (n - 1) * 3 + 3;

  const s1: Station = {
    id: `nb-${seed.id}-s1`,
    world: 'zahlenbloecke',
    number: s1Num,
    title: seed.s1Title,
    icon: 'station-blockzauber',
    skillLabel: 'Blöcke zusammenklatschen, teilen und im Zauberspiegel verdoppeln',
    minutes: 5,
    intro: [
      `Auf geht's zu ${seed.name}: „${seed.catchphrase}“`,
      'Schau dir die Zahlenblöcke oben genau an: Wenn sie zusammenhüpfen, wird es mehr (+), beim Teilen weniger (−)!',
    ],
    findling: seed.findlinge[0],
    recap: `Stark! Du hast den Block-Zauber mit ${seed.name} gemeistert!`,
    practiceTopic: 'plus-minus',
    tasks: blockMagicTasks(`nb-${seed.id}-s1`, n),
  };

  const s2: Station = {
    id: `nb-${seed.id}-s2`,
    world: 'zahlenbloecke',
    number: s2Num,
    title: seed.s2Title,
    icon: 'station-zahlenhaus',
    skillLabel:
      n === 10
        ? 'In Zehner-Schritten bis 100 rechnen (10, 20, 30 … 100)'
        : 'Zahlenblöcke in zwei kleinere Blöcke zerlegen (Block-Häuser)',
    minutes: 6,
    intro:
      n === 10
        ? [
            'Jetzt starten die großen Zehner-Raketen: 10, 20, 30, 40, 50, 60, 70, 80, 90 bis zur großen 100!',
            'Tipp: Rechne mit den Zehnern genauso einfach wie mit den kleinen Zahlen 1 bis 10!',
          ]
        : [
            `Wie viele Arten gibt es, ${seed.name} aus zwei kleineren Zahlenblöcken zu bauen?`,
            'Im Block-Haus ergeben das linke und das rechte Zimmer zusammen immer den Zahlenblock oben im Dach!',
          ],
    findling: seed.findlinge[1],
    recap:
      n === 10
        ? 'Juhu! Du kannst schon mit den großen Zehner-Blöcken bis 100 rechnen!'
        : `Klasse! Alle Block-Häuser bei ${seed.name} sind fertig gebaut!`,
    practiceTopic: 'plus-minus',
    tasks:
      n === 10
        ? tensToHundredMagicTasks(`nb-${seed.id}-s2`)
        : blockHouseTasks(`nb-${seed.id}-s2`, n),
  };

  const s3: Station = {
    id: `nb-${seed.id}-s3`,
    world: 'zahlenbloecke',
    number: s3Num,
    title: seed.s3Title,
    icon: 'station-blocktreppe',
    skillLabel:
      n === 10
        ? 'Das große Hunderter-Haus (100), Zehner-Pyramiden und Zehner-Treppen lösen'
        : 'Block-Pyramiden, Rechendreiecke, Stufen-Treppen und Zahlenschloss knacken',
    minutes: 6,
    intro:
      n === 10
        ? [
            'Willkommen beim großen Finale bis 100! Hier warten das Hunderter-Haus und die große Zehner-Pyramide.',
            'Wenn du diese Station schaffst, bekommst du die goldene Hunderter-Krone und die Freundeskarte der Zehn-Rakete!',
          ]
        : [
            `Zum Schluss hat ${seed.name} noch echte Zahlenblock-Rätsel für dich: Pyramiden, Dreiecke und das Treppen-Team!`,
            `Wenn du alle 5 Aufgaben löst, schaltest du die Freundeskarte von ${seed.name} frei!`,
          ],
    findling: seed.findlinge[2],
    recap: `Geschafft! Du hast alle drei Stationen bei ${seed.name} gemeistert!`,
    practiceTopic: 'raetsel',
    progressStyle: 'locks',
    tasks:
      n === 10
        ? hundredPyramidTasks(`nb-${seed.id}-s3`)
        : blockStairsAndRiddlesTasks(`nb-${seed.id}-s3`, n),
  };

  return {
    id: seed.id,
    number: seed.number,
    name: seed.name,
    shortName: seed.shortName,
    subtitle: seed.subtitle,
    icon: seed.icon,
    catchphrase: seed.catchphrase,
    story: seed.story,
    friendCard: {
      id: `nb-card-${seed.id}`,
      title: seed.cardTitle,
      fact: seed.cardFact,
    },
    stations: [s1, s2, s3],
  };
});

export const ZAHLENBLOECKE_STATIONS: Station[] = ZAHLENBLOCK_HEROES.flatMap((h) => h.stations);

export function heroById(id: string): ZahlenblockHero | undefined {
  return ZAHLENBLOCK_HEROES.find((h) => h.id === id);
}

export function heroOfStation(stationId: string): ZahlenblockHero | undefined {
  return ZAHLENBLOCK_HEROES.find((h) => h.stations.some((s) => s.id === stationId));
}
