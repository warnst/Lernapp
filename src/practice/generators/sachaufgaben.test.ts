import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { mulberry32 } from '@/domain/random';
import { renderText } from '@/domain/text';
import type { Stufe, Task } from '@/domain/types';
import type { GenerateOptions, Generator } from '../types';
import { KNOBELN_GENERATORS } from './knobeln';
import { SACHAUFGABEN_GENERATORS } from './sachaufgaben';
import { addSteps, countUp, piecesInWords } from './sachaufgaben-parts';

// Varianten aus docs/09 5.2 (bind/force) und Beispielsätze für Sachaufgaben und Knobeln.

const ALL = [...SACHAUFGABEN_GENERATORS, ...KNOBELN_GENERATORS];

function gen(id: string): Generator {
  const generator = ALL.find((g) => g.id === id);
  if (!generator) throw new Error(id);
  return generator;
}

/** Aufgaben für viele Seeds (ohne unsupported). */
function tasks(id: string, stufe: Stufe, opts?: GenerateOptions, seeds = 60): Task[] {
  const result: Task[] = [];
  for (let seed = 1; seed <= seeds; seed++) {
    const task = gen(id).generate(STUFEN[stufe], mulberry32(seed), opts);
    if (task !== 'unsupported') result.push(task);
  }
  return result;
}

const show = (text: string) => renderText(text).replaceAll('\u00A0', ' ');

function itemIds(task: Task): string[] {
  return task.scene.kind === 'items' ? task.scene.items.map((i) => i.itemId) : [];
}

describe('Varianten aus docs/09 5.2', () => {
  it.each([
    ['4.5', 'S1', { A: 'keks', B: 'apfel' }, [2, 3]],
    ['7.3', 'S1', { A: 'lampenoel', B: 'decke' }, [2, 3, 4]],
    ['6.3', 'S3', { A: 'eis' }, [2, 3, 4]],
    ['6.4', 'S2', { A: 'seil' }, [2, 3, 4]],
    ['7.5', 'UE1', { A: 'kekse', B: 'marmelade' }, [3, 4]],
    ['8.4', 'K7', { A: 'piratenhut' }, [2, 3, 4]],
  ] as const)('%s: %s setzt die Sachen aus bind', (_task, id, bind, stufen) => {
    for (const stufe of stufen) {
      const list = tasks(id, stufe, { bind });
      expect(list.length, `Stufe ${String(stufe)}`).toBeGreaterThanOrEqual(54);
      for (const task of list) expect(itemIds(task)).toEqual(Object.values(bind));
    }
  });

  it('4.5: Keks hat auf Stufe 4 keinen Preisbereich → unsupported', () => {
    expect(gen('S1').generate(STUFEN[4], mulberry32(1), { bind: { A: 'keks', B: 'apfel' } })).toBe(
      'unsupported',
    );
  });

  it.each([
    ['8.1', 'K6', [2, 3, 4]],
    ['8.2', 'K1', [2, 3, 4]],
    ['8.3', 'K2', [2, 3, 4]],
    ['9.1', 'S1', [2, 3, 4]],
    ['9.4', 'K4', [2, 3, 4]],
    ['9.5', 'K3', [2, 3, 4]],
  ] as const)('%s: %s ohne bind/force auf allen Variantenstufen', (_task, id, stufen) => {
    for (const stufe of stufen) expect(tasks(id, stufe).length).toBeGreaterThanOrEqual(54);
  });

  it('9.2: K5 mit zweiteilig fragt erst nach B, dann nach beiden', () => {
    for (const stufe of [3, 4] as const) {
      for (const task of tasks('K5', stufe, { force: { zweiteilig: true } })) {
        expect(task.parts).toHaveLength(2);
        const [a, b] = task.parts.map((p) => p.answer);
        if (a?.type !== 'money' || b?.type !== 'money') throw new Error('money erwartet');
        expect(b.correct).toBe((a.correct / 2) * 3);
      }
      for (const task of tasks('K5', stufe)) expect(task.parts).toHaveLength(1);
    }
  });

  it('unbekannte bind-Schlüssel brechen ab', () => {
    for (const generator of ALL) {
      const stufe = generator.stufen[0] ?? 3;
      expect(
        () => generator.generate(STUFEN[stufe], mulberry32(1), { bind: { Z: 'eis' } }),
        generator.id,
      ).toThrow();
    }
  });

  it('Stufen der Vorlagen wie in docs/05', () => {
    expect(ALL.map((g) => `${g.id}:${g.stufen.join('')}`)).toEqual([
      'S1:234',
      'S2:234',
      'S3:234',
      'S4:34',
      'S5:4',
      'UE1:34',
      'K1:234',
      'K2:234',
      'K3:234',
      'K4:234',
      'K5:34',
      'K6:234',
      'K7:234',
    ]);
  });
});

