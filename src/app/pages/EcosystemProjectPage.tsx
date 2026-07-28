import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Code, FileText, Users } from 'lucide-react';
import { TrendingCard } from '../components/TrendingCard';
import { HeroArticle } from '../components/HeroArticle';
import { ArticleCardSmall } from '../components/ArticleCardSmall';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../components/ui/breadcrumb';

interface EcosystemProjectPageProps {
  ecosystem: string;
  projectName: string;
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

export function EcosystemProjectPage({ ecosystem, projectName, images, onNavigate }: EcosystemProjectPageProps) {
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

  // Convert slug to title
  const projectTitle = projectName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const projectGuides = [
    {
      category: projectTitle,
      categorySlug: `learn/${ecosystem}/projects/${projectName}`,
      time: '15 min',
      title: `Getting Started with ${projectTitle}: Complete Setup Guide`,
      tags: ['Setup', 'Beginner'],
      image: phoneImage,
      slug: 'getting-started-guide'
    },
    {
      category: projectTitle,
      categorySlug: `learn/${ecosystem}/projects/${projectName}`,
      time: '20 min',
      title: `${projectTitle} Features: What You Need to Know`,
      tags: ['Features', 'Overview'],
      image: solanaImage,
      slug: 'features-overview'
    },
    {
      category: projectTitle,
      categorySlug: `learn/${ecosystem}/projects/${projectName}`,
      time: '25 min',
      title: `How to Use ${projectTitle} for Maximum Returns`,
      tags: ['Tutorial', 'Strategy'],
      image: vrImage,
      slug: 'maximum-returns'
    },
    {
      category: projectTitle,
      categorySlug: `learn/${ecosystem}/projects/${projectName}`,
      time: '30 min',
      title: `${projectTitle} Advanced Strategies and Tips`,
      tags: ['Advanced', 'Tips'],
      image: speakerImage,
      slug: 'advanced-strategies'
    }
  ];

  const relatedProjects = [
    {
      category: projectTitle,
      categorySlug: `learn/${ecosystem}/projects/${projectName}`,
      time: '10 min',
      title: 'Similar Projects You Should Know About',
      tags: ['Comparison', 'Projects'],
      image: documentImage,
      slug: 'similar-projects'
    },
    {
      category: projectTitle,
      categorySlug: `learn/${ecosystem}/projects/${projectName}`,
      time: '12 min',
      title: 'Integration Possibilities with Other Protocols',
      tags: ['Integration', 'DeFi'],
      image: businessmanImage,
      slug: 'integration-possibilities'
    },
    {
      category: projectTitle,
      categorySlug: `learn/${ecosystem}/projects/${projectName}`,
      time: '15 min',
      title: 'Ecosystem Synergies and Collaborations',
      tags: ['Ecosystem', 'Partnerships'],
      image: solanaImage,
      slug: 'ecosystem-synergies'
    },
    {
      category: projectTitle,
      categorySlug: `learn/${ecosystem}/projects/${projectName}`,
      time: '18 min',
      title: 'Competitive Analysis and Market Position',
      tags: ['Analysis', 'Market'],
      image: phoneImage,
      slug: 'competitive-analysis'
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
            <BreadcrumbLink onClick={() => onNavigate(`learn/${ecosystem}`)} className="cursor-pointer">
              Projects
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{projectTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <div className="inline-block px-4 py-2 bg-yellow-100 rounded-lg mb-3 md:mb-4">
          <span className="text-yellow-900 text-sm">PROJECT GUIDE</span>
        </div>
        <h1 className="text-gray-800 mb-3 md:mb-4">{projectTitle}</h1>
        <p className="text-gray-600 max-w-3xl mb-6">
          Learn everything about {projectTitle}, one of the leading projects on {ecosystemNames[ecosystem]}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-gray-500 text-xs md:text-sm mb-1">Total Value Locked</div>
            <div className="text-gray-800">$2.5B</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-gray-500 text-xs md:text-sm mb-1">Daily Volume</div>
            <div className="text-gray-800">$150M</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-gray-500 text-xs md:text-sm mb-1">Active Users</div>
            <div className="text-gray-800">500K+</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-gray-500 text-xs md:text-sm mb-1">Network</div>
            <div className="text-gray-800">{ecosystemNames[ecosystem]}</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <ExternalLink className="w-4 h-4" />
            Visit Website
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-50 text-sm">
            <Code className="w-4 h-4" />
            Documentation
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-50 text-sm">
            <FileText className="w-4 h-4" />
            Whitepaper
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-50 text-sm">
            <Users className="w-4 h-4" />
            Community
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <HeroArticle 
            category={projectTitle}
            categorySlug={`learn/${ecosystem}/projects/${projectName}`}
            time="45 min read"
            title={`Complete ${projectTitle} Guide: From Beginner to Expert`}
            tags={[projectTitle, ecosystemNames[ecosystem], 'Complete Guide']}
            image={vrImage}
            articleSlug="complete-guide"
            onNavigate={onNavigate}
          />
          
          <div className="bg-white rounded-xl p-6 md:p-8">
            <h2 className="text-gray-800 mb-4">About {projectTitle}</h2>
            <p className="text-gray-600 mb-4">
              {projectTitle} is a leading decentralized application built on {ecosystemNames[ecosystem]} that provides 
              innovative solutions for the blockchain ecosystem. With cutting-edge technology and user-friendly interface, 
              it has become one of the most popular projects in the space.
            </p>
            <p className="text-gray-600 mb-4">
              Since its launch, {projectTitle} has attracted millions of users and billions in total value locked, 
              demonstrating strong market confidence and adoption. The platform continues to evolve with regular 
              updates and new features.
            </p>
            <p className="text-gray-600">
              Whether you're a beginner or an experienced user, this guide will help you understand and make the 
              most of {projectTitle}'s features and capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <ArticleCardSmall 
              category={projectTitle}
              categorySlug={`learn/${ecosystem}/projects/${projectName}`}
              time="15 min"
              title="Step-by-Step Setup Guide"
              articleSlug="setup-guide"
              onNavigate={onNavigate}
            />
            <ArticleCardSmall 
              category={projectTitle}
              categorySlug={`learn/${ecosystem}/projects/${projectName}`}
              time="12 min"
              title="Key Features Explained"
              articleSlug="key-features"
              onNavigate={onNavigate}
            />
            <ArticleCardSmall 
              category={projectTitle}
              categorySlug={`learn/${ecosystem}/projects/${projectName}`}
              time="10 min"
              title="Safety and Best Practices"
              articleSlug="safety-practices"
              onNavigate={onNavigate}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-yellow-100 rounded-lg">
            <span className="text-yellow-900 text-xs md:text-sm">QUICK NAVIGATION</span>
          </div>
          
          <div className="bg-white rounded-xl p-6 space-y-4">
            <a href="#getting-started" className="block text-blue-600 hover:underline">
              → Getting Started
            </a>
            <a href="#features" className="block text-blue-600 hover:underline">
              → Core Features
            </a>
            <a href="#tutorials" className="block text-blue-600 hover:underline">
              → Video Tutorials
            </a>
            <a href="#faq" className="block text-blue-600 hover:underline">
              → Common Questions
            </a>
            <a href="#security" className="block text-blue-600 hover:underline">
              → Security Tips
            </a>
            <a href="#advanced" className="block text-blue-600 hover:underline">
              → Advanced Strategies
            </a>
          </div>

          <div className="space-y-3">
            <ArticleCardSmall 
              category={projectTitle}
              categorySlug={`learn/${ecosystem}/projects/${projectName}`}
              time="5 min"
              title="Common Mistakes to Avoid"
              articleSlug="common-mistakes"
              onNavigate={onNavigate}
            />
            <ArticleCardSmall 
              category={projectTitle}
              categorySlug={`learn/${ecosystem}/projects/${projectName}`}
              time="6 min"
              title="Tips for Beginners"
              articleSlug="beginner-tips"
              onNavigate={onNavigate}
            />
            <ArticleCardSmall 
              category={projectTitle}
              categorySlug={`learn/${ecosystem}/projects/${projectName}`}
              time="7 min"
              title="Troubleshooting Guide"
              articleSlug="troubleshooting"
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>

      {/* Guides and Tutorials */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-yellow-100 rounded-lg">
            <span className="text-yellow-900 text-xs md:text-sm">GUIDES & TUTORIALS</span>
          </div>
          <button className="text-xs md:text-sm text-gray-800 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {projectGuides.map((guide, idx) => (
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
        
        <div className="flex justify-end gap-2 mt-4 md:mt-6">
          <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </button>
          <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Related Projects */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-yellow-100 rounded-lg">
            <span className="text-yellow-900 text-xs md:text-sm">RELATED CONTENT</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {relatedProjects.map((project, idx) => (
            <TrendingCard 
              key={idx}
              category={project.category}
              categorySlug={project.categorySlug}
              time={project.time}
              title={project.title}
              tags={project.tags}
              image={project.image}
              articleSlug={project.slug}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* Community Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl md:rounded-2xl p-6 md:p-12 text-center text-white">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
        <h2 className="mb-3 md:mb-4">
          Join the {projectTitle} Community
        </h2>
        <p className="mb-6 md:mb-8 max-w-2xl mx-auto opacity-90">
          Connect with thousands of users, share strategies, and stay updated with the latest developments
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100">
            Join Discord
          </button>
          <button className="px-6 py-3 bg-purple-800 text-white rounded-lg hover:bg-purple-900">
            Follow on Twitter
          </button>
        </div>
      </div>
    </main>
  );
}
