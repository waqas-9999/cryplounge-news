import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrendingCard } from '../components/TrendingCard';
import { HeroArticle } from '../components/HeroArticle';
import { ArticleCardSmall } from '../components/ArticleCardSmall';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../components/ui/breadcrumb';

interface EcosystemOverviewPageProps {
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

export function EcosystemOverviewPage({ ecosystem, images, onNavigate }: EcosystemOverviewPageProps) {
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

  const overviewArticles = [
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}`,
      time: '10 min read',
      title: `${ecosystemNames[ecosystem]} Architecture: Understanding the Core Components`,
      tags: ['Architecture', 'Technical'],
      image: solanaImage,
      slug: 'architecture-core-components'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}`,
      time: '12 min read',
      title: `Consensus Mechanism Explained: How ${ecosystemNames[ecosystem]} Achieves Security`,
      tags: ['Consensus', 'Security'],
      image: phoneImage,
      slug: 'consensus-mechanism-security'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}`,
      time: '8 min read',
      title: `${ecosystemNames[ecosystem]} Token Economics and Utility`,
      tags: ['Tokenomics', 'Economics'],
      image: vrImage,
      slug: 'token-economics-utility'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}`,
      time: '15 min read',
      title: `The Evolution of ${ecosystemNames[ecosystem]}: From Launch to Today`,
      tags: ['History', 'Development'],
      image: speakerImage,
      slug: 'evolution-history'
    }
  ];

  const technicalGuides = [
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}`,
      time: '20 min read',
      title: 'Network Infrastructure and Node Operations',
      tags: ['Infrastructure', 'Nodes'],
      image: documentImage,
      slug: 'network-infrastructure-nodes'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}`,
      time: '18 min read',
      title: 'Smart Contract Capabilities and Limitations',
      tags: ['Smart Contracts', 'Development'],
      image: businessmanImage,
      slug: 'smart-contract-capabilities'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}`,
      time: '25 min read',
      title: 'Scalability Solutions and Performance Metrics',
      tags: ['Scalability', 'Performance'],
      image: solanaImage,
      slug: 'scalability-solutions'
    },
    {
      category: ecosystemNames[ecosystem],
      categorySlug: `learn/${ecosystem}`,
      time: '22 min read',
      title: 'Security Features and Best Practices',
      tags: ['Security', 'Best Practices'],
      image: phoneImage,
      slug: 'security-best-practices'
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
            <BreadcrumbPage>Overview</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <div className="inline-block px-4 py-2 bg-yellow-100 rounded-lg mb-3 md:mb-4">
          <span className="text-yellow-900 text-sm">{ecosystemNames[ecosystem].toUpperCase()} OVERVIEW</span>
        </div>
        <h1 className="text-gray-800 mb-3 md:mb-4">
          Understanding {ecosystemNames[ecosystem]}
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Comprehensive guide to {ecosystemNames[ecosystem]}'s architecture, technology, and ecosystem
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <HeroArticle 
            category={ecosystemNames[ecosystem]}
            categorySlug={`learn/${ecosystem}`}
            time="30 min read"
            title={`Complete Guide to ${ecosystemNames[ecosystem]}: Everything You Need to Know`}
            tags={[ecosystemNames[ecosystem], 'Comprehensive', 'Guide']}
            image={vrImage}
            articleSlug="complete-guide"
            onNavigate={onNavigate}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <ArticleCardSmall 
              category={ecosystemNames[ecosystem]}
              categorySlug={`learn/${ecosystem}`}
              time="10 min"
              title="Key Features and Advantages"
              articleSlug="key-features-advantages"
              onNavigate={onNavigate}
            />
            <ArticleCardSmall 
              category={ecosystemNames[ecosystem]}
              categorySlug={`learn/${ecosystem}`}
              time="12 min"
              title="Ecosystem Comparison Analysis"
              articleSlug="ecosystem-comparison"
              onNavigate={onNavigate}
            />
            <ArticleCardSmall 
              category={ecosystemNames[ecosystem]}
              categorySlug={`learn/${ecosystem}`}
              time="8 min"
              title="Future Roadmap and Development"
              articleSlug="future-roadmap"
              onNavigate={onNavigate}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-yellow-100 rounded-lg">
            <span className="text-yellow-900 text-xs md:text-sm">QUICK LINKS</span>
          </div>
          
          <div className="bg-white rounded-xl p-6 space-y-4">
            <button 
              onClick={() => onNavigate(`learn/${ecosystem}/tutorials`)}
              className="w-full text-left text-blue-600 hover:underline"
            >
              → Tutorials
            </button>
            <button 
              className="w-full text-left text-blue-600 hover:underline"
            >
              → Developer Docs
            </button>
            <button 
              className="w-full text-left text-blue-600 hover:underline"
            >
              → Whitepaper
            </button>
            <button 
              className="w-full text-left text-blue-600 hover:underline"
            >
              → Community
            </button>
          </div>

          <div className="space-y-3">
            <ArticleCardSmall 
              category={ecosystemNames[ecosystem]}
              categorySlug={`learn/${ecosystem}`}
              time="5 min"
              title="Getting Started Checklist"
              articleSlug="getting-started-checklist"
              onNavigate={onNavigate}
            />
            <ArticleCardSmall 
              category={ecosystemNames[ecosystem]}
              categorySlug={`learn/${ecosystem}`}
              time="6 min"
              title="Common Terms Glossary"
              articleSlug="terms-glossary"
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>

      {/* Core Concepts */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-yellow-100 rounded-lg">
            <span className="text-yellow-900 text-xs md:text-sm">CORE CONCEPTS</span>
          </div>
          <button className="text-xs md:text-sm text-gray-800 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {overviewArticles.map((article, idx) => (
            <div key={idx} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
              <TrendingCard 
                category={article.category}
                categorySlug={article.categorySlug}
                time={article.time}
                title={article.title}
                tags={article.tags}
                image={article.image}
                articleSlug={article.slug}
                onNavigate={onNavigate}
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 mt-4 md:mt-6">
          <button 
            onClick={() => handleScroll('left')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => handleScroll('right')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Technical Deep Dives */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-yellow-100 rounded-lg">
            <span className="text-yellow-900 text-xs md:text-sm">TECHNICAL DEEP DIVES</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {technicalGuides.map((guide, idx) => (
            <TrendingCard 
              key={idx}
              category={guide.category}
              categorySlug={guide.categorySlug}
              time={guide.time}
              title={guide.title}
              tags={guide.tags}
              image={guide.image}
              articleSlug={guide.slug}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl md:rounded-2xl p-6 md:p-12">
        <h2 className="text-white mb-6 md:mb-8 text-center">
          {ecosystemNames[ecosystem]} By The Numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="text-center">
            <div className="text-yellow-400 text-2xl md:text-3xl mb-2">10,000+</div>
            <div className="text-gray-300 text-sm">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-2xl md:text-3xl mb-2">1M+</div>
            <div className="text-gray-300 text-sm">Daily Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-2xl md:text-3xl mb-2">$50B+</div>
            <div className="text-gray-300 text-sm">Total Value Locked</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-2xl md:text-3xl mb-2">5M+</div>
            <div className="text-gray-300 text-sm">Active Wallets</div>
          </div>
        </div>
      </div>
    </main>
  );
}
