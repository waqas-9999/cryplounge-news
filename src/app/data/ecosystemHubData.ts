// Ecosystem Learn Hub Page Data - Admin Manageable

export interface HubStat {
  id: string;
  label: string;
  value: string;
  icon: string;
  enabled: boolean;
  order: number;
}

export interface HubFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  enabled: boolean;
  order: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  ecosystems: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  icon: string;
  color: string;
  enabled: boolean;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  ecosystem: string;
  rating: number;
  enabled: boolean;
  order: number;
}

export interface ComparisonFeature {
  id: string;
  feature: string;
  ecosystems: {
    [key: string]: string; // ecosystem id -> value/description
  };
  enabled: boolean;
  order: number;
}

export interface HubContent {
  hero: {
    badge: {
      icon: string;
      text: string;
    };
    title: string;
    titleHighlight: string;
    description: string;
    stats: HubStat[];
  };
  features: HubFeature[];
  learningPaths: LearningPath[];
  testimonials: Testimonial[];
  comparison: ComparisonFeature[];
  cta: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
}

// Default Hub Content
export const ecosystemHubContent: HubContent = {
  hero: {
    badge: {
      icon: 'Layers',
      text: 'Ecosystem Learn - Blockchain Specific'
    },
    title: 'Master Every',
    titleHighlight: 'Blockchain',
    description: 'Deep dive into specific blockchain ecosystems. Learn platform-specific development, explore dApps and protocols, and master each network\'s unique features.',
    stats: [
      {
        id: '1',
        label: 'Ecosystems',
        value: '6',
        icon: 'Layers',
        enabled: true,
        order: 1
      },
      {
        id: '2',
        label: 'Courses',
        value: '60+',
        icon: 'BookOpen',
        enabled: true,
        order: 2
      },
      {
        id: '3',
        label: 'Projects',
        value: '100+',
        icon: 'Rocket',
        enabled: true,
        order: 3
      },
      {
        id: '4',
        label: 'Students',
        value: '15K+',
        icon: 'Users',
        enabled: true,
        order: 4
      }
    ]
  },
  features: [
    {
      id: '1',
      title: 'Network-Specific Courses',
      description: 'Learn the unique features, tools, and best practices for each blockchain platform',
      icon: 'Layers',
      color: 'blue',
      enabled: true,
      order: 1
    },
    {
      id: '2',
      title: 'Project Deep Dives',
      description: 'Explore popular dApps, DeFi protocols, and NFT projects built on each ecosystem',
      icon: 'Sparkles',
      color: 'purple',
      enabled: true,
      order: 2
    },
    {
      id: '3',
      title: 'Real-World Development',
      description: 'Build actual dApps and smart contracts with hands-on tutorials and examples',
      icon: 'TrendingUp',
      color: 'green',
      enabled: true,
      order: 3
    },
    {
      id: '4',
      title: 'Ecosystem Comparison',
      description: 'Understand the differences between chains and choose the right one for your project',
      icon: 'GitCompare',
      color: 'orange',
      enabled: true,
      order: 4
    },
    {
      id: '5',
      title: 'Developer Tools',
      description: 'Master wallets, IDEs, testnets, and deployment tools for each blockchain',
      icon: 'Wrench',
      color: 'indigo',
      enabled: true,
      order: 5
    },
    {
      id: '6',
      title: 'Community Support',
      description: 'Join active developer communities and get help from ecosystem experts',
      icon: 'Users',
      color: 'pink',
      enabled: true,
      order: 6
    }
  ],
  learningPaths: [
    {
      id: '1',
      title: 'EVM Developer Journey',
      description: 'Master Ethereum and EVM-compatible chains like Polygon, Avalanche, and BNB Chain',
      ecosystems: ['ethereum', 'polygon', 'avalanche', 'bnb-chain'],
      difficulty: 'Intermediate',
      duration: '8 weeks',
      icon: 'Code2',
      color: 'blue',
      enabled: true,
      order: 1
    },
    {
      id: '2',
      title: 'Solana Speed Track',
      description: 'Learn Rust and build high-performance dApps on Solana',
      ecosystems: ['solana'],
      difficulty: 'Advanced',
      duration: '6 weeks',
      icon: 'Zap',
      color: 'purple',
      enabled: true,
      order: 2
    },
    {
      id: '3',
      title: 'Multi-Chain Developer',
      description: 'Become proficient across multiple ecosystems and build cross-chain applications',
      ecosystems: ['ethereum', 'solana', 'polygon', 'avalanche'],
      difficulty: 'Advanced',
      duration: '12 weeks',
      icon: 'Network',
      color: 'green',
      enabled: true,
      order: 3
    },
    {
      id: '4',
      title: 'DeFi Builder Path',
      description: 'Specialize in DeFi protocols across Ethereum, Polygon, and Avalanche',
      ecosystems: ['ethereum', 'polygon', 'avalanche'],
      difficulty: 'Advanced',
      duration: '10 weeks',
      icon: 'TrendingUp',
      color: 'yellow',
      enabled: true,
      order: 4
    },
    {
      id: '5',
      title: 'NFT Creator Track',
      description: 'Build NFT marketplaces and collections on Ethereum and Solana',
      ecosystems: ['ethereum', 'solana'],
      difficulty: 'Intermediate',
      duration: '6 weeks',
      icon: 'Image',
      color: 'pink',
      enabled: true,
      order: 5
    },
    {
      id: '6',
      title: 'Blockchain Beginner',
      description: 'Start your journey with beginner-friendly courses on any ecosystem',
      ecosystems: ['ethereum', 'polygon'],
      difficulty: 'Beginner',
      duration: '4 weeks',
      icon: 'Sparkles',
      color: 'indigo',
      enabled: true,
      order: 6
    }
  ],
  testimonials: [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Blockchain Developer',
      company: 'ConsenSys',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      content: 'The Ethereum courses helped me land my dream job at ConsenSys. The hands-on projects were invaluable!',
      ecosystem: 'ethereum',
      rating: 5,
      enabled: true,
      order: 1
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      role: 'Smart Contract Engineer',
      company: 'Solana Foundation',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      content: 'Best Solana course I\'ve found. Clear explanations and real-world examples made learning Rust easy.',
      ecosystem: 'solana',
      rating: 5,
      enabled: true,
      order: 2
    },
    {
      id: '3',
      name: 'Priya Patel',
      role: 'DeFi Developer',
      company: 'Polygon Labs',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      content: 'The Polygon courses are comprehensive and up-to-date. Learned how to build scalable dApps efficiently.',
      ecosystem: 'polygon',
      rating: 5,
      enabled: true,
      order: 3
    },
    {
      id: '4',
      name: 'Alex Rivera',
      role: 'Full Stack Web3 Dev',
      company: 'Avalanche',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      content: 'Avalanche subnet development course was exactly what I needed. Now building custom blockchains!',
      ecosystem: 'avalanche',
      rating: 5,
      enabled: true,
      order: 4
    },
    {
      id: '5',
      name: 'Li Wei',
      role: 'NFT Developer',
      company: 'OpenSea',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      content: 'Multi-chain NFT course taught me to deploy on both Ethereum and Solana. Game changer!',
      ecosystem: 'ethereum',
      rating: 5,
      enabled: true,
      order: 5
    },
    {
      id: '6',
      name: 'Emma Watson',
      role: 'Blockchain Architect',
      company: 'BNB Chain',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      content: 'The BNB Chain courses cover everything from basics to advanced topics. Highly recommended!',
      ecosystem: 'bnb-chain',
      rating: 5,
      enabled: true,
      order: 6
    }
  ],
  comparison: [
    {
      id: '1',
      feature: 'Language',
      ecosystems: {
        'ethereum': 'Solidity',
        'polygon': 'Solidity',
        'solana': 'Rust',
        'avalanche': 'Solidity',
        'bnb-chain': 'Solidity',
        'bitcoin': 'Script'
      },
      enabled: true,
      order: 1
    },
    {
      id: '2',
      feature: 'Transaction Speed',
      ecosystems: {
        'ethereum': '15 TPS',
        'polygon': '7,000 TPS',
        'solana': '65,000 TPS',
        'avalanche': '4,500 TPS',
        'bnb-chain': '160 TPS',
        'bitcoin': '7 TPS'
      },
      enabled: true,
      order: 2
    },
    {
      id: '3',
      feature: 'Average Fee',
      ecosystems: {
        'ethereum': '$2-50',
        'polygon': '$0.01-0.1',
        'solana': '$0.00025',
        'avalanche': '$0.1-2',
        'bnb-chain': '$0.1-0.5',
        'bitcoin': '$1-5'
      },
      enabled: true,
      order: 3
    },
    {
      id: '4',
      feature: 'Consensus',
      ecosystems: {
        'ethereum': 'PoS',
        'polygon': 'PoS',
        'solana': 'PoH + PoS',
        'avalanche': 'Avalanche',
        'bnb-chain': 'PoSA',
        'bitcoin': 'PoW'
      },
      enabled: true,
      order: 4
    },
    {
      id: '5',
      feature: 'Best For',
      ecosystems: {
        'ethereum': 'DeFi, NFTs',
        'polygon': 'Gaming, NFTs',
        'solana': 'High-speed dApps',
        'avalanche': 'Subnets, DeFi',
        'bnb-chain': 'Trading, DeFi',
        'bitcoin': 'Store of Value'
      },
      enabled: true,
      order: 5
    }
  ],
  cta: {
    title: 'Not sure which ecosystem to start with?',
    description: 'Check out our Cryp Learn section to understand the fundamentals first, then come back to explore specific blockchains.',
    buttonText: 'Start with Cryp Learn',
    buttonLink: 'learn/crypto'
  }
};

// Helper function to get enabled items sorted by order
export function getEnabledStats(): HubStat[] {
  return ecosystemHubContent.hero.stats
    .filter(stat => stat.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getEnabledFeatures(): HubFeature[] {
  return ecosystemHubContent.features
    .filter(feature => feature.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getEnabledLearningPaths(): LearningPath[] {
  return ecosystemHubContent.learningPaths
    .filter(path => path.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getEnabledTestimonials(): Testimonial[] {
  return ecosystemHubContent.testimonials
    .filter(testimonial => testimonial.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getEnabledComparisonFeatures(): ComparisonFeature[] {
  return ecosystemHubContent.comparison
    .filter(feature => feature.enabled)
    .sort((a, b) => a.order - b.order);
}
