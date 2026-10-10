import type { OddCategory } from './pictures-types';

// Kategorien für „Was passt nicht?“ (docs/12 3.3). Kiko erklärt: „Apfel, Banane und Birne sind Obst.
// Die Möhre ist ein Gemüse.“ Jedes Ding steht in genau einer Kategorie und passt in keine andere.
// Deshalb gibt es keine Sammelkategorie „Tiere“ (Fisch und Möwe sind auch Tiere), und die Dinge am
// Himmel sind die, die immer dort sind (Vögel und Flugzeuge fliegen nur manchmal).

export const ODD_CATEGORIES: readonly OddCategory[] = [
  {
    id: 'obst',
    are: 'sind Obst',
    from: 1,
    things: [
      { icon: 'apfel', name: 'Apfel', isA: 'Der Apfel ist Obst.' },
      { icon: 'banane', name: 'Banane', isA: 'Die Banane ist Obst.' },
      { icon: 'birne', name: 'Birne', isA: 'Die Birne ist Obst.' },
      { icon: 'erdbeere', name: 'Erdbeere', isA: 'Die Erdbeere ist Obst.' },
      { icon: 'kirschen', name: 'Kirschen', isA: 'Die Kirschen sind Obst.' },
      { icon: 'zitrone', name: 'Zitrone', isA: 'Die Zitrone ist Obst.' },
      { icon: 'mango', name: 'Mango', isA: 'Die Mango ist Obst.' },
    ],
  },
  {
    id: 'gemuese',
    are: 'sind Gemüse',
    from: 1,
    things: [
      { icon: 'moehre', name: 'Möhre', isA: 'Die Möhre ist ein Gemüse.' },
      { icon: 'gurke', name: 'Gurke', isA: 'Die Gurke ist ein Gemüse.' },
      { icon: 'tomate', name: 'Tomate', isA: 'Die Tomate ist ein Gemüse.' },
      { icon: 'paprika', name: 'Paprika', isA: 'Die Paprika ist ein Gemüse.' },
      { icon: 'brokkoli', name: 'Brokkoli', isA: 'Der Brokkoli ist ein Gemüse.' },
    ],
  },
  {
    id: 'meerestiere',
    are: 'sind Meerestiere',
    from: 1,
    things: [
      { icon: 'fisch', name: 'Fisch', isA: 'Der Fisch ist ein Meerestier.' },
      { icon: 'krebs', name: 'Krebs', isA: 'Der Krebs ist ein Meerestier.' },
      { icon: 'seestern', name: 'Seestern', isA: 'Der Seestern ist ein Meerestier.' },
      { icon: 'muschel', name: 'Muschel', isA: 'Die Muschel ist ein Meerestier.' },
    ],
  },
  {
    id: 'fahrzeuge',
    are: 'sind Fahrzeuge',
    from: 1,
    things: [
      { icon: 'auto', name: 'Auto', isA: 'Das Auto ist ein Fahrzeug.' },
      { icon: 'fahrrad', name: 'Fahrrad', isA: 'Das Fahrrad ist ein Fahrzeug.' },
      { icon: 'zug', name: 'Zug', isA: 'Der Zug ist ein Fahrzeug.' },
      { icon: 'boot', name: 'Boot', isA: 'Das Boot ist ein Fahrzeug.' },
      { icon: 'flugzeug', name: 'Flugzeug', isA: 'Das Flugzeug ist ein Fahrzeug.' },
      { icon: 'rakete', name: 'Rakete', isA: 'Die Rakete ist ein Fahrzeug.' },
    ],
  },
  {
    id: 'kleidung',
    are: 'sind Kleidung',
    from: 1,
    things: [
      { icon: 'pullover', name: 'Pullover', isA: 'Der Pullover ist ein Kleidungsstück.' },
      { icon: 'socke', name: 'Socke', isA: 'Die Socke ist ein Kleidungsstück.' },
      { icon: 'hose', name: 'Hose', isA: 'Die Hose ist ein Kleidungsstück.' },
      { icon: 'muetze', name: 'Mütze', isA: 'Die Mütze ist ein Kleidungsstück.' },
      { icon: 'schuh', name: 'Schuh', isA: 'Der Schuh ist ein Kleidungsstück.' },
      { icon: 'hut', name: 'Hut', isA: 'Der Hut ist ein Kleidungsstück.' },
    ],
  },
  {
    id: 'voegel',
    are: 'sind Vögel',
    from: 2,
    things: [
      { icon: 'moewe', name: 'Möwe', isA: 'Die Möwe ist ein Vogel.' },
      { icon: 'eule', name: 'Eule', isA: 'Die Eule ist ein Vogel.' },
      { icon: 'ente', name: 'Ente', isA: 'Die Ente ist ein Vogel.' },
      { icon: 'huhn', name: 'Huhn', isA: 'Das Huhn ist ein Vogel.' },
    ],
  },
  {
    id: 'werkzeuge',
    are: 'sind Werkzeuge',
    from: 2,
    things: [
      { icon: 'hammer', name: 'Hammer', isA: 'Der Hammer ist ein Werkzeug.' },
      { icon: 'schere', name: 'Schere', isA: 'Die Schere ist ein Werkzeug.' },
      { icon: 'saege', name: 'Säge', isA: 'Die Säge ist ein Werkzeug.' },
      {
        icon: 'schraubenzieher',
        name: 'Schraubenzieher',
        isA: 'Der Schraubenzieher ist ein Werkzeug.',
      },
      { icon: 'pinsel', name: 'Pinsel', isA: 'Der Pinsel ist ein Werkzeug.' },
    ],
  },
  {
    id: 'suesses',
    are: 'sind Süßigkeiten',
    from: 2,
    things: [
      { icon: 'bonbon', name: 'Bonbon', isA: 'Das Bonbon ist eine Süßigkeit.' },
      { icon: 'lolli', name: 'Lolli', isA: 'Der Lolli ist eine Süßigkeit.' },
      { icon: 'kaugummi', name: 'Kaugummi', isA: 'Der Kaugummi ist eine Süßigkeit.' },
      { icon: 'eis', name: 'Eis', isA: 'Das Eis ist eine Süßigkeit.' },
      { icon: 'keks', name: 'Keks', isA: 'Der Keks ist eine Süßigkeit.' },
      { icon: 'muffin', name: 'Muffin', isA: 'Der Muffin ist eine Süßigkeit.' },
    ],
  },
  {
    id: 'himmel',
    are: 'sind Dinge am Himmel',
    from: 2,
    things: [
      { icon: 'sonne', name: 'Sonne', isA: 'Die Sonne leuchtet am Himmel.' },
      { icon: 'mond', name: 'Mond', isA: 'Der Mond leuchtet am Himmel.' },
      { icon: 'stern', name: 'Stern', isA: 'Der Stern leuchtet am Himmel.' },
      { icon: 'wolke', name: 'Wolke', isA: 'Die Wolke schwebt am Himmel.' },
    ],
  },
];
