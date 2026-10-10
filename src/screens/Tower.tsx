import { useLocation } from 'wouter';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { TOWER_ICON, TOWER_ORDER, TOWER_SLUG } from '@/content/tower';
import { UI } from '@/content/ui';
import type { Profile } from '@/domain/types';
import { BEACON_FLOOR, floorInfo } from '@/domain/tower';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { Tower as TowerArt } from '@/illustrations/Tower';
import { toggleSpeak } from '@/speech/speak';
import { towerOf } from '@/state/reducer';
import styles from './Tower.module.css';

/** Kikos Rätselturm: Turm mit Lampen und die Rätselarten der Stufe (docs/12 2). */
export function Tower({ profile }: { profile: Profile }) {
  const [, navigate] = useLocation();
  const cfg = STUFEN[profile.stufe];
  const tower = towerOf(profile);
  const { floors, lit, size } = floorInfo(tower.lamps);
  const types = TOWER_ORDER.filter((type) => cfg.tower.types.includes(type));
  const short = profile.stufe <= 2;
  const message = floors >= BEACON_FLOOR ? UI.tower.beacon : UI.tower.toNext(size - lit);

  return (
    <Screen title={UI.tower.title} withNav>
      <div className={styles.hero}>
        <div role="img" aria-label={UI.tower.label(floors, lit, size)}>
          <TowerArt floors={floors} lit={lit} size={size} width={180} />
        </div>
        <SpeechBubble pose="zeigt" kikoSize={56} className={styles.bubble}>
          {message}
        </SpeechBubble>
      </div>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.tower.what}</h2>
        <div className={styles.tiles}>
          {types.map((type) => {
            const label = short ? UI.tower.shortTypes[type] : UI.tower.types[type];
            return (
              <button
                key={type}
                type="button"
                className={styles.tile}
                onClick={() => {
                  if (cfg.autoRead) toggleSpeak(label);
                  navigate(`/raetsel/${TOWER_SLUG[type]}`);
                }}
              >
                <ItemIcon itemId={TOWER_ICON[type]} size={48} />
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </Screen>
  );
}
