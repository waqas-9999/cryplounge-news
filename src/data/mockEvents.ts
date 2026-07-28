export interface Event {
  id: string;
  name: string;
  slug: string;
  category: 'Conference' | 'Hackathon' | 'Webinar' | 'Meetup' | 'Workshop';
  date: string;
  endDate?: string;
  time: string;
  location: string;
  locationType: 'online' | 'offline' | 'hybrid';
  status: 'published' | 'draft' | 'cancelled';
  featured: boolean;
  eventStatus: 'upcoming' | 'ongoing' | 'ended';
  summary: string;
  description: string;
  content: string;
  bannerImage: string;
  thumbnailImage: string;
  agenda: string[];
  speakers: Array<{
    name: string;
    title: string;
    photo: string;
    bio?: string;
  }>;
  prizePool?: string;
  sponsors: string[];
  organizer: {
    name: string;
    email: string;
    website: string;
    logo?: string;
  };
  registerLink: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    telegram?: string;
    website?: string;
  };
  tags: string[];
  capacity?: number;
  registeredCount?: number;
  price?: string;
  requirements?: string[];
  stats: {
    views: number;
    registrations: number;
    shares: number;
    interested: number;
  };
  relatedEvents: string[];
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoMeta: string;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Bitcoin 2025 Conference',
    slug: 'bitcoin-2025-conference',
    category: 'Conference',
    date: '2025-05-15',
    endDate: '2025-05-17',
    time: '09:00 AM - 06:00 PM',
    location: 'Miami Beach Convention Center, Florida',
    locationType: 'offline',
    status: 'published',
    featured: true,
    eventStatus: 'upcoming',
    summary: 'The largest Bitcoin event in the world returns to Miami with industry leaders, developers, and enthusiasts.',
    description: 'Bitcoin 2025 Conference is the premier gathering for the Bitcoin community. Join us for three days of insightful talks, networking opportunities, and exhibitions from leading Bitcoin companies.',
    content: `# Bitcoin 2025 Conference

## The Premier Bitcoin Event

Join us for the world's largest Bitcoin conference featuring three days of groundbreaking discussions, networking, and innovation.

### Event Highlights

**Day 1: Bitcoin Fundamentals**
- Opening keynote by Michael Saylor
- Panel: The Future of Bitcoin Adoption
- Workshop: Lightning Network Development
- Exhibition hall opening

**Day 2: Scaling & Technology**
- Jack Dorsey keynote on Bitcoin payments
- Technical sessions on Layer 2 solutions
- Developer workshops
- Networking dinner

**Day 3: Institutional & Regulation**
- Institutional adoption panel
- Regulatory landscape discussion
- Closing keynote
- Awards ceremony

### Why Attend?

1. **Network with 15,000+ attendees** from around the world
2. **Learn from industry pioneers** shaping Bitcoin's future
3. **Discover new opportunities** in the Bitcoin ecosystem
4. **Connect with investors and partners**
5. **Showcase your Bitcoin project** to a global audience

### What to Expect

- 100+ speakers from leading Bitcoin companies
- 50+ exhibition booths
- Multiple networking events
- Exclusive after-parties
- Premium swag bags

### Venue Information

The Miami Beach Convention Center offers:
- 500,000 sq ft of event space
- State-of-the-art facilities
- Easy access from Miami International Airport
- Walking distance to hotels and restaurants

### Registration Tiers

- **General Admission**: $799
- **VIP Pass**: $1,999 (includes exclusive sessions)
- **Student Pass**: $299 (limited availability)
- **Virtual Pass**: $199 (livestream access)

Early bird discount: 20% off until March 1st!`,
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    thumbnailImage: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7',
    agenda: [
      'Day 1: Bitcoin Fundamentals & Adoption',
      'Day 2: Scaling Solutions & Technology',
      'Day 3: Institutional Adoption & Future',
      'Networking Events & After Parties',
      'Exhibition Hall & Demo Zones'
    ],
    speakers: [
      {
        name: 'Michael Saylor',
        title: 'Executive Chairman, MicroStrategy',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        bio: 'Leading Bitcoin advocate and institutional adoption pioneer'
      },
      {
        name: 'Jack Dorsey',
        title: 'Co-founder, Twitter & Block',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        bio: 'Building the future of Bitcoin payments and Lightning Network'
      },
      {
        name: 'Cynthia Lummis',
        title: 'U.S. Senator, Wyoming',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        bio: 'Pro-Bitcoin legislator advocating for clear crypto regulations'
      }
    ],
    prizePool: undefined,
    sponsors: [
      'MicroStrategy',
      'Block',
      'Strike',
      'Swan Bitcoin',
      'River Financial',
      'Unchained Capital'
    ],
    organizer: {
      name: 'BTC Inc.',
      email: 'info@btcinc.com',
      website: 'https://b.tc/conference',
      logo: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307'
    },
    registerLink: 'https://bitcoin2025.com/register',
    socialLinks: {
      twitter: 'https://twitter.com/TheBitcoinConf',
      telegram: 'https://t.me/bitcoin2025',
      website: 'https://bitcoin2025.com'
    },
    tags: ['Bitcoin', 'Conference', 'Adoption', 'Lightning Network', 'Institutional'],
    capacity: 15000,
    registeredCount: 8240,
    price: '$799 - $1,999',
    requirements: [
      'Valid photo ID required',
      'COVID-19 vaccination recommended',
      'No age restrictions',
      'Photography allowed'
    ],
    stats: {
      views: 124500,
      registrations: 8240,
      shares: 4320,
      interested: 23400
    },
    relatedEvents: ['2', '3'],
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-20T15:30:00Z',
    seoTitle: 'Bitcoin 2025 Conference - Miami | May 15-17',
    seoMeta: 'Join 15,000+ Bitcoin enthusiasts at the world\'s largest Bitcoin conference. Three days of insights, networking, and innovation in Miami.'
  },
  {
    id: '2',
    name: 'ETHGlobal Hackathon 2025',
    slug: 'ethglobal-hackathon-2025',
    category: 'Hackathon',
    date: '2025-03-20',
    endDate: '2025-03-23',
    time: '24/7 Hacking',
    location: 'Virtual + IRL (San Francisco)',
    locationType: 'hybrid',
    status: 'published',
    featured: true,
    eventStatus: 'upcoming',
    summary: 'Build the future of Ethereum in this 72-hour global hackathon with $500k in prizes.',
    description: 'ETHGlobal Hackathon brings together the best builders in the Ethereum ecosystem for an intensive weekend of innovation, learning, and building.',
    content: `# ETHGlobal Hackathon 2025

## Build the Future of Ethereum

Join thousands of developers worldwide for 72 hours of intense building, learning, and networking.

### Hackathon Tracks

1. **DeFi Innovation** - $100k prize pool
   - Next-gen lending protocols
   - Decentralized exchanges
   - Yield optimization

2. **NFT & Gaming** - $100k prize pool
   - On-chain games
   - Dynamic NFTs
   - Creator tools

3. **Infrastructure** - $100k prize pool
   - Developer tooling
   - Scaling solutions
   - Cross-chain bridges

4. **Public Goods** - $100k prize pool
   - Social impact projects
   - Governance tools
   - Community platforms

5. **Open Innovation** - $100k prize pool
   - Wildcard track
   - Experimental ideas
   - Novel use cases

### Why Participate?

- **$500k total prize pool** across all tracks
- **Mentorship from experts** at Ethereum Foundation, Consensys, Uniswap, and more
- **Sponsored prizes** from 30+ leading Web3 companies
- **Job opportunities** with top Ethereum projects
- **Free swag and merch** from sponsors
- **Networking** with 2,000+ builders globally

### Schedule

**Friday, March 20**
- 6:00 PM - Opening ceremony
- 7:00 PM - Sponsor introductions
- 8:00 PM - Team formation
- 9:00 PM - Hacking begins!

**Saturday, March 21**
- All day hacking
- Workshops every 2 hours
- 1-on-1 mentor sessions
- Midnight: Pizza & energy drinks

**Sunday, March 22**
- Morning: Final sprint
- 2:00 PM - Hacking ends
- 3:00 PM - Project demos
- 6:00 PM - Judging begins

**Monday, March 23**
- 10:00 AM - Winners announced
- 11:00 AM - Closing ceremony
- 12:00 PM - Networking lunch

### Resources Provided

- API access to all sponsor platforms
- Cloud credits (AWS, Google Cloud)
- Development tools and frameworks
- Mentor office hours
- Technical workshops
- Free meals and snacks (IRL)

### Judging Criteria

- **Innovation** (30%) - How novel is the idea?
- **Technical Execution** (30%) - Quality of implementation
- **UX/Design** (20%) - User experience and interface
- **Potential Impact** (20%) - Real-world applicability`,
    bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    thumbnailImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
    agenda: [
      'Team Formation & Kickoff',
      '72 Hours of Continuous Hacking',
      'Mentor Office Hours & Workshops',
      'Project Submissions & Demos',
      'Judging & Winners Announcement'
    ],
    speakers: [
      {
        name: 'Vitalik Buterin',
        title: 'Co-founder, Ethereum',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        bio: 'Opening keynote and mentorship sessions'
      },
      {
        name: 'Hayden Adams',
        title: 'Founder, Uniswap',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
        bio: 'DeFi track mentor and judge'
      }
    ],
    prizePool: '$500,000',
    sponsors: [
      'Ethereum Foundation',
      'Consensys',
      'Uniswap',
      'Polygon',
      'Optimism',
      'Arbitrum',
      'Chainlink',
      'The Graph'
    ],
    organizer: {
      name: 'ETHGlobal',
      email: 'hello@ethglobal.com',
      website: 'https://ethglobal.com'
    },
    registerLink: 'https://ethglobal.com/events/2025',
    socialLinks: {
      twitter: 'https://twitter.com/ETHGlobal',
      discord: 'https://discord.gg/ethglobal',
      telegram: 'https://t.me/ethglobal'
    },
    tags: ['Ethereum', 'Hackathon', 'DeFi', 'NFT', 'Building'],
    capacity: 2000,
    registeredCount: 1840,
    price: 'Free',
    requirements: [
      'Laptop with development environment',
      'GitHub account',
      'Basic Solidity knowledge recommended',
      'Team size: 1-4 people'
    ],
    stats: {
      views: 89300,
      registrations: 1840,
      shares: 3200,
      interested: 15600
    },
    relatedEvents: ['1', '3'],
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-01-22T11:20:00Z',
    seoTitle: 'ETHGlobal Hackathon 2025 - $500k Prize Pool',
    seoMeta: 'Build the future of Ethereum in this 72-hour global hackathon. $500k in prizes, mentorship from experts, and networking with 2000+ builders.'
  },
  {
    id: '3',
    name: 'Web3 Security Summit',
    slug: 'web3-security-summit',
    category: 'Webinar',
    date: '2025-02-28',
    time: '02:00 PM - 05:00 PM UTC',
    location: 'Online (Zoom)',
    locationType: 'online',
    status: 'published',
    featured: true,
    eventStatus: 'upcoming',
    summary: 'Learn from top security researchers about protecting your Web3 projects from exploits and vulnerabilities.',
    description: 'A comprehensive 3-hour webinar series covering the latest in Web3 security, smart contract auditing, and best practices.',
    content: `# Web3 Security Summit

## Protect Your Web3 Projects

Join leading security researchers for an in-depth exploration of Web3 security challenges and solutions.

### Sessions

**Session 1: Smart Contract Security (14:00-15:00 UTC)**
- Common vulnerabilities and how to prevent them
- Reentrancy attacks deep dive
- Access control best practices
- Integer overflow/underflow

**Session 2: DeFi Security (15:00-16:00 UTC)**  
- Flash loan attacks explained
- Oracle manipulation
- Price slippage protection
- MEV and sandwich attacks

**Session 3: NFT & Wallet Security (16:00-17:00 UTC)**
- Phishing attack prevention
- Wallet security best practices
- NFT smart contract vulnerabilities
- Secure metadata storage

### Key Takeaways

- Understand the most common attack vectors
- Learn how to audit smart contracts
- Implement security best practices
- Use automated security tools
- Respond to security incidents

### Who Should Attend?

- Smart contract developers
- Security researchers
- Protocol founders
- DeFi builders
- Auditing firms

### Tools Covered

- Slither
- Mythril
- Echidna
- Foundry
- Hardhat
- OpenZeppelin

### Certification

Attendees will receive a certificate of completion and access to:
- Recording of all sessions
- Security checklist PDF
- Code examples repository
- Private Discord channel`,
    bannerImage: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f',
    thumbnailImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    agenda: [
      'Smart Contract Vulnerabilities & Prevention',
      'DeFi Security Best Practices',
      'NFT & Wallet Security',
      'Q&A with Security Experts',
      'Certificate Distribution'
    ],
    speakers: [
      {
        name: 'Samczsun',
        title: 'Security Researcher, Paradigm',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
        bio: 'Discovered and prevented millions in security exploits'
      },
      {
        name: 'Trail of Bits Team',
        title: 'Security Auditing Firm',
        photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
        bio: 'Leading security auditors for DeFi protocols'
      }
    ],
    prizePool: undefined,
    sponsors: [
      'OpenZeppelin',
      'Trail of Bits',
      'Certora',
      'Consensys Diligence'
    ],
    organizer: {
      name: 'Web3 Security Alliance',
      email: 'security@web3alliance.org',
      website: 'https://web3sec.org'
    },
    registerLink: 'https://web3sec.org/summit2025',
    socialLinks: {
      twitter: 'https://twitter.com/Web3Security',
      discord: 'https://discord.gg/web3security',
      website: 'https://web3sec.org'
    },
    tags: ['Security', 'Smart Contracts', 'DeFi', 'Education', 'Webinar'],
    capacity: 5000,
    registeredCount: 3420,
    price: 'Free',
    requirements: [
      'Basic understanding of smart contracts',
      'Zoom account',
      'Stable internet connection'
    ],
    stats: {
      views: 45200,
      registrations: 3420,
      shares: 1890,
      interested: 8700
    },
    relatedEvents: ['1', '2'],
    createdAt: '2025-01-15T14:00:00Z',
    updatedAt: '2025-01-23T09:45:00Z',
    seoTitle: 'Web3 Security Summit 2025 - Free Online Webinar',
    seoMeta: 'Learn from top security researchers about protecting Web3 projects. Free 3-hour webinar covering smart contracts, DeFi, and NFT security.'
  }
];

export const eventCategories = [
  'Conference',
  'Hackathon',
  'Webinar',
  'Meetup',
  'Workshop'
] as const;

export const eventLocationTypes = [
  'online',
  'offline',
  'hybrid'
] as const;

export const eventStatuses = [
  'upcoming',
  'ongoing',
  'ended'
] as const;
