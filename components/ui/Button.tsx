import { ArrowRight } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type Variant = 'primary' | 'secondary';
type Size = 'md' | 'lg';

const base =
  'group inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
  'transition-[transform,background-color,border-color,box-shadow] duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ' +
  'disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-px';

const variants: Record<Variant, string> = {
  // Solid primary with the glow from section 3. Hover brightens and lifts 1px.
  primary:
    'bg-[var(--primary)] text-white shadow-[0_0_24px_rgba(59,130,246,0.45)] ' +
    'hover:bg-[var(--primary-hover)] hover:shadow-[0_0_32px_rgba(59,130,246,0.6)]',
  secondary:
    'border border-[var(--border)] bg-transparent text-[var(--text)] ' +
    'hover:bg-[var(--surface-hover)] hover:border-[var(--border-glow)]',
};

const sizes: Record<Size, string> = {
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

/** The arrow sits in a small circle, as in the reference. */
function ArrowChip() {
  return (
    <span
      aria-hidden
      className="flex size-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <ArrowRight className="size-3" strokeWidth={2.5} />
    </span>
  );
}

type SharedProps = {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = 'primary',
  size = 'md',
  withArrow = false,
  children,
  className = '',
  ...rest
}: SharedProps & ComponentPropsWithoutRef<'button'>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
      {withArrow && <ArrowChip />}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  withArrow = false,
  children,
  className = '',
  external = false,
  ...rest
}: SharedProps & { href: string; external?: boolean } & Omit<
    ComponentPropsWithoutRef<'a'>,
    'href'
  >) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      {children}
      {withArrow && <ArrowChip />}
    </>
  );

  // Anchor links and outbound links skip the locale-aware Link.
  if (external || href.startsWith('#') || href.startsWith('http')) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}
