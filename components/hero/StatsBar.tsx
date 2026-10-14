'use client';

import { Cloud, Lock, ShieldCheck, Terminal } from 'lucide-react';
import { useInView, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { credentialCount } from '@/content/certifications';

const CHIPS = [Cloud, ShieldCheck, Lock, Terminal];

/**
 * Counts from 0 to `value` when it scrolls into view, once. Under
 * prefers-reduced-motion it renders the final number immediately, per
 * section 3.
 */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const started = useRef(false);

  // Starts at the final value so the server HTML and the first client render
  // always agree. Seeding this from `reduced` instead caused a hydration
  // mismatch for anyone with reduced motion on: the server has no media query,
  // so it rendered 0 while the client rendered the real number.
  // It also means the right figure is there without JavaScript.
  const [display, setDisplay] = useState(value);

  // Wind back to zero one frame after mount, so the count has somewhere to
  // start from. Done in a rAF callback rather than in the effect body: the
  // stats sit below the fold, so nobody sees the swap, and React is not asked
  // to re-render synchronously inside an effect.
  useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setDisplay(0));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  useEffect(() => {
    // Reduced motion keeps the final value and never animates, per section 3.
    if (reduced || started.current || !inView) return;

    started.current = true;
    let raf = 0;
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease out, so it slows into the final number.
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  const t = useTranslations('hero.stats');

  return (
    <div className="glass mx-auto flex max-w-4xl flex-col gap-6 rounded-2xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: icon chips instead of the reference's avatar stack. */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {CHIPS.map((Icon, index) => (
            <span
              key={index}
              className="flex size-8 items-center justify-center rounded-full border border-[var(--border)] bg-[#070C1A]"
            >
              <Icon className="size-3.5 text-[var(--accent)]" strokeWidth={2} aria-hidden />
            </span>
          ))}
        </div>
        <p className="max-w-[180px] text-[13px] leading-snug text-[var(--text-muted)]">
          {t('realAccount')}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:items-start sm:gap-8">
        <Stat label={t('builds')}>
          <CountUp value={5} />
        </Stat>

        <Stat label={t('certificates')}>
          <CountUp value={credentialCount} />
        </Stat>

        <Stat label={t('cves')}>
          <span className="text-[var(--text-muted)]">344</span>
          <span className="mx-1 text-[var(--text-muted)]">→</span>
          <CountUp value={44} />
        </Stat>

        <Stat label={t('keysInCi')}>
          <CountUp value={0} />
        </Stat>
      </dl>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="animate-rise [animation-delay:350ms]">
      <dd className="text-gradient-accent text-xl font-semibold tabular-nums">{children}</dd>
      <dt className="mt-0.5 text-[11px] whitespace-nowrap text-[var(--text-muted)]">{label}</dt>
    </div>
  );
}
