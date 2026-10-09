import { useId, useState } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { LinkButton } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { UI } from '@/content/ui';
import { WORLDS } from '@/content/worlds';
import type { Profile, Station, WorldId } from '@/domain/types';
import { FindlingIcon } from '@/illustrations/FindlingIcon';
import { Gem } from '@/illustrations/Gem';
import { Pearl } from '@/illustrations/Pearl';
import { Star } from '@/illustrations/Star';
import { isCompleted, worldOf } from '@/state/progress';
import styles from './Treasures.module.css';

function FindlingSheet({ station, onClose }: { station: Station; onClose: () => void }) {
  const titleId = useId();
  return (
    <BottomSheet labelledBy={titleId} onClose={onClose}>
      <div className={styles.detail}>
        <FindlingIcon id={station.findling.id} size={128} />
        <h2 id={titleId}>{station.findling.name}</h2>
        <p>{station.findling.text}</p>
        <p className={styles.muted}>{UI.treasures.foundAt(station.title)}</p>
      </div>
    </BottomSheet>
  );
}

/** Schätze: Sterne, Fundstücke, Perlenkette, Glitzersteine, Urkunde (docs/01 5.8). */
export function Treasures({ profile }: { profile: Profile }) {
  const own = worldOf(profile);
  const tabs = Object.values(WORLDS)
    .map((w) => w.id)
    .filter((id) => id === own || profile.worlds[id] !== undefined);
  const [world, setWorld] = useState<WorldId>(own);
  const [open, setOpen] = useState<Station | undefined>();
  const stations = WORLDS[world].stations;
  const done = stations.filter((s) => isCompleted(profile, world, s.id));
  const bonus = profile.worlds[world]?.bonusSolved.length ?? 0;
  const pearls = profile.practice.pearls;

  return (
    <Screen title={UI.treasures.title} withNav>
      {tabs.length > 1 && (
        <div className={styles.tabs} role="tablist">
          {tabs.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              className={styles.tab}
              aria-selected={world === id}
              onClick={() => {
                setWorld(id);
              }}
            >
              {UI.treasures.worldTabs[id]}
            </button>
          ))}
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.treasures.stars}</h2>
        <div
          className={styles.row}
          role="img"
          aria-label={UI.header.starsLabel(done.length, stations.length)}
        >
          {stations.map((station) => (
            <Star key={station.id} size={32} filled={done.includes(station)} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.treasures.findlings}</h2>
        <div className={styles.grid}>
          {stations.map((station) => {
            const found = done.includes(station);
            return (
              <button
                key={station.id}
                type="button"
                className={styles.findling}
                disabled={!found}
                aria-label={found ? station.findling.name : UI.treasures.unknown}
                onClick={() => {
                  setOpen(station);
                }}
              >
                <FindlingIcon id={station.findling.id} size={72} found={found} />
              </button>
            );
          })}
        </div>
        {done.length === stations.length && (
          <LinkButton href="/schaetze/urkunde" block>
            {UI.treasures.certificate}
          </LinkButton>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.treasures.pearls}</h2>
        <p className={styles.muted}>{UI.treasures.pearlCount(pearls)}</p>
        {pearls > 0 && (
          <div className={styles.chain} aria-hidden="true">
            {Array.from({ length: pearls }, (_, i) => (
              <Pearl key={i} size={24} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.treasures.gems}</h2>
        <p className={styles.muted}>{UI.treasures.gemCount(bonus, stations.length)}</p>
        <div className={styles.row} aria-hidden="true">
          {stations.map((station, i) => (
            <Gem key={station.id} size={28} found={i < bonus} />
          ))}
        </div>
      </section>

      {open && (
        <FindlingSheet
          station={open}
          onClose={() => {
            setOpen(undefined);
          }}
        />
      )}
    </Screen>
  );
}
