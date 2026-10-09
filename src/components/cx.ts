/** CSS-Klassen zusammensetzen; leere Werte fallen weg. */
export function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
