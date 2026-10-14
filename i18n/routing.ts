import { defineRouting } from 'next-intl/routing';

/**
 * Section 7 of the brief.
 *
 * en is the default and is served at `/`. fr, es and hi get a prefix.
 *
 * `localeDetection: false` is deliberate. The brief: "No automatic redirect
 * based on the browser language (recruiters share links; the link must show
 * what they saw)." Instead, Phase 6 adds a small dismissible pill offering the
 * visitor's own language.
 *
 * The locale cookie stays on, so an explicit choice in the switcher survives a
 * reload. It never triggers a redirect on its own.
 *
 * TODO Phase 6: add 'fr', 'es', 'hi' here once messages/*.json exist for them.
 * Adding a locale before its messages file would render English under a French
 * URL, which is worse than the switcher being inert.
 */
export const routing = defineRouting({
  locales: ['en'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: {
    name: 'NEXT_LOCALE',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  },
});

/** Every locale the site will ship, including the ones not wired up yet. */
export const plannedLocales = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'hi', label: 'हिन्दी' },
] as const;

export type AppLocale = (typeof routing.locales)[number];
