import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/Button';
import { ChestPick } from '@/components/ChestPick';
import { FreshItems } from '@/components/FreshItems';
import { cx } from '@/components/cx';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { TOWER_ICON, TOWER_ORDER, TOWER_SLUG } from '@/content/tower';
import { UI } from '@/content/ui';
import type { Profile } from '@/domain/types';
import { BEACON_FLOOR, floorInfo } from '@/domain/tower';
import { Chest } from '@/illustrations/Chest';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { Kiko } from '@/illustrations/Kiko';
import { NestRoom } from '@/illustrations/NestRoom';
import { Tower as TowerArt } from '@/illustrations/Tower';
import { toggleSpeak } from '@/speech/speak';
import { towerOf, wardrobeOf } from '@/state/reducer';
import { dailyType } from '@/state/daily';
import { autoReadOf } from '@/state/progress';
import { pendingChests } from '@/state/wardrobe';
import styles from './Tower.module.css';

/** Kikos Rätselturm: Turm mit Lampen und die Rätselarten der Stufe (docs/12 2). */
export function Tower({ profile }: { profile: Profile }) {
  const [, navigate] = useLocation();
  const cfg = STUFEN[profile.stufe];
  const tower = towerOf(profile);
  const { floors, lit, size } = floorInfo(tower.lamps);
  const types = TOWER_ORDER.filter((type) => cfg.tower.types.includes(type));
  const short = profile.stufe <= 2;
  const [opening, setOpening] = useState(false);
  const [daily] = useState(() => dailyType(profile, new Date()));
  const chestWaiting = pendingChests(profile) > 0;
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

      {opening ? (
        <ChestPick
          profile={profile}
          readAloud={autoReadOf(profile)}
          onDone={() => {
            setOpening(false);
          }}
        />
      ) : (
        chestWaiting && (
          <button
            type="button"
            className={styles.chestCard}
            onClick={() => {
              if (autoReadOf(profile)) toggleSpeak(UI.wardrobe.chestWaiting);
              setOpening(true);
            }}
          >
            <Chest size={64} className={styles.wiggle} />
            {UI.wardrobe.chestWaiting}
          </button>
        )
      )}

      <FreshItems profile={profile} />

      <SpeechBubble pose="hallo" kikoSize={48} className={styles.daily}>
        {UI.pass.daily(UI.pass.phrases[daily])}
      </SpeechBubble>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.tower.what}</h2>
        <div className={styles.tiles}>
          {types.map((type) => {
            const label = short ? UI.tower.shortTypes[type] : UI.tower.types[type];
            return (
              <button
                key={type}
                type="button"
                className={cx(styles.tile, type === daily && styles.dailyTile)}
                onClick={() => {
                  if (autoReadOf(profile)) toggleSpeak(label);
                  navigate(`/raetsel/${TOWER_SLUG[type]}`);
                }}
              >
                {type === daily && <span className={styles.badge}>{UI.pass.dailyBadge}</span>}
                <ItemIcon itemId={TOWER_ICON[type]} size={48} />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.wardrobe.nest}</h2>
        <Link href="/raetsel/kiko" className={styles.nest} aria-label={UI.wardrobe.nestLabel}>
          <NestRoom
            items={wardrobeOf(tower).nest}
            kiko={<Kiko pose="hallo" />}
            width={320}
            className={styles.nestRoom}
          />
        </Link>
        <Button
          variant="secondary"
          block
          onClick={() => {
            navigate('/raetsel/kiko');
          }}
        >
          {UI.wardrobe.open}
        </Button>
      </section>
    </Screen>
  );
}
