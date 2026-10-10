import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import type { Profile, Task } from '@/domain/types';
import { AppStateProvider } from '@/state/app-state';
import { makeProfile, makeState, memoryStorage } from '@/state/test-helpers';
import { Game } from './Game';

// Bedienung der Rätsel (docs/10 3): Mauer mit festen Feldern, Ordnungshilfe bei Logik.

function renderGame(profile: Profile, tasks: Task[]) {
  const onFinish = vi.fn();
  const user = userEvent.setup();
  render(
    <Router hook={memoryLocation({ path: '/' }).hook}>
      <AppStateProvider storage={memoryStorage(makeState({ profiles: [profile] }))}>
        <Game profile={profile} tasks={tasks} progressStyle="locks" onFinish={onFinish} />
      </AppStateProvider>
    </Router>,
  );
  return { user, onFinish };
}

const wall: Task = {
  id: 'w',
  title: 'Mauer',
  difficulty: 2,
  authoredFor: 2,
  scene: { kind: 'none' },
  story: 'Kiko baut eine Mauer.',
  parts: [
    {
      id: 'w-a',
      question: 'Fülle die leeren Steine.',
      answer: {
        type: 'grid',
        shape: 'wall',
        unit: 'number',
        cells: [
          { id: 'r0c0', value: 4, given: true },
          { id: 'r0c1', value: 3, given: true },
          { id: 'r0c2', value: 5, given: true },
          { id: 'r1c0', value: 7, given: true },
          { id: 'r1c1', value: 8, given: false },
          { id: 'r2c0', value: 15, given: false },
        ],
      },
      hints: [
        'Ein Stein ist immer so viel wie die zwei Steine darunter zusammen.',
        'Rechne 3 + 5.',
      ],
      explanation: '3 + 5 = 8. 7 + 8 = 15.',
    },
  ],
};

const logic: Task = {
  id: 'l',
  title: 'Wer hat am meisten?',
  difficulty: 2,
  authoredFor: 2,
  scene: { kind: 'people', people: [{ name: 'Emil' }, { name: 'Lina' }, { name: 'Noah' }] },
  story: 'Emil hat mehr Geld als Lina. Lina hat mehr Geld als Noah.',
  parts: [
    {
      id: 'l-a',
      question: 'Wer hat am meisten?',
      answer: {
        type: 'choice',
        layout: 'cards',
        shuffle: false,
        options: [
          { id: 'a', label: 'Emil', correct: true },
          { id: 'b', label: 'Lina' },
          { id: 'c', label: 'Noah' },
        ],
      },
      hints: [
        'Lies jeden Satz einzeln.',
        'Stell die Kinder auf die Treppe: Wer mehr hat, steht höher.',
      ],
      explanation: 'Emil hat mehr als Lina, Lina mehr als Noah. Emil hat am meisten.',
    },
  ],
};

async function fill(user: ReturnType<typeof userEvent.setup>, value: string) {
  const [empty] = screen.getAllByRole('button', { name: 'Leeres Feld, antippen' });
  if (!empty) throw new Error('kein offenes Feld');
  await user.click(empty);
  for (const digit of value) await user.click(screen.getByRole('button', { name: digit }));
  await user.click(screen.getByRole('button', { name: 'Fertig' }));
}

describe('Rätsel', () => {
  it('Zahlenmauer: richtige Felder werden fest, die anderen bleiben bearbeitbar', async () => {
    const { user, onFinish } = renderGame(makeProfile({ stufe: 2 }), [wall]);
    const check = screen.getByRole('button', { name: 'Prüfen' });
    expect(check).toBeDisabled();
    await fill(user, '15'); // oben
    expect(check).toBeDisabled();
    await fill(user, '9'); // Mitte, falsch
    await user.click(check);
    const sheet = screen.getByRole('region', { name: 'Kiko sagt' });
    expect(within(sheet).getByText(/Ein Stein stimmt schon/)).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: 'Nochmal versuchen' }));

    expect(screen.getByRole('img', { name: 'Feld: 15, stimmt' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Feld: 9, antippen zum Ändern' }));
    await user.click(screen.getByRole('button', { name: 'Löschen' }));
    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: 'Fertig' }));
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    await user.click(
      within(screen.getByRole('region', { name: 'Kiko sagt' })).getByRole('button', {
        name: 'Weiter',
      }),
    );
    expect(onFinish).toHaveBeenCalled();
  });

  it('Logik: ab Tipp 2 erscheint die Ordnungshilfe, sie wird nicht geprüft', async () => {
    const { user } = renderGame(makeProfile({ stufe: 2 }), [logic]);
    expect(screen.queryByText(/Ordnungshilfe/)).not.toBeInTheDocument();
    for (let i = 0; i < 2; i++) {
      await user.click(screen.getByRole('button', { name: 'Tipp' }));
      await user.click(
        within(screen.getByRole('region', { name: 'Kiko sagt' })).getAllByRole('button')[0] ??
          document.body,
      );
    }
    const helper = screen.getByRole('region', { name: /Ordnungshilfe/ });
    await user.click(within(helper).getByRole('button', { name: 'Emil' }));
    await user.click(within(helper).getByRole('button', { name: 'Stufe 3: leer' }));
    expect(within(helper).getByRole('button', { name: 'Stufe 3: Emil' })).toBeInTheDocument();
    expect(within(helper).queryByRole('button', { name: 'Emil' })).not.toBeInTheDocument();
  });
});
