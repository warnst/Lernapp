import { Link, useLocation } from 'wouter';
import { UI } from '@/content/ui';
import type { WorldId } from '@/domain/types';
import { UiIcon, type UiIconName } from '@/illustrations/UiIcon';
import styles from './BottomNav.module.css';

interface Tab {
  href: string;
  label: string;
  icon: UiIconName;
  active: (path: string) => boolean;
}

/** Untere Navigation mit 4 Tabs (docs/01 Abschnitt 4, docs/12 Abschnitt 2). */
export function BottomNav({ world }: { world: WorldId }) {
  const [path] = useLocation();
  const tabs: Tab[] = [
    {
      href: '/',
      label: UI.nav.adventure,
      icon: world === 'kleine-bucht' ? 'muschel' : 'palme',
      active: (p) => p === '/',
    },
    {
      href: '/ueben',
      label: UI.nav.practice,
      icon: 'muenzen',
      active: (p) => p.startsWith('/ueben'),
    },
    {
      href: '/raetsel',
      label: UI.nav.riddles,
      icon: 'leuchtturm',
      active: (p) => p.startsWith('/raetsel'),
    },
    {
      href: '/schaetze',
      label: UI.nav.treasures,
      icon: 'truhe',
      active: (p) => p.startsWith('/schaetze'),
    },
  ];
  return (
    <nav className={styles.nav} aria-label={UI.nav.label}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={styles.tab}
          aria-current={tab.active(path) ? 'page' : undefined}
        >
          <span className={styles.icon}>
            <UiIcon name={tab.icon} size={28} />
          </span>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
