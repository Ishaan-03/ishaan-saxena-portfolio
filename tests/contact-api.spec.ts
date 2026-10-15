import { test, expect } from '@playwright/test';

/**
 * The route handler is the real gate, so it is tested directly rather than
 * through the form. Section 8 of the brief sets each of these rules.
 *
 * Only one test actually sends mail, and it is skipped unless
 * SEND_REAL_EMAIL=1, so a normal run never puts anything in Ishaan's inbox.
 */

const valid = {
  name: 'Test Recruiter',
  email: 'recruiter@example.com',
  company: 'Example SAS',
  topic: 'internship',
  message: 'This is a test message from the Playwright suite, long enough to pass validation.',
  website: '',
  locale: 'en',
  // Cloudflare's test secret accepts any non-empty token in development.
  turnstileToken: 'test-token',
};

/**
 * The route rate-limits per client IP, so each test uses its own. Sharing one
 * would make whichever tests ran last fail with 429 rather than the status they
 * are actually checking.
 */
let nextIp = 0;
function freshIp() {
  nextIp += 1;
  return `203.0.113.${nextIp}`;
}

async function post(
  request: import('@playwright/test').APIRequestContext,
  body: unknown,
  ip = freshIp(),
) {
  return request.post('/api/contact', {
    data: body,
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
    failOnStatusCode: false,
  });
}

test('rejects a missing name', async ({ request }) => {
  const res = await post(request, { ...valid, name: '' });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.code).toBe('invalid');
  expect(body.fields).toHaveProperty('name');
});

test('rejects an invalid email', async ({ request }) => {
  const res = await post(request, { ...valid, email: 'not-an-email' });
  expect(res.status()).toBe(400);
  expect((await res.json()).fields).toHaveProperty('email');
});

test('rejects a message under ten characters', async ({ request }) => {
  const res = await post(request, { ...valid, message: 'too short' });
  expect(res.status()).toBe(400);
  expect((await res.json()).fields).toHaveProperty('message');
});

test('rejects an unknown topic', async ({ request }) => {
  const res = await post(request, { ...valid, topic: 'spam' });
  expect(res.status()).toBe(400);
});

test('rejects a body over 20 KB', async ({ request }) => {
  const res = await post(request, { ...valid, message: 'x'.repeat(21 * 1024) });
  expect(res.status()).toBe(413);
  expect((await res.json()).code).toBe('too_large');
});

test('a filled honeypot reports success and sends nothing', async ({ request }) => {
  const res = await post(request, { ...valid, website: 'http://spam.example' });
  // Section 8: look successful, so a bot has nothing to learn from the reply.
  expect(res.status()).toBe(200);
  expect((await res.json()).ok).toBe(true);
});

test('rejects a submission with no Turnstile token', async ({ request }) => {
  const res = await post(request, { ...valid, turnstileToken: undefined });
  expect(res.status()).toBe(403);
  expect((await res.json()).code).toBe('challenge_failed');
});

test('GET is not allowed', async ({ request }) => {
  const res = await request.get('/api/contact', { failOnStatusCode: false });
  expect(res.status()).toBe(405);
});

test('no error response leaks internals', async ({ request }) => {
  for (const body of [
    { ...valid, email: 'bad' },
    { ...valid, topic: 'nope' },
  ]) {
    const text = await (await post(request, body)).text();
    expect(text).not.toMatch(/resend|api[_-]?key|stack|at \w+ \(/i);
  }
});

test('sends a real email', async ({ request }) => {
  test.skip(process.env.SEND_REAL_EMAIL !== '1', 'set SEND_REAL_EMAIL=1 to actually send');

  const res = await post(request, {
    ...valid,
    name: 'Playwright check',
    email: 'saxenaishaan03@gmail.com',
    message: 'End-to-end check from the Phase 5 test suite. Reply-To should be this address.',
  });

  expect(res.status()).toBe(200);
  expect((await res.json()).ok).toBe(true);
});

/**
 * The API must not pass through next-intl.
 *
 * `localePrefix: 'as-needed'` rewrote `/api/contact` onto the default locale,
 * where no route handler exists. It fell through to the locale catch-all added
 * in Phase 7, so the endpoint answered 404 with an HTML error page and the form
 * could not submit at all. The middleware still has to stamp the security
 * headers onto API responses, so both halves are asserted together: skipping
 * the locale rewrite must not mean skipping the headers.
 */
test('the API skips the locale rewrite but keeps the security headers', async ({ request }) => {
  const res = await request.get('/api/contact', { failOnStatusCode: false });
  const headers = res.headers();

  // JSON from the route handler, not Next's HTML 404 page.
  expect(res.status()).toBe(405);
  expect(headers['content-type']).toContain('application/json');
  expect((await res.json()).code).toBe('method_not_allowed');

  expect(headers['content-security-policy']).toContain("'strict-dynamic'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
});
