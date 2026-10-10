import { FEEDBACK_POOLS } from '@/content/feedback';
import type { CheckResult } from '@/domain/check';
import { type FeedbackPlan, hintLevel, pickFeedback, planFeedback } from '@/domain/hints';
import type { Answer, MoneyPiece, Task } from '@/domain/types';

// Ablauf einer Station (docs/01 5.4, 5.5, 6.1). Rein, damit er ohne Oberfläche testbar ist.

export type SheetContent =
  | { kind: 'check'; result: CheckResult; plan: FeedbackPlan; poolText?: string }
  | { kind: 'hint'; level: 1 | 2 | 3 };

export interface PlayState {
  /** Anzahl Teile je Aufgabe */
  partCounts: number[];
  taskIndex: number;
  partIndex: number;
  wrongCount: number;
  hintsOpened: number;
  /** probierte Antwortkarten (choice) */
  tried: string[];
  /** gemerkte Möglichkeiten (pay-variants) */
  found: MoneyPiece[][];
  /** Felder von Mauer und Dreieck, die schon stimmen und fest sind (grid) */
  locked: string[];
  sheet?: SheetContent;
  lastPoolText?: string;
  /** Statistik des gerade gelösten Teils, bis er gespeichert ist */
  solvedPart?: { wrong: number; hints: number };
  finished: boolean;
}

export type PlayAction =
  | {
      type: 'checked';
      result: CheckResult;
      answerType: Answer['type'];
      /** Zufallszahl in [0, 1) für die Auswahl aus dem Rückmeldungs-Pool */
      roll: number;
      optionId?: string;
      pieces?: MoneyPiece[];
    }
  | { type: 'open-hint' }
  | { type: 'show-solution' }
  | { type: 'close' };

export function startPlay(tasks: readonly Task[], taskIndex = 0, partIndex = 0): PlayState {
  const partCounts = tasks.map((task) => task.parts.length);
  const validTask = taskIndex < tasks.length ? taskIndex : 0;
  const validPart = partIndex < (partCounts[validTask] ?? 0) ? partIndex : 0;
  return {
    partCounts,
    taskIndex: validTask,
    partIndex: validPart,
    wrongCount: 0,
    hintsOpened: 0,
    tried: [],
    found: [],
    locked: [],
    finished: false,
  };
}

function freshPart(state: PlayState, taskIndex: number, partIndex: number): PlayState {
  const { sheet: _sheet, solvedPart: _solved, ...rest } = state;
  return {
    ...rest,
    taskIndex,
    partIndex,
    wrongCount: 0,
    hintsOpened: 0,
    tried: [],
    found: [],
    locked: [],
  };
}

function advance(state: PlayState): PlayState {
  const parts = state.partCounts[state.taskIndex] ?? 1;
  if (state.partIndex + 1 < parts) return freshPart(state, state.taskIndex, state.partIndex + 1);
  if (state.taskIndex + 1 < state.partCounts.length)
    return freshPart(state, state.taskIndex + 1, 0);
  return { ...freshPart(state, state.taskIndex, state.partIndex), finished: true };
}

export function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case 'checked': {
      const { result } = action;
      const wrongCount = result.status === 'wrong' ? state.wrongCount + 1 : state.wrongCount;
      const plan = planFeedback(result, wrongCount, action.answerType);
      const poolText =
        plan.pool === undefined
          ? undefined
          : pickFeedback(FEEDBACK_POOLS[plan.pool], state.lastPoolText, () => action.roll);
      const tried =
        result.status === 'wrong' && action.optionId !== undefined
          ? [...state.tried, action.optionId]
          : state.tried;
      const found =
        result.status === 'correct' && action.pieces !== undefined
          ? [...state.found, action.pieces]
          : state.found;
      const locked =
        result.status === 'wrong' && result.correctCells
          ? [...new Set([...state.locked, ...result.correctCells])]
          : state.locked;
      const solved = result.status === 'correct' && result.remaining === undefined;
      return {
        ...state,
        wrongCount,
        tried,
        found,
        locked,
        sheet: { kind: 'check', result, plan, ...(poolText === undefined ? {} : { poolText }) },
        ...(poolText === undefined ? {} : { lastPoolText: poolText }),
        ...(solved ? { solvedPart: { wrong: wrongCount, hints: state.hintsOpened } } : {}),
      };
    }
    case 'open-hint': {
      const hintsOpened = Math.min(3, Math.max(state.hintsOpened, state.wrongCount) + 1);
      return { ...state, hintsOpened, sheet: { kind: 'hint', level: hintLevelOf(hintsOpened) } };
    }
    case 'show-solution':
      return { ...state, hintsOpened: 3, sheet: { kind: 'hint', level: 3 } };
    case 'close': {
      if (state.solvedPart) return advance(state);
      const { sheet: _sheet, ...rest } = state;
      return rest;
    }
  }
}

function hintLevelOf(hintsOpened: number): 1 | 2 | 3 {
  const level = hintLevel({ wrongCount: 0, hintsOpened, solved: false });
  return level === 0 ? 1 : level;
}

/** Aktuelle Hilfestufe für die Anzeige von „So geht's“ (ab 2). */
export function currentHintLevel(state: PlayState) {
  return hintLevel({ wrongCount: state.wrongCount, hintsOpened: state.hintsOpened, solved: false });
}
