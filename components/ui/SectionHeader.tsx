import { Badge } from './Badge';

type Props = {
  badge: string;
  title: string;
  /** One muted line under the heading. */
  lead?: string;
  tone?: 'blue' | 'green';
};

/**
 * Badge + H2 + one muted line, centered, max-width 640px. Section 3.
 * Every section uses this so the site reads as one system.
 */
export function SectionHeader({ badge, title, lead, tone = 'blue' }: Props) {
  return (
    <div className="relative mx-auto max-w-[640px] px-4 text-center">
      <div aria-hidden className="section-glow -top-16" />

      <div className="relative">
        <Badge tone={tone}>{badge}</Badge>

        <h2 className="mt-5 text-[var(--text)]">{title}</h2>

        {lead && <p className="mt-4 text-[var(--text-muted)]">{lead}</p>}
      </div>
    </div>
  );
}
