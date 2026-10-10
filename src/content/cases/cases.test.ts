import { describe, expect, it } from 'vitest';
import { CASES, DETECTIVE_LINES } from './index';
import type { DetectiveCase, SuspectAnimal } from './types';

// Sachen-Icons mit vorhandener Zeichnung (ItemIcon)
const ITEM_ICONS = new Set(
  (
    'aepfel anker apfel augenklappe ball banane bananenbrot bonbon boot brot decke eimer eis feder ' +
    'federstift fernglas fisch fischbroetchen honig hut kaese karte kaugummi keks kekse kerze ' +
    'kokoskeks kokosnuss kompass kopftuch krebs lampenoel laterne lolli mango marmelade melone ' +
    'moewe muffin murmel muschel muschelarmband muschelkette piratenhut postkarte saft ' +
    'schatzkaestchen seestern seifenblasen seil sonnencreme stein stern sticker stickerheft ' +
    'strandball streichhoelzer tee vogelpfeife wasser'
  ).split(' '),
);

const ANIMAL_NAMES: Record<SuspectAnimal, string> = {
  moewe: 'Möwe',
  robbe: 'Robbe',
  flamingo: 'Flamingo',
  krebs: 'Krebs',
  pinguin: 'Pinguin',
  schildkroete: 'Schildkröte',
  seepferdchen: 'Seepferdchen',
  delfin: 'Delfin',
  seestern: 'Seestern',
};

/**
 * Welches Merkmal jeder Hinweis meint. „not“: Der Täter hat das Merkmal nicht, also sind alle
 * entlastet, deren Merkmal es nennt. „has“: Der Täter hat es, also sind alle anderen entlastet.
 */
const CLUE_RULES: Record<string, { trait: RegExp; mode: 'not' | 'has' }> = {
  'keks/keine-scheren': { trait: /Scheren/, mode: 'not' },
  'keks/geradeaus': { trait: /seitwärts/, mode: 'not' },
  'keks/kein-barthaar': { trait: /Schnurrbart/, mode: 'not' },
  'keks/felsen': { trait: /kann fliegen/, mode: 'has' },
  'keks/weisse-feder': { trait: /weiße Federn/, mode: 'has' },
  'muschel/kein-pfeifen': { trait: /pfeift/, mode: 'not' },
  'muschel/keine-flosse': { trait: /Rückenflosse/, mode: 'not' },
  'muschel/fussspuren': { trait: /Beine/, mode: 'has' },
  'muschel/rosa-feder': { trait: /rosa Federn/, mode: 'has' },
  'muschel/grosse-schritte': { trait: /lange Beine/, mode: 'has' },
  'fussspuren/keine-feder': { trait: /Federn/, mode: 'not' },
  'fussspuren/zwei-abdruecke': { trait: /auf einem Bein/, mode: 'not' },
  'fussspuren/kein-kratzer': { trait: /Scheren/, mode: 'not' },
  'fussspuren/kein-kringel': { trait: /Ringelschwanz/, mode: 'not' },
  'fussspuren/breite-spuren': { trait: /breite Flossen/, mode: 'has' },
  'feder/kein-schnabel': { trait: /Schnabel/, mode: 'not' },
  'feder/keine-weisse-feder': { trait: /weiße Federn/, mode: 'not' },
  'feder/schnelle-spur': { trait: /langsam/, mode: 'not' },
  'feder/keine-flosse': { trait: /Rückenflosse/, mode: 'not' },
  'feder/knick': { trait: /Scheren/, mode: 'has' },
  'geheimbrief/kein-panzer': { trait: /Panzer/, mode: 'not' },
  'geheimbrief/davongeflitzt': { trait: /langsam/, mode: 'not' },
  'geheimbrief/kein-kringel': { trait: /Ringelschwanz/, mode: 'not' },
  'geheimbrief/keine-flosse': { trait: /Rückenflosse/, mode: 'not' },
  'geheimbrief/watschelspuren': { trait: /watschelt/, mode: 'has' },
  'glocke/keine-watschelspuren': { trait: /watschelt/, mode: 'not' },
  'glocke/nichts-schwarzes': { trait: /schwarzen Frack/, mode: 'not' },
  'glocke/kein-pfeifen': { trait: /pfeift/, mode: 'not' },
  'glocke/kein-schnabel': { trait: /Schnabel/, mode: 'not' },
  'glocke/saugnapf': { trait: /Saugnäpfe/, mode: 'has' },
};

/** Wer ist nach den ersten `clueCount` Hinweisen unter `suspectIds` noch übrig? */
function remaining(c: DetectiveCase, suspectIds: string[], clueCount: number): string[] {
  const out = new Set(c.clues.slice(0, clueCount).flatMap((clue) => clue.excludes));
  return suspectIds.filter((id) => !out.has(id));
}

