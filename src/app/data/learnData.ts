// Learn Section Data Structure

export interface Course {
  id: string;
  title: string;
  // Cryp Learn Categories (global topics)
  category: 'Blockchain Basics' | 'DeFi' | 'NFTs' | 'Trading' | 'Smart Contracts' | 'Security' | 'Protocols' | 'Web3 Development';
  // Ecosystem Learn (blockchain-specific)
  ecosystem?: 'Bitcoin' | 'Ethereum' | 'Solana' | 'Polygon' | 'Avalanche' | 'BNB Chain';
  // Ecosystem-specific categories
  ecosystemCategory?: 'DeFi' | 'DEX' | 'Protocol' | 'NFT' | 'DePIN' | 'RWA' | 'Gaming' | 'Infrastructure' | 'Wallet' | 'Bridge' | 'Lending' | 'Staking' | 'DAO' | 'Metaverse' | 'AI' | 'Storage';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string; // e.g., "2h 30m"
  lessonsCount: number;
  enrolledCount: number;
  rating: number; // 0-5
  reviewsCount: number;
  progress?: number; // 0-100 for user progress
  thumbnail?: string;
  description: string;
  instructor: string;
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  learnType: 'crypto' | 'ecosystem'; // Which main section it belongs to
  // XP Rewards System
  xpReward?: number; // Total XP for completing the course
  xpPerLesson?: number; // XP earned per lesson
  enrollXP?: number; // XP earned for enrollment
}

export interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalHoursSpent: number;
  lessonsCompleted: number;
  currentStreak: number;
}

export interface CrypLearnCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  courseCount: number;
}

export interface EcosystemInfo {
  id: string;
  name: string;
  description: string;
  color: string;
  courseCount: number;
  projectCount: number;
  logo: string;
}

export interface EcosystemCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Cryp Learn Categories
export const crypLearnCategories: CrypLearnCategory[] = [
  {
    id: 'blockchain-basics',
    name: 'Blockchain Basics',
    description: 'Fundamental concepts and principles of blockchain technology',
    icon: 'BookOpen',
    color: 'from-blue-500 to-blue-600',
    courseCount: 8,
  },
  {
    id: 'defi',
    name: 'DeFi',
    description: 'Decentralized finance protocols, yield farming, and liquidity',
    icon: 'Coins',
    color: 'from-yellow-500 to-yellow-600',
    courseCount: 12,
  },
  {
    id: 'nfts',
    name: 'NFTs',
    description: 'Non-fungible tokens, digital art, and collectibles',
    icon: 'Image',
    color: 'from-purple-500 to-purple-600',
    courseCount: 10,
  },
  {
    id: 'protocols',
    name: 'Protocols',
    description: 'Blockchain protocols, consensus mechanisms, and infrastructure',
    icon: 'Network',
    color: 'from-green-500 to-green-600',
    courseCount: 9,
  },
  {
    id: 'trading',
    name: 'Trading',
    description: 'Technical analysis, trading strategies, and risk management',
    icon: 'TrendingUp',
    color: 'from-red-500 to-red-600',
    courseCount: 11,
  },
  {
    id: 'smart-contracts',
    name: 'Smart Contracts',
    description: 'Smart contract development, Solidity, and Web3 programming',
    icon: 'Code',
    color: 'from-indigo-500 to-indigo-600',
    courseCount: 14,
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Cryptocurrency security, wallet safety, and auditing',
    icon: 'Shield',
    color: 'from-orange-500 to-orange-600',
    courseCount: 7,
  },
  {
    id: 'web3-development',
    name: 'Web3 Development',
    description: 'Building decentralized applications and Web3 integration',
    icon: 'Globe',
    color: 'from-teal-500 to-teal-600',
    courseCount: 13,
  },
];

