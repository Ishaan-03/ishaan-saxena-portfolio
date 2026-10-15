'use client';

import dynamic from 'next/dynamic';
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
      {/* Wash of light behind the whole hero, so the cards sit in the glow
          rather than floating on flat black. */}
      <div aria-hidden className="hero-glow top-[120px]" />

      <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-16 sm:pt-16">
        {/*
          Text block. The entrance is the `animate-rise` CSS keyframe rather than
          a motion mount animation. This is the LCP content, and it must never
          depend on a JavaScript animation firing in order to become visible.
        */}
        <div className="relative z-20 text-center">
          <div className="animate-rise">
            <Badge tone="green">{t('badge')}</Badge>
          </div>

          <h1 className="animate-rise mt-6 [animation-delay:60ms]">
            <span className="block text-[var(--text)]">{t('headlineLine1')}</span>
            <span className="text-gradient-accent block">{t('headlineLine2')}</span>
          </h1>

          <p className="animate-rise mx-auto mt-5 max-w-xl text-[var(--text-muted)] [animation-delay:120ms]">
            {t('subtitle')}
          </p>

          <div className="animate-rise mt-7 flex flex-wrap items-center justify-center gap-3 [animation-delay:180ms]">
            <ButtonLink href="#projects" size="lg" withArrow>
              {t('primaryCta')}
            </ButtonLink>
            <ButtonLink href="#internship" variant="secondary" size="lg">
              {t('secondaryCta')}
            </ButtonLink>
          </div>
        </div>

        {/*
          The globe stage. Fixed height so the canvas can be pulled up behind the
          text without the surrounding layout depending on it. The cards are
          positioned against this box on desktop.
        */}
        <div className="relative z-10 h-[300px] sm:h-[430px] lg:h-[500px]">
          {/*
            On phones the globe sits just under the text rather than behind it,
            so it never covers the two buttons. From sm up it tucks in behind,
            the way the reference does.
          */}
          {/*
            Section 11: the globe is decoration. The hero text carries every
            fact it illustrates, so the canvas, its markers and its tooltips
            are hidden from assistive technology rather than read out as a
            wall of unlabelled graphics.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 aspect-square w-[min(84vw,620px)] -translate-x-1/2 top-[4px] sm:-top-[120px] sm:w-[min(80vw,720px)] lg:-top-[170px] lg:w-[min(64vw,820px)]"
          >
            <div aria-hidden className="globe-glow" />

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
