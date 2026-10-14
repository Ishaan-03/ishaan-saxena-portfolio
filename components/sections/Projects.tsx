import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/layout/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { earlierWork, projects } from '@/content/projects';
import { ProjectCard } from './ProjectCard';
import { EarlierWork } from './EarlierWork';

/**
 * Section 3 of the site map. The first card spans the full width on desktop,
 * the rest sit two up. Every card carries id="project-<slug>" so the hero cards
 * can link straight to it.
 */
export function Projects() {
  const t = useTranslations('projects');

  return (
    <section id="projects" className="relative scroll-mt-24 py-24">
      <SectionHeader badge={t('badge')} title={t('title')} lead={t('lead')} />

      <div className="mx-auto mt-14 grid max-w-6xl gap-5 px-5 md:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal
            key={project.slug}
            index={index}
            className={index === 0 ? 'md:col-span-2' : undefined}
          >
            <ProjectCard project={project} featured={index === 0} />
          </Reveal>
        ))}
      </div>

      <EarlierWork items={earlierWork} />
    </section>
  );
}
