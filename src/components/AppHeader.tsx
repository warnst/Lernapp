import { Link } from 'wouter';
import { avatarInfo } from '@/content/avatars';
import { UI } from '@/content/ui';
import type { Profile } from '@/domain/types';
import { AvatarIllustration } from '@/illustrations/AvatarIllustration';
import { UiIcon } from '@/illustrations/UiIcon';
import styles from './AppHeader.module.css';
import { StarPill } from './StarPill';

/** Kopfzeile: Avatar → „Wer spielt?“, Sterne, Zahnrad → Erwachsene (docs/01, 5.2). */
export function AppHeader({
  profile,
  stars,
  totalStars,
}: {
  profile: Profile;
  stars: number;
  totalStars: number;
}) {
  const who = profile.name ?? avatarInfo(profile.avatar).name;
  return (
    <header className={styles.header}>
      <Link
        href="/wer-spielt"
        className={styles.iconLink}
        aria-label={`${UI.header.whoPlays} (${who})`}
      >
        <AvatarIllustration avatar={profile.avatar} size={40} />
      </Link>
      <StarPill count={stars} total={totalStars} />
      <span className={styles.spacer} />
      <Link href="/erwachsene" className={styles.iconLink} aria-label={UI.header.adults}>
        <UiIcon name="zahnrad" size={28} />
      </Link>
    </header>
  );
}
