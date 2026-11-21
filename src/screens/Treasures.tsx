import { useId, useState } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { Button, LinkButton } from '@/components/Button';
import { cx } from '@/components/cx';
import { Screen } from '@/components/Screen';
import { STUFEN } from '@/config/levels';
import { TOWER_ICON, TOWER_ORDER } from '@/content/tower';
import { UI } from '@/content/ui';
import { WORLDS } from '@/content/worlds';
import { KOSMOS_PLANETS } from '@/content/worlds/kosmos/planets';
import { LESEN_CHAPTERS } from '@/content/worlds/lesen/chapters';
import { chapterStars } from '@/state/lesen-progress';
import { ZAHLENBLOCK_HEROES } from '@/content/worlds/zahlenbloecke/blocks';
import type { Profile, Station, WorldId } from '@/domain/types';
import { FindlingIcon } from '@/illustrations/FindlingIcon';
import { Gem } from '@/illustrations/Gem';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { NumberBlock } from '@/illustrations/NumberBlock';
import { Pearl } from '@/illustrations/Pearl';
import { Star } from '@/illustrations/Star';
import { StationIcon } from '@/illustrations/StationIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import { canSpeak, toggleSpeak } from '@/speech/speak';
import { isCompleted, worldOf } from '@/state/progress';
import { GOLDEN_STAMP, towerOf } from '@/state/reducer';
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
          <LinkButton
            href={
              world === 'kosmos'
                ? '/schaetze/urkunde?welt=kosmos'
                : world === 'zahlenbloecke'
                  ? '/schaetze/urkunde?welt=zahlenbloecke'
                  : world === 'lesen'
                    ? '/schaetze/urkunde?welt=lesen'
                    : '/schaetze/urkunde'
            }
            block
          >
            {UI.treasures.certificate}
          </LinkButton>
        )}
      </section>

      {world === 'kosmos' && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Planeten-Wissenskarten</h2>
          {KOSMOS_PLANETS.filter((p) =>
            p.stations.every((s) => isCompleted(profile, 'kosmos', s.id)),
          ).map((planet) => (
            <div key={planet.id} className={styles.detail}>
              <StationIcon icon={planet.icon} size={56} />
              <strong>{planet.factCard.title}</strong>
              <p>{planet.factCard.fact}</p>
              {canSpeak() && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    toggleSpeak(`${planet.factCard.title}. ${planet.factCard.fact}`);
                  }}
                >
                  <UiIcon name="lautsprecher" /> {UI.sheet.read}
                </Button>
              )}
            </div>
          ))}
        </section>
      )}

      {world === 'zahlenbloecke' && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Zahlenblock-Freundeskarten</h2>
          {ZAHLENBLOCK_HEROES.filter((h) =>
            h.stations.every((s) => isCompleted(profile, 'zahlenbloecke', s.id)),
          ).map((hero) => (
            <div key={hero.id} className={styles.detail}>
              <NumberBlock value={hero.number} size={72} />
              <strong>{hero.friendCard.title}</strong>
              <p>{hero.friendCard.fact}</p>
              {canSpeak() && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    toggleSpeak(`${hero.friendCard.title}. ${hero.friendCard.fact}`);
                  }}
                >
                  <UiIcon name="lautsprecher" /> {UI.sheet.read}
                </Button>
              )}
            </div>
          ))}
        </section>
      )}

      {world === 'lesen' && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Mein Silbenbuch</h2>
          <p className={styles.muted}>
            {String(LESEN_CHAPTERS.filter((c) => chapterStars(profile, c) === 3).length)} von 8
            Silbengeschichten freigeschaltet
          </p>
          <LinkButton href="/schaetze/silbenbuch" variant="secondary" block>
            <UiIcon name="buch" /> Mein Silbenbuch öffnen
          </LinkButton>
        </section>
      )}

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

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.pass.title}</h2>
        <p className={styles.muted}>{UI.pass.intro}</p>
        <ul className={styles.pass}>
          {TOWER_ORDER.filter((type) => STUFEN[profile.stufe].tower.types.includes(type)).map(
            (type) => {
              const n = towerOf(profile).solved[type] ?? 0;
              const golden = n >= GOLDEN_STAMP;
              const name = UI.tower.shortTypes[type];
              return (
                <li
                  key={type}
                  className={cx(styles.stamp, n > 0 && styles.stamped, golden && styles.golden)}
                  aria-label={UI.pass.stamp(UI.tower.types[type], n, golden)}
                >
                  <span className={styles.stampRing} aria-hidden="true">
                    {n > 0 ? <ItemIcon itemId={TOWER_ICON[type]} size={36} /> : '?'}
                  </span>
                  <span aria-hidden="true">{name}</span>
                </li>
              );
            },
          )}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.jokes.book}</h2>
        <p className={styles.muted}>{UI.jokes.bookCount(towerOf(profile).jokes.length)}</p>
        <LinkButton href="/schaetze/witze" variant="secondary" block>
          {UI.jokes.book}
        </LinkButton>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{UI.choiceRiddles.knowledgeBook}</h2>
        <p className={styles.muted}>
          {UI.choiceRiddles.knowledgeCount((towerOf(profile).facts ?? []).length)}
        </p>
        <LinkButton href="/schaetze/wissen" variant="secondary" block>
          {UI.choiceRiddles.knowledgeBook}
        </LinkButton>
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
