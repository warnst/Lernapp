// Ersatz für `virtual:pwa-register` in Vitest: kein Service Worker.
export function registerSW(): (reload?: boolean) => Promise<void> {
  return () => Promise.resolve();
}
