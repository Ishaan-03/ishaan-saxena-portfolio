import { test, expect } from '@playwright/test';

/**
 * Section 7 of the brief. Runs with motion on, like the visibility suite: a
 * translated string that never becomes visible is still a broken page.
 */
test.use({ reducedMotion: 'no-preference' });

const LOCALES = [
  { code: 'en', path: '/', sample: 'Build it. Break it.' },
  { code: 'fr', path: '/fr', sample: 'Construire. Casser.' },
  { code: 'es', path: '/es', sample: 'Construir. Romper.' },
  { code: 'hi', path: '/hi', sample: 'बनाओ। तोड़ो।' },
];

for (const locale of LOCALES) {
  test(`${locale.code}: renders, sets lang, and shows no raw keys`, async ({ page }) => {
    const response = await page.goto(locale.path);
    expect(response?.status()).toBe(200);

    await expect(page.locator('html')).toHaveAttribute('lang', locale.code);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(locale.sample);

    // A missing message renders as its own dotted key path.
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(
      /\b(hero|about|projects|certificates|contact|internship)\.[a-zA-Z]+\./,
    );
  });

  test(`${locale.code}: nothing overflows horizontally`, async ({ page }) => {
    await page.goto(locale.path);

    // French and Spanish run 20 to 30% longer than English, so this is the
    // check that matters most for them.
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 800) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(100);
    }

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
}

test('hi: Devanagari font is loaded and lines have room', async ({ page }) => {
  await page.goto('/hi');

  const measured = await page.evaluate(() => {
    const paragraph = document.querySelector('#about p')!;
    const style = getComputedStyle(paragraph);
    return {
      family: style.fontFamily,
      lineHeight: parseFloat(style.lineHeight),
      fontSize: parseFloat(style.fontSize),
    };
  });

  expect(measured.family.toLowerCase()).toContain('devanagari');
  // Devanagari matras need more vertical room than Latin's usual 1.6.
  expect(measured.lineHeight / measured.fontSize).toBeGreaterThanOrEqual(1.7);
});

test('en: Devanagari is not shipped where it is not read', async ({ page }) => {
  await page.goto('/');
  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family.toLowerCase()).not.toContain('devanagari');
});

test('the switcher moves between locales and keeps the page', async ({ page }) => {
  await page.goto('/projects/gatekeeper');

  // The switcher is a client component. Clicking before hydration lands on
  // inert markup and silently does nothing.
  const trigger = page.getByRole('button', { name: /switch language/i }).first();
  await expect(trigger).toBeEnabled();
  await page.waitForTimeout(1200);

  await trigger.click();
  await page.getByRole('menuitem', { name: 'Français' }).click();

  await page.waitForURL('**/fr/projects/gatekeeper');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Gatekeeper');
});

test('hreflang covers every locale with an x-default', async ({ page }) => {
  await page.goto('/');

  const links = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((el) => ({
      hreflang: el.getAttribute('hreflang'),
      href: el.getAttribute('href'),
    })),
  );

  const langs = links.map((l) => l.hreflang).sort();
  expect(langs).toEqual(['en', 'es', 'fr', 'hi', 'x-default'].sort());
  // Next normalises the trailing slash off an absolute alternate URL, so match
  // the origin rather than insisting on the exact shape.
  expect(links.find((l) => l.hreflang === 'x-default')?.href).toMatch(/^https?:\/\/[^/]+\/?$/);
  expect(links.find((l) => l.hreflang === 'fr')?.href).toMatch(/\/fr$/);
});

test('each locale is canonical for itself', async ({ page }) => {
  for (const { code, path } of LOCALES) {
    await page.goto(path);

    const canonical = await page.evaluate(
      () => document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
    );

    // Pointing every translation's canonical at the English URL would tell a
    // crawler they are duplicates not worth indexing.
    if (code === 'en') {
      expect(canonical).toMatch(/^https?:\/\/[^/]+\/?$/);
    } else {
      expect(canonical).toMatch(new RegExp(`/${code}$`));
    }
  }
});