// Ecosystem-specific Categories (used for filtering within each ecosystem)
export const ecosystemCategories: EcosystemCategory[] = [
  {
    id: 'defi',
    name: 'DeFi',
    description: 'Decentralized Finance protocols and platforms',
    icon: 'Coins',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 'dex',
    name: 'DEX',
    description: 'Decentralized Exchanges and trading platforms',
    icon: 'ArrowLeftRight',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'protocol',
    name: 'Protocol',
    description: 'Core blockchain protocols and infrastructure',
    icon: 'Network',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'nft',
    name: 'NFT',
    description: 'Non-Fungible Tokens and digital collectibles',
    icon: 'Image',
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: 'depin',
    name: 'DePIN',
    description: 'Decentralized Physical Infrastructure Networks',
    icon: 'Radio',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'rwa',
    name: 'RWA',
    description: 'Real World Assets tokenization',
    icon: 'Building',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Blockchain gaming and play-to-earn',
    icon: 'Gamepad2',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Core blockchain infrastructure and tooling',
    icon: 'Database',
    color: 'from-slate-500 to-slate-600',
  },
  {
    id: 'wallet',
    name: 'Wallet',
    description: 'Wallet solutions and key management',
    icon: 'Wallet',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    id: 'bridge',
    name: 'Bridge',
    description: 'Cross-chain bridges and interoperability',
    icon: 'Link',
    color: 'from-teal-500 to-teal-600',
  },
  {
    id: 'lending',
    name: 'Lending',
    description: 'Lending and borrowing protocols',
    icon: 'HandCoins',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'staking',
    name: 'Staking',
    description: 'Staking platforms and liquid staking',
    icon: 'TrendingUp',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 'dao',
    name: 'DAO',
    description: 'Decentralized Autonomous Organizations',
    icon: 'Users',
    color: 'from-violet-500 to-violet-600',
  },
  {
    id: 'metaverse',
    name: 'Metaverse',
    description: 'Virtual worlds and metaverse platforms',
    icon: 'Globe',
    color: 'from-fuchsia-500 to-fuchsia-600',
  },
  {
    id: 'ai',
    name: 'AI',
    description: 'Artificial Intelligence on blockchain',
    icon: 'Brain',
    color: 'from-sky-500 to-sky-600',
  },
  {
    id: 'storage',
    name: 'Storage',
    description: 'Decentralized storage solutions',
    icon: 'HardDrive',
    color: 'from-amber-500 to-amber-600',
  },
];

// Ecosystem Learn Info
export const ecosystemsInfo: EcosystemInfo[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    description: 'Leading smart contract platform',
    color: 'from-indigo-500 to-indigo-600',
    courseCount: 18,
    projectCount: 25,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  {
    id: 'solana',
    name: 'Solana',
    description: 'High-performance blockchain',
    color: 'from-green-500 to-green-600',
    courseCount: 12,
    projectCount: 18,
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    description: 'Layer 2 scaling solution',
    color: 'from-purple-500 to-purple-600',
    courseCount: 10,
    projectCount: 15,
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  },
  {
    id: 'bnb-chain',
    name: 'BNB Chain',
    description: 'Binance ecosystem blockchain',
    color: 'from-yellow-500 to-yellow-600',
    courseCount: 9,
    projectCount: 20,
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    description: 'Original cryptocurrency',
    color: 'from-orange-500 to-orange-600',
    courseCount: 8,
    projectCount: 12,
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    description: 'Fast & eco-friendly',
    color: 'from-red-500 to-red-600',
    courseCount: 7,
    projectCount: 14,
    logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
  },
];

