'use client';

import { BadgeCheck, Star } from 'lucide-react';
import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  categories,
  credentials,
  thumbPath,
  type CredentialCategory,
} from '@/content/certifications';
import { CertificateViewer } from './CertificateViewer';

type Filter = CredentialCategory | 'all';

/**
 * Section 6 of the site map. Filter chips, a grid of glass cards, and a
 * full-screen viewer.
 *
 * Everything is listed. An earlier pass collapsed the eight Google courses into
 * one expandable card, which made the section look far thinner than the work
 * behind it. Each credential is its own card now, ordered with the four that
 * matter most to a cloud security recruiter pinned first.
 */
export function Certificates() {
  const t = useTranslations('certificates');
  const format = useFormatter();

  const [filter, setFilter] = useState<Filter>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === 'all' ? credentials : credentials.filter((c) => c.category === filter)),
    [filter],
  );

  const chips: Filter[] = ['all', ...categories];

  return (
    <section id="certificates" className="relative scroll-mt-24 py-24">
      <SectionHeader badge={t('badge')} title={t('title')} lead={t('lead')} />

      <div className="mx-auto mt-10 max-w-6xl px-5">
        <div
          role="group"
          aria-label={t('filterLabel')}
          className="flex flex-wrap justify-center gap-2"
        >
          {chips.map((chip) => {
            const count =
              chip === 'all'
                ? credentials.length
                : credentials.filter((c) => c.category === chip).length;
            const active = filter === chip;

            return (
              <button
                key={chip}
                type="button"
                onClick={() => setFilter(chip)}
                aria-pressed={active}
                className={
                  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200 ' +
                  (active
                    ? 'border-[var(--border-glow)] bg-[rgba(37,99,235,0.18)] text-[var(--text)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]')
                }
              >
                {t(`filters.${chip}`)}
                <span className="font-mono text-[10px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((credential, index) => (
            <li key={credential.slug}>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="glass group flex h-full w-full flex-col overflow-hidden rounded-2xl text-left transition-[transform,border-color] duration-300 hover:border-[var(--border-glow)] motion-safe:hover:-translate-y-1"
              >
                <span className="relative block aspect-[4/3] overflow-hidden border-b border-[var(--border)] bg-[#02040A]">
                  <Image
                    src={thumbPath(credential.slug)}
                    alt=""
                    fill
                    className="object-contain p-2 transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  />

                  {credential.featured && (
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full border border-[var(--border-glow)] bg-[rgba(2,4,10,0.75)] px-2 py-0.5 text-[10px] text-[var(--accent)] backdrop-blur-sm">
                      <Star className="size-2.5 fill-current" aria-hidden />
                      {t('featured')}
                    </span>
                  )}
                </span>

                <span className="flex flex-1 flex-col p-4">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-wider text-[var(--accent)] uppercase">
                      {t(`types.${credential.type}`)}
                    </span>
                    {credential.verifyUrl && (
                      <BadgeCheck
                        className="size-3.5 shrink-0 text-[var(--available)]"
                        strokeWidth={2}
                        aria-label={t('verifiable')}
                      />
                    )}
                  </span>

                  <span className="mt-2 block text-[13px] leading-snug font-semibold text-[var(--text)]">
                    {credential.title}
                  </span>

                  <span className="mt-1 block text-[12px] text-[var(--text-muted)]">
                    {credential.issuer}
                  </span>

                  <span className="mt-auto pt-3 font-mono text-[10px] text-[var(--text-muted)]">
                    {format.dateTime(new Date(credential.date), {
                      month: 'short',
                      year: 'numeric',
                    })}
                    {credential.programSlug && ` · ${t('partOfProgram')}`}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {openIndex !== null && (
        <CertificateViewer
          items={visible}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={(next) => setOpenIndex(Math.max(0, Math.min(visible.length - 1, next)))}
        />
      )}
    </section>
  );
}
