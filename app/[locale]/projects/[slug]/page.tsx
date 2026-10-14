import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArchitectureDiagram } from '@/components/sections/ArchitectureDiagram';
import { ProjectCover } from '@/components/sections/ProjectCovers';
import { Badge } from '@/components/ui/Badge';
import { Tag } from '@/components/ui/Tag';
import { projectBySlug, projectNeighbours, projects } from '@/content/projects';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { alternates, openGraphLocale, pageUrl } from '@/lib/metadata';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!projectBySlug(slug)) return {};

  const t = await getTranslations({ locale, namespace: `projects.items.${slug}` });
  const title = `${t('title')} · Ishaan Saxena`;

  return {
    title,
    description: t('oneLine'),
    alternates: alternates(locale, `projects/${slug}`),
    openGraph: {
      type: 'article',
      title,
      description: t('oneLine'),
      locale: openGraphLocale(locale),
      url: pageUrl(locale, `projects/${slug}`),
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = projectBySlug(slug);
  if (!project) notFound();

  const t = await getTranslations(`projects.items.${slug}`);
  const tc = await getTranslations('common');
  const { previous, next } = projectNeighbours(slug);

  const steps = t.raw('detail.steps') as string[];
  const findings = t.raw('detail.findings') as string[];
  const numberLabels = project.numbers
    ? (t.raw('detail.numbers') as Record<string, string>)
    : undefined;
  const linkLabels = project.links ? (t.raw('detail.links') as Record<string, string>) : undefined;

  return (
    <article className="mx-auto max-w-4xl px-5 py-16">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden />
        {tc('backToProjects')}
      </Link>

      <header className="mt-8">
        <Badge>{tc('scenario')}</Badge>
        <h1 className="mt-5 text-[var(--text)]">{t('title')}</h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">{t('oneLine')}</p>
        <p className="mt-3 font-mono text-[12px] text-[var(--text-muted)]">{t('scenario')}</p>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-2)]"
        >
          {tc('readMore')}
          <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
        </a>
      </header>

      <div className="mt-10">
        <ProjectCover id={project.slug} />
      </div>

      <section className="mt-12">
        <p className="text-[var(--text-muted)]">{t('detail.problem')}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl text-[var(--text)]">{tc('architecture')}</h2>
        <div className="mt-5">
          <ArchitectureDiagram id={project.slug} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl text-[var(--text)]">{tc('whatIBuilt')}</h2>
        <ol className="mt-5 space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-glow)] bg-[rgba(37,99,235,0.14)] font-mono text-[10px] text-[var(--accent)]">
                {index + 1}
              </span>
              <span className="text-[var(--text-muted)]">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {numberLabels && project.numbers && (
        <section className="mt-12">
          <h2 className="text-2xl text-[var(--text)]">{tc('theNumbers')}</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {project.numbers.map((entry) => (
              <div key={entry.key} className="glass rounded-xl p-4">
                <dd className="text-gradient-accent text-lg font-semibold">{entry.value}</dd>
                <dt className="mt-1 text-[12px] text-[var(--text-muted)]">
                  {numberLabels[entry.key]}
                </dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-2xl text-[var(--text)]">{tc('brokeLabel')}</h2>
        <ul className="mt-5 space-y-3">
          {findings.map((finding) => (
            <li
              key={finding}
              className="rounded-xl border-l-2 border-l-[var(--finding)] bg-[rgba(245,158,11,0.05)] p-4 text-[var(--text-muted)]"
            >
              {finding}
            </li>
          ))}
        </ul>
      </section>

      {linkLabels && project.links && (
        <section className="mt-12 flex flex-wrap gap-4">
          {project.links.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] text-[var(--text)] transition-colors hover:border-[var(--border-glow)]"
            >
              <Check className="size-3.5 text-[var(--accent)]" strokeWidth={2.5} aria-hidden />
              {linkLabels[link.key]}
              <ArrowUpRight
                className="size-3.5 text-[var(--text-muted)]"
                strokeWidth={2}
                aria-hidden
              />
            </a>
          ))}
        </section>
      )}

      <nav className="mt-16 flex flex-col gap-3 border-t border-[var(--border)] pt-8 sm:flex-row sm:justify-between">
        {previous ? (
          <Link
            href={`/projects/${previous.slug}`}
            className="group inline-flex items-center gap-2 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            <ArrowLeft
              className="size-3.5 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={2}
              aria-hidden
            />
            {tc('previousProject')}
          </Link>
        ) : (
          <span />
        )}

        {next && (
          <Link
            href={`/projects/${next.slug}`}
            className="group inline-flex items-center gap-2 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)] sm:text-right"
          >
            {tc('nextProject')}
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        )}
      </nav>
    </article>
  );
}