// Sample courses data
export const courses: Course[] = [
  // Crypto Learn - Blockchain Basics
  {
    id: 'blockchain-101',
    title: 'Blockchain Technology 101',
    category: 'Blockchain Basics',
    difficulty: 'Beginner',
    duration: '2h 30m',
    lessonsCount: 10,
    enrolledCount: 5234,
    rating: 4.6,
    reviewsCount: 823,
    progress: 45,
    description: 'A comprehensive introduction to blockchain technology and its applications.',
    instructor: 'David Kim',
    tags: ['Blockchain', 'Basics', 'Introduction'],
    isNew: true,
    learnType: 'crypto',
    xpReward: 100,
    xpPerLesson: 15,
    enrollXP: 10,
  },
  {
    id: 'btc-fundamentals',
    title: 'Bitcoin Fundamentals: From Satoshi to Today',
    category: 'Blockchain Basics',
    difficulty: 'Beginner',
    duration: '3h 45m',
    lessonsCount: 12,
    enrolledCount: 2847,
    rating: 4.8,
    reviewsCount: 432,
    progress: 65,
    description: 'Master the fundamentals of Bitcoin, blockchain technology, and decentralization.',
    instructor: 'Sarah Chen',
    tags: ['Bitcoin', 'Blockchain', 'Cryptocurrency'],
    isFeatured: true,
    learnType: 'crypto',
    xpReward: 120,
    xpPerLesson: 20,
    enrollXP: 10,
  },
  
  // Crypto Learn - DeFi
  {
    id: 'defi-explained',
    title: 'DeFi Explained: Yield Farming & Liquidity',
    category: 'DeFi',
    difficulty: 'Intermediate',
    duration: '5h 15m',
    lessonsCount: 18,
    enrolledCount: 3421,
    rating: 4.7,
    reviewsCount: 612,
    progress: 100,
    description: 'Understand decentralized finance protocols, yield farming strategies, and liquidity pools.',
    instructor: 'Alex Thompson',
    tags: ['DeFi', 'Yield Farming', 'Liquidity', 'Protocols'],
    isFeatured: true,
    learnType: 'crypto',
    xpReward: 250,
    xpPerLesson: 30,
    enrollXP: 15,
  },
  {
    id: 'uniswap-guide',
    title: 'Uniswap & DEX Trading Masterclass',
    category: 'DeFi',
    difficulty: 'Intermediate',
    duration: '4h 00m',
    lessonsCount: 15,
    enrolledCount: 2156,
    rating: 4.7,
    reviewsCount: 345,
    progress: 20,
    description: 'Master decentralized exchange trading with Uniswap and other DEX platforms.',
    instructor: 'Jordan Lee',
    tags: ['Uniswap', 'DEX', 'Trading'],
    learnType: 'crypto',
  },
  {
    id: 'aave-lending',
    title: 'AAVE Protocol: Lending & Borrowing',
    category: 'DeFi',
    difficulty: 'Intermediate',
    duration: '3h 30m',
    lessonsCount: 12,
    enrolledCount: 1845,
    rating: 4.6,
    reviewsCount: 234,
    description: 'Learn how to lend, borrow, and earn interest with AAVE protocol.',
    instructor: 'Emily Zhang',
    tags: ['AAVE', 'Lending', 'DeFi', 'Interest'],
    learnType: 'crypto',
  },
  
  // Crypto Learn - NFTs
  {
    id: 'nft-basics',
    title: 'NFTs: Creation to Marketplace',
    category: 'NFTs',
    difficulty: 'Beginner',
    duration: '2h 15m',
    lessonsCount: 9,
    enrolledCount: 3678,
    rating: 4.5,
    reviewsCount: 456,
    description: 'Everything you need to know about creating, buying, and selling NFTs.',
    instructor: 'Ryan Martinez',
    tags: ['NFTs', 'Digital Art', 'Marketplace'],
    isNew: true,
    learnType: 'crypto',
  },
  {
    id: 'nft-smart-contracts',
    title: 'NFT Smart Contract Development',
    category: 'NFTs',
    difficulty: 'Advanced',
    duration: '6h 45m',
    lessonsCount: 20,
    enrolledCount: 1234,
    rating: 4.8,
    reviewsCount: 178,
    description: 'Build your own NFT contracts with ERC-721 and ERC-1155 standards.',
    instructor: 'Sophia Anderson',
    tags: ['NFTs', 'Smart Contracts', 'ERC-721', 'Solidity'],
    learnType: 'crypto',
  },
  
  // Crypto Learn - Trading
  {
    id: 'technical-analysis',
    title: 'Crypto Technical Analysis Fundamentals',
    category: 'Trading',
    difficulty: 'Intermediate',
    duration: '5h 00m',
    lessonsCount: 16,
    enrolledCount: 2890,
    rating: 4.7,
    reviewsCount: 445,
    description: 'Learn chart patterns, indicators, and trading strategies for cryptocurrency markets.',
    instructor: 'Michael Chen',
    tags: ['Trading', 'Technical Analysis', 'Charts'],
    learnType: 'crypto',
  },
  {
    id: 'risk-management',
    title: 'Risk Management for Crypto Traders',
    category: 'Trading',
    difficulty: 'Intermediate',
    duration: '3h 20m',
    lessonsCount: 11,
    enrolledCount: 1567,
    rating: 4.6,
    reviewsCount: 234,
    description: 'Master position sizing, stop losses, and portfolio management strategies.',
    instructor: 'Rachel Green',
    tags: ['Risk Management', 'Trading', 'Portfolio'],
    learnType: 'crypto',
  },
  
  // Crypto Learn - Smart Contracts
  {
    id: 'solidity-basics',
    title: 'Solidity Programming for Beginners',
    category: 'Smart Contracts',
    difficulty: 'Beginner',
    duration: '4h 30m',
    lessonsCount: 14,
    enrolledCount: 2234,
    rating: 4.7,
    reviewsCount: 367,
    description: 'Learn Solidity programming from scratch and build your first smart contract.',
    instructor: 'Marcus Rodriguez',
    tags: ['Solidity', 'Programming', 'Smart Contracts'],
    isNew: true,
    learnType: 'crypto',
  },
  
  // Crypto Learn - Security
  {
    id: 'crypto-wallets',
    title: 'Cryptocurrency Wallets & Security',
    category: 'Security',
    difficulty: 'Beginner',
    duration: '1h 45m',
    lessonsCount: 8,
    enrolledCount: 4123,
    rating: 4.8,
    reviewsCount: 567,
    description: 'Learn how to securely store and manage your cryptocurrencies.',
    instructor: 'Lisa Wang',
    tags: ['Wallets', 'Security', 'Private Keys'],
    learnType: 'crypto',
  },
  {
    id: 'smart-contract-security',
    title: 'Smart Contract Security & Auditing',
    category: 'Security',
    difficulty: 'Advanced',
    duration: '7h 30m',
    lessonsCount: 22,
    enrolledCount: 987,
    rating: 4.9,
    reviewsCount: 156,
    description: 'Learn to identify and fix vulnerabilities in smart contracts.',
    instructor: 'Dr. James Wilson',
    tags: ['Security', 'Auditing', 'Smart Contracts'],
    learnType: 'crypto',
  },
  
  // Crypto Learn - Protocols
  {
    id: 'consensus-mechanisms',
    title: 'Blockchain Consensus Mechanisms Explained',
    category: 'Protocols',
    difficulty: 'Intermediate',
    duration: '3h 15m',
    lessonsCount: 11,
    enrolledCount: 1678,
    rating: 4.6,
    reviewsCount: 245,
    description: 'Deep dive into PoW, PoS, and other consensus mechanisms.',
    instructor: 'Nathan Brooks',
    tags: ['Consensus', 'Protocols', 'Blockchain'],
    learnType: 'crypto',
  },
  
  // Crypto Learn - Web3 Development
  {
    id: 'web3-foundations',
    title: 'Web3 Development Foundations',
    category: 'Web3 Development',
    difficulty: 'Intermediate',
    duration: '6h 00m',
    lessonsCount: 19,
    enrolledCount: 2456,
    rating: 4.8,
    reviewsCount: 389,
    description: 'Learn to build decentralized applications with Web3.js and ethers.js',
    instructor: 'Victoria Chang',
    tags: ['Web3', 'Development', 'dApps'],
    isNew: true,
    learnType: 'crypto',
  },
  
  // Ecosystem Learn - Ethereum
  {
    id: 'eth-smart-contracts',
    title: 'Ethereum Smart Contracts Development',
    category: 'Smart Contracts',
    ecosystem: 'Ethereum',
    ecosystemCategory: 'Protocol',
    difficulty: 'Advanced',
    duration: '8h 20m',
    lessonsCount: 24,
    enrolledCount: 1923,
    rating: 4.9,
    reviewsCount: 287,
    progress: 30,
    description: 'Learn to build, deploy, and audit smart contracts on Ethereum using Solidity.',
    instructor: 'Marcus Rodriguez',
    tags: ['Ethereum', 'Solidity', 'Smart Contracts', 'Web3'],
    isFeatured: true,
    learnType: 'ecosystem',
    xpReward: 450,
    xpPerLesson: 50,
    enrollXP: 25,
  },
  {
    id: 'ethereum-dapp',
    title: 'Building Your First Ethereum DApp',
    category: 'Web3 Development',
    ecosystem: 'Ethereum',
    ecosystemCategory: 'Infrastructure',
    difficulty: 'Intermediate',
    duration: '5h 30m',
    lessonsCount: 17,
    enrolledCount: 2567,
    rating: 4.7,
    reviewsCount: 412,
    description: 'Complete guide to building decentralized applications on Ethereum.',
    instructor: 'Alex Chen',
    tags: ['Ethereum', 'DApp', 'Web3'],
    learnType: 'ecosystem',
  },
  {
    id: 'uniswap-ethereum',
    title: 'Uniswap: DeFi Trading on Ethereum',
    category: 'DeFi',
    ecosystem: 'Ethereum',
    ecosystemCategory: 'DEX',
    difficulty: 'Beginner',
    duration: '3h 00m',
    lessonsCount: 12,
    enrolledCount: 3200,
    rating: 4.8,
    reviewsCount: 489,
    description: 'Master Uniswap and decentralized trading on Ethereum.',
    instructor: 'Sarah Mitchell',
    tags: ['Ethereum', 'Uniswap', 'DeFi', 'DEX'],
    learnType: 'ecosystem',
  },
  {
    id: 'aave-lending-eth',
    title: 'Aave Lending Protocol',
    category: 'DeFi',
    ecosystem: 'Ethereum',
    ecosystemCategory: 'Lending',
    difficulty: 'Intermediate',
    duration: '4h 30m',
    lessonsCount: 15,
    enrolledCount: 2100,
    rating: 4.7,
    reviewsCount: 312,
    description: 'Learn lending and borrowing with Aave protocol on Ethereum.',
    instructor: 'David Kim',
    tags: ['Ethereum', 'Aave', 'Lending', 'DeFi'],
    learnType: 'ecosystem',
  },
  
  // Ecosystem Learn - Solana
  {
    id: 'solana-development',
    title: 'Solana Blockchain Development',
    category: 'Smart Contracts',
    ecosystem: 'Solana',
    ecosystemCategory: 'Protocol',
    difficulty: 'Advanced',
    duration: '9h 00m',
    lessonsCount: 28,
    enrolledCount: 1456,
    rating: 4.8,
    reviewsCount: 203,
    description: 'Build high-performance dApps on Solana using Rust and Anchor framework.',
    instructor: 'Kevin Park',
    tags: ['Solana', 'Rust', 'Development', 'dApps'],
    learnType: 'ecosystem',
  },
  {
    id: 'solana-nfts',
    title: 'Solana NFT Development & Minting',
    category: 'NFTs',
    ecosystem: 'Solana',
    ecosystemCategory: 'NFT',
    difficulty: 'Intermediate',
    duration: '4h 45m',
    lessonsCount: 15,
    enrolledCount: 1890,
    rating: 4.6,
    reviewsCount: 276,
    description: 'Learn to create and mint NFTs on the Solana blockchain.',
    instructor: 'Maya Torres',
    tags: ['Solana', 'NFTs', 'Minting'],
    learnType: 'ecosystem',
  },
  {
    id: 'raydium-solana',
    title: 'Raydium DEX: Solana Trading',
    category: 'DeFi',
    ecosystem: 'Solana',
    ecosystemCategory: 'DEX',
    difficulty: 'Beginner',
    duration: '2h 45m',
    lessonsCount: 10,
    enrolledCount: 2800,
    rating: 4.5,
    reviewsCount: 401,
    description: 'Trade tokens on Raydium, Solana\'s leading DEX.',
    instructor: 'James Lee',
    tags: ['Solana', 'Raydium', 'DEX', 'Trading'],
    learnType: 'ecosystem',
  },
  {
    id: 'phantom-wallet-solana',
    title: 'Phantom Wallet Mastery',
    category: 'Security',
    ecosystem: 'Solana',
    ecosystemCategory: 'Wallet',
    difficulty: 'Beginner',
    duration: '1h 30m',
    lessonsCount: 7,
    enrolledCount: 4500,
    rating: 4.9,
    reviewsCount: 678,
    description: 'Complete guide to using Phantom wallet for Solana.',
    instructor: 'Emily Zhang',
    tags: ['Solana', 'Phantom', 'Wallet', 'Security'],
    learnType: 'ecosystem',
  },
  
  // Ecosystem Learn - Polygon
  {
    id: 'polygon-scaling',
    title: 'Polygon: Ethereum Scaling Solutions',
    category: 'Protocols',
    ecosystem: 'Polygon',
    ecosystemCategory: 'Protocol',
    difficulty: 'Intermediate',
    duration: '4h 15m',
    lessonsCount: 14,
    enrolledCount: 1789,
    rating: 4.7,
    reviewsCount: 267,
    description: 'Understand Layer 2 scaling and build on Polygon network.',
    instructor: 'Priya Sharma',
    tags: ['Polygon', 'Layer 2', 'Scaling', 'Ethereum'],
    learnType: 'ecosystem',
  },
  {
    id: 'quickswap-polygon',
    title: 'QuickSwap DEX on Polygon',
    category: 'DeFi',
    ecosystem: 'Polygon',
    ecosystemCategory: 'DEX',
    difficulty: 'Beginner',
    duration: '2h 15m',
    lessonsCount: 9,
    enrolledCount: 2400,
    rating: 4.6,
    reviewsCount: 358,
    description: 'Learn to trade on QuickSwap, Polygon\'s fastest DEX.',
    instructor: 'Roberto Martinez',
    tags: ['Polygon', 'QuickSwap', 'DEX', 'DeFi'],
    learnType: 'ecosystem',
  },
  {
    id: 'polygon-nft-marketplace',
    title: 'Building NFT Marketplaces on Polygon',
    category: 'NFTs',
    ecosystem: 'Polygon',
    ecosystemCategory: 'NFT',
    difficulty: 'Advanced',
    duration: '7h 00m',
    lessonsCount: 22,
    enrolledCount: 1200,
    rating: 4.8,
    reviewsCount: 189,
    description: 'Create your own NFT marketplace on Polygon with low gas fees.',
    instructor: 'Nina Patel',
    tags: ['Polygon', 'NFT', 'Marketplace', 'Development'],
    learnType: 'ecosystem',
  },
  
  // More Ethereum Ecosystem Courses
  {
    id: 'chainlink-oracle-eth',
    title: 'Chainlink Oracle Integration',
    category: 'Protocols',
    ecosystem: 'Ethereum',
    ecosystemCategory: 'Infrastructure',
    difficulty: 'Advanced',
    duration: '5h 30m',
    lessonsCount: 18,
    enrolledCount: 1650,
    rating: 4.9,
    reviewsCount: 245,
    description: 'Master Chainlink oracles for bringing real-world data to smart contracts.',
    instructor: 'Oliver Thompson',
    tags: ['Ethereum', 'Chainlink', 'Oracles', 'Infrastructure'],
    learnType: 'ecosystem',
  },
  {
    id: 'ens-domains-eth',
    title: 'ENS Domains Deep Dive',
    category: 'Protocols',
    ecosystem: 'Ethereum',
    ecosystemCategory: 'Protocol',
    difficulty: 'Intermediate',
    duration: '3h 45m',
    lessonsCount: 14,
    enrolledCount: 2890,
    rating: 4.7,
    reviewsCount: 412,
    description: 'Everything about Ethereum Name Service and decentralized identity.',
    instructor: 'Emma Wilson',
    tags: ['Ethereum', 'ENS', 'Identity', 'Domains'],
    learnType: 'ecosystem',
  },
  {
    id: 'makerdao-eth',
    title: 'MakerDAO: Decentralized Stablecoin',
    category: 'DeFi',
    ecosystem: 'Ethereum',
    ecosystemCategory: 'DeFi',
    difficulty: 'Intermediate',
    duration: '4h 20m',
    lessonsCount: 16,
    enrolledCount: 2340,
    rating: 4.8,
    reviewsCount: 387,
    description: 'Understand DAI stablecoin and the MakerDAO protocol mechanics.',
    instructor: 'Daniel Park',
    tags: ['Ethereum', 'MakerDAO', 'DAI', 'Stablecoin'],
    learnType: 'ecosystem',
  },
  {
    id: 'curve-finance-eth',
    title: 'Curve Finance: Stablecoin Trading',
    category: 'DeFi',
    ecosystem: 'Ethereum',
    ecosystemCategory: 'DEX',
    difficulty: 'Advanced',
    duration: '6h 15m',
    lessonsCount: 20,
    enrolledCount: 1780,
    rating: 4.6,
    reviewsCount: 298,
    description: 'Master Curve Finance for efficient stablecoin swaps and liquidity provision.',
    instructor: 'Sophie Chen',
    tags: ['Ethereum', 'Curve', 'Stablecoin', 'Liquidity'],
    learnType: 'ecosystem',
  },
  
  // More Solana Ecosystem Courses
  {
    id: 'jupiter-aggregator-sol',
    title: 'Jupiter: Solana DEX Aggregator',
    category: 'DeFi',
    ecosystem: 'Solana',
    ecosystemCategory: 'DEX',
    difficulty: 'Beginner',
    duration: '2h 30m',
    lessonsCount: 10,
    enrolledCount: 3100,
    rating: 4.7,
    reviewsCount: 456,
    description: 'Get the best prices using Jupiter aggregator on Solana.',
    instructor: 'Lucas Brown',
    tags: ['Solana', 'Jupiter', 'Aggregator', 'Trading'],
    learnType: 'ecosystem',
  },
  {
    id: 'marinade-staking-sol',
    title: 'Marinade Liquid Staking',
    category: 'DeFi',
    ecosystem: 'Solana',
    ecosystemCategory: 'Staking',
    difficulty: 'Beginner',
    duration: '2h 00m',
    lessonsCount: 8,
    enrolledCount: 2650,
    rating: 4.8,
    reviewsCount: 389,
    description: 'Earn rewards with Marinade liquid staking on Solana.',
    instructor: 'Maria Garcia',
    tags: ['Solana', 'Marinade', 'Staking', 'Liquid Staking'],
    learnType: 'ecosystem',
  },
  {
    id: 'magic-eden-nft-sol',
    title: 'Magic Eden NFT Trading',
    category: 'NFTs',
    ecosystem: 'Solana',
    ecosystemCategory: 'NFT',
    difficulty: 'Beginner',
    duration: '1h 45m',
    lessonsCount: 7,
    enrolledCount: 4200,
    rating: 4.9,
    reviewsCount: 623,
    description: 'Master NFT trading on Magic Eden, Solana\'s top marketplace.',
    instructor: 'Alex Rivera',
    tags: ['Solana', 'Magic Eden', 'NFT', 'Trading'],
    learnType: 'ecosystem',
  },
  {
    id: 'helium-depin-sol',
    title: 'Helium Network: DePIN on Solana',
    category: 'Protocols',
    ecosystem: 'Solana',
    ecosystemCategory: 'DePIN',
    difficulty: 'Intermediate',
    duration: '5h 00m',
    lessonsCount: 17,
    enrolledCount: 1890,
    rating: 4.7,
    reviewsCount: 276,
    description: 'Learn about Helium\'s decentralized wireless network on Solana.',
    instructor: 'Thomas Anderson',
    tags: ['Solana', 'Helium', 'DePIN', 'IoT'],
    learnType: 'ecosystem',
  },
  
  // More Polygon Ecosystem Courses
  {
    id: 'polygon-bridge',
    title: 'Polygon Bridge Mastery',
    category: 'Protocols',
    ecosystem: 'Polygon',
    ecosystemCategory: 'Bridge',
    difficulty: 'Intermediate',
    duration: '3h 30m',
    lessonsCount: 13,
    enrolledCount: 2100,
    rating: 4.6,
    reviewsCount: 312,
    description: 'Bridge assets between Ethereum and Polygon seamlessly.',
    instructor: 'Rachel Green',
    tags: ['Polygon', 'Bridge', 'Ethereum', 'Cross-chain'],
    learnType: 'ecosystem',
  },
  {
    id: 'aavegotchi-gaming-polygon',
    title: 'Aavegotchi: DeFi Meets Gaming',
    category: 'NFTs',
    ecosystem: 'Polygon',
    ecosystemCategory: 'Gaming',
    difficulty: 'Beginner',
    duration: '2h 45m',
    lessonsCount: 11,
    enrolledCount: 2800,
    rating: 4.5,
    reviewsCount: 401,
    description: 'Explore Aavegotchi, where DeFi collateral becomes playable NFTs.',
    instructor: 'Jordan Lee',
    tags: ['Polygon', 'Aavegotchi', 'Gaming', 'NFT'],
    learnType: 'ecosystem',
  },
  {
    id: 'decentraland-polygon',
    title: 'Decentraland Metaverse Guide',
    category: 'NFTs',
    ecosystem: 'Polygon',
    ecosystemCategory: 'Metaverse',
    difficulty: 'Beginner',
    duration: '3h 15m',
    lessonsCount: 12,
    enrolledCount: 3450,
    rating: 4.6,
    reviewsCount: 512,
    description: 'Navigate and build in the Decentraland virtual world.',
    instructor: 'Victoria Chang',
    tags: ['Polygon', 'Decentraland', 'Metaverse', 'Virtual World'],
    learnType: 'ecosystem',
  },
  
  // BNB Chain Ecosystem Courses
  {
    id: 'pancakeswap-bnb',
    title: 'PancakeSwap Trading & Yield Farming',
    category: 'DeFi',
    ecosystem: 'BNB Chain',
    ecosystemCategory: 'DEX',
    difficulty: 'Beginner',
    duration: '3h 00m',
    lessonsCount: 12,
    enrolledCount: 4500,
    rating: 4.7,
    reviewsCount: 678,
    description: 'Trade and earn with PancakeSwap, BNB Chain\'s leading DEX.',
    instructor: 'Michael Chen',
    tags: ['BNB Chain', 'PancakeSwap', 'DEX', 'Yield'],
    learnType: 'ecosystem',
  },
  {
    id: 'venus-protocol-bnb',
    title: 'Venus Protocol Lending',
    category: 'DeFi',
    ecosystem: 'BNB Chain',
    ecosystemCategory: 'Lending',
    difficulty: 'Intermediate',
    duration: '4h 30m',
    lessonsCount: 15,
    enrolledCount: 2100,
    rating: 4.8,
    reviewsCount: 334,
    description: 'Lend, borrow and earn with Venus Protocol on BNB Chain.',
    instructor: 'Sarah Mitchell',
    tags: ['BNB Chain', 'Venus', 'Lending', 'Borrowing'],
    learnType: 'ecosystem',
  },
  {
    id: 'binance-nft-bnb',
    title: 'Binance NFT Marketplace Guide',
    category: 'NFTs',
    ecosystem: 'BNB Chain',
    ecosystemCategory: 'NFT',
    difficulty: 'Beginner',
    duration: '2h 15m',
    lessonsCount: 9,
    enrolledCount: 3800,
    rating: 4.5,
    reviewsCount: 523,
    description: 'Buy, sell and create NFTs on Binance NFT marketplace.',
    instructor: 'Kevin Park',
    tags: ['BNB Chain', 'Binance NFT', 'Marketplace', 'Trading'],
    learnType: 'ecosystem',
  },
  
  // Avalanche Ecosystem Courses
  {
    id: 'trader-joe-avax',
    title: 'Trader Joe DEX on Avalanche',
    category: 'DeFi',
    ecosystem: 'Avalanche',
    ecosystemCategory: 'DEX',
    difficulty: 'Beginner',
    duration: '2h 45m',
    lessonsCount: 11,
    enrolledCount: 2900,
    rating: 4.6,
    reviewsCount: 423,
    description: 'Trade efficiently on Trader Joe, Avalanche\'s premier DEX.',
    instructor: 'Nathan Brooks',
    tags: ['Avalanche', 'Trader Joe', 'DEX', 'Trading'],
    learnType: 'ecosystem',
  },
  {
    id: 'benqi-lending-avax',
    title: 'Benqi Liquidity Protocol',
    category: 'DeFi',
    ecosystem: 'Avalanche',
    ecosystemCategory: 'Lending',
    difficulty: 'Intermediate',
    duration: '4h 00m',
    lessonsCount: 14,
    enrolledCount: 1890,
    rating: 4.7,
    reviewsCount: 287,
    description: 'Supply collateral, earn yield, and borrow on Benqi.',
    instructor: 'Priya Sharma',
    tags: ['Avalanche', 'Benqi', 'Lending', 'Liquidity'],
    learnType: 'ecosystem',
  },
  {
    id: 'avalanche-subnets',
    title: 'Avalanche Subnets Development',
    category: 'Protocols',
    ecosystem: 'Avalanche',
    ecosystemCategory: 'Infrastructure',
    difficulty: 'Advanced',
    duration: '6h 30m',
    lessonsCount: 21,
    enrolledCount: 1200,
    rating: 4.9,
    reviewsCount: 178,
    description: 'Build custom blockchain networks with Avalanche Subnets.',
    instructor: 'Marcus Rodriguez',
    tags: ['Avalanche', 'Subnets', 'Infrastructure', 'Development'],
    learnType: 'ecosystem',
  },
  
  // Bitcoin Ecosystem Courses
  {
    id: 'lightning-network-btc',
    title: 'Bitcoin Lightning Network',
    category: 'Protocols',
    ecosystem: 'Bitcoin',
    ecosystemCategory: 'Infrastructure',
    difficulty: 'Intermediate',
    duration: '5h 15m',
    lessonsCount: 18,
    enrolledCount: 2340,
    rating: 4.8,
    reviewsCount: 389,
    description: 'Master instant Bitcoin transactions with Lightning Network.',
    instructor: 'David Kim',
    tags: ['Bitcoin', 'Lightning', 'Layer 2', 'Payments'],
    learnType: 'ecosystem',
  },
  {
    id: 'bitcoin-ordinals-nft',
    title: 'Bitcoin Ordinals & NFTs',
    category: 'NFTs',
    ecosystem: 'Bitcoin',
    ecosystemCategory: 'NFT',
    difficulty: 'Advanced',
    duration: '4h 45m',
    lessonsCount: 16,
    enrolledCount: 1650,
    rating: 4.6,
    reviewsCount: 245,
    description: 'Create and trade NFTs directly on Bitcoin with Ordinals.',
    instructor: 'Emily Zhang',
    tags: ['Bitcoin', 'Ordinals', 'NFT', 'Inscriptions'],
    learnType: 'ecosystem',
  },
  {
    id: 'bitcoin-defi-rsk',
    title: 'RSK: DeFi on Bitcoin',
    category: 'DeFi',
    ecosystem: 'Bitcoin',
    ecosystemCategory: 'DeFi',
    difficulty: 'Advanced',
    duration: '5h 30m',
    lessonsCount: 19,
    enrolledCount: 1450,
    rating: 4.7,
    reviewsCount: 212,
    description: 'Explore DeFi applications built on Bitcoin via RSK sidechain.',
    instructor: 'James Lee',
    tags: ['Bitcoin', 'RSK', 'DeFi', 'Sidechain'],
    learnType: 'ecosystem',
  },
];