describe('Regeln', () => {
  it('S2: mindestens 2 Murmeln, die Murmeln sind die richtige Karte', () => {
    for (const task of tasks('S2', 3)) {
      const answer = task.parts[0]?.answer;
      if (answer?.type !== 'choice') throw new Error('choice erwartet');
      const label = answer.options.find((o) => o.correct)?.label ?? '';
      expect(Number(/^(\d+) Murmeln$/.exec(label)?.[1])).toBeGreaterThanOrEqual(2);
    }
  });

  it('UE1: Preise liegen höchstens 10 Cent neben ganzen Euro', () => {
    for (const stufe of [3, 4] as const) {
      for (const task of tasks('UE1', stufe)) {
        if (task.scene.kind !== 'items') throw new Error('items erwartet');
        for (const item of task.scene.items) {
          expect([90, 95, 5, 10]).toContain((item.price ?? 0) % 100);
        }
      }
    }
  });

  it('K4: der Betrag lässt sich mit genau zwei Stücken nur auf eine Art legen', () => {
    for (const stufe of [2, 3, 4] as const) {
      for (const task of tasks('K4', stufe)) {
        const answer = task.parts[0]?.answer;
        if (answer?.type !== 'pay') throw new Error('pay erwartet');
        const pairs = answer.palette.flatMap((x, i) =>
          answer.palette.slice(i).filter((y) => x + y === answer.target),
        );
        expect(pairs).toHaveLength(1);
      }
    }
  });

  it('K7: Fehlbetrag höchstens 2 €, auf Stufe 4 höchstens 5 €', () => {
    for (const stufe of [2, 3, 4] as const) {
      for (const task of tasks('K7', stufe)) {
        const answer = task.parts[0]?.answer;
        if (answer?.type !== 'pay') throw new Error('pay erwartet');
        expect(answer.target).toBeLessThanOrEqual(stufe === 4 ? 500 : 200);
        expect(answer.showTotal).toBe(false);
      }
    }
  });

  it('K3 und K6: genau ein passendes Stück, Karten aufsteigend', () => {
    for (const id of ['K3', 'K6']) {
      for (const stufe of [2, 3, 4] as const) {
        for (const task of tasks(id, stufe)) {
          const answer = task.parts[0]?.answer;
          if (answer?.type !== 'choice') throw new Error('choice erwartet');
          expect(answer.options).toHaveLength(STUFEN[stufe].choiceCount);
          const values = answer.options.map((o) => o.pieces?.[0] ?? 0);
          expect(values).toEqual([...values].sort((a, b) => a - b));
        }
      }
    }
  });
});

describe('Bausteine', () => {
  it('Weiterzählen über den nächsten Euro', () => {
    const steps = countUp(140, 300);
    expect(show(steps.explanation)).toBe(
      'Von 1,40 € bis 2 € sind es 60 Cent. Von 2 € bis 3 € ist es 1 €.',
    );
    expect(show(steps.hints[0])).toBe('Zähle von 1,40 € bis 2 €.');
    expect(show(countUp(400, 1000).hints[0])).toBe('Zähle von 4 € in Euro-Schritten bis 10 €.');
  });

  it('Addieren mit Übertrag', () => {
    const steps = addSteps(85, 55);
    expect(show(steps.hints[0])).toBe('85 Cent hat keine ganzen Euro. Rechne mit den Cent.');
    expect(show(steps.explanation)).toBe('85 Cent + 55 Cent = 140 Cent = 1,40 €.');
    expect(show(addSteps(450, 320).hints[0])).toBe('Rechne zuerst die Euro: 4 € + 3 €.');
  });

  it('Münzen in Worten', () => {
    expect(piecesInWords([100, 200, 50])).toBe(
      'eine 2-Euro-Münze, eine 1-Euro-Münze und eine 50-Cent-Münze',
    );
    expect(piecesInWords([20, 20, 1000])).toBe('einen 10-Euro-Schein und zwei 20-Cent-Münzen');
  });
});

