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
 * All four locales are live. `npm run i18n:check` fails the build if any of them
 * drifts from English, which is what makes adding one safe.
 */
export const routing = defineRouting({
  locales: ['en', 'fr', 'es', 'hi'],
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
