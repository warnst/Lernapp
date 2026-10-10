import { type ReactNode, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { TEXT_SCALE } from '@/config/display';
import { ADULT_UNLOCK_MS } from './adult-gate';
import { AppContext } from './context';
import { activeProfile } from './progress';
import { appReducer } from './reducer';
import { browserStorage, loadState, saveState } from './storage';

export function AppStateProvider({
  children,
  storage = browserStorage(),
}: {
  children: ReactNode;
  storage?: Storage | undefined;
}) {
  const [state, dispatch] = useReducer(appReducer, storage, loadState);
  const [adultUnlocked, setAdultUnlocked] = useState(false);

  useEffect(() => {
    saveState(storage, state);
  }, [storage, state]);

  useEffect(() => {
    // Browser löschen die Daten so seltener (docs/03 Abschnitt 8).
    if ('storage' in navigator && 'persist' in navigator.storage) {
      void navigator.storage.persist().catch(() => undefined);
    }
  }, []);

  const stufe = activeProfile(state)?.stufe;
  useEffect(() => {
    document.body.style.setProperty('--text-scale', String(stufe ? TEXT_SCALE[stufe] : 1));
  }, [stufe]);

  useEffect(() => {
    if (!adultUnlocked) return;
    const timer = window.setTimeout(() => {
      setAdultUnlocked(false);
    }, ADULT_UNLOCK_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [adultUnlocked]);

  const unlockAdult = useCallback(() => {
    setAdultUnlocked(true);
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, adultUnlocked, unlockAdult }),
    [state, adultUnlocked, unlockAdult],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
