import { expect, type Page, test } from '@playwright/test';
import { playMuschelstrand, weiter } from './helpers.ts';

async function setupChild(page: Page, age: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kind anlegen' }).click();
  await page.getByRole('button', { name: 'Delfin', exact: true }).click();
  await page.getByRole('button', { name: age, exact: true }).click();
  await page.getByRole('button', { name: 'Kind speichern' }).click();
  await page.getByRole('button', { name: 'Fertig' }).click();
}

test('Insel-Station 1 mit einem Fehlversuch komplett spielen', async ({ page }) => {
  await setupChild(page, '7');
  await page.getByRole('button', { name: /Weiter: Muschelstrand/ }).click();
  await page.getByRole('link', { name: "Los geht's!" }).click();

  await playMuschelstrand(page, true);
  await page.goto('/');
  await expect(page.getByRole('img', { name: '1 von 9 Sternen' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Station 2: Markt am Palmenstrand, als Nächstes/ }),
  ).toBeVisible();
});

test('Fortsetzen nach dem Neuladen', async ({ page }) => {
  await setupChild(page, '7');
  await page.goto('/station/muschelstrand');
  await page.getByRole('button', { name: '90 Cent' }).click();
  await weiter(page);
  // erst neu laden, wenn die Stelle gespeichert ist
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('schatzinsel.state.v2') ?? ''))
    .toContain('"resume"');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Lege genau 1 € mit den Münzen auf Kikos Tablett.' }),
  ).toBeVisible();
});
