export type ArticleStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  categorySlug: string;
  author: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  imageUrl?: string;

  /**
   * URL slug. Falls back to `id` where absent — see `articleSlug()`.
   */
  slug?: string;

  /** Editorial workflow state. Absent on seeded data, which is all published. */
  status?: ArticleStatus;

  /** Engagement metrics, populated by analytics rather than the seed data. */
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;

  content?: string;
  featured?: boolean;
  updatedAt?: string;

  /** AI-assigned editorial quality score (0-100), set by the review pipeline. */
  qualityScore?: number;
}

/** The canonical URL segment for an article. */
export function articleSlug(article: Pick<Article, 'id' | 'slug'>): string {
  return article.slug ?? article.id;
}

export const mockArticles: Article[] = [
  // ========== FINANCE ARTICLES (5) ==========
  {
    id: 'finance-crypto-market-surge',
    title: 'Crypto Market Cap Surpasses $2 Trillion as Institutional Money Flows In',
    summary: 'Major institutional investors drive cryptocurrency markets to new heights with record inflows into digital assets.',
    category: 'Finance',
    categorySlug: 'finance',
    author: 'Sarah Mitchell',
    readTime: '4 min read',
    publishedAt: '2024-11-14T10:00:00Z',
    tags: ['Finance', 'Markets', 'Institutional'],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMGNoYXJ0fGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'finance-etf-inflows',
    title: 'Bitcoin ETFs See $500M Daily Inflows as Wall Street Embraces Crypto',
    summary: 'Spot Bitcoin ETFs continue attracting massive institutional capital, reshaping crypto investment landscape.',
    category: 'Finance',
    categorySlug: 'finance',
    author: 'James Chen',
    readTime: '3 min read',
    publishedAt: '2024-11-14T09:00:00Z',
    tags: ['Finance', 'ETF', 'Bitcoin'],
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwdHJhZGluZ3xlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'finance-banking-crypto',
    title: 'Major US Banks Launch Crypto Custody Services for High Net Worth Clients',
    summary: 'Traditional banking institutions enter cryptocurrency market with secure custody solutions for wealthy investors.',
    category: 'Finance',
    categorySlug: 'finance',
    author: 'Robert Taylor',
    readTime: '5 min read',
    publishedAt: '2024-11-14T08:30:00Z',
    tags: ['Finance', 'Banking', 'Custody'],
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5raW5nJTIwZmluYW5jZXxlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'finance-stablecoin-payments',
    title: 'Stablecoin Payment Volume Exceeds $1 Trillion Annually, Rivals Visa',
    summary: 'Digital dollar stablecoins process trillion-dollar transaction volumes, competing with traditional payment networks.',
    category: 'Finance',
    categorySlug: 'finance',
    author: 'Linda Martinez',
    readTime: '4 min read',
    publishedAt: '2024-11-14T07:45:00Z',
    tags: ['Finance', 'Stablecoins', 'Payments'],
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXltZW50JTIwZGlnaXRhbHxlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'finance-crypto-derivatives',
    title: 'Crypto Derivatives Market Hits $10B Open Interest as Trading Activity Surges',
    summary: 'Futures and options markets experience explosive growth as sophisticated traders increase leverage positions.',
    category: 'Finance',
    categorySlug: 'finance',
    author: 'Michael Kim',
    readTime: '3 min read',
    publishedAt: '2024-11-14T07:00:00Z',
    tags: ['Finance', 'Derivatives', 'Trading'],
    imageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjB0cmFkaW5nfGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== TECHNOLOGY ARTICLES (5) ==========
  {
    id: 'tech-blockchain-scalability',
    title: 'New Blockchain Consensus Mechanism Achieves 100,000 TPS Without Sacrificing Decentralization',
    summary: 'Revolutionary consensus protocol promises to solve the blockchain trilemma with breakthrough technology.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Dr. Emily Watson',
    readTime: '6 min read',
    publishedAt: '2024-11-14T10:30:00Z',
    tags: ['Technology', 'Blockchain', 'Scalability'],
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'tech-zero-knowledge-proofs',
    title: 'Zero-Knowledge Rollups Process 1 Million Transactions in Single Ethereum Block',
    summary: 'Advanced ZK technology enables unprecedented scalability for Ethereum Layer 2 networks.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Alex Turner',
    readTime: '5 min read',
    publishedAt: '2024-11-14T09:45:00Z',
    tags: ['Technology', 'ZK-Rollups', 'Ethereum'],
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZGF0YXxlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'tech-quantum-resistance',
    title: 'Major Blockchains Implement Quantum-Resistant Cryptography to Future-Proof Networks',
    summary: 'Leading blockchain networks upgrade security infrastructure to defend against quantum computing threats.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'David Park',
    readTime: '7 min read',
    publishedAt: '2024-11-14T08:15:00Z',
    tags: ['Technology', 'Security', 'Quantum'],
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWFudHVtJTIwY29tcHV0aW5nfGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'tech-ai-blockchain',
    title: 'AI-Powered Smart Contracts Autonomously Optimize Gas Fees and Execution',
    summary: 'Machine learning integration enables smart contracts to self-optimize for efficiency and cost.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Jennifer Liu',
    readTime: '4 min read',
    publishedAt: '2024-11-14T07:30:00Z',
    tags: ['Technology', 'AI', 'Smart Contracts'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYzMTM5NjI4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'tech-cross-chain-protocol',
    title: 'Universal Cross-Chain Protocol Enables Seamless Asset Transfers Across All Blockchains',
    summary: 'New interoperability standard allows frictionless movement of assets between any blockchain network.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Thomas Wright',
    readTime: '5 min read',
    publishedAt: '2024-11-14T06:45:00Z',
    tags: ['Technology', 'Interoperability', 'Cross-Chain'],
    imageUrl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXR3b3JrJTIwY29ubmVjdGlvbnxlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== GEOPOLITICS ARTICLES (5) ==========
  {
    id: 'geo-us-crypto-regulation',
    title: 'US Congress Passes Comprehensive Crypto Regulation Framework',
    summary: 'Landmark legislation provides regulatory clarity for cryptocurrency industry in United States.',
    category: 'Geopolitics',
    categorySlug: 'geopolitics',
    author: 'Victoria Chang',
    readTime: '6 min read',
    publishedAt: '2024-11-14T11:00:00Z',
    tags: ['Geopolitics', 'Regulation', 'USA'],
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cyUyMGNhcGl0b2wlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'geo-eu-digital-euro',
    title: 'European Union Launches Digital Euro Pilot Program Across 5 Member States',
    summary: 'ECB begins testing central bank digital currency with limited rollout in select European countries.',
    category: 'Geopolitics',
    categorySlug: 'geopolitics',
    author: 'Marcus Rodriguez',
    readTime: '5 min read',
    publishedAt: '2024-11-14T10:15:00Z',
    tags: ['Geopolitics', 'CBDC', 'Europe'],
    imageUrl: 'https://images.unsplash.com/photo-1464983308776-8b5d4f2d7cf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldXJvcGUlMjBmbGFnfGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'geo-china-blockchain',
    title: 'China Expands Blockchain Infrastructure Investment to $10B for National Network',
    summary: 'Chinese government accelerates blockchain adoption for supply chain and digital identity systems.',
    category: 'Geopolitics',
    categorySlug: 'geopolitics',
    author: 'Wei Zhang',
    readTime: '4 min read',
    publishedAt: '2024-11-14T09:30:00Z',
    tags: ['Geopolitics', 'China', 'Infrastructure'],
    imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluYSUyMGNpdHl8ZW58MXx8fHwxNzYzMTM5NjI4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'geo-g20-crypto-standards',
    title: 'G20 Nations Agree on Global Crypto Regulatory Standards at Summit',
    summary: 'Major economies reach consensus on coordinated approach to cryptocurrency regulation and oversight.',
    category: 'Geopolitics',
    categorySlug: 'geopolitics',
    author: 'Rachel Kim',
    readTime: '7 min read',
    publishedAt: '2024-11-14T08:45:00Z',
    tags: ['Geopolitics', 'G20', 'International'],
    imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcm5hdGlvbmFsJTIwc3VtbWl0fGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'geo-emerging-markets',
    title: 'Emerging Markets Lead Global Crypto Adoption with 400% Growth',
    summary: 'Developing nations embrace cryptocurrency for remittances and financial inclusion at unprecedented rates.',
    category: 'Geopolitics',
    categorySlug: 'geopolitics',
    author: 'Maria Gonzalez',
    readTime: '5 min read',
    publishedAt: '2024-11-14T07:15:00Z',
    tags: ['Geopolitics', 'Adoption', 'Emerging Markets'],
    imageUrl: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjBtYXJrZXR8ZW58MXx8fHwxNzYzMTM5NjI4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== BUSINESS ARTICLES (5) ==========
  {
    id: 'biz-tesla-crypto-treasury',
    title: 'Fortune 500 Companies Now Hold $15B in Bitcoin on Corporate Balance Sheets',
    summary: 'Major corporations continue adding Bitcoin to treasuries as inflation hedge and strategic asset.',
    category: 'Business',
    categorySlug: 'business',
    author: 'James Anderson',
    readTime: '4 min read',
    publishedAt: '2024-11-14T11:30:00Z',
    tags: ['Business', 'Corporate', 'Bitcoin'],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'biz-paypal-crypto-expansion',
    title: 'PayPal Expands Crypto Services to 200 Countries, Enables Merchant Payments',
    summary: 'Payment giant rolls out cryptocurrency buying, selling, and spending globally for merchants and consumers.',
    category: 'Business',
    categorySlug: 'business',
    author: 'Sarah Johnson',
    readTime: '3 min read',
    publishedAt: '2024-11-14T10:45:00Z',
    tags: ['Business', 'PayPal', 'Adoption'],
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBwYXltZW50fGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'biz-amazon-blockchain',
    title: 'Amazon Web Services Launches Managed Blockchain Network for Enterprise Clients',
    summary: 'Cloud computing leader offers turnkey blockchain solutions for businesses seeking digital transformation.',
    category: 'Business',
    categorySlug: 'business',
    author: 'Kevin Thompson',
    readTime: '5 min read',
    publishedAt: '2024-11-14T09:15:00Z',
    tags: ['Business', 'AWS', 'Enterprise'],
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMGNvbXB1dGluZ3xlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'biz-visa-mastercard-stablecoin',
    title: 'Visa and Mastercard Partner with Major Stablecoin Issuers for Settlement',
    summary: 'Credit card networks integrate stablecoin rails for faster, cheaper international transaction processing.',
    category: 'Business',
    categorySlug: 'business',
    author: 'Amanda Foster',
    readTime: '4 min read',
    publishedAt: '2024-11-14T08:00:00Z',
    tags: ['Business', 'Payments', 'Stablecoins'],
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXltZW50JTIwZGlnaXRhbHxlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'biz-retail-nft',
    title: 'Major Retail Brands Launch NFT Loyalty Programs Reaching 10M Customers',
    summary: 'Fortune 500 retailers integrate blockchain-based rewards systems for customer engagement and retention.',
    category: 'Business',
    categorySlug: 'business',
    author: 'Daniel Green',
    readTime: '4 min read',
    publishedAt: '2024-11-14T06:30:00Z',
    tags: ['Business', 'NFT', 'Retail'],
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjMxMzk2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== ETHEREUM ARTICLES (10) ==========
  {
    id: 'eth-catalyst-surge',
    title: 'Top Analyst Unveils Ethereum Catalyst That Could Trigger Nearly 50% Surge for ETH - Here\'s His Outlook',
    summary: 'Leading crypto analyst reveals key catalyst that could push Ethereum price up by 50% in the coming months.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'Sarah Chen',
    readTime: '3 min read',
    publishedAt: '2024-11-14T08:00:00Z',
    tags: ['Ethereum', 'Analytics', 'Price Prediction'],
    imageUrl: 'https://images.unsplash.com/photo-1660836709415-fdf7d56a6e73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMGNyeXB0b2N1cnJlbmN5fGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ethereum-staking-milestone',
    title: 'Ethereum Staking Passes 30M ETH Milestone, Represents 25% of Total Supply',
    summary: 'Ethereum network security strengthens as staking participation reaches historic levels.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'Marcus Rodriguez',
    readTime: '3 min read',
    publishedAt: '2024-11-14T06:00:00Z',
    tags: ['Ethereum', 'Staking', 'PoS'],
    imageUrl: 'https://images.unsplash.com/photo-1644343262170-e40d72e19a84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMG5ldHdvcmt8ZW58MXx8fHwxNzYzMTM5ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ethereum-merge-anniversary',
    title: 'One Year After The Merge: Ethereum\'s Energy Consumption Down 99.9%',
    summary: 'Anniversary report shows dramatic environmental improvements following Ethereum\'s transition to proof-of-stake.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'Dr. Emily Watson',
    readTime: '5 min read',
    publishedAt: '2024-11-14T04:00:00Z',
    tags: ['Ethereum', 'Merge', 'Sustainability'],
    imageUrl: 'https://images.unsplash.com/photo-1660836709415-fdf7d56a6e73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMGNyeXB0b2N1cnJlbmN5fGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ethereum-layer2-growth',
    title: 'Ethereum Layer 2 Networks Process Record 10M Daily Transactions',
    summary: 'Scaling solutions like Arbitrum and Optimism see massive adoption as fees remain low.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'Alex Turner',
    readTime: '4 min read',
    publishedAt: '2024-11-13T22:00:00Z',
    tags: ['Ethereum', 'Layer 2', 'Scaling'],
    imageUrl: 'https://images.unsplash.com/photo-1644343262170-e40d72e19a84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMG5ldHdvcmt8ZW58MXx8fHwxNzYzMTM5ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ethereum-dencun-upgrade',
    title: 'Ethereum Dencun Upgrade Successfully Deployed, Blob Transactions Go Live',
    summary: 'Major network upgrade introduces proto-danksharding, dramatically reducing Layer 2 costs.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'Michael Zhang',
    readTime: '6 min read',
    publishedAt: '2024-11-13T20:00:00Z',
    tags: ['Ethereum', 'Upgrade', 'Technology'],
    imageUrl: 'https://images.unsplash.com/photo-1660836709415-fdf7d56a6e73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMGNyeXB0b2N1cnJlbmN5fGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ethereum-institutional-adoption',
    title: 'Major Banks Announce Ethereum-Based Settlement System for Cross-Border Payments',
    summary: 'Traditional finance embraces Ethereum infrastructure for international transaction settlement.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'Jennifer Liu',
    readTime: '4 min read',
    publishedAt: '2024-11-13T18:00:00Z',
    tags: ['Ethereum', 'Banking', 'Adoption'],
    imageUrl: 'https://images.unsplash.com/photo-1644343262170-e40d72e19a84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMG5ldHdvcmt8ZW58MXx8fHwxNzYzMTM5ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ethereum-gas-optimization',
    title: 'New EIP Proposal Could Cut Ethereum Gas Fees by 30% for Common Transactions',
    summary: 'Community-driven improvement proposal gains traction with core developers.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'David Park',
    readTime: '3 min read',
    publishedAt: '2024-11-13T16:00:00Z',
    tags: ['Ethereum', 'Gas Fees', 'EIP'],
    imageUrl: 'https://images.unsplash.com/photo-1660836709415-fdf7d56a6e73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMGNyeXB0b2N1cnJlbmN5fGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ethereum-defi-tvl',
    title: 'Ethereum DeFi TVL Surpasses $100B Mark, Highest Since 2021',
    summary: 'Total value locked in Ethereum DeFi protocols reaches multi-year high amid renewed interest.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'Rachel Kim',
    readTime: '5 min read',
    publishedAt: '2024-11-13T14:00:00Z',
    tags: ['Ethereum', 'DeFi', 'TVL'],
    imageUrl: 'https://images.unsplash.com/photo-1644343262170-e40d72e19a84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMG5ldHdvcmt8ZW58MXx8fHwxNzYzMTM5ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ethereum-nft-royalties',
    title: 'Ethereum Foundation Announces New NFT Royalty Standard ERC-2981',
    summary: 'Standardized royalty implementation aims to protect creator earnings across marketplaces.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'Sophie Anderson',
    readTime: '4 min read',
    publishedAt: '2024-11-13T12:00:00Z',
    tags: ['Ethereum', 'NFT', 'Standards'],
    imageUrl: 'https://images.unsplash.com/photo-1660836709415-fdf7d56a6e73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMGNyeXB0b2N1cnJlbmN5fGVufDF8fHx8MTc2MzEzOTYyOHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ethereum-developer-activity',
    title: 'Ethereum Leads All Blockchains in Developer Activity for 8th Consecutive Quarter',
    summary: 'Electric Capital report confirms Ethereum\'s dominance in developer engagement and contributions.',
    category: 'Ethereum',
    categorySlug: 'ethereum',
    author: 'Thomas Wright',
    readTime: '3 min read',
    publishedAt: '2024-11-13T10:00:00Z',
    tags: ['Ethereum', 'Development', 'Report'],
    imageUrl: 'https://images.unsplash.com/photo-1644343262170-e40d72e19a84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmV1bSUyMG5ldHdvcmt8ZW58MXx8fHwxNzYzMTM5ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== BITCOIN ARTICLES (10) ==========
  {
    id: 'bitcoin-institutional-investment',
    title: 'Over 65% of Crypto-Related Tweets and 84% of Conversations on Reddit Were Positive in 2023',
    summary: 'Social media sentiment analysis reveals overwhelming positive attitude towards cryptocurrency in 2023.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'Michael Roberts',
    readTime: '4 min read',
    publishedAt: '2024-11-14T07:30:00Z',
    tags: ['Bitcoin', 'Sentiment', 'Social Media'],
    imageUrl: 'https://images.unsplash.com/photo-1707075891545-41b982930351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwZGlnaXRhbHxlbnwxfHx8fDE3NjMwNDg1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'bitcoin-mining-sustainability',
    title: 'Bitcoin Mining Council Reports 60% Renewable Energy Usage in Latest Survey',
    summary: 'Industry group\'s quarterly report shows continued progress toward sustainable mining practices.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'Emily Zhang',
    readTime: '4 min read',
    publishedAt: '2024-11-14T05:00:00Z',
    tags: ['Bitcoin', 'Mining', 'Sustainability'],
    imageUrl: 'https://images.unsplash.com/photo-1620778182530-703effa65a06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwbWluaW5nfGVufDF8fHx8MTc2MzExMDI0Nnww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'bitcoin-etf-approval',
    title: 'US-Approved Spot Bitcoin ETFs Could Surpass Entire $50 Billion Crypto ETP Market: BitMEX',
    summary: 'BitMEX research suggests new Bitcoin ETFs could dramatically reshape crypto investment landscape.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'Victoria Chang',
    readTime: '4 min read',
    publishedAt: '2024-11-14T03:00:00Z',
    tags: ['Bitcoin', 'ETF', 'Investment'],
    imageUrl: 'https://images.unsplash.com/photo-1707075891545-41b982930351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwZGlnaXRhbHxlbnwxfHx8fDE3NjMwNDg1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'bitcoin-halving-2024',
    title: 'Bitcoin Halving 2024: Miners Prepare for 50% Block Reward Reduction',
    summary: 'Upcoming halving event expected to impact mining profitability and price dynamics.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'James Martinez',
    readTime: '5 min read',
    publishedAt: '2024-11-13T23:00:00Z',
    tags: ['Bitcoin', 'Halving', 'Mining'],
    imageUrl: 'https://images.unsplash.com/photo-1620778182530-703effa65a06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwbWluaW5nfGVufDF8fHx8MTc2MzExMDI0Nnww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'bitcoin-lightning-growth',
    title: 'Bitcoin Lightning Network Capacity Hits All-Time High of 5,500 BTC',
    summary: 'Layer 2 payment network sees exponential growth in capacity and adoption.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'Carlos Mendez',
    readTime: '3 min read',
    publishedAt: '2024-11-13T21:00:00Z',
    tags: ['Bitcoin', 'Lightning', 'Payments'],
    imageUrl: 'https://images.unsplash.com/photo-1707075891545-41b982930351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwZGlnaXRhbHxlbnwxfHx8fDE3NjMwNDg1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'bitcoin-whale-accumulation',
    title: 'Bitcoin Whales Accumulate 120,000 BTC in Single Week Amid Market Correction',
    summary: 'On-chain data reveals large holders taking advantage of price dips to increase positions.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'Linda Chen',
    readTime: '4 min read',
    publishedAt: '2024-11-13T19:00:00Z',
    tags: ['Bitcoin', 'Whales', 'On-Chain'],
    imageUrl: 'https://images.unsplash.com/photo-1620778182530-703effa65a06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwbWluaW5nfGVufDF8fHx8MTc2MzExMDI0Nnww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'bitcoin-corporate-treasury',
    title: 'Fortune 500 Company Adds Bitcoin to Corporate Treasury, Following MicroStrategy Model',
    summary: 'Major corporation becomes latest to adopt Bitcoin as treasury reserve asset.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'Robert Williams',
    readTime: '5 min read',
    publishedAt: '2024-11-13T17:00:00Z',
    tags: ['Bitcoin', 'Corporate', 'Adoption'],
    imageUrl: 'https://images.unsplash.com/photo-1707075891545-41b982930351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwZGlnaXRhbHxlbnwxfHx8fDE3NjMwNDg1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'bitcoin-ordinals-milestone',
    title: 'Bitcoin Ordinals Surpass 50 Million Inscriptions, Debate Intensifies',
    summary: 'NFT-like inscriptions on Bitcoin blockchain spark community discussion about network usage.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'Amanda Foster',
    readTime: '4 min read',
    publishedAt: '2024-11-13T15:00:00Z',
    tags: ['Bitcoin', 'Ordinals', 'NFT'],
    imageUrl: 'https://images.unsplash.com/photo-1620778182530-703effa65a06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwbWluaW5nfGVufDF8fHx8MTc2MzExMDI0Nnww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'bitcoin-hashrate-record',
    title: 'Bitcoin Network Hashrate Reaches New All-Time High of 500 EH/s',
    summary: 'Record computing power secures Bitcoin network as mining difficulty adjusts upward.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'Kevin Park',
    readTime: '3 min read',
    publishedAt: '2024-11-13T13:00:00Z',
    tags: ['Bitcoin', 'Hashrate', 'Mining'],
    imageUrl: 'https://images.unsplash.com/photo-1707075891545-41b982930351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwZGlnaXRhbHxlbnwxfHx8fDE3NjMwNDg1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'bitcoin-el-salvador-adoption',
    title: 'El Salvador Reports 60% of Population Using Bitcoin Wallet After Two Years',
    summary: 'Government data shows increasing adoption of Bitcoin as legal tender despite early skepticism.',
    category: 'Bitcoin',
    categorySlug: 'bitcoin',
    author: 'Maria Gonzalez',
    readTime: '5 min read',
    publishedAt: '2024-11-13T11:00:00Z',
    tags: ['Bitcoin', 'El Salvador', 'Adoption'],
    imageUrl: 'https://images.unsplash.com/photo-1620778182530-703effa65a06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXRjb2luJTIwbWluaW5nfGVufDF8fHx8MTc2MzExMDI0Nnww&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== DEFI ARTICLES (8) ==========
  {
    id: 'defi-protocol-hack',
    title: 'Major DeFi Protocol Suffers $50M Exploit, Team Offers White Hat Bounty',
    summary: 'A popular DeFi lending protocol was exploited for $50 million, prompting team to offer bounty for fund recovery.',
    category: 'DeFi',
    categorySlug: 'defi',
    author: 'Alex Thompson',
    readTime: '5 min read',
    publishedAt: '2024-11-14T06:00:00Z',
    tags: ['DeFi', 'Security', 'Exploit'],
    imageUrl: 'https://images.unsplash.com/photo-1676911809788-5b9ee7f145fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZpJTIwc2VjdXJpdHl8ZW58MXx8fHwxNzYzMTM5NjI4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'stablecoin-adoption',
    title: 'Global Stablecoin Usage Hits All-Time High as Payment Method Gains Traction',
    summary: 'Stablecoin transaction volume reaches record levels, driven by increased merchant adoption.',
    category: 'DeFi',
    categorySlug: 'defi',
    author: 'Lisa Wang',
    readTime: '4 min read',
    publishedAt: '2024-11-14T02:00:00Z',
    tags: ['Stablecoin', 'Payments', 'Adoption'],
    imageUrl: 'https://images.unsplash.com/photo-1724947583702-99228e11b5bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZpJTIwcHJvdG9jb2x8ZW58MXx8fHwxNzYzMTM5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'dao-governance-evolution',
    title: 'Major DAOs Implement New Governance Models to Improve Voter Participation',
    summary: 'Leading decentralized organizations experiment with innovative voting mechanisms.',
    category: 'DeFi',
    categorySlug: 'defi',
    author: 'Ryan Martinez',
    readTime: '5 min read',
    publishedAt: '2024-11-13T22:00:00Z',
    tags: ['DAO', 'Governance', 'DeFi'],
    imageUrl: 'https://images.unsplash.com/photo-1676911809788-5b9ee7f145fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZpJTIwc2VjdXJpdHl8ZW58MXx8fHwxNzYzMTM5NjI4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'defi-yield-farming-returns',
    title: 'DeFi Yield Farming Strategies Deliver 20%+ APY as Market Conditions Improve',
    summary: 'Optimized liquidity provision strategies offer attractive returns for sophisticated investors.',
    category: 'DeFi',
    categorySlug: 'defi',
    author: 'Patricia Wong',
    readTime: '6 min read',
    publishedAt: '2024-11-13T20:00:00Z',
    tags: ['DeFi', 'Yield Farming', 'APY'],
    imageUrl: 'https://images.unsplash.com/photo-1724947583702-99228e11b5bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZpJTIwcHJvdG9jb2x8ZW58MXx8fHwxNzYzMTM5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'defi-lending-protocols',
    title: 'Aave and Compound See $5B Increase in Total Deposits This Quarter',
    summary: 'Leading lending protocols experience surge in user deposits amid higher interest rates.',
    category: 'DeFi',
    categorySlug: 'defi',
    author: 'Christopher Lee',
    readTime: '4 min read',
    publishedAt: '2024-11-13T18:00:00Z',
    tags: ['DeFi', 'Lending', 'Aave'],
    imageUrl: 'https://images.unsplash.com/photo-1676911809788-5b9ee7f145fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZpJTIwc2VjdXJpdHl8ZW58MXx8fHwxNzYzMTM5NjI4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'defi-dex-volumes',
    title: 'Decentralized Exchange Trading Volume Reaches $150B Monthly High',
    summary: 'Uniswap, Curve, and other DEXs see record trading activity surpassing centralized exchanges.',
    category: 'DeFi',
    categorySlug: 'defi',
    author: 'Hannah Smith',
    readTime: '3 min read',
    publishedAt: '2024-11-13T16:00:00Z',
    tags: ['DeFi', 'DEX', 'Trading'],
    imageUrl: 'https://images.unsplash.com/photo-1724947583702-99228e11b5bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZpJTIwcHJvdG9jb2x8ZW58MXx8fHwxNzYzMTM5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'defi-real-world-assets',
    title: 'Real World Asset Tokenization on DeFi Platforms Exceeds $10B Milestone',
    summary: 'Traditional assets like treasury bills and real estate gain traction in DeFi ecosystem.',
    category: 'DeFi',
    categorySlug: 'defi',
    author: 'Benjamin Taylor',
    readTime: '5 min read',
    publishedAt: '2024-11-13T14:00:00Z',
    tags: ['DeFi', 'RWA', 'Tokenization'],
    imageUrl: 'https://images.unsplash.com/photo-1676911809788-5b9ee7f145fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZpJTIwc2VjdXJpdHl8ZW58MXx8fHwxNzYzMTM5NjI4fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'defi-insurance-protocols',
    title: 'DeFi Insurance Coverage Grows 300% as Users Seek Protection Against Exploits',
    summary: 'Nexus Mutual and other insurance protocols see massive growth following recent hacks.',
    category: 'DeFi',
    categorySlug: 'defi',
    author: 'Olivia Davis',
    readTime: '4 min read',
    publishedAt: '2024-11-13T12:00:00Z',
    tags: ['DeFi', 'Insurance', 'Security'],
    imageUrl: 'https://images.unsplash.com/photo-1724947583702-99228e11b5bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZpJTIwcHJvdG9jb2x8ZW58MXx8fHwxNzYzMTM5ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== NFT ARTICLES (8) ==========
  {
    id: 'nft-market-recovery',
    title: 'NFT Trading Volume Surges 300% as Digital Art Market Shows Signs of Recovery',
    summary: 'NFT marketplace data shows significant uptick in trading activity across major platforms.',
    category: 'NFTs',
    categorySlug: 'nfts',
    author: 'Emma Wilson',
    readTime: '3 min read',
    publishedAt: '2024-11-14T05:30:00Z',
    tags: ['NFTs', 'Market', 'Trading'],
    imageUrl: 'https://images.unsplash.com/photo-1654183818269-22495f928eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZnQlMjBkaWdpdGFsJTIwYXJ0fGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'nft-blue-chip-sales',
    title: 'Bored Ape and CryptoPunk Sales Spike 400% as Blue-Chip NFTs Make Comeback',
    summary: 'Premium NFT collections see renewed interest from collectors and investors.',
    category: 'NFTs',
    categorySlug: 'nfts',
    author: 'Daniel Green',
    readTime: '4 min read',
    publishedAt: '2024-11-13T23:00:00Z',
    tags: ['NFTs', 'BAYC', 'CryptoPunks'],
    imageUrl: 'https://images.unsplash.com/photo-1704524853906-94753b3946cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZnQlMjBtYXJrZXRwbGFjZXxlbnwxfHx8fDE3NjMxMzk4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'nft-gaming-integration',
    title: 'Major Gaming Studio Announces Full NFT Integration for In-Game Assets',
    summary: 'AAA game developer embraces blockchain technology for digital item ownership.',
    category: 'NFTs',
    categorySlug: 'nfts',
    author: 'Lucas Martinez',
    readTime: '5 min read',
    publishedAt: '2024-11-13T21:00:00Z',
    tags: ['NFTs', 'Gaming', 'Integration'],
    imageUrl: 'https://images.unsplash.com/photo-1654183818269-22495f928eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZnQlMjBkaWdpdGFsJTIwYXJ0fGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'nft-fashion-collaboration',
    title: 'Luxury Fashion Brand Launches Exclusive NFT Collection with Physical Redemption',
    summary: 'High-end designer merges digital and physical fashion with blockchain authentication.',
    category: 'NFTs',
    categorySlug: 'nfts',
    author: 'Isabella Torres',
    readTime: '4 min read',
    publishedAt: '2024-11-13T19:00:00Z',
    tags: ['NFTs', 'Fashion', 'Luxury'],
    imageUrl: 'https://images.unsplash.com/photo-1704524853906-94753b3946cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZnQlMjBtYXJrZXRwbGFjZXxlbnwxfHx8fDE3NjMxMzk4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'nft-music-royalties',
    title: 'NFT Music Platform Distributes $10M in Royalties to Artists and Collectors',
    summary: 'Blockchain-based music streaming revolutionizes artist compensation model.',
    category: 'NFTs',
    categorySlug: 'nfts',
    author: 'Marcus Johnson',
    readTime: '3 min read',
    publishedAt: '2024-11-13T17:00:00Z',
    tags: ['NFTs', 'Music', 'Royalties'],
    imageUrl: 'https://images.unsplash.com/photo-1654183818269-22495f928eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZnQlMjBkaWdpdGFsJTIwYXJ0fGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'nft-metaverse-land',
    title: 'Virtual Real Estate Sales Top $500M as Metaverse Projects Gain Momentum',
    summary: 'Decentraland and Sandbox lead digital land rush with major brand purchases.',
    category: 'NFTs',
    categorySlug: 'nfts',
    author: 'Sophia Lee',
    readTime: '5 min read',
    publishedAt: '2024-11-13T15:00:00Z',
    tags: ['NFTs', 'Metaverse', 'Real Estate'],
    imageUrl: 'https://images.unsplash.com/photo-1704524853906-94753b3946cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZnQlMjBtYXJrZXRwbGFjZXxlbnwxfHx8fDE3NjMxMzk4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'nft-sports-collectibles',
    title: 'NBA Top Shot Launches Season 5 with Enhanced Utility and Fan Engagement',
    summary: 'Basketball NFT platform introduces new features to boost collector participation.',
    category: 'NFTs',
    categorySlug: 'nfts',
    author: 'Tyler Brown',
    readTime: '4 min read',
    publishedAt: '2024-11-13T13:00:00Z',
    tags: ['NFTs', 'Sports', 'Collectibles'],
    imageUrl: 'https://images.unsplash.com/photo-1654183818269-22495f928eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZnQlMjBkaWdpdGFsJTIwYXJ0fGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'nft-creator-tools',
    title: 'New No-Code NFT Minting Platform Empowers Artists Without Technical Skills',
    summary: 'User-friendly platform democratizes NFT creation for traditional artists.',
    category: 'NFTs',
    categorySlug: 'nfts',
    author: 'Natalie Cooper',
    readTime: '3 min read',
    publishedAt: '2024-11-13T11:00:00Z',
    tags: ['NFTs', 'Tools', 'Creators'],
    imageUrl: 'https://images.unsplash.com/photo-1704524853906-94753b3946cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZnQlMjBtYXJrZXRwbGFjZXxlbnwxfHx8fDE3NjMxMzk4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== ALTCOINS ARTICLES (8) ==========
  {
    id: 'solana-network-upgrade',
    title: 'Solana Announces Major Network Upgrade to Improve Transaction Speed',
    summary: 'Solana Foundation unveils comprehensive network upgrade aimed at boosting transaction throughput.',
    category: 'Altcoins',
    categorySlug: 'altcoins',
    author: 'David Kim',
    readTime: '4 min read',
    publishedAt: '2024-11-14T04:00:00Z',
    tags: ['Solana', 'Technology', 'Upgrade'],
    imageUrl: 'https://images.unsplash.com/photo-1639322537231-2f206e06af84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwbmV0d29ya3xlbnwxfHx8fDE3NjMwNTM5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'polygon-zkEVM-launch',
    title: 'Polygon zkEVM Mainnet Attracts Over 100 Projects in First Month',
    summary: 'Polygon\'s zero-knowledge Ethereum Virtual Machine sees rapid developer adoption.',
    category: 'Altcoins',
    categorySlug: 'altcoins',
    author: 'Sophia Anderson',
    readTime: '5 min read',
    publishedAt: '2024-11-14T01:00:00Z',
    tags: ['Polygon', 'zkEVM', 'Layer 2'],
    imageUrl: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjMwMzg5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'cardano-hydra-scaling',
    title: 'Cardano Hydra Scaling Solution Achieves 1 Million TPS in Testing',
    summary: 'Layer 2 protocol demonstrates potential for massive transaction throughput.',
    category: 'Altcoins',
    categorySlug: 'altcoins',
    author: 'Gregory White',
    readTime: '4 min read',
    publishedAt: '2024-11-13T22:00:00Z',
    tags: ['Cardano', 'Hydra', 'Scaling'],
    imageUrl: 'https://images.unsplash.com/photo-1639322537231-2f206e06af84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwbmV0d29ya3xlbnwxfHx8fDE3NjMwNTM5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'avalanche-subnets-growth',
    title: 'Avalanche Subnets See 500% Growth as Custom Blockchain Demand Soars',
    summary: 'Enterprise and gaming projects leverage Avalanche\'s subnet technology.',
    category: 'Altcoins',
    categorySlug: 'altcoins',
    author: 'Nicole Harris',
    readTime: '3 min read',
    publishedAt: '2024-11-13T20:00:00Z',
    tags: ['Avalanche', 'Subnets', 'Enterprise'],
    imageUrl: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjMwMzg5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'polkadot-parachain-auctions',
    title: 'Polkadot Announces New Parachain Auction Schedule with Enhanced Features',
    summary: 'Updated auction mechanism aims to improve accessibility for emerging projects.',
    category: 'Altcoins',
    categorySlug: 'altcoins',
    author: 'Andrew Mitchell',
    readTime: '4 min read',
    publishedAt: '2024-11-13T18:00:00Z',
    tags: ['Polkadot', 'Parachains', 'Auctions'],
    imageUrl: 'https://images.unsplash.com/photo-1639322537231-2f206e06af84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwbmV0d29ya3xlbnwxfHx8fDE3NjMwNTM5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'chainlink-staking-launch',
    title: 'Chainlink Staking v0.2 Goes Live with Expanded Capacity and Rewards',
    summary: 'Oracle network upgrades staking program to include more participants.',
    category: 'Altcoins',
    categorySlug: 'altcoins',
    author: 'Michelle Roberts',
    readTime: '5 min read',
    publishedAt: '2024-11-13T16:00:00Z',
    tags: ['Chainlink', 'Staking', 'Oracle'],
    imageUrl: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjMwMzg5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'cosmos-interchain-security',
    title: 'Cosmos Interchain Security Enables Shared Validator Sets Across Chains',
    summary: 'New security model allows smaller chains to leverage Cosmos Hub validators.',
    category: 'Altcoins',
    categorySlug: 'altcoins',
    author: 'Steven Clark',
    readTime: '4 min read',
    publishedAt: '2024-11-13T14:00:00Z',
    tags: ['Cosmos', 'Security', 'IBC'],
    imageUrl: 'https://images.unsplash.com/photo-1639322537231-2f206e06af84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwbmV0d29ya3xlbnwxfHx8fDE3NjMwNTM5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'algorand-state-proofs',
    title: 'Algorand State Proofs Enable Trustless Cross-Chain Communication',
    summary: 'Innovative cryptographic technology allows secure interoperability without bridges.',
    category: 'Altcoins',
    categorySlug: 'altcoins',
    author: 'Diana Lopez',
    readTime: '5 min read',
    publishedAt: '2024-11-13T12:00:00Z',
    tags: ['Algorand', 'Interoperability', 'Technology'],
    imageUrl: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjMwMzg5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== REGULATION ARTICLES (8) ==========
  {
    id: 'crypto-regulation-us',
    title: 'US SEC Proposes New Framework for Cryptocurrency Classification',
    summary: 'Securities and Exchange Commission releases draft guidelines for determining crypto asset securities status.',
    category: 'Regulation',
    categorySlug: 'regulation',
    author: 'Rachel Green',
    readTime: '6 min read',
    publishedAt: '2024-11-14T03:00:00Z',
    tags: ['Regulation', 'SEC', 'Policy'],
    imageUrl: 'https://images.unsplash.com/photo-1622570230304-a37c75da9d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjByZWd1bGF0aW9ufGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'crypto-custody-regulations',
    title: 'European Banking Authority Releases Guidelines for Crypto Asset Custody',
    summary: 'New EBA framework aims to standardize custody requirements across EU member states.',
    category: 'Regulation',
    categorySlug: 'regulation',
    author: 'Dr. James Wilson',
    readTime: '6 min read',
    publishedAt: '2024-11-13T23:00:00Z',
    tags: ['Regulation', 'Custody', 'Europe'],
    imageUrl: 'https://images.unsplash.com/photo-1622570230304-a37c75da9d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjByZWd1bGF0aW9ufGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'crypto-tax-reporting',
    title: 'IRS Issues Updated Guidance on Cryptocurrency Tax Reporting for 2024',
    summary: 'New rules clarify reporting requirements for DeFi, staking, and NFT transactions.',
    category: 'Regulation',
    categorySlug: 'regulation',
    author: 'Patricia Collins',
    readTime: '5 min read',
    publishedAt: '2024-11-13T21:00:00Z',
    tags: ['Regulation', 'Tax', 'IRS'],
    imageUrl: 'https://images.unsplash.com/photo-1622570230304-a37c75da9d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjByZWd1bGF0aW9ufGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'crypto-travel-rule',
    title: 'Global Crypto Travel Rule Implementation Reaches 80% of Major Exchanges',
    summary: 'FATF requirements for transaction data sharing now widely adopted across industry.',
    category: 'Regulation',
    categorySlug: 'regulation',
    author: 'Jonathan Rivera',
    readTime: '4 min read',
    publishedAt: '2024-11-13T19:00:00Z',
    tags: ['Regulation', 'FATF', 'Compliance'],
    imageUrl: 'https://images.unsplash.com/photo-1622570230304-a37c75da9d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjByZWd1bGF0aW9ufGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'crypto-banking-licenses',
    title: 'Hong Kong Grants First Crypto Exchange Banking Licenses Under New Framework',
    summary: 'Asian financial hub moves forward with regulated digital asset banking system.',
    category: 'Regulation',
    categorySlug: 'regulation',
    author: 'Catherine Wong',
    readTime: '5 min read',
    publishedAt: '2024-11-13T17:00:00Z',
    tags: ['Regulation', 'Banking', 'Hong Kong'],
    imageUrl: 'https://images.unsplash.com/photo-1622570230304-a37c75da9d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjByZWd1bGF0aW9ufGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'crypto-stablecoin-regulation',
    title: 'UK Parliament Passes Comprehensive Stablecoin Regulation Bill',
    summary: 'New legislation establishes regulatory framework for fiat-backed digital currencies.',
    category: 'Regulation',
    categorySlug: 'regulation',
    author: 'Henry Thompson',
    readTime: '6 min read',
    publishedAt: '2024-11-13T15:00:00Z',
    tags: ['Regulation', 'Stablecoin', 'UK'],
    imageUrl: 'https://images.unsplash.com/photo-1622570230304-a37c75da9d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjByZWd1bGF0aW9ufGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'crypto-sandbox-programs',
    title: 'Singapore Expands Crypto Sandbox Program to Include DeFi Protocols',
    summary: 'Regulatory sandbox allows experimentation with decentralized finance under supervision.',
    category: 'Regulation',
    categorySlug: 'regulation',
    author: 'Melissa Tan',
    readTime: '4 min read',
    publishedAt: '2024-11-13T13:00:00Z',
    tags: ['Regulation', 'Singapore', 'DeFi'],
    imageUrl: 'https://images.unsplash.com/photo-1622570230304-a37c75da9d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjByZWd1bGF0aW9ufGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'crypto-aml-requirements',
    title: 'G20 Nations Agree on Unified Anti-Money Laundering Standards for Crypto',
    summary: 'International cooperation strengthens enforcement against illicit cryptocurrency use.',
    category: 'Regulation',
    categorySlug: 'regulation',
    author: 'Richard Foster',
    readTime: '5 min read',
    publishedAt: '2024-11-13T11:00:00Z',
    tags: ['Regulation', 'AML', 'G20'],
    imageUrl: 'https://images.unsplash.com/photo-1622570230304-a37c75da9d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjByZWd1bGF0aW9ufGVufDF8fHx8MTc2MzEzOTYyOXww&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== TECHNOLOGY ARTICLES (6) ==========
  {
    id: 'blockchain-scalability',
    title: 'New Layer 2 Solution Claims 100,000 TPS Without Compromising Security',
    summary: 'Innovative scaling solution promises unprecedented transaction speed while maintaining blockchain security.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Nathan Brooks',
    readTime: '5 min read',
    publishedAt: '2024-11-14T02:00:00Z',
    tags: ['Technology', 'Scalability', 'Layer 2'],
    imageUrl: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbnxlbnwxfHx8fDE3NjMwOTE0MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'web3-gaming-growth',
    title: 'Web3 Gaming Sector Attracts $2.3B in Venture Capital This Quarter',
    summary: 'Blockchain gaming continues to draw massive investment despite broader market conditions.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Jordan Lee',
    readTime: '3 min read',
    publishedAt: '2024-11-13T22:00:00Z',
    tags: ['Gaming', 'Web3', 'Investment'],
    imageUrl: 'https://images.unsplash.com/photo-1584743371682-20c52f3abd51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2MzEzOTYzMnww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'zero-knowledge-proofs',
    title: 'Zero-Knowledge Proof Technology Sees Breakthrough in Computation Speed',
    summary: 'New cryptographic advances reduce proof generation time by 90%, enabling broader applications.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Dr. Sarah Mitchell',
    readTime: '6 min read',
    publishedAt: '2024-11-13T20:00:00Z',
    tags: ['Technology', 'ZK-Proofs', 'Cryptography'],
    imageUrl: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbnxlbnwxfHx8fDE3NjMwOTE0MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'quantum-resistant-blockchain',
    title: 'First Quantum-Resistant Blockchain Network Launches on Mainnet',
    summary: 'Post-quantum cryptography implementation prepares for future quantum computing threats.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Professor Alan Chen',
    readTime: '5 min read',
    publishedAt: '2024-11-13T18:00:00Z',
    tags: ['Technology', 'Quantum', 'Security'],
    imageUrl: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjMwMzg5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'decentralized-storage-growth',
    title: 'Decentralized Storage Networks Store Over 1 Exabyte of Data',
    summary: 'Filecoin, Arweave, and competitors see massive adoption for Web3 infrastructure.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Monica Stevens',
    readTime: '4 min read',
    publishedAt: '2024-11-13T16:00:00Z',
    tags: ['Technology', 'Storage', 'Infrastructure'],
    imageUrl: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbnxlbnwxfHx8fDE3NjMwOTE0MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'ai-blockchain-integration',
    title: 'AI and Blockchain Convergence Creates New Opportunities for Decentralized ML',
    summary: 'Machine learning models deployed on-chain enable transparent and verifiable AI systems.',
    category: 'Technology',
    categorySlug: 'technology',
    author: 'Dr. Kevin Zhang',
    readTime: '6 min read',
    publishedAt: '2024-11-13T14:00:00Z',
    tags: ['Technology', 'AI', 'Blockchain'],
    imageUrl: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjMwMzg5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },

  // ========== MARKETS ARTICLES (6) ==========
  {
    id: 'bitcoin-etf-approval',
    title: 'Bitcoin ETF Sees $1B in Trading Volume on First Day',
    summary: 'Spot Bitcoin ETF launch marks historic moment for institutional crypto adoption.',
    category: 'Markets',
    categorySlug: 'markets',
    author: 'Victoria Chang',
    readTime: '4 min read',
    publishedAt: '2024-11-14T01:00:00Z',
    tags: ['Markets', 'ETF', 'Bitcoin'],
    imageUrl: 'https://images.unsplash.com/photo-1640451859877-1374a1155215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMGZpbmFuY2V8ZW58MXx8fHwxNzYzMTM5NjMyfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'crypto-market-cap-growth',
    title: 'Total Cryptocurrency Market Cap Surpasses $2.5 Trillion Milestone',
    summary: 'Crypto markets reach multi-year high as institutional and retail interest converge.',
    category: 'Markets',
    categorySlug: 'markets',
    author: 'Frank Morrison',
    readTime: '3 min read',
    publishedAt: '2024-11-13T21:00:00Z',
    tags: ['Markets', 'Market Cap', 'Analysis'],
    imageUrl: 'https://images.unsplash.com/photo-1633534415766-165181ffdbb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9jdXJyZW5jeSUyMHRyYWRpbmd8ZW58MXx8fHwxNzYzMDQ4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'exchange-trading-volumes',
    title: 'Crypto Exchange Trading Volumes Hit $100B Daily Average in Q4',
    summary: 'Major exchanges report strongest quarterly performance since 2021 bull run.',
    category: 'Markets',
    categorySlug: 'markets',
    author: 'Julia Barnes',
    readTime: '4 min read',
    publishedAt: '2024-11-13T19:00:00Z',
    tags: ['Markets', 'Exchanges', 'Volume'],
    imageUrl: 'https://images.unsplash.com/photo-1639389016105-2fb11199fb6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjBleGNoYW5nZXxlbnwxfHx8fDE3NjMxMzk4ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'institutional-custody-growth',
    title: 'Institutional Crypto Custody Assets Under Management Reach $200B',
    summary: 'Traditional custodians report exponential growth in digital asset holdings.',
    category: 'Markets',
    categorySlug: 'markets',
    author: 'Edward Palmer',
    readTime: '5 min read',
    publishedAt: '2024-11-13T17:00:00Z',
    tags: ['Markets', 'Custody', 'Institutional'],
    imageUrl: 'https://images.unsplash.com/photo-1640451859877-1374a1155215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMGZpbmFuY2V8ZW58MXx8fHwxNzYzMTM5NjMyfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'crypto-derivatives-market',
    title: 'Bitcoin Futures Open Interest Hits Record $30B Across All Exchanges',
    summary: 'Derivatives market expansion signals growing institutional participation.',
    category: 'Markets',
    categorySlug: 'markets',
    author: 'George Hamilton',
    readTime: '4 min read',
    publishedAt: '2024-11-13T15:00:00Z',
    tags: ['Markets', 'Futures', 'Derivatives'],
    imageUrl: 'https://images.unsplash.com/photo-1633534415766-165181ffdbb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9jdXJyZW5jeSUyMHRyYWRpbmd8ZW58MXx8fHwxNzYzMDQ4NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 'altcoin-season-metrics',
    title: 'Altcoin Season Index Reaches 75 as Alternative Cryptocurrencies Outperform',
    summary: 'Market data indicates strong momentum for mid and small-cap digital assets.',
    category: 'Markets',
    categorySlug: 'markets',
    author: 'Christine Yu',
    readTime: '3 min read',
    publishedAt: '2024-11-13T13:00:00Z',
    tags: ['Markets', 'Altcoins', 'Analysis'],
    imageUrl: 'https://images.unsplash.com/photo-1640451859877-1374a1155215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMGZpbmFuY2V8ZW58MXx8fHwxNzYzMTM5NjMyfDA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

// Helper function to get articles by category
export function getArticlesByCategory(categorySlug: string): Article[] {
  if (categorySlug === 'all') {
    return mockArticles;
  }
  return mockArticles.filter(article => article.categorySlug === categorySlug);
}

// Helper function to get recent articles
export function getRecentArticles(limit: number = 5): Article[] {
  return mockArticles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

// Helper function to search articles
export function searchArticles(query: string): Article[] {
  const lowerQuery = query.toLowerCase();
  return mockArticles.filter(article =>
    article.title.toLowerCase().includes(lowerQuery) ||
    article.summary.toLowerCase().includes(lowerQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Helper function to get articles by tag
export function getArticlesByTag(tag: string): Article[] {
  return mockArticles.filter(article => 
    article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

// Helper function to get featured articles (most recent from each category)
export function getFeaturedArticles(): Article[] {
  const categories = ['ethereum', 'bitcoin', 'defi', 'nfts', 'altcoins', 'regulation', 'technology', 'markets'];
  const featured: Article[] = [];
  
  categories.forEach(category => {
    const categoryArticles = getArticlesByCategory(category);
    if (categoryArticles.length > 0) {
      featured.push(categoryArticles[0]);
    }
  });
  
  return featured;
}

// Helper function to get trending articles (articles with most tags)
export function getTrendingArticles(limit: number = 5): Article[] {
  return mockArticles
    .sort((a, b) => b.tags.length - a.tags.length)
    .slice(0, limit);
}

// Get article by ID
export function getArticleById(id: string): Article | undefined {
  return mockArticles.find(article => article.id === id);
}

// Get category article count
export function getCategoryArticleCount(categorySlug: string): number {
  return getArticlesByCategory(categorySlug).length;
}

// Get all unique tags
export function getAllTags(): string[] {
  const tagsSet = new Set<string>();
  mockArticles.forEach(article => {
    article.tags.forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}
