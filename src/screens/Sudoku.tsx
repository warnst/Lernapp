import { type CSSProperties, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { cx } from '@/components/cx';
import { SudokuBoard, SudokuPad, SudokuSymbol } from '@/components/game/SudokuBoard';
import { Screen } from '@/components/Screen';
import { SpeechBubble } from '@/components/SpeechBubble';
import { STUFEN } from '@/config/levels';
import { UI } from '@/content/ui';
import type { KikoPose } from '@/domain/hints';
import { mulberry32, pick } from '@/domain/random';
import { nextSafe, type SafeStep, units } from '@/domain/sudoku';
import type { Profile, Stufe, SudokuKind, SudokuSave } from '@/domain/types';
import { generateSudoku, type SudokuPuzzle } from '@/practice/tower/sudoku';
import { stopSpeaking, toggleSpeak } from '@/speech/speak';
import { useAppState } from '@/state/context';
import { towerOf } from '@/state/reducer';
import styles from './Sudoku.module.css';
import { TowerDone } from './TowerDone';

// Sudoku im Rätselturm (docs/12 3.1, 5, 6): Art und Sterne wählen, spielen, prüfen, Tipps.

type Stars = 1 | 2 | 3;
type Group = 'bilder' | 'zahlen' | 'muenzen';

const groupOf = (kind: SudokuKind): Group =>
  kind === 'bilder' || kind === 'muenzen' ? kind : 'zahlen';

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}

/** Leere Felder für Art und Sterne; ein gespeichertes Sudoku einer anderen Stufe bleibt spielbar. */
function emptiesFor(kind: SudokuKind, stars: Stars, stufe: Stufe): number {
  const own = STUFEN[stufe].tower.sudoku.kinds.find((k) => k.kind === kind);
  const any =
    own ??
    ([1, 2, 3, 4] as const)
      .flatMap((s) => STUFEN[s].tower.sudoku.kinds)
      .find((k) => k.kind === kind);
  return any?.empties[stars - 1] ?? 6;
}

function ruleText(puzzle: SudokuPuzzle): string {
  const rule = UI.sudoku.rule(UI.sudoku.each[groupOf(puzzle.kind)]);
  return puzzle.cages.length > 0 ? `${rule} ${UI.sudoku.cages}` : rule;
}

/** Name mit Artikel für den Tipp „In dieser Reihe passt der Stern nur in dieses Feld.“ */
function nameOf(kind: SudokuKind, value: number): string {
  if (kind === 'bilder') return UI.sudoku.names.bilder[value - 1] ?? String(value);
  if (kind === 'muenzen') return UI.sudoku.names.muenzen[value - 1] ?? String(value);
  return UI.sudoku.names.number(value);
}

function safeText(step: SafeStep, kind: SudokuKind): string {
  const one = UI.sudoku.one[groupOf(kind)];
  const { reason } = step;
  switch (reason.kind) {
    case 'last':
      return UI.sudoku.safe.last[reason.unit](one);
    case 'cage':
      return UI.sudoku.safe.cage;
    case 'single':
      return UI.sudoku.safe.single;
    case 'hidden':
      return UI.sudoku.safe.hidden[reason.unit](nameOf(kind, step.value));
  }
}

/** Felder, die fest stehen (vorgegeben oder geprüft richtig). */
function fixedCells(puzzle: SudokuPuzzle, locked: readonly number[]): Set<number> {
  const fixed = new Set(locked);
  puzzle.givens.forEach((v, i) => {
    if (v !== 0) fixed.add(i);
  });
  return fixed;
}

