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
  cacheComponents: true,
  partialPrefetching: true,
  // The dev overlay badge sits on top of the footer and lands in screenshots.
  devIndicators: false,
  env: {
    // The footer copyright year. Resolved when this config loads, so the page
    // stays fully static. Calling new Date() during render is rejected by
    // cacheComponents, and a client-side year would shift the layout.
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
