/** Für erschöpfende switch-Anweisungen: Ein neuer Fall erzeugt einen Compilerfehler. */
export function assertNever(value: never): never {
  throw new Error(`Unerwarteter Fall: ${JSON.stringify(value)}`);
}
