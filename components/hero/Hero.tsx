'use client';

import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { GlobeFallback } from './globe/Globe';
import { HeroCards } from './HeroCards';
import { StatsBar } from './StatsBar';

/**
 * The canvas never renders on the server and is not part of the first paint, so
 * the H1 stays the LCP element. The fallback below occupies the same box, which
 * is why swapping it in causes no layout shift.
 */
const Globe = dynamic(() => import('./globe/Globe'), {
  ssr: false,
  loading: () => <GlobeFallback />,
});

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

type GlobeState = 'pending' | 'ready' | 'unsupported';

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const t = useTranslations('hero');
  const [globeState, setGlobeState] = useState<GlobeState>('pending');

  useEffect(() => {
    // Both the capability check and the mount wait until the browser is idle,
    // so the hero text paints first and stays the LCP element.
    const start = () => setGlobeState(supportsWebGL() ? 'ready' : 'unsupported');

    // `in` narrowing would make the fallback branch unreachable to TS, since
    // lib.dom declares requestIdleCallback as always present on Window.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(start, 400);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:pt-16">
        {/* Text block. Sits above the globe, which tucks in behind it. */}
        <div className="relative z-20 text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.5, ease: EASE }}>
            <Badge tone="green">{t('badge')}</Badge>
          </motion.div>

          <motion.h1
            className="mt-7"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.06, ease: EASE }}
          >
            <span className="block text-[var(--text)]">{t('headlineLine1')}</span>
            <span className="text-gradient-accent block">{t('headlineLine2')}</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-[var(--text-muted)]"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
          >
            <ButtonLink href="#projects" size="lg" withArrow>
              {t('primaryCta')}
            </ButtonLink>
            <ButtonLink href="#internship" variant="secondary" size="lg">
              {t('secondaryCta')}
            </ButtonLink>
          </motion.div>
        </div>

        {/*
          The globe stage. Fixed height so the canvas can be pulled up behind the
          text without the surrounding layout depending on it. The cards are
          positioned against this box on desktop.
        */}
        <div className="relative z-10 h-[300px] sm:h-[400px] lg:h-[460px]">
          {/*
            On phones the globe sits just under the text rather than behind it,
            so it never covers the two buttons. From sm up it tucks in behind,
            the way the reference does.
          */}
          <div className="pointer-events-none absolute left-1/2 aspect-square w-[min(84vw,600px)] -translate-x-1/2 top-[4px] sm:-top-[90px] lg:-top-[130px]">
            <div className="pointer-events-auto absolute inset-0">
              {globeState === 'ready' ? (
                <Globe
                  markers={{
                    paris: t('globe.paris'),
                    stockholm: t('globe.stockholm'),
                  }}
                />
              ) : (
                <GlobeFallback />
              )}
            </div>
          </div>

          <HeroCards variant="floating" />
        </div>

        <HeroCards variant="grid" />

        <div className="relative z-20 mt-6 lg:mt-2">
          <StatsBar />
        </div>
      </div>
    </section>
  );
}