function Play({
  profile,
  save,
  onSolved,
  onNew,
}: {
  profile: Profile;
  save: SudokuSave;
  onSolved: (praise: string | undefined) => void;
  onNew: () => void;
}) {
  const { dispatch } = useAppState();
  const cfg = STUFEN[profile.stufe];
  const puzzle = useMemo(
    () => generateSudoku(save.kind, emptiesFor(save.kind, save.stars, profile.stufe), save.seed),
    [save.kind, save.stars, save.seed, profile.stufe],
  );
  const cellCount = puzzle.solution.length;
  const [entries, setEntries] = useState(() =>
    save.entries.length === cellCount ? save.entries : new Array<number>(cellCount).fill(0),
  );
  const [locked, setLocked] = useState<number[]>(save.locked);
  const [notes, setNotes] = useState(() =>
    save.notes.length === cellCount ? save.notes : new Array<number>(cellCount).fill(0),
  );
  const firstTime =
    (towerOf(profile).solved.sudoku ?? 0) === 0 &&
    save.locked.length === 0 &&
    save.entries.every((v) => v === 0);
  const [pulse, setPulse] = useState<number | null>(() =>
    firstTime ? (nextSafe(puzzle.givens, puzzle.shape, puzzle.cages)?.index ?? null) : null,
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [notesOn, setNotesOn] = useState(false);
  const [hints, setHints] = useState(0);
  const [checks, setChecks] = useState(0);
  const [glow, setGlow] = useState<number[]>([]);
  const [solutionShown, setSolutionShown] = useState(false);
  const [pose, setPose] = useState<KikoPose>('hallo');
  const [line, setLine] = useState(() =>
    firstTime ? UI.sudoku.first(UI.sudoku.one[groupOf(save.kind)]) : ruleText(puzzle),
  );

  const say = (text: string, nextPose: KikoPose = 'hallo') => {
    setLine(text);
    setPose(nextPose);
    if (cfg.autoRead) {
      stopSpeaking();
      toggleSpeak(text);
    }
  };

  const persist = (next: Partial<Pick<SudokuSave, 'entries' | 'locked' | 'notes'>>) => {
    dispatch({
      type: 'sudoku-save',
      id: profile.id,
      save: { ...save, entries, locked, notes, ...next },
    });
  };

  const fixed = fixedCells(puzzle, locked);
  const full = puzzle.givens.every((v, i) => v !== 0 || fixed.has(i) || entries[i] !== 0);

  const pickValue = (value: number) => {
    if (selected === null || fixed.has(selected)) {
      say(UI.sudoku.pickCell);
      return;
    }
    if (notesOn) {
      if (entries[selected] !== 0) return;
      const next = notes.map((mask, i) => (i === selected ? mask ^ (1 << (value - 1)) : mask));
      setNotes(next);
      persist({ notes: next });
      return;
    }
    const nextEntries = entries.map((v, i) => (i === selected ? value : v));
    const nextNotes = notes.map((mask, i) => (i === selected ? 0 : mask));
    setEntries(nextEntries);
    setNotes(nextNotes);
    persist({ entries: nextEntries, notes: nextNotes });
  };

  const erase = () => {
    if (selected === null || fixed.has(selected)) return;
    const nextEntries = entries.map((v, i) => (i === selected ? 0 : v));
    const nextNotes = notes.map((mask, i) => (i === selected ? 0 : mask));
    setEntries(nextEntries);
    setNotes(nextNotes);
    persist({ entries: nextEntries, notes: nextNotes });
  };

  const finish = (praise: string | undefined) => {
    dispatch({ type: 'tower-solved', id: profile.id, kind: 'sudoku' });
    onSolved(praise);
  };

  const check = () => {
    const nowRight = puzzle.solution
      .map((v, i) => (!fixed.has(i) && entries[i] === v ? i : -1))
      .filter((i) => i >= 0);
    const nextLocked = [...locked, ...nowRight];
    const nextFixed = fixedCells(puzzle, nextLocked);
    // fertige Reihen, Spalten und Kästen leuchten kurz auf
    setGlow(
      units(puzzle.shape)
        .filter(
          (unit) =>
            unit.cells.every((i) => nextFixed.has(i)) && unit.cells.some((i) => !fixed.has(i)),
        )
        .flatMap((unit) => unit.cells),
    );
    setLocked(nextLocked);
    setSelected(null);
    if (nextFixed.size === cellCount) {
      if (save.stars === 3) finish(UI.sudoku.tricky);
      else if (checks > 0 || hints > 0) finish(pick(mulberry32(save.seed), UI.sudoku.effort));
      else finish(undefined);
      return;
    }
    setChecks(checks + 1);
    persist({ locked: nextLocked });
    say(UI.sudoku.partly, 'denkt');
  };

  const hint = () => {
    const level = hints + 1;
    setHints(level);
    setPulse(null);
    if (level === 1) {
      say(ruleText(puzzle), 'zeigt');
      return;
    }
    // nur sichere Werte zählen: Vorgaben, feste Felder und richtige Einträge
    const known = puzzle.solution.map((v, i) => (fixed.has(i) || entries[i] === v ? v : 0));
    const step = nextSafe(known, puzzle.shape, puzzle.cages);
    if (!step) return;
    setSelected(step.index);
    setPulse(step.index);
    say(safeText(step, puzzle.kind), 'zeigt');
  };

  const showSolution = () => {
    setLocked(puzzle.solution.map((_, i) => i).filter((i) => puzzle.givens[i] === 0));
    setSelected(null);
    setSolutionShown(true);
    say(UI.sudoku.solution, 'freut-sich');
  };

  return (
    <Screen>
      <SpeechBubble pose={pose} kikoSize={52} className={styles.bubble}>
        {line}
      </SpeechBubble>
      <SudokuBoard
        puzzle={puzzle}
        entries={entries}
        locked={locked}
        notes={notes}
        selected={selected}
        pulse={pulse}
        glow={glow}
        onSelect={(index) => {
          setSelected(index);
          setPulse(null);
        }}
      />
      {solutionShown ? (
        <Button
          block
          onClick={() => {
            finish(undefined);
          }}
        >
          {UI.play.next}
        </Button>
      ) : (
        <>
          <SudokuPad
            kind={puzzle.kind}
            size={puzzle.shape.size}
            notesEnabled={cfg.tower.sudoku.notes}
            notesOn={notesOn}
            onPick={pickValue}
            onErase={erase}
            onToggleNotes={() => {
              setNotesOn(!notesOn);
            }}
          />
          <div className={styles.actions}>
            <Button variant="secondary" onClick={hint}>
              {UI.play.hint}
            </Button>
            <Button disabled={!full} onClick={check}>
              {UI.sudoku.check}
            </Button>
          </div>
          {hints >= 2 && (
            <Button variant="ghost" block onClick={showSolution}>
              {UI.sudoku.showSolution}
            </Button>
          )}
          <Button variant="ghost" block onClick={onNew}>
            {UI.sudoku.newPuzzle}
          </Button>
        </>
      )}
    </Screen>
  );
}

/** kleines Vorschaubild je Art für die Auswahl */
function KindPreview({ kind }: { kind: SudokuKind }) {
  const values = kind === 'zahlen6' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4];
  return (
    <span
      className={styles.preview}
      style={{ '--cols': kind === 'zahlen6' ? 3 : 2 } as CSSProperties}
      aria-hidden="true"
    >
      {values.map((v) => (
        <SudokuSymbol key={v} kind={kind === 'rechnen' ? 'zahlen4' : kind} value={v} size={24} />
      ))}
    </span>
  );
}

