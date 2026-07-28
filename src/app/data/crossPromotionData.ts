// Cross-promotion mapping for news categories
// Each category shows related articles from 3 other strategic categories

export interface CrossPromotionCategory {
  name: string;
  slug: string;
}

export interface CrossPromotionArticle {
  category: string;
  categorySlug: string;
  time: string;
  title: string;
  tags: string[];
  slug: string;
}

// Define which categories should be cross-promoted on each category page
export const crossPromotionMapping: Record<string, CrossPromotionCategory[]> = {
  // Main Navigation Categories
  'finance': [
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' },
    { name: 'Geopolitics', slug: 'geopolitics' }
  ],
  'technology': [
    { name: 'Finance', slug: 'finance' },
    { name: 'Business', slug: 'business' },
    { name: 'Geopolitics', slug: 'geopolitics' }
  ],
  'geopolitics': [
    { name: 'Finance', slug: 'finance' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' }
  ],
  'business': [
    { name: 'Finance', slug: 'finance' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Geopolitics', slug: 'geopolitics' }
  ],
  // Legacy sub-categories
  'tech': [
    { name: 'Finance', slug: 'finance' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' }
  ],
  'policy': [
    { name: 'Geopolitics', slug: 'geopolitics' },
    { name: 'Finance', slug: 'finance' },
    { name: 'Business', slug: 'business' }
  ],
  'investment': [
    { name: 'Finance', slug: 'finance' },
    { name: 'Business', slug: 'business' },
    { name: 'Technology', slug: 'technology' }
  ],
  'blockchain': [
    { name: 'Technology', slug: 'technology' },
    { name: 'Finance', slug: 'finance' },
    { name: 'Business', slug: 'business' }
  ],
  'defi': [
    { name: 'Finance', slug: 'finance' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' }
  ],
  'nfts': [
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' },
    { name: 'Finance', slug: 'finance' }
  ],
  'gaming': [
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' },
    { name: 'Finance', slug: 'finance' }
  ],
  'exchanges': [
    { name: 'Finance', slug: 'finance' },
    { name: 'Business', slug: 'business' },
    { name: 'Geopolitics', slug: 'geopolitics' }
  ],
  'startups': [
    { name: 'Business', slug: 'business' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Finance', slug: 'finance' }
  ],
  'web3-ai': [
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' },
    { name: 'Finance', slug: 'finance' }
  ],
  'security-hacks': [
    { name: 'Technology', slug: 'technology' },
    { name: 'Geopolitics', slug: 'geopolitics' },
    { name: 'Finance', slug: 'finance' }
  ]
};

// Generate cross-promotion articles for a given category
export const getCrossPromotionArticles = (currentCategory: string): CrossPromotionArticle[] => {
  const relatedCategories = crossPromotionMapping[currentCategory] || [];
  
  const articles: CrossPromotionArticle[] = [];
  
  // Generate multiple articles per category (3 articles from each related category)
  relatedCategories.forEach((category, categoryIdx) => {
    for (let i = 0; i < 3; i++) {
      const articleIdx = (categoryIdx * 3) + i;
      articles.push({
        category: category.name,
        categorySlug: category.slug,
        time: `${articleIdx + 1} hour${articleIdx > 0 ? 's' : ''} ago`,
        title: getCrossPromotionTitle(category.name, currentCategory, i),
        tags: [category.name, ['Analysis', 'Breaking', 'Featured'][i % 3]],
        slug: `${category.slug}-${currentCategory}-article-${articleIdx + 1}`
      });
    }
  });
  
  // Also add some articles from the current category itself
  const currentCategoryName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
  for (let i = 0; i < 3; i++) {
    articles.unshift({
      category: currentCategoryName,
      categorySlug: currentCategory,
      time: `${i + 1} hour${i > 0 ? 's' : ''} ago`,
      title: getCurrentCategoryTitle(currentCategoryName, i),
      tags: [currentCategoryName, ['Breaking', 'Featured', 'Trending'][i % 3]],
      slug: `${currentCategory}-main-article-${i + 1}`
    });
  }
  
  return articles;
};

// Generate titles for current category articles
const getCurrentCategoryTitle = (category: string, index: number): string => {
  const titles: Record<string, string[]> = {
    'Finance': [
      'Bitcoin Surges Past $52K as Institutional Investment Reaches New Heights',
      'Major Banks Announce Crypto Trading Desks for Institutional Clients',
      'Ethereum ETF Approval Drives $500M Daily Trading Volume Surge'
    ],
    'Technology': [
      'Layer 2 Solutions Process 10M Transactions with Zero Downtime',
      'AI-Powered Smart Contracts Enable Self-Executing Financial Agreements',
      'Quantum-Resistant Blockchain Technology Enters Production Phase'
    ],
    'Geopolitics': [
      'G20 Summit Finalizes Global Cryptocurrency Regulatory Framework',
      'Central Bank Digital Currencies Launched in 15 New Countries',
      'International Trade Settlement Using Blockchain Reaches $100B'
    ],
    'Business': [
      'Fortune 100 Companies Adopt Blockchain for Supply Chain Management',
      'Crypto Payment Processors Report 300% Growth in Merchant Adoption',
      'Enterprise Blockchain Solutions Market Reaches $50B Valuation'
    ]
  };
  
  return titles[category]?.[index] || `${category}: Latest Developments and Analysis`;
};

// Generate contextual cross-promotion titles
const getCrossPromotionTitle = (targetCategory: string, sourceCategory: string, index: number): string => {
  const titles: Record<string, Record<string, string[]>> = {
    // Main Navigation Categories
    'Finance': {
      'technology': ['Blockchain Technology Revolutionizes Financial Services Industry', 'AI-Powered Financial Models Enhance Risk Management', 'Quantum Computing Transforms Financial Data Analysis'],
      'geopolitics': ['Global Regulations Reshape Cryptocurrency Financial Landscape', 'International Trade Agreements Include Blockchain Provisions', 'Geopolitical Tensions Drive Cryptocurrency Adoption'],
      'business': ['Major Financial Institutions Embrace Crypto Business Models', 'Blockchain Solutions Optimize Corporate Supply Chains', 'Financial Institutions Invest in Blockchain Startups'],
      'tech': ['Financial Institutions Embrace Blockchain Technology', 'AI-Driven Financial Services Gain Popularity', 'Blockchain Technology Improves Payment Processing'],
      'policy': ['New Financial Regulations Impact Crypto Industry', 'Regulatory Framework Shapes Future of Crypto Finance', 'Policy Updates Address Security Concerns in Crypto'],
      'investment': ['Institutional Finance Drives Crypto Investment Growth', 'Investment Trends Signal Growth in Crypto Finance', 'Venture Capital Flows Into Promising Crypto Startups'],
      'defi': ['Traditional Finance Integrates DeFi Solutions', 'DeFi Platforms Challenge Traditional Financial Services', 'DeFi Security Protocols Reach New Standards'],
      'exchanges': ['Major Financial Firms Partner with Crypto Exchanges', 'Crypto Exchanges Partner with Traditional Finance', 'Exchange Security Upgrades Protect User Assets'],
      'security-hacks': ['Financial Security Standards Strengthen Crypto Industry', 'Security Regulations Strengthen Crypto Infrastructure', 'DeFi Security Audits Become Industry Standard']
    },
    'Technology': {
      'finance': ['Tech Innovation Drives New Financial Products in Crypto Markets', 'AI-Powered Financial Models Enhance Risk Management', 'Quantum Computing Transforms Financial Data Analysis'],
      'geopolitics': ['Geopolitical Tensions Accelerate Blockchain Tech Development', 'Global Tech Competition Fuels Blockchain Innovation', 'International Trade Agreements Include Blockchain Provisions'],
      'business': ['Technology Giants Expand Into Crypto Business Operations', 'Blockchain Solutions Optimize Corporate Supply Chains', 'Financial Institutions Invest in Blockchain Startups'],
      'investment': ['Top Tech Platforms Attract Major Investment Rounds', 'Investment Trends Signal Growth in Crypto Finance', 'Venture Capital Flows Into Promising Crypto Startups'],
      'blockchain': ['Breakthrough Tech Solutions Enhance Blockchain Efficiency', 'Layer 2 Solutions Process 10M Transactions with Zero Downtime', 'Quantum-Resistant Blockchain Technology Enters Production Phase'],
      'defi': ['DeFi Protocols Adopt Cutting-Edge Tech Infrastructure', 'AI-Powered Smart Contracts Enable Self-Executing Financial Agreements', 'DeFi Security Protocols Reach New Standards'],
      'nfts': ['Tech Giants Enter NFT Space with Revolutionary Platforms', 'NFT Technology Advances with New Standards', 'AI-Generated NFTs Create New Digital Art Movement'],
      'gaming': ['Gaming Technology Meets Blockchain Innovation', 'Blockchain Gaming Platforms Reach Mass Adoption', 'AI Revolutionizes Web3 Gaming Experiences'],
      'web3-ai': ['AI-Powered Web3 Technologies Transform Digital Landscape', 'Web3 and AI Integration Drives Tech Innovation', 'AI-Powered Blockchain Solutions Transform Industries'],
      'startups': ['Tech Startups Revolutionize Crypto Industry Standards', 'Innovative Startups Pioneer New Crypto Technologies', 'Startup DeFi Protocols Gain Mainstream Traction']
    },
    'Geopolitics': {
      'finance': ['Geopolitical Events Drive Major Shifts in Crypto Finance', 'International Trade Agreements Include Blockchain Provisions', 'Geopolitical Tensions Drive Cryptocurrency Adoption'],
      'technology': ['Global Tech Competition Fuels Blockchain Innovation', 'International Trade Agreements Include Blockchain Provisions', 'Geopolitical Tensions Drive Cryptocurrency Adoption'],
      'business': ['International Business Relations Impact Crypto Adoption', 'Blockchain Solutions Optimize Corporate Supply Chains', 'Financial Institutions Invest in Blockchain Startups'],
      'policy': ['Global Policy Changes Reshape Cryptocurrency Landscape', 'Regulatory Framework Shapes Future of Crypto Finance', 'Policy Updates Address Security Concerns in Crypto'],
      'exchanges': ['Geopolitical Tensions Affect Exchange Operations Worldwide', 'Crypto Exchanges Partner with Traditional Finance', 'Exchange Security Upgrades Protect User Assets'],
      'security-hacks': ['International Security Concerns Drive Crypto Regulations', 'Security Regulations Strengthen Crypto Infrastructure', 'DeFi Security Audits Become Industry Standard']
    },
    'Business': {
      'finance': ['Business Leaders Integrate Crypto Into Financial Strategy', 'Blockchain Solutions Optimize Corporate Supply Chains', 'Financial Institutions Invest in Blockchain Startups'],
      'technology': ['Tech Innovation Transforms Business Models in Crypto', 'Blockchain Solutions Optimize Corporate Supply Chains', 'Financial Institutions Invest in Blockchain Startups'],
      'geopolitics': ['Global Business Strategies Adapt to Crypto Regulations', 'International Trade Agreements Include Blockchain Provisions', 'Geopolitical Tensions Drive Cryptocurrency Adoption'],
      'investment': ['Business Investment in Crypto Reaches Record Highs', 'Investment Trends Signal Growth in Crypto Finance', 'Venture Capital Flows Into Promising Crypto Startups'],
      'startups': ['Startup Business Models Disrupt Traditional Industries', 'Innovative Startups Pioneer New Crypto Technologies', 'Startup DeFi Protocols Gain Mainstream Traction'],
      'exchanges': ['Major Businesses Partner with Crypto Exchanges', 'Crypto Exchanges Partner with Traditional Finance', 'Exchange Security Upgrades Protect User Assets']
    },
    // Legacy Categories
    'Tech': {
      'finance': ['Tech Innovation Drives New Financial Products in Crypto Markets', 'AI-Powered Financial Models Enhance Risk Management', 'Quantum Computing Transforms Financial Data Analysis'],
      'investment': ['Top Tech Platforms Attract Major Investment Rounds', 'Investment Trends Signal Growth in Crypto Finance', 'Venture Capital Flows Into Promising Crypto Startups'],
      'blockchain': ['Breakthrough Tech Solutions Enhance Blockchain Efficiency', 'Layer 2 Solutions Process 10M Transactions with Zero Downtime', 'Quantum-Resistant Blockchain Technology Enters Production Phase'],
      'defi': ['DeFi Protocols Adopt Cutting-Edge Tech Infrastructure', 'AI-Powered Smart Contracts Enable Self-Executing Financial Agreements', 'DeFi Security Protocols Reach New Standards'],
      'nfts': ['Tech Giants Enter NFT Space with Revolutionary Platforms', 'NFT Technology Advances with New Standards', 'AI-Generated NFTs Create New Digital Art Movement'],
      'gaming': ['Gaming Technology Meets Blockchain Innovation', 'Blockchain Gaming Platforms Reach Mass Adoption', 'AI Revolutionizes Web3 Gaming Experiences'],
      'web3-ai': ['AI-Powered Web3 Technologies Transform Digital Landscape', 'Web3 and AI Integration Drives Tech Innovation', 'AI-Powered Blockchain Solutions Transform Industries'],
      'startups': ['Tech Startups Revolutionize Crypto Industry Standards', 'Innovative Startups Pioneer New Crypto Technologies', 'Startup DeFi Protocols Gain Mainstream Traction']
    },
    'Policy': {
      'finance': ['Regulatory Framework Shapes Future of Crypto Finance', 'New Policy Guidelines Transform Exchange Operations', 'Policy Updates Address Security Concerns in Crypto'],
      'exchanges': ['New Policy Guidelines Transform Exchange Operations', 'Crypto Exchanges Partner with Traditional Finance', 'Exchange Security Upgrades Protect User Assets'],
      'security-hacks': ['Policy Updates Address Security Concerns in Crypto', 'Security Regulations Strengthen Crypto Infrastructure', 'DeFi Security Audits Become Industry Standard']
    },
    'Investment': {
      'finance': ['Investment Trends Signal Growth in Crypto Finance', 'Tech Innovation Attracts Institutional Investment', 'Venture Capital Flows Into Promising Crypto Startups'],
      'tech': ['Tech Innovation Attracts Institutional Investment', 'Top Tech Platforms Attract Major Investment Rounds', 'Venture Capital Flows Into Promising Crypto Startups'],
      'startups': ['Venture Capital Flows Into Promising Crypto Startups', 'Innovative Startups Pioneer New Crypto Technologies', 'Startup DeFi Protocols Gain Mainstream Traction'],
      'defi': ['Investment Funds Allocate Billions to DeFi Sector', 'DeFi Projects Secure Record Investment Funding', 'DeFi Security Protocols Reach New Standards']
    },
    'Blockchain': {
      'tech': ['Blockchain Technology Reaches New Performance Milestones', 'Layer 2 Solutions Process 10M Transactions with Zero Downtime', 'Quantum-Resistant Blockchain Technology Enters Production Phase'],
      'defi': ['Blockchain Infrastructure Powers DeFi Revolution', 'DeFi Protocols Adopt Cutting-Edge Tech Infrastructure', 'DeFi Security Protocols Reach New Standards'],
      'web3-ai': ['Blockchain and AI Convergence Creates New Possibilities', 'Web3 and AI Integration Drives Tech Innovation', 'AI-Powered Blockchain Solutions Transform Industries'],
      'gaming': ['Blockchain Gaming Ecosystems Expand Globally', 'Blockchain Gaming Platforms Reach Mass Adoption', 'AI Revolutionizes Web3 Gaming Experiences']
    },
    'DeFi': {
      'finance': ['DeFi Platforms Challenge Traditional Financial Services', 'Advanced Blockchain Tech Enables DeFi Innovation', 'DeFi Security Protocols Reach New Standards'],
      'blockchain': ['Advanced Blockchain Tech Enables DeFi Innovation', 'Blockchain Infrastructure Powers DeFi Revolution', 'DeFi Security Protocols Reach New Standards'],
      'investment': ['DeFi Projects Secure Record Investment Funding', 'Investment Funds Allocate Billions to DeFi Sector', 'DeFi Security Protocols Reach New Standards'],
      'startups': ['DeFi Startups Disrupt Traditional Banking Models', 'Innovative Startups Pioneer New Crypto Technologies', 'Startup DeFi Protocols Gain Mainstream Traction'],
      'security-hacks': ['DeFi Security Protocols Reach New Standards', 'Security Regulations Strengthen Crypto Infrastructure', 'DeFi Security Audits Become Industry Standard']
    },
    'NFTs': {
      'gaming': ['NFT Integration Transforms Gaming Economies', 'Blockchain Gaming Platforms Reach Mass Adoption', 'AI Revolutionizes Web3 Gaming Experiences'],
      'web3-ai': ['AI-Generated NFTs Create New Digital Art Movement', 'Web3 and AI Integration Drives Tech Innovation', 'AI-Powered Blockchain Solutions Transform Industries'],
      'tech': ['NFT Technology Advances with New Standards', 'Layer 2 Solutions Process 10M Transactions with Zero Downtime', 'Quantum-Resistant Blockchain Technology Enters Production Phase']
    },
    'Gaming': {
      'nfts': ['Gaming NFTs Generate Billions in Player Economy', 'Blockchain Gaming Platforms Reach Mass Adoption', 'AI Revolutionizes Web3 Gaming Experiences'],
      'web3-ai': ['AI Enhances Gaming Experience in Web3 Platforms', 'Web3 and AI Integration Drives Tech Innovation', 'AI-Powered Blockchain Solutions Transform Industries'],
      'blockchain': ['Blockchain Gaming Platforms Reach Mass Adoption', 'Layer 2 Solutions Process 10M Transactions with Zero Downtime', 'Quantum-Resistant Blockchain Technology Enters Production Phase']
    },
    'Exchanges': {
      'finance': ['Crypto Exchanges Partner with Traditional Finance', 'Exchange Compliance with New Regulatory Standards', 'Exchange Security Upgrades Protect User Assets'],
      'policy': ['Exchange Compliance with New Regulatory Standards', 'New Policy Guidelines Transform Exchange Operations', 'Policy Updates Address Security Concerns in Crypto'],
      'security-hacks': ['Exchange Security Upgrades Protect User Assets', 'Security Regulations Strengthen Crypto Infrastructure', 'DeFi Security Audits Become Industry Standard']
    },
    'Startups': {
      'investment': ['Crypto Startups Raise Record Funding Rounds', 'Investment Trends Signal Growth in Crypto Finance', 'Venture Capital Flows Into Promising Crypto Startups'],
      'tech': ['Innovative Startups Pioneer New Crypto Technologies', 'Top Tech Platforms Attract Major Investment Rounds', 'Venture Capital Flows Into Promising Crypto Startups'],
      'defi': ['Startup DeFi Protocols Gain Mainstream Traction', 'DeFi Projects Secure Record Investment Funding', 'DeFi Security Protocols Reach New Standards']
    },
    'Web3 & AI': {
      'tech': ['Web3 and AI Integration Drives Tech Innovation', 'Layer 2 Solutions Process 10M Transactions with Zero Downtime', 'Quantum-Resistant Blockchain Technology Enters Production Phase'],
      'blockchain': ['AI-Powered Blockchain Solutions Transform Industries', 'Blockchain Infrastructure Powers DeFi Revolution', 'DeFi Security Protocols Reach New Standards'],
      'gaming': ['AI Revolutionizes Web3 Gaming Experiences', 'Blockchain Gaming Platforms Reach Mass Adoption', 'AI Revolutionizes Web3 Gaming Experiences'],
      'nfts': ['AI-Generated NFTs Redefine Digital Ownership', 'Web3 and AI Integration Drives Tech Innovation', 'AI-Powered Blockchain Solutions Transform Industries']
    },
    'Security & Hacks': {
      'policy': ['Security Regulations Strengthen Crypto Infrastructure', 'Regulatory Framework Shapes Future of Crypto Finance', 'Policy Updates Address Security Concerns in Crypto'],
      'exchanges': ['Exchange Security Measures Prevent Major Breaches', 'Crypto Exchanges Partner with Traditional Finance', 'Exchange Security Upgrades Protect User Assets'],
      'defi': ['DeFi Security Audits Become Industry Standard', 'Security Regulations Strengthen Crypto Infrastructure', 'DeFi Security Protocols Reach New Standards']
    }
  };
  
  return titles[targetCategory]?.[sourceCategory]?.[index] || `${targetCategory} Insights: Latest Developments and Analysis`;
};

// ===============================================
// LEARN SECTION CROSS-PROMOTION
// ===============================================

export interface RelatedCourse {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  ecosystem?: string;
  ecosystemSlug?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessonsCount: number;
  rating: number;
  enrolledCount: number;
  thumbnail?: string;
  learnType: 'crypto' | 'ecosystem';
  xpReward?: number;
}

// Cross-promotion mapping for Cryp Learn categories
// Each category shows related courses from 3-4 other strategic categories
export const crypLearnCrossPromotion: Record<string, string[]> = {
  'blockchain-basics': ['smart-contracts', 'protocols', 'security'],
  'defi': ['trading', 'protocols', 'security'],
  'nfts': ['web3-development', 'smart-contracts', 'trading'],
  'trading': ['defi', 'security', 'blockchain-basics'],
  'smart-contracts': ['web3-development', 'security', 'blockchain-basics'],
  'security': ['blockchain-basics', 'smart-contracts', 'protocols'],
  'protocols': ['blockchain-basics', 'defi', 'security'],
  'web3-development': ['smart-contracts', 'protocols', 'nfts']
};

// Cross-promotion mapping for Ecosystem Learn
// Shows courses from related ecosystems and Cryp Learn
export const ecosystemCrossPromotion: Record<string, string[]> = {
  'ethereum': ['polygon', 'avalanche', 'bnb-chain'],
  'polygon': ['ethereum', 'solana', 'avalanche'],
  'solana': ['polygon', 'avalanche', 'ethereum'],
  'bnb-chain': ['ethereum', 'polygon', 'avalanche'],
  'bitcoin': ['ethereum', 'solana', 'polygon'],
  'avalanche': ['ethereum', 'polygon', 'solana']
};

// Cross-promotion mapping for ecosystem categories
export const ecosystemCategoryCrossPromotion: Record<string, string[]> = {
  'defi': ['dex', 'lending', 'staking'],
  'dex': ['defi', 'protocol', 'trading'],
  'protocol': ['infrastructure', 'defi', 'bridge'],
  'nft': ['gaming', 'metaverse', 'marketplace'],
  'depin': ['infrastructure', 'storage', 'oracle'],
  'rwa': ['defi', 'lending', 'tokenization'],
  'gaming': ['nft', 'metaverse', 'marketplace'],
  'infrastructure': ['protocol', 'bridge', 'oracle'],
  'wallet': ['bridge', 'defi', 'security'],
  'bridge': ['infrastructure', 'protocol', 'crosschain'],
  'lending': ['defi', 'staking', 'yield'],
  'staking': ['defi', 'lending', 'validator'],
  'dao': ['governance', 'voting', 'treasury'],
  'metaverse': ['gaming', 'nft', 'virtual-worlds'],
  'ai': ['oracle', 'data', 'ml'],
  'storage': ['depin', 'infrastructure', 'ipfs']
};

// Generate related courses for Cryp Learn category pages
export const getRelatedCrypLearnCourses = (currentCategory: string): RelatedCourse[] => {
  const relatedCategories = crypLearnCrossPromotion[currentCategory] || [];
  
  const mockCourses: RelatedCourse[] = relatedCategories.map((catSlug, idx) => ({
    id: `related-cryp-${catSlug}-${idx}`,
    title: getCrypLearnCourseTitle(catSlug),
    category: formatCategoryName(catSlug),
    categorySlug: catSlug,
    difficulty: ['Beginner', 'Intermediate', 'Advanced'][idx % 3] as any,
    duration: ['1h 30m', '2h 15m', '3h 45m'][idx % 3],
    lessonsCount: [8, 12, 15][idx % 3],
    rating: 4.5 + (idx * 0.1),
    enrolledCount: 1200 + (idx * 300),
    learnType: 'crypto',
    xpReward: [100, 150, 200][idx % 3]
  }));

  return mockCourses;
};

// Generate related courses for Ecosystem Learn pages
export const getRelatedEcosystemCourses = (currentEcosystem: string, includeOtherEcosystems: boolean = true): RelatedCourse[] => {
  const relatedEcosystems = ecosystemCrossPromotion[currentEcosystem] || [];
  
  const courses: RelatedCourse[] = [];
  
  // Add courses from the same ecosystem (different categories)
  if (!includeOtherEcosystems) {
    courses.push({
      id: `same-eco-defi-${currentEcosystem}`,
      title: `Master DeFi on ${formatEcosystemName(currentEcosystem)}`,
      category: 'DeFi',
      categorySlug: 'defi',
      ecosystem: formatEcosystemName(currentEcosystem),
      ecosystemSlug: currentEcosystem,
      difficulty: 'Intermediate',
      duration: '2h 30m',
      lessonsCount: 10,
      rating: 4.7,
      enrolledCount: 2100,
      learnType: 'ecosystem',
      xpReward: 150
    });
  }
  
  // Add courses from related ecosystems
  relatedEcosystems.slice(0, 3).forEach((ecoSlug, idx) => {
    courses.push({
      id: `related-eco-${ecoSlug}-${idx}`,
      title: getEcosystemCourseTitle(ecoSlug),
      category: ['DeFi', 'NFT', 'Protocol'][idx],
      categorySlug: ['defi', 'nft', 'protocol'][idx],
      ecosystem: formatEcosystemName(ecoSlug),
      ecosystemSlug: ecoSlug,
      difficulty: ['Beginner', 'Intermediate', 'Advanced'][idx] as any,
      duration: ['1h 45m', '2h 30m', '3h 15m'][idx],
      lessonsCount: [9, 11, 14][idx],
      rating: 4.6 + (idx * 0.1),
      enrolledCount: 1800 + (idx * 250),
      learnType: 'ecosystem',
      xpReward: [120, 160, 200][idx]
    });
  });

  return courses;
};

// Generate mixed related courses (both Cryp Learn and Ecosystem Learn)
export const getMixedRelatedCourses = (context: {
  currentCategory?: string;
  currentEcosystem?: string;
  difficulty?: string;
  learnType?: 'crypto' | 'ecosystem';
}): RelatedCourse[] => {
  const courses: RelatedCourse[] = [];
  
  // Add 2 courses from Cryp Learn
  const crypCategories = ['blockchain-basics', 'defi', 'smart-contracts', 'security'];
  crypCategories.slice(0, 2).forEach((catSlug, idx) => {
    courses.push({
      id: `mixed-cryp-${catSlug}-${idx}`,
      title: getCrypLearnCourseTitle(catSlug),
      category: formatCategoryName(catSlug),
      categorySlug: catSlug,
      difficulty: context.difficulty as any || 'Intermediate',
      duration: ['2h 15m', '3h 00m'][idx],
      lessonsCount: [10, 13][idx],
      rating: 4.6 + (idx * 0.1),
      enrolledCount: 1500 + (idx * 400),
      learnType: 'crypto',
      xpReward: [140, 180][idx]
    });
  });
  
  // Add 2 courses from Ecosystem Learn
  const ecosystems = ['ethereum', 'solana', 'polygon'];
  ecosystems.slice(0, 2).forEach((ecoSlug, idx) => {
    courses.push({
      id: `mixed-eco-${ecoSlug}-${idx}`,
      title: getEcosystemCourseTitle(ecoSlug),
      category: ['DeFi', 'Protocol'][idx],
      categorySlug: ['defi', 'protocol'][idx],
      ecosystem: formatEcosystemName(ecoSlug),
      ecosystemSlug: ecoSlug,
      difficulty: context.difficulty as any || 'Intermediate',
      duration: ['2h 00m', '2h 45m'][idx],
      lessonsCount: [9, 12][idx],
      rating: 4.7,
      enrolledCount: 1900 + (idx * 300),
      learnType: 'ecosystem',
      xpReward: [150, 170][idx]
    });
  });

  return courses;
};

// Helper: Generate course titles for Cryp Learn
const getCrypLearnCourseTitle = (categorySlug: string): string => {
  const titles: Record<string, string> = {
    'blockchain-basics': 'Complete Blockchain Fundamentals Course',
    'defi': 'DeFi Mastery: Protocols, Yield & Liquidity',
    'nfts': 'NFT Creation & Trading Masterclass',
    'trading': 'Advanced Crypto Trading Strategies',
    'smart-contracts': 'Smart Contract Development with Solidity',
    'security': 'Crypto Security & Wallet Protection',
    'protocols': 'Blockchain Protocols Deep Dive',
    'web3-development': 'Full Stack Web3 Development'
  };
  return titles[categorySlug] || 'Advanced Crypto Course';
};

// Helper: Generate course titles for Ecosystem Learn
const getEcosystemCourseTitle = (ecosystemSlug: string): string => {
  const titles: Record<string, string> = {
    'ethereum': 'Ethereum DApp Development Bootcamp',
    'polygon': 'Building on Polygon: Layer 2 Solutions',
    'solana': 'Solana Programming with Rust',
    'bnb-chain': 'BNB Chain: DeFi & NFT Development',
    'bitcoin': 'Bitcoin Fundamentals & Lightning Network',
    'avalanche': 'Avalanche Subnets & Custom Blockchains'
  };
  return titles[ecosystemSlug] || `${formatEcosystemName(ecosystemSlug)} Development Guide`;
};

// Helper: Format category name
const formatCategoryName = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper: Format ecosystem name
const formatEcosystemName = (slug: string): string => {
  const names: Record<string, string> = {
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'solana': 'Solana',
    'bnb-chain': 'BNB Chain',
    'bitcoin': 'Bitcoin',
    'avalanche': 'Avalanche'
  };
  return names[slug] || formatCategoryName(slug);
};