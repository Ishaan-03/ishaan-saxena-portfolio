import { test, expect } from '@playwright/test';

/**
 * Section 10 of the brief. These assert the headers a scanner will look for,
 * and that the page still works underneath them: a CSP that breaks the globe
 * or the form is not a win.
 */
test.use({ reducedMotion: 'no-preference' });

test('every security header is present', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response!.headers();

  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['cross-origin-opener-policy']).toBe('same-origin');
  expect(headers['permissions-policy']).toContain('camera=()');
  expect(headers['permissions-policy']).toContain('microphone=()');
  expect(headers['permissions-policy']).toContain('geolocation=()');
  expect(headers['content-security-policy']).toBeTruthy();
});

test('the CSP is nonce-based and locks down the dangerous directives', async ({ page }) => {
  const response = await page.goto('/');
  const csp = response!.headers()['content-security-policy'];

  expect(csp).toMatch(/script-src[^;]*'nonce-[a-f0-9]+'/);
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("base-uri 'self'");
  expect(csp).toContain("form-action 'self'");
  expect(csp).toContain('https://challenges.cloudflare.com');
});

test('no CSP violations anywhere on the page', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (/content security policy|refused to (load|execute|connect)/i.test(text)) {
      violations.push(text);
    }
  });

  await page.goto('/');
  // Let the globe mount, the fonts settle and Turnstile load.
  await page.waitForTimeout(3000);

  // Walk the page so every lazy thing gets its chance to be refused.
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 900) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1500);

  expect(violations).toEqual([]);
});

test('the globe, fonts and Turnstile all survive the CSP', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);

  // The canvas is the clearest proof that the WebGL chunk loaded and ran.
  await expect(page.locator('canvas')).toHaveCount(1);

  const fontLoaded = await page.evaluate(() => document.fonts.check('1rem Inter'));
  expect(fontLoaded).toBe(true);

  await page.evaluate(() => document.getElementById('contact')?.scrollIntoView());
  await page.waitForTimeout(6000);

  // The script defined its global, which means it loaded and executed under
  // the CSP rather than being refused.
  expect(await page.evaluate(() => typeof window.turnstile)).toBe('object');

  // And the widget actually mounted. Asserted on the response field rather than
  // on an iframe: Cloudflare's test key issues a dummy token without rendering
  // one, so an iframe assertion would only ever pass against a real key.
  await expect(page.locator('#contact input[name="cf-turnstile-response"]')).toHaveCount(1);
});

test('security.txt is served and well formed', async ({ request }) => {
  const response = await request.get('/.well-known/security.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');

  const body = await response.text();
  // RFC 9116 requires Contact and Expires.
  expect(body).toMatch(/^Contact:/m);
  expect(body).toMatch(/^Expires:/m);
  expect(body).toMatch(/^Preferred-Languages:/m);

  const expires = body.match(/^Expires: (.+)$/m)?.[1];
  expect(new Date(expires!).getTime()).toBeGreaterThan(Date.now());
});

test('robots.txt and sitemap.xml are served', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain('Sitemap:');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();

  // Every locale and every project page.
  for (const locale of ['', '/fr', '/es', '/hi']) {
    expect(xml).toContain(`<loc>https://ishaansaxena.vercel.app${locale || '/'}`);
  }
  for (const slug of ['gatekeeper', 'northbeam-lite', 'vpc', 'data-protection', 'detection']) {
    expect(xml).toContain(`/projects/${slug}`);
  }
});

test('the 404 page renders in the site style', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /home|accueil/i }).first()).toBeVisible();
});

test('the security page exists and the footer reaches it', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('link', { name: /how this site is secured/i })
    .first()
    .click();

  await page.waitForURL('**/security');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
