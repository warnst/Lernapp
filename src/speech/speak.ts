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
  synth()?.cancel();
}

/** Liest den Text vor. Läuft schon eine Ausgabe, stoppt ein zweiter Aufruf sie nur. */
export function toggleSpeak(text: string): void {
  const speech = synth();
  if (!speech) return;
  if (speech.speaking) {
    speech.cancel();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.9;
  const voice = germanVoice(speech);
  if (voice) utterance.voice = voice;
  speech.speak(utterance);
}
