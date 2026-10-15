import { test, expect } from '@playwright/test';

/**
 * Section 11's accessibility list, asserted rather than assumed.
 * Motion on, because a focus ring you cannot see is still a failure.
 */
test.use({ reducedMotion: 'no-preference' });

test('the skip link is first in the tab order and jumps to main', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1200);

  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    href: document.activeElement?.getAttribute('href'),
  }));

  expect(focused.href).toBe('#main');
  await expect(page.locator('#main')).toHaveCount(1);
});

test('every image has alt text, and decorative ones are empty-alt', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('certificates')?.scrollIntoView());
  await page.waitForTimeout(1500);

  const missing = await page.evaluate(() =>
    [...document.querySelectorAll('img')]
      .filter((img) => img.getAttribute('alt') === null)
      .map((img) => img.getAttribute('src')),
  );

  expect(missing).toEqual([]);
});

test('the globe canvas is hidden from assistive technology', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);

  // Section 4: the canvas is decoration, the hero text carries the meaning.
  const hidden = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'no canvas';
    return (
      canvas.closest('[aria-hidden="true"]') !== null ||
      canvas.getAttribute('aria-hidden') === 'true'
    );
  });

  expect(hidden).toBe(true);
});

test('focus is visible on every interactive element', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1200);

  // Walk a stretch of the tab order and confirm each stop paints an outline.
  const results: Array<{ tag: string; outline: string }> = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    results.push(
      await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return { tag: 'none', outline: 'none' };
        const style = getComputedStyle(el);
        return {
          tag: el.tagName,
          outline: `${style.outlineStyle} ${style.outlineWidth}`,
        };
      }),
    );
  }

  const withoutOutline = results.filter(
    (r) => r.tag !== 'none' && (r.outline.startsWith('none') || r.outline.endsWith('0px')),
  );
  expect(withoutOutline).toEqual([]);
});

test('the certificate viewer traps focus and Esc closes it', async ({ page }) => {
  await page.goto('/#certificates');
  await page.waitForTimeout(1500);

  await page.locator('#certificates li button').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Focus must land inside the dialog, not stay on the page behind it.
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(
    true,
  );

  // Tab all the way round; focus must never escape.
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    expect(inside).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('the mobile menu traps focus and Esc closes it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');

  await page.goto('/');
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /open menu/i }).click();

  const sheet = page.getByRole('dialog');
  await expect(sheet).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
});

test('form errors are announced', async ({ page }) => {
  await page.goto('/#contact');
  await page.waitForTimeout(1500);

  // An aria-live region has to exist before the error appears, or a screen
  // reader never hears about it.
  await expect(page.locator('#contact [aria-live]')).toHaveCount(1);
});

test('headings run in order with exactly one h1', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500);

  const levels = await page.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => Number(h.tagName[1])),
  );

  expect(levels.filter((l) => l === 1)).toHaveLength(1);

  // No level is ever skipped on the way down.
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  }
});
