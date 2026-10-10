// Erzeugt die PWA-Icons aus public/app-icon.svg (docs/03 11). Aufruf: npm run icons
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from '@playwright/test';

const svg = await readFile(new URL('../public/app-icon.svg', import.meta.url), 'utf8');
const ICONS = [
  // inner: Inhalt in Prozent (maskable: sichere Zone 80 %), radius: runde Ecken in Prozent
  { file: 'icon-192.png', size: 192, inner: 100, radius: 22 },
  { file: 'icon-512.png', size: 512, inner: 100, radius: 22 },
  { file: 'maskable-512.png', size: 512, inner: 80, radius: 0 },
  { file: 'apple-touch-icon-180.png', size: 180, inner: 100, radius: 0 },
];

const browser = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {},
);
const page = await browser.newPage();
for (const { file, size, inner, radius } of ICONS) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">
      <div style="width:${String(size)}px;height:${String(size)}px;display:grid;place-items:center;background:#0F7F88;border-radius:${String(radius)}%;overflow:hidden">
        <div style="width:${String(inner)}%;height:${String(inner)}%">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
      </div></body></html>`,
  );
  await page.screenshot({
    path: new URL(`../public/icons/${file}`, import.meta.url).pathname,
    omitBackground: true,
  });
}
await browser.close();
