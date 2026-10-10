import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/components/cx';
import { SudokuSymbol } from '@/components/game/SudokuBoard';
import { PRINT } from '@/content/print';
import { UI } from '@/content/ui';
import { formatMoney } from '@/domain/money';
import { clues } from '@/domain/nonogram';
import type { CoinValue } from '@/domain/types';
import { Chest } from '@/illustrations/Chest';
import { CipherSymbol } from '@/illustrations/CipherSymbol';
import { Coin } from '@/illustrations/Coin';
import { ItemIcon } from '@/illustrations/ItemIcon';
import { Kiko } from '@/illustrations/Kiko';
import { cipherKey } from '@/practice/tower/cipher';
import { canStep, type MazePuzzle } from '@/practice/tower/maze';
import type { SudokuPuzzle } from '@/practice/tower/sudoku';
import styles from './TowerSheet.module.css';
import type { TowerPrint } from './tower-print';

// Rätselturm-Blatt und seine Lösungen (docs/12 8). Alles schwarz-weiß tauglich, Felder groß genug
// zum Hineinschreiben.

const EACH = { bilder: 'jedes Bild', muenzen: 'jede Münze', zahlen: 'jede Zahl' } as const;

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.box}>
      <h2 className={styles.instruction}>{title}</h2>
      {children}
    </section>
  );
}

