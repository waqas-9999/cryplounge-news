export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  articleCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Finance',
    slug: 'finance',
    description: 'Financial news, markets, and crypto economics',
    icon: '💵',
    color: '#10B981',
    articleCount: 312,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '2',
    name: 'Technology',
    slug: 'technology',
    description: 'Blockchain technology and crypto innovations',
    icon: '⚡',
    color: '#3B82F6',
    articleCount: 201,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '3',
    name: 'Geopolitics',
    slug: 'geopolitics',
    description: 'Global politics, regulations, and policy impacting crypto',
    icon: '🌍',
    color: '#EF4444',
    articleCount: 156,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '4',
    name: 'Business',
    slug: 'business',
    description: 'Business news, companies, and enterprise adoption',
    icon: '💼',
    color: '#9333EA',
    articleCount: 245,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '5',
    name: 'Bitcoin',
    slug: 'bitcoin',
    description: 'Latest news and updates about Bitcoin',
    icon: '₿',
    color: '#F7931A',
    articleCount: 245,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '6',
    name: 'Ethereum',
    slug: 'ethereum',
    description: 'Ethereum network, DApps, and smart contracts',
    icon: '⟠',
    color: '#627EEA',
    articleCount: 198,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '7',
    name: 'DeFi',
    slug: 'defi',
    description: 'Decentralized Finance protocols and news',
    icon: '💰',
    color: '#00D4AA',
    articleCount: 167,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '8',
    name: 'NFTs',
    slug: 'nfts',
    description: 'Non-Fungible Tokens and digital collectibles',
    icon: '🎨',
    color: '#FF6B9D',
    articleCount: 134,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  },
  {
    id: '9',
    name: 'Altcoins',
    slug: 'altcoins',
    description: 'Alternative cryptocurrencies and tokens',
    icon: '🪙',
    color: '#9333EA',
    articleCount: 289,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-13T00:00:00Z'
  }
];