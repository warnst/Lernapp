import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WORLDS } from '@/content/worlds';
import { renderText } from '@/domain/text';
import type { Answer, StationProgress } from '@/domain/types';
import { makeProfile, makeState } from '@/state/test-helpers';
import { renderApp } from '@/test/render-app';
import { buildSheets, certificateAllowed, parsePrintOptions, printSearch } from './job';
import { solutionText } from './solution';

// Druck (docs/06): Auswahl aus der URL, Blätter, Lösungstexte, Druckseite.

const ida = makeProfile({ id: 'ida', name: 'Ida', stufe: 2 });

describe('Druckauftrag aus der URL', () => {
  it('liest die Auswahl und schreibt sie wieder gleich zurück', () => {
    const options = parsePrintOptions(
      'kind=ida&stufe=3&stationen=2,1,2,99&uebung=rueckgeld&raetsel=1&urkunde=1&loesungen=0&seed=4711',
      [ida],
    );
    expect(options).toMatchObject({
      profileId: 'ida',
      stufe: 3,
      stations: [1, 2],
      practice: 'rueckgeld',
      riddles: true,
      certificate: true,
      solutions: false,
      nameField: true,
      large: false,
      seed: 4711,
    });
    expect(parsePrintOptions(printSearch(options), [ida])).toEqual(options);
  });

  it('Startwerte: Stufe des Kindes, Lösungen an; Stufe 1 immer groß', () => {
    expect(parsePrintOptions('kind=ida', [ida])).toMatchObject({ stufe: 2, solutions: true });
    expect(parsePrintOptions('stufe=1', []).large).toBe(true);
    expect(parsePrintOptions('stufe=x', []).stufe).toBe(3);
  });

  it('Originale auf ihrer Stufe, Varianten mit Seed; Übungs- und Rätselblatt mit 6 Aufgaben', () => {
    const original = buildSheets(parsePrintOptions('stufe=3&stationen=2', []), undefined);
    const station = WORLDS.schatzinsel.stations[1];
    expect(original[0]).toEqual({ kind: 'station', station, tasks: station?.tasks });

    const sheets = buildSheets(
      parsePrintOptions('stufe=2&stationen=2&uebung=preise-addieren&raetsel=1&seed=5', []),
      undefined,
    );
    expect(sheets.map((s) => s.kind)).toEqual(['station', 'practice', 'riddles']);
    const [variant, practice, riddles] = sheets;
    expect(variant?.kind === 'station' && variant.tasks[0]).not.toBe(station?.tasks[0]);
    expect(practice?.kind === 'practice' && practice.tasks).toHaveLength(6);
    expect(riddles?.kind === 'riddles' && riddles.tasks).toHaveLength(6);
  });

  it('Urkunde nur mit allen Stationen oder „trotzdem erlauben“', () => {
    const done: StationProgress = { completed: true, plays: 1, stufe: 3 };
    const finished = makeProfile({
      name: 'Mila',
      worlds: {
        schatzinsel: {
          stations: Object.fromEntries(WORLDS.schatzinsel.stations.map((s) => [s.id, done])),
          unlockAll: false,
          bonusSolved: [],
        },
      },
    });
    const options = parsePrintOptions('stufe=3&urkunde=1', [finished]);
    expect(certificateAllowed(options, makeProfile())).toBe(false);
    expect(buildSheets(options, makeProfile())).toEqual([]);
    expect(buildSheets(options, finished)).toEqual([
      { kind: 'certificate', world: 'schatzinsel', name: 'Mila' },
    ]);
    expect(certificateAllowed({ ...options, certificateAnyway: true }, undefined)).toBe(true);
  });
});

