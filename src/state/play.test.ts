import { describe, expect, it } from 'vitest';
import { WORLDS } from '@/content/worlds';
import { currentHintLevel, playReducer, startPlay } from './play';

const station = WORLDS.schatzinsel.stations[0];
if (!station) throw new Error('Station fehlt');
const tasks = station.tasks;
const twoParts = WORLDS.schatzinsel.stations[1]?.tasks ?? [];

describe('playReducer', () => {
  it('startet bei Aufgabe 1 und korrigiert ungültige Fortsetzungsstellen', () => {
    expect(startPlay(tasks)).toMatchObject({ taskIndex: 0, partIndex: 0, finished: false });
    expect(startPlay(tasks, 3, 0)).toMatchObject({ taskIndex: 3, partIndex: 0 });
    expect(startPlay(tasks, 9, 0)).toMatchObject({ taskIndex: 0 });
    expect(startPlay(tasks, 1, 4)).toMatchObject({ taskIndex: 1, partIndex: 0 });
  });

  it('Fehlversuche zählen, probierte Karten werden gemerkt, Pool-Sätze wechseln', () => {
    let state = startPlay(tasks);
    state = playReducer(state, {
      type: 'checked',
      result: { status: 'wrong', feedback: 'x' },
      answerType: 'choice',
      roll: 0,
      optionId: 'b',
    });
    expect(state.wrongCount).toBe(1);
    expect(state.tried).toEqual(['b']);
    expect(state.sheet).toMatchObject({ kind: 'check', plan: { pose: 'denkt', show: 'none' } });
    const first = state.lastPoolText;
    expect(first).toBeDefined();
    state = playReducer(state, { type: 'close' });
    expect(state.sheet).toBeUndefined();
    state = playReducer(state, {
      type: 'checked',
      result: { status: 'wrong' },
      answerType: 'choice',
      roll: 0,
      optionId: 'c',
    });
    expect(state.sheet).toMatchObject({ plan: { pool: 'wrong-2', show: 'hint2' } });
    expect(state.tried).toEqual(['b', 'c']);
    state = playReducer(playReducer(state, { type: 'close' }), {
      type: 'checked',
      result: { status: 'wrong' },
      answerType: 'money',
      roll: 0.5,
    });
    expect(state.sheet).toMatchObject({ plan: { button: 'jetzt-ich', show: 'explanation' } });
    expect(currentHintLevel(state)).toBe(3);
  });

  it('nicht derselbe Pool-Satz zweimal hintereinander', () => {
    let state = startPlay(tasks);
    const texts: string[] = [];
    for (let i = 0; i < 2; i++) {
      state = playReducer(state, {
        type: 'checked',
        result: { status: 'wrong' },
        answerType: 'money',
        roll: 0,
      });
      texts.push(state.sheet?.kind === 'check' ? (state.sheet.poolText ?? '') : '');
      state = playReducer(state, { type: 'close' });
      state = { ...state, wrongCount: 0 };
    }
    expect(texts[0]).not.toBe(texts[1]);
  });

  it('richtig → Weiter führt zur nächsten Aufgabe und merkt die Statistik', () => {
    let state = startPlay(tasks);
    state = playReducer(state, { type: 'open-hint' });
    expect(state.sheet).toEqual({ kind: 'hint', level: 1 });
    state = playReducer(state, { type: 'close' });
    state = playReducer(state, {
      type: 'checked',
      result: { status: 'correct' },
      answerType: 'choice',
      roll: 0,
    });
    expect(state.solvedPart).toEqual({ wrong: 0, hints: 1 });
    expect(state.sheet).toMatchObject({ plan: { pool: 'correct-first', button: 'weiter' } });
    state = playReducer(state, { type: 'close' });
    expect(state).toMatchObject({
      taskIndex: 1,
      partIndex: 0,
      hintsOpened: 0,
      wrongCount: 0,
      tried: [],
    });
    expect(state.solvedPart).toBeUndefined();
  });

  it('mehrteilige Aufgaben gehen zu Teil b, nach der letzten Aufgabe ist Schluss', () => {
    let state = startPlay(twoParts, 4, 0);
    state = playReducer(state, {
      type: 'checked',
      result: { status: 'correct' },
      answerType: 'money',
      roll: 0,
    });
    state = playReducer(state, { type: 'close' });
    expect(state).toMatchObject({ taskIndex: 4, partIndex: 1, finished: false });
    state = playReducer(state, {
      type: 'checked',
      result: { status: 'correct' },
      answerType: 'money',
      roll: 0,
    });
    state = playReducer(state, { type: 'close' });
    expect(state.finished).toBe(true);
  });

  it('Tipp-Knopf steigert die Stufe bis zum Lösungsweg; „So geht’s“ springt direkt dorthin', () => {
    let state = startPlay(tasks);
    state = playReducer(playReducer(state, { type: 'open-hint' }), { type: 'close' });
    state = playReducer(state, { type: 'open-hint' });
    expect(state.sheet).toEqual({ kind: 'hint', level: 2 });
    state = playReducer(playReducer(state, { type: 'close' }), { type: 'open-hint' });
    state = playReducer(playReducer(state, { type: 'close' }), { type: 'open-hint' });
    expect(state.sheet).toEqual({ kind: 'hint', level: 3 });
    const fresh = playReducer(startPlay(tasks), { type: 'show-solution' });
    expect(fresh).toMatchObject({ hintsOpened: 3, sheet: { kind: 'hint', level: 3 } });
  });

  it('pay-variants: gemerkte Möglichkeiten zählen, doppelte nicht als Fehlversuch', () => {
    let state = startPlay(tasks);
    state = playReducer(state, {
      type: 'checked',
      result: { status: 'correct', remaining: 1 },
      answerType: 'pay-variants',
      roll: 0,
      pieces: [50, 50],
    });
    expect(state.found).toEqual([[50, 50]]);
    expect(state.solvedPart).toBeUndefined();
    state = playReducer(state, { type: 'close' });
    expect(state.taskIndex).toBe(0);
    state = playReducer(state, {
      type: 'checked',
      result: { status: 'partial', feedback: 'doppelt' },
      answerType: 'pay-variants',
      roll: 0,
      pieces: [50, 50],
    });
    expect(state.wrongCount).toBe(0);
    expect(state.found).toHaveLength(1);
    expect(state.sheet).toMatchObject({ plan: { specific: 'doppelt' } });
    expect(state.sheet?.kind === 'check' ? state.sheet.poolText : 'x').toBeUndefined();
  });
});
