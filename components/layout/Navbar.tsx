'use client';

import { Hexagon, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';

const SECTIONS = ['about', 'projects', 'skills', 'experience', 'certificates', 'contact'] as const;

/**
 * Section 3: 64px high, fixed. Transparent at the top; after 24px of scroll it
 * becomes glass with a --border bottom. Mobile opens a full-screen glass sheet.
 */
export function Navbar() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the section currently in view.
  useEffect(() => {
    const targets = SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-64px 0px -55% 0px', threshold: [0.1, 0.5] },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-50 h-[var(--navbar-h)] transition-[background-color,border-color,backdrop-filter] duration-300 ' +
        (scrolled
          ? 'border-b border-[var(--border)] bg-[rgba(2,4,10,0.72)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent')
      }
    >
      <nav
        aria-label={t('menuLabel')}
        className="mx-auto flex h-full max-w-6xl items-center justify-between px-5"
      >
        <a href="#top" className="flex items-center gap-2 text-[var(--text)]">
          <Hexagon
            className="size-[18px] shrink-0 text-[var(--primary)]"
            strokeWidth={2.5}
            aria-hidden
          />
          <span className="wordmark whitespace-nowrap">Ishaan Saxena</span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {SECTIONS.map((id) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={
                    'relative py-1 text-[13px] transition-colors duration-200 ' +
                    (isActive
                      ? 'text-[var(--primary-hover)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]')
                  }
                >
                  {t(id)}
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 left-0 h-px w-full bg-[var(--primary-hover)]"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Wrapped rather than given `hidden sm:inline-flex` directly: the
              button's own `inline-flex` is a display utility too, and which one
              wins depends on Tailwind's output order, not the class order here. */}
          <div className="hidden sm:block">
            <ButtonLink href="#contact" size="md" withArrow className="whitespace-nowrap">
              {t('getInTouch')}
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t('openMenu')}
            aria-expanded={menuOpen}
            className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)] md:hidden"
          >
            <Menu className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('menuLabel')}
          className="fixed inset-0 z-50 bg-[rgba(2,4,10,0.95)] backdrop-blur-2xl md:hidden"
        >
          <div className="flex h-[var(--navbar-h)] items-center justify-between px-5">
            <span className="wordmark text-[var(--text)]">Ishaan Saxena</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t('closeMenu')}
              autoFocus
              className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X className="size-4" strokeWidth={2} aria-hidden />
            </button>
          </div>

          <ul className="flex flex-col gap-1 px-5 pt-6">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-[var(--border)] py-4 text-xl text-[var(--text)]"
                >
                  {t(id)}
                </a>
              </li>
            ))}
          </ul>

          <div className="px-5 pt-8">
            <ButtonLink
              href="#contact"
              size="lg"
              withArrow
              className="w-full"
              onClick={() => setMenuOpen(false)}
            >
              {t('getInTouch')}
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
