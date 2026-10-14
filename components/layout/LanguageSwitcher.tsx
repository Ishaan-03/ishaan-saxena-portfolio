'use client';

import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { plannedLocales, routing } from '@/i18n/routing';

/**
 * Section 7: globe icon + current code, dropdown with native names.
 *
 * Phase 1 placeholder. Only the locales in `routing.locales` are live; the
 * others render disabled until Phase 6 adds their messages file. Replacing a
 * disabled item with a working link is the only change that phase needs here.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('language');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
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

  const liveLocales: readonly string[] = routing.locales;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('switchTo')}
        className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-[13px] text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
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
            const isLive = liveLocales.includes(item.code);
            const isCurrent = item.code === locale;

            return (
              <button
                key={item.code}
                type="button"
                role="menuitem"
                disabled={!isLive}
                onClick={() => setOpen(false)}
                className={
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 ' +
                  (isLive
                    ? 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                    : 'cursor-not-allowed text-[var(--text-muted)] opacity-50')
                }
              >
                <span>{item.label}</span>
                {isCurrent ? (
                  <Check className="size-4 text-[var(--accent)]" strokeWidth={2.5} aria-hidden />
                ) : (
                  !isLive && (
                    <span className="font-mono text-[10px] uppercase">{t('comingSoon')}</span>
                  )
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