function Start({ profile, onStart }: { profile: Profile; onStart: (save: SudokuSave) => void }) {
  const cfg = STUFEN[profile.stufe];
  const kinds = cfg.tower.sudoku.kinds.map((k) => k.kind);
  const saved = towerOf(profile).sudoku;
  const [kind, setKind] = useState<SudokuKind>(saved?.kind ?? kinds[0] ?? 'bilder');
  const chosen = kinds.includes(kind) ? kind : (kinds[0] ?? 'bilder');
  const start = (stars: Stars) => {
    onStart({ kind: chosen, stars, seed: newSeed(), entries: [], locked: [], notes: [] });
  };
  return (
    <Screen title={UI.sudoku.title}>
      {saved && (
        <div className={styles.resume}>
          <SpeechBubble pose="zeigt" kikoSize={56}>
            {UI.sudoku.resume}
          </SpeechBubble>
          <Button
            block
            onClick={() => {
              onStart(saved);
            }}
          >
            {UI.sudoku.resumeButton}
          </Button>
        </div>
      )}
      {kinds.length > 1 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>{UI.sudoku.chooseKind}</h2>
          <div className={styles.kinds}>
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                className={cx(styles.kind, k === chosen && styles.kindOn)}
                aria-pressed={k === chosen}
                onClick={() => {
                  setKind(k);
                  if (cfg.autoRead) toggleSpeak(UI.sudoku.kinds[k]);
                }}
              >
                <KindPreview kind={k} />
                {UI.sudoku.kinds[k]}
              </button>
            ))}
          </div>
        </section>
      )}
      <section className={styles.section}>
        <h2 className={styles.heading}>{saved ? UI.sudoku.newPuzzle : UI.sudoku.chooseStars}</h2>
        <div className={styles.stars}>
          {([1, 2, 3] as const).map((stars) => {
            const name = UI.sudoku.stars[stars - 1] ?? '';
            return (
              <button
                key={stars}
                type="button"
                className={styles.star}
                aria-label={UI.sudoku.starsLabel(name, stars)}
                onClick={() => {
                  start(stars);
                }}
              >
                <span className={styles.starIcons} aria-hidden="true">
                  {'★'.repeat(stars)}
                </span>
                {name}
              </button>
            );
          })}
        </div>
      </section>
    </Screen>
  );
}

/** Adresse `/raetsel/sudoku` */
export function Sudoku({ profile }: { profile: Profile }) {
  const { dispatch } = useAppState();
  const [save, setSave] = useState<SudokuSave | null>(null);
  const [done, setDone] = useState<{ before: number; praise: string | undefined } | null>(null);

  if (done) {
    return (
      <TowerDone
        profile={profile}
        before={done.before}
        {...(done.praise === undefined ? {} : { praise: done.praise })}
        onAgain={() => {
          setDone(null);
          setSave(null);
        }}
      />
    );
  }
  if (save) {
    return (
      <Play
        key={save.seed}
        profile={profile}
        save={save}
        onSolved={(praise) => {
          setDone({ before: towerOf(profile).lamps, praise });
        }}
        onNew={() => {
          dispatch({ type: 'sudoku-save', id: profile.id, save: null });
          setSave(null);
        }}
      />
    );
  }
  return (
    <Start
      profile={profile}
      onStart={(next) => {
        dispatch({ type: 'sudoku-save', id: profile.id, save: next });
        setSave(next);
      }}
    />
  );
}
