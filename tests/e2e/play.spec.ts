import { expect, type Page, test } from '@playwright/test';

async function setupChild(page: Page, age: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kind anlegen' }).click();
  await page.getByRole('button', { name: 'Delfin', exact: true }).click();
  await page.getByRole('button', { name: age, exact: true }).click();
  await page.getByRole('button', { name: 'Kind speichern' }).click();
  await page.getByRole('button', { name: 'Fertig' }).click();
}

const kiko = (page: Page) => page.getByRole('region', { name: 'Kiko sagt' });

async function weiter(page: Page) {
  await kiko(page).getByRole('button', { name: 'Weiter' }).click();
}

async function lay(page: Page, coins: string[]) {
  const palette = page.getByRole('group', { name: 'Münzen zum Hinlegen' });
  for (const coin of coins) await palette.getByRole('button', { name: coin }).click();
}

test('Insel-Station 1 mit einem Fehlversuch komplett spielen', async ({ page }) => {
  await setupChild(page, '7');
  await page.getByRole('button', { name: /Weiter: Muschelstrand/ }).click();
  await page.getByRole('link', { name: "Los geht's!" }).click();

  await page.getByRole('button', { name: '72 Cent' }).click();
  await expect(kiko(page)).toContainText('20-Cent-Münzen, keine 2-Cent-Münzen');
  await kiko(page).getByRole('button', { name: 'Nochmal versuchen' }).click();
  await page.getByRole('button', { name: '90 Cent' }).click();
  await weiter(page);

  await lay(page, ['50-Cent-Münze', '50-Cent-Münze']);
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await weiter(page);

  await page.getByRole('button', { name: 'Anker-Beutel' }).click();
  await weiter(page);

  await page.keyboard.type('3');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.type('60');
  await expect(page.getByText('Deine Antwort: 3,60 €')).toBeVisible();
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await weiter(page);

  for (const coin of ['5 Cent', '10 Cent', '50 Cent', '1 Euro']) {
    await page.getByRole('button', { name: coin, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await weiter(page);

  await expect(page).toHaveURL(/\/station\/muschelstrand\/geschafft$/);
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
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Lege genau 1 € mit den Münzen auf Kikos Tablett.' }),
  ).toBeVisible();
});
