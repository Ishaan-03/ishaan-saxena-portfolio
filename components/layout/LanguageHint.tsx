'use client';

import { X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const DISMISSED_KEY = 'language-hint-dismissed';

/**
 * Section 7: no automatic redirect on browser language, because a shared link
 * must show the sender what the recipient will see. Instead, if the visitor's
 * browser prefers a language this site speaks and they are not already reading
 * it, offer it once, in their own language, and let them dismiss it for good.
 */
const OFFERS: Record<string, { label: string; dismiss: string }> = {
  fr: { label: 'Voir ce site en français ?', dismiss: 'Fermer' },
  es: { label: '¿Ver este sitio en español?', dismiss: 'Cerrar' },
  hi: { label: 'इस साइट को हिन्दी में देखें?', dismiss: 'बंद करें' },
  en: { label: 'View this site in English?', dismiss: 'Dismiss' },
};

export function LanguageHint() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [suggest, setSuggest] = useState<string | null>(null);

  useEffect(() => {
    // Deferred by a frame rather than set in the effect body. The pill is
    // decoration over the fold and nobody misses it for 16ms, and this keeps
    // the first paint free of a second synchronous render.
    const id = requestAnimationFrame(() => {
      if (localStorage.getItem(DISMISSED_KEY)) return;

      // navigator.languages is ordered by preference. Take the first entry
      // whose base language this site actually speaks.
      const preferred = navigator.languages
        .map((tag) => tag.split('-')[0].toLowerCase())
        .find((base) => (routing.locales as readonly string[]).includes(base));

      if (preferred && preferred !== locale) setSuggest(preferred);
    });

    return () => cancelAnimationFrame(id);
  }, [locale]);

  if (!suggest) return null;

  const offer = OFFERS[suggest] ?? OFFERS.en;

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setSuggest(null);
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className="glass animate-rise flex items-center gap-3 rounded-full py-2 pr-2 pl-4 shadow-2xl shadow-black/60"
      >
        <button
          type="button"
          lang={suggest}
          onClick={() => {
            localStorage.setItem(DISMISSED_KEY, '1');
            router.replace({ pathname }, { locale: suggest });
          }}
          className="text-[13px] text-[var(--text)] underline-offset-4 hover:underline"
        >
          {offer.label}
        </button>

        <button
          type="button"
          onClick={dismiss}
          aria-label={offer.dismiss}
          className="flex size-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
        >
          <X className="size-3.5" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
