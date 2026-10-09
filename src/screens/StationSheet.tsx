import { useId } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { Button, LinkButton } from '@/components/Button';
import { SpeechBubble } from '@/components/SpeechBubble';
import { UI } from '@/content/ui';
import type { Station } from '@/domain/types';
import { StationIcon } from '@/illustrations/StationIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import { canSpeak, toggleSpeak } from '@/speech/speak';
import styles from './StationSheet.module.css';

/** Stationskarte als Bottom Sheet (docs/01, 5.3). */
export function StationSheet({
  station,
  completed,
  resumable,
  onClose,
}: {
  station: Station;
  completed: boolean;
  resumable: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const href = `/station/${station.id}`;
  return (
    <BottomSheet labelledBy={titleId} onClose={onClose}>
      <div className={styles.body}>
        <StationIcon icon={station.icon} size={112} className={styles.illustration} />
        <h2 id={titleId} className={styles.title}>
          {UI.sheet.title(station.number, station.title)}
        </h2>
        <div className={styles.intro}>
          {station.intro.map((line, i) => (
            <SpeechBubble key={line} kikoSize={56} kiko={i === 0}>
              {line}
            </SpeechBubble>
          ))}
          {canSpeak() && (
            <Button
              variant="ghost"
              onClick={() => {
                toggleSpeak(station.intro.join(' '));
              }}
            >
              <UiIcon name="lautsprecher" /> {UI.sheet.read}
            </Button>
          )}
        </div>
        <div className={styles.chips}>
          <span className={styles.chip}>
            <UiIcon name="uhr" size={20} /> {UI.sheet.minutes(station.minutes)}
          </span>
          <span className={styles.chip}>{UI.sheet.skill(station.skillLabel)}</span>
        </div>
        <div className={styles.actions}>
          <LinkButton href={href} block>
            {resumable ? UI.sheet.resume : completed ? UI.sheet.again : UI.sheet.start}
          </LinkButton>
          {completed && resumable && (
            <LinkButton href={href} variant="secondary" block>
              {UI.sheet.again}
            </LinkButton>
          )}
          {completed && (
            <LinkButton href={`/ueben?thema=${station.practiceTopic}`} variant="secondary" block>
              {UI.sheet.morePractice}
            </LinkButton>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
