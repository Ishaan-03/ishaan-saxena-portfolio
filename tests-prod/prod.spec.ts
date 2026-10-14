import { test, expect } from '@playwright/test';

test('production hero', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
    if (m.type() === 'warning' && !m.text().includes('GL Driver Message')) warnings.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3500);

  await page.screenshot({
    path: testInfo.outputPath(`prod-hero-${testInfo.project.name}.png`),
    animations: 'disabled',
  });
  await page.screenshot({
    path: testInfo.outputPath(`prod-full-${testInfo.project.name}.png`),
    fullPage: true,
    animations: 'disabled',
  });

  console.log(`[${testInfo.project.name}] errors:`, JSON.stringify(errors));
  console.log(`[${testInfo.project.name}] warnings:`, JSON.stringify(warnings));
  expect(errors).toEqual([]);
});

test('production project detail page', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/projects/gatekeeper');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);

  // A missing message renders as its own key path. It must never reach prod.
  await expect(page.locator('body')).not.toContainText('projects.items.');

  console.log(`[${testInfo.project.name}] detail errors:`, JSON.stringify(errors));
  expect(errors).toEqual([]);
});
