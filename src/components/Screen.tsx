import type { ReactNode } from 'react';
import styles from './Screen.module.css';
import { cx } from './cx';

/** Einspaltiger Rahmen, auf Tablet und Desktop mittig und höchstens 560 px breit (docs/01, 8). */
export function Screen({
  title,
  withNav = false,
  children,
}: {
  title?: string;
  withNav?: boolean;
  children: ReactNode;
}) {
  return (
    <main className={cx(styles.screen, withNav && styles.withNav)}>
      {title !== undefined && <h1 className={styles.title}>{title}</h1>}
      {children}
    </main>
  );
}
