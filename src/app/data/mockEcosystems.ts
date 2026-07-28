export interface Ecosystem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Emoji or icon name
  color: string; // Hex color
  logo?: string; // Optional logo URL
  tutorialCount: number;
  projectCount: number;
  marketCap?: string;
  isActive: boolean;
  featured: boolean;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export const defaultEcosystems: Ecosystem[] = [
  {
    id: '1',
    name: 'Ethereum',
    slug: 'ethereum',
    description: 'The world\'s programmable blockchain with smart contracts',
    icon: '⟠',
    color: '#627EEA',
    tutorialCount: 0,
    projectCount: 0,
    marketCap: '$200B+',
    isActive: true,
    featured: true,
    website: 'https://ethereum.org',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '2',
    name: 'Solana',
    slug: 'solana',
    description: 'High-performance blockchain supporting 65k+ TPS',
    icon: '◎',
    color: '#14F195',
    tutorialCount: 0,
    projectCount: 0,
    marketCap: '$50B+',
    isActive: true,
    featured: true,
    website: 'https://solana.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '3',
    name: 'Polygon',
    slug: 'polygon',
    description: 'Ethereum scaling solution with zkEVM technology',
    icon: '⬡',
    color: '#8247E5',
    tutorialCount: 0,
    projectCount: 0,
    marketCap: '$8B+',
    isActive: true,
    featured: true,
    website: 'https://polygon.technology',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '4',
    name: 'BNB Chain',
    slug: 'bnb',
    description: 'Community-driven blockchain ecosystem with DeFi focus',
    icon: '🔶',
    color: '#F3BA2F',
    tutorialCount: 0,
    projectCount: 0,
    marketCap: '$45B+',
    isActive: true,
    featured: true,
    website: 'https://www.bnbchain.org',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '5',
    name: 'Avalanche',
    slug: 'avalanche',
    description: 'Fast, low-cost, and eco-friendly blockchain platform',
    icon: '🔺',
    color: '#E84142',
    tutorialCount: 0,
    projectCount: 0,
    marketCap: '$12B+',
    isActive: true,
    featured: false,
    website: 'https://www.avax.network',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '6',
    name: 'Arbitrum',
    slug: 'arbitrum',
    description: 'Optimistic rollup scaling Ethereum with lower fees',
    icon: '🔵',
    color: '#28A0F0',
    tutorialCount: 0,
    projectCount: 0,
    marketCap: '$6B+',
    isActive: true,
    featured: false,
    website: 'https://arbitrum.io',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '7',
    name: 'Optimism',
    slug: 'optimism',
    description: 'Layer 2 scaling solution for Ethereum',
    icon: '🔴',
    color: '#FF0420',
    tutorialCount: 0,
    projectCount: 0,
    marketCap: '$5B+',
    isActive: true,
    featured: false,
    website: 'https://optimism.io',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '8',
    name: 'Base',
    slug: 'base',
    description: 'Coinbase\'s Layer 2 built on Optimism Stack',
    icon: '🔷',
    color: '#0052FF',
    tutorialCount: 0,
    projectCount: 0,
    marketCap: '$3B+',
    isActive: true,
    featured: false,
    website: 'https://base.org',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  }
];
