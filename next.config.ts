import path from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
