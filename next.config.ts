import path from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Production checks build into their own directory. `next build` and
   * `next dev` otherwise share `.next`, and building while the dev server is
   * live corrupts its cache: the dev server kept serving a stale tree whose
   * errors broke hydration, so every motion element stayed at opacity 0 and the
   * page looked empty while the real build was fine.
   */
  distDir: process.env.BUILD_DIR || '.next',
  // The dev overlay badge sits on top of the footer and lands in screenshots.
  devIndicators: false,
  /**
   * `cacheComponents` and `partialPrefetching` were removed deliberately.
   *
   * They prerender a static shell at build time, and a build-time shell cannot
   * carry a per-request CSP nonce. With them on, every one of Next's own script
   * chunks was refused in production: "'strict-dynamic' is present, so
   * host-based allowlisting is disabled". The only way to keep them would have
   * been `script-src 'unsafe-inline'`, which is exactly the thing the /security
   * page says this site does not do.
   *
   * The pages render per request instead. Measured cost: TTFB 20ms to 100ms
   * locally, LCP still 1.8s on the home page and well under a second on the
   * detail pages, CLS 0.
   */
  env: {
    // The footer copyright year, resolved when this config loads. A
    // client-rendered year would shift the layout after hydration.
    NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()),
  },
  turbopack: {
    // Pin the workspace root. Without this, Next walks up and finds the stray
    // package-lock.json in the home directory, which is outside this repo.
    root: path.resolve(__dirname),
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(nextConfig);
