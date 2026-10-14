'use client';

import { Copy, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { profile } from '@/content/profile';

/**
 * Section 10: the address is never written as plain text in the HTML. The two
 * halves only become an address in the browser, after a click, which keeps it
 * away from the scrapers that read the markup.
 */
export function RevealEmail() {
  const t = useTranslations('contact.direct');
  const [address, setAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!address) {
    return (
      <button
        type="button"
        onClick={() => setAddress(`${profile.emailUser}@${profile.emailDomain}`)}
        className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 text-left transition-colors duration-200 hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)]"
      >
        <Mail className="size-4 text-[var(--accent)]" strokeWidth={2} aria-hidden />
        <span className="text-[13px] text-[var(--text)]">{t('revealEmail')}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[var(--border-glow)] bg-[var(--surface-hover)] px-4 py-3">
      <Mail className="size-4 shrink-0 text-[var(--accent)]" strokeWidth={2} aria-hidden />
      <a
        href={`mailto:${address}`}
        className="flex-1 truncate text-[13px] text-[var(--text)] hover:text-[var(--accent)]"
      >
        {address}
      </a>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard?.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        aria-label={t('copyEmail')}
        className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
      >
        <Copy className="size-3.5" strokeWidth={2} aria-hidden />
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? t('copied') : ''}
      </span>
    </div>
  );
}
