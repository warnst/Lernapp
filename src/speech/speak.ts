// Sprachausgabe über /api/speak (warme Frauenstimme) mit Web-Speech-API-Fallback (docs/03 Abschnitt 9).

const VOICE_STORAGE_KEY = 'schatzinsel.voice';
export const VOICE_CLOUD = 'cloud';
export const VOICE_AUTO = 'auto';

/** Bekannte Effekt- und Roboterstimmen auf Apple-Systemen, die für Kinder ungeeignet sind. */
const NOVELTY_VOICES = [
  'albert',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'eddy',
  'flo',
  'good news',
  'grandma',
  'grandpa',
  'jester',
  'organ',
  'reed',
  'rocko',
  'sandy',
  'shelley',
  'superstar',
  'trinoids',
  'whisper',
  'wobble',
  'zarvox',
];

/** Besonders natürliche, kinderfreundliche Mädchen- und Frauenstimmen. */
const TOP_FEMALE_VOICES = ['amala', 'seraphina', 'katja', 'maja', 'leni', 'gisela', 'klara'];

/** Bewährte deutsche Frauenstimmen auf macOS, iOS, Android, Chrome und Windows. */
const FEMALE_VOICES = [
  'google deutsch',
  'petra',
  'helena',
  'anna',
  'siri',
  'hedda',
  'vicki',
  'marlene',
  'conny',
  'steffi',
  'marie',
];

/** Qualitätsmerkmale im Stimmennamen. */
const QUALITY_MARKERS = [
  'natural',
  'premium',
  'enhanced',
  'erweitert',
  'neural',
  'online',
  'google',
  'siri',
];

/** Bekannte Männerstimmen (werden abgewertet, damit eine Frauenstimme bevorzugt wird). */
const MALE_VOICES = [
  'markus',
  'yannick',
  'martin',
  'viktor',
  'stefan',
  'conrad',
  'killian',
  'christoph',
  'kasper',
  'jonas',
  'lukas',
  'hans',
  'ralf',
  'florian',
  'bernd',
];

function synth(): SpeechSynthesis | undefined {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : undefined;
}

export function canSpeak(): boolean {
  return synth() !== undefined;
}

export function getVoicePreference(): string {
  try {
    return window.localStorage.getItem(VOICE_STORAGE_KEY) ?? VOICE_CLOUD;
  } catch {
    return VOICE_CLOUD;
  }
}

export function setVoicePreference(value: string): void {
  try {
    window.localStorage.setItem(VOICE_STORAGE_KEY, value);
  } catch {
    // Privater Modus oder Speicher gesperrt
  }
}

function isNoveltyVoice(name: string | undefined): boolean {
  const lower = (name ?? '').toLowerCase();
  return NOVELTY_VOICES.some((novelty) => lower.includes(novelty));
}

function scoreGermanVoice(voice: { name?: string; lang: string; localService: boolean }): number {
  const name = (voice.name ?? '').toLowerCase();
  const lang = voice.lang.toLowerCase().replace('_', '-');
  let score = 0;

  if (TOP_FEMALE_VOICES.some((v) => name.includes(v))) score += 100;
  else if (FEMALE_VOICES.some((v) => name.includes(v))) score += 70;

  if (QUALITY_MARKERS.some((m) => name.includes(m))) score += 40;
  if (MALE_VOICES.some((m) => name.includes(m))) score -= 60;
  if (lang.startsWith('de-de')) score += 15;
  if (voice.localService) score += 5;

  return score;
}

/** Liefert alle geeigneten deutschen Browser-Stimmen, sortiert nach Kinderfreundlichkeit. */
export function listGermanVoices(): SpeechSynthesisVoice[] {
  const speech = synth();
  if (!speech) return [];
  const german = speech.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('de'));
  const filtered = german.filter((voice) => !isNoveltyVoice(voice.name));
  const candidates = filtered.length > 0 ? filtered : german;
  return [...candidates].sort((a, b) => scoreGermanVoice(b) - scoreGermanVoice(a));
}

function germanVoice(speech: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const german = speech.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('de'));
  if (german.length === 0) return undefined;

  const pref = getVoicePreference();
  if (pref !== VOICE_CLOUD && pref !== VOICE_AUTO) {
    const chosen = german.find((voice) => voice.name === pref);
    if (chosen) return chosen;
  }

  const filtered = german.filter((voice) => !isNoveltyVoice(voice.name));
  const candidates = filtered.length > 0 ? filtered : german;
  return [...candidates].sort((a, b) => scoreGermanVoice(b) - scoreGermanVoice(a))[0];
}

let activeAudio: HTMLAudioElement | null = null;
let cloudPlaying = false;

function stopCloudAudio(): void {
  cloudPlaying = false;
  if (activeAudio) {
    activeAudio.onended = null;
    activeAudio.onerror = null;
    activeAudio.pause();
    activeAudio = null;
  }
}

export function stopSpeaking(): void {
  silent = false;
  stopCloudAudio();
  synth()?.cancel();
}

/** true, solange die stumme Freischalt-Ausgabe läuft */
let silent = false;

/**
 * iPhone und iPad lesen erst vor, nachdem einmal direkt bei einem Tippen gesprochen wurde.
 * Das automatische Vorlesen einer Aufgabe passiert aber erst nach dem Tippen. Deshalb spricht
 * das erste Tippen irgendwo in der App eine stumme, leere Ausgabe und schaltet so frei.
 */
export function unlockSpeechOnFirstTap(): void {
  const speech = synth();
  if (!speech) return;
  // touchend und click zählen in Safari als Tippen, pointerdown nicht
  const events = ['touchend', 'click'] as const;
  const unlock = () => {
    events.forEach((name) => {
      document.removeEventListener(name, unlock, true);
    });
    if (speech.speaking) return;
    const utterance = new SpeechSynthesisUtterance(' ');
    utterance.volume = 0;
    utterance.onend = () => {
      silent = false;
    };
    silent = true;
    speech.speak(utterance);
  };
  events.forEach((name) => {
    document.addEventListener(name, unlock, true);
  });
}

function speakWithBrowser(speech: SpeechSynthesis, text: string): void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.9;
  const voice = germanVoice(speech);
  if (voice) utterance.voice = voice;
  speech.speak(utterance);
}

function shouldUseCloudVoice(): boolean {
  if (getVoicePreference() !== VOICE_CLOUD) return false;
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return false;
  if (typeof navigator !== 'undefined') {
    if (!navigator.onLine) return false;
    if (navigator.userAgent.toLowerCase().includes('jsdom')) return false;
  }
  return true;
}

/** Liest den Text vor. Läuft schon eine Ausgabe, stoppt ein zweiter Aufruf sie nur. */
export function toggleSpeak(text: string): void {
  const speech = synth();
  if (!speech) return;
  if (cloudPlaying) {
    stopCloudAudio();
    return;
  }
  if (speech.speaking) {
    speech.cancel();
    if (!silent) return;
    silent = false;
  }

  if (shouldUseCloudVoice()) {
    const audio = new Audio(`/api/speak?text=${encodeURIComponent(text)}`);
    activeAudio = audio;
    cloudPlaying = true;
    const fallback = () => {
      if (activeAudio !== audio) return;
      stopCloudAudio();
      speakWithBrowser(speech, text);
    };
    audio.onended = () => {
      if (activeAudio === audio) {
        cloudPlaying = false;
        activeAudio = null;
      }
    };
    audio.onerror = fallback;
    audio.play().catch(fallback);
    return;
  }

  speakWithBrowser(speech, text);
}
