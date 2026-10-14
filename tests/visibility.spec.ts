import { test, expect } from '@playwright/test';

/**
 * Runs with motion ENABLED, unlike the screenshot tests which force
 * prefers-reduced-motion for deterministic captures. Reduced motion renders
 * every final state immediately, so those tests can never catch content that
 * is stuck invisible waiting on an animation.
 */
test.use({ reducedMotion: 'no-preference' });

const SECTIONS = [
  'top',
  'about',
  'projects',
  'skills',
  'experience',
  'certificates',
  'internship',
  'contact',
];

async function hiddenTextIn(page: import('@playwright/test').Page, id: string) {
  return page.evaluate((anchor) => {
    const root = document.getElementById(anchor);
    if (!root) return [`#${anchor} is missing`];

    return [...root.querySelectorAll('h1, h2, h3, p, li, a, button')]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        if (!el.textContent?.trim()) return false;

        // Walk up: an invisible ancestor hides this element too.
        let node: Element | null = el;
        while (node && node !== document.body) {
          if (Number(getComputedStyle(node).opacity) < 0.01) return true;
          node = node.parentElement;
        }
        return false;
      })
      .map((el) => `${el.tagName}: ${el.textContent!.trim().slice(0, 45)}`);
  }, id);
}

for (const id of SECTIONS) {
  test(`#${id} has no content stuck invisible`, async ({ page }) => {
    await page.goto('/');

    // Scroll through the whole section, not just to its top. Scroll reveals are
    // supposed to hold content invisible until it enters the viewport, so
    // checking a tall section from its heading alone would fail on content that
    // is correctly still waiting its turn.
    const [top, bottom] = await page.evaluate((anchor) => {
      const el = document.getElementById(anchor)!;
      const box = el.getBoundingClientRect();
      return [box.top + window.scrollY, box.bottom + window.scrollY];
    }, id);

    for (let y = top - 200; y < bottom + 200; y += 400) {
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(1200);

    expect(await hiddenTextIn(page, id)).toEqual([]);
  });
}

test('the whole page has no invisible text after a full scroll', async ({ page }) => {
  await page.goto('/');

  // Walk down the page, as a reader would.
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1200);

  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('main h1, main h2, main h3, main p, main li')]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        if (!el.textContent?.trim()) return false;
        let node: Element | null = el;
        while (node && node !== document.body) {
          if (Number(getComputedStyle(node).opacity) < 0.01) return true;
          node = node.parentElement;
        }
        return false;
      })
      .map((el) => `${el.tagName}: ${el.textContent!.trim().slice(0, 45)}`),
  );

  expect(hidden).toEqual([]);
});
