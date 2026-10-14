import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';
import { verifyTurnstile } from '@/lib/turnstile';
import { contactSchema, fieldErrors, MAX_BODY_BYTES } from '@/lib/validation';

/**
 * POST /api/contact. Section 8 of the brief.
 *
 * Order matters: size, then shape, then honeypot, then Turnstile, then send.
 * Nothing reaches the mail provider until every check before it has passed.
 *
 * Every failure returns a generic code. No provider messages, no stack traces,
 * nothing that describes the inside of this route.
 */

/**
 * No `export const runtime`: Next 16 rejects that alongside `cacheComponents`,
 * and route handlers already run on Node unless edge is opted into, which is
 * what the Resend SDK needs.
 */

type Failure = 'too_large' | 'invalid' | 'challenge_failed' | 'send_failed' | 'rate_limited';

function fail(code: Failure, status: number, fields?: Record<string, true>) {
  return NextResponse.json({ ok: false, code, fields }, { status });
}

/**
 * A small in-memory limit, enough to stop someone holding the send button down.
 * It resets when the serverless instance recycles, which is fine: Turnstile is
 * the real gate and this only trims the obvious.
 */
const RECENT = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (RECENT.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  hits.push(now);
  RECENT.set(ip, hits);

  // Keep the map from growing without bound on a long-lived instance.
  if (RECENT.size > 500) {
    for (const [key, times] of RECENT) {
      if (times.every((at) => now - at >= WINDOW_MS)) RECENT.delete(key);
    }
  }

  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) return fail('rate_limited', 429);

  // Refuse oversized bodies before reading them.
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return fail('too_large', 413);

  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) return fail('too_large', 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail('invalid', 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return fail('invalid', 400, fieldErrors(parsed.error));

  const input = parsed.data;

  /**
   * Honeypot. A filled hidden field means a bot, so report success and send
   * nothing: telling a bot it failed only teaches it to try again.
   */
  if (input.website) {
    return NextResponse.json({ ok: true });
  }

  const human = await verifyTurnstile(input.turnstileToken, ip === 'unknown' ? undefined : ip);
  if (!human) return fail('challenge_failed', 403);

  try {
    await sendContactEmail(input);
  } catch {
    return fail('send_failed', 502);
  }

  return NextResponse.json({ ok: true });
}

/** Anything other than POST gets a flat refusal. */
export function GET() {
  return NextResponse.json({ ok: false, code: 'method_not_allowed' }, { status: 405 });
}
