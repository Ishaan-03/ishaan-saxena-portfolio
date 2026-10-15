import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { alternates, openGraphLocale, pageUrl } from '@/lib/metadata';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'security' });

  return {
    title: `${t('title')} · Ishaan Saxena`,
    description: t('lead'),
    alternates: alternates(locale, 'security'),
    openGraph: {
      type: 'article',
      title: t('title'),
      description: t('lead'),
      locale: openGraphLocale(locale),
      url: pageUrl(locale, 'security'),
    },
  };
}

const GROUPS = ['headers', 'privacy', 'repo', 'contact'] as const;
const ITEM_COUNTS = { headers: 7, privacy: 4, repo: 5, contact: 3 } as const;

/**
 * Section 9 of the site map: the "How this site is secured" page the footer
 * links to. For a cybersecurity candidate this is part of the portfolio, so it
 * describes what is actually configured rather than making claims.
 */
export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('security');

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden />
        {t('back')}
      </Link>

      <header className="mt-8">
        <Badge>{t('badge')}</Badge>
        <h1 className="mt-5 text-[var(--text)]">{t('title')}</h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">{t('lead')}</p>
      </header>

      <div className="mt-12 space-y-10">
        {GROUPS.map((group) => (
          <section key={group}>
            <h2 className="text-2xl text-[var(--text)]">{t(`groups.${group}.title`)}</h2>
            <p className="mt-2 text-[var(--text-muted)]">{t(`groups.${group}.lead`)}</p>

            <ul className="mt-5 space-y-2.5">
              {Array.from({ length: ITEM_COUNTS[group] }, (_, index) => (
                <li key={index} className="flex gap-3 text-[14px] text-[var(--text-muted)]">
                  <Check
                    className="mt-1 size-3.5 shrink-0 text-[var(--available)]"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span>{t(`groups.${group}.items.${index}`)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="glass mt-12 rounded-2xl p-6">
        <p className="text-[13px] font-semibold text-[var(--text)]">{t('verify.title')}</p>
        <p className="mt-2 text-[13px] text-[var(--text-muted)]">{t('verify.body')}</p>

        <div className="mt-4 flex flex-wrap gap-4">
          <a
            href="https://securityheaders.com/?q=ishaansaxena.vercel.app&followRedirects=on"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-2)]"
          >
            {t('verify.headers')}
            <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
          </a>

          <a
            href="/.well-known/security.txt"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-2)]"
          >
            {t('verify.securityTxt')}
            <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
          </a>

          <a
            href="https://github.com/Ishaan-03/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-2)]"
          >
            {t('verify.source')}
            <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}
