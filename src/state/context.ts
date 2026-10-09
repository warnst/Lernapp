import { createContext, type Dispatch, useContext } from 'react';
import type { AppStateV2 } from '@/domain/types';
import type { AppAction } from './reducer';

export interface AppContextValue {
  state: AppStateV2;
  dispatch: Dispatch<AppAction>;
  /** Erwachsenen-Bereich nach richtiger Antwort 10 Minuten offen (docs/09 Abschnitt 4). */
  adultUnlocked: boolean;
  unlockAdult: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppState(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useAppState braucht einen AppStateProvider');
  return value;
}
