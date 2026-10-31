import { useCallback, useEffect, useRef, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import { cx } from '@/components/cx';
import { SpeechBubble } from '@/components/SpeechBubble';
import { StationNode, type StationNodeState } from '@/components/StationNode';
import { UI } from '@/content/ui';
import {
  KOSMOS_PLANETS,
  KOSMOS_STATIONS,
  type KosmosPlanet,
  planetById,
} from '@/content/worlds/kosmos/planets';
import type { Profile, Station } from '@/domain/types';
import { FindlingIcon } from '@/illustrations/FindlingIcon';
import { Kiko } from '@/illustrations/Kiko';
import { MapBackground } from '@/illustrations/MapBackground';
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
import styles from './KosmosMap.module.css';

const PLANET_LAYOUT: [number, number][] = [
  [50, 91], // 1. Mond
  [72, 79], // 2. Merkur
  [30, 67], // 3. Venus
  [68, 55], // 4. Mars
  [32, 43], // 5. Jupiter
  [70, 31], // 6. Saturn
  [34, 19], // 7. Uranus
  [52, 7], // 8. Neptun
];

function isKosmosUnlocked(profile: Profile, stationIndex: number): boolean {
  if (profile.worlds[worldOf(profile)]?.unlockAll === true) return true;
  return isUnlocked(profile, KOSMOS_STATIONS, stationIndex);
}

function isPlanetUnlocked(profile: Profile, planetIndex: number): boolean {
  if (planetIndex === 0) return true;
  return isKosmosUnlocked(profile, planetIndex * 3);
}

function planetStars(profile: Profile, planet: KosmosPlanet): number {
  return planet.stations.filter((s) => isCompleted(profile, 'kosmos', s.id)).length;
}

/** Übersicht des Sonnensystems (/kosmos) mit 8 Planeten. */
export function KosmosMap({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const [, navigate] = useLocation();
  const welcomeKey = 'welcome:kosmos';
  const firstVisit = !profile.celebrated.includes(welcomeKey);
  const [showGreeting, setShowGreeting] = useState(true);
  const [lockedNotice, setLockedNotice] = useState(false);
  const currentRef = useRef<HTMLDivElement>(null);

  const nextStation = currentStation(profile, KOSMOS_STATIONS);
  const currentPlanet =
    KOSMOS_PLANETS.find((p) => p.stations.some((s) => s.id === nextStation?.id)) ??
    (KOSMOS_PLANETS.every((p) => planetStars(profile, p) === 3) ? undefined : KOSMOS_PLANETS[0]);

  useEffect(() => {
    if (firstVisit && autoReadOf(profile)) {
      toggleSpeak(UI.map.firstVisit.kosmos);
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

  const points = PLANET_LAYOUT.map(([x, y]) => `${String(x)},${String(y)}`).join(' ');

  const stateOfPlanet = (planet: KosmosPlanet, index: number): StationNodeState => {
    if (planetStars(profile, planet) === 3) return 'done';
    if (planet.id === currentPlanet?.id) return 'current';
    return isPlanetUnlocked(profile, index) ? 'open' : 'locked';
  };

  return (
    <div className={styles.page}>
      {showGreeting && (
        <div className={styles.greeting}>
          <SpeechBubble kikoSize={56}>{UI.map.firstVisit.kosmos}</SpeechBubble>
        </div>
      )}

      <div className={styles.map}>
        <MapBackground world="kosmos" className={styles.background} />
        <svg
          className={styles.path}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline points={points} vectorEffect="non-scaling-stroke" />
        </svg>

        {KOSMOS_PLANETS.map((planet, index) => {
          const [x, y] = PLANET_LAYOUT[index] ?? [50, 50];
          const nodeState = stateOfPlanet(planet, index);
          const stars = planetStars(profile, planet);
          return (
            <div
              key={planet.id}
              ref={planet.id === currentPlanet?.id ? currentRef : undefined}
              className={styles.spot}
              style={{ left: `${String(x)}%`, top: `${String(y)}%` }}
            >
              <StationNode
                number={planet.number}
                title={`${planet.shortName} (${String(stars)}/3)`}
                icon={planet.icon}
                state={nodeState}
                bonus={stars === 3}
                revealing={false}
                onSelect={() => {
                  if (nodeState === 'locked') {
                    setLockedNotice(true);
                    if (autoReadOf(profile)) {
                      toggleSpeak(
                        'Dieser Planet ist noch im Sternennebel. Schaffe zuerst die drei Stationen auf dem Planeten davor!',
                      );
                    }
                  } else {
                    navigate(`/kosmos/${planet.id}`);
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
            Dieser Planet ist noch im Sternennebel. Schaffe zuerst den Planeten davor!
          </SpeechBubble>
        )}
      </div>

      <div className={styles.next}>
        {currentPlanet ? (
          <Button
            block
            onClick={() => {
              navigate(`/kosmos/${currentPlanet.id}`);
            }}
          >
            <UiIcon name="pfeil-weiter" /> {UI.map.next(currentPlanet.name)}
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

/** Detailansicht eines Planeten (/kosmos/:planetId) mit vorgelesener Geschichte und 3 Stationen. */
export function KosmosPlanetView({ profile, planetId }: { profile: Profile; planetId: string }) {
  const planet = planetById(planetId);
  const planetIndex = KOSMOS_PLANETS.findIndex((p) => p.id === planetId);
  const [openStation, setOpenStation] = useState<Station | undefined>();
  const [lockedMsg, setLockedMsg] = useState(false);

  const fullStory = planet ? `${planet.name}. ${planet.story.join(' ')}` : '';

  useEffect(() => {
    if (!planet) return;
    if (autoReadOf(profile)) {
      toggleSpeak(fullStory);
    }
    return () => {
      stopSpeaking();
    };
  }, [fullStory, planet, profile]);

  const closeSheet = useCallback(() => {
    setOpenStation(undefined);
  }, []);

  if (!planet || !isPlanetUnlocked(profile, planetIndex)) {
    return <Redirect to="/kosmos" />;
  }

  const bonusSolved = profile.worlds.kosmos?.bonusSolved ?? [];
  const stars = planetStars(profile, planet);
  const nextPlanet = KOSMOS_PLANETS[planetIndex + 1];

  return (
    <div className={styles.planetPage}>
      <div className={styles.topBar}>
        <LinkButton href="/kosmos" variant="secondary">
          <UiIcon name="zurueck" /> Alle Planeten
        </LinkButton>
        <span className={styles.planetStars}>
          {[0, 1, 2].map((i) => (
            <Star key={i} size={24} filled={i < stars} />
          ))}
        </span>
      </div>

      <header className={styles.planetHeader}>
        <StationIcon icon={planet.icon} size={96} className={styles.planetBadge} />
        <div>
          <p className={styles.planetNumber}>Planet {String(planet.number)} von 8</p>
          <h1 className={styles.planetTitle}>{planet.name}</h1>
          <p className={styles.planetSubtitle}>{planet.subtitle}</p>
        </div>
      </header>

      <section className={styles.storyCard} aria-label="Geschichte zum Planeten">
        {planet.story.map((line, i) => (
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

      <section className={styles.stationList} aria-label="Stationen auf diesem Planeten">
        <h2 className={styles.sectionTitle}>Deine 3 Stationen auf {planet.shortName}</h2>
        <div className={styles.stationCards}>
          {planet.stations.map((station, idx) => {
            const globalIdx = planetIndex * 3 + idx;
            const done = isCompleted(profile, 'kosmos', station.id);
            const unlocked = isKosmosUnlocked(profile, globalIdx);
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
        <section className={styles.factBox} aria-label={planet.factCard.title}>
          <div className={styles.factHeader}>
            <FindlingIcon id={planet.stations[2].findling.id} size={64} />
            <div>
              <span className={styles.factBadge}>Planeten-Wissenskarte freigeschaltet!</span>
              <h3 className={styles.factTitle}>{planet.factCard.title}</h3>
            </div>
          </div>
          <p className={styles.factText}>{planet.factCard.fact}</p>
          <div className={styles.factActions}>
            {canSpeak() && (
              <Button
                variant="ghost"
                onClick={() => {
                  toggleSpeak(`${planet.factCard.title}. ${planet.factCard.fact}`);
                }}
              >
                <UiIcon name="lautsprecher" /> Wissen vorlesen
              </Button>
            )}
            {nextPlanet && (
              <LinkButton href={`/kosmos/${nextPlanet.id}`}>
                <UiIcon name="pfeil-weiter" /> Weiter zu {nextPlanet.name}
              </LinkButton>
            )}
          </div>
        </section>
      )}

      {openStation && (
        <StationSheet
          station={openStation}
          completed={isCompleted(profile, 'kosmos', openStation.id)}
          resumable={canResume(profile, openStation.id)}
          bonusOpen={!bonusSolved.includes(openStation.id)}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
