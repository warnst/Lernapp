import { expect, test } from '@playwright/test';

// docs/03 10, Punkt 5: Nach dem ersten Laden Netzwerk aus → die App lädt neu und funktioniert.

test('startet offline aus dem Service Worker', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Service Worker in Playwright zuverlässig nur in Chromium');
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // beim ersten Laden übernimmt der Service Worker die Seite erst nach dem Neuladen
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Kind anlegen' }).click();
  await page.getByRole('button', { name: 'Delfin', exact: true }).click();
  await page.getByRole('button', { name: '7', exact: true }).click();
  await page.getByRole('button', { name: 'Kind speichern' }).click();
  await page.getByRole('button', { name: 'Fertig' }).click();
  await page.getByRole('button', { name: /Weiter: Muschelstrand/ }).click();
  await page.getByRole('link', { name: "Los geht's!" }).click();
  await expect(page.getByRole('button', { name: '90 Cent' })).toBeVisible();
  await context.setOffline(false);
});

test('Manifest und Icons für die Installation', async ({ request }) => {
  const manifest = (await (await request.get('/manifest.webmanifest')).json()) as {
    display: string;
    lang: string;
    icons: { src: string; purpose?: string }[];
  };
  expect(manifest.display).toBe('standalone');
  expect(manifest.lang).toBe('de');
  expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
  for (const icon of [...manifest.icons.map((i) => i.src), '/icons/apple-touch-icon-180.png']) {
    expect((await request.get(icon)).ok(), icon).toBe(true);
  }
});
