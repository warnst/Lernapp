import type { Item } from '@/content/items';
import { PAYMENT_DATIVE } from '@/content/names';
import { pick, type Rng } from '@/domain/random';
import { renderText } from '@/domain/text';
import type { Cents, MoneyPiece, StufeConfig, Task, TaskPart } from '@/domain/types';
import {
  cap,
  chooseItem,
  chooseName,
  makeTask,
  readBind,
  readForce,
  tok,
  wordCount,
  yesNo,
} from '../build';
import {
  addedInstead,
  centDigit,
  changeEuroOff,
  type Distractor,
  euroOff,
  naiveSubtract,
  priceAsChange,
} from '../distractors';
import type { GenerateOptions, Generator } from '../types';
import {
  answerKind,
  attempt,
  changeExplanation,
  changeHints,
  mistakesFrom,
  moneyPart,
  ordered,
  priceOptions,
  sindEs,
  withCents,
} from './preise-addieren-parts';

// Vorlagen für das Thema „rueckgeld“ (docs/05 4.3).

const TRIES = 60;

interface Purchase {
  item: Item;
  price: Cents;
  payment: MoneyPiece;
}

/**
 * Sache, Preis und Zahlung: Zahlung aus cfg.money.payments und größer als der Preis.
 * Meist die kleinste passende Zahlung, manchmal die nächstgrößere. maxChange begrenzt das Rückgeld.
 */
function choosePurchase(
  cfg: StufeConfig,
  rng: Rng,
  bound: string | undefined,
  maxChange: Cents = cfg.money.maxTotal,
): Purchase | null {
  return attempt(TRIES, () => {
    const item = chooseItem(rng, cfg, bound);
    if (!item) return null;
    const pairs = cfg.money.payments.flatMap((payment) =>
      priceOptions(cfg, item)
        .filter((p) => p < payment && payment - p <= maxChange)
        .map((price) => ({ price, payment })),
    );
    if (pairs.length === 0) return null;
    const { price } = pick(rng, pairs);
    const larger = cfg.money.payments.filter((z) => z > price && z - price <= maxChange);
    const payment = pick(rng, larger.slice(0, 2));
    return { item, price, payment };
  });
}

function dative(payment: MoneyPiece): string {
  const text = PAYMENT_DATIVE[payment];
  if (text === undefined) throw new Error(`Kein Dativ für ${String(payment)}`);
  return text;
}

function storyFits(cfg: StufeConfig, story: string): boolean {
  return wordCount(renderText(story)) <= cfg.maxStoryWords;
}

/** Fehloptionen beim Rückgeld (docs/05 5). */
function changeDistractors(cfg: StufeConfig, rng: Rng, price: Cents, payment: Cents): Distractor[] {
  const change = payment - price;
  const first = withCents(cfg) && price % 100 !== 0 ? naiveSubtract(price, payment) : [];
  const rest = [
    ...priceAsChange(price),
    ...(price % 100 !== 0 ? changeEuroOff(change) : euroOff(change)),
    ...addedInstead(price, payment),
    ...centDigit(change),
  ];
  return ordered(rng, first, rest);
}

function scene(p: Purchase) {
  return {
    kind: 'items' as const,
    items: [{ itemId: p.item.id, label: p.item.name, price: p.price }],
    paidWith: [p.payment],
  };
}

function simpleChange(you: boolean) {
  return (cfg: StufeConfig, rng: Rng, opts?: GenerateOptions): Task | 'unsupported' => {
    readForce(opts, []);
    const bind = readBind(opts, ['A']);
    const kind = answerKind(cfg, rng);
    const task = attempt(10, () => {
      const purchase = choosePurchase(cfg, rng, bind.A);
      if (!purchase) return null;
      const { item, price, payment } = purchase;
      const person = chooseName(rng);
      const story = you
        ? `Du kaufst ${item.akk} für ${tok(price)}. Du bezahlst mit ${dative(payment)}.`
        : `${person.name} kauft ${item.akk} für ${tok(price)}. ${cap(person.pron)} bezahlt mit ${dative(
            payment,
          )}.`;
      if (!storyFits(cfg, story)) return null;
      const change = payment - price;
      return makeTask(
        cfg,
        item.name,
        scene(purchase),
        story,
        [
          {
            question: you
              ? 'Wie viel Rückgeld bekommst du?'
              : `Wie viel Rückgeld bekommt ${person.pron}?`,
            ...moneyPart(cfg, kind, change, changeDistractors(cfg, rng, price, payment)),
            hints: changeHints(price, payment),
            explanation: changeExplanation(price, payment),
          },
        ],
        2,
      );
    });
    return task ?? 'unsupported';
  };
}

const R1: Generator = {
  id: 'R1',
  topic: 'rueckgeld',
  stufen: [2, 3, 4],
  generate: simpleChange(false),
};

const R2: Generator = {
  id: 'R2',
  topic: 'rueckgeld',
  stufen: [2, 3, 4],
  generate: simpleChange(true),
};

/** Münzen für das Rückgeld, größte zuerst (fürs Beispiel im Lösungsweg). */
function greedy(target: Cents, palette: readonly MoneyPiece[]): MoneyPiece[] {
  const result: MoneyPiece[] = [];
  let rest = target;
  for (const piece of palette) {
    while (rest >= piece) {
      result.push(piece);
      rest -= piece;
    }
  }
  return result;
}

