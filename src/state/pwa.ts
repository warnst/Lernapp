import { useEffect, useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';

// Service Worker (docs/03 11): Eine neue Version lädt im Hintergrund und wird sofort aktiviert.
// Neu geladen wird die Seite nur, wenn gerade keine Aufgabe läuft: sofort auf Karte, Üben-Auswahl
// und Schätzen, sonst beim nächsten Wechsel des Bildschirms. So kommt die neue Version ohne
// Zutun an, und kein Kind verliert eine halb gelöste Aufgabe.
// Auf iPhone und iPad startet eine App vom Home-Bildschirm oft gar nicht neu, sondern kommt nur
// aus dem Hintergrund zurück. Deshalb wird dann ebenfalls nach einer neuen Version gesucht.

let waiting = false;
let update: ((reload?: boolean) => Promise<void>) | undefined;
const listeners = new Set<() => void>();

/** Bildschirme, auf denen gerade eine Aufgabe oder ein Rätsel läuft. */
export function isBusy(path: string): boolean {
  return (
    path.startsWith('/station/') ||
    path.startsWith('/ueben/spiel') ||
    (path.startsWith('/raetsel/') && path !== '/raetsel/kiko')
  );
}

function reload(): void {
  window.location.reload();
}

/** Neue Version ist aktiv: jetzt neu laden oder auf den nächsten Bildschirmwechsel warten. */
export function onNewVersion(path: string = window.location.pathname): void {
  waiting = true;
  listeners.forEach((listener) => {
    listener();
  });
  if (!isBusy(path)) reload();
}

export function startServiceWorker(): void {
  update = registerSW({
    onNeedRefresh() {
      void update?.();
    },
    onNeedReload() {
      onNewVersion();
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible')
          void registration.update().catch(() => undefined);
      });
    },
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** true, wenn eine neue Version bereitliegt. */
export function useUpdateWaiting(): boolean {
  return useSyncExternalStore(subscribe, () => waiting);
}

/** Wartet eine neue Version, lädt der nächste Bildschirmwechsel sie. */
export function useReloadOnNavigate(path: string): void {
  useEffect(() => {
    if (waiting) reload();
  }, [path]);
}

/** Die neue (schon aktive) Version sofort laden. */
export function applyUpdate(): void {
  reload();
}
