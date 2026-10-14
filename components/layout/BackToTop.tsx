'use client';

import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

/** Appears after one screen of scrolling. Section 5, "Also build". */
export function BackToTop() {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('backToTop')}
      className="glass fixed right-5 bottom-5 z-40 flex size-10 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--border-glow)] hover:text-[var(--text)]"
    >
      <ArrowUp className="size-4" strokeWidth={2} aria-hidden />
    </button>
  );
}