const R3: Generator = {
  id: 'R3',
  topic: 'rueckgeld',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    readForce(opts, []);
    const bind = readBind(opts, ['A']);
    // docs/05 4.3: Rückgeld höchstens 2 €, auf Stufe 4 höchstens 5 €.
    const maxChange = cfg.id === 4 ? 500 : 200;
    const coins = cfg.money.pieces.filter((p) => p <= 200).sort((a, b) => b - a);
    const task = attempt(10, () => {
      const purchase = choosePurchase(cfg, rng, bind.A, maxChange);
      if (!purchase) return null;
      const { item, price, payment } = purchase;
      const change = payment - price;
      // Münzen bis zum Rückgeld (wie in 3.4); bleibt nur eine übrig, alle Münzen der Stufe.
      const upTo = coins.filter((c) => c <= change);
      const palette = upTo.length >= 2 ? upTo : coins;
      const example = greedy(change, palette);
      if (palette.length === 0 || example.reduce((t, c) => t + c, 0) !== change) return null;
      const person = chooseName(rng);
      const story = `${person.name} kauft ${item.akk} für ${tok(price)}. ${cap(
        person.pron,
      )} bezahlt mit ${dative(payment)}.`;
      if (!storyFits(cfg, story)) return null;
      return makeTask(
        cfg,
        'Rückgeld legen',
        scene(purchase),
        story,
        [
          {
            question: 'Lege das Rückgeld mit Münzen.',
            answer: { type: 'pay', target: change, palette, showTotal: false },
            hints: [
              `Rechne zuerst aus, wie viel Rückgeld ${person.name} bekommt: von ${tok(
                price,
              )} bis ${tok(payment)}.`,
              `${person.name} bekommt ${tok(change)}. Welche Münzen ergeben ${tok(change)}?`,
            ],
            explanation: `Von ${tok(price)} bis ${tok(payment)} ${sindEs(change)} ${tok(change)}. Zum Beispiel: ${example.map(tok).join(' + ')}.`,
            praise: 'Prima! Genau so zählt man an der Kasse Rückgeld.',
          },
        ],
        3,
      );
    });
    return task ?? 'unsupported';
  },
};

const R4: Generator = {
  id: 'R4',
  topic: 'rueckgeld',
  stufen: [2, 3, 4],
  generate(cfg, rng, opts) {
    const force = readForce(opts, ['stimmt']);
    const bind = readBind(opts, ['A']);
    const coin = rng();
    const correctStated = typeof force.stimmt === 'boolean' ? force.stimmt : coin < 0.5;
    // Abweichung: ein Schritt, 50 Cent oder 1 € (Stufe 2: 1 € oder 2 €)
    const offsets = withCents(cfg) ? [cfg.money.step, 50, 100] : [100, 200];
    const task = attempt(10, () => {
      const purchase = choosePurchase(cfg, rng, bind.A);
      if (!purchase) return null;
      const { item, price, payment } = purchase;
      const change = payment - price;
      let stated = change;
      if (!correctStated) {
        const options = offsets
          .flatMap((d) => [change + d, change - d])
          .filter((v) => v > 0 && v < payment && v !== change);
        if (options.length === 0) return null;
        stated = pick(rng, options);
      }
      const person = chooseName(rng);
      const story = `${person.name} kauft ${item.akk} für ${tok(price)} und bezahlt mit ${dative(
        payment,
      )}. ${cap(person.pron)} bekommt ${tok(stated)} zurück.`;
      if (!storyFits(cfg, story)) return null;
      const check = price + stated;
      const diff = Math.abs(check - payment);
      const partA = {
        question: 'Stimmt das Rückgeld?',
        answer: yesNo('Ja, das stimmt', 'Nein, das stimmt nicht', correctStated, {
          yes: `Mach die Probe: ${tok(price)} + ${tok(stated)}. Sind das genau ${tok(payment)}?`,
          no: `Mach die Probe: Preis + Rückgeld. Rechne ${tok(price)} + ${tok(stated)}.`,
        }),
        hints: [
          `Mach die Probe: Preis + Rückgeld muss genau ${tok(payment)} ergeben.`,
          `Rechne ${tok(price)} + ${tok(stated)}. Ist das genau ${tok(payment)}?`,
        ] as [string, string],
        explanation: correctStated
          ? `${tok(price)} + ${tok(stated)} = ${tok(payment)}. Das Rückgeld stimmt.`
          : `${tok(price)} + ${tok(stated)} = ${tok(check)}. Das ist ${
              check > payment ? 'mehr' : 'weniger'
            } als ${tok(payment)}. ${person.name} hat ${tok(diff)} zu ${
              check > payment ? 'viel' : 'wenig'
            } bekommen.`,
        ...(correctStated ? { praise: 'Genau! Mit der Probe hast du es sicher geprüft.' } : {}),
      };
      const parts: Omit<TaskPart, 'id'>[] = [partA];
      if (!correctStated) {
        const wrong = mistakesFrom(cfg, change, [
          {
            value: stated,
            feedback: `So viel hat ${person.name} bekommen. Zähle von ${tok(price)} bis ${tok(
              payment,
            )}.`,
          },
          ...changeDistractors(cfg, rng, price, payment),
        ]);
        parts.push({
          question: `Wie viel Rückgeld muss ${person.pron} bekommen?`,
          answer: { type: 'money', correct: change },
          mistakes: wrong,
          hints: changeHints(price, payment),
          explanation: changeExplanation(price, payment),
          praise: 'Prima! Erst mit der Probe geprüft, dann richtig gerechnet.',
        });
      }
      return makeTask(cfg, 'Stimmt das Rückgeld?', scene(purchase), story, parts, 3);
    });
    return task ?? 'unsupported';
  },
};

export const RUECKGELD_GENERATORS: Generator[] = [R1, R2, R3, R4];
