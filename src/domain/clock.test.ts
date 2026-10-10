import { describe, expect, it } from 'vitest';
import {
  addMinutes,
  handAngles,
  sameTime,
  timeDigital,
  timeDigitalSpoken,
  timeWords,
  wrapHour,
} from './clock';

describe('Uhrzeit', () => {
  it('Wörter wie in der Grundschule', () => {
    expect(timeWords({ hour: 3, minute: 0 })).toBe('3 Uhr');
    expect(timeWords({ hour: 3, minute: 30 })).toBe('halb 4');
    expect(timeWords({ hour: 12, minute: 30 })).toBe('halb 1');
    expect(timeWords({ hour: 3, minute: 15 })).toBe('Viertel nach 3');
    expect(timeWords({ hour: 3, minute: 45 })).toBe('Viertel vor 4');
    expect(timeWords({ hour: 3, minute: 20 })).toBe('20 nach 3');
    expect(timeWords({ hour: 11, minute: 50 })).toBe('10 vor 12');
  });

  it('digital und vorgelesen', () => {
    expect(timeDigital({ hour: 3, minute: 5 })).toBe('3:05 Uhr');
    expect(timeDigitalSpoken({ hour: 3, minute: 5 })).toBe('3 Uhr 5');
    expect(timeDigitalSpoken({ hour: 9, minute: 0 })).toBe('9 Uhr');
  });

  it('Zeiger: halb 4 steht der kleine Zeiger zwischen 3 und 4', () => {
    expect(handAngles({ hour: 3, minute: 30 })).toEqual({ hour: 105, minute: 180 });
    expect(handAngles({ hour: 12, minute: 0 })).toEqual({ hour: 0, minute: 0 });
  });

  it('rechnet mit Minuten über 12 Uhr hinweg', () => {
    expect(addMinutes({ hour: 11, minute: 30 }, 45)).toEqual({ hour: 12, minute: 15 });
    expect(addMinutes({ hour: 12, minute: 15 }, 60)).toEqual({ hour: 1, minute: 15 });
    expect(addMinutes({ hour: 1, minute: 0 }, -90)).toEqual({ hour: 11, minute: 30 });
    expect(wrapHour(0)).toBe(12);
    expect(wrapHour(13)).toBe(1);
    expect(sameTime({ hour: 12, minute: 5 }, { hour: 0, minute: 5 })).toBe(true);
    expect(sameTime({ hour: 1, minute: 5 }, { hour: 1, minute: 10 })).toBe(false);
  });
});
