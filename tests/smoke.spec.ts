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

test('certificates section is reachable and complete', async ({ page }) => {
  await page.goto('/');

  // The navbar link must land somewhere. It previously pointed at a section
  // that did not exist yet.
  const target = page.locator('#certificates');
  await expect(target).toHaveCount(1);

  await page.getByRole('navigation').getByRole('link', { name: 'Certificates' }).first().click();
  await page.waitForTimeout(600);
  expect(page.url()).toContain('#certificates');

  // Every credential gets its own card, including all nine Google ones.
  await expect(target.getByRole('listitem')).toHaveCount(15);
  await expect(target.getByText('Google · Coursera')).toHaveCount(9);
});

test('certificate viewer opens, navigates and closes with the keyboard', async ({ page }) => {
  await page.goto('/#certificates');
  await page.waitForTimeout(500);

  await page.locator('#certificates li button').first().click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Google Cybersecurity Professional Certificate');

  // Arrow keys walk the filtered list.
  await page.keyboard.press('ArrowRight');
  await expect(dialog).toContainText('AWS Cloud Practitioner Essentials');

  // A course is never presented as a certification.
  await expect(dialog).toContainText('Course');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('filter chips narrow the grid', async ({ page }) => {
  await page.goto('/#certificates');
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: /^Cloud/ }).click();
  await expect(page.locator('#certificates li')).toHaveCount(1);

  await page.getByRole('button', { name: /^All/ }).click();
  await expect(page.locator('#certificates li')).toHaveCount(15);
});
