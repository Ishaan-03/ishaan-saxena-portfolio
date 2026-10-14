import { test } from '@playwright/test';

/**
 * Review screenshots at the two sizes in the brief: 1440x900 and 390x844.
 * Run with `npx playwright test screenshots` and look in test-results/.
 */
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'styleguide', path: '/styleguide' },
];

for (const page of PAGES) {
  test(`${page.name} screenshot`, async ({ page: browserPage }, testInfo) => {
    await browserPage.goto(page.path);
    // Let fonts settle so text does not shift mid-capture.
    await browserPage.evaluate(() => document.fonts.ready);
    await browserPage.waitForTimeout(400);

    await browserPage.screenshot({
      path: testInfo.outputPath(`${page.name}-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });
}

test('mobile menu sheet opens', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');

  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: testInfo.outputPath('mobile-menu.png') });
});

test('navbar turns to glass after scrolling', async ({ page }, testInfo) => {
  await page.goto('/styleguide');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);

  await page.screenshot({
    path: testInfo.outputPath(`navbar-scrolled-${testInfo.project.name}.png`),
    clip: { x: 0, y: 0, width: testInfo.project.use.viewport!.width, height: 200 },
  });
});