/** Stufe 2: 3 Verdächtige und 3 Hinweise, Stufe 3: 4 und 4, Stufe 4: 4 und 5 */
const STUFEN = [
  { stufe: 2, suspects: 3, clues: 3 },
  { stufe: 3, suspects: 4, clues: 4 },
  { stufe: 4, suspects: 4, clues: 5 },
] as const;

describe('Detektivfälle (docs/12 3.9)', () => {
  it('6 Fälle in der Reihenfolge der Spezifikation, IDs eindeutig', () => {
    expect(CASES.map((c) => c.title)).toEqual([
      'Der verschwundene Keks',
      'Die bemalte Muschel',
      'Nasse Fußspuren im Leuchtturm',
      'Wo ist Kikos Feder?',
      'Der Geheimbrief im Sand',
      'Die Glocke um Mitternacht',
    ]);
    const ids = CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Täter wie in der Spezifikation', () => {
    const culprits = CASES.map((c) => c.suspects.find((s) => s.id === c.culprit)?.name);
    expect(culprits).toEqual([
      'Möwe Mia',
      'Flamingo Fine',
      'Robbe Rudi',
      'Krebs Kalle',
      'Pinguin Paul',
      'Seestern Stella',
    ]);
  });

  for (const c of CASES) {
    describe(c.title, () => {
      const ids = c.suspects.map((s) => s.id);

      it('4 Verdächtige mit Tiernamen und Alliteration, Täter unter den ersten 3', () => {
        expect(c.suspects).toHaveLength(4);
        expect(new Set(ids).size).toBe(4);
        for (const s of c.suspects) {
          const [animal, name] = s.name.split(' ');
          expect(animal, s.name).toBe(ANIMAL_NAMES[s.animal]);
          expect(name, s.name).toBeDefined();
          expect(s.trait.length, s.name).toBeGreaterThan(5);
        }
        expect(ids.slice(0, 3)).toContain(c.culprit);
      });

      it('5 Hinweise mit vorhandenen Icons, Szene-Icon vorhanden', () => {
        expect(c.clues).toHaveLength(5);
        expect(new Set(c.clues.map((clue) => clue.id)).size).toBe(5);
        expect(ITEM_ICONS.has(c.sceneIcon), c.sceneIcon).toBe(true);
        for (const clue of c.clues) {
          expect(ITEM_ICONS.has(clue.icon), clue.icon).toBe(true);
          expect(clue.text, clue.id).toMatch(/[.!]$/);
          expect(clue.short, clue.id).toMatch(/!$/);
          expect(clue.excludes.length, clue.id).toBeGreaterThan(0);
          expect(clue.excludes, clue.id).not.toContain(c.culprit);
          for (const id of clue.excludes) expect(ids, clue.id).toContain(id);
        }
      });

      it('jeder Hinweis entlastet genau die Verdächtigen, deren Merkmal nicht passt', () => {
        for (const clue of c.clues) {
          const rule = CLUE_RULES[`${c.id}/${clue.id}`];
          expect(rule, clue.id).toBeDefined();
          if (!rule) continue;
          const expected = c.suspects
            .filter((s) => rule.trait.test(s.trait) === (rule.mode === 'not'))
            .map((s) => s.id);
          expect([...clue.excludes].sort(), clue.id).toEqual(expected.sort());
          expect(clue.text, clue.id).toMatch(
            rule.mode === 'not' ? /Der Täter .*(kein|nicht)/ : /Der Täter/,
          );
        }
      });

      for (const { stufe, suspects, clues } of STUFEN) {
        it(`Stufe ${String(stufe)}: am Ende bleibt nur der Täter, vorher ist es spannend`, () => {
          const pool = ids.slice(0, suspects);
          expect(remaining(c, pool, clues)).toEqual([c.culprit]);
          // Auf Stufe 4 steht der Täter schon nach Hinweis 4 fest (er muss es auf Stufe 3);
          // Hinweis 5 bestätigt ihn nur.
          if (stufe < 4) expect(remaining(c, pool, clues - 1).length).toBeGreaterThanOrEqual(2);
        });
      }

      it('Auflösung und Detektivbuch nennen den Täter', () => {
        const name = c.suspects.find((s) => s.id === c.culprit)?.name ?? '?';
        expect(c.resolution).toContain(name);
        expect(c.bookLine).toContain(name);
        expect(
          c.resolution.split(/[.!?](\s|$)/).filter((p) => p.trim().length > 1).length,
        ).toBeLessThanOrEqual(3);
      });
    });
  }

  it('8 Detektivsätze, der erste wörtlich aus der Spezifikation', () => {
    expect(DETECTIVE_LINES).toHaveLength(8);
    expect(DETECTIVE_LINES[0]).toBe('Hmm, eine Spur! Wir kommen der Sache näher.');
    expect(new Set(DETECTIVE_LINES).size).toBe(8);
  });
});
