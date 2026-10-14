'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const STEPS = ['predict', 'build', 'break', 'verify', 'document'] as const;

/**
 * Horizontal on desktop, vertical on mobile. Steps light up one after another
 * as the row scrolls in, which is the only thing that moves here.
 */
export function MethodStepper() {
  const t = useTranslations('about.method');

  return (
    <div className="mx-auto mt-16 max-w-6xl px-5">
      <p className="mb-7 text-center font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
        {t('label')}
      </p>

      <ol className="grid gap-4 md:grid-cols-5">
        {STEPS.map((step, index) => (
          <motion.li
            key={step}
            className="relative"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Connector, desktop only. */}
            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                className="absolute top-4 left-[calc(50%+22px)] hidden h-px w-[calc(100%-44px)] bg-gradient-to-r from-[var(--border-glow)] to-transparent md:block"
              />
            )}

            <div className="flex items-start gap-3 md:block">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-glow)] bg-[rgba(37,99,235,0.14)] font-mono text-[11px] text-[var(--accent)] md:mx-auto">
                {index + 1}
              </span>
              <div className="md:mt-3 md:text-center">
                <p className="text-[13px] font-semibold text-[var(--text)]">{t(`${step}.title`)}</p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">{t(`${step}.line`)}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
