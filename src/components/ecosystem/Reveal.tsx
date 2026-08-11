'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Scroll-reveal wrapper for otherwise server-rendered section content.
 *
 * Children are rendered on the server as usual; this only adds the
 * client-side entrance animation around them.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
