import { expect, test } from '@playwright/test';

test('Startseite: deutsch, Sand-Hintergrund, Andika-Schrift, Einrichtung', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 249, 239)');
  await expect(page.locator('body')).toHaveCSS('font-family', /^Andika/);
  const andikaLoaded = await page.evaluate(async () => {
    await document.fonts.load('20px Andika');
    return document.fonts.check('20px Andika');
  });
  expect(andikaLoaded).toBe(true);
  await expect(page.getByText(/Richten wir kurz ein, wer spielt/)).toBeVisible();
});
