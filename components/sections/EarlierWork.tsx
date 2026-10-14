import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/layout/Reveal';
import { Tag } from '@/components/ui/Tag';
import type { earlierWork } from '@/content/projects';

/**
 * The compact row under the featured projects. No covers, by design: section 3
 * of the brief keeps these small so they do not compete with the AWS builds.
 */
export function EarlierWork({ items }: { items: typeof earlierWork }) {
  const t = useTranslations('projects.earlier');

  return (
    <div className="mx-auto mt-16 max-w-6xl px-5">
      <h3 className="text-[13px] font-semibold tracking-[0.02em] text-[var(--text)]">
        {t('title')}
      </h3>
      <p className="mt-1 mb-6 text-[13px] text-[var(--text-muted)]">{t('lead')}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={item.slug} index={index}>
            <a
              href={item.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="glass group flex h-full flex-col rounded-xl p-4 transition-colors duration-200 hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-semibold text-[var(--text)]">
                  {t(`${item.slug}.name`)}
                </p>
                <ArrowUpRight
                  className="size-3.5 shrink-0 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent)]"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>

              <p className="mt-1.5 flex-1 text-[12px] text-[var(--text-muted)]">
                {t(`${item.slug}.line`)}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.stack.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
