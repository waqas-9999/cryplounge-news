export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in minutes
  xpReward: number;
  thumbnail: string;
  heroImage: string;
  tags: string[];
  prerequisites: string[];
  author: string;
  type: 'cryplounge' | 'ecosystem'; // Where tutorial appears
  ecosystem?: string; // Only for ecosystem type: 'ethereum', 'solana', 'polygon', etc.
  status: 'draft' | 'published' | 'archived';
  views: number;
  completions: number;
  avgRating: number;
  totalRatings: number;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoMeta: string;
}

export const mockTutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Understanding Blockchain Technology',
    slug: 'understanding-blockchain-technology',
    summary: 'Learn the fundamental concepts of blockchain technology and how it powers cryptocurrencies.',
    content: `# Understanding Blockchain Technology

Blockchain is a distributed ledger technology that enables secure, transparent, and tamper-proof record-keeping.

## What is Blockchain?

A blockchain is essentially a chain of blocks, where each block contains:
- Transaction data
- Timestamp
- Cryptographic hash of the previous block

## Key Features

1. **Decentralization**: No single point of control
2. **Transparency**: All transactions are visible
3. **Immutability**: Once recorded, data cannot be altered
4. **Security**: Cryptographic algorithms protect the data

## How It Works

1. A transaction is initiated
2. The transaction is broadcast to all nodes
3. Nodes validate the transaction
4. Valid transactions are added to a block
5. The block is added to the chain
6. The transaction is complete

## Real-World Applications

- Cryptocurrencies (Bitcoin, Ethereum)
- Supply chain management
- Healthcare records
- Digital identity
- Smart contracts

Start your blockchain journey today!`,
    category: 'Blockchain Basics',
    difficulty: 'Beginner',
    duration: 15,
    xpReward: 100,
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0',
    heroImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0',
    tags: ['blockchain', 'basics', 'technology'],
    prerequisites: [],
    author: 'CrypLounge Team',
    type: 'cryplounge',
    status: 'published',
    views: 15420,
    completions: 8932,
    avgRating: 4.8,
    totalRatings: 1247,
    publishDate: '2024-10-15T10:00:00Z',
    createdAt: '2024-10-10T10:00:00Z',
    updatedAt: '2024-11-13T10:00:00Z',
    seoTitle: 'Understanding Blockchain Technology - Complete Beginner Guide',
    seoMeta: 'Learn blockchain fundamentals, how it works, and real-world applications. Perfect for beginners starting their crypto journey.'
  },
  {
    id: '2',
    title: 'Smart Contract Development with Solidity',
    slug: 'smart-contract-development-solidity',
    summary: 'Master Solidity programming and build your first smart contract on Ethereum.',
    content: `# Smart Contract Development with Solidity

Learn to build secure and efficient smart contracts using Solidity.

## Prerequisites

- Basic programming knowledge
- Understanding of blockchain basics
- MetaMask wallet setup

## What You'll Learn

1. Solidity syntax and structure
2. Data types and variables
3. Functions and modifiers
4. Events and logging
5. Contract deployment
6. Testing and debugging

## Your First Smart Contract

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private value;
    
    function setValue(uint256 _value) public {
        value = _value;
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}
\`\`\`

## Best Practices

- Always specify the Solidity version
- Use explicit visibility modifiers
- Implement proper error handling
- Follow security patterns
- Write comprehensive tests

Start building on Ethereum today!`,
    category: 'Smart Contracts',
    difficulty: 'Intermediate',
    duration: 45,
    xpReward: 250,
    thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040',
    heroImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040',
    tags: ['solidity', 'smart contracts', 'ethereum', 'development'],
    prerequisites: ['understanding-blockchain-technology'],
    author: 'Alex Chen',
    type: 'ecosystem',
    ecosystem: 'ethereum',
    status: 'published',
    views: 12340,
    completions: 5432,
    avgRating: 4.9,
    totalRatings: 892,
    publishDate: '2024-10-20T14:00:00Z',
    createdAt: '2024-10-15T14:00:00Z',
    updatedAt: '2024-11-13T14:00:00Z',
    seoTitle: 'Smart Contract Development with Solidity - Complete Guide',
    seoMeta: 'Learn Solidity programming, build smart contracts, and deploy on Ethereum. Step-by-step tutorial for developers.'
  },
  {
    id: '3',
    title: 'DeFi Yield Farming Strategies',
    slug: 'defi-yield-farming-strategies',
    summary: 'Discover profitable yield farming strategies and maximize your DeFi returns.',
    content: `# DeFi Yield Farming Strategies

Learn advanced strategies to maximize your returns in decentralized finance.

## What is Yield Farming?

Yield farming involves lending or staking crypto assets to generate returns in the form of additional cryptocurrency.

## Popular Strategies

### 1. Liquidity Provision
- Provide liquidity to DEXs
- Earn trading fees + LP tokens
- Risk: Impermanent loss

### 2. Staking
- Lock tokens in a protocol
- Earn staking rewards
- Risk: Price volatility

### 3. Lending
- Lend assets on platforms like Aave
- Earn interest
- Risk: Smart contract vulnerabilities

### 4. Yield Aggregators
- Use platforms like Yearn Finance
- Automated strategy optimization
- Risk: Smart contract risk

## Risk Management

1. Diversify across protocols
2. Research smart contract audits
3. Start with small amounts
4. Monitor impermanent loss
5. Stay updated on protocol changes

## Tools You'll Need

- MetaMask wallet
- DEX access (Uniswap, SushiSwap)
- Portfolio tracker
- Gas fee monitor

Start maximizing your DeFi yields!`,
    category: 'DeFi Protocols',
    difficulty: 'Advanced',
    duration: 30,
    xpReward: 300,
    thumbnail: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307',
    heroImage: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307',
    tags: ['defi', 'yield farming', 'liquidity', 'staking'],
    prerequisites: ['understanding-blockchain-technology'],
    author: 'Sarah Williams',
    type: 'cryplounge',
    status: 'published',
    views: 18765,
    completions: 6234,
    avgRating: 4.7,
    totalRatings: 1034,
    publishDate: '2024-10-25T09:00:00Z',
    createdAt: '2024-10-20T09:00:00Z',
    updatedAt: '2024-11-13T09:00:00Z',
    seoTitle: 'DeFi Yield Farming Strategies - Maximize Your Returns',
    seoMeta: 'Learn profitable yield farming strategies, risk management, and tools to maximize DeFi returns. Advanced guide for crypto investors.'
  },
  {
    id: '4',
    title: 'Solana Program Development',
    slug: 'solana-program-development',
    summary: 'Build high-performance programs on Solana using Rust and Anchor framework.',
    content: `# Solana Program Development

Learn to develop lightning-fast programs on the Solana blockchain.

## Why Solana?

- Ultra-fast transaction speeds (65,000+ TPS)
- Low transaction costs
- Growing ecosystem
- Rust-based development

## Getting Started

### Prerequisites
- Rust programming knowledge
- Solana CLI installed
- Phantom wallet

### Your First Solana Program

Write programs using Rust and the Anchor framework for streamlined development.

## Key Concepts

1. **Accounts**: Solana's state storage
2. **Programs**: Smart contracts on Solana
3. **Transactions**: Atomic operations
4. **PDAs**: Program Derived Addresses

Start building on Solana today!`,
    category: 'Smart Contracts',
    difficulty: 'Advanced',
    duration: 60,
    xpReward: 350,
    thumbnail: 'https://images.unsplash.com/photo-1639322537228-f710d846310a',
    heroImage: 'https://images.unsplash.com/photo-1639322537228-f710d846310a',
    tags: ['solana', 'rust', 'development', 'anchor'],
    prerequisites: ['understanding-blockchain-technology'],
    author: 'Michael Rodriguez',
    type: 'ecosystem',
    ecosystem: 'solana',
    status: 'published',
    views: 9876,
    completions: 3456,
    avgRating: 4.8,
    totalRatings: 678,
    publishDate: '2024-10-28T11:00:00Z',
    createdAt: '2024-10-23T11:00:00Z',
    updatedAt: '2024-11-13T11:00:00Z',
    seoTitle: 'Solana Program Development - Rust & Anchor Guide',
    seoMeta: 'Build high-performance Solana programs using Rust and Anchor framework. Complete developer guide.'
  },
  {
    id: '5',
    title: 'Polygon zkEVM Deep Dive',
    slug: 'polygon-zkevm-deep-dive',
    summary: 'Understand Polygon zkEVM technology and deploy your first zk-rollup application.',
    content: `# Polygon zkEVM Deep Dive

Explore zero-knowledge rollup technology on Polygon.

## What is zkEVM?

Polygon zkEVM is an Ethereum-compatible zero-knowledge rollup that provides:
- Lower gas fees
- Higher throughput
- EVM compatibility
- Enhanced security

## Building on zkEVM

Deploy existing Ethereum contracts with minimal changes while enjoying the benefits of zk-rollup technology.

## Use Cases

- DeFi protocols
- NFT marketplaces
- Gaming applications
- Enterprise solutions

Start leveraging zkEVM today!`,
    category: 'Blockchain Basics',
    difficulty: 'Intermediate',
    duration: 40,
    xpReward: 200,
    thumbnail: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d',
    heroImage: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d',
    tags: ['polygon', 'zkevm', 'layer2', 'scaling'],
    prerequisites: ['understanding-blockchain-technology', 'smart-contract-development-solidity'],
    author: 'Emma Chen',
    type: 'ecosystem',
    ecosystem: 'polygon',
    status: 'published',
    views: 7654,
    completions: 4123,
    avgRating: 4.6,
    totalRatings: 543,
    publishDate: '2024-11-01T10:00:00Z',
    createdAt: '2024-10-27T10:00:00Z',
    updatedAt: '2024-11-13T10:00:00Z',
    seoTitle: 'Polygon zkEVM Deep Dive - Zero-Knowledge Rollups Guide',
    seoMeta: 'Learn Polygon zkEVM technology, deploy zk-rollup applications, and scale Ethereum dApps efficiently.'
  }
];
