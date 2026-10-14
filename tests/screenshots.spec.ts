import { test } from '@playwright/test';

/**
 * Review screenshots at the two sizes in the brief: 1440x900 and 390x844.
 *
 * These run with reduced motion forced on. That is not a workaround: the globe
 * renders a single frame under prefers-reduced-motion by design (section 4), so
 * the capture is deterministic and it exercises the reduced-motion path at the
 * same time. Screenshotting a continuously animating WebGL canvas otherwise
 * times out waiting for the page to settle.
 *
 * The home page is captured section by section rather than with `fullPage`.
 * A fullPage capture resizes the viewport to the whole document, and Chromium
 * stops painting `backdrop-filter` at that height, so every glass panel comes
 * out empty. Nothing is wrong with the page; no real viewport is 7000px tall.
 */
test.use({ reducedMotion: 'reduce' });

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
  await page.waitForTimeout(1000);
}

const SECTIONS = ['about', 'projects', 'skills', 'experience'];

test('home, section by section', async ({ page }, testInfo) => {
  await page.goto('/');
  await settle(page);

  await page.screenshot({
    path: testInfo.outputPath(`home-01-hero-${testInfo.project.name}.png`),
    animations: 'disabled',
  });

  for (const [index, id] of SECTIONS.entries()) {
    await page.evaluate((anchor) => {
      document.getElementById(anchor)?.scrollIntoView({ block: 'start' });
    }, id);
    await page.waitForTimeout(700);

    await page.screenshot({
      path: testInfo.outputPath(`home-0${index + 2}-${id}-${testInfo.project.name}.png`),
      animations: 'disabled',
    });
  }
});

const PAGES = [
  { name: 'styleguide', path: '/styleguide' },
  { name: 'project-gatekeeper', path: '/projects/gatekeeper' },
  { name: 'project-detection', path: '/projects/detection' },
];

for (const target of PAGES) {
  test(`${target.name} screenshot`, async ({ page }, testInfo) => {
    await page.goto(target.path);
    await settle(page);

    await page.screenshot({
      path: testInfo.outputPath(`${target.name}-${testInfo.project.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}

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
