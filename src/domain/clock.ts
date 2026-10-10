import type { ClockTime } from './types';

// Uhrzeit auf der Zeigeruhr (docs/13): Wörter wie in der Grundschule, Zeigerwinkel, Rechnen mit
// Minuten. Stunden immer 1–12.

/** 13 → 1, 0 → 12 */
export function wrapHour(hour: number): number {
  return ((((hour - 1) % 12) + 12) % 12) + 1;
}

/** „3 Uhr“, „halb 4“, „Viertel nach 3“, „Viertel vor 4“, sonst „20 nach 3“ / „10 vor 4“. */
export function timeWords({ hour, minute }: ClockTime): string {
  const next = wrapHour(hour + 1);
  if (minute === 0) return `${String(hour)} Uhr`;
  if (minute === 30) return `halb ${String(next)}`;
  if (minute === 15) return `Viertel nach ${String(hour)}`;
  if (minute === 45) return `Viertel vor ${String(next)}`;
  return minute < 30
    ? `${String(minute)} nach ${String(hour)}`
    : `${String(60 - minute)} vor ${String(next)}`;
}

/** Digitalanzeige „3:05 Uhr“ */
export function timeDigital({ hour, minute }: ClockTime): string {
  return `${String(hour)}:${String(minute).padStart(2, '0')} Uhr`;
}

/** Digital vorgelesen: „3 Uhr 5“ */
export function timeDigitalSpoken({ hour, minute }: ClockTime): string {
  return minute === 0 ? `${String(hour)} Uhr` : `${String(hour)} Uhr ${String(minute)}`;
}

/** Winkel der Zeiger in Grad, 0 = oben (12), im Uhrzeigersinn. */
export function handAngles({ hour, minute }: ClockTime): { hour: number; minute: number } {
  return { hour: ((hour % 12) + minute / 60) * 30, minute: minute * 6 };
}

export function addMinutes({ hour, minute }: ClockTime, minutes: number): ClockTime {
  const total = ((((hour % 12) * 60 + minute + minutes) % 720) + 720) % 720;
  return { hour: wrapHour(Math.floor(total / 60)), minute: total % 60 };
}

export function sameTime(a: ClockTime, b: ClockTime): boolean {
  return wrapHour(a.hour) === wrapHour(b.hour) && a.minute === b.minute;
}
