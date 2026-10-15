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
          <div
            key={card.key}
            className="animate-rise"
            style={{ animationDelay: `${300 + index * 60}ms` }}
          >
            <GlassCard
              icon={card.icon}
              tone={card.tone}
              title={t(`${card.key}.title`)}
              href={card.href}
              headingLevel="h2"
            >
              {t(`${card.key}.body`)}
            </GlassCard>
          </div>
        ))}
      </div>
    );
  }

  /**
   * Each side is one flex column rather than two absolutely positioned cards.
   *
   * The cards used to sit at fixed offsets measured against the English text.
   * French runs longer, the top card grew past the gap, and the two overlapped
   * by up to 95px. A column with a gap cannot do that whatever the language.
   * The right column starts lower to keep the staggered look from the
   * reference.
   */
  const column = (side: 'left' | 'right') => (
    <div
      className={
        'pointer-events-none absolute flex w-[228px] flex-col gap-6 xl:w-[244px] ' +
        (side === 'left' ? 'left-2 -top-[86px] xl:left-0' : 'right-2 -top-[20px] xl:right-0')
      }
    >
      {CARDS.filter((card) => card.side === side).map((card) => {
        const index = CARDS.indexOf(card);

        return (
          <div
            key={card.key}
            className="animate-rise pointer-events-auto"
            style={{ animationDelay: `${300 + index * 60}ms` }}
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
                headingLevel="h2"
              >
                {t(`${card.key}.body`)}
              </GlassCard>
            </motion.div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      {column('left')}
      {column('right')}
    </div>
  );
}
