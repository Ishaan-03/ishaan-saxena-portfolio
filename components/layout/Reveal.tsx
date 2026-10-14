'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Scroll reveal from section 3: fade in + 16px up, 0.5s, staggered 0.06s
 * between items, each element animating once.
 *
 * motion's `whileInView` with `once` handles the "animates once" rule, and
 * `useReducedMotion` is respected through MotionConfig in the layout.
 */
export function Reveal({
  children,
  index = 0,
  className = '',
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
