import { Cloud, GitBranch, ShieldCheck, Terminal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as SimpleIcons from 'react-icons/si';
import { Reveal } from '@/components/layout/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { skillPanels } from '@/content/skills';

const PANEL_ICONS = {
  cloud: Cloud,
  security: ShieldCheck,
  devsecops: GitBranch,
  systems: Terminal,
} as const;

type IconComponent = (props: { className?: string; 'aria-hidden'?: boolean }) => React.JSX.Element;

/**
 * Section 4: four glass panels with tags. Section 14 rules out percentage bars
 * and star ratings, so a tag is either there or it is not.
 */
export function Skills() {
  const t = useTranslations('skills');

  return (
    <section id="skills" className="relative scroll-mt-24 py-24">
      <SectionHeader badge={t('badge')} title={t('title')} lead={t('lead')} />

      <div className="mx-auto mt-14 grid max-w-6xl gap-5 px-5 md:grid-cols-2">
        {skillPanels.map((panel, index) => {
          const PanelIcon = PANEL_ICONS[panel.key];

          return (
            <Reveal key={panel.key} index={index}>
              <div className="glass h-full rounded-2xl p-6 transition-colors duration-300 hover:border-[var(--border-glow)]">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--primary-hover)] to-[var(--primary)]">
                    <PanelIcon className="size-4 text-white" strokeWidth={2} aria-hidden />
                  </span>
                  <h3 className="text-[15px] font-semibold text-[var(--text)]">
                    {t(`panels.${panel.key}`)}
                  </h3>
                </div>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {panel.tags.map((tag) => {
                    const Logo = tag.icon
                      ? (SimpleIcons as unknown as Record<string, IconComponent>)[tag.icon]
                      : undefined;

                    return (
                      <li
                        key={tag.label}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-mono text-[11px] leading-none text-[var(--text-muted)]"
                      >
                        {Logo && <Logo className="size-3 text-[var(--accent)]" aria-hidden />}
                        {tag.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
