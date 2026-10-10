import { type CSSProperties, useState } from 'react';
import { Redirect } from 'wouter';
import { Button, LinkButton } from '@/components/Button';
import { JokeBox } from '@/components/JokeBox';
import { STUFEN } from '@/config/levels';
import { SpeechBubble } from '@/components/SpeechBubble';
import { StarPill } from '@/components/StarPill';
import { UI } from '@/content/ui';
import { WORLDS } from '@/content/worlds';
import type { Profile, Station } from '@/domain/types';
import { Chest } from '@/illustrations/Chest';
import { FindlingIcon } from '@/illustrations/FindlingIcon';
import { Kiko } from '@/illustrations/Kiko';
import { Star } from '@/illustrations/Star';
import { useAppState } from '@/state/context';
import { activeProfile, isCompleted, starCount, worldOf } from '@/state/progress';
import styles from './StationComplete.module.css';

const CONFETTI_COLORS = ['var(--sun-400)', 'var(--sea-500)', 'var(--coral-400)', 'var(--palm-600)'];

/** Einfaches CSS-Konfetti: 30 Teilchen, 1,2 s, entfällt bei reduzierter Bewegung (docs/02 7). */
function Confetti() {
  return (
    <div className={styles.confetti} aria-hidden="true">
      {Array.from({ length: 30 }, (_, i) => {
        const style: CSSProperties = {
          left: `${String((i * 37) % 100)}%`,
          background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          animationDelay: `${String((i % 6) * 60)}ms`,
        };
        return <span key={i} className={styles.piece} style={style} />;
      })}
    </div>
  );
}

/** Freiwilliges Angebot: „Kiko hat noch ein Bonus-Rätsel. Magst du?“ (docs/10 6) */
function BonusOffer({ profile, station }: { profile: Profile; station: Station }) {
  const [later, setLater] = useState(false);
  const solved = profile.worlds[station.world]?.bonusSolved.includes(station.id) ?? false;
  if (solved || later) return null;
  return (
    <section className={styles.bonus}>
      <SpeechBubble kikoSize={48}>{UI.bonus.offer}</SpeechBubble>
      <div className={styles.bonusActions}>
        <LinkButton href={`/station/${station.id}/bonus`}>{UI.bonus.yes}</LinkButton>
        <Button
          variant="secondary"
          onClick={() => {
            setLater(true);
          }}
        >
          {UI.bonus.later}
        </Button>
      </div>
    </section>
  );
}

/** Finale nach der letzten Station: Truhe öffnet sich, alle Fundstücke erscheinen (docs/01 5.6, docs/11). */
function Finale({ profile, stations }: { profile: Profile; stations: Station[] }) {
  const last = stations.at(-1);
  if (!last) return null;
  const world = last.world;
  return (
    <main className={styles.page}>
      <Confetti />
      <Chest open size={180} className={styles.chest} lidClassName={styles.lid} />
      <div className={styles.treasures}>
        {[...stations].reverse().map((station, i) => (
          <span
            key={station.id}
            className={styles.appear}
            style={{ animationDelay: `${String(900 + i * 250)}ms` }}
          >
            <FindlingIcon id={station.findling.id} size={i === 0 ? 88 : 56} />
          </span>
        ))}
      </div>
      <SpeechBubble pose="freut-sich" kikoSize={72}>
        {UI.complete.finale[world]}
      </SpeechBubble>
      <div className={styles.actions}>
        <LinkButton href="/schaetze" block>
          {UI.complete.myTreasures}
        </LinkButton>
        <LinkButton href="/" variant="secondary" block>
          {UI.complete.finaleMap}
        </LinkButton>
      </div>
      <BonusOffer profile={profile} station={last} />
    </main>
  );
}

function Complete({
  profile,
  stations,
  index,
}: {
  profile: Profile;
  stations: Station[];
  index: number;
}) {
  const station = stations[index];
  if (!station) return null;
  if (index === stations.length - 1) return <Finale profile={profile} stations={stations} />;
  const next = stations[index + 1];
  return (
    <main className={styles.page}>
      <Confetti />
      <div className={styles.top}>
        <StarPill count={starCount(profile, stations)} total={stations.length} />
      </div>
      <Kiko pose="freut-sich" size={120} />
      <FindlingIcon id={station.findling.id} size={128} className={styles.findling} />
      <h1 className={styles.name}>{station.findling.name}</h1>
      <p className={styles.text}>{station.findling.text}</p>
      <span className={styles.star} role="img" aria-label={UI.complete.starLabel}>
        <Star size={72} />
      </span>
      <p className={styles.recap}>{station.recap}</p>
      <div className={styles.actions}>
        <LinkButton href="/" block>
          {UI.complete.toMap}
        </LinkButton>
        {next && (
          <LinkButton href={`/station/${next.id}`} variant="secondary" block>
            {UI.complete.nextStation}
          </LinkButton>
        )}
      </div>
      <BonusOffer profile={profile} station={station} />
      <JokeBox profile={profile} readAloud={STUFEN[profile.stufe].autoRead} startOpen={false} />
    </main>
  );
}

/** Stationsabschluss mit Fundstück, Stern und Rückblick (docs/01 5.6). */
export function StationComplete({ stationId }: { stationId: string }) {
  const { state } = useAppState();
  const profile = activeProfile(state);
  if (!profile) return <Redirect to="/" />;
  const world = worldOf(profile);
  const stations = WORLDS[world].stations;
  const index = stations.findIndex((s) => s.id === stationId);
  if (index === -1 || !isCompleted(profile, world, stationId)) return <Redirect to="/" />;
  return <Complete profile={profile} stations={stations} index={index} />;
}
