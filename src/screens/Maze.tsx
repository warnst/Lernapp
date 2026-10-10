import { type CSSProperties, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { cx } from '@/components/cx';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { pieceLabel, UI } from '@/content/ui';
import type { KikoPose } from '@/domain/hints';
import { formatMoney, speakMoney } from '@/domain/money';
import { mulberry32, pick } from '@/domain/random';
import type { CoinValue, Profile } from '@/domain/types';
import { Chest } from '@/illustrations/Chest';
import { Coin } from '@/illustrations/Coin';
import { Kiko } from '@/illustrations/Kiko';
import {
  canStep,
  generateCoinPath,
  generateMaze,
  type MazePuzzle,
  neighbours,
  nextHint,
  pathSum,
} from '@/practice/tower/maze';
import { stopSpeaking, toggleSpeak } from '@/speech/speak';
import { autoReadOf } from '@/state/progress';
import { useAppState } from '@/state/context';
import { towerOf } from '@/state/reducer';
import styles from './Maze.module.css';
import { TowerDone } from './TowerDone';

// Labyrinth (Stufe 1–2) und Münzpfad (Stufe 3–4), docs/12 3.5: Feld für Feld zur Truhe.

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

function makePuzzle(profile: Profile, seed: number): MazePuzzle {
  const cfg = STUFEN[profile.stufe].tower.maze;
  if (cfg.mode === 'maze') return generateMaze(cfg.size, seed);
  const target = pick(mulberry32(seed), cfg.targets);
  return generateCoinPath(cfg.size, target, cfg.coins, seed);
}

/** Wände eines Feldes: Seiten ohne begehbare Verbindung zum Nachbarn bzw. am Rand. */
function walls(puzzle: MazePuzzle, cell: number): string[] {
  const { size } = puzzle;
  const row = Math.floor(cell / size);
  const col = cell % size;
  const blocked = (other: number) => !canStep(puzzle, cell, other);
  return [
    row > 0 && blocked(cell - size) && styles.wallTop,
    col < size - 1 && blocked(cell + 1) && styles.wallRight,
    row < size - 1 && blocked(cell + size) && styles.wallBottom,
    col > 0 && blocked(cell - 1) && styles.wallLeft,
  ].filter((name): name is string => typeof name === 'string');
}

function Play({ profile, onSolved }: { profile: Profile; onSolved: () => void }) {
  const { dispatch } = useAppState();
  const [seed] = useState(newSeed);
  const puzzle = useMemo(() => makePuzzle(profile, seed), [profile, seed]);
  const coinMode = puzzle.target > 0;
  const target = formatMoney(puzzle.target);
  const [path, setPath] = useState<number[]>([puzzle.start]);
  const [hint, setHint] = useState<number | null>(null);
  const [pose, setPose] = useState<KikoPose>('hallo');
  const [line, setLine] = useState(
    coinMode ? UI.maze.startCoins(speakMoney(puzzle.target)) : UI.maze.start,
  );
  const { size } = puzzle;
  const last = path[path.length - 1] ?? puzzle.start;
  const sum = pathSum(puzzle, path);

  const say = (text: string, nextPose: KikoPose = 'hallo') => {
    setLine(text);
    setPose(nextPose);
    if (autoReadOf(profile)) {
      stopSpeaking();
      toggleSpeak(text);
    }
  };

  const tap = (cell: number) => {
    setHint(null);
    // zurück auf ein Feld des Weges: bis dahin zurückgehen
    const index = path.indexOf(cell);
    if (index >= 0) {
      setPath(path.slice(0, index + 1));
      return;
    }
    if (!neighbours(size, last).includes(cell)) {
      say(UI.maze.near, 'denkt');
      return;
    }
    if (!canStep(puzzle, last, cell)) {
      say(UI.maze.wall, 'denkt');
      return;
    }
    const next = [...path, cell];
    setPath(next);
    const nextSum = pathSum(puzzle, next);
    if (cell === puzzle.goal) {
      if (!coinMode || nextSum === puzzle.target) {
        dispatch({ type: 'tower-solved', id: profile.id, kind: 'maze' });
        onSolved();
        return;
      }
      say(UI.maze.wrongSum(speakMoney(nextSum), speakMoney(puzzle.target)), 'denkt');
      return;
    }
    if (coinMode && nextSum > puzzle.target) say(UI.maze.tooMuch(speakMoney(nextSum)), 'denkt');
  };

  const showHint = () => {
    const next = nextHint(puzzle, path);
    if (!next) return;
    if (next.back > 0) {
      setHint(path[path.length - 1 - next.back] ?? null);
      say(UI.maze.hintBack(next.back), 'zeigt');
      return;
    }
    setHint(next.cell);
    say(UI.maze.hintNext, 'zeigt');
  };

  const center = (cell: number) => [(cell % size) + 0.5, Math.floor(cell / size) + 0.5] as const;

  return (
    <Screen title={coinMode ? UI.maze.titleCoins : UI.maze.title}>
      <SpeechBubble pose={pose} kikoSize={48}>
        {line}
      </SpeechBubble>
      <div
        className={cx(styles.board, coinMode && styles.open)}
        role="group"
        aria-label={UI.maze.board}
        style={{ '--n': size } as CSSProperties}
      >
        <svg
          className={styles.trail}
          viewBox={`0 0 ${String(size)} ${String(size)}`}
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <polyline points={path.map((cell) => center(cell).join(',')).join(' ')} />
        </svg>
        {Array.from({ length: size * size }, (_, cell) => {
          const coin = puzzle.coins[cell] ?? 0;
          const inPath = path.includes(cell);
          const extra =
            cell === last
              ? UI.maze.kiko
              : cell === puzzle.goal
                ? UI.maze.chest
                : coin > 0
                  ? pieceLabel(coin)
                  : '';
          return (
            <button
              key={cell}
              type="button"
              className={cx(
                styles.cell,
                ...walls(puzzle, cell),
                inPath && styles.path,
                hint === cell && styles.hint,
              )}
              aria-label={UI.maze.cell(Math.floor(cell / size) + 1, (cell % size) + 1, extra)}
              aria-pressed={inPath}
              onClick={() => {
                tap(cell);
              }}
            >
              {cell === last ? (
                <Kiko pose="hallo" size={size > 5 ? 34 : 44} />
              ) : cell === puzzle.goal ? (
                <Chest size={size > 5 ? 34 : 44} />
              ) : (
                coin > 0 && (
                  <span className={cx(styles.coin, inPath && styles.used)}>
                    <Coin value={coin as CoinValue} size={size > 4 ? 34 : 42} />
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
      {coinMode && (
        <p className={styles.sum} aria-live="polite">
          {UI.maze.sum(formatMoney(sum), target)}
        </p>
      )}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          disabled={path.length < 2}
          onClick={() => {
            setPath(path.slice(0, -1));
            setHint(null);
          }}
        >
          {UI.maze.undo}
        </Button>
        <Button variant="secondary" onClick={showHint}>
          {UI.play.hint}
        </Button>
      </div>
      <Button
        variant="ghost"
        block
        disabled={path.length < 2}
        onClick={() => {
          setPath([puzzle.start]);
          setHint(null);
        }}
      >
        {UI.maze.restart}
      </Button>
    </Screen>
  );
}

/** Adresse `/raetsel/labyrinth` */
export function Maze({ profile }: { profile: Profile }) {
  const [round, setRound] = useState(0);
  const [before, setBefore] = useState<number | null>(null);
  if (before !== null) {
    return (
      <TowerDone
        profile={profile}
        before={before}
        praise={UI.maze.done}
        onAgain={() => {
          setBefore(null);
          setRound(round + 1);
        }}
      />
    );
  }
  return (
    <Play
      key={round}
      profile={profile}
      onSolved={() => {
        setBefore(towerOf(profile).lamps);
      }}
    />
  );
}
