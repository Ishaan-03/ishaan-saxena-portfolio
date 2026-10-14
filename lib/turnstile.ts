/**
 * Cloudflare Turnstile, verified server-side before anything is sent.
 * Section 8 of the brief.
 */

/**
 * Cloudflare's published testing keys. Documented and safe to commit: the
 * "always passes" pair exists so a form can be exercised end to end without a
 * real widget.
 *
 * They are used only in development, and only when no real key is configured,
 * so the whole flow is testable before Ishaan creates the widget.
 */
const TEST_SITE_KEY = '1x00000000000000000000AA';
const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function turnstileSiteKey(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (configured) return configured;
  return process.env.NODE_ENV === 'development' ? TEST_SITE_KEY : undefined;
}

/**
 * Returns true only when Cloudflare says the token is good.
 *
 * Fails closed. With no secret configured in production this returns false, so
 * a missing key stops mail going out rather than quietly disabling the check.
 */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const configured = process.env.TURNSTILE_SECRET_KEY;
  const secret =
    configured || (process.env.NODE_ENV === 'development' ? TEST_SECRET_KEY : undefined);

  if (!secret) {
    console.error('Turnstile secret is not configured; refusing to accept the submission.');
    return false;
  }

  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      // Never let a hanging check hold the request open.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return false;

    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
