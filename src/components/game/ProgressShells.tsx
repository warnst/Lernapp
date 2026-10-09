import { UI } from '@/content/ui';
import { UiIcon } from '@/illustrations/UiIcon';
import styles from './Play.module.css';

/** Eine Muschel (bzw. ein Schloss) pro Aufgabe: erledigt, aktuell, offen (docs/01 5.4). */
export function ProgressShells({
  total,
  current,
  style,
}: {
  total: number;
  current: number;
  style: 'shells' | 'locks';
}) {
  return (
    <ol className={styles.progress} aria-label={UI.play.progress(current, total)}>
      {Array.from({ length: total }, (_, i) => (
        <li
          key={i}
          className={i < current ? styles.done : i === current ? styles.now : styles.open}
          aria-hidden="true"
        >
          <UiIcon name={style === 'locks' ? 'schloss' : 'muschel'} size={22} />
        </li>
      ))}
    </ol>
  );
}
