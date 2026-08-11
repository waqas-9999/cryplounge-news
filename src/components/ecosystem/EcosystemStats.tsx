'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Boxes, Network, Sparkles, Newspaper, type LucideIcon } from 'lucide-react';

export interface EcosystemStat {
  label: string;
  value: number;
  icon: 'projects' | 'networks' | 'featured' | 'stories';
}

const ICONS: Record<EcosystemStat['icon'], LucideIcon> = {
  projects: Boxes,
  networks: Network,
  featured: Sparkles,
  stories: Newspaper,
};

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const start = performance.now();

    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {inView && display === value && value >= 100 ? '+' : ''}
    </span>
  );
}

export function EcosystemStats({ stats }: { stats: EcosystemStat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = ICONS[stat.icon];
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm p-5 hover:border-[#FFD200] dark:hover:border-[#FFD200] hover:-translate-y-0.5 transition-all duration-200"
          >
            <Icon className="w-4 h-4 text-[#FFD200] mb-4" />
            <div className="text-2xl md:text-3xl text-gray-900 dark:text-white font-serif">
              <Counter value={stat.value} />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
