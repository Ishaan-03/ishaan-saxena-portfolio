import { notFound } from 'next/navigation';

/**
 * Catch-all inside the locale segment.
 *
 * Without it an unmatched URL falls past `[locale]` entirely and Next serves
 * its own bare 404, outside the layout: no navbar, no footer, no translation.
 * This hands those URLs to `app/[locale]/not-found.tsx` instead.
 */
export default function CatchAll() {
  notFound();
}
