import { Redirect } from 'wouter';
import { LinkButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { UI } from '@/content/ui';
import { parsePrintOptions } from '@/print/job';
import { PrintDocument } from '@/print/PrintDocument';
import { useAppState } from '@/state/context';
import { activeProfile, worldOf } from '@/state/progress';
import styles from './CertificatePreview.module.css';

/** Vorschau der Urkunde für das Kind, ohne Druckknopf (docs/01 5.8). Gedruckt wird im Erwachsenen-Bereich. */
export function CertificatePreview() {
  const { state } = useAppState();
  const profile = activeProfile(state);
  if (!profile) return <Redirect to="/" />;
  const world = worldOf(profile);
  const options = parsePrintOptions(`stufe=${String(profile.stufe)}&loesungen=0`, []);
  return (
    <Screen title={UI.treasures.certificate}>
      <SpeechBubble pose="freut-sich">{UI.treasures.certificateHint}</SpeechBubble>
      <div className={styles.preview}>
        <PrintDocument
          sheets={[{ kind: 'certificate', world, ...(profile.name ? { name: profile.name } : {}) }]}
          options={options}
        />
      </div>
      <LinkButton href="/schaetze">{UI.treasures.title}</LinkButton>
    </Screen>
  );
}
