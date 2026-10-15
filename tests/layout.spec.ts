import { test, expect } from '@playwright/test';

/**
 * Layout regressions that only show up in a longer language.
 *
 * Two real bugs are guarded here. Base element styles in globals.css were
 * unlayered, so a bare `h2 { font-size }` beat Tailwind's `text-[15px]`: hero
 * card titles rendered at 48px, the cards grew tall enough to overlap, and long
 * French words were clipped by the card's own overflow. And the floating cards
 * sat at fixed offsets measured against English, so longer text collided.
 */
test.use({ reducedMotion: 'reduce' });

const WIDTHS = [1024, 1280, 1440, 1920];
const LOCALES = [
  { code: 'en', path: '/' },
  { code: 'fr', path: '/fr' },
  { code: 'es', path: '/es' },
  { code: 'hi', path: '/hi' },
];

type Card = { left: number; right: number; top: number; bottom: number; clipped: boolean };

async function floatingCards(page: import('@playwright/test').Page): Promise<Card[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('#top .lg\\:block [class*="pointer-events-auto"]')].map(
      (node) => {
        const rect = node.getBoundingClientRect();
        const heading = node.querySelector('h2') as HTMLElement | null;
        const body = node.querySelector('p, div > div') as HTMLElement | null;
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          // Horizontal clipping inside the card, which `overflow-hidden` hides.
          clipped:
            (heading ? heading.scrollWidth > heading.clientWidth + 1 : false) ||
            (body ? body.scrollWidth > body.clientWidth + 1 : false),
        };
      },
    ),
  );
}

for (const locale of LOCALES) {
  test(`${locale.code}: hero cards never overlap or clip`, async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(locale.path);
      await page.waitForTimeout(700);

      const cards = await floatingCards(page);
      if (cards.length === 0) continue; // below the lg breakpoint

      const sorted = (side: 'left' | 'right') =>
        cards
          .filter((c) => (side === 'left' ? c.left < width / 2 : c.left >= width / 2))
          .sort((a, b) => a.top - b.top);

      for (const side of ['left', 'right'] as const) {
        const column = sorted(side);
        for (let i = 1; i < column.length; i++) {
          expect(
            column[i].top,
            `${locale.code} at ${width}px: ${side} cards overlap`,
          ).toBeGreaterThanOrEqual(column[i - 1].bottom);
        }
      }

      expect(
        cards.filter((c) => c.clipped),
        `${locale.code} at ${width}px: text clipped inside a card`,
      ).toEqual([]);

      expect(
        cards.filter((c) => c.left < 0 || c.right > width),
        `${locale.code} at ${width}px: a card is off screen`,
      ).toEqual([]);
    }
  });
}

test('utility classes beat the base element styles', async ({ page }) => {
  await page.goto('/fr');
  await page.waitForTimeout(800);

  // The exact failure that started this: a card title carrying text-[15px]
  // must actually be 15px, not whatever the bare h2 rule says.
  const sizes = await page.evaluate(() => {
    const heroTitle = document.querySelector('#top .lg\\:block h2');
    const sectionTitle = document.querySelector('#about h2');
    return {
      heroCard: heroTitle ? getComputedStyle(heroTitle).fontSize : null,
      sectionHeading: sectionTitle ? getComputedStyle(sectionTitle).fontSize : null,
    };
  });

  expect(sizes.heroCard).toBe('15px');
  // The section heading has no size utility, so it keeps the base scale.
  expect(parseFloat(sizes.sectionHeading!)).toBeGreaterThan(30);
});
