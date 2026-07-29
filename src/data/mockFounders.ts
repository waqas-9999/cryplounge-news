export interface FounderStory {
  id: string;
  name: string;
  slug: string;
  role: string;
  project: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  heroImage: string;
  readTime: string;
  publishDate: string;
  tags: string[];
  region: string;
  ecosystem: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    github?: string;
  };
  projects: Array<{
    name: string;
    slug: string;
    description: string;
  }>;
  achievements: string[];
  insights: Array<{
    quote: string;
    context: string;
  }>;
  stats: {
    views: number;
    shares: number;
    saves: number;
    comments: number;
  };
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected' | 'archived';
  submittedBy?: string; // User ID who submitted (for public submissions)
  rejectionReason?: string; // Reason if rejected
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoMeta: string;
}

export const mockFounderStories: FounderStory[] = [
  {
    id: '1',
    name: 'Vitalik Buterin',
    slug: 'vitalik-buterin',
    role: 'Co-Founder & Chief Scientist',
    project: 'Ethereum',
    category: 'Layer 1',
    excerpt: 'The visionary behind the world\'s leading smart contract platform shares insights on building decentralized systems and the future of blockchain technology.',
    content: `# The Journey of Building Ethereum

## Early Days and Vision

When I first conceptualized Ethereum in late 2013, I was driven by a simple yet powerful idea: blockchain technology could be used for much more than just currency. The existing Bitcoin protocol, while revolutionary, had limitations that prevented developers from building more complex decentralized applications.

## The Whitepaper Moment

In December 2013, I published the Ethereum whitepaper. The response from the community was overwhelming. Developers, researchers, and entrepreneurs from around the world reached out, eager to contribute to this vision of a "world computer."

## Building the Foundation

The journey from whitepaper to mainnet launch in July 2015 was filled with challenges. We had to:

1. **Design a robust virtual machine** - The EVM needed to be Turing-complete yet secure
2. **Create a sustainable economic model** - Gas fees had to balance network security with usability
3. **Build a strong community** - Decentralization meant empowering developers worldwide
4. **Ensure security** - Smart contracts would control billions of dollars

## Key Insights

### On Decentralization
"The goal of decentralization is not just to avoid single points of failure, but to create systems that are genuinely resistant to control by any single entity."

### On Innovation
"We need to think beyond financial applications. Smart contracts can revolutionize governance, identity, supply chains, and countless other domains."

### On Challenges
"The biggest challenge isn't technical - it's convincing people that decentralized systems can work at scale while maintaining the properties that make them valuable."

## Looking Forward

Ethereum's evolution continues with:
- **Ethereum 2.0**: Transitioning to Proof of Stake
- **Layer 2 Solutions**: Scaling through rollups and sidechains
- **Zero-Knowledge Proofs**: Enhanced privacy and efficiency
- **Cross-Chain Interoperability**: Connecting blockchain ecosystems

The future of Ethereum is about making decentralized technology accessible to everyone while maintaining the core principles of decentralization and security.

## Advice for Founders

1. **Think Long-Term**: Build for sustainability, not just short-term gains
2. **Community First**: Your community is your greatest asset
3. **Stay Focused**: Don't try to solve every problem at once
4. **Remain Adaptable**: Be willing to pivot based on feedback and research
5. **Prioritize Security**: In crypto, trust is everything

The journey has been incredible, and we're just getting started.`,
    image: 'https://images.unsplash.com/photo-1617386124435-9eb3935b1e11',
    heroImage: 'https://images.unsplash.com/photo-1639322537228-f710d846310a',
    readTime: '12 min read',
    publishDate: '2025-01-20T10:00:00Z',
    tags: ['Innovation', 'Vision', 'Leadership', 'Ethereum'],
    region: 'Global',
    ecosystem: 'Ethereum',
    socialLinks: {
      twitter: 'https://twitter.com/VitalikButerin',
      website: 'https://ethereum.org',
      github: 'https://github.com/ethereum'
    },
    projects: [
      {
        name: 'Ethereum',
        slug: 'ethereum',
        description: 'Leading smart contract platform enabling decentralized applications'
      },
      {
        name: 'Ethereum Foundation',
        slug: 'ethereum-foundation',
        description: 'Non-profit organization supporting Ethereum development and research'
      }
    ],
    achievements: [
      'Co-founded Ethereum, the second-largest cryptocurrency by market cap',
      'Pioneered smart contract technology enabling thousands of decentralized applications',
      'Leading ongoing research in blockchain scalability and security',
      'Recipient of Thiel Fellowship and World Technology Award',
      'Created EIP-1559 fee mechanism improving Ethereum economics'
    ],
    insights: [
      {
        quote: "I thought [those in the Bitcoin community] weren't approaching the problem in the right way. They were trying to support each use case in a sort of Swiss Army knife protocol.",
        context: 'On the inspiration for Ethereum'
      },
      {
        quote: 'Ethereum is not just a platform for money, but a platform for decentralized applications that can change how we organize society.',
        context: 'On Ethereum\'s purpose'
      }
    ],
    stats: {
      views: 45230,
      shares: 3420,
      saves: 8920,
      comments: 234
    },
    status: 'published',
    featured: true,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
    seoTitle: 'Vitalik Buterin: Building Ethereum & The Future of Decentralization',
    seoMeta: 'Ethereum co-founder Vitalik Buterin shares his journey, insights on decentralization, and vision for blockchain technology.'
  },
  {
    id: '2',
    name: 'Anatoly Yakovenko',
    slug: 'anatoly-yakovenko',
    role: 'Founder & CEO',
    project: 'Solana',
    category: 'Layer 1',
    excerpt: 'How high-performance blockchain architecture is redefining what\'s possible in decentralized systems at scale.',
    content: `# Building Solana: Speed Meets Decentralization

## The Performance Challenge

Coming from a background in distributed systems at Qualcomm and Dropbox, I saw a fundamental problem in blockchain: existing solutions sacrificed performance for decentralization. I believed we could have both.

## Proof of History Innovation

The breakthrough came with Proof of History - a cryptographic clock that allows nodes to agree on time without communicating. This simple yet powerful concept enables Solana to process over 65,000 transactions per second.

## Key Technical Innovations

### 1. Proof of History (PoH)
A verifiable delay function that creates a historical record proving events occurred in a specific sequence.

### 2. Tower BFT
Our Proof of Stake consensus algorithm leveraging PoH as a cryptographic clock.

### 3. Gulf Stream
Mempool-less transaction forwarding reducing confirmation times.

### 4. Turbine
Block propagation protocol inspired by BitTorrent.

## Building the Ecosystem

Speed isn't valuable without utility. We focused on:
- **DeFi Applications**: Low fees enable new financial primitives
- **NFT Marketplaces**: Fast, affordable minting and trading
- **Gaming**: Real-time blockchain gaming becomes viable
- **Payments**: Consumer-grade payment experiences

## Lessons Learned

### On Technical Trade-offs
"We chose to optimize for performance while maintaining decentralization through hardware requirements that are high but accessible."

### On Network Outages
"Every outage taught us valuable lessons. Building a high-performance blockchain is hard, but we're committed to continuous improvement."

### On Ecosystem Growth
"The best technology means nothing without a vibrant ecosystem. Supporting developers is our top priority."

## The Future

Solana's roadmap includes:
- **Firedancer**: New validator client for improved performance
- **State Compression**: Reducing storage costs for NFTs and DeFi
- **Mobile Integration**: Bringing crypto to mobile-first users
- **Cross-Chain Bridges**: Connecting with other ecosystems

## Advice for Technical Founders

1. **Solve Real Problems**: Don't build technology for technology's sake
2. **Measure Everything**: Data-driven decisions lead to better outcomes
3. **Embrace Failure**: Outages and bugs are learning opportunities
4. **Build Community**: Your users and developers are your partners
5. **Stay Focused**: Don't get distracted by short-term market sentiment`,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
    heroImage: 'https://images.unsplash.com/photo-1639322537228-f710d846310a',
    readTime: '10 min read',
    publishDate: '2025-01-18T14:00:00Z',
    tags: ['Innovation', 'Technology', 'Performance', 'Solana'],
    region: 'North America',
    ecosystem: 'Solana',
    socialLinks: {
      twitter: 'https://twitter.com/aeyakovenko',
      website: 'https://solana.com',
      github: 'https://github.com/solana-labs'
    },
    projects: [
      {
        name: 'Solana',
        slug: 'solana',
        description: 'High-performance blockchain supporting 65k+ TPS'
      },
      {
        name: 'Solana Labs',
        slug: 'solana-labs',
        description: 'Core development team building Solana infrastructure'
      }
    ],
    achievements: [
      'Created Proof of History consensus mechanism',
      'Built blockchain processing 65,000+ transactions per second',
      'Grew Solana ecosystem to 400+ projects in 2 years',
      'Pioneered low-cost NFT minting and trading',
      'Led $314M Series C funding round'
    ],
    insights: [
      {
        quote: 'We believe that blockchain technology should be fast enough for everyday use, not just theoretical decentralization.',
        context: 'On Solana\'s mission'
      },
      {
        quote: 'Every network outage is a learning experience. We\'re building something unprecedented, and resilience comes from iteration.',
        context: 'On network challenges'
      }
    ],
    stats: {
      views: 32180,
      shares: 2340,
      saves: 5670,
      comments: 187
    },
    status: 'published',
    featured: true,
    createdAt: '2025-01-16T14:00:00Z',
    updatedAt: '2025-01-18T14:00:00Z',
    seoTitle: 'Anatoly Yakovenko: Building Solana & High-Performance Blockchain',
    seoMeta: 'Solana founder Anatoly Yakovenko on creating a blockchain that processes 65k+ TPS while maintaining decentralization.'
  },
  {
    id: '3',
    name: 'Hayden Adams',
    slug: 'hayden-adams',
    role: 'Founder',
    project: 'Uniswap',
    category: 'Industry',
    excerpt: 'From mechanical engineer to DeFi pioneer - the story of building the largest decentralized exchange.',
    content: `# Creating Uniswap: Democratizing Market Making

## An Unlikely Beginning

I never planned to work in crypto. As a mechanical engineer laid off in 2017, I started learning Solidity almost by accident. A friend mentioned automated market makers, and I became obsessed with the concept.

## The Automated Market Maker Revolution

Traditional exchanges use order books. Uniswap introduced a simple but revolutionary idea: the constant product formula (x * y = k). This mathematical equation enables anyone to provide liquidity and earn fees.

## Building in Public

I documented my entire journey on Twitter and Ethereum Research forums. The community's support was incredible:
- Vitalik Buterin suggested the name "Uniswap"
- Developers worldwide contributed ideas and feedback
- Early adopters provided liquidity despite uncertainty

## Key Milestones

### Uniswap V1 (2018)
- Simple ETH <> ERC20 swaps
- Proved the AMM concept worked
- Processed millions in volume

### Uniswap V2 (2020)
- ERC20 <> ERC20 pairs
- Price oracles for DeFi
- Flash swaps innovation

### Uniswap V3 (2021)
- Concentrated liquidity
- Multiple fee tiers
- Capital efficiency improvements

## Impact on DeFi

Uniswap enabled:
- **Permissionless Listing**: Anyone can create a market
- **Continuous Liquidity**: 24/7 trading without order books
- **Decentralized Price Discovery**: No central authority
- **Composability**: Other protocols built on Uniswap

## Challenges Overcome

### Front-Running
Led to innovations in MEV protection and private transactions.

### Gas Fees
Drove development of L2 deployments on Polygon, Arbitrum, and Optimism.

### Regulatory Uncertainty
Navigating global regulatory frameworks while maintaining decentralization.

## Philosophy

### On Decentralization
"DeFi isn't just about financial products. It's about creating open systems that anyone can use, build on, and improve."

### On Innovation
"The best ideas often come from the community. Stay humble and listen to users."

### On Sustainability
"Build for the long term. Quick wins are tempting, but lasting impact requires patience."

## Looking Ahead

The future of DeFi includes:
- **Layer 2 Scaling**: Making DeFi accessible to everyone
- **Cross-Chain Trading**: Seamless multi-chain liquidity
- **Improved UX**: Abstracting complexity for users
- **Regulatory Clarity**: Working with policymakers

## For Aspiring Founders

1. **Start Building**: Don't wait for the perfect idea
2. **Engage Community**: Your users are your best advisors  
3. **Iterate Quickly**: Ship early, learn fast, improve continuously
4. **Stay Principled**: Don't compromise on core values
5. **Think Long-Term**: Overnight success takes years of work

The journey from unemployed engineer to DeFi founder taught me that with curiosity, persistence, and community support, anyone can build something meaningful.`,
    image: 'https://images.unsplash.com/photo-1668112262164-56e782a6e07a',
    heroImage: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307',
    readTime: '11 min read',
    publishDate: '2025-01-22T09:00:00Z',
    tags: ['DeFi', 'Innovation', 'Success', 'Uniswap'],
    region: 'North America',
    ecosystem: 'Ethereum',
    socialLinks: {
      twitter: 'https://twitter.com/haydenzadams',
      website: 'https://uniswap.org',
      github: 'https://github.com/Uniswap'
    },
    projects: [
      {
        name: 'Uniswap',
        slug: 'uniswap',
        description: 'Leading decentralized exchange with $5B+ daily volume'
      },
      {
        name: 'Uniswap Labs',
        slug: 'uniswap-labs',
        description: 'Development team behind Uniswap protocol'
      }
    ],
    achievements: [
      'Created largest decentralized exchange by volume',
      'Pioneered automated market maker model',
      'Processed over $1 trillion in trading volume',
      'Deployed on 10+ blockchain networks',
      'UNI token airdrop distributed $6.4B to users'
    ],
    insights: [
      {
        quote: 'I was just a mechanical engineer who lost his job. If I can build this, anyone can.',
        context: 'On getting started in crypto'
      },
      {
        quote: 'The constant product formula is beautiful in its simplicity. Sometimes the best solutions are the simplest ones.',
        context: 'On AMM design'
      }
    ],
    stats: {
      views: 28940,
      shares: 1980,
      saves: 4560,
      comments: 156
    },
    status: 'published',
    featured: true,
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-01-22T09:00:00Z',
    seoTitle: 'Hayden Adams: Building Uniswap & Revolutionizing DeFi',
    seoMeta: 'Uniswap founder Hayden Adams shares his journey from mechanical engineer to creating the world\'s largest decentralized exchange.'
  }
];

export const founderCategories = [
  'DeFi',
  'NFT',
  'Layer 1',
  'Layer 2',
  'Infrastructure',
  'Gaming',
  'DAO',
  'Privacy'
];

export const founderRegions = [
  'Global',
  'North America',
  'Europe',
  'Asia',
  'Africa',
  'Latin America',
  'Middle East',
  'Oceania'
];
