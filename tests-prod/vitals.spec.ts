import { test, expect } from '@playwright/test';

/**
 * Section 11's Core Web Vitals, measured against the production build.
 *
 * Real Lighthouse numbers come from the deployed site in Phase 8; these are the
 * two the brief names explicitly, plus the claim that matters most for the
 * design: the hero text, not the canvas, is the largest paint.
 */
test.use({ reducedMotion: 'no-preference' });

async function vitals(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);

  const measured = await page.evaluate(
    () =>
      new Promise<{ lcp: number; lcpElement: string; cls: number }>((resolve) => {
        let lcp = 0;
        let lcpElement = '';
        let cls = 0;

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const e = entry as PerformanceEntry & { element?: Element; startTime: number };
            lcp = e.startTime;
            lcpElement = e.element ? e.element.tagName : lcpElement;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const e = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
            // Layout shifts right after a real interaction do not count.
            if (!e.hadRecentInput) cls += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });

        // Long enough for the globe to mount and settle, which is exactly when
        // a late shift would show up.
        setTimeout(() => resolve({ lcp, lcpElement, cls }), 6000);
      }),
  );

  return measured;
}

test('home: LCP is the hero text and lands well inside budget', async ({ page }) => {
  const { lcp, lcpElement } = await vitals(page, '/');

  // Section 4: "the hero text must be the LCP element, not the canvas".
  expect(lcpElement).not.toBe('CANVAS');
  // Section 11 allows 2.5s on a mid-range phone; this is a local build on a
  // desktop, so a generous ceiling still catches a real regression.
  expect(lcp).toBeLessThan(2500);

  console.log(`[LCP] ${Math.round(lcp)}ms on <${lcpElement}>`);
});

test('home: the globe mounting causes no layout shift', async ({ page }) => {
  const { cls } = await vitals(page, '/');

  // Section 11: CLS under 0.05. The fallback occupies the canvas's box so the
  // swap moves nothing.
  expect(cls).toBeLessThan(0.05);

  console.log(`[CLS] ${cls.toFixed(4)}`);
});

test('a project page stays light', async ({ page }) => {
  const { lcp, cls } = await vitals(page, '/projects/gatekeeper');

  expect(lcp).toBeLessThan(2000);
  expect(cls).toBeLessThan(0.05);

  console.log(`[detail] LCP ${Math.round(lcp)}ms, CLS ${cls.toFixed(4)}`);
});

test('the globe stops rendering once it scrolls away', async ({ page }) => {
  await page.goto('/');
  await page.locator('canvas').waitFor({ state: 'attached', timeout: 15_000 });
  await page.waitForTimeout(2500);

  // Section 4 asks for rendering to pause when the hero is off-screen, so the
  // globe does not burn a core while someone reads the rest of the page.
  const framesWhileAway = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        document.getElementById('contact')?.scrollIntoView();

        setTimeout(() => {
          const canvas = document.querySelector('canvas') as HTMLCanvasElement;
          const before = canvas.toDataURL().length;

          setTimeout(() => {
            const after = (document.querySelector('canvas') as HTMLCanvasElement).toDataURL()
              .length;
            // Identical readback twice over a second means nothing redrew.
            resolve(before === after ? 0 : 1);
          }, 1200);
        }, 1200);
      }),
  );

  expect(framesWhileAway).toBe(0);
});
