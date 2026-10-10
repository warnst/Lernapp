import { STUFEN } from '@/config/levels';
import { CIPHER_MESSAGES } from '@/content/cipher';
import { DOTS } from '@/content/dots';
import { NONOGRAMS } from '@/content/nonograms';
import type { DotsPicture, NonogramPicture } from '@/content/pictures-types';
import { hashSeed, mulberry32, pick } from '@/domain/random';
import type { Stufe, Task } from '@/domain/types';
import { oddRound } from '@/practice/tower/choice-riddles';
import { generateCoinPath, generateMaze, type MazePuzzle } from '@/practice/tower/maze';
import { generateSudoku, type SudokuPuzzle } from '@/practice/tower/sudoku';

// Rätselturm-Blatt (docs/12 8): Sudoku, Labyrinth, Punkte verbinden, Bilderrätsel, Geheimschrift,
// Was passt nicht? in der Stufe des Kindes. Memory, Detektivfall und Wissensfragen werden nicht gedruckt.

export interface TowerPrint {
  sudoku: SudokuPuzzle;
  maze: MazePuzzle;
  dots: { picture: DotsPicture; step: number };
  nonogram?: NonogramPicture;
  cipher?: { text: string; numbers: boolean; seed: number };
  odd: Task;
}

export function towerPrint(stufe: Stufe, seed: number): TowerPrint {
  const cfg = STUFEN[stufe].tower;
  const rng = mulberry32(hashSeed(seed, 'turm-druck'));
  const sudokuKind = pick(rng, cfg.sudoku.kinds);
  const sudoku = generateSudoku(sudokuKind.kind, sudokuKind.empties[0], hashSeed(seed, 'sudoku'));
  const maze =
    cfg.maze.mode === 'maze'
      ? generateMaze(cfg.maze.size, hashSeed(seed, 'labyrinth'))
      : generateCoinPath(
          cfg.maze.size,
          pick(rng, cfg.maze.targets),
          cfg.maze.coins,
          hashSeed(seed, 'pfad'),
        );
  const variant = pick(rng, cfg.dots);
  const dotsChoices = DOTS.filter((p) => p.points.length === variant.count);
  const dots = {
    picture: pick(rng, dotsChoices.length > 0 ? dotsChoices : DOTS),
    step: variant.step,
  };
  const nonogramChoices = NONOGRAMS.filter((p) => cfg.nonogram.sizes.includes(p.rows.length));
  const cipherChoices = CIPHER_MESSAGES.filter((m) => cfg.cipher.messages.includes(m.from));
  const [odd] = oddRound(cfg.odd, stufe, 1, hashSeed(seed, 'odd'));
  if (!odd) throw new Error('Was passt nicht? fehlt');
  return {
    sudoku,
    maze,
    dots,
    ...(nonogramChoices.length > 0 ? { nonogram: pick(rng, nonogramChoices) } : {}),
    ...(cipherChoices.length > 0
      ? {
          cipher: {
            text: pick(rng, cipherChoices).text,
            numbers: cfg.cipher.numberKey && rng() < 0.5,
            seed: hashSeed(seed, 'geheim'),
          },
        }
      : {}),
    odd,
  };
}
