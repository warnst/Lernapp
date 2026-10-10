import { type CSSProperties, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { cx } from '@/components/cx';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { NONOGRAMS } from '@/content/nonograms';
import { UI } from '@/content/ui';
import type { KikoPose } from '@/domain/hints';
import { clues } from '@/domain/nonogram';
import { mulberry32, pick } from '@/domain/random';
import type { Profile } from '@/domain/types';
import { stopSpeaking, toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { towerOf } from '@/state/reducer';
import styles from './Nonogram.module.css';
import { TowerDone } from './TowerDone';

// Bilderrätsel (docs/12 3.6): ausmalen, Punkte setzen; am Ende erscheint das Bild in Farbe.

type Mark = 0 | 1 | 2; // leer, ausgemalt, Punkt

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

function Play({ profile, onSolved }: { profile: Profile; onSolved: () => void }) {
  const { dispatch } = useAppState();
  const cfg = STUFEN[profile.stufe];
  const [seed] = useState(newSeed);
  const picture = useMemo(() => {
    const sizes = cfg.tower.nonogram.sizes;
    const choices = NONOGRAMS.filter((p) => sizes.includes(p.rows.length));
    return pick(mulberry32(seed), choices.length > 0 ? choices : NONOGRAMS);
  }, [cfg.tower.nonogram.sizes, seed]);
  const size = picture.rows.length;
  const solution = picture.rows.flatMap((row) => Array.from(row).map((c) => c !== '.'));
  const colorOf = (cell: number) => {
    const char = picture.rows[Math.floor(cell / size)]?.[cell % size] ?? '.';
    return picture.palette[char] ?? 'var(--ink-900)';
  };
  const rowClues = picture.rows.map((row) => clues(Array.from(row).map((c) => c !== '.')));
  const colClues = Array.from({ length: size }, (_, c) =>
    clues(picture.rows.map((row) => row[c] !== '.')),
  );
  const [marks, setMarks] = useState<Mark[]>(() => new Array<Mark>(size * size).fill(0));
  const [hint, setHint] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [pose, setPose] = useState<KikoPose>('hallo');
  const [line, setLine] = useState<string>(UI.nonogram.start);

  const say = (text: string, nextPose: KikoPose = 'hallo') => {
    setLine(text);
    setPose(nextPose);
    if (cfg.autoRead) {
      stopSpeaking();
      toggleSpeak(text);
    }
  };

  const lineDone = (cells: number[], clue: number[]) =>
    clues(cells.map((i) => marks[i] === 1)).join(' ') === clue.join(' ');

  const tap = (cell: number) => {
    if (solved) return;
    setHint(null);
    const next = marks.map((m, i): Mark => (i === cell ? (((m + 1) % 3) as Mark) : m));
    setMarks(next);
    if (next.every((m, i) => (m === 1) === solution[i])) {
      setSolved(true);
      say(UI.nonogram.done(picture.name), 'freut-sich');
    }
  };

  const showHint = () => {
    const extra = marks.findIndex((m, i) => m === 1 && !solution[i]);
    if (extra >= 0) {
      setHint(extra);
      say(UI.nonogram.tooMuch, 'zeigt');
      return;
    }
    const missing = solution.findIndex((filled, i) => filled && marks[i] !== 1);
    if (missing < 0) return;
    setHint(missing);
    say(UI.nonogram.hint, 'zeigt');
  };

  const label = (cell: number) =>
    marks[cell] === 1
      ? UI.nonogram.filled
      : marks[cell] === 2
        ? UI.nonogram.dot
        : UI.nonogram.empty;
  const range = Array.from({ length: size }, (_, i) => i);

  return (
    <Screen title={UI.nonogram.title}>
      <SpeechBubble pose={pose} kikoSize={48}>
        {line}
      </SpeechBubble>
      <div
        className={cx(styles.puzzle, solved && styles.solved)}
        style={{ '--n': size } as CSSProperties}
      >
        <span className={styles.corner} aria-hidden="true" />
        {colClues.map((clue, c) => (
          <span
            key={`c${String(c)}`}
            className={cx(
              styles.colClue,
              lineDone(
                range.map((r) => r * size + c),
                clue,
              ) && styles.clueDone,
            )}
            aria-label={UI.nonogram.colClue(c + 1, clue.join(' ') || '0')}
          >
            {(clue.length > 0 ? clue : [0]).map((n, i) => (
              <span key={i}>{n}</span>
            ))}
          </span>
        ))}
        {range.map((r) => [
          <span
            key={`r${String(r)}`}
            className={cx(
              styles.rowClue,
              lineDone(
                range.map((c) => r * size + c),
                rowClues[r] ?? [],
              ) && styles.clueDone,
            )}
            aria-label={UI.nonogram.rowClue(r + 1, (rowClues[r] ?? []).join(' ') || '0')}
          >
            {((rowClues[r] ?? []).length > 0 ? (rowClues[r] ?? []) : [0]).join(' ')}
          </span>,
          ...range.map((c) => {
            const cell = r * size + c;
            const mark = marks[cell];
            return (
              <button
                key={cell}
                type="button"
                className={cx(
                  styles.cell,
                  mark === 1 && styles.filled,
                  mark === 2 && styles.dot,
                  hint === cell && styles.hint,
                  c % 5 === 4 && c < size - 1 && styles.split,
                )}
                style={solved && solution[cell] ? { background: colorOf(cell) } : undefined}
                aria-label={UI.nonogram.cell(r + 1, c + 1, label(cell))}
                onClick={() => {
                  tap(cell);
                }}
              />
            );
          }),
        ])}
      </div>
      {solved ? (
        <Button
          block
          onClick={() => {
            dispatch({ type: 'tower-solved', id: profile.id, kind: 'nonogram' });
            onSolved();
          }}
        >
          {UI.nonogram.reveal}
        </Button>
      ) : (
        <Button variant="secondary" block onClick={showHint}>
          {UI.play.hint}
        </Button>
      )}
    </Screen>
  );
}

/** Adresse `/raetsel/bilderraetsel` */
export function Nonogram({ profile }: { profile: Profile }) {
  const [round, setRound] = useState(0);
  const [before, setBefore] = useState<number | null>(null);
  if (before !== null) {
    return (
      <TowerDone
        profile={profile}
        before={before}
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
