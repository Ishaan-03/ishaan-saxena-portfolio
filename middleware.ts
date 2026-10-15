import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import {
  contentSecurityPolicy,
  STATIC_SECURITY_HEADERS,
  strictTransportSecurity,
} from './lib/security-headers';

const handleIntl = createMiddleware(routing);

/**
 * Locale routing and security headers in one pass.
 *
 * Next reads the nonce off the *request* `Content-Security-Policy` header and
 * stamps it onto the script tags it injects, so the header has to reach the
 * renderer and not just the browser. next-intl owns the response, so the
 * request is rebuilt with the extra headers before being handed to it.
 *
 * Rebuilt with `new NextRequest(request, { headers })` rather than spread:
 * NextRequest keeps `nextUrl`, `cookies` and the rest on its prototype, so
 * `{ ...request }` produces an object missing all of them and next-intl
 * answers 404 for every route.
 */
export default function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const csp = contentSecurityPolicy(nonce, isDev);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);

  /**
   * The API is not localised, so it must never go through next-intl.
   *
   * `localePrefix: 'as-needed'` rewrites an unprefixed path onto the default
   * locale, which turned `/api/contact` into `/en/api/contact`. No route
   * handler lives there, so it fell through to the locale catch-all and every
   * request to the contact endpoint answered 404: the form could not submit at
   * all. API paths stay in the matcher so they still carry the headers set
   * below, they just skip the locale rewrite.
   */
  const isApi = request.nextUrl.pathname.startsWith('/api');

  const response = isApi
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : handleIntl(new NextRequest(request, { headers: requestHeaders }));

  response.headers.set('content-security-policy', csp);

  for (const [name, value] of STATIC_SECURITY_HEADERS) {
    response.headers.set(name, value);
  }

  // Meaningless over plain http, and it would pin localhost to https.
  if (!isDev) {
    response.headers.set(
      'Strict-Transport-Security',
      strictTransportSecurity(request.headers.get('host')),
    );
  }

  return response;
}

export const config = {
  // Skip Next internals and anything with a file extension. API routes stay in
  // so they carry the security headers too; middleware() skips only the locale
  // rewrite for them.
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
