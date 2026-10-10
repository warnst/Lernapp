import { KIKO_ITEMS } from '@/content/outfits';
import { UI } from '@/content/ui';
import type { Profile } from '@/domain/types';
import { KikoItemIcon } from '@/illustrations/KikoItemIcon';
import { towerOf } from '@/state/reducer';
import { LinkButton } from './Button';
import styles from './FreshItems.module.css';

/** Hinweis auf neue besondere Teile (Krone, Zauberhut …) mit Weg zum Kleiderschrank. */
export function FreshItems({ profile }: { profile: Profile }) {
  const fresh = (towerOf(profile).wardrobe?.fresh ?? []).flatMap((id) => {
    const item = KIKO_ITEMS.find((i) => i.id === id);
    return item ? [item] : [];
  });
  if (fresh.length === 0) return null;
  return (
    <section className={styles.box} aria-live="polite">
      <span className={styles.icons} aria-hidden="true">
        {fresh.map((item) => (
          <KikoItemIcon key={item.id} id={item.id} slot={item.slot} size={56} />
        ))}
      </span>
      <p className={styles.text}>{UI.wardrobe.fresh(fresh.map((i) => i.name).join(', '))}</p>
      <LinkButton href="/raetsel/kiko" variant="secondary">
        {UI.wardrobe.look}
      </LinkButton>
    </section>
  );
}
