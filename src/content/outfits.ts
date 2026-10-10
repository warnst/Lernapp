import type { KikoSlot, NestSlot } from '@/domain/types';

// Kikos Kleiderschrank und Nest (docs/12 4.1): Teile, Plätze, Namen und Kikos Sprüche.
// Die Zeichnungen stehen in src/illustrations/KikoItems.tsx und NestRoom.tsx.

export interface KikoItem {
  id: string;
  name: string;
  slot: KikoSlot;
  /** Kikos Spruch beim Anziehen (wird vorgelesen) */
  line: string;
  /** nur für besondere Erfolge, nie in einer normalen Truhe */
  special?: 'detektiv' | 'wissen' | 'leuchtfeuer' | 'pass';
}

export interface NestItem {
  id: string;
  name: string;
  slot: NestSlot;
  line: string;
}

export const KIKO_SLOTS: { id: KikoSlot; label: string }[] = [
  { id: 'kopf', label: 'Kopf' },
  { id: 'augen', label: 'Augen' },
  { id: 'gesicht', label: 'Gesicht' },
  { id: 'hals', label: 'Hals' },
  { id: 'ruecken', label: 'Rücken' },
  { id: 'hand', label: 'Flügel' },
  { id: 'fuesse', label: 'Füße' },
];

export const NEST_SLOTS: { id: NestSlot; label: string }[] = [
  { id: 'boden', label: 'Boden' },
  { id: 'wand', label: 'Wand' },
  { id: 'decke', label: 'Decke' },
  { id: 'fenster', label: 'Fenster' },
  { id: 'haustier', label: 'Haustier' },
];

export const KIKO_ITEMS: readonly KikoItem[] = [
  // Kopf
  { id: 'piratenhut', name: 'Piratenhut', slot: 'kopf', line: "Arrr! Käpt'n Kiko meldet sich!" },
  { id: 'partyhut', name: 'Partyhütchen', slot: 'kopf', line: 'Juhu, Party im Turm!' },
  {
    id: 'kochmuetze',
    name: 'Kochmütze',
    slot: 'kopf',
    line: 'Heute koche ich Muschelsuppe. Mit Kekskrümeln!',
  },
  {
    id: 'wikingerhelm',
    name: 'Wikingerhelm',
    slot: 'kopf',
    line: 'Hoho! Kiko, der mutige Wikinger!',
  },
  {
    id: 'ananas',
    name: 'Ananas-Hut',
    slot: 'kopf',
    line: 'Ich bin eine Ananas. Nicht anknabbern!',
  },
  { id: 'ente', name: 'Gummiente', slot: 'kopf', line: 'Quak! Äh … ich meine: Hallo!' },
  {
    id: 'astronautenhelm',
    name: 'Astronautenhelm',
    slot: 'kopf',
    line: 'Drei, zwei, eins … Abflug zum Mond!',
  },
  {
    id: 'zauberhut',
    name: 'Zauberhut',
    slot: 'kopf',
    line: 'Simsalabim – ein Rätsel!',
    special: 'pass',
  },
  {
    id: 'detektivhut',
    name: 'Detektivhut',
    slot: 'kopf',
    line: 'Hmm … eine heiße Spur!',
    special: 'detektiv',
  },
  {
    id: 'doktorhut',
    name: 'Doktorhut',
    slot: 'kopf',
    line: 'Ich weiß jetzt sooo viel!',
    special: 'wissen',
  },
  {
    id: 'krone',
    name: 'Krone',
    slot: 'kopf',
    line: 'Ich bin der Leuchtturm-König!',
    special: 'leuchtfeuer',
  },
  // Augen
  { id: 'sonnenbrille', name: 'Sonnenbrille', slot: 'augen', line: 'Ganz schön cool, oder?' },
  { id: 'herzbrille', name: 'Herzbrille', slot: 'augen', line: 'Ich hab dich lieb, Rätselturm!' },
  { id: 'taucherbrille', name: 'Taucherbrille', slot: 'augen', line: 'Blubb! Ab ins Meer!' },
  {
    id: 'augenklappe',
    name: 'Augenklappe',
    slot: 'augen',
    line: 'Mit einem Auge sehe ich trotzdem alles!',
  },
  { id: 'monokel', name: 'Monokel', slot: 'augen', line: 'Sehr vornehm, sehr vornehm.' },
  // Gesicht
  { id: 'schnurrbart', name: 'Schnurrbart', slot: 'gesicht', line: 'Der kitzelt am Schnabel!' },
  { id: 'clownsnase', name: 'Clownsnase', slot: 'gesicht', line: 'Tröt, tröt! Ich bin ein Clown!' },
  {
    id: 'glitzerwangen',
    name: 'Glitzerwangen',
    slot: 'gesicht',
    line: 'Ich glitzere wie ein Stern!',
  },
  // Hals
  { id: 'schal', name: 'Schal', slot: 'hals', line: 'Schön warm und kuschelig.' },
  { id: 'fliege', name: 'Fliege', slot: 'hals', line: 'Ich bin bereit für ein Fest!' },
  { id: 'blumenkette', name: 'Blumenkette', slot: 'hals', line: 'Aloha! Die duftet so gut!' },
  { id: 'medaille', name: 'Medaille', slot: 'hals', line: 'Eine Medaille für das beste Knobeln!' },
  { id: 'halstuch', name: 'Halstuch', slot: 'hals', line: 'Yeehaw! Kiko reitet los!' },
  // Rücken
  { id: 'umhang', name: 'Superhelden-Umhang', slot: 'ruecken', line: 'Super-Kiko ist da!' },
  { id: 'feenfluegel', name: 'Feenflügel', slot: 'ruecken', line: 'Jetzt habe ich vier Flügel!' },
  { id: 'rucksack', name: 'Rucksack', slot: 'ruecken', line: 'Da passen viele Kekse rein.' },
  {
    id: 'schwimmring',
    name: 'Schwimmring',
    slot: 'ruecken',
    line: 'Plantsch! Wer kommt mit baden?',
  },
  // Flügel
  {
    id: 'lupe',
    name: 'Lupe',
    slot: 'hand',
    line: 'Mit der Lupe finde ich jede Spur!',
    special: 'detektiv',
  },
  { id: 'zauberstab', name: 'Zauberstab', slot: 'hand', line: 'Hokuspokus, Rätselfokus!' },
  { id: 'eis', name: 'Eistüte', slot: 'hand', line: 'Mmmh, Erdbeereis!' },
  { id: 'banane', name: 'Bananen-Telefon', slot: 'hand', line: 'Hallo? Die Banane klingelt!' },
  { id: 'fernrohr', name: 'Fernrohr', slot: 'hand', line: 'Land in Sicht!' },
  { id: 'faehnchen', name: 'Fähnchen', slot: 'hand', line: 'Hurra, hurra!' },
  // Füße
  {
    id: 'gummistiefel',
    name: 'Gummistiefel',
    slot: 'fuesse',
    line: 'Jetzt kann ich in jede Pfütze springen!',
  },
  {
    id: 'rollschuhe',
    name: 'Rollschuhe',
    slot: 'fuesse',
    line: 'Wuiii, so schnell war ich noch nie!',
  },
  { id: 'flossen', name: 'Schwimmflossen', slot: 'fuesse', line: 'Flipp, flapp, flipp, flapp!' },
  { id: 'ballettschuhe', name: 'Ballettschuhe', slot: 'fuesse', line: 'Schau mal, ich tanze!' },
];

