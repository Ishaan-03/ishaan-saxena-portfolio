import type { ReactNode } from 'react';

/** Mono 11px chip for tech names. Section 3. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-mono text-[11px] leading-none text-[var(--text-muted)]">
      {children}
    </span>
  );
}
