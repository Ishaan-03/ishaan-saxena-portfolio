'use client';

import { motion, useScroll, useSpring } from 'motion/react';

/** 2px progress line at the very top, in --primary. Section 5, "Also build". */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[var(--primary)]"
    />
  );
}
