import { Hexagon, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
// lucide-react v1 dropped brand icons. Simple Icons has GitHub but not LinkedIn
// (removed over trademark policy), so LinkedIn comes from Font Awesome.
import { FaLinkedinIn } from 'react-icons/fa6';
import { SiGithub } from 'react-icons/si';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

const SECTIONS = ['about', 'projects', 'skills', 'experience', 'certificates', 'contact'] as const;

const LINKEDIN = 'https://www.linkedin.com/in/ishaan-saxena-b1989a279/';
const GITHUB = 'https://github.com/Ishaan-03';

/** Section 9 of the site map. */
export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  return (
    <footer className="relative border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--text)]">
              <Hexagon
                className="size-[18px] text-[var(--primary)]"
                strokeWidth={2.5}
                aria-hidden
              />
              <span className="wordmark">Ishaan Saxena</span>
            </div>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{t('tagline')}</p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('linkedin')}
                className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                <FaLinkedinIn className="size-4" aria-hidden />
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('github')}
                className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                <SiGithub className="size-4" aria-hidden />
              </a>
              <LanguageSwitcher className="ml-1" />
            </div>
          </div>

          <nav aria-label={tNav('menuLabel')}>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5">
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="text-sm text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text)]"
                  >
                    {tNav(id)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/security"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--accent)]"
          >
            <ShieldCheck className="size-4" strokeWidth={2} aria-hidden />
            {t('howSecured')}
          </Link>

          <p className="text-xs text-[var(--text-muted)]">{t('privacyNote')}</p>
        </div>

        <p className="mt-6 text-xs text-[var(--text-muted)]">
          {t('copyright', { year: process.env.NEXT_PUBLIC_BUILD_YEAR ?? '' })}
        </p>
      </div>
    </footer>
  );
}
