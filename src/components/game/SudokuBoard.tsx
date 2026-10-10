import type { CSSProperties } from 'react';
import { UI } from '@/content/ui';
import type { Cage } from '@/domain/sudoku';
import type { SudokuKind } from '@/domain/types';
import { Coin } from '@/illustrations/Coin';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { UiIcon } from '@/illustrations/UiIcon';
import type { SudokuPuzzle } from '@/practice/tower/sudoku';
import { cx } from '../cx';
import styles from './Sudoku.module.css';

const PICTURES = ['muschel', 'stern', 'fisch', 'krebs'] as const;
const COINS = [1, 2, 5, 10] as const;

/** Name eines Wertes ohne Artikel (Felder, Knöpfe, Screenreader). */
function symbolLabel(kind: SudokuKind, value: number): string {
  if (kind === 'bilder') return UI.sudoku.labels.bilder[value - 1] ?? String(value);
  if (kind === 'muenzen') return UI.sudoku.labels.muenzen[value - 1] ?? String(value);
  return String(value);
}

/** Ein Wert als Bild, Münze oder Zahl. */
export function SudokuSymbol({
  kind,
  value,
  size,
}: {
  kind: SudokuKind;
  value: number;
  size: number;
}) {
  if (kind === 'bilder') {
    const picture = PICTURES[value - 1];
    if (picture) return <ItemIcon itemId={picture} size={size} />;
  }
  if (kind === 'muenzen') {
    const coin = COINS[value - 1];
    if (coin) return <Coin value={coin} size={size} />;
  }
  return (
    <span className={styles.digit} style={{ fontSize: `${String(Math.round(size * 0.62))}px` }}>
      {value}
    </span>
  );
}

function cageOf(cages: readonly Cage[], index: number): Cage | undefined {
  return cages.find((cage) => cage.cells.includes(index));
}

/** Gestrichelte Kastenränder des Rechen-Sudokus an den Seiten, wo der Nachbar woanders hingehört. */
function cageEdges(cages: readonly Cage[], index: number, size: number): string[] {
  const cage = cageOf(cages, index);
  if (!cage) return [];
  const same = (other: number) => cage.cells.includes(other);
  const col = index % size;
  return [
    !same(index - size) && styles.cageTop,
    !(col < size - 1 && same(index + 1)) && styles.cageRight,
    !same(index + size) && styles.cageBottom,
    !(col > 0 && same(index - 1)) && styles.cageLeft,
  ].filter((name): name is string => typeof name === 'string');
}

/**
 * Sudoku-Gitter (docs/12 3.1): Kästen mit dicken Linien, vorgegebene Felder auf Sand, richtige
 * Felder mit ✓ und fest. Leere und eigene Felder lassen sich antippen.
 */
export function SudokuBoard({
  puzzle,
  entries,
  locked,
  notes,
  selected,
  pulse,
  glow,
  onSelect,
}: {
  puzzle: SudokuPuzzle;
  entries: readonly number[];
  locked: readonly number[];
  notes: readonly number[];
  selected: number | null;
  pulse: number | null;
  glow: readonly number[];
  onSelect: (index: number) => void;
}) {
  const { kind, shape, givens, solution, cages } = puzzle;
  const { size, boxRows, boxCols } = shape;
  const symbolSize = size === 6 ? 34 : 46;
  const noteSize = size === 6 ? 24 : 30;

  return (
    <div
      className={styles.board}
      role="group"
      aria-label={UI.sudoku.board}
      style={{ '--n': size } as CSSProperties}
    >
      {givens.map((given, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        const frame = cx(
          styles.cell,
          col === size - 1 && styles.rowEnd,
          col % boxCols === boxCols - 1 && col < size - 1 && styles.boxRight,
          row % boxRows === boxRows - 1 && row < size - 1 && styles.boxBottom,
          glow.includes(index) && styles.glow,
          ...cageEdges(cages, index, size),
        );
        const cage = cageOf(cages, index);
        const sum = cage?.cells[0] === index && (
          <span className={styles.sum} aria-label={UI.sudoku.cage(cage.sum)}>
            {cage.sum}
          </span>
        );
        const fixedValue = given || (locked.includes(index) ? (solution[index] ?? 0) : 0);
        if (fixedValue !== 0) {
          return (
            <span
              key={index}
              className={cx(frame, given ? styles.given : styles.locked)}
              role="img"
              aria-label={UI.sudoku.cellFixed(row + 1, col + 1, symbolLabel(kind, fixedValue))}
            >
              {sum}
              <SudokuSymbol kind={kind} value={fixedValue} size={symbolSize} />
              {!given && <UiIcon name="haken" size={14} className={styles.check} />}
            </span>
          );
        }
        const value = entries[index] ?? 0;
        const mask = notes[index] ?? 0;
        return (
          <button
            key={index}
            type="button"
            className={cx(
              frame,
              styles.open,
              selected === index && styles.selected,
              pulse === index && styles.pulse,
            )}
            aria-label={UI.sudoku.cell(row + 1, col + 1, value ? symbolLabel(kind, value) : null)}
            aria-pressed={selected === index}
            onClick={() => {
              onSelect(index);
            }}
          >
            {sum}
            {value !== 0 ? (
              <SudokuSymbol kind={kind} value={value} size={symbolSize} />
            ) : (
              mask !== 0 && (
                <span
                  className={styles.notes}
                  style={{ gridTemplateColumns: `repeat(${String(boxCols)}, 1fr)` }}
                  aria-hidden="true"
                >
                  {Array.from({ length: size }, (_, v) => (
                    <span key={v}>
                      {mask & (1 << v) ? (
                        <SudokuSymbol
                          kind={kind === 'muenzen' ? 'zahlen4' : kind}
                          value={kind === 'muenzen' ? (COINS[v] ?? 0) : v + 1}
                          size={noteSize}
                        />
                      ) : null}
                    </span>
                  ))}
                </span>
              )
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Große Knöpfe unten: die Werte, Radiergummi und (ab Stufe 3) Notizen. */
export function SudokuPad({
  kind,
  size,
  notesEnabled,
  notesOn,
  onPick,
  onErase,
  onToggleNotes,
}: {
  kind: SudokuKind;
  size: number;
  notesEnabled: boolean;
  notesOn: boolean;
  onPick: (value: number) => void;
  onErase: () => void;
  onToggleNotes: () => void;
}) {
  return (
    <div className={styles.pad} role="group" aria-label={UI.sudoku.pad}>
      <div className={styles.values} style={{ '--n': size } as CSSProperties}>
        {Array.from({ length: size }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            className={cx(styles.padButton, notesOn && styles.padNotes)}
            aria-label={symbolLabel(kind, value)}
            onClick={() => {
              onPick(value);
            }}
          >
            <SudokuSymbol kind={kind} value={value} size={size === 6 ? 30 : 40} />
          </button>
        ))}
      </div>
      <div className={styles.tools}>
        <button type="button" className={styles.tool} onClick={onErase}>
          <span aria-hidden="true" className={styles.eraser} />
          {UI.sudoku.erase}
        </button>
        {notesEnabled && (
          <button
            type="button"
            className={cx(styles.tool, notesOn && styles.toolOn)}
            aria-pressed={notesOn}
            onClick={onToggleNotes}
          >
            <UiIcon name="stift" size={22} />
            {UI.sudoku.notes}
          </button>
        )}
      </div>
    </div>
  );
}
