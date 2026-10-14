import { GraduationCap, MapPin, Languages as LanguagesIcon, Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/layout/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MethodStepper } from './MethodStepper';

const ID_ROWS = [
  { key: 'study', icon: GraduationCap },
  { key: 'focus', icon: Briefcase },
  { key: 'place', icon: MapPin },
  { key: 'languages', icon: LanguagesIcon },
] as const;

/**
 * Section 2 of the site map. Two columns on desktop, text left and a glass ID
 * card right; one column on mobile. No photo, which is what Ishaan chose in
 * Phase 0, so the card carries the facts instead.
 */
export function About() {
  const t = useTranslations('about');

  return (
    <section id="about" className="relative scroll-mt-24 py-24">
      <SectionHeader badge={t('badge')} title={t('title')} lead={t('lead')} />

      <div className="mx-auto mt-14 grid max-w-6xl gap-10 px-5 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <div className="space-y-4">
          {['p1', 'p2', 'p3', 'p4'].map((key, index) => (
            <Reveal key={key} index={index}>
              <p className="text-[var(--text-muted)]">{t(`story.${key}`)}</p>
            </Reveal>
          ))}
        </div>

        <Reveal index={1}>
          <div className="glass rounded-2xl p-6">
            <p className="font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
              {t('card.label')}
            </p>
            <p className="mt-3 text-xl font-semibold text-[var(--text)]">{t('card.name')}</p>
            <p className="text-sm text-[var(--accent)]">{t('card.role')}</p>

            <dl className="mt-6 space-y-4">
              {ID_ROWS.map(({ key, icon: Icon }) => (
                <div key={key} className="flex gap-3">
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-[var(--text-muted)]"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <div>
                    <dt className="text-[11px] text-[var(--text-muted)]">
                      {t(`card.${key}.label`)}
                    </dt>
                    <dd className="text-[13px] text-[var(--text)]">{t(`card.${key}.value`)}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>

      <MethodStepper />
    </section>
  );
}
