import { expect, type Page } from '@playwright/test';

// Gemeinsame Schritte der E2E-Tests.

const kiko = (page: Page) => page.getByRole('region', { name: 'Kiko sagt' });

export async function weiter(page: Page) {
  await kiko(page).getByRole('button', { name: 'Weiter' }).click();
}

async function lay(page: Page, coins: string[]) {
  const palette = page.getByRole('group', { name: 'Münzen zum Hinlegen' });
  for (const coin of coins) await palette.getByRole('button', { name: coin }).click();
}

/** Insel-Station 1 mit den Originalaufgaben richtig lösen (ab der Stationskarte). */
export async function playMuschelstrand(page: Page, withMistake = false) {
  if (withMistake) {
    await page.getByRole('button', { name: '72 Cent' }).click();
    await expect(kiko(page)).toContainText('20-Cent-Münzen, keine 2-Cent-Münzen');
    await kiko(page).getByRole('button', { name: 'Nochmal versuchen' }).click();
  }
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
}
