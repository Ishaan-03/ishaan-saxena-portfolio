import { Clock, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FaLinkedinIn } from 'react-icons/fa6';
import { SiGithub } from 'react-icons/si';
import { Reveal } from '@/components/layout/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { profile } from '@/content/profile';
import { turnstileSiteKey } from '@/lib/turnstile';
import { ContactForm } from './ContactForm';
import { RevealEmail } from './RevealEmail';

/** Section 8 of the site map: form on the left, direct links on the right. */
export function Contact() {
  const t = useTranslations('contact');
  const siteKey = turnstileSiteKey();

  return (
    <section id="contact" className="relative scroll-mt-24 py-24">
      <SectionHeader badge={t('badge')} title={t('title')} lead={t('lead')} />

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 px-5 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <ContactForm siteKey={siteKey} />
        </Reveal>

        <Reveal index={1}>
          <div className="glass flex h-full flex-col rounded-2xl p-6">
            <p className="font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
              {t('direct.label')}
            </p>

            <div className="mt-5 space-y-3">
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition-colors duration-200 hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)]"
              >
                <FaLinkedinIn className="size-4 text-[var(--accent)]" aria-hidden />
                <span className="text-[13px] text-[var(--text)]">{t('direct.linkedin')}</span>
              </a>

              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition-colors duration-200 hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)]"
              >
                <SiGithub className="size-4 text-[var(--accent)]" aria-hidden />
                <span className="text-[13px] text-[var(--text)]">{t('direct.github')}</span>
              </a>

              {/* Assembled in the browser on click. Section 10: never plain text in the HTML. */}
              <RevealEmail />
            </div>

            <dl className="mt-auto space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-[var(--text-muted)]" strokeWidth={2} aria-hidden />
                <div>
                  <dt className="sr-only">{t('direct.locationLabel')}</dt>
                  <dd className="text-[13px] text-[var(--text-muted)]">{t('direct.location')}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 text-[var(--text-muted)]" strokeWidth={2} aria-hidden />
                <div>
                  <dt className="sr-only">{t('direct.timezoneLabel')}</dt>
                  <dd className="text-[13px] text-[var(--text-muted)]">{t('direct.timezone')}</dd>
                </div>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
