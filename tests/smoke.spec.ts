import { test, expect } from '@playwright/test';

/**
 * Phase 0 smoke test. Grows each phase: locales, CV link and form validation
 * get added as those parts are built.
 */
test('home page loads and the browser console is clean', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  // Viewport, not fullPage: Chromium stops painting backdrop-filter when the
  // viewport is stretched to a 7000px document, which empties every glass panel.
  await page.screenshot({ path: testInfo.outputPath(`home-${testInfo.project.name}.png`) });

  expect(errors).toEqual([]);
});

const PROJECT_SLUGS = [
  'gatekeeper',
  'northbeam-lite',
  'vpc',
  'data-protection',
  'detection',
] as const;

for (const slug of PROJECT_SLUGS) {
  test(`project detail page renders: ${slug}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    const response = await page.goto(`/projects/${slug}`);
    expect(response?.status()).toBe(200);

    // A missing message renders as its own key path, which must never ship.
    await expect(page.locator('body')).not.toContainText('projects.items.');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    expect(errors).toEqual([]);
  });
}

test('hero cards link to project anchors that exist', async ({ page }) => {
  await page.goto('/');

  for (const slug of PROJECT_SLUGS) {
    await expect(page.locator(`#project-${slug}`)).toHaveCount(1);
  }
});
