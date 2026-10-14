import { routing } from '@/i18n/routing';

/**
 * Canonical and hreflang alternates. Section 11 of the brief.
 *
 * The default locale is served without a prefix, so `/` and `/fr` are the two
 * shapes. `x-default` points at English, which is what an unmatched visitor
 * should land on.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ishaansaxena.vercel.app';

/** `/about` in fr becomes `/fr/about`; in en it stays `/about`. */
export function localisedPath(locale: string, path = '') {
  const clean = path.replace(/^\/+/, '');
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${prefix}${clean ? `/${clean}` : ''}` || '/';
}

/**
 * `locale` is the page being rendered, so each one is canonical for itself.
 * Pointing every locale's canonical at the English URL tells a crawler the
 * translations are duplicates and should not be indexed, which is the opposite
 * of why they exist.
 */
export function alternates(locale: string, path = '') {
  const languages: Record<string, string> = {};
  for (const other of routing.locales) {
    languages[other] = `${SITE_URL}${localisedPath(other, path)}`;
  }
  languages['x-default'] = `${SITE_URL}${localisedPath(routing.defaultLocale, path)}`;

  return {
    canonical: `${SITE_URL}${localisedPath(locale, path)}`,
    languages,
  };
}

/** The page's own absolute URL, for og:url. */
export function pageUrl(locale: string, path = '') {
  return `${SITE_URL}${localisedPath(locale, path)}`;
}

/** OpenGraph wants a full locale, not a bare language code. */
const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
  hi: 'hi_IN',
};

export function openGraphLocale(locale: string) {
  return OG_LOCALES[locale] ?? 'en_US';
}

export function alternateOpenGraphLocales(locale: string) {
  return routing.locales.filter((other) => other !== locale).map(openGraphLocale);
}
