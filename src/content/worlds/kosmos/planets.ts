import type { Station, Task } from '@/domain/types';

export interface KosmosPlanet {
  id: string;
  number: number; // 1–8
  name: string;
  shortName: string;
  subtitle: string;
  icon: string;
  story: string[];
  factCard: {
    id: string;
    title: string;
    fact: string;
  };
  stations: [Station, Station, Station];
}

function plusMinusTasks(prefix: string, base: number): Task[] {
  const a1 = (base % 4) + 2;
  const b1 = ((base + 1) % 4) + 2;
  const sum1 = a1 + b1;

  const target2 = 10;
  const a2 = (base % 6) + 2;
  const r2 = target2 - a2;

  const n3 = (base % 4) + 2;
  const dbl3 = n3 * 2;

  const a4 = 7 + (base % 3);
  const b4 = (base % 4) + 2;
  const diff4 = a4 - b4;

  const k1 = (base % 3) + 2;
  const k2 = ((base + 1) % 3) + 2;
  const k3 = 1 + (base % 2);
  const res5 = k1 + k2 - k3;

  return [
    {
      id: `${prefix}-t1`,
      title: `${String(a1)} + ${String(b1)}`,
      difficulty: 1,
      authoredFor: 1,
      variant: { template: 'PM1' },
      scene: {
        kind: 'objects',
        groups: [
          { itemId: 'stern', count: a1 },
          { itemId: 'stern', count: b1 },
        ],
      },
      story: 'Kiko zählt funkelnde Sterne am Himmel.',
      parts: [
        {
          id: `${prefix}-t1-a`,
          question: `Rechne zusammen: ${String(a1)} + ${String(b1)} = ?`,
          answer: { type: 'number', correct: sum1 },
          mistakes: [
            { value: sum1 + 1, feedback: 'Fast! Zähle die Sterne noch einmal genau.' },
            { value: Math.max(0, sum1 - 1), feedback: 'Fast! Es fehlt noch ein Stern.' },
          ],
          hints: [
            'Zähle mit den Fingern oder an den Sternen weiter.',
            `Fang bei ${String(a1)} an und zähle ${String(b1)} dazu.`,
          ],
          explanation: `${String(a1)} + ${String(b1)} = ${String(sum1)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t2`,
      title: `${String(a2)} + ? = 10`,
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'PM2' },
      scene: { kind: 'none' },
      story: 'Die Rakete braucht genau 10 Energie-Sterne für den Sprung.',
      parts: [
        {
          id: `${prefix}-t2-a`,
          question: `Verliebte Zahlen: ${String(a2)} + ? = 10`,
          answer: { type: 'number', correct: r2 },
          mistakes: [
            { value: 10, feedback: '10 ist das Ziel. Wie viel fehlt noch bis 10?' },
            { value: r2 + 1, feedback: 'Fast! Prüfe, ob es zusammen genau 10 ergibt.' },
          ],
          hints: [`Zähle von ${String(a2)} weiter bis 10.`, `Rechne 10 − ${String(a2)}.`],
          explanation: `${String(a2)} + ${String(r2)} = 10. Es fehlen ${String(r2)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t3`,
      title: `Das Doppelte von ${String(n3)}`,
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'V1' },
      scene: {
        kind: 'objects',
        groups: [
          { itemId: 'stern', count: n3 },
          { itemId: 'stern', count: n3 },
        ],
      },
      story: `Im Weltraum-Spiegel sieht Kiko ${String(n3)} Sterne doppelt.`,
      parts: [
        {
          id: `${prefix}-t3-a`,
          question: `Verdopple ${String(n3)}: Wie viel ist ${String(n3)} + ${String(n3)}?`,
          answer: { type: 'number', correct: dbl3 },
          mistakes: [
            { value: n3, feedback: `Nimm ${String(n3)} und noch einmal ${String(n3)} dazu.` },
            { value: dbl3 + 1, feedback: 'Fast! Zähle noch einmal genau nach.' },
          ],
          hints: [
            `Das Doppelte heißt: ${String(n3)} + ${String(n3)}.`,
            `Zähle von ${String(n3)} noch ${String(n3)} weiter.`,
          ],
          explanation: `${String(n3)} + ${String(n3)} = ${String(dbl3)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t4`,
      title: `${String(a4)} − ? = ${String(diff4)}`,
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM3' },
      scene: { kind: 'none' },
      story: 'Ein kleiner Komet hat eine Zahl im Bordbuch verdeckt.',
      parts: [
        {
          id: `${prefix}-t4-a`,
          question: `Welche Zahl fehlt? ${String(a4)} − ? = ${String(diff4)}`,
          answer: { type: 'number', correct: b4 },
          mistakes: [
            {
              value: diff4,
              feedback: `${String(diff4)} bleibt übrig. Wie viel wurde von ${String(a4)} weggenommen?`,
            },
          ],
          hints: [
            `Wie weit ist es von ${String(diff4)} bis ${String(a4)}?`,
            `Rechne ${String(a4)} − ${String(diff4)}.`,
          ],
          explanation: `${String(a4)} − ${String(b4)} = ${String(diff4)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t5`,
      title: `${String(k1)} + ${String(k2)} − ${String(k3)}`,
      difficulty: 4,
      authoredFor: 1,
      variant: { template: 'PM7' },
      scene: { kind: 'none' },
      story: 'Kikos Rakete fliegt zwei Schritte vor und einen zurück.',
      parts: [
        {
          id: `${prefix}-t5-a`,
          question: `Rechne Schritt für Schritt: ${String(k1)} + ${String(k2)} − ${String(k3)} = ?`,
          answer: { type: 'number', correct: res5 },
          mistakes: [
            {
              value: k1 + k2,
              feedback: `Das ist der erste Schritt. Ziehe jetzt noch ${String(k3)} ab.`,
            },
          ],
          hints: [
            `Rechne zuerst ${String(k1)} + ${String(k2)}.`,
            `${String(k1)} + ${String(k2)} = ${String(k1 + k2)}. Jetzt noch Minus ${String(k3)}.`,
          ],
          explanation: `Erst ${String(k1)} + ${String(k2)} = ${String(k1 + k2)}, dann ${String(k1 + k2)} − ${String(k3)} = ${String(res5)}.`,
        },
      ],
    },
  ];
}

function houseTasks(prefix: string, base: number): Task[] {
  const d1 = 6 + (base % 4);
  const d2 = 7 + ((base + 1) % 4);
  const d3 = 8 + ((base + 2) % 3);
  const d4 = 9 + (base % 2);
  const d5 = 10;

  return [
    {
      id: `${prefix}-t1`,
      title: `Zahlenhaus ${String(d1)}`,
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'PM4', force: { etagen: 2, dachFehlt: false } },
      scene: { kind: 'none' },
      story: `Oben im Dach wohnt die ${String(d1)}. Zwei Zimmer zusammen ergeben ${String(d1)}.`,
      parts: [
        {
          id: `${prefix}-t1-a`,
          question: 'Welche Zahl fehlt im Zahlenhaus?',
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: d1, given: true },
              { id: 'r0l', value: 2, given: true },
              { id: 'r0r', value: d1 - 2, given: false },
              { id: 'r1l', value: d1 - 3, given: true },
              { id: 'r1r', value: 3, given: true },
            ],
          },
          hints: [
            `Beide Zimmer einer Etage ergeben zusammen ${String(d1)}.`,
            `Links steht 2. Wie viel fehlt von 2 noch bis ${String(d1)}?`,
          ],
          explanation: `2 + ${String(d1 - 2)} = ${String(d1)}. ${String(d1 - 3)} + 3 = ${String(d1)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t2`,
      title: `Zahlenhaus ${String(d2)}`,
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'PM4', force: { etagen: 2, dachFehlt: false } },
      scene: { kind: 'none' },
      story: `In diesem Zahlenhaus steht oben die ${String(d2)}.`,
      parts: [
        {
          id: `${prefix}-t2-a`,
          question: 'Fülle die zwei leeren Zimmer im Zahlenhaus aus.',
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: d2, given: true },
              { id: 'r0l', value: 3, given: true },
              { id: 'r0r', value: d2 - 3, given: false },
              { id: 'r1l', value: d2 - 2, given: false },
              { id: 'r1r', value: 2, given: true },
            ],
          },
          hints: [
            `Jede Etage ergibt zusammen ${String(d2)}.`,
            `Oben: 3 + ? = ${String(d2)}. Unten: ? + 2 = ${String(d2)}.`,
          ],
          explanation: `3 + ${String(d2 - 3)} = ${String(d2)}. ${String(d2 - 2)} + 2 = ${String(d2)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t3`,
      title: `Dachzahl gesucht`,
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM4', force: { etagen: 2, dachFehlt: true } },
      scene: { kind: 'none' },
      story: 'Nanu, hier ist das Dach noch leer! Die erste Etage verrät dir die Dachzahl.',
      parts: [
        {
          id: `${prefix}-t3-a`,
          question: 'Rechne erst das Dach aus und dann das leere Zimmer.',
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: d3, given: false },
              { id: 'r0l', value: 4, given: true },
              { id: 'r0r', value: d3 - 4, given: true },
              { id: 'r1l', value: 2, given: true },
              { id: 'r1r', value: d3 - 2, given: false },
            ],
          },
          hints: [
            `In der ersten Etage stehen 4 und ${String(d3 - 4)}. Rechne sie zusammen für das Dach.`,
            `Im Dach steht ${String(d3)}. Unten fehlt noch ${String(d3)} − 2.`,
          ],
          explanation: `4 + ${String(d3 - 4)} = ${String(d3)}. 2 + ${String(d3 - 2)} = ${String(d3)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t4`,
      title: `Großes Zahlenhaus ${String(d4)}`,
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM4', force: { etagen: 3, dachFehlt: false } },
      scene: { kind: 'none' },
      story: `Ein hohes Zahlenhaus mit drei Etagen und der ${String(d4)} im Dach.`,
      parts: [
        {
          id: `${prefix}-t4-a`,
          question: 'Fülle die leeren Zimmer in allen Etagen aus.',
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: d4, given: true },
              { id: 'r0l', value: 1, given: true },
              { id: 'r0r', value: d4 - 1, given: false },
              { id: 'r1l', value: d4 - 3, given: false },
              { id: 'r1r', value: 3, given: true },
              { id: 'r2l', value: 4, given: true },
              { id: 'r2r', value: d4 - 4, given: true },
            ],
          },
          hints: [
            `Zwei Zimmer nebeneinander ergeben immer ${String(d4)}.`,
            `Oben: 1 + ? = ${String(d4)}. Mitte: ? + 3 = ${String(d4)}.`,
          ],
          explanation: `1 + ${String(d4 - 1)} = ${String(d4)}. ${String(d4 - 3)} + 3 = ${String(d4)}. 4 + ${String(d4 - 4)} = ${String(d4)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t5`,
      title: `Das Zehner-Haus`,
      difficulty: 4,
      authoredFor: 1,
      variant: { template: 'PM4', force: { etagen: 3, dachFehlt: false } },
      scene: { kind: 'none' },
      story: 'Im Zehner-Haus wohnen die verliebten Zahlen, die zusammen 10 ergeben.',
      parts: [
        {
          id: `${prefix}-t5-a`,
          question: 'Fülle alle leeren Zimmer im Zehner-Haus aus.',
          answer: {
            type: 'grid',
            shape: 'house',
            unit: 'number',
            cells: [
              { id: 'dach', value: d5, given: true },
              { id: 'r0l', value: (base % 4) + 1, given: true },
              { id: 'r0r', value: 10 - ((base % 4) + 1), given: false },
              { id: 'r1l', value: 5, given: false },
              { id: 'r1r', value: 5, given: true },
              { id: 'r2l', value: 8, given: true },
              { id: 'r2r', value: 2, given: true },
            ],
          },
          hints: [
            'Jede Etage ergibt zusammen genau 10.',
            `Wie viel fehlt von ${String((base % 4) + 1)} bis 10? Und wie viel fehlt von 5 bis 10?`,
          ],
          explanation: `${String((base % 4) + 1)} + ${String(10 - ((base % 4) + 1))} = 10. 5 + 5 = 10. 8 + 2 = 10.`,
        },
      ],
    },
  ];
}