export const NEST_ITEMS: readonly NestItem[] = [
  // Boden
  { id: 'teppich-welle', name: 'Wellen-Teppich', slot: 'boden', line: 'Ein Teppich wie das Meer!' },
  {
    id: 'teppich-stern',
    name: 'Sternen-Teppich',
    slot: 'boden',
    line: 'Ich stehe auf einem Stern!',
  },
  {
    id: 'schatzkiste',
    name: 'Schatzkiste',
    slot: 'boden',
    line: 'Da sind meine Lieblingssachen drin.',
  },
  { id: 'sitzkissen', name: 'Sitzkissen', slot: 'boden', line: 'So weich! Ich mach mal Pause.' },
  { id: 'mini-pool', name: 'Mini-Pool', slot: 'boden', line: 'Ein Pool im Turm! Platsch!' },
  // Wand
  {
    id: 'bilderrahmen',
    name: 'Bilderrahmen',
    slot: 'wand',
    line: 'Hier hängen unsere schönsten Bilder.',
  },
  {
    id: 'piratenflagge',
    name: 'Piratenflagge',
    slot: 'wand',
    line: 'Arrr, das ist jetzt ein Piratennest!',
  },
  { id: 'buecherregal', name: 'Bücherregal', slot: 'wand', line: 'Hier steht mein Wissensbuch.' },
  { id: 'fischuhr', name: 'Fisch-Uhr', slot: 'wand', line: 'Tick, tack, blubb!' },
  // Decke
  { id: 'lichterkette', name: 'Lichterkette', slot: 'decke', line: 'Wie gemütlich das leuchtet!' },
  {
    id: 'sternenmobile',
    name: 'Sternen-Mobile',
    slot: 'decke',
    line: 'Die Sterne drehen sich ganz leise.',
  },
  { id: 'discokugel', name: 'Discokugel', slot: 'decke', line: 'Glitzer, glitzer! Tanzt du mit?' },
  {
    id: 'haengematte',
    name: 'Hängematte',
    slot: 'decke',
    line: 'Hin und her … ich werde ganz müde.',
  },
  // Fenster
  { id: 'vorhaenge', name: 'Vorhänge', slot: 'fenster', line: 'Schöne Vorhänge für mein Fenster!' },
  {
    id: 'fensterfernrohr',
    name: 'Fernrohr am Fenster',
    slot: 'fenster',
    line: 'Ich sehe Schiffe auf dem Meer!',
  },
  {
    id: 'blumenkasten',
    name: 'Blumenkasten',
    slot: 'fenster',
    line: 'Die Blumen gieße ich jeden Tag.',
  },
  // Haustier
  {
    id: 'haustier-krebs',
    name: 'Kleiner Krebs',
    slot: 'haustier',
    line: 'Das ist Kalle, mein kleiner Krebs!',
  },
  {
    id: 'goldfisch',
    name: 'Goldfisch',
    slot: 'haustier',
    line: 'Blubb, sagt mein Goldfisch Goldi.',
  },
  {
    id: 'schildkroete',
    name: 'Schildkröte',
    slot: 'haustier',
    line: 'Langsam, aber immer da: meine Schildkröte Tilda.',
  },
  {
    id: 'gluehwuermchen',
    name: 'Glühwürmchen',
    slot: 'haustier',
    line: 'Mein Glühwürmchen leuchtet die ganze Nacht.',
  },
];
