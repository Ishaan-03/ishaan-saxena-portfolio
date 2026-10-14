import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Green pulsing dot for availability, blue dot everywhere else. */
  tone?: 'blue' | 'green';
  className?: string;
};

/**
 * The small pill that sits above every heading. Section 3.
 * 12px text, dot on the left, --surface background.
 */
export function Badge({ children, tone = 'blue', className = '' }: Props) {
  return (
    <span
      className={`glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-[var(--text-muted)] ${className}`}
    >
      <span
        aria-hidden
        className={
          tone === 'green'
            ? 'size-1.5 rounded-full bg-[var(--available)] motion-safe:animate-pulse-dot'
            : 'size-1.5 rounded-full bg-[var(--accent)]'
        }
      />
      {children}
    </span>
  );
}
