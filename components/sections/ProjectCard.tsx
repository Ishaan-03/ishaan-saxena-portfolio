import { ArrowUpRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Tag } from '@/components/ui/Tag';
import type { Project } from '@/content/projects';
import { ProjectCover } from './ProjectCovers';

/**
 * One featured project. Cover, title, the fictional scenario it runs on, a
 * one-line summary, three "what I built" bullets, the amber finding box, and
 * two links: the GitHub write-up and the detail page.
 */
export function ProjectCard({ project, featured }: { project: Project; featured?: boolean }) {
  const t = useTranslations(`projects.items.${project.slug}`);
  const tCommon = useTranslations('common');

  const built = t.raw('built') as string[];
  const findings = t.raw('findings') as string[];

  return (
    <article
      id={project.anchor}
      className="glass flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl p-5 transition-colors duration-300 hover:border-[var(--border-glow)]"
    >
      <div className={featured ? 'gap-6 lg:grid lg:grid-cols-[minmax(0,420px)_1fr]' : ''}>
        <div className={featured ? '' : 'mb-5'}>
          <ProjectCover id={project.slug} />
        </div>

        <div className={featured ? 'mt-5 lg:mt-0' : ''}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[var(--text)]">{t('title')}</h3>
              <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">{t('scenario')}</p>
            </div>
          </div>

          <p className="mt-3 text-[var(--text-muted)]">{t('oneLine')}</p>

          <ul className="mt-5 space-y-2">
            {built.map((line) => (
              <li key={line} className="flex gap-2.5 text-[13px] text-[var(--text-muted)]">
                <Check
                  className="mt-0.5 size-3.5 shrink-0 text-[var(--accent)]"
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          {/* Section 3: the amber "what broke" box is the point of each card. */}
          <div className="mt-5 rounded-xl border-l-2 border-l-[var(--finding)] bg-[rgba(245,158,11,0.05)] p-4">
            <p className="text-[12px] font-semibold text-[var(--finding)]">
              {tCommon('brokeLabel')}
            </p>
            <ul className="mt-2 space-y-1.5">
              {findings.map((line) => (
                <li key={line} className="text-[13px] text-[var(--text-muted)]">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-2)]"
            >
              {tCommon('readMore')}
              <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
            </a>

            <Link
              href={`/projects/${project.slug}`}
              className="text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              {tCommon('details')}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
