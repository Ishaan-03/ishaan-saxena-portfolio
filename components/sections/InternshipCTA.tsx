import { CalendarDays, FileCheck2, MapPin, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/layout/Reveal';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { CvDownload } from './CvDownload';

const FACTS = [
  { key: 'when', icon: CalendarDays },
  { key: 'field', icon: Target },
  { key: 'where', icon: MapPin },
  { key: 'agreement', icon: FileCheck2 },
] as const;

const DAY_ONE = ['policies', 'alerts', 'pipeline', 'document'] as const;

/**
 * Section 7: the call-to-action band.
 *
 * "Where" says open to relocation, which is Ishaan's answer to question 3 and
 * overrides the brief's hardcoded "Paris region".
 */
export function InternshipCTA() {
  const t = useTranslations('internship');

  return (
    <section id="internship" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
            <div aria-hidden className="section-glow -top-10" />

            <div className="relative">
              <Badge tone="green">{t('badge')}</Badge>

              <h2 className="mx-auto mt-6 max-w-2xl text-[var(--text)]">{t('title')}</h2>

              <dl className="mx-auto mt-8 grid max-w-3xl gap-4 text-left sm:grid-cols-2">
                {FACTS.map(({ key, icon: Icon }) => (
                  <div key={key} className="flex gap-3">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <div>
                      <dt className="text-[11px] text-[var(--text-muted)]">
                        {t(`facts.${key}.label`)}
                      </dt>
                      <dd className="text-[13px] text-[var(--text)]">{t(`facts.${key}.value`)}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mx-auto mt-10 max-w-3xl">
                <p className="font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                  {t('dayOne.label')}
                </p>

                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                  {DAY_ONE.map((key) => (
                    <li
                      key={key}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[12px] text-[var(--text-muted)]"
                    >
                      {t(`dayOne.${key}`)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <CvDownload />
                <ButtonLink href="#contact" variant="secondary" size="lg">
                  {t('contactCta')}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
