import { motion } from 'motion/react';
import { Network, Layers, Link2, Boxes, Globe, Cpu } from 'lucide-react';

export function EcosystemLearnHeroAnimation() {
  // Ecosystem nodes representing different blockchain networks
  const ecosystemNodes = [
    { Icon: Boxes, x: 50, y: 30, delay: 0, color: 'from-purple-500 to-purple-600' },
    { Icon: Globe, x: 70, y: 50, delay: 0.2, color: 'from-blue-500 to-blue-600' },
    { Icon: Cpu, x: 50, y: 70, delay: 0.4, color: 'from-green-500 to-green-600' },
    { Icon: Network, x: 30, y: 50, delay: 0.6, color: 'from-yellow-500 to-yellow-600' },
    { Icon: Layers, x: 50, y: 50, delay: 0.8, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15 dark:opacity-10">
      {/* Central Hub */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 shadow-2xl flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
            <Network className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </motion.div>

      {/* Orbiting Ecosystem Nodes */}
      {ecosystemNodes.map((node, index) => {
        const Icon = node.Icon;
        const angle = (360 / ecosystemNodes.length) * index;
        return (
          <motion.div
            key={index}
            className="absolute top-1/2 left-1/2"
            style={{
              transformOrigin: '0 0',
            }}
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration: 25 + index * 2,
              repeat: Infinity,
              ease: "linear",
              delay: node.delay,
            }}
          >
            <motion.div
              className="absolute"
              style={{
                left: '150px',
                top: '-20px',
              }}
              animate={{
                rotate: [-angle, -angle - 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: {
                  duration: 25 + index * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: node.delay,
                },
                scale: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: node.delay,
                }
              }}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${node.color} shadow-xl flex items-center justify-center`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
        <motion.circle
          cx="50%"
          cy="50%"
          r="150"
          stroke="url(#ecosystemGradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="10 5"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <defs>
          <linearGradient id="ecosystemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Data Packets flowing between nodes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`packet-${i}`}
          className="absolute top-1/2 left-1/2"
          style={{
            transformOrigin: '0 0',
          }}
          animate={{
            rotate: [i * 60, i * 60 + 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.5,
          }}
        >
          <motion.div
            className="absolute"
            style={{
              left: '150px',
              top: '-4px',
            }}
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-yellow-400 dark:bg-yellow-500 shadow-lg" />
          </motion.div>
        </motion.div>
      ))}

      {/* Blockchain Blocks */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`block-${i}`}
          className="absolute"
          style={{
            left: `${15 + i * 20}%`,
            bottom: `${10 + (i % 2) * 15}%`,
          }}
          animate={{
            y: [-5, 5, -5],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 dark:from-purple-500 dark:to-blue-600 rounded-lg shadow-xl" />
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-yellow-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.3,
              }}
            />
          </div>
        </motion.div>
      ))}

      {/* Network Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500" />
        </motion.div>
      ))}

      {/* Hexagonal Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        {[...Array(6)].map((_, i) => (
          <motion.polygon
            key={`hex-${i}`}
            points="100,0 50,-87 -50,-87 -100,0 -50,87 50,87"
            transform={`translate(${200 + i * 150}, ${100 + (i % 2) * 100})`}
            stroke="url(#hexGradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
        <defs>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