describe('Beispielsätze', () => {
  const story = (id: string, stufe: Stufe, seed: number, opts?: GenerateOptions) => {
    const task = gen(id).generate(STUFEN[stufe], mulberry32(seed), opts);
    if (task === 'unsupported') throw new Error('unsupported');
    return [task.story, ...task.parts.map((p) => p.question)].map(show).join(' | ');
  };

  it('Sachaufgaben', () => {
    expect(story('S1', 3, 3, { bind: { A: 'lampenoel', B: 'decke' } })).toMatchInlineSnapshot(
      `"Ida hat 10 €. Sie kauft eine Flasche Lampenöl für 4,15 € und eine warme Decke für 2,10 €. | Wie viel kostet beides zusammen? | Wie viel Geld bleibt Ida übrig?"`,
    );
    expect(story('S2', 2, 4, { bind: { A: 'seil' } })).toMatchInlineSnapshot(
      `"Lina hat 4 Murmeln und 7 €. Sie kauft ein Seil für 6 €. | Lina will wissen, wie viel Geld sie noch hat. Welche Angabe brauchst du dafür nicht? | Wie viel Geld hat Lina noch?"`,
    );
    expect(story('S3', 3, 5, { bind: { A: 'eis' } })).toMatchInlineSnapshot(
      `"Mia hat 5 €. Sie kauft ein Eis für 2,05 €. | Welche Frage kannst du mit dieser Geschichte beantworten? | Rechne sie aus: Wie viel Geld hat Mia noch?"`,
    );
    expect(story('S4', 3, 6)).toMatchInlineSnapshot(
      `"Paul kauft 3 Seile. Ein Seil kostet 1,50 €. Er bezahlt mit einem 10-Euro-Schein. | Wie viel kosten 3 Seile? | Wie viel Rückgeld bekommt er?"`,
    );
    expect(story('S5', 4, 7)).toMatchInlineSnapshot(
      `"Ida hat 20 €. Sie kauft 4 Kokosnüsse für je 3,95 € und einen Saft für 3,25 €. | Wie viel kosten die Kokosnüsse? | Wie viel kostet alles? | Wie viel bleibt übrig?"`,
    );
    expect(story('UE1', 3, 8, { bind: { A: 'kekse', B: 'marmelade' } })).toMatchInlineSnapshot(
      `"Mara kauft eine Tüte Kekse für 1,10 € und ein Glas Marmelade für 2,95 €. | Ungefähr wie viel kostet beides? Du musst nicht genau rechnen."`,
    );
  });

  it('Knobeln', () => {
    expect(story('K1', 3, 9)).toMatchInlineSnapshot(
      `"Im Piratenbuch steht eine Rechnung. Eine Zahl ist unter einem Tintenfleck verschwunden. | Welcher Betrag ist unter dem Fleck?"`,
    );
    expect(story('K2', 3, 10)).toMatchInlineSnapshot(
      `"Yusuf hatte Geld im Beutel. Er hat 2,55 € ausgegeben. Jetzt hat er noch 4,60 €. | Wie viel Geld war am Anfang im Beutel?"`,
    );
    expect(story('K3', 2, 11)).toMatchInlineSnapshot(
      `"Ich bin eine Münze oder ein Schein, mehr wert als 2 €, aber weniger als 10 €. Was bin ich? | Tippe die richtige Münze oder den richtigen Schein an."`,
    );
    expect(story('K4', 3, 12)).toMatchInlineSnapshot(
      `"Kiko sagt: „Gib mir genau zwei Münzen. Zusammen sollen sie 2 € wert sein.“ | Welche zwei Münzen passen?"`,
    );
    expect(story('K5', 3, 13, { force: { zweiteilig: true } })).toMatchInlineSnapshot(
      `"Ein Apfel kostet 30 Cent. Eine Muschel kostet doppelt so viel. | Wie viel kostet die Muschel? | Wie viel kosten beide zusammen?"`,
    );
    expect(story('K6', 3, 14)).toMatchInlineSnapshot(
      `"Ein Keks kostet 80 Cent. Du hast eine 50-Cent-Münze und eine 10-Cent-Münze. | Welche Münze fehlt dir noch, damit du genau bezahlen kannst?"`,
    );
    expect(story('K7', 3, 15, { bind: { A: 'piratenhut' } })).toMatchInlineSnapshot(
      `"Noah hat schon 1,25 € in der Hand. Ein Piratenhut kostet 2,10 €. | Lege das Geld, das Noah noch fehlt."`,
    );
  });
});
