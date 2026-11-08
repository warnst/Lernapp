import { useEffect, useRef, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import { cx } from '@/components/cx';
import { SpeechBubble } from '@/components/SpeechBubble';
import { StationNode, type StationNodeState } from '@/components/StationNode';
import { UI } from '@/content/ui';
import {
  ZAHLENBLOCK_HEROES,
  ZAHLENBLOECKE_STATIONS,
  type ZahlenblockHero,
  heroById,
} from '@/content/worlds/zahlenbloecke/blocks';
import type { Profile, Station } from '@/domain/types';
import { FindlingIcon } from '@/illustrations/FindlingIcon';
import { Kiko } from '@/illustrations/Kiko';
import { MapBackground } from '@/illustrations/MapBackground';
import { NumberBlock } from '@/illustrations/NumberBlock';
import { Star } from '@/illustrations/Star';
import { StationIcon } from '@/illustrations/StationIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import { canSpeak, stopSpeaking, toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import {
  autoReadOf,
  canResume,
  currentStation,
  isCompleted,
  isUnlocked,
  worldOf,
} from '@/state/progress';
import { StationSheet } from './StationSheet';
import styles from './ZahlenbloeckeMap.module.css';

const HERO_LAYOUT: [number, number][] = [
  [50, 93], // 1. Eins
  [72, 84], // 2. Zwei
  [28, 74], // 3. Drei
  [68, 65], // 4. Vier
  [32, 55], // 5. Fünf
  [70, 46], // 6. Sechs
  [30, 36], // 7. Sieben
  [68, 27], // 8. Acht
  [32, 17], // 9. Neun
  [52, 7], // 10. Zehn bis 100
];

function isBlockStationUnlocked(profile: Profile, stationIndex: number): boolean {
  if (profile.worlds[worldOf(profile)]?.unlockAll === true) return true;
  return isUnlocked(profile, ZAHLENBLOECKE_STATIONS, stationIndex);
}

function isHeroUnlocked(profile: Profile, heroIndex: number): boolean {
  if (heroIndex === 0) return true;
  return isBlockStationUnlocked(profile, heroIndex * 3);
}

function heroStars(profile: Profile, hero: ZahlenblockHero): number {
  return hero.stations.filter((s) => isCompleted(profile, 'zahlenbloecke', s.id)).length;
}

