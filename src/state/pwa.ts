import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';

// Service Worker (docs/03 11): Eine neue Version lädt im Hintergrund und wird beim nächsten
// App-Start aktiv. Nur die Druckseite bietet dezent „neu laden“ an, der Kindermodus nie.

let waiting = false;
let update: ((reload?: boolean) => Promise<void>) | undefined;
const listeners = new Set<() => void>();

export function startServiceWorker(): void {
  update = registerSW({
    onNeedRefresh() {
      waiting = true;
      listeners.forEach((listener) => {
        listener();
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

/** Neue Version sofort aktivieren und die Seite neu laden. */
export function applyUpdate(): void {
  void update?.(true);
}
