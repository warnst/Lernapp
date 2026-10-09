import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WORLDS } from '@/content/worlds';
import { minPieces, payCombinations } from '@/domain/money';
import { renderText } from '@/domain/text';
import type { AppStateV2, Station, Stufe, TaskPart } from '@/domain/types';
import { STORAGE_KEY } from '@/state/storage';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';

// Abnahme Phase 5: Jede Station lässt sich über die Oberfläche mit richtigen Antworten durchspielen.

type User = ReturnType<typeof renderApp>['user'];

const COIN_NAMES: Record<number, string> = {
  1: '1-Cent-Münze',
  2: '2-Cent-Münze',
  5: '5-Cent-Münze',
  10: '10-Cent-Münze',
  20: '20-Cent-Münze',
  50: '50-Cent-Münze',
  100: '1-Euro-Münze',
  200: '2-Euro-Münze',
};

function subsets<T>(items: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  return items.flatMap((item, i) =>
    subsets(items.slice(i + 1), size - 1).map((rest) => [item, ...rest]),
  );
}

async function lay(user: User, pieces: number[]) {
  const palette = screen.getByRole('group', { name: 'Münzen zum Hinlegen' });
  for (const piece of pieces) {
    await user.click(within(palette).getByRole('button', { name: COIN_NAMES[piece] }));
  }
}

async function digits(user: User, text: string) {
  for (const digit of text) await user.click(screen.getByRole('button', { name: digit }));
}

async function weiter(user: User) {
  const sheet = screen.getByRole('region', { name: 'Kiko sagt' });
  await user.click(within(sheet).getByRole('button', { name: 'Weiter' }));
}

async function answerPart(user: User, part: TaskPart, numberline: boolean) {
  const answer = part.answer;
  switch (answer.type) {
    case 'choice': {
      const option = answer.options.find((o) => o.correct);
      await user.click(screen.getByRole('button', { name: renderText(option?.label ?? '') }));
      break;
    }
    case 'money':
      await digits(user, String(Math.floor(answer.correct / 100)));
      if (answer.correct % 100 > 0) {
        await user.click(screen.getByRole('button', { name: 'Zum Cent-Feld' }));
        await digits(user, String(answer.correct % 100));
      }
      await user.click(screen.getByRole('button', { name: 'Prüfen' }));
      break;
    case 'number':
      if (numberline) {
        const line = screen.getByRole('group', { name: 'Deine Zahl' });
        await user.click(within(line).getByRole('button', { name: String(answer.correct) }));
      } else {
        await digits(user, String(answer.correct));
      }
      await user.click(screen.getByRole('button', { name: 'Prüfen' }));
      break;
    case 'pay': {
      const best = minPieces(answer.target, answer.palette);
      const pieces = payCombinations(answer.target, answer.palette).find(
        (c) =>
          (answer.exactCount === undefined || c.length === answer.exactCount) &&
          (!answer.minimal || c.length === best),
      );
      await lay(user, pieces ?? []);
      await user.click(screen.getByRole('button', { name: 'Prüfen' }));
      break;
    }
    case 'pay-variants': {
      const combos = payCombinations(answer.target, answer.palette).slice(0, answer.required);
      for (const [i, pieces] of combos.entries()) {
        await lay(user, pieces);
        await user.click(screen.getByRole('button', { name: 'Diese Möglichkeit merken' }));
        if (i < combos.length - 1) await weiter(user);
      }
      break;
    }
    case 'order':
      for (const entry of [...answer.entries].sort((a, b) => a.value - b.value)) {
        await user.click(screen.getByRole('button', { name: entry.label }));
      }
      await user.click(screen.getByRole('button', { name: 'Prüfen' }));
      break;
    case 'select': {
      const rule = answer.rule;
      const items =
        rule.kind === 'affordable'
          ? answer.items.filter((item) => (item.price ?? 0) <= rule.budget)
          : (subsets(answer.items, rule.count).find(
              (set) => set.reduce((t, item) => t + (item.price ?? 0), 0) === rule.target,
            ) ?? []);
      for (const item of items) {
        await user.click(screen.getByRole('button', { name: new RegExp(`^${item.label}`) }));
      }
      await user.click(screen.getByRole('button', { name: 'Prüfen' }));
      break;
    }
    case 'grid':
    case 'code':
      throw new Error('Rätsel-Eingaben folgen in Phase 7');
  }
  await weiter(user);
}

function profileState(stufe: Stufe, world: Station['world']): AppStateV2 {
  return makeState({
    profiles: [
      makeProfile({
        stufe,
        worlds: { [world]: { stations: {}, unlockAll: true, bonusSolved: [] } },
      }),
    ],
  });
}

const islandStations = WORLDS.schatzinsel.stations;
const bayStations = WORLDS['kleine-bucht'].stations.filter((s) => s.id !== 'muscheltruhe');

describe('alle Stationen sind durchspielbar', () => {
  it.each(islandStations.map((s) => [s.id, s] as const))(
    'Insel: %s',
    async (_id, station) => {
      const { user, storage } = renderApp(`/station/${station.id}`, profileState(3, 'schatzinsel'));
      for (const task of station.tasks) {
        for (const part of task.parts) await answerPart(user, part, false);
      }
      const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
      expect(saved.profiles[0]?.worlds.schatzinsel?.stations[station.id]?.completed).toBe(true);
    },
    20000,
  );

  it.each(bayStations.map((s) => [s.id, s] as const))(
    'Bucht: %s',
    async (_id, station) => {
      const { user, storage } = renderApp(
        `/station/${station.id}`,
        profileState(1, 'kleine-bucht'),
      );
      for (const task of station.tasks) {
        for (const part of task.parts) await answerPart(user, part, true);
      }
      const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppStateV2;
      expect(saved.profiles[0]?.worlds['kleine-bucht']?.stations[station.id]?.completed).toBe(true);
    },
    20000,
  );
});
