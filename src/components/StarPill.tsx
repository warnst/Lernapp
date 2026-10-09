import { UI } from '@/content/ui';
import { UiIcon } from '@/illustrations/UiIcon';
import styles from './StarPill.module.css';

/** „★ 3 von 9“ – Gesamtzahl je Welt. */
export function StarPill({ count, total }: { count: number; total: number }) {
  return (
    <span className={styles.pill} role="img" aria-label={UI.header.starsLabel(count, total)}>
      <UiIcon name="stern" size={20} />
      <span aria-hidden="true">{UI.header.stars(count, total)}</span>
    </span>
  );
}
