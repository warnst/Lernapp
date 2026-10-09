import { afterEach, describe, expect, it, vi } from 'vitest';
import { canSpeak, stopSpeaking, toggleSpeak } from './speak';

class FakeUtterance {
  lang = '';
  rate = 1;
  voice: unknown = null;
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}

function installSpeech(voices: { lang: string; localService: boolean }[]) {
  const speech = { speaking: false, speak: vi.fn(), cancel: vi.fn(), getVoices: () => voices };
  vi.stubGlobal('speechSynthesis', speech);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  return speech;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('speak', () => {
  it('ohne Sprachausgabe passiert nichts', () => {
    expect(canSpeak()).toBe(false);
    toggleSpeak('Hallo');
    stopSpeaking();
  });

  it('liest auf Deutsch mit lokaler Stimme und Tempo 0,9', () => {
    const local = { lang: 'de-DE', localService: true };
    const speech = installSpeech([
      { lang: 'en-US', localService: true },
      { lang: 'de-AT', localService: false },
      local,
    ]);
    expect(canSpeak()).toBe(true);
    toggleSpeak('Hallo Kiko');
    const utterance = speech.speak.mock.calls[0]?.[0] as FakeUtterance;
    expect(utterance).toMatchObject({ text: 'Hallo Kiko', lang: 'de-DE', rate: 0.9, voice: local });
  });

  it('nimmt sonst irgendeine deutsche Stimme oder gar keine', () => {
    const remote = { lang: 'de-DE', localService: false };
    const speech = installSpeech([remote]);
    toggleSpeak('a');
    expect((speech.speak.mock.calls[0]?.[0] as FakeUtterance).voice).toBe(remote);
    const none = installSpeech([]);
    toggleSpeak('b');
    expect((none.speak.mock.calls[0]?.[0] as FakeUtterance).voice).toBeNull();
  });

  it('ein zweiter Aufruf stoppt die laufende Ausgabe', () => {
    const speech = installSpeech([]);
    speech.speaking = true;
    toggleSpeak('a');
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(speech.speak).not.toHaveBeenCalled();
    stopSpeaking();
    expect(speech.cancel).toHaveBeenCalledTimes(2);
  });
});
