/**
 * Security headers for every route. Section 10 of the brief.
 *
 * A cybersecurity portfolio gets inspected, so these are real rather than
 * decorative, and the CSP is nonce-based rather than a blanket allowance.
 */

const TURNSTILE = 'https://challenges.cloudflare.com';

/**
 * Built per request so each response carries its own nonce.
 *
 * `strict-dynamic` means a script that passes the nonce check may load more
 * scripts, which is how Next's chunk loader works without every chunk needing
 * its own nonce. Host allowlists are ignored by browsers that honour
 * `strict-dynamic`, so the Turnstile origin is listed for older ones only.
 *
 * `style-src` keeps `unsafe-inline`. Next inlines critical CSS, motion writes
 * inline styles while animating, and the certificate grid sets sizes inline.
 * Nonces do not apply to style attributes, only to style elements, so a
 * nonce-only style policy would break the page without preventing anything:
 * the realistic injection risk here is script, not style.
 */
export function contentSecurityPolicy(nonce: string, isDev: boolean) {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      TURNSTILE,
      // React Refresh and the Turbopack HMR client are eval-based. Development
      // only: the production policy below never contains this.
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    // next/font self-hosts, so no external font origin is needed.
    'font-src': ["'self'"],
    // blob: is for the globe's canvas readback; data: for the inline SVG covers.
    'img-src': ["'self'", 'data:', 'blob:'],
    'connect-src': ["'self'", TURNSTILE, ...(isDev ? ['ws:', 'wss:'] : [])],
    'frame-src': [TURNSTILE],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');

  // Pointless over http://localhost and it breaks the dev server.
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

/** Everything that does not change per request. */
export const STATIC_SECURITY_HEADERS: Array<[string, string]> = [
  ['X-Content-Type-Options', 'nosniff'],
  // frame-ancestors above is the modern control; this covers older browsers.
  ['X-Frame-Options', 'DENY'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
  ['Cross-Origin-Resource-Policy', 'same-origin'],
  ['X-DNS-Prefetch-Control', 'off'],
  [
    // Everything this site never uses is switched off explicitly.
    'Permissions-Policy',
    [
      'accelerometer=()',
      'autoplay=()',
      'camera=()',
      'display-capture=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'usb=()',
      'xr-spatial-tracking=()',
      'interest-cohort=()',
    ].join(', '),
  ],
];

/**
 * HSTS. Two years, subdomains included, and preload set only when the site is
 * on its own domain: submitting a vercel.app subdomain to the preload list is
 * not ours to do.
 */
export function strictTransportSecurity(host: string | null) {
  const base = 'max-age=63072000; includeSubDomains';
  const onVercelSubdomain = host?.endsWith('.vercel.app') ?? false;
  return onVercelSubdomain ? base : `${base}; preload`;
}
