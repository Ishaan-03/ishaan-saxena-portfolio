import { test, expect } from '@playwright/test';

/**
 * Phase 0 smoke test. Grows each phase: locales, CV link and form validation
 * get added as those parts are built.
 */
test('home page loads and the browser console is clean', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  // No screenshot here. This test is about the console, and Playwright hides
  // the text caret by injecting `caret-color: transparent` into form fields,
  // which React reports as a hydration mismatch if it lands mid-hydration.
  // Captures belong to screenshots.spec.ts, which passes caret: 'initial'.

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

/**
 * Guards the bug that shipped through three phases unnoticed: the hero was
 * animated in with motion's `animate` prop, which writes opacity:0 into the
 * server HTML and relies on a mount animation firing. It did not fire, so the
 * headline, subtitle, buttons, cards and stats bar were invisible in a real
 * browser.
 *
 * Every screenshot test forces prefers-reduced-motion for deterministic
 * captures, and under reduced motion the final state renders immediately. That
 * is exactly why nothing caught it. This test runs with motion ENABLED.
 */
test.describe('hero is visible with motion enabled', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('nothing in the hero is stuck at opacity 0', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const hidden = await page.evaluate(() => {
      const hero = document.querySelector('#top');
      if (!hero) return ['#top is missing'];

      return [...hero.querySelectorAll('h1, p, a, button, div')]
        .filter((el) => {
          const style = getComputedStyle(el);
          if (Number(style.opacity) > 0.01) return false;
          // Ignore things that are meant to be invisible or are not rendered.
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && el.textContent?.trim();
        })
        .map((el) => `${el.tagName}: ${el.textContent?.trim().slice(0, 40)}`);
    });

    expect(hidden).toEqual([]);
  });

  test('the headline is actually painted', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS('opacity', '1');
  });
});
