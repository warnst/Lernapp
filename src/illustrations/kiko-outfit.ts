import { createContext } from 'react';
import type { KikoSlot } from '@/domain/types';

/** Was Kiko gerade trägt (docs/12 4.1). Die App setzt es für das aktive Kind, dann trägt Kiko es überall. */
export type KikoOutfit = Partial<Record<KikoSlot, string>>;

export const KikoOutfitContext = createContext<KikoOutfit>({});
