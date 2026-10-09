import type { ReactNode } from 'react';
import type { KikoPose } from '@/domain/hints';
import { Kiko } from '@/illustrations/Kiko';
import styles from './SpeechBubble.module.css';
import { cx } from './cx';

/** Kiko mit Sprechblase. */
export function SpeechBubble({
  pose = 'hallo',
  kikoSize = 64,
  kiko = true,
  className,
  children,
}: {
  pose?: KikoPose;
  kikoSize?: number;
  kiko?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.wrap, className)}>
      {kiko ? <Kiko pose={pose} size={kikoSize} /> : <span style={{ width: kikoSize }} />}
      <p className={styles.bubble}>{children}</p>
    </div>
  );
}
