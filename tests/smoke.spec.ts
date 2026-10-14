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

  await page.screenshot({
    path: testInfo.outputPath(`home-${testInfo.project.name}.png`),
    fullPage: true,
  });

  expect(errors).toEqual([]);
});
