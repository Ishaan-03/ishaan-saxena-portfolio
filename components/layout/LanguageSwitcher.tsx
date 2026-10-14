'use client';

import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { plannedLocales, routing } from '@/i18n/routing';

/**
 * Section 7: globe icon + current code, dropdown with native names.
 *
 * Switching keeps the current page and the hash, so someone reading the
 * certificates section in English lands on the certificates section in French
 * rather than back at the top of the home page.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function switchTo(next: string) {
    setOpen(false);
    if (next === locale) return;

    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    startTransition(() => {
      // usePathname from i18n/navigation already resolves dynamic segments and
      // strips the locale prefix, so /fr/projects/gatekeeper comes back as
      // /projects/gatekeeper and switches to that project's own translation.
      //
      // No useSearchParams here on purpose. The switcher sits in the navbar on
      // every page, and reading search params from a client component opts the
      // whole route out of static rendering unless it is wrapped in Suspense.
      // Nothing on this site carries a query string worth preserving.
      router.replace(pathname, { locale: next });

      // router.replace drops the fragment, so put the reader back where they were.
      if (hash) {
        requestAnimationFrame(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView();
        });
      }
    });
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('switchTo')}
        disabled={pending}
        className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-[13px] text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] disabled:opacity-60"
      >
        <Globe className="size-4" strokeWidth={2} aria-hidden />
        <span className="font-mono text-[11px] uppercase">{locale}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('label')}
          className="glass absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl p-1 shadow-2xl shadow-black/60"
        >
          {plannedLocales.map((item) => {
            const isCurrent = item.code === locale;
            const isLive = (routing.locales as readonly string[]).includes(item.code);

            return (
              <button
                key={item.code}
                type="button"
                role="menuitem"
                lang={item.code}
                disabled={!isLive}
                onClick={() => switchTo(item.code)}
                className={
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 ' +
                  (isLive
                    ? 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                    : 'cursor-not-allowed text-[var(--text-muted)] opacity-50')
                }
              >
                <span>{item.label}</span>
                {isCurrent && (
                  <Check className="size-4 text-[var(--accent)]" strokeWidth={2.5} aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