// Sample user stats
export const userStats: LearningStats = {
  totalCourses: 14,
  completedCourses: 3,
  inProgressCourses: 5,
  totalHoursSpent: 47.5,
  lessonsCompleted: 86,
  currentStreak: 7,
};

// Helper function to calculate XP rewards based on difficulty and lessons
export const calculateCourseXP = (difficulty: Course['difficulty'], lessonsCount: number) => {
  const baseXPPerLesson = difficulty === 'Beginner' ? 15 : difficulty === 'Intermediate' ? 25 : 40;
  const completionBonus = difficulty === 'Beginner' ? 100 : difficulty === 'Intermediate' ? 200 : 350;
  
  return {
    enrollXP: 10,
    xpPerLesson: baseXPPerLesson,
    xpReward: (baseXPPerLesson * lessonsCount) + completionBonus,
  };
};

// Add XP values to all courses
export const coursesWithXP: Course[] = courses.map(course => ({
  ...course,
  ...calculateCourseXP(course.difficulty, course.lessonsCount),
}));

// Helper functions - use coursesWithXP for all queries
export const getCoursesByCategory = (category: Course['category']): Course[] => {
  return coursesWithXP.filter(course => course.category === category);
};

export const getCoursesByEcosystem = (ecosystem: Course['ecosystem']): Course[] => {
  return coursesWithXP.filter(course => course.ecosystem === ecosystem);
};

export const getCrypLearnCourses = (): Course[] => {
  return coursesWithXP.filter(course => course.learnType === 'crypto');
};

export const getEcosystemLearnCourses = (): Course[] => {
  return coursesWithXP.filter(course => course.learnType === 'ecosystem');
};

export const getFeaturedCourses = (): Course[] => {
  return coursesWithXP.filter(course => course.isFeatured);
};

export const getInProgressCourses = (): Course[] => {
  return coursesWithXP.filter(course => course.progress && course.progress > 0 && course.progress < 100);
};

export const getCompletedCourses = (): Course[] => {
  return coursesWithXP.filter(course => course.progress === 100);
};

export const getCoursesByDifficulty = (difficulty: Course['difficulty']): Course[] => {
  return coursesWithXP.filter(course => course.difficulty === difficulty);
};
