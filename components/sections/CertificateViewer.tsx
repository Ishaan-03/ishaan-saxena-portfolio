'use client';

import { ArrowUpRight, BadgeCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef } from 'react';
import { filePath, thumbPath, type Credential } from '@/content/certifications';

/**
 * Full-screen viewer. Section 11 of the brief asks for a focus trap and for Esc
 * to close, so the dialog takes focus on open, cycles Tab inside itself, and
 * returns focus to whatever opened it.
 *
 * Left and right arrows move through the filtered list, which is what a
 * recruiter flicking through certificates will try first.
 */
export function CertificateViewer({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: Credential[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const t = useTranslations('certificates');
  const tc = useTranslations('common');
  const format = useFormatter();

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);

  const credential = items[index];
  const hasPrevious = index > 0;
  const hasNext = index < items.length - 1;

  // Remember what had focus, and give it back on close.
  useEffect(() => {
    openerRef.current = document.activeElement;
    closeRef.current?.focus();

    return () => {
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  // Lock the page behind the dialog.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'ArrowLeft' && hasPrevious) onNavigate(index - 1);
      if (event.key === 'ArrowRight' && hasNext) onNavigate(index + 1);

      // Focus trap: keep Tab inside the dialog.
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    [hasNext, hasPrevious, index, onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  if (!credential) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(2,4,10,0.92)] p-4 backdrop-blur-xl sm:p-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={credential.title}
        className="glass relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-[var(--text)]">
              {credential.title}
            </h3>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              {credential.issuer} ·{' '}
              {format.dateTime(new Date(credential.date), { month: 'long', year: 'numeric' })} ·{' '}
              {t(`types.${credential.type}`)}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={tc('close')}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
          >
            <X className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#02040A] p-4">
          <Image
            src={thumbPath(credential.slug)}
            alt={t('imageAlt', { title: credential.title })}
            width={800}
            height={620}
            className="mx-auto h-auto w-full max-w-[720px] rounded-lg"
            sizes="(max-width: 768px) 92vw, 720px"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] p-5">
          <a
            href={filePath(credential.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-2)]"
          >
            {tc('openOriginal')}
            <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
          </a>

          {/* Only where the document prints a durable public link. */}
          {credential.verifyUrl && (
            <a
              href={credential.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--available)] transition-colors hover:brightness-125"
            >
              <BadgeCheck className="size-3.5" strokeWidth={2} aria-hidden />
              {tc('verify')}
            </a>
          )}

          {credential.credentialId && (
            <p className="font-mono text-[10px] break-all text-[var(--text-muted)]">
              {t('credentialId')}: {credential.credentialId}
            </p>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate(index - 1)}
              disabled={!hasPrevious}
              aria-label={t('previous')}
              className="flex size-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)] disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
            </button>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {index + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={() => onNavigate(index + 1)}
              disabled={!hasNext}
              aria-label={t('next')}
              className="flex size-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)] disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>

        {credential.note && (
          <p className="border-t border-[var(--border)] px-5 py-3 text-[12px] text-[var(--text-muted)]">
            {credential.note}
          </p>
        )}
      </div>
    </div>
  );
}
