export interface LearnCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tutorialCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const defaultLearnCategories: LearnCategory[] = [
  {
    id: '1',
    name: 'Blockchain Basics',
    slug: 'blockchain-basics',
    description: 'Fundamental concepts of blockchain technology',
    icon: '🔗',
    color: '#3B82F6',
    tutorialCount: 45,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '2',
    name: 'Smart Contracts',
    slug: 'smart-contracts',
    description: 'Learn to build and deploy smart contracts',
    icon: '📜',
    color: '#8B5CF6',
    tutorialCount: 38,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '3',
    name: 'DeFi Protocols',
    slug: 'defi-protocols',
    description: 'Understanding decentralized finance',
    icon: '💎',
    color: '#10B981',
    tutorialCount: 52,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '4',
    name: 'Trading & Analysis',
    slug: 'trading-analysis',
    description: 'Technical analysis and trading strategies',
    icon: '📈',
    color: '#F59E0B',
    tutorialCount: 67,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '5',
    name: 'Wallet Security',
    slug: 'wallet-security',
    description: 'Secure your crypto assets',
    icon: '🔐',
    color: '#EF4444',
    tutorialCount: 29,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '6',
    name: 'NFT Creation',
    slug: 'nft-creation',
    description: 'Create and mint your own NFTs',
    icon: '🎨',
    color: '#EC4899',
    tutorialCount: 34,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '7',
    name: 'Web3 Development',
    slug: 'web3-development',
    description: 'Build decentralized applications',
    icon: '💻',
    color: '#06B6D4',
    tutorialCount: 41,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '8',
    name: 'DAO Governance',
    slug: 'dao-governance',
    description: 'Participate in decentralized organizations',
    icon: '🏛️',
    color: '#6366F1',
    tutorialCount: 23,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  }
];
