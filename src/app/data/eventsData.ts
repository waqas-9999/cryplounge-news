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
  status: 'featured' | 'upcoming' | 'ongoing' | 'ended';
  summary: string;
  description: string;
  bannerImage: string;
  agenda?: string[];
  speakers?: {
    name: string;
    title: string;
    photo: string;
  }[];
  prizePool?: string;
  sponsors?: string[];
  organizer: {
    name: string;
    email: string;
    website: string;
  };
  registerLink: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
  relatedEvents?: string[];
}

export const eventsData: Event[] = [
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
    status: 'featured',
    summary: 'The largest Bitcoin event in the world returns to Miami with industry leaders, developers, and enthusiasts.',
    description: 'Bitcoin 2025 Conference is the premier gathering for the Bitcoin community. Join us for three days of insightful talks, networking opportunities, and exhibitions from leading Bitcoin companies. This year features keynotes from Michael Saylor, Jack Dorsey, and other industry pioneers discussing Bitcoin adoption, Lightning Network scaling, and the future of decentralized finance.',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
    agenda: [
      'Day 1: Bitcoin Fundamentals & Adoption Stories',
      'Day 2: Lightning Network & Layer 2 Solutions',
      'Day 3: Bitcoin Mining & Sustainability'
    ],
    speakers: [
      {
        name: 'Michael Saylor',
        title: 'Executive Chairman, MicroStrategy',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
      },
      {
        name: 'Jack Dorsey',
        title: 'Founder, Block Inc.',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
      },
      {
        name: 'Caitlin Long',
        title: 'CEO, Custodia Bank',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
      }
    ],
    sponsors: ['Coinbase', 'Binance', 'Kraken', 'Strike'],
    organizer: {
      name: 'BTC Inc.',
      email: 'info@btcconf.com',
      website: 'https://bitcoin2025.com'
    },
    registerLink: 'https://bitcoin2025.com/register',
    socialLinks: {
      twitter: 'https://twitter.com/bitcoinconf',
      discord: 'https://discord.gg/bitcoinconf'
    },
    relatedEvents: ['2', '3']
  },
  {
    id: '2',
    name: 'ETHGlobal Hackathon 2025',
    slug: 'ethglobal-hackathon-2025',
    category: 'Hackathon',
    date: '2025-06-20',
    endDate: '2025-06-22',
    time: '48-hour Hackathon',
    location: 'Online',
    locationType: 'online',
    status: 'upcoming',
    summary: 'Build the future of Ethereum in 48 hours. Win prizes, meet builders, and ship innovative dApps.',
    description: 'ETHGlobal Hackathon brings together the brightest minds in Ethereum development for an intense 48-hour building sprint. Whether you\'re building DeFi protocols, NFT platforms, or Layer 2 solutions, this is your chance to showcase your skills and win amazing prizes. Mentors from top Ethereum projects will be available to help you throughout the event.',
    bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop',
    agenda: [
      'Friday 6PM: Opening Ceremony & Team Formation',
      'Saturday: Build & Mentor Sessions',
      'Sunday 4PM: Project Submissions & Judging',
      'Sunday 6PM: Winners Announcement'
    ],
    speakers: [
      {
        name: 'Vitalik Buterin',
        title: 'Co-founder, Ethereum',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
      }
    ],
    prizePool: '$500,000 in ETH and Prizes',
    sponsors: ['Ethereum Foundation', 'Uniswap', 'Aave', 'Chainlink'],
    organizer: {
      name: 'ETHGlobal',
      email: 'hello@ethglobal.com',
      website: 'https://ethglobal.com'
    },
    registerLink: 'https://ethglobal.com/events/2025',
    socialLinks: {
      twitter: 'https://twitter.com/ethglobal',
      discord: 'https://discord.gg/ethglobal'
    },
    relatedEvents: ['1', '4']
  },
  {
    id: '3',
    name: 'DeFi Summit 2025',
    slug: 'defi-summit-2025',
    category: 'Conference',
    date: '2025-05-28',
    endDate: '2025-05-29',
    time: '10:00 AM - 05:00 PM',
    location: 'Singapore Expo',
    locationType: 'offline',
    status: 'upcoming',
    summary: 'Explore the future of decentralized finance with leading protocols, regulators, and investors.',
    description: 'DeFi Summit 2025 brings together the world\'s leading DeFi protocols, institutional investors, and regulatory experts to discuss the evolution of decentralized finance. Topics include real-world asset tokenization, DeFi regulation, yield strategies, and the next generation of financial infrastructure.',
    bannerImage: 'https://images.unsplash.com/photo-1559223607-a43c990c1d78?w=1200&h=600&fit=crop',
    agenda: [
      'Day 1: DeFi Protocols & Innovation',
      'Day 2: Institutional DeFi & Regulation'
    ],
    speakers: [
      {
        name: 'Stani Kulechov',
        title: 'Founder, Aave',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop'
      },
      {
        name: 'Rune Christensen',
        title: 'Founder, MakerDAO',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop'
      }
    ],
    sponsors: ['Aave', 'MakerDAO', 'Curve', 'Compound'],
    organizer: {
      name: 'DeFi Alliance',
      email: 'contact@defisummit.com',
      website: 'https://defisummit.com'
    },
    registerLink: 'https://defisummit.com/register',
    socialLinks: {
      twitter: 'https://twitter.com/defisummit',
      telegram: 'https://t.me/defisummit'
    },
    relatedEvents: ['1', '2']
  },
  {
    id: '4',
    name: 'Solana Breakpoint 2025',
    slug: 'solana-breakpoint-2025',
    category: 'Conference',
    date: '2025-11-10',
    endDate: '2025-11-13',
    time: '09:00 AM - 06:00 PM',
    location: 'Lisbon, Portugal',
    locationType: 'offline',
    status: 'ongoing',
    summary: 'The annual Solana conference showcasing the fastest blockchain ecosystem and its innovations.',
    description: 'Solana Breakpoint is the flagship event for the Solana ecosystem, bringing together developers, founders, and enthusiasts from around the world. Experience live demos of cutting-edge applications, attend technical workshops, and network with the brightest minds building on Solana.',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
    agenda: [
      'Day 1: Keynotes & Ecosystem Updates',
      'Day 2: Developer Workshops',
      'Day 3: DeFi & NFTs on Solana',
      'Day 4: Gaming & Consumer Apps'
    ],
    speakers: [
      {
        name: 'Anatoly Yakovenko',
        title: 'Co-founder, Solana Labs',
        photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop'
      }
    ],
    sponsors: ['Solana Foundation', 'Magic Eden', 'Jupiter', 'Phantom'],
    organizer: {
      name: 'Solana Foundation',
      email: 'events@solana.com',
      website: 'https://solana.com/breakpoint'
    },
    registerLink: 'https://solana.com/breakpoint/register',
    socialLinks: {
      twitter: 'https://twitter.com/solana',
      discord: 'https://discord.gg/solana'
    },
    relatedEvents: ['2', '5']
  },
  {
    id: '5',
    name: 'Web3 Security Workshop',
    slug: 'web3-security-workshop',
    category: 'Workshop',
    date: '2025-04-08',
    time: '02:00 PM - 05:00 PM',
    location: 'Online via Zoom',
    locationType: 'online',
    status: 'upcoming',
    summary: 'Learn smart contract security best practices from top auditors and white hat hackers.',
    description: 'This intensive 3-hour workshop covers smart contract vulnerabilities, auditing techniques, and security best practices. Led by experienced auditors from Trail of Bits and OpenZeppelin, you\'ll learn how to identify and prevent common exploits that have cost millions in the DeFi space.',
    bannerImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop',
    agenda: [
      'Introduction to Smart Contract Security',
      'Common Vulnerabilities: Reentrancy, Flash Loans, Oracle Manipulation',
      'Auditing Tools: Slither, Mythril, Echidna',
      'Live Code Review Session'
    ],
    speakers: [
      {
        name: 'Dan Guido',
        title: 'CEO, Trail of Bits',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop'
      }
    ],
    sponsors: ['Trail of Bits', 'OpenZeppelin', 'Immunefi'],
    organizer: {
      name: 'CryptoSec Academy',
      email: 'learn@cryptosec.com',
      website: 'https://cryptosec.com'
    },
    registerLink: 'https://cryptosec.com/workshop/register',
    socialLinks: {
      twitter: 'https://twitter.com/cryptosec',
      discord: 'https://discord.gg/cryptosec'
    },
    relatedEvents: ['2']
  },
  {
    id: '6',
    name: 'NFT NYC 2024',
    slug: 'nft-nyc-2024',
    category: 'Conference',
    date: '2024-04-03',
    endDate: '2024-04-05',
    time: '10:00 AM - 06:00 PM',
    location: 'Javits Center, New York',
    locationType: 'offline',
    status: 'ended',
    summary: 'The world\'s premier NFT event brought together artists, collectors, and builders.',
    description: 'NFT NYC 2024 was a massive success with over 15,000 attendees. The event showcased the latest in digital art, gaming NFTs, and metaverse experiences. Highlights included exclusive NFT drops, artist showcases, and networking events that connected creators with collectors and investors.',
    bannerImage: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&h=600&fit=crop',
    agenda: [
      'Day 1: Digital Art & Artists',
      'Day 2: Gaming & Metaverse',
      'Day 3: NFT Infrastructure & Marketplaces'
    ],
    sponsors: ['OpenSea', 'Magic Eden', 'Blur', 'Foundation'],
    organizer: {
      name: 'NFT NYC',
      email: 'info@nft.nyc',
      website: 'https://nft.nyc'
    },
    registerLink: 'https://nft.nyc',
    relatedEvents: ['4']
  },
  {
    id: '7',
    name: 'Crypto Trading Masterclass',
    slug: 'crypto-trading-masterclass',
    category: 'Webinar',
    date: '2025-03-15',
    time: '06:00 PM - 08:00 PM EST',
    location: 'Online Live Stream',
    locationType: 'online',
    status: 'upcoming',
    summary: 'Master technical analysis, risk management, and trading strategies from professional traders.',
    description: 'Join professional crypto traders for a comprehensive masterclass covering chart patterns, indicators, and risk management strategies. Learn how to read market sentiment, identify entry and exit points, and manage your portfolio effectively in volatile markets.',
    bannerImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop',
    speakers: [
      {
        name: 'Alex Johnson',
        title: 'Head of Trading, CryptoVest',
        photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop'
      }
    ],
    organizer: {
      name: 'Crypto Academy',
      email: 'learn@cryptoacademy.com',
      website: 'https://cryptoacademy.com'
    },
    registerLink: 'https://cryptoacademy.com/webinar/trading',
    socialLinks: {
      twitter: 'https://twitter.com/cryptoacademy',
      telegram: 'https://t.me/cryptoacademy'
    },
    relatedEvents: ['5']
  },
  {
    id: '8',
    name: 'Blockchain for Social Good',
    slug: 'blockchain-social-good',
    category: 'Meetup',
    date: '2025-03-22',
    time: '07:00 PM - 09:00 PM',
    location: 'Impact Hub, San Francisco',
    locationType: 'hybrid',
    status: 'upcoming',
    summary: 'Discuss how blockchain technology can solve real-world problems in developing nations.',
    description: 'Join us for an evening of thought-provoking discussions on using blockchain for social impact. Topics include financial inclusion, supply chain transparency, and digital identity for the unbanked. Network with NGOs, blockchain projects, and impact investors working to make a difference.',
    bannerImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop',
    organizer: {
      name: 'Blockchain Impact Foundation',
      email: 'hello@blockchainimpact.org',
      website: 'https://blockchainimpact.org'
    },
    registerLink: 'https://blockchainimpact.org/meetup',
    socialLinks: {
      twitter: 'https://twitter.com/blockchainimpact'
    },
    relatedEvents: ['3']
  },
  {
    id: '9',
    name: 'Consensus 2024',
    slug: 'consensus-2024',
    category: 'Conference',
    date: '2024-05-29',
    endDate: '2024-05-31',
    time: '09:00 AM - 06:00 PM',
    location: 'Austin, Texas',
    locationType: 'offline',
    status: 'ended',
    summary: 'CoinDesk\'s flagship event united the crypto and blockchain community for three days.',
    description: 'Consensus 2024 was CoinDesk\'s premier gathering of the crypto ecosystem. With over 20,000 attendees, the event featured keynotes from regulators, CEOs, and innovators shaping the future of digital assets. Key discussions centered on institutional adoption, regulatory clarity, and emerging technologies.',
    bannerImage: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&h=600&fit=crop',
    sponsors: ['Coinbase', 'Circle', 'Ripple', 'Consensys'],
    organizer: {
      name: 'CoinDesk',
      email: 'consensus@coindesk.com',
      website: 'https://consensus.coindesk.com'
    },
    registerLink: 'https://consensus.coindesk.com',
    relatedEvents: ['1', '3']
  }
];

// Helper functions
export const getFeaturedEvent = (): Event | undefined => {
  return eventsData.find(event => event.status === 'featured');
};

export const getUpcomingEvents = (): Event[] => {
  return eventsData.filter(event => event.status === 'upcoming');
};

export const getOngoingEvents = (): Event[] => {
  return eventsData.filter(event => event.status === 'ongoing');
};

export const getEndedEvents = (): Event[] => {
  return eventsData.filter(event => event.status === 'ended');
};

export const getEventBySlug = (slug: string): Event | undefined => {
  return eventsData.find(event => event.slug === slug);
};

export const getRelatedEvents = (eventIds: string[]): Event[] => {
  return eventsData.filter(event => eventIds.includes(event.id));
};
