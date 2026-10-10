import { expect, type Page, test } from '@playwright/test';
import { playMuschelstrand } from './helpers.ts';

async function addChild(page: Page, animal: string, age: string, name?: string) {
  if (name) await page.getByLabel('Name (optional)').fill(name);
  await page.getByRole('button', { name: animal, exact: true }).click();
  await page.getByRole('button', { name: age, exact: true }).click();
  await page.getByRole('button', { name: 'Kind speichern' }).click();
}

test('zwei Kinder: Bucht und Insel, Fortschritt bleibt nach dem Neuladen, Erwachsenen-Frage schützt', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kind anlegen' }).click();
  await addChild(page, 'Robbe', '5', 'Mila');
  await page.getByRole('button', { name: 'Noch ein Kind hinzufügen' }).click();
  await addChild(page, 'Pinguin', '7', 'Ben');
  await page.getByRole('button', { name: 'Fertig' }).click();

  await expect(page.getByRole('heading', { name: 'Wer spielt?' })).toBeVisible();
  await page.getByRole('button', { name: 'Mila' }).click();
  await expect(page.getByRole('button', { name: /Station 1: Das Muschelufer/ })).toBeVisible();
  await expect(page.getByRole('img', { name: '0 von 5 Sternen' })).toBeVisible();

  await page.getByRole('link', { name: /Wer spielt\? \(Mila\)/ }).click();
  await page.getByRole('button', { name: 'Ben' }).click();
  await expect(page.getByRole('button', { name: /Station 1: Muschelstrand/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: /Station 1: Muschelstrand/ })).toBeVisible();
  await expect(page.getByText("Hallo Ben! Wohin geht's heute?")).toBeVisible();

  await page.getByRole('link', { name: 'Für Erwachsene' }).click();
  await expect(page.getByRole('heading', { name: 'Kinder' })).toHaveCount(0);
  await page.getByRole('textbox').fill('1');
  await page.getByRole('button', { name: 'Öffnen' }).click();
  await expect(
    page.getByText('Das Ergebnis passt nicht. Bitte noch einmal rechnen.'),
  ).toBeVisible();

  const question = (await page.getByText(/Wie viel ist/).textContent()) ?? '';
  const [, a = '0', b = '0'] = /(\d+) × (\d+)/.exec(question) ?? [];
  await page.getByRole('textbox').fill(String(Number(a) * Number(b)));
  await page.getByRole('button', { name: 'Öffnen' }).click();
  await expect(page.getByRole('heading', { name: 'Kinder' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Mila/ })).toBeVisible();
});

test('Stationskarte öffnet sich über den Weiter-Knopf', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kind anlegen' }).click();
  await addChild(page, 'Delfin', '7');
  await page.getByRole('button', { name: 'Fertig' }).click();
  await page.getByRole('button', { name: /Weiter: Muschelstrand/ }).click();
  const sheet = page.getByRole('dialog', { name: 'Station 1 · Muschelstrand' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('link', { name: "Los geht's!" })).toHaveAttribute(
    'href',
    '/station/muschelstrand',
  );
  await sheet.getByRole('button', { name: 'Schließen' }).click();
  await expect(sheet).toHaveCount(0);
});

test('Fortschritte zweier Kinder bleiben getrennt', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Kind anlegen' }).click();
  await addChild(page, 'Pinguin', '7', 'Ben');
  await page.getByRole('button', { name: 'Noch ein Kind hinzufügen' }).click();
  await addChild(page, 'Robbe', '8', 'Lea');
  await page.getByRole('button', { name: 'Fertig' }).click();

  await page.getByRole('button', { name: 'Ben' }).click();
  await page.getByRole('button', { name: /Weiter: Muschelstrand/ }).click();
  await page.getByRole('link', { name: "Los geht's!" }).click();
  await playMuschelstrand(page);
  await page.goto('/');
  await expect(page.getByRole('img', { name: '1 von 9 Sternen' })).toBeVisible();

  await page.getByRole('link', { name: /Wer spielt\? \(Ben\)/ }).click();
  await page.getByRole('button', { name: 'Lea' }).click();
  await expect(page.getByRole('img', { name: '0 von 9 Sternen' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Station 1: Muschelstrand, als Nächstes/ }),
  ).toBeVisible();

  await page.reload();
  await page.getByRole('link', { name: /Wer spielt\? \(Lea\)/ }).click();
  await page.getByRole('button', { name: 'Ben' }).click();
  await expect(page.getByRole('img', { name: '1 von 9 Sternen' })).toBeVisible();
});
