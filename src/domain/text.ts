import { formatMoney, type MoneyFormat, speakMoney } from './money';

// Geld-Tokens im Text auflösen (docs/03, Abschnitt 5.1): {{120}}, {{85|eur}}, {{200|full}}.

const TOKEN = /\{\{(\d+)(?:\|(eur|full))?\}\}/g;

function replaceTokens(text: string, format: (cents: number, mode: MoneyFormat) => string): string {
  return text.replace(TOKEN, (_match, cents: string, mode: MoneyFormat | undefined) =>
    format(Number(cents), mode ?? 'auto'),
  );
}

/** Text für die Anzeige: Tokens werden zu „1,20 €“, „85 Cent“ … */
export function renderText(text: string): string {
  return replaceTokens(text, formatMoney);
}

const SPOKEN_SYMBOLS: [RegExp, string][] = [
  [/−/g, ' minus '],
  [/\+/g, ' plus '],
  [/=/g, ' gleich '],
  [/▢/g, ' Fleck '],
];

/** Text für die Sprachausgabe: Tokens, wörtliche Beträge und Rechenzeichen werden ausgesprochen. */
export function speakText(text: string): string {
  let spoken = replaceTokens(text, speakMoney);
  spoken = spoken.replace(/(\d+),(\d{2})\s?€/g, (_match, euro: string, cent: string) =>
    Number(cent) === 0 ? `${euro} Euro` : `${euro} Euro ${String(Number(cent))}`,
  );
  spoken = spoken.replace(/(\d+)\s?€/g, '$1 Euro');
  spoken = spoken.replace(/(\d+)\s?Cent/g, '$1 Cent');
  for (const [pattern, word] of SPOKEN_SYMBOLS) spoken = spoken.replace(pattern, word);
  return spoken.replace(/\s{2,}/g, ' ').trim();
}
