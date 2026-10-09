import { LinkButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { UI } from '@/content/ui';

/** Platzhalter für Bildschirme späterer Phasen. */
export function Placeholder({ title, withNav = false }: { title: string; withNav?: boolean }) {
  return (
    <Screen title={title} withNav={withNav}>
      <SpeechBubble pose="schlaeft">{UI.placeholder.text}</SpeechBubble>
      {!withNav && <LinkButton href="/">{UI.placeholder.back}</LinkButton>}
    </Screen>
  );
}
