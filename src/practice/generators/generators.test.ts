import { describe, expect, it } from 'vitest';
import { STUFEN } from '@/config/levels';
import { mulberry32 } from '@/domain/random';
import { renderText } from '@/domain/text';
import { validateTask } from '../validate';
import { GENERATORS } from './index';

// Für jede Vorlage × jede ihrer Stufen × 300 Seeds (docs/05 Abschnitt 7).
const SEEDS = 300;

const cases = GENERATORS.flatMap((generator) =>
  generator.stufen.map(
    (stufe) => [`${generator.id} auf Stufe ${String(stufe)}`, generator, stufe] as const,
  ),
);

describe('Generatoren', () => {
  it('IDs sind eindeutig', () => {
    const ids = GENERATORS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(cases)(
    '%s: gültig, in den Grenzen, reproduzierbar',
    (_name, generator, stufe) => {
      const cfg = STUFEN[stufe];
      let supported = 0;
      let yes = 0;
      let yesNo = 0;
      for (let seed = 1; seed <= SEEDS; seed++) {
        const task = generator.generate(cfg, mulberry32(seed));
        if (task === 'unsupported') continue;
        supported++;
        expect(validateTask(task, cfg), `Seed ${String(seed)}`).toEqual([]);
        const answer = task.parts[0]?.answer;
        if (answer?.type === 'choice' && answer.layout === 'yesno') {
          yesNo++;
          if (renderText(answer.options.find((o) => o.correct)?.label ?? '').startsWith('Ja'))
            yes++;
        }
      }
      expect(supported, 'mindestens 90 % der Seeds liefern eine Aufgabe').toBeGreaterThanOrEqual(
        SEEDS * 0.9,
      );
      if (yesNo > 0) {
        expect(yes / yesNo).toBeGreaterThanOrEqual(0.35);
        expect(yes / yesNo).toBeLessThanOrEqual(0.65);
      }
      expect(generator.generate(cfg, mulberry32(42))).toEqual(
        generator.generate(cfg, mulberry32(42)),
      );
      // 300 Seeds mit großen Beträgen (Stufe 4) brauchen unter Coverage-Instrumentierung länger
    },
    60_000,
  );

  it('unbekannte force-Schlüssel brechen ab', () => {
    for (const generator of GENERATORS) {
      const stufe = generator.stufen[0];
      if (stufe === undefined) continue;
      expect(
        () => generator.generate(STUFEN[stufe], mulberry32(1), { force: { tippfehler: true } }),
        generator.id,
      ).toThrow();
    }
  });
});
