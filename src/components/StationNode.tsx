import { UI } from '@/content/ui';
import { Fog } from '@/illustrations/Fog';
import { StationIcon } from '@/illustrations/StationIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import styles from './StationNode.module.css';
import { cx } from './cx';

export type StationNodeState = 'done' | 'current' | 'open' | 'locked';

/** Station auf der Karte: geschafft, aktuell, offen oder im Nebel (docs/01, 5.2). */
export function StationNode({
  number,
  title,
  icon,
  state,
  revealing = false,
  onSelect,
}: {
  number: number;
  title: string;
  icon: string;
  state: StationNodeState;
  /** Nebel zieht einmalig ab (docs/02 7) */
  revealing?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cx(styles.node, state !== 'open' && styles[state])}
      aria-label={UI.map.stationLabel(number, title, state)}
      onClick={onSelect}
    >
      <StationIcon icon={icon} size={44} className={styles.icon} />
      <span className={styles.number} aria-hidden="true">
        {number}
      </span>
      {state === 'done' && (
        <span className={styles.badge} aria-hidden="true">
          <UiIcon name="stern" size={18} />
        </span>
      )}
      {revealing && <Fog size={120} className={cx(styles.fog, styles.fogLeaving)} />}
      {state === 'locked' && (
        <>
          <Fog size={120} className={styles.fog} />
          <span className={styles.badge} aria-hidden="true">
            <UiIcon name="schloss" size={18} />
          </span>
        </>
      )}
    </button>
  );
}
