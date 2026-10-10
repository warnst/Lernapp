import type { RegisterSWOptions } from 'vite-plugin-pwa/types';

// Ersatz für `virtual:pwa-register` in Vitest: kein Service Worker. Die Optionen werden
// gemerkt, damit Tests die Rückrufe auslösen können.
export const registered: RegisterSWOptions[] = [];

export function registerSW(options: RegisterSWOptions = {}): (reload?: boolean) => Promise<void> {
  registered.push(options);
  return () => Promise.resolve();
}
