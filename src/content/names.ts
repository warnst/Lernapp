// Vornamen mit Pronomen (docs/05 3.2). Profilnamen der App kommen nie in Aufgaben vor.

export interface PersonName {
  name: string;
  pron: 'sie' | 'er';
}

export const NAMES: readonly PersonName[] = [
  { name: 'Lina', pron: 'sie' },
  { name: 'Ben', pron: 'er' },
  { name: 'Mia', pron: 'sie' },
  { name: 'Emil', pron: 'er' },
  { name: 'Noah', pron: 'er' },
  { name: 'Ida', pron: 'sie' },
  { name: 'Paul', pron: 'er' },
  { name: 'Mara', pron: 'sie' },
  { name: 'Yusuf', pron: 'er' },
  { name: 'Aylin', pron: 'sie' },
  { name: 'Finn', pron: 'er' },
  { name: 'Lea', pron: 'sie' },
];

/** Zahlungsmittel im Dativ für „bezahlt mit …“ (docs/05 3.3). */
export const PAYMENT_DATIVE: Partial<Record<number, string>> = {
  5: 'einer 5-Cent-Münze',
  10: 'einer 10-Cent-Münze',
  100: 'einer 1-Euro-Münze',
  200: 'einer 2-Euro-Münze',
  500: 'einem 5-Euro-Schein',
  1000: 'einem 10-Euro-Schein',
  2000: 'einem 20-Euro-Schein',
  5000: 'einem 50-Euro-Schein',
};
