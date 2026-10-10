import { STUFEN } from '@/config/levels';
import type { RiddleGridMoney, RiddleParams, RiddleType, Stufe, StufeConfig } from '@/domain/types';

export type { CodeClueKind, LogicFrage, PicturePeriod, SeqRule } from '@/domain/types';

// Startwerte der Rätsel je Stufe stehen in levels.ts (`riddles.params`, docs/10 Abschnitt 4).
// Die allgemeinen Grenzen (numbers.max, money.* …) kommen ebenfalls aus STUFEN; die Werte
// werden zusätzlich auf diese Grenzen begrenzt (siehe `limit…`-Funktionen).

export function paramsFor(cfg: StufeConfig): RiddleParams {
  return cfg.riddles.params;
}

/** Stufen, in denen der Rätseltyp laut `STUFEN[s].riddles.types` vorkommt. */
export function riddleStufen(type: RiddleType): Stufe[] {
  return Object.values(STUFEN)
    .filter((cfg) => cfg.riddles.types.includes(type))
    .map((cfg) => cfg.id);
}

/** Geld-Raster einer Mauer bzw. eines Dreiecks, begrenzt auf die Stufe. */
export function limitMoney(
  cfg: StufeConfig,
  money: RiddleGridMoney | null,
): RiddleGridMoney | null {
  if (!money || !cfg.answerTypes.includes('grid')) return null;
  const step = Math.max(money.step, cfg.money.step);
  const maxTop = Math.min(money.maxTop, cfg.money.maxTotal);
  return maxTop >= 3 * step ? { step, maxTop } : null;
}