function SudokuGrid({ puzzle, solved = false }: { puzzle: SudokuPuzzle; solved?: boolean }) {
  const { size, boxRows, boxCols } = puzzle.shape;
  return (
    <div className={styles.sudoku} style={{ '--n': size } as CSSProperties}>
      {puzzle.givens.map((given, i) => {
        const row = Math.floor(i / size);
        const col = i % size;
        const value = solved ? (puzzle.solution[i] ?? 0) : given;
        const cage = puzzle.cages.find((c) => c.cells[0] === i);
        return (
          <span
            key={i}
            className={cx(
              styles.sudokuCell,
              col % boxCols === boxCols - 1 && col < size - 1 && styles.boxRight,
              row % boxRows === boxRows - 1 && row < size - 1 && styles.boxBottom,
              given === 0 && solved && styles.filledIn,
            )}
          >
            {cage && <span className={styles.sum}>{cage.sum}</span>}
            {value !== 0 && (
              <SudokuSymbol
                kind={puzzle.kind === 'rechnen' ? 'zahlen4' : puzzle.kind}
                value={value}
                size={size === 6 ? 26 : 36}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function MazeGrid({ puzzle, solved = false }: { puzzle: MazePuzzle; solved?: boolean }) {
  const { size } = puzzle;
  const center = (cell: number) =>
    `${String((cell % size) + 0.5)},${String(Math.floor(cell / size) + 0.5)}`;
  return (
    <div className={styles.maze} style={{ '--n': size } as CSSProperties}>
      {solved && (
        <svg
          className={styles.trail}
          viewBox={`0 0 ${String(size)} ${String(size)}`}
          aria-hidden="true"
        >
          <polyline points={puzzle.solution.map(center).join(' ')} />
        </svg>
      )}
      {Array.from({ length: size * size }, (_, cell) => {
        const row = Math.floor(cell / size);
        const col = cell % size;
        const coin = puzzle.coins[cell] ?? 0;
        return (
          <span
            key={cell}
            className={cx(
              styles.mazeCell,
              row > 0 && !canStep(puzzle, cell, cell - size) && styles.wallTop,
              col > 0 && !canStep(puzzle, cell, cell - 1) && styles.wallLeft,
            )}
          >
            {cell === puzzle.start ? (
              <Kiko pose="hallo" size={30} />
            ) : cell === puzzle.goal ? (
              <Chest size={30} />
            ) : (
              coin > 0 && <Coin value={coin as CoinValue} size={size > 4 ? 26 : 32} />
            )}
          </span>
        );
      })}
    </div>
  );
}

function DotsPicture({ dots }: { dots: TowerPrint['dots'] }) {
  return (
    <svg className={styles.dots} viewBox="0 0 100 100" aria-hidden="true">
      {dots.picture.points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={1.1} />
          <text
            x={x > 82 ? x - 1.6 : x + 1.6}
            y={y < 8 ? y + 4 : y - 1.4}
            textAnchor={x > 82 ? 'end' : 'start'}
          >
            {(i + 1) * dots.step}
          </text>
        </g>
      ))}
    </svg>
  );
}

function NonogramGrid({ rows, solved = false }: { rows: string[]; solved?: boolean }) {
  const size = rows.length;
  const filled = (r: number, c: number) => rows[r]?.[c] !== '.';
  const range = Array.from({ length: size }, (_, i) => i);
  return (
    <div className={styles.nonogram} style={{ '--n': size } as CSSProperties}>
      <span />
      {range.map((c) => (
        <span key={`c${String(c)}`} className={styles.colClue}>
          {(clues(range.map((r) => filled(r, c))).join(' ') || '0').split(' ').map((n, i) => (
            <span key={i}>{n}</span>
          ))}
        </span>
      ))}
      {range.map((r) => [
        <span key={`r${String(r)}`} className={styles.rowClue}>
          {clues(range.map((c) => filled(r, c))).join(' ') || '0'}
        </span>,
        ...range.map((c) => (
          <span
            key={`${String(r)}-${String(c)}`}
            className={cx(styles.nonoCell, solved && filled(r, c) && styles.nonoFilled)}
          />
        )),
      ])}
    </div>
  );
}

function CipherSheet({
  cipher,
  solved = false,
}: {
  cipher: NonNullable<TowerPrint['cipher']>;
  solved?: boolean;
}) {
  const keys = cipherKey(cipher.text, cipher.seed, cipher.numbers, UI.cipher.symbolNames.length);
  const codeOf = (letter: string) => keys.find((k) => k.letter === letter)?.code ?? 0;
  const code = (n: number) =>
    cipher.numbers ? (
      <span className={styles.number}>{n}</span>
    ) : (
      <CipherSymbol index={n} size={22} />
    );
  return (
    <div className={styles.cipher}>
      {!solved && (
        <p className={styles.key}>
          {keys.map((k) => (
            <span key={k.letter} className={styles.pair}>
              {code(k.code)} = <strong>{k.letter}</strong>
            </span>
          ))}
        </p>
      )}
      <p className={styles.message}>
        {cipher.text.split(' ').map((word, w) => (
          <span key={w} className={styles.word}>
            {Array.from(word).map((letter, i) => (
              <span key={i} className={styles.slot}>
                {code(codeOf(letter))}
                <span className={styles.line}>{solved ? letter : ''}</span>
              </span>
            ))}
          </span>
        ))}
      </p>
    </div>
  );
}

function OddRow({ puzzles }: { puzzles: TowerPrint }) {
  const answer = puzzles.odd.parts[0]?.answer;
  const options = answer?.type === 'choice' ? answer.options : [];
  return (
    <div className={styles.odd}>
      {options.map((o) => (
        <span key={o.id} className={styles.oddCard}>
          {o.icon ? (
            <ItemIcon itemId={o.icon} size={56} />
          ) : (
            <span className={styles.number}>{o.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function TowerSheetBody({ puzzles }: { puzzles: TowerPrint }) {
  const kind = puzzles.sudoku.kind;
  const each = EACH[kind === 'bilder' || kind === 'muenzen' ? kind : 'zahlen'];
  return (
    <div className={styles.sheet}>
      <Box
        title={`${PRINT.towerSudoku(each)}${puzzles.sudoku.cages.length > 0 ? ` ${PRINT.towerSudokuCages}` : ''}`}
      >
        <SudokuGrid puzzle={puzzles.sudoku} />
      </Box>
      <Box
        title={
          puzzles.maze.target > 0
            ? PRINT.towerCoins(formatMoney(puzzles.maze.target))
            : PRINT.towerMaze
        }
      >
        <MazeGrid puzzle={puzzles.maze} />
      </Box>
      <Box title={PRINT.towerDots(puzzles.dots.step)}>
        <DotsPicture dots={puzzles.dots} />
      </Box>
      {puzzles.nonogram && (
        <Box title={PRINT.towerNonogram}>
          <NonogramGrid rows={puzzles.nonogram.rows} />
        </Box>
      )}
      {puzzles.cipher && (
        <Box title={PRINT.towerCipher}>
          <CipherSheet cipher={puzzles.cipher} />
        </Box>
      )}
      <Box title={PRINT.towerOdd}>
        <OddRow puzzles={puzzles} />
      </Box>
    </div>
  );
}

export function TowerSolutions({ puzzles }: { puzzles: TowerPrint }) {
  const answer = puzzles.odd.parts[0];
  return (
    <div className={styles.solutionGrid}>
      <SudokuGrid puzzle={puzzles.sudoku} solved />
      <MazeGrid puzzle={puzzles.maze} solved />
      <p>{PRINT.towerSolutionPicture(puzzles.dots.picture.name)}</p>
      {puzzles.nonogram && (
        <div>
          <NonogramGrid rows={puzzles.nonogram.rows} solved />
          <p>{PRINT.towerSolutionPicture(puzzles.nonogram.name)}</p>
        </div>
      )}
      {puzzles.cipher && <CipherSheet cipher={puzzles.cipher} solved />}
      {answer && <p>{answer.explanation}</p>}
    </div>
  );
}