describe('Lösungstexte (docs/06 5)', () => {
  const cases: [Answer, string][] = [
    [
      {
        type: 'choice',
        layout: 'cards',
        shuffle: true,
        options: [
          { id: 'a', label: '{{350}}', correct: true },
          { id: 'b', label: 'x' },
        ],
      },
      '3,50 €',
    ],
    [{ type: 'money', correct: 85 }, '85 Cent'],
    [{ type: 'number', correct: 7 }, '7'],
    [{ type: 'pay', target: 70, palette: [50, 20, 10], showTotal: true }, '50 Cent + 20 Cent'],
    [
      { type: 'pay', target: 40, palette: [20, 10], showTotal: true, exactCount: 3 },
      '20 Cent + 10 Cent + 10 Cent',
    ],
    [
      { type: 'pay-variants', target: 20, palette: [20, 10], required: 2, showTotal: true },
      '20 Cent oder 10 Cent + 10 Cent',
    ],
    [
      {
        type: 'order',
        direction: 'asc',
        entries: [
          { id: 'b', label: 'Hut', value: 300 },
          { id: 'a', label: 'Seil', value: 100 },
        ],
      },
      'Seil, Hut',
    ],
    [
      {
        type: 'select',
        items: [
          { itemId: 'a', label: 'Kokosnuss', price: 120 },
          { itemId: 'b', label: 'Mango', price: 180 },
          { itemId: 'c', label: 'Saft', price: 160 },
          { itemId: 'd', label: 'Muffin', price: 140 },
        ],
        rule: { kind: 'sum', count: 2, target: 300 },
      },
      'Kokosnuss + Mango oder Saft + Muffin',
    ],
    [
      {
        type: 'select',
        items: [
          { itemId: 'a', label: 'Seil', price: 200 },
          { itemId: 'b', label: 'Hut', price: 600 },
        ],
        rule: { kind: 'affordable', budget: 300 },
      },
      'Seil',
    ],
    [
      {
        type: 'grid',
        shape: 'wall',
        unit: 'cents',
        cells: [
          { id: 'r0c0', value: 120, given: true },
          { id: 'r0c1', value: 80, given: false },
          { id: 'r1c0', value: 200, given: false },
        ],
      },
      '80 Cent, 2 €',
    ],
    [{ type: 'code', digits: [2, 4, 3] }, '2, 4, 3'],
  ];

  it.each(cases)('%#', (answer, expected) => {
    expect(solutionText(answer)).toBe(expected.replace(/ (€|Cent)/g, ' $1'));
  });
});

async function openPrint(path: string) {
  const view = renderApp(path, makeState({ profiles: [ida] }));
  const label = screen.getByText(/Für Erwachsene: Wie viel ist/).textContent;
  const [, a, b] = /(\d+) × (\d+)/.exec(label) ?? [];
  await view.user.type(screen.getByRole('textbox'), String(Number(a) * Number(b)));
  await view.user.click(screen.getByRole('button', { name: 'Öffnen' }));
  return view;
}

describe('Druckseite (docs/06 1)', () => {
  it('Auswahl landet in der URL, die Vorschau zeigt die Blätter', async () => {
    const { user, location } = await openPrint('/erwachsene/drucken?kind=ida');
    expect(screen.getByText('Wählen Sie oben aus, was gedruckt werden soll.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Drucken' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: 'Station 2 · Markt am Palmenstrand' }));
    expect(location.history.at(-1)).toContain('stationen=2');
    const preview = screen.getByLabelText('Vorschau');
    expect(
      within(preview).getByRole('heading', { name: 'Station 2 · Markt am Palmenstrand' }),
    ).toBeInTheDocument();
    expect(within(preview).getByRole('heading', { name: 'Lösungen für Erwachsene' })).toBeVisible();
    await user.click(screen.getByRole('checkbox', { name: 'Alle auswählen' }));
    expect(location.history.at(-1)).toContain('stationen=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9');
    await user.click(screen.getByRole('button', { name: 'Muschel' }));
    expect(location.history.at(-1)).toContain('stufe=1');
    expect(location.history.at(-1)).not.toContain('stationen');
  });

  it('ohne Lösungsblatt enthält die Seite keine Lösung', async () => {
    await openPrint('/erwachsene/drucken?stufe=3&stationen=1,2,3,4,5,6,7,8,9&loesungen=0');
    const text = screen.getByLabelText('Vorschau').textContent;
    for (const station of WORLDS.schatzinsel.stations) {
      for (const task of station.tasks) {
        for (const part of task.parts) {
          expect(text).not.toContain(renderText(part.explanation));
        }
      }
    }
    expect(text).not.toContain('Lösungen für Erwachsene');
  });
});
