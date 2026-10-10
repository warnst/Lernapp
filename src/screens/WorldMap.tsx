import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, LinkButton } from '@/components/Button';
import { SpeechBubble } from '@/components/SpeechBubble';
import { StationNode, type StationNodeState } from '@/components/StationNode';
import { avatarInfo } from '@/content/avatars';
import { UI } from '@/content/ui';
import { WORLDS } from '@/content/worlds';
import type { Profile, Station, WorldId } from '@/domain/types';
import { Kiko } from '@/illustrations/Kiko';
import { MapBackground } from '@/illustrations/MapBackground';
import { UiIcon } from '@/illustrations/UiIcon';
import { useAppState } from '@/state/context';
import { canResume, currentStation, isCompleted, isUnlocked, worldOf } from '@/state/progress';
import { StationSheet } from './StationSheet';
import styles from './WorldMap.module.css';
import { cx } from '@/components/cx';

/** Lage der Stationen in Prozent der Karte (x, y). Station 1 unten am Strand. */
const LAYOUT: Record<WorldId, [number, number][]> = {
  schatzinsel: [
    [50, 95],
    [72, 84],
    [34, 73],
    [66, 62],
    [32, 51],
    [68, 40],
    [36, 29],
    [64, 18],
    [50, 6],
  ],
  'kleine-bucht': [
    [26, 82],
    [70, 78],
    [78, 50],
    [56, 26],
    [24, 34],
  ],
};

const GREETING_MS = 4000;
const NOTICE_MS = 3500;

function useTimedFlag(ms: number): [boolean, () => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const timer = window.setTimeout(() => {
      setOn(false);
    }, ms);
    return () => {
      window.clearTimeout(timer);
    };
  }, [on, ms]);
  return [
    on,
    () => {
      setOn(true);
    },
  ];
}

function greetingText(profile: Profile, world: WorldId, firstVisit: boolean): string {
  if (firstVisit) return UI.map.firstVisit[world];
  return profile.name === undefined
    ? UI.map.greetingAnimal(avatarInfo(profile.avatar).small)
    : UI.map.greeting(profile.name);
}

/** Karte der Insel bzw. der Bucht mit Weg, Nebel und Weiter-Knopf (docs/01 5.2, docs/11). */
export function WorldMap({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const world = WORLDS[worldOf(profile)];
  const stations = world.stations;
  const current = currentStation(profile, stations);
  const welcomeKey = `welcome:${world.id}`;

  const [greeting] = useState(() =>
    greetingText(profile, world.id, !profile.celebrated.includes(welcomeKey)),
  );
  const [showGreeting, setShowGreeting] = useState(true);
  // Stationen, deren Nebel noch nicht abgezogen ist: einmalig animieren (celebrated „fog:<id>“)
  const [revealing] = useState(
    () =>
      new Set(
        stations
          .filter(
            (s, i) =>
              i > 0 &&
              isUnlocked(profile, stations, i) &&
              !profile.celebrated.includes(`fog:${s.id}`),
          )
          .map((s) => s.id),
      ),
  );
  const [notice, showNotice] = useTimedFlag(NOTICE_MS);
  const [open, setOpen] = useState<Station | undefined>();
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    for (const id of revealing)
      dispatch({ type: 'mark-celebrated', id: profile.id, key: `fog:${id}` });
  }, [dispatch, profile.id, revealing]);

  useEffect(() => {
    dispatch({ type: 'mark-celebrated', id: profile.id, key: welcomeKey });
    const timer = window.setTimeout(() => {
      setShowGreeting(false);
    }, GREETING_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [dispatch, profile.id, welcomeKey]);

  useEffect(() => {
    const node = currentRef.current;
    // jsdom kennt scrollIntoView nicht
    if (node && 'scrollIntoView' in node) node.scrollIntoView({ block: 'center' });
  }, []);

  const close = useCallback(() => {
    setOpen(undefined);
  }, []);

  const layout = LAYOUT[world.id];
  const points = layout.map(([x, y]) => `${String(x)},${String(y)}`).join(' ');
  const bonusSolved = profile.worlds[world.id]?.bonusSolved ?? [];
  const stateOf = (station: Station, index: number): StationNodeState => {
    if (isCompleted(profile, world.id, station.id)) return 'done';
    if (station === current) return 'current';
    return isUnlocked(profile, stations, index) ? 'open' : 'locked';
  };

  return (
    <div className={styles.page}>
      {showGreeting && (
        <div className={styles.greeting}>
          <SpeechBubble kikoSize={56}>{greeting}</SpeechBubble>
        </div>
      )}
      <div
        className={cx(styles.map, world.id === 'schatzinsel' ? styles.schatzinsel : styles.bucht)}
      >
        <MapBackground world={world.id} className={styles.background} />
        <svg
          className={styles.path}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline points={points} vectorEffect="non-scaling-stroke" />
        </svg>
        {stations.map((station, index) => {
          const [x, y] = layout[index] ?? [50, 50];
          const nodeState = stateOf(station, index);
          return (
            <div
              key={station.id}
              ref={station === current ? currentRef : undefined}
              className={styles.spot}
              style={{ left: `${String(x)}%`, top: `${String(y)}%` }}
            >
              <StationNode
                number={station.number}
                title={station.title}
                icon={station.icon}
                state={nodeState}
                bonus={bonusSolved.includes(station.id)}
                revealing={revealing.has(station.id)}
                onSelect={() => {
                  if (nodeState === 'locked') showNotice();
                  else setOpen(station);
                }}
              />
              {nodeState === 'current' && <Kiko pose="zeigt" size={56} className={styles.kiko} />}
            </div>
          );
        })}
      </div>

      <div className={styles.notice} aria-live="polite">
        {notice && <SpeechBubble pose="denkt">{UI.map.locked}</SpeechBubble>}
      </div>

      <div className={styles.next}>
        {current ? (
          <Button
            block
            onClick={() => {
              setOpen(current);
            }}
          >
            <UiIcon name="pfeil-weiter" /> {UI.map.next(current.title)}
          </Button>
        ) : (
          <LinkButton href="/schaetze" block>
            {UI.map.allDone}
          </LinkButton>
        )}
      </div>

      {open && (
        <StationSheet
          station={open}
          completed={isCompleted(profile, world.id, open.id)}
          resumable={canResume(profile, open.id)}
          bonusOpen={!bonusSolved.includes(open.id)}
          onClose={close}
        />
      )}
    </div>
  );
}
