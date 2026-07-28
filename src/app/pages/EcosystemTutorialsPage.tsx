import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { TrendingCard } from '../components/TrendingCard';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../components/ui/breadcrumb';

interface EcosystemTutorialsPageProps {
  ecosystem: string;
  images: {
    vrImage: string;
    businessmanImage: string;
    solanaImage: string;
    phoneImage: string;
    speakerImage: string;
    documentImage: string;
    asianBusinessmanImage: string;
  };
  onNavigate: (page: string) => void;
}

export function EcosystemTutorialsPage({ ecosystem, images, onNavigate }: EcosystemTutorialsPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage } = images;
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount 
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const ecosystemNames: Record<string, string> = {
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'solana': 'Solana',
    'bnb-chain': 'BNB Chain',
    'bycx-infinity-chain': 'BYCX Infinity Chain',
    'avalanche': 'Avalanche'
  };

  const beginnerTutorials = [
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '15 min',
      title: `Setting Up Your First ${ecosystemNames[ecosystem]} Wallet`,
      tags: ['Wallet', 'Setup', 'Beginner'],
      image: phoneImage,
      slug: 'setup-first-wallet'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '20 min',
      title: `How to Buy and Store ${ecosystemNames[ecosystem]} Tokens`,
      tags: ['Trading', 'Storage', 'Beginner'],
      image: solanaImage,
      slug: 'buy-store-tokens'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '18 min',
      title: 'Understanding Gas Fees and Transaction Costs',
      tags: ['Gas', 'Fees', 'Beginner'],
      image: documentImage,
      slug: 'gas-fees-costs'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '25 min',
      title: 'Making Your First DeFi Transaction',
      tags: ['DeFi', 'Transaction', 'Beginner'],
      image: vrImage,
      slug: 'first-defi-transaction'
    }
  ];

  const intermediateTutorials = [
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '30 min',
      title: `Building a Smart Contract on ${ecosystemNames[ecosystem]}`,
      tags: ['Smart Contract', 'Development'],
      image: solanaImage,
      slug: 'building-smart-contract'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '35 min',
      title: 'Creating an NFT Collection: Complete Guide',
      tags: ['NFT', 'Development', 'Tutorial'],
      image: vrImage,
      slug: 'creating-nft-collection'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '28 min',
      title: 'DeFi Yield Farming Strategies',
      tags: ['DeFi', 'Yield', 'Strategy'],
      image: phoneImage,
      slug: 'defi-yield-farming'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '32 min',
      title: 'Deploying Your First dApp',
      tags: ['dApp', 'Deployment', 'Development'],
      image: speakerImage,
      slug: 'deploying-first-dapp'
    }
  ];

  const advancedTutorials = [
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '45 min',
      title: 'Advanced Smart Contract Patterns and Best Practices',
      tags: ['Smart Contract', 'Advanced', 'Patterns'],
      image: documentImage,
      slug: 'advanced-contract-patterns'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '50 min',
      title: 'Building Cross-Chain Bridges',
      tags: ['Cross-Chain', 'Advanced', 'Infrastructure'],
      image: solanaImage,
      slug: 'cross-chain-bridges'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '40 min',
      title: 'Optimizing Gas Costs for Complex Contracts',
      tags: ['Optimization', 'Gas', 'Advanced'],
      image: businessmanImage,
      slug: 'gas-optimization'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '55 min',
      title: 'Security Auditing and Vulnerability Testing',
      tags: ['Security', 'Auditing', 'Advanced'],
      image: phoneImage,
      slug: 'security-auditing'
    }
  ];

  const popularTutorials = [
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '22 min',
      title: 'Step-by-Step: Staking Your Tokens for Rewards',
      tags: ['Staking', 'Rewards'],
      image: vrImage,
      slug: 'staking-tutorial'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '28 min',
      title: 'Participating in DAOs: A Complete Guide',
      tags: ['DAO', 'Governance'],
      image: speakerImage,
      slug: 'dao-participation'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '20 min',
      title: 'How to Provide Liquidity on DEXs',
      tags: ['Liquidity', 'DEX'],
      image: phoneImage,
      slug: 'provide-liquidity'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}/tutorials`,
      time: '25 min',
      title: 'Understanding and Using Layer 2 Solutions',
      tags: ['Layer 2', 'Scaling'],
      image: solanaImage,
      slug: 'layer2-solutions'
    }
  ];

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate('home')} className="cursor-pointer">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate('learn')} className="cursor-pointer">Learn</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate(`learn/${ecosystem}`)} className="cursor-pointer">
              {ecosystemNames[ecosystem]}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tutorials</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <div className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg mb-4 border border-yellow-200 dark:border-yellow-500/30">
          <span className="text-yellow-900 dark:text-yellow-300 text-sm">TUTORIALS</span>
        </div>
        <h1 className="text-gray-800 dark:text-[#F3F3F5] mb-4">{ecosystemNames[ecosystem]} Tutorials</h1>
        <p className="text-gray-600 dark:text-[#A0A0A5] max-w-3xl">
          Step-by-step guides from beginner to advanced level for {ecosystemNames[ecosystem]} development and usage
        </p>
      </div>

      {/* Popular Tutorials Section */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-600/20 rounded-lg border border-yellow-200 dark:border-yellow-500/30">
            <span className="text-yellow-900 dark:text-yellow-400 text-xs md:text-sm">🔥 MOST POPULAR</span>
          </div>
          <button className="text-xs md:text-sm text-gray-800 dark:text-[#F3F3F5] hover:text-blue-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {popularTutorials.map((tutorial, idx) => (
            <TrendingCard 
              key={idx}
              category={tutorial.category}
              categorySlug={tutorial.categorySlug}
              time={tutorial.time}
              title={tutorial.title}
              tags={tutorial.tags}
              image={tutorial.image}
              articleSlug={tutorial.slug}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* Beginner Tutorials */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-green-100 dark:bg-green-500/20 rounded-lg border border-green-200 dark:border-green-500/30">
            <span className="text-green-900 dark:text-green-400 text-xs md:text-sm">BEGINNER TUTORIALS</span>
          </div>
          <button className="text-xs md:text-sm text-gray-800 dark:text-[#F3F3F5] hover:text-blue-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {beginnerTutorials.map((tutorial, idx) => (
            <div key={idx} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
              <TrendingCard 
                category={tutorial.category}
                categorySlug={tutorial.categorySlug}
                time={tutorial.time}
                title={tutorial.title}
                tags={tutorial.tags}
                image={tutorial.image}
                articleSlug={tutorial.slug}
                onNavigate={onNavigate}
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 mt-4 md:mt-6">
          <button 
            onClick={() => handleScroll('left')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-[#202225] border border-transparent dark:border-white/[0.08] flex items-center justify-center hover:bg-gray-300 dark:hover:bg-yellow-500/20 dark:hover:border-yellow-500/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-[#A0A0A5]" />
          </button>
          <button 
            onClick={() => handleScroll('right')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-800 dark:bg-yellow-500 flex items-center justify-center hover:bg-gray-700 dark:hover:bg-yellow-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-gray-900" />
          </button>
        </div>
      </div>

      {/* Intermediate Tutorials */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg border border-blue-200 dark:border-blue-500/30">
            <span className="text-blue-900 dark:text-blue-400 text-xs md:text-sm">INTERMEDIATE TUTORIALS</span>
          </div>
          <button className="text-xs md:text-sm text-gray-800 dark:text-[#F3F3F5] hover:text-blue-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {intermediateTutorials.map((tutorial, idx) => (
            <TrendingCard 
              key={idx}
              category={tutorial.category}
              categorySlug={tutorial.categorySlug}
              time={tutorial.time}
              title={tutorial.title}
              tags={tutorial.tags}
              image={tutorial.image}
              articleSlug={tutorial.slug}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* Advanced Tutorials */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg border border-purple-200 dark:border-purple-500/30">
            <span className="text-purple-900 dark:text-purple-400 text-xs md:text-sm">ADVANCED TUTORIALS</span>
          </div>
          <button className="text-xs md:text-sm text-gray-800 dark:text-[#F3F3F5] hover:text-blue-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {advancedTutorials.map((tutorial, idx) => (
            <TrendingCard 
              key={idx}
              category={tutorial.category}
              categorySlug={tutorial.categorySlug}
              time={tutorial.time}
              title={tutorial.title}
              tags={tutorial.tags}
              image={tutorial.image}
              articleSlug={tutorial.slug}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
