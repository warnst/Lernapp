import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { minPieces, payCombinations } from '@/domain/money';
import { renderText } from '@/domain/text';
import type { TaskPart } from '@/domain/types';

// Beantwortet Aufgabenteile über die Oberfläche richtig (für Ablauftests).

type User = UserEvent;

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

export async function answerPart(user: User, part: TaskPart, numberline: boolean) {
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
      for (const cell of answer.cells.filter((c) => !c.given)) {
        const [empty] = screen.getAllByRole('button', { name: 'Leeres Feld, antippen' });
        if (!empty) throw new Error('Kein leeres Feld');
        await user.click(empty);
        if (answer.unit === 'cents') {
          await digits(user, String(Math.floor(cell.value / 100)));
          if (cell.value % 100 > 0) {
            await user.click(screen.getByRole('button', { name: 'Zum Cent-Feld' }));
            await digits(user, String(cell.value % 100));
          }
        } else if (numberline) {
          const line = screen.getByRole('group', { name: 'Deine Zahl' });
          await user.click(within(line).getByRole('button', { name: String(cell.value) }));
        } else {
          await digits(user, String(cell.value));
        }
        await user.click(screen.getByRole('button', { name: 'Fertig' }));
      }
      await user.click(screen.getByRole('button', { name: 'Prüfen' }));
      break;
    case 'code': {
      const ups = screen.getAllByRole('button', { name: /^Rad mit .* höher$/ });
      for (const [i, digit] of answer.digits.entries()) {
        const up = ups[i];
        if (!up) throw new Error(`Rad ${String(i + 1)} fehlt`);
        for (let n = 0; n < digit; n++) await user.click(up);
      }
      await user.click(screen.getByRole('button', { name: 'Öffnen' }));
      break;
    }
  }
  await weiter(user);
}
