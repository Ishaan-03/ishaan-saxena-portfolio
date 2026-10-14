import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Noto_Sans_Devanagari } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { LanguageHint } from '@/components/layout/LanguageHint';
import { Starfield } from '@/components/layout/Starfield';
import { BackToTop } from '@/components/layout/BackToTop';
import { routing } from '@/i18n/routing';
import {
  alternateOpenGraphLocales,
  alternates,
  openGraphLocale,
  pageUrl,
  SITE_URL,
} from '@/lib/metadata';
import '../globals.css';

// Self-hosted by next/font. No external font requests, which keeps the CSP in
// section 10 simple.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Inter has no Devanagari, so Hindi needs its own face. Loaded only on the
 * Hindi pages: every other locale would pay for a script it never renders.
 */
const notoDevanagari = Noto_Sans_Devanagari({
  variable: '--font-devanagari',
  subsets: ['devanagari', 'latin'],
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
    // hreflang for all four, with x-default on English. Section 11.
    alternates: alternates(locale),
    openGraph: {
      type: 'website',
      title: t('title'),
      description: t('description'),
      locale: openGraphLocale(locale),
      alternateLocale: alternateOpenGraphLocales(locale),
      url: pageUrl(locale),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for static rendering with next-intl.
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <html
      lang={locale}
      // Devanagari ships only where it is read. `font-hi` in globals.css puts it
      // in front of Inter and gives the taller line-height the script needs.
      className={`${inter.variable} ${jetbrainsMono.variable} ${
        locale === 'hi' ? `${notoDevanagari.variable} font-hi` : ''
      } h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <div aria-hidden className="page-backdrop">
            <Starfield />
            <div className="dot-grid" />
            <div className="page-vignette" />
          </div>

          <a href="#main" className="skip-link glass rounded-full px-4 py-2 text-sm">
            {t('skipToContent')}
          </a>

          <ScrollProgress />
          <Navbar />

          <main id="main" className="flex-1 pt-[var(--navbar-h)]">
            {children}
          </main>

          <Footer />
          <BackToTop />
          <LanguageHint />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
