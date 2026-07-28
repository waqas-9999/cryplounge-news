import { motion } from 'motion/react';
import { BookOpen, Code, Shield, TrendingUp, Layers, Zap, Brain, Target } from 'lucide-react';

export function CrypLearnHeroAnimation() {
  // Category icons representing different learning paths
  const learningNodes = [
    { Icon: BookOpen, x: 15, y: 20, color: 'from-blue-400 to-blue-600', delay: 0 },
    { Icon: Code, x: 75, y: 15, color: 'from-purple-400 to-purple-600', delay: 0.3 },
    { Icon: Shield, x: 85, y: 60, color: 'from-red-400 to-red-600', delay: 0.6 },
    { Icon: TrendingUp, x: 65, y: 80, color: 'from-green-400 to-green-600', delay: 0.9 },
    { Icon: Layers, x: 25, y: 75, color: 'from-yellow-400 to-yellow-600', delay: 1.2 },
    { Icon: Zap, x: 10, y: 50, color: 'from-orange-400 to-orange-600', delay: 1.5 },
    { Icon: Brain, x: 45, y: 35, color: 'from-indigo-400 to-indigo-600', delay: 1.8 },
    { Icon: Target, x: 50, y: 65, color: 'from-teal-400 to-teal-600', delay: 2.1 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
      {/* Floating Books */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`book-${i}`}
          className="absolute"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + (i % 2) * 20}%`,
          }}
          animate={{
            y: [-15, 15, -15],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 4 + i * 0.5,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <div className="w-12 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 rounded-md shadow-xl" />
            <div className="absolute inset-y-0 left-0 w-2 bg-yellow-600 dark:bg-yellow-800 rounded-l-md" />
          </div>
        </motion.div>
      ))}

      {/* Learning Path Nodes */}
      {learningNodes.map((node, index) => {
        const Icon = node.Icon;
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.4, 0.8, 0.4],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 3,
              delay: node.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className={`p-3 rounded-full bg-gradient-to-br ${node.color} shadow-xl`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        );
      })}

      {/* Connecting Lines between nodes */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.2 }}>
        {learningNodes.map((node, i) => {
          if (i < learningNodes.length - 1) {
            const nextNode = learningNodes[i + 1];
            return (
              <motion.line
                key={`line-${i}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${nextNode.x}%`}
                y2={`${nextNode.y}%`}
                stroke="url(#courseGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            );
          }
          return null;
        })}
        <defs>
          <linearGradient id="courseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Achievement Badges */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`badge-${i}`}
          className="absolute"
          style={{
            right: `${10 + i * 15}%`,
            bottom: `${15 + (i % 2) * 20}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 360],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 6 + i,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 rounded-full shadow-xl" />
            <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <motion.div
                className="w-2 h-2 bg-yellow-500 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Glowing Particles representing knowledge */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${i % 2 === 0 ? '#facc15' : '#fbbf24'} 0%, transparent 70%)`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 2, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Circuit-like Knowledge Network */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <motion.circle
            cx="250"
            cy="250"
            r="200"
            stroke="url(#circuitGradient)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="10 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <defs>
            <linearGradient id="circuitGradient">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
