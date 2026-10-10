// Sprachausgabe über die Web Speech API (docs/03 Abschnitt 9).

function synth(): SpeechSynthesis | undefined {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : undefined;
}

export function canSpeak(): boolean {
  return synth() !== undefined;
}

function germanVoice(speech: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const german = speech.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('de'));
  return german.find((voice) => voice.localService) ?? german[0];
}

export function stopSpeaking(): void {
  silent = false;
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

/** Liest den Text vor. Läuft schon eine Ausgabe, stoppt ein zweiter Aufruf sie nur. */
export function toggleSpeak(text: string): void {
  const speech = synth();
  if (!speech) return;
  if (speech.speaking) {
    speech.cancel();
    if (!silent) return;
    silent = false;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.9;
  const voice = germanVoice(speech);
  if (voice) utterance.voice = voice;
  speech.speak(utterance);
}