function pyramidTasks(prefix: string, base: number): Task[] {
  const w1a = (base % 3) + 2;
  const w1b = ((base + 1) % 3) + 3;
  const w1top = w1a + w1b;

  const w2top = 8 + (base % 3);
  const w2a = 3 + (base % 2);
  const w2b = w2top - w2a;

  const ta = 2 + (base % 2);
  const tb = 3 + ((base + 1) % 2);
  const tc = 1 + (base % 3);

  const seqStart = (base % 3) + 1;
  const seqStep = base % 2 === 0 ? 2 : 1;
  const seqVals = [seqStart, seqStart + seqStep, seqStart + 2 * seqStep, seqStart + 3 * seqStep];

  const c1 = (base % 3) + 2;
  const c2 = ((base + 1) % 4) + 3;
  const c3 = ((base + 2) % 3) + 4;

  return [
    {
      id: `${prefix}-t1`,
      title: 'Zahlenpyramide bauen',
      difficulty: 2,
      authoredFor: 1,
      variant: { template: 'PM5', force: { unten: false } },
      scene: { kind: 'none' },
      story: 'Zwei Steine nebeneinander ergeben zusammen den Stein darüber.',
      parts: [
        {
          id: `${prefix}-t1-a`,
          question: 'Welche Zahl gehört oben auf die Zahlenmauer?',
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
            'Zähle die zwei unteren Steine zusammen.',
            `Rechne ${String(w1a)} + ${String(w1b)}.`,
          ],
          explanation: `${String(w1a)} + ${String(w1b)} = ${String(w1top)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t2`,
      title: 'Stein unten gesucht',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM5', force: { unten: true } },
      scene: { kind: 'none' },
      story: 'Hier steht der oberste Stein schon fest, aber unten fehlt einer.',
      parts: [
        {
          id: `${prefix}-t2-a`,
          question: 'Welche Zahl fehlt unten rechts in der Zahlenmauer?',
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
            `Unten links steht ${String(w2a)}, oben steht ${String(w2top)}.`,
            `Wie viel fehlt von ${String(w2a)} noch bis ${String(w2top)}?`,
          ],
          explanation: `${String(w2a)} + ${String(w2b)} = ${String(w2top)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t3`,
      title: 'Das Sternen-Dreieck',
      difficulty: 3,
      authoredFor: 1,
      variant: { template: 'PM6' },
      scene: { kind: 'none' },
      story: 'Jede Zahl außen ist so groß wie die zwei Zahlen innen daneben.',
      parts: [
        {
          id: `${prefix}-t3-a`,
          question: 'Fülle die leeren Außenfelder im Rechendreieck aus.',
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
          explanation: `${String(ta)} + ${String(tb)} = ${String(ta + tb)}. ${String(tb)} + ${String(tc)} = ${String(tb + tc)}.`,
        },
      ],
    },
    {
      id: `${prefix}-t4`,
      title: 'Die Planeten-Reihe',
      difficulty: 3,
      authoredFor: 1,
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
      story: 'Auf den Leuchtsteinen geht es immer im gleichen Schritt weiter.',
      parts: [
        {
          id: `${prefix}-t4-a`,
          question: 'Welche Zahl kommt als Nächstes?',
          answer: { type: 'number', correct: seqVals[3] ?? 4 },
          mistakes: [
            {
              value: (seqVals[2] ?? 3) + seqStep + 1,
              feedback: `Es kommt immer ${String(seqStep)} dazu.`,
            },
          ],
          hints: [
            'Schau, wie viel von einem Stein zum nächsten dazukommt.',
            `Es kommt immer ${String(seqStep)} dazu: ${String(seqVals[2])} + ${String(seqStep)}.`,
          ],
          explanation: `${seqVals.join(', ')}. Als Nächstes kommt ${String(seqVals[3])}.`,
        },
      ],
    },
    {
      id: `${prefix}-t5`,
      title: 'Der Weltraum-Tresor',
      difficulty: 4,
      authoredFor: 1,
      variant: { template: 'code', force: { raeder: 3, punkte: true } },
      scene: {
        kind: 'clues',
        clues: [
          { symbol: 'stern', text: `${String(c1 - 1)} + 1`, dots: [c1 - 1, 1] },
          { symbol: 'muschel', text: `${String(c2 - 2)} + 2`, dots: [c2 - 2, 2] },
          { symbol: 'fisch', text: `${String(c3 - 2)} + 2`, dots: [c3 - 2, 2] },
        ],
      },
      story: 'Die Schatzkammer auf dem Planeten hat ein Zahlenschloss mit drei Rädern.',
      parts: [
        {
          id: `${prefix}-t5-a`,
          question: 'Löse die drei Aufgaben und stelle den Code am Schloss ein.',
          answer: { type: 'code', digits: [c1, c2, c3] },
          hints: [
            'Rechne jede Karte einzeln aus und stelle das passende Rad ein.',
            `Beim Stern: ${String(c1 - 1)} + 1 = ${String(c1)}.`,
          ],
          explanation: `Stern: ${String(c1)}. Muschel: ${String(c2)}. Fisch: ${String(c3)}. Der Code ist ${String(c1)}, ${String(c2)}, ${String(c3)}.`,
          praise: 'Klick! Die Weltraum-Kammer ist offen!',
        },
      ],
    },
  ];
}

interface PlanetSeed {
  id: string;
  number: number;
  name: string;
  shortName: string;
  subtitle: string;
  icon: string;
  story: string[];
  factTitle: string;
  fact: string;
  s1Title: string;
  s2Title: string;
  s3Title: string;
  findlinge: [
    { id: string; name: string; text: string },
    { id: string; name: string; text: string },
    { id: string; name: string; text: string },
  ];
}

const PLANET_SEEDS: readonly PlanetSeed[] = [
  {
    id: 'mond',
    number: 1,
    name: 'Der Mond',
    shortName: 'Mond',
    subtitle: 'Unser heller Nachbar in der Nacht',
    icon: 'planet-mond',
    story: [
      'Juhu, wir landen zuerst auf dem Mond! Er kreist ganz nah um unsere Erde.',
      'Auf dem Mond gibt es keine Luft und keinen Wind. Deshalb sieht man dort heute noch die Fußabdrücke der ersten Astronauten!',
      'Außerdem kann man auf dem Mond riesige Luftsprünge machen, weil alles sechsmal leichter ist als auf der Erde.',
    ],
    factTitle: 'Wissen vom Mond',
    fact: 'Auf dem Mond gibt es keinen Wind und keinen Regen. Fußspuren im grauen Mondstaub bleiben deshalb Millionen Jahre lang erhalten!',
    s1Title: 'Krater-Sprünge',
    s2Title: 'Mond-Zahlenhäuser',
    s3Title: 'Mond-Pyramiden',
    findlinge: [
      {
        id: 'mondstein',
        name: 'Glitzernder Mondstein',
        text: 'Ein silbergrauer Stein direkt aus einem Mondkrater.',
      },
      {
        id: 'mondflagge',
        name: 'Kikos Mond-Wimpel',
        text: 'Steht fest im Mondstaub, auch ganz ohne Wind.',
      },
      {
        id: 'mondkompass',
        name: 'Sternen-Weiser',
        text: 'Zeigt von der Mondbasis immer den Weg zurück zur Erde.',
      },
    ],
  },
  {
    id: 'merkur',
    number: 2,
    name: 'Merkur',
    shortName: 'Merkur',
    subtitle: 'Der flinke Sonnen-Planet',
    icon: 'planet-merkur',
    story: [
      'Weiter geht es zum Merkur! Er ist der kleinste Planet und saust am allerschnellsten um die Sonne.',
      'Tagsüber wird es auf dem Merkur glühend heiß, aber nachts wird es eisig kalt.',
      'Seine Oberfläche sieht mit den vielen runden Kratern fast so aus wie unser Mond!',
    ],
    factTitle: 'Wissen vom Merkur',
    fact: 'Merkur ist der schnellste Planet im Sonnensystem: Für eine ganze Runde um die Sonne braucht er nur 88 Tage!',
    s1Title: 'Sonnen-Flitzer',
    s2Title: 'Merkur-Zahlenhäuser',
    s3Title: 'Merkur-Pyramiden',
    findlinge: [
      {
        id: 'sonnenkristall',
        name: 'Sonnen-Kristall',
        text: 'Funkelt warm im hellen Licht nahe der Sonne.',
      },
      {
        id: 'merkurfeder',
        name: 'Flinke Flügelfeder',
        text: 'Erinnert an den schnellen Lauf des Merkur um die Sonne.',
      },
      {
        id: 'merkurtaler',
        name: 'Krater-Medaille',
        text: 'Gefunden am Rand eines tiefen Merkur-Kraters.',
      },
    ],
  },
  {
    id: 'venus',
    number: 3,
    name: 'Venus',
    shortName: 'Venus',
    subtitle: 'Der strahlende Abendstern',
    icon: 'planet-venus',
    story: [
      'Schau mal, wie hell die Venus glitzert! Am Abendhimmel sieht man sie oft als ersten hellen Punkt.',
      'Dicke goldgelbe Wolken hüllen die ganze Venus wie eine warme Decke ein.',
      'Und das Verrückteste: Die Venus dreht sich genau andersherum als die Erde – dort geht die Sonne im Westen auf!',
    ],
    factTitle: 'Wissen von der Venus',
    fact: 'Die Venus dreht sich rückwärts und so langsam, dass ein einziger Tag auf der Venus länger dauert als ein ganzes Venus-Jahr!',
    s1Title: 'Wolken-Flug',
    s2Title: 'Venus-Zahlenhäuser',
    s3Title: 'Leucht-Pyramiden',
    findlinge: [
      {
        id: 'wolkenspiegel',
        name: 'Goldener Wolkenspiegel',
        text: 'Glänzt genauso hell wie die dichten Wolken der Venus.',
      },
      {
        id: 'venusperle',
        name: 'Morgenstern-Perle',
        text: 'Leuchtet im Dunkeln wie der helle Abendstern.',
      },
      {
        id: 'abendstern',
        name: 'Goldener Venus-Stern',
        text: 'Ein funkelndes Erinnerungsstück an den heißesten Planeten.',
      },
    ],
  },
  {
    id: 'mars',
    number: 4,
    name: 'Mars',
    shortName: 'Mars',
    subtitle: 'Der rote Wüsten-Planet',
    icon: 'planet-mars',
    story: [
      'Jetzt landen wir auf dem roten Planeten Mars! Überall liegt rostrot leuchtender Wüstensand.',
      'Hier steht der Olympus Mons – das ist der höchste Berg im ganzen Sonnensystem, dreimal so hoch wie der Mount Everest!',
      'Kleine Roboter-Autos mit Rädern rollen über den Mars und schicken spannende Fotos zur Erde.',
    ],
    factTitle: 'Wissen vom Mars',
    fact: 'Der Mars ist rot, weil sein Sand viel Eisen enthält, das genau wie ein altes Fahrrad rostet. Und auf ihm steht der höchste Vulkan im Sonnensystem!',
    s1Title: 'Rover-Rennen',
    s2Title: 'Mars-Zahlenhäuser',
    s3Title: 'Vulkan-Pyramiden',
    findlinge: [
      {
        id: 'marskristall',
        name: 'Roter Mars-Kristall',
        text: 'Gefunden am Fuß des riesigen Vulkans Olympus Mons.',
      },
      {
        id: 'marsrover',
        name: 'Kleines Rover-Rad',
        text: 'Rollt mühelos über jeden roten Wüstenhügel.',
      },
      {
        id: 'roter-stein',
        name: 'Rostroter Wüstenstein',
        text: 'Schimmert warm wie der rote Himmel auf dem Mars.',
      },
    ],
  },
  {
    id: 'jupiter',
    number: 5,
    name: 'Jupiter',
    shortName: 'Jupiter',
    subtitle: 'Der König der Riesenplaneten',
    icon: 'planet-jupiter',
    story: [
      'Wow, mach die Augen auf: Vor uns schwebt der riesige Jupiter! Er ist der allergrößte Planet von allen.',
      'In seinen bunten Wolkenstreifen wirbelt ein roter Fleck – das ist ein gigantischer Wirbelsturm, größer als unsere ganze Erde!',
      'Weil Jupiter aus Gas besteht, landen wir auf einem seiner vielen spannenden Monde.',
    ],
    factTitle: 'Wissen vom Jupiter',
    fact: 'Jupiter ist so riesig, dass unsere Erde mehr als tausendmal in ihn hineinpassen würde! Um ihn kreisen über 90 Monde.',
    s1Title: 'Mond-Hüpfen',
    s2Title: 'Jupiter-Zahlenhäuser',
    s3Title: 'Riesen-Pyramiden',
    findlinge: [
      {
        id: 'sturmauge',
        name: 'Wirbel-Edelstein',
        text: 'Seine roten Streifen sehen aus wie der Große Rote Fleck.',
      },
      {
        id: 'jupitermond',
        name: 'Kleine Mond-Kugel',
        text: 'Erinnert an die vier großen Monde Io, Europa, Ganymed und Kallisto.',
      },
      {
        id: 'riesenkugel',
        name: 'Gestreifte Jupitermurmel',
        text: 'Die größte und prächtigste Murmel im ganzen Kosmos.',
      },
    ],
  },
  {
    id: 'saturn',
    number: 6,
    name: 'Saturn',
    shortName: 'Saturn',
    subtitle: 'Der Herr der glitzernden Ringe',
    icon: 'planet-saturn',
    story: [
      'Willkommen beim Saturn! Er trägt die schönsten, breitesten Glitzerringe im ganzen Weltall.',
      'Weißt du, woraus seine Ringe bestehen? Aus unzähligen glitzernden Eisbrocken und Schneebällen, die um ihn tanzen!',
      'Saturn selbst ist dabei so leicht wie ein luftiger Badeschwamm – in einer riesigen Badewanne würde er oben schwimmen!',
    ],
    factTitle: 'Wissen vom Saturn',
    fact: 'Die berühmten Ringe des Saturn bestehen aus Milliarden glitzernden Eis- und Gesteinsbrocken – manche klein wie Schneeflocken, andere groß wie Häuser!',
    s1Title: 'Ring-Tanz',
    s2Title: 'Saturn-Zahlenhäuser',
    s3Title: 'Ring-Pyramiden',
    findlinge: [
      {
        id: 'ringstein',
        name: 'Funkelnder Ring-Kiesel',
        text: 'Ein glitzerndes Stück direkt aus dem äußeren Saturnring.',
      },
      {
        id: 'eiskristall',
        name: 'Kosmischer Eiskristall',
        text: 'Glitzert im Sonnenlicht wie tausend kleine Spiegel.',
      },
      {
        id: 'saturnring',
        name: 'Goldener Ring-Reif',
        text: 'Ein kleiner goldener Ring wie der Schmuck des Saturn.',
      },
    ],
  },
  {
    id: 'uranus',
    number: 7,
    name: 'Uranus',
    shortName: 'Uranus',
    subtitle: 'Der rollende Eisriese',
    icon: 'planet-uranus',
    story: [
      'Brrr, zieh deinen Raumanzug warm an! Wir sind beim hellblauen Eisriesen Uranus angekommen.',
      'Uranus macht etwas total Lustiges: Während alle anderen Planeten wie ein Kreisel aufrecht drehen, liegt Uranus auf der Seite!',
      'Er kullert wie eine hellblaue Murmel auf seiner Bahn rund um die Sonne.',
    ],
    factTitle: 'Wissen vom Uranus',
    fact: 'Uranus ist der einzige Planet, der fast komplett auf der Seite liegt und wie eine rollende Kugel um die Sonne kullert!',
    s1Title: 'Kuller-Bahn',
    s2Title: 'Uranus-Zahlenhäuser',
    s3Title: 'Eis-Pyramiden',
    findlinge: [
      {
        id: 'eisstern',
        name: 'Hellblauer Eisstern',
        text: 'Leuchtet in genau demselben Türkisblau wie der Uranus.',
      },
      {
        id: 'uranusring',
        name: 'Senkrechter Lichtring',
        text: 'Steht hochkant wie die feinen Ringe des rollenden Planeten.',
      },
      {
        id: 'blauer-stein',
        name: 'Frost-Edelstein',
        text: 'Fühlt sich kühl und glatt an wie gefrorene Wolken.',
      },
    ],
  },
  {
    id: 'neptun',
    number: 8,
    name: 'Neptun',
    shortName: 'Neptun',
    subtitle: 'Der tiefblaue Windplanet am Rand',
    icon: 'planet-neptun',
    story: [
      'Wir haben den achten und äußersten Planeten erreicht: den tiefblauen Neptun!',
      'Von hier draußen sieht die Sonne nur noch aus wie ein besonders heller, funkelnder Stern.',
      'Auf dem Neptun wehen die schnellsten Winde im ganzen Sonnensystem – halte deinen Astronautenhelm gut fest!',
    ],
    factTitle: 'Wissen vom Neptun',
    fact: 'Neptun ist so weit von der Sonne entfernt, dass er 165 Erdenjahre für eine einzige Runde um die Sonne braucht!',
    s1Title: 'Sturm-Flug',
    s2Title: 'Neptun-Zahlenhäuser',
    s3Title: 'Neptun-Finale',
    findlinge: [
      {
        id: 'windmuschel',
        name: 'Tiefblaue Wind-Spirale',
        text: 'Summt leise wie der schnelle Sturmwind auf dem Neptun.',
      },
      {
        id: 'neptunstein',
        name: 'Ozeanblauer Neptunstein',
        text: 'Leuchtet tiefblau wie das äußerste Ende unseres Sonnensystems.',
      },
      {
        id: 'kosmoskrone',
        name: 'Die große Kosmos-Krone',
        text: 'Der höchste Schatz für echte Weltraum-Rechenprofis!',
      },
    ],
  },
];

export const KOSMOS_PLANETS: readonly KosmosPlanet[] = PLANET_SEEDS.map((seed, pIdx) => {
  const n1 = pIdx * 3 + 1;
  const n2 = pIdx * 3 + 2;
  const n3 = pIdx * 3 + 3;
  const prefix = `k${String(seed.number)}`;

  const s1: Station = {
    id: `${prefix}-s1`,
    world: 'kosmos',
    number: n1,
    title: `${seed.shortName}: ${seed.s1Title}`,
    icon: 'station-rakete',
    skillLabel: 'Plus, Minus, Verdoppeln und Ergänzen',
    minutes: 6,
    intro: [
      `Willkommen auf Station 1 bei ${seed.name}!`,
      'Wir starten unsere Rechen-Düsen mit spannenden Plus- und Minus-Aufgaben.',
    ],
    findling: seed.findlinge[0],
    recap: `Stark gerechnet! Du hast die Plus-Minus-Mission bei ${seed.name} gemeistert.`,
    practiceTopic: 'plus-minus',
    tasks: plusMinusTasks(`${prefix}-s1`, pIdx + 1),
  };

  const s2: Station = {
    id: `${prefix}-s2`,
    world: 'kosmos',
    number: n2,
    title: seed.s2Title,
    icon: 'station-zahlenhaus',
    skillLabel: 'Zahlenhäuser schlau zerlegen',
    minutes: 6,
    intro: [
      `Hier stehen die Zahlenhäuser von ${seed.name}.`,
      'Oben im Dach steht die Zielzahl. Beide Zimmer einer Etage ergeben zusammen immer die Dachzahl!',
    ],
    findling: seed.findlinge[1],
    recap: `Klasse! Alle Zahlenhäuser bei ${seed.name} sind fertig gebaut.`,
    practiceTopic: 'plus-minus',
    tasks: houseTasks(`${prefix}-s2`, pIdx + 1),
  };

  const s3: Station = {
    id: `${prefix}-s3`,
    world: 'kosmos',
    number: n3,
    title: seed.s3Title,
    icon: 'station-pyramide',
    skillLabel: 'Zahlenmauern, Dreiecke und Weltraum-Knobeln',
    minutes: 7,
    intro: [
      `Letzte Station bei ${seed.name}: Jetzt wird geknobelt!`,
      'Baue die Zahlenmauern, fülle das Rechendreieck und knacke den Weltraum-Code!',
    ],
    findling: seed.findlinge[2],
    recap: `Fantastisch! Du hast alle drei Stationen bei ${seed.name} geschafft und die Planeten-Wissenskarte freigeschaltet!`,
    practiceTopic: 'raetsel',
    progressStyle: 'locks',
    tasks: pyramidTasks(`${prefix}-s3`, pIdx + 1),
  };

  return {
    id: seed.id,
    number: seed.number,
    name: seed.name,
    shortName: seed.shortName,
    subtitle: seed.subtitle,
    icon: seed.icon,
    story: seed.story,
    factCard: {
      id: `kosmos-wissen-${seed.id}`,
      title: seed.factTitle,
      fact: seed.fact,
    },
    stations: [s1, s2, s3],
  };
});

export const KOSMOS_STATIONS: Station[] = KOSMOS_PLANETS.flatMap((planet) => planet.stations);

export function planetById(id: string): KosmosPlanet | undefined {
  return KOSMOS_PLANETS.find((p) => p.id === id);
}

export function planetOfStation(stationId: string): KosmosPlanet | undefined {
  return KOSMOS_PLANETS.find((p) => p.stations.some((s) => s.id === stationId));
}
