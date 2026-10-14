'use client';

import { ChevronDown, Download } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { CV_FILES, pickCv } from '@/content/cv';

/**
 * Section 9: a split button. The main click gives the CV matching the site
 * language, and the caret opens the full list.
 *
 * Only the French CV exists today, so every language resolves to it. The
 * English entry appears as soon as a file is added to `content/cv.ts`.
 */
export function CvDownload({ size = 'lg' }: { size?: 'md' | 'lg' }) {
  const t = useTranslations('cv');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const primary = pickCv(locale);
  const height = size === 'lg' ? 'h-12 text-[15px]' : 'h-10 text-sm';

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <a
        href={primary.path}
        download={primary.downloadName}
        className={`group inline-flex items-center gap-2 rounded-l-full bg-[var(--primary)] pr-4 pl-5 font-medium text-white shadow-[0_0_24px_rgba(59,130,246,0.45)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-[var(--primary-hover)] motion-safe:hover:-translate-y-px ${height}`}
      >
        <Download className="size-4" strokeWidth={2} aria-hidden />
        {t('download')}
        <span className="font-mono text-[11px] opacity-75">{primary.sizeLabel}</span>
      </a>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('chooseLanguage')}
        className={`inline-flex items-center justify-center rounded-r-full border-l border-white/20 bg-[var(--primary)] px-3 text-white transition-colors duration-200 hover:bg-[var(--primary-hover)] ${height}`}
      >
        <ChevronDown className="size-4" strokeWidth={2} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="glass absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl p-1 shadow-2xl shadow-black/60"
        >
          {CV_FILES.map((file) => (
            <a
              key={file.language}
              role="menuitem"
              href={file.path}
              download={file.downloadName}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              <span>{t(`languages.${file.language}`)}</span>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                PDF · {file.sizeLabel}
              </span>
            </a>
          ))}

          {/* Honest about what does not exist yet rather than silently offering one file. */}
          {CV_FILES.length === 1 && (
            <p className="border-t border-[var(--border)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
              {t('englishSoon')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
