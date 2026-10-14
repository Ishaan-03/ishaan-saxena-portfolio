import { test } from '@playwright/test';

/**
 * Review screenshots at the two sizes in the brief: 1440x900 and 390x844.
 *
 * These run with reduced motion forced on. That is not a workaround: the globe
 * renders a single frame under prefers-reduced-motion by design (section 4), so
 * the capture is deterministic and it exercises the reduced-motion path at the
 * same time. Screenshotting a continuously animating WebGL canvas otherwise
 * times out waiting for the page to settle.
 */
test.use({ reducedMotion: 'reduce' });

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'styleguide', path: '/styleguide' },
];

/** Waits for the globe to have drawn, or gives up if it never appears. */
async function settle(page: import('@playwright/test').Page) {
  await page.evaluate(() => document.fonts.ready);
  await page
    .waitForFunction(
      () => {
        const canvas = document.querySelector('canvas');
        return !canvas || canvas.width > 0;
      },
      { timeout: 8000 },
    )
    .catch(() => {});
  await page.waitForTimeout(1200);
}

for (const page of PAGES) {
  test(`${page.name} screenshot`, async ({ page: browserPage }, testInfo) => {
    await browserPage.goto(page.path);
    await settle(browserPage);

    await browserPage.screenshot({
      path: testInfo.outputPath(`${page.name}-${testInfo.project.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}

test('hero above the fold', async ({ page }, testInfo) => {
  await page.goto('/');
  await settle(page);

  await page.screenshot({
    path: testInfo.outputPath(`hero-fold-${testInfo.project.name}.png`),
    animations: 'disabled',
  });
});

test('mobile menu sheet opens', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');

  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: testInfo.outputPath('mobile-menu.png'), animations: 'disabled' });
});

test('navbar turns to glass after scrolling', async ({ page }, testInfo) => {
  await page.goto('/styleguide');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);

  await page.screenshot({
    path: testInfo.outputPath(`navbar-scrolled-${testInfo.project.name}.png`),
    clip: { x: 0, y: 0, width: testInfo.project.use.viewport!.width, height: 200 },
    animations: 'disabled',
  });
});
