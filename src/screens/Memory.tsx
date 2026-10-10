import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { cx } from '@/components/cx';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { avatarInfo } from '@/content/avatars';
import { pieceLabel, UI } from '@/content/ui';
import { formatMoney, speakMoney } from '@/domain/money';
import type { AvatarId, Profile } from '@/domain/types';
import { AvatarIllustration } from '@/illustrations/AvatarIllustration';
import { Coin } from '@/illustrations/Coin';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { Kiko } from '@/illustrations/Kiko';
import { type MemoryCard, type MemoryFace, memoryDeck } from '@/practice/tower/memory';
import { stopSpeaking, toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { towerOf } from '@/state/reducer';
import styles from './Memory.module.css';
import { TowerDone } from './TowerDone';

// Memory (docs/12 3.2): allein oder zu zweit, ohne Zählen der Versuche und ohne Gewinner.

const FLIP_BACK_MS = 1000;

interface Player {
  name: string;
  avatar?: AvatarId;
}

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

function nameOf(profile: Profile): string {
  return profile.name ?? avatarInfo(profile.avatar).name;
}

function faceLabel(face: MemoryFace): string {
  switch (face.kind) {
    case 'icon':
      return face.name;
    case 'text':
      return face.speak;
    case 'money':
      return speakMoney(face.cents);
    case 'coins':
      return face.coins.map(pieceLabel).join(', ');
  }
}

function Face({ face }: { face: MemoryFace }) {
  switch (face.kind) {
    case 'icon':
      return <ItemIcon itemId={face.icon} size={52} />;
    case 'text':
      return <span className={styles.text}>{face.text}</span>;
    case 'money':
      return <span className={styles.text}>{formatMoney(face.cents)}</span>;
    case 'coins':
      return (
        <span className={styles.coins}>
          {face.coins.map((coin, i) => (
            <Coin key={i} value={coin} size={30} />
          ))}
        </span>
      );
  }
}

function Board({
  profile,
  players,
  onDone,
}: {
  profile: Profile;
  players: Player[];
  onDone: (praise: string) => void;
}) {
  const { dispatch } = useAppState();
  const cfg = STUFEN[profile.stufe];
  const [seed] = useState(newSeed);
  const deck = useMemo(() => memoryDeck(cfg.tower.memory, seed), [cfg.tower.memory, seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [turn, setTurn] = useState(0);
  const [line, setLine] = useState<string>(UI.memory.start);
  const timer = useRef<number | undefined>(undefined);
  const together = players.length > 1;
  const pairs = deck.length / 2;

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );

  const say = (text: string) => {
    setLine(text);
    if (cfg.autoRead) {
      stopSpeaking();
      toggleSpeak(text);
    }
  };

  const flip = (card: MemoryCard) => {
    if (open.length >= 2 || open.includes(card.id) || found.includes(card.pair)) return;
    if (cfg.autoRead) {
      stopSpeaking();
      toggleSpeak(faceLabel(card.face));
    }
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;
    const [first] = next;
    const other = deck.find((c) => c.id === first);
    if (other?.pair === card.pair) {
      const nextFound = [...found, card.pair];
      setFound(nextFound);
      setOpen([]);
      if (nextFound.length === pairs) {
        dispatch({ type: 'tower-solved', id: profile.id, kind: 'memory' });
        onDone(together ? UI.memory.doneTogether : UI.memory.doneAlone);
        return;
      }
      say(together ? UI.memory.pair : UI.memory.pairAlone);
      return;
    }
    timer.current = window.setTimeout(() => {
      setOpen([]);
      if (together) {
        const nextTurn = (turn + 1) % players.length;
        setTurn(nextTurn);
        say(UI.memory.turn(players[nextTurn]?.name ?? ''));
      } else {
        say(UI.memory.noPair);
      }
    }, FLIP_BACK_MS);
  };

  const player = players[turn];
  return (
    <Screen title={UI.memory.title}>
      {together && player ? (
        <div className={styles.turn} aria-live="polite">
          {player.avatar ? (
            <AvatarIllustration avatar={player.avatar} size={48} />
          ) : (
            <Kiko pose="zeigt" size={48} />
          )}
          <span>{UI.memory.turn(player.name)}</span>
        </div>
      ) : null}
      <SpeechBubble pose="hallo" kikoSize={44}>
        {line}
      </SpeechBubble>
      <div
        className={styles.board}
        role="group"
        aria-label={UI.memory.board}
        style={{ '--cols': deck.length > 12 ? 4 : 3 } as CSSProperties}
      >
        {deck.map((card) => {
          const shown = open.includes(card.id) || found.includes(card.pair);
          return (
            <button
              key={card.id}
              type="button"
              className={cx(
                styles.card,
                shown && styles.shown,
                found.includes(card.pair) && styles.found,
              )}
              aria-label={
                shown
                  ? UI.memory.open(card.id + 1, faceLabel(card.face))
                  : UI.memory.hidden(card.id + 1)
              }
              onClick={() => {
                flip(card);
              }}
            >
              <span className={styles.inner}>
                <span className={styles.back} aria-hidden="true" />
                <span className={styles.front} aria-hidden="true">
                  {shown && <Face face={card.face} />}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className={styles.count}>
        {together ? UI.memory.treasure(found.length) : UI.memory.found(found.length, pairs)}
      </p>
    </Screen>
  );
}

/** Adresse `/raetsel/memory` */
export function Memory({ profile }: { profile: Profile }) {
  const { state } = useAppState();
  const cfg = STUFEN[profile.stufe];
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [done, setDone] = useState<{ before: number; praise: string } | null>(null);
  const [round, setRound] = useState(0);
  const me: Player = { name: nameOf(profile), avatar: profile.avatar };
  const others = state.profiles.filter((p) => p.id !== profile.id);

  if (done) {
    return (
      <TowerDone
        profile={profile}
        before={done.before}
        praise={done.praise}
        onAgain={() => {
          setDone(null);
          setRound(round + 1);
        }}
      />
    );
  }
  if (players) {
    return (
      <Board
        key={round}
        profile={profile}
        players={players}
        onDone={(praise) => {
          setDone({ before: towerOf(profile).lamps, praise });
        }}
      />
    );
  }
  const read = (text: string) => {
    if (cfg.autoRead) toggleSpeak(text);
  };
  return (
    <Screen title={UI.memory.title}>
      <h2 className={styles.heading}>{choosing ? UI.memory.partner : UI.memory.who}</h2>
      {choosing ? (
        <div className={styles.choices}>
          {others.map((other) => (
            <button
              key={other.id}
              type="button"
              className={styles.choice}
              onClick={() => {
                setPlayers([me, { name: nameOf(other), avatar: other.avatar }]);
              }}
            >
              <AvatarIllustration avatar={other.avatar} size={64} />
              {nameOf(other)}
            </button>
          ))}
          <button
            type="button"
            className={styles.choice}
            onClick={() => {
              setPlayers([me, { name: UI.memory.adultName }]);
            }}
          >
            <Kiko pose="zeigt" size={64} />
            {UI.memory.adult}
          </button>
        </div>
      ) : (
        <div className={styles.choices}>
          <button
            type="button"
            className={styles.choice}
            onClick={() => {
              read(UI.memory.alone);
              setPlayers([me]);
            }}
          >
            <AvatarIllustration avatar={profile.avatar} size={64} />
            {UI.memory.alone}
          </button>
          <button
            type="button"
            className={styles.choice}
            onClick={() => {
              read(UI.memory.together);
              setChoosing(true);
            }}
          >
            <span className={styles.pair} aria-hidden="true">
              <AvatarIllustration avatar={profile.avatar} size={48} />
              <Kiko pose="hallo" size={48} />
            </span>
            {UI.memory.together}
          </button>
        </div>
      )}
      {choosing && (
        <Button
          variant="ghost"
          block
          onClick={() => {
            setChoosing(false);
          }}
        >
          {UI.memory.back}
        </Button>
      )}
    </Screen>
  );
}
