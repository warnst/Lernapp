import { expect, type Page, test } from '@playwright/test';

// Druck (docs/06 8, docs/03 10): Druckvorschau mit Aufgaben und Lösungsblatt, 1–2 Seiten pro Station.

async function openPrint(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kind anlegen' }).click();
  await page.getByRole('button', { name: 'Delfin', exact: true }).click();
  await page.getByRole('button', { name: '7', exact: true }).click();
  await page.getByRole('button', { name: 'Kind speichern' }).click();
  await page.getByRole('button', { name: 'Fertig' }).click();
  await page.getByRole('link', { name: 'Für Erwachsene' }).click();
  const question = (await page.getByText(/Wie viel ist/).textContent()) ?? '';
  const [, a = '0', b = '0'] = /(\d+) × (\d+)/.exec(question) ?? [];
  await page.getByRole('textbox').fill(String(Number(a) * Number(b)));
  await page.getByRole('button', { name: 'Öffnen' }).click();
  await page.getByRole('link', { name: /Arbeitsblätter und Urkunden drucken/ }).click();
  await expect(page.getByRole('heading', { name: 'Arbeitsblätter drucken' })).toBeVisible();
}

/** Wechselt die Auswahl ohne Neuladen (die Erwachsenen-Frage gilt nur bis zum Neuladen). */
async function select(page: Page, query: string) {
  await page.evaluate((q) => {
    history.pushState(null, '', `/erwachsene/drucken?${q}`);
    dispatchEvent(new PopStateEvent('popstate'));
  }, query);
  await page.locator('article').first().waitFor();
}

async function pdfPages(page: Page): Promise<number> {
  await page.emulateMedia({ media: 'print' });
  const pdf = await page.pdf({ format: 'A4' });
  await page.emulateMedia({ media: 'screen' });
  return (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
}

test('Station 1 mit Lösungen: Aufgaben und Lösungsblatt in der Druckansicht', async ({ page }) => {
  await openPrint(page);
  await page.getByRole('checkbox', { name: 'Station 1 · Muschelstrand' }).check();
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('heading', { name: 'Station 1 · Muschelstrand' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lösungen für Erwachsene' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Drucken' })).toBeHidden();
});

test('jede Station passt auf 1–2 A4-Seiten', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'page.pdf() gibt es nur in Chromium');
  test.setTimeout(120_000);
  await openPrint(page);
  for (const [stufe, count] of [
    [1, 5],
    [2, 9],
    [3, 9],
    [4, 9],
  ] as const) {
    for (let station = 1; station <= count; station++) {
      await select(page, `stufe=${String(stufe)}&stationen=${String(station)}&loesungen=0`);
      const pages = await pdfPages(page);
      expect(pages, `Stufe ${String(stufe)}, Station ${String(station)}`).toBeGreaterThanOrEqual(1);
      expect(pages, `Stufe ${String(stufe)}, Station ${String(station)}`).toBeLessThanOrEqual(2);
    }
  }
});
