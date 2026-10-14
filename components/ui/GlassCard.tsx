import { ArrowUpRight } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type Props = {
  /** lucide icon for the top-left tile. */
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children?: ReactNode;
  /** Renders the round arrow button bottom-right and makes the whole card a link. */
  href?: string;
  external?: boolean;
  className?: string;
  /** Extra content under the body text, e.g. a row of tags. */
  footer?: ReactNode;
};

/**
 * The glass card from section 3: radius 16, --surface, 1px --border, backdrop
 * blur, 20 to 24px padding. 40px icon tile top-left with a blue gradient.
 * Hover: border turns --border-glow and the card lifts 4px.
 */
export function GlassCard({
  icon: Icon,
  title,
  children,
  href,
  external = false,
  className = '',
  footer,
}: Props) {
  const inner = (
    <>
      {Icon && (
        <span
          aria-hidden
          className="mb-4 flex size-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--primary-hover)] to-[var(--primary)] shadow-[0_4px_14px_rgba(37,99,235,0.35)]"
        >
          <Icon className="size-5 text-white" strokeWidth={2} />
        </span>
      )}

      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">{title}</h3>

      {children && <div className="mt-2 text-[13px] text-[var(--text-muted)]">{children}</div>}

      {footer && <div className="mt-4">{footer}</div>}

      {href && (
        <span
          aria-hidden
          className="absolute right-5 bottom-5 flex size-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors duration-200 group-hover:border-[var(--border-glow)] group-hover:bg-[var(--surface-hover)] group-hover:text-[var(--text)]"
        >
          <ArrowUpRight className="size-4" strokeWidth={2} />
        </span>
      )}
    </>
  );

  const classes =
    'glass group relative block rounded-2xl p-5 transition-[transform,border-color,background-color] duration-300 ' +
    'hover:border-[var(--border-glow)] hover:bg-[var(--surface-hover)] motion-safe:hover:-translate-y-1 ' +
    (href ? 'pb-16 ' : '') +
    className;

  if (!href) {
    return <div className={classes}>{inner}</div>;
  }

  if (external || href.startsWith('#') || href.startsWith('http')) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
