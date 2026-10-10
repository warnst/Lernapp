import type { Item } from '@/content/items';
import type { Cents, Mistake, MoneyPiece, StufeConfig } from '@/domain/types';
import { tok } from '../build';
import { greedyPieces } from './muenzen-legen-parts';

// Bausteine für „Reicht das Geld?“ (docs/05 4.5): Weiterzählen, Fehlerhinweise, Grammatik.

/** „der Apfel“ → „den Apfel“ (für „für den Apfel“); die/das bleiben. */
export function defAkk(item: Item): string {
  return item.def.replace(/^der /, 'den ');
}

/** „A“, „A und B“, „A, B und C“ */
export function listJoin(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} und ${parts.at(-1) ?? ''}`;
}

/** Geld in der Hand: gierig aus den erlaubten Stücken. */
export function handPieces(cfg: StufeConfig, amount: Cents): MoneyPiece[] | null {
  return greedyPieces(
    amount,
    cfg.money.pieces.filter((p) => p <= amount),
  );
}

/** „sind es 2 €“, aber „ist es 1 €“ / „ist es 1 Cent“ */
function esSind(cents: Cents): string {
  return cents === 100 || cents === 1 ? 'ist es' : 'sind es';
}

export interface CountUp {
  hints: [string, string];
  /** Rechenweg ohne Schlusssatz, z. B. „60 Cent + 30 Cent = 90 Cent.“ */
  steps: string;
}

/** Tipps und Rechenweg für den Unterschied von lo bis hi durch Weiterzählen (wie 5.4 und 6.5). */
export function countUp(lo: Cents, hi: Cents): CountUp {
  const diff = hi - lo;
  if (lo % 100 === 0 && diff % 100 === 0) {
    return {
      hints: [
        `Zähle von ${tok(lo)} in Euro-Schritten weiter bis ${tok(hi)}.`,
        `Rechne ${tok(hi)} − ${tok(lo)}.`,
      ],
      steps: `${tok(hi)} − ${tok(lo)} = ${tok(diff)}.`,
    };
  }
  const next = Math.ceil(lo / 100) * 100;
  const mid = lo % 100 === 0 ? Math.floor(hi / 100) * 100 : next;
  if (mid <= lo || mid >= hi) {
    return {
      hints: [
        `Zähle von ${tok(lo)} weiter bis ${tok(hi)}.`,
        `Von ${tok(lo)} bis ${tok(hi)}: Wie viele Cent sind das?`,
      ],
      steps: `Von ${tok(lo)} bis ${tok(hi)} ${esSind(diff)} ${tok(diff)}.`,
    };
  }
  const x = mid - lo;
  const y = hi - mid;
  return {
    hints: [
      `Zähle von ${tok(lo)} bis ${tok(mid)}.`,
      `Von ${tok(lo)} bis ${tok(mid)} ${esSind(x)} ${tok(x)}. Von ${tok(mid)} bis ${tok(hi)} noch ${tok(y)}.`,
    ],
    steps: `${tok(x)} + ${tok(y)} = ${tok(diff)}.`,
  };
}

/** Typische Fehler beim Unterschied von lo bis hi (docs/05 5); gefiltert und eindeutig. */
export function differenceMistakes(
  cfg: StufeConfig,
  lo: Cents,
  hi: Cents,
  extra: readonly Mistake[] = [],
): Mistake[] {
  const diff = hi - lo;
  const candidates: Mistake[] = [...extra];
  candidates.push({
    value: lo + hi,
    feedback: 'Du hast zusammengezählt. Gesucht ist der Unterschied.',
  });
  const loCent = lo % 100;
  const hiCent = hi % 100;
  if (loCent > hiCent) {
    candidates.push({
      value: (Math.floor(hi / 100) - Math.floor(lo / 100)) * 100 + (loCent - hiCent),
      feedback: `Rechne nicht Euro und Cent getrennt. Zähle von ${tok(lo)} weiter bis ${tok(hi)}.`,
    });
  }
  if (cfg.money.useCents && !cfg.money.centOnly && diff < 100) {
    candidates.push({
      value: diff + 100,
      feedback: `Von ${tok(lo)} bis ${tok(hi)} ist es weniger als 1 €.`,
    });
  }
  const seen = new Set<number>([diff]);
  return candidates.filter((m) => {
    if (!Number.isInteger(m.value) || m.value < 0 || seen.has(m.value)) return false;
    seen.add(m.value);
    return true;
  });
}
