import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { TEXT_SCALE } from '@/config/display';
import { ADULT_UNLOCK_MS } from './adult-gate';
import { AppContext } from './context';
import { activeProfile } from './progress';
import { type AppAction, appReducer } from './reducer';
import { browserStorage, loadState, saveState } from './storage';
import { mergeStates, pullCloudState, pushCloudState } from './sync';

function isOverwriteAction(action: AppAction): boolean {
  return (
    action.type === 'delete-profile' ||
    action.type === 'reset-progress' ||
    action.type === 'update-profile' ||
    action.type === 'set-unlock-all' ||
    action.type === 'replace'
  );
}

export function AppStateProvider({
  children,
  storage = browserStorage(),
  cloudSync,
}: {
  children: ReactNode;
  storage?: Storage | undefined;
  cloudSync?: boolean | undefined;
}) {
  const [state, rawDispatch] = useReducer(appReducer, storage, loadState);
  const [adultUnlocked, setAdultUnlocked] = useState(false);
  const stateRef = useRef(state);

  const syncEnabled =
    cloudSync ??
    (typeof window !== 'undefined' && storage !== undefined && storage === browserStorage());

  useEffect(() => {
    stateRef.current = state;
    saveState(storage, state);
  }, [storage, state]);

  const dispatch = useCallback(
    (action: AppAction) => {
      const next = appReducer(stateRef.current, action);
      stateRef.current = next;
      rawDispatch(action);
      if (syncEnabled) {
        void pushCloudState(next, isOverwriteAction(action));
      }
    },
    [syncEnabled],
  );

  useEffect(() => {
    if (!syncEnabled) return;
    let cancelled = false;

    const syncFromCloud = async () => {
      const remote = await pullCloudState();
      if (cancelled) return;
      const current = stateRef.current;
      if (!remote) {
        if (current.profiles.length > 0) {
          void pushCloudState(current, false);
        }
        return;
      }
      const merged = mergeStates(current, remote);
      if (JSON.stringify(merged) !== JSON.stringify(current)) {
        stateRef.current = merged;
        rawDispatch({ type: 'replace', state: merged });
      }
      if (JSON.stringify(merged) !== JSON.stringify(remote) && merged.profiles.length > 0) {
        void pushCloudState(merged, false);
      }
    };

    void syncFromCloud();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void syncFromCloud();
      }
    };
    const onOnline = () => {
      void syncFromCloud();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, [syncEnabled]);

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
    [state, dispatch, adultUnlocked, unlockAdult],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
