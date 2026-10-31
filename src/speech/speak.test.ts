import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  canSpeak,
  getVoicePreference,
  listGermanVoices,
  setVoicePreference,
  stopSpeaking,
  toggleSpeak,
  unlockSpeechOnFirstTap,
  VOICE_AUTO,
  VOICE_CLOUD,
} from './speak';

class FakeUtterance {
  lang = '';
  volume = 1;
  onend: (() => void) | null = null;
  rate = 1;
  voice: unknown = null;
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}

interface FakeVoice {
  name?: string;
  lang: string;
  localService: boolean;
}

function installSpeech(voices: FakeVoice[]) {
  const speech = { speaking: false, speak: vi.fn(), cancel: vi.fn(), getVoices: () => voices };
  vi.stubGlobal('speechSynthesis', speech);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  return speech;
}

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('speak', () => {
  it('ohne Sprachausgabe passiert nichts', () => {
    expect(canSpeak()).toBe(false);
    expect(listGermanVoices()).toEqual([]);
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

  it('bevorzugt natürliche Frauenstimmen und filtert Roboterstimmen heraus', () => {
    const eddy = { name: 'Eddy (Deutsch)', lang: 'de-DE', localService: true };
    const markus = { name: 'Markus', lang: 'de-DE', localService: true };
    const anna = { name: 'Anna', lang: 'de-DE', localService: true };
    const amala = {
      name: 'Microsoft Amala Online (Natural)',
      lang: 'de-DE',
      localService: false,
    };
    const speech = installSpeech([eddy, markus, anna, amala]);

    const listed = listGermanVoices();
    expect(listed.map((v) => v.name)).toEqual([
      'Microsoft Amala Online (Natural)',
      'Anna',
      'Markus',
    ]);

    toggleSpeak('Hallo');
    expect((speech.speak.mock.calls[0]?.[0] as FakeUtterance).voice).toBe(amala);

    // Spezifische Stimme wählen
    setVoicePreference('Anna');
    expect(getVoicePreference()).toBe('Anna');
    toggleSpeak('Hallo');
    expect((speech.speak.mock.calls[1]?.[0] as FakeUtterance).voice).toBe(anna);
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

  it('nutzt im echten Browser die Online-Frauenstimme (/api/speak) und fällt bei Fehlern auf Browser-Stimme zurück', async () => {
    const anna = { name: 'Anna', lang: 'de-DE', localService: true };
    const speech = installSpeech([anna]);
    vi.stubGlobal('navigator', { onLine: true, userAgent: 'Mozilla/5.0 Safari' });

    const pause = vi.fn();
    const audioUrls: string[] = [];
    const endCallbacks: (() => void)[] = [];
    let rejectPlay = false;

    class FakeAudio {
      src: string;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      play = vi.fn(() => {
        if (this.onended) endCallbacks.push(this.onended);
        if (rejectPlay) return Promise.reject(new Error('network error'));
        return Promise.resolve();
      });
      pause = pause;
      constructor(src: string) {
        this.src = src;
        audioUrls.push(src);
      }
    }
    vi.stubGlobal('Audio', FakeAudio);
    setVoicePreference(VOICE_CLOUD);

    toggleSpeak('Hallo Kiko');
    expect(audioUrls[0]).toBe('/api/speak?text=Hallo%20Kiko');
    expect(speech.speak).not.toHaveBeenCalled();

    // Zweiter Aufruf während Cloud-Audio läuft stoppt die Wiedergabe
    toggleSpeak('Hallo Kiko');
    expect(pause).toHaveBeenCalledOnce();

    // Wenn die Wiedergabe regulär endet, wird activeAudio zurückgesetzt
    toggleSpeak('Zweiter Satz');
    endCallbacks.at(-1)?.();

    // Bei Netzwerkfehler fällt toggleSpeak automatisch auf die Browser-Frauenstimme zurück
    rejectPlay = true;
    toggleSpeak('Fallback Satz');
    await Promise.resolve();
    expect(speech.speak).toHaveBeenCalledOnce();
    expect((speech.speak.mock.calls[0]?.[0] as FakeUtterance).text).toBe('Fallback Satz');

    // Mit VOICE_AUTO wird direkt die Browser-Stimme genutzt
    setVoicePreference(VOICE_AUTO);
    toggleSpeak('Direkt Browser');
    expect(speech.speak).toHaveBeenCalledTimes(2);
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

  it('schaltet beim ersten Tippen stumm frei, danach wird normal vorgelesen', () => {
    unlockSpeechOnFirstTap(); // ohne Sprachausgabe: nichts
    const speech = installSpeech([]);
    unlockSpeechOnFirstTap();
    document.body.click();
    expect(speech.speak).toHaveBeenCalledOnce();
    const silent = speech.speak.mock.calls[0]?.[0] as FakeUtterance;
    expect(silent.volume).toBe(0);

    // die stumme Ausgabe läuft noch: Vorlesen bricht sie ab und liest trotzdem
    speech.speaking = true;
    toggleSpeak('Aufgabe');
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(speech.speak).toHaveBeenCalledTimes(2);

    // weiteres Tippen schaltet nicht noch einmal frei
    document.body.click();
    expect(speech.speak).toHaveBeenCalledTimes(2);
    silent.onend?.();
  });

  it('läuft beim ersten Tippen schon eine Ausgabe, wird nichts zusätzlich gesprochen', () => {
    const speech = installSpeech([]);
    speech.speaking = true;
    unlockSpeechOnFirstTap();
    document.body.dispatchEvent(new Event('touchend', { bubbles: true }));
    expect(speech.speak).not.toHaveBeenCalled();
  });
});
