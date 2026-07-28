import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Award, Lightbulb, Network, Rocket } from 'lucide-react';

export function LearnHeroAnimation() {
  // Floating learning icons
  const floatingIcons = [
    { Icon: BookOpen, delay: 0, x: 20, y: 30, duration: 6 },
    { Icon: GraduationCap, delay: 0.5, x: 60, y: 10, duration: 7 },
    { Icon: Award, delay: 1, x: 80, y: 50, duration: 5.5 },
    { Icon: Lightbulb, delay: 1.5, x: 15, y: 70, duration: 6.5 },
    { Icon: Network, delay: 2, x: 40, y: 85, duration: 7.5 },
    { Icon: Rocket, delay: 0.7, x: 70, y: 25, duration: 6 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
      {/* Orbiting Rings representing learning paths */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-[600px] h-[600px] rounded-full border-2 border-yellow-400/30 dark:border-yellow-500/20" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-[450px] h-[450px] rounded-full border-2 border-blue-400/30 dark:border-blue-500/20" />
      </motion.div>

      {/* Floating Icons */}
      {floatingIcons.map((item, index) => {
        const Icon = item.Icon;
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{ 
              left: `${item.x}%`, 
              top: `${item.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.3, 0.7, 0.3],
              scale: [0.8, 1.2, 0.8],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 shadow-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        );
      })}

      {/* Animated Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-yellow-400 dark:bg-yellow-500"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Knowledge Nodes Network */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
        <motion.path
          d="M 100 100 Q 200 150, 300 100 T 500 100"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 150 200 Q 250 250, 350 200 T 550 200"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
            <stop offset="50%" stopColor="#facc15" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
