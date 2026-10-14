'use client';

import { GitBranch, KeyRound, Lock, Radar } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';

/**
 * The four cards around the globe, from section 4. Two on the left, two on the
 * right, staggered vertically like the reference. Each links to its project.
 *
 * Desktop floats them either side of the canvas. Below lg they fall into a 2x2
 * grid under the globe, which is what section 4 asks for on mobile.
 */
const CARDS = [
  {
    key: 'identity',
    icon: KeyRound,
    href: '#project-northbeam-lite',
    side: 'left',
    row: 'top',
    tone: 'lit',
  },
  {
    key: 'dataProtection',
    icon: Lock,
    href: '#project-data-protection',
    side: 'left',
    row: 'bottom',
    tone: 'muted',
  },
  {
    key: 'detection',
    icon: Radar,
    href: '#project-detection',
    side: 'right',
    row: 'top',
    tone: 'lit',
  },
  {
    key: 'devsecops',
    icon: GitBranch,
    href: '#project-gatekeeper',
    side: 'right',
    row: 'bottom',
    tone: 'muted',
  },
] as const;

/** Each card drifts on its own 6s loop, out of phase, so they never march in step. */
const FLOAT_DELAY = [0, 1.7, 0.8, 2.6];

/** Desktop cards are positioned against the globe stage; mobile cards flow after it. */
export function HeroCards({ variant }: { variant: 'floating' | 'grid' }) {
  const t = useTranslations('hero.cards');
  const reduced = useReducedMotion();

  if (variant === 'grid') {
    return (
      <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
        {CARDS.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard
              icon={card.icon}
              tone={card.tone}
              title={t(`${card.key}.title`)}
              href={card.href}
            >
              {t(`${card.key}.body`)}
            </GlassCard>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {CARDS.map((card, index) => (
          <motion.div
            key={card.key}
            className={
              'pointer-events-auto absolute w-[228px] xl:w-[244px] ' +
              (card.side === 'left' ? 'left-2 xl:left-0 ' : 'right-2 xl:right-0 ') +
              (card.row === 'top' ? '-top-[86px]' : 'top-[186px]')
            }
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={reduced ? undefined : { y: [-6, 6, -6] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: FLOAT_DELAY[index],
              }}
            >
              <GlassCard
                icon={card.icon}
                tone={card.tone}
                title={t(`${card.key}.title`)}
                href={card.href}
              >
                {t(`${card.key}.body`)}
              </GlassCard>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
