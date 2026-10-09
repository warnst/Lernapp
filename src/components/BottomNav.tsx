import { Link, useLocation } from 'wouter';
import { UI } from '@/content/ui';
import type { WorldId } from '@/domain/types';
import { UiIcon, type UiIconName } from '@/illustrations/UiIcon';
import { toggleSpeak } from '@/speech/speak';
import styles from './BottomNav.module.css';

interface Tab {
  href: string;
  label: string;
  icon: UiIconName;
  active: (path: string) => boolean;
}

/** Untere Navigation mit 3 Tabs (docs/01, Abschnitt 4). */
export function BottomNav({ world, readAloud }: { world: WorldId; readAloud: boolean }) {
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
          onClick={() => {
            if (readAloud) toggleSpeak(tab.label);
          }}
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
