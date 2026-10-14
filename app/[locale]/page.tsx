import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Phase 1 placeholder. The real hero, globe and all nine sections land in
 * Phases 2 and 3. This exists so the layout, navbar and footer can be reviewed
 * against the reference.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('hero');

  return (
    <div id="top" className="mx-auto max-w-6xl px-5 py-24 text-center">
      <Badge tone="green">{t('badge')}</Badge>

      <h1 className="mt-8">
        <span className="block text-[var(--text)]">{t('headlineLine1')}</span>
        <span className="block text-gradient-accent">{t('headlineLine2')}</span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-[var(--text-muted)]">{t('subtitle')}</p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="#projects" size="lg" withArrow>
          {t('primaryCta')}
        </ButtonLink>
        <ButtonLink href="#internship" variant="secondary" size="lg">
          {t('secondaryCta')}
        </ButtonLink>
      </div>
    </div>
  );
}
