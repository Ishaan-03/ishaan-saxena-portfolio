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
  /**
   * `lit` fills the icon tile with the primary gradient and tints the card.
   * `muted` keeps the tile neutral. The reference alternates the two across its
   * four hero cards rather than making them all identical.
   */
  tone?: 'lit' | 'muted';
};

/**
 * The glass card from section 3: radius 16, --surface, 1px --border, backdrop
 * blur, 20 to 24px padding.
 *
 * The fill is a diagonal wash that is brightest at the top-left corner and
 * fades out toward the bottom-right, and the border is a matching gradient.
 * A flat translucent panel looks dead next to the reference, which lights every
 * card as though the glow behind the globe were falling on it.
 */
export function GlassCard({
  icon: Icon,
  title,
  children,
  href,
  external = false,
  className = '',
  footer,
  tone = 'lit',
}: Props) {
  const inner = (
    <>
      {/* Gradient border, drawn as a masked ring so the fill stays translucent. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl p-px [background:linear-gradient(140deg,rgba(96,165,250,0.45),rgba(96,165,250,0.08)_38%,rgba(255,255,255,0.05)_70%)] [mask-composite:exclude] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] transition-opacity duration-300 group-hover:opacity-0"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl p-px opacity-0 [background:linear-gradient(140deg,rgba(147,197,253,0.85),rgba(96,165,250,0.25)_45%,rgba(255,255,255,0.08)_75%)] [mask-composite:exclude] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] transition-opacity duration-300 group-hover:opacity-100"
      />

      <span className="relative block">
        {Icon && (
          <span
            aria-hidden
            className={
              'mb-4 flex size-11 items-center justify-center rounded-full ' +
              (tone === 'lit'
                ? 'bg-[radial-gradient(circle_at_30%_25%,#60A5FA,#2563EB_70%)] shadow-[0_6px_20px_rgba(37,99,235,0.45)]'
                : 'border border-[var(--border)] bg-[rgba(255,255,255,0.05)]')
            }
          >
            <Icon
              className={tone === 'lit' ? 'size-5 text-white' : 'size-5 text-[var(--text-muted)]'}
              strokeWidth={2}
            />
          </span>
        )}

        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">{title}</h3>

        {children && (
          <div className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
            {children}
          </div>
        )}

        {footer && <div className="mt-4">{footer}</div>}
      </span>

      {href && (
        <span
          aria-hidden
          className="absolute right-5 bottom-5 flex size-8 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] transition-colors duration-200 group-hover:border-[var(--border-glow)] group-hover:bg-[rgba(59,130,246,0.18)] group-hover:text-[var(--text)]"
        >
          <ArrowUpRight className="size-4" strokeWidth={2} />
        </span>
      )}
    </>
  );

  const fill =
    tone === 'lit'
      ? 'bg-[linear-gradient(145deg,rgba(37,99,235,0.20),rgba(30,58,138,0.06)_48%,rgba(255,255,255,0.015)_100%)]'
      : 'bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_55%,rgba(255,255,255,0.01)_100%)]';

  const classes =
    'group relative block overflow-hidden rounded-2xl p-5 backdrop-blur-xl ' +
    'shadow-[0_8px_32px_rgba(2,4,10,0.55)] ' +
    'transition-[transform,box-shadow] duration-300 ' +
    'motion-safe:hover:-translate-y-1 hover:shadow-[0_14px_44px_rgba(37,99,235,0.28)] ' +
    fill +
    ' ' +
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
