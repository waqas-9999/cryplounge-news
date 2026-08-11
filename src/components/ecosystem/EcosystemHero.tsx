'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

/** Fixed node layout for the network visual — deterministic, no client-only randomness. */
const NODES = [
  { x: 60, y: 60 }, { x: 200, y: 30 }, { x: 320, y: 90 },
  { x: 110, y: 160 }, { x: 260, y: 190 }, { x: 40, y: 260 },
  { x: 190, y: 260 }, { x: 330, y: 230 }, { x: 260, y: 320 },
  { x: 100, y: 330 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 3], [2, 4], [3, 4],
  [3, 5], [3, 6], [4, 6], [4, 7], [6, 8], [6, 9], [5, 9], [8, 7],
];

function NetworkVisual() {
  return (
    <svg
      viewBox="0 0 380 380"
      className="w-full max-w-md mx-auto"
      role="img"
      aria-label="Blockchain network visualization"
    >
      {EDGES.map(([a, b], i) => (
        <motion.line
          key={`${a}-${b}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="currentColor"
          className="text-gray-300 dark:text-gray-700"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.15 + i * 0.04, ease: 'easeInOut' }}
        />
      ))}
      {NODES.map((node, i) => (
        <motion.circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={i % 3 === 0 ? 6 : 4}
          className={i % 3 === 0 ? 'fill-[#FFD200]' : 'fill-gray-400 dark:fill-gray-600'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
        />
      ))}
    </svg>
  );
}

export function EcosystemHero() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/ecosystem?q=${encodeURIComponent(q)}` : '/ecosystem');
  };

  return (
    <section className="relative border-b border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-14 md:py-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD200]" />
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Ecosystem Intelligence
              </span>
            </div>

            <h1 className="text-gray-900 dark:text-white text-4xl md:text-6xl leading-[1.1] mb-6 font-serif">
              Explore the crypto ecosystem.
            </h1>

            <p className="text-gray-600 dark:text-gray-400 max-w-xl text-lg leading-relaxed mb-8">
              Discover blockchain networks, protocols, companies and technologies shaping
              digital assets — researched, verified and organized by our newsroom.
            </p>

            <form onSubmit={handleSubmit} className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ecosystems…"
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD200] text-sm"
              />
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <NetworkVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
