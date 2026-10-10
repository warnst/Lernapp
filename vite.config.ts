import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    // docs/03 Abschnitt 11: offline, Updates erst beim nächsten Start (nie mitten in einer Station)
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon-180.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
      manifest: {
        name: 'Mathe-Abenteuer – Die geheime Schatzinsel',
        short_name: 'Schatzinsel',
        description:
          'Rechnen mit Geld, Sachaufgaben und Rätsel als Abenteuer mit dem Papagei Kiko.',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFF9EF',
        theme_color: '#0F7F88',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    // das virtuelle Modul gibt es nur im Vite-Build
    alias: {
      'virtual:pwa-register': fileURLToPath(new URL('./src/test/pwa-register.ts', import.meta.url)),
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
      reporter: ['text', 'html'],
      thresholds: {
        lines: 80,
        'src/domain/**': { lines: 100, branches: 100 },
      },
    },
  },
});
