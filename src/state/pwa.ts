import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';

// Service Worker (docs/03 11): Eine neue Version lädt im Hintergrund und wird sofort aktiviert,
// ohne die Seite neu zu laden. Beim nächsten Öffnen läuft dann die neue Version. Nur die
// Druckseite bietet dezent „neu laden“ an, der Kindermodus nie.
// Auf iPhone und iPad startet eine App vom Home-Bildschirm oft gar nicht neu, sondern kommt nur
// aus dem Hintergrund zurück. Deshalb wird dann ebenfalls nach einer neuen Version gesucht.

let waiting = false;
let update: ((reload?: boolean) => Promise<void>) | undefined;
const listeners = new Set<() => void>();

export function startServiceWorker(): void {
  update = registerSW({
    onNeedRefresh() {
      waiting = true;
      // ohne Neuladen aktivieren: das laufende Spiel bleibt, der nächste Start ist aktuell
      void update?.(false);
      listeners.forEach((listener) => {
        listener();
      });
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

/** Die neue (schon aktive) Version sofort laden. */
export function applyUpdate(): void {
  window.location.reload();
}
