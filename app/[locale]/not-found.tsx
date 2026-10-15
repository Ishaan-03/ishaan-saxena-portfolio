import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/** Section 5, "Also build": a 404 in the site's own style. */
export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-5">
      {/* The same glow the globe sits in, with nothing in it. */}
      <div aria-hidden className="globe-glow opacity-60" />

      <div className="animate-rise relative text-center">
        <Badge>{t('badge')}</Badge>

        <p className="text-gradient-accent mt-6 font-mono text-[64px] leading-none font-semibold">
          404
        </p>

        <h1 className="mt-5 text-[var(--text)]">{t('title')}</h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--text-muted)]">{t('body')}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/" size="lg" withArrow>
            {t('home')}
          </ButtonLink>
          <ButtonLink href="/#projects" variant="secondary" size="lg">
            {t('projects')}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
