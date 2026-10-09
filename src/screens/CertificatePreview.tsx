import { LinkButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { UI } from '@/content/ui';

/** Vorschau der Urkunde für das Kind, ohne Druckknopf (docs/01 5.8). Die Urkunde selbst kommt mit Phase 8. */
export function CertificatePreview() {
  return (
    <Screen title={UI.treasures.certificate}>
      <SpeechBubble pose="freut-sich">{UI.treasures.certificateHint}</SpeechBubble>
      <LinkButton href="/schaetze">{UI.treasures.title}</LinkButton>
    </Screen>
  );
}