/** Übersicht des Zahlenlands (/zahlenbloecke) mit den 10 Zahlenblöcken (1 bis 10 & Zehner bis 100). */
export function ZahlenbloeckeMap({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const [, navigate] = useLocation();
  const welcomeKey = 'welcome:zahlenbloecke';
  const firstVisit = !profile.celebrated.includes(welcomeKey);
  const [showGreeting, setShowGreeting] = useState(true);
  const [lockedNotice, setLockedNotice] = useState(false);
  const currentRef = useRef<HTMLDivElement>(null);

  const nextStation = currentStation(profile, ZAHLENBLOECKE_STATIONS);
  const currentHero =
    ZAHLENBLOCK_HEROES.find((h) => h.stations.some((s) => s.id === nextStation?.id)) ??
    (ZAHLENBLOCK_HEROES.every((h) => heroStars(profile, h) === 3)
      ? undefined
      : ZAHLENBLOCK_HEROES[0]);

  useEffect(() => {
    if (firstVisit && autoReadOf(profile)) {
      toggleSpeak(UI.map.firstVisit.zahlenbloecke);
    }
    dispatch({ type: 'mark-celebrated', id: profile.id, key: welcomeKey });
    const timer = window.setTimeout(() => {
      setShowGreeting(false);
    }, 5000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [dispatch, firstVisit, profile, welcomeKey]);

  useEffect(() => {
    const node = currentRef.current;
    if (node && 'scrollIntoView' in node) node.scrollIntoView({ block: 'center' });
  }, []);

  const points = HERO_LAYOUT.map(([x, y]) => `${String(x)},${String(y)}`).join(' ');

  const stateOfHero = (hero: ZahlenblockHero, index: number): StationNodeState => {
    if (heroStars(profile, hero) === 3) return 'done';
    if (hero.id === currentHero?.id) return 'current';
    return isHeroUnlocked(profile, index) ? 'open' : 'locked';
  };

  return (
    <div className={styles.page}>
      {showGreeting && (
        <div className={styles.greeting}>
          <SpeechBubble kikoSize={56}>{UI.map.firstVisit.zahlenbloecke}</SpeechBubble>
        </div>
      )}

      <div className={styles.map}>
        <MapBackground world="zahlenbloecke" className={styles.background} />
        <svg
          className={styles.path}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline points={points} vectorEffect="non-scaling-stroke" />
        </svg>

        {ZAHLENBLOCK_HEROES.map((hero, index) => {
          const [x, y] = HERO_LAYOUT[index] ?? [50, 50];
          const nodeState = stateOfHero(hero, index);
          const stars = heroStars(profile, hero);
          return (
            <div
              key={hero.id}
              ref={hero.id === currentHero?.id ? currentRef : undefined}
              className={styles.spot}
              style={{ left: `${String(x)}%`, top: `${String(y)}%` }}
            >
              <StationNode
                number={hero.number}
                title={`${hero.shortName} (${String(stars)}/3)`}
                icon={hero.icon}
                state={nodeState}
                bonus={stars === 3}
                revealing={false}
                onSelect={() => {
                  if (nodeState === 'locked') {
                    setLockedNotice(true);
                    if (autoReadOf(profile)) {
                      toggleSpeak(
                        'Dieser Zahlenblock wartet noch! Schaffe zuerst die drei Stationen beim Zahlenblock davor!',
                      );
                    }
                  } else {
                    navigate(`/zahlenbloecke/${hero.id}`);
                  }
                }}
              />
              {nodeState === 'current' && <Kiko pose="zeigt" size={56} className={styles.kiko} />}
            </div>
          );
        })}
      </div>

      <div className={styles.notice} aria-live="polite">
        {lockedNotice && (
          <SpeechBubble pose="denkt">
            Dieser Zahlenblock wartet noch! Schaffe zuerst den Zahlenblock davor!
          </SpeechBubble>
        )}
      </div>

      <div className={styles.next}>
        {currentHero ? (
          <Button
            block
            onClick={() => {
              navigate(`/zahlenbloecke/${currentHero.id}`);
            }}
          >
            <UiIcon name="pfeil-weiter" /> {UI.map.next(currentHero.name)}
          </Button>
        ) : (
          <LinkButton href="/schaetze" block>
            {UI.map.allDone}
          </LinkButton>
        )}
      </div>
    </div>
  );
}

const BIG_TENS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

/** Detailansicht eines Zahlenblocks (/zahlenbloecke/:blockId) mit echter Figur, Geschichte und 3 Stationen. */
export function ZahlenblockView({ profile, blockId }: { profile: Profile; blockId: string }) {
  const hero = heroById(blockId);
  const heroIndex = ZAHLENBLOCK_HEROES.findIndex((h) => h.id === blockId);
  const [openStation, setOpenStation] = useState<Station | undefined>();
  const [lockedMsg, setLockedMsg] = useState(false);

  const fullStory = hero ? `${hero.name}. ${hero.catchphrase} ${hero.story.join(' ')}` : '';

  useEffect(() => {
    if (!hero) return;
    if (autoReadOf(profile)) {
      toggleSpeak(fullStory);
    }
    return () => {
      stopSpeaking();
    };
  }, [fullStory, hero, profile]);

  const closeSheet = () => {
    setOpenStation(undefined);
  };

  if (!hero || !isHeroUnlocked(profile, heroIndex)) {
    return <Redirect to="/zahlenbloecke" />;
  }

  const bonusSolved = profile.worlds.zahlenbloecke?.bonusSolved ?? [];
  const stars = heroStars(profile, hero);
  const nextHero = ZAHLENBLOCK_HEROES[heroIndex + 1];

  return (
    <div className={styles.heroPage}>
      <div className={styles.topBar}>
        <LinkButton href="/zahlenbloecke" variant="secondary">
          <UiIcon name="zurueck" /> Alle Zahlenblöcke
        </LinkButton>
        <span className={styles.heroStars}>
          {[0, 1, 2].map((i) => (
            <Star key={i} size={24} filled={i < stars} />
          ))}
        </span>
      </div>

      <header className={styles.heroHeader}>
        <button
          type="button"
          className={styles.heroFigureBtn}
          aria-label={`${hero.name} Spruch anhören`}
          onClick={() => {
            toggleSpeak(hero.catchphrase);
          }}
        >
          <NumberBlock value={hero.number} size={112} />
        </button>
        <div>
          <p className={styles.heroNumber}>Zahlenblock {String(hero.number)} von 10</p>
          <h1 className={styles.heroTitle}>{hero.name}</h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
          <p className={styles.catchphrase}>„{hero.catchphrase}“</p>
        </div>
      </header>

      {hero.number === 10 && (
        <section className={styles.tensShowcase} aria-label="Die großen Zehner bis 100">
          {BIG_TENS.map((ten) => (
            <button
              key={ten}
              type="button"
              className={styles.tenChip}
              onClick={() => {
                toggleSpeak(
                  ten === 100
                    ? 'Hundert! Zehn Zehner sind Hundert!'
                    : `${String(ten)}! ${String(ten / 10)} Zehner!`,
                );
              }}
            >
              <NumberBlock value={ten} size={52} />
              <span>{ten}</span>
            </button>
          ))}
        </section>
      )}

      <section className={styles.storyCard} aria-label="Geschichte zum Zahlenblock">
        {hero.story.map((line, i) => (
          <SpeechBubble key={line} kikoSize={52} kiko={i === 0}>
            {line}
          </SpeechBubble>
        ))}
        {canSpeak() && (
          <Button
            variant="secondary"
            onClick={() => {
              toggleSpeak(fullStory);
            }}
          >
            <UiIcon name="lautsprecher" /> Geschichte vorlesen
          </Button>
        )}
      </section>

      <section className={styles.stationList} aria-label="Stationen bei diesem Zahlenblock">
        <h2 className={styles.sectionTitle}>Deine 3 Stationen mit {hero.shortName}</h2>
        <div className={styles.stationCards}>
          {hero.stations.map((station, idx) => {
            const globalIdx = heroIndex * 3 + idx;
            const done = isCompleted(profile, 'zahlenbloecke', station.id);
            const unlocked = isBlockStationUnlocked(profile, globalIdx);
            const isNext = !done && unlocked;
            return (
              <button
                key={station.id}
                type="button"
                className={cx(
                  styles.stationCard,
                  done && styles.stationDone,
                  isNext && styles.stationCurrent,
                  !unlocked && styles.stationLocked,
                )}
                onClick={() => {
                  if (!unlocked) {
                    setLockedMsg(true);
                    if (autoReadOf(profile)) {
                      toggleSpeak('Schaffe zuerst die Station davor!');
                    }
                  } else {
                    setOpenStation(station);
                  }
                }}
              >
                <StationIcon icon={station.icon} size={56} />
                <div className={styles.stationInfo}>
                  <span className={styles.stationStep}>Station {String(idx + 1)} von 3</span>
                  <strong className={styles.stationName}>{station.title}</strong>
                  <span className={styles.stationSkill}>{station.skillLabel}</span>
                </div>
                <div className={styles.stationStatus}>
                  {done ? (
                    <Star size={32} />
                  ) : unlocked ? (
                    <UiIcon name="pfeil-weiter" size={28} />
                  ) : (
                    <UiIcon name="schloss" size={26} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {lockedMsg && (
        <SpeechBubble pose="denkt">
          Schaffe zuerst die Station davor, dann öffnet sich dieser Weg!
        </SpeechBubble>
      )}

      {stars === 3 && (
        <section className={styles.factBox} aria-label={hero.friendCard.title}>
          <div className={styles.factHeader}>
            <FindlingIcon id={hero.stations[2].findling.id} size={64} />
            <div>
              <span className={styles.factBadge}>Zahlenblock-Freundeskarte freigeschaltet!</span>
              <h3 className={styles.factTitle}>{hero.friendCard.title}</h3>
            </div>
          </div>
          <p className={styles.factText}>{hero.friendCard.fact}</p>
          <div className={styles.factActions}>
            {canSpeak() && (
              <Button
                variant="ghost"
                onClick={() => {
                  toggleSpeak(`${hero.friendCard.title}. ${hero.friendCard.fact}`);
                }}
              >
                <UiIcon name="lautsprecher" /> Wissen vorlesen
              </Button>
            )}
            {nextHero && (
              <LinkButton href={`/zahlenbloecke/${nextHero.id}`}>
                <UiIcon name="pfeil-weiter" /> Weiter zu {nextHero.name}
              </LinkButton>
            )}
          </div>
        </section>
      )}

      {openStation && (
        <StationSheet
          station={openStation}
          completed={isCompleted(profile, 'zahlenbloecke', openStation.id)}
          resumable={canResume(profile, openStation.id)}
          bonusOpen={!bonusSolved.includes(openStation.id)}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
