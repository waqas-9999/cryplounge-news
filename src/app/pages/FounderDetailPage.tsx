import { Clock, Tag as TagIcon, ArrowRight, ExternalLink, Twitter, Globe, Github, Linkedin, Quote } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../components/ui/breadcrumb';
import { ShareSaveButtons } from '../components/ShareSaveButtons';
import { CommentSection } from '../components/CommentSection';
import { TrendingCard } from '../components/TrendingCard';

interface FounderDetailPageProps {
  founderId: string;
  images: any;
  onNavigate: (page: string) => void;
}

export function FounderDetailPage({ founderId, images, onNavigate }: FounderDetailPageProps) {
  const { businessmanImage, asianBusinessmanImage, solanaImage, phoneImage, vrImage } = images;

  const founderImage1 = 'https://images.unsplash.com/photo-1617386124435-9eb3935b1e11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjI5NTg1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080';

  // Mock founder data - in real app this would be fetched based on founderId
  const founderData: Record<string, any> = {
    'vitalik-buterin': {
      name: 'Vitalik Buterin',
      role: 'Co-Founder, Ethereum',
      project: 'Ethereum',
      category: 'Layer 1',
      image: businessmanImage,
      readTime: '12 min read',
      date: 'Jan 20, 2025',
      tags: ['Innovation', 'Vision', 'Leadership'],
      region: 'Global',
      ecosystem: 'Ethereum',
      socialLinks: {
        twitter: 'https://twitter.com/VitalikButerin',
        website: 'https://ethereum.org',
        github: 'https://github.com/ethereum'
      },
      projects: [
        { name: 'Ethereum', slug: 'ethereum', description: 'Leading smart contract platform' },
        { name: 'Ethereum Foundation', slug: 'ethereum-foundation', description: 'Non-profit supporting Ethereum' }
      ],
      achievements: [
        'Co-founded Ethereum, the second-largest cryptocurrency by market cap',
        'Pioneered smart contract technology enabling thousands of decentralized applications',
        'Leading ongoing research in blockchain scalability and security',
        'Recipient of Thiel Fellowship and World Technology Award'
      ],
      insights: [
        {
          quote: "I thought [those in the Bitcoin community] weren't approaching the problem in the right way. I thought that they were going after individual applications; they were trying to kind of support each [use case] in a sort of Swiss Army knife protocol.",
          context: "On the inspiration for Ethereum"
        },
        {
          quote: "The thing that I often ask startups on top of Ethereum is, 'Can you please tell me why using the Ethereum blockchain is better than using Excel?' And if they can come up with a good answer, that's when you know you've got something really interesting.",
          context: "On building meaningful blockchain applications"
        }
      ],
      content: `
Vitalik Buterin's journey from a curious teenager fascinated by Bitcoin to co-founding Ethereum, the world's most widely-used blockchain platform, is a testament to the power of vision and technical excellence.

## Early Beginnings

Born in Russia and raised in Canada, Vitalik discovered Bitcoin at age 17 through his father. What started as curiosity soon turned into passion, leading him to co-found Bitcoin Magazine in 2011.

## The Ethereum Vision

In 2013, Vitalik published the Ethereum white paper, proposing a blockchain with a built-in Turing-complete programming language. This would allow developers to create any kind of decentralized application, not just a peer-to-peer currency.

"I thought [those in the Bitcoin community] weren't approaching the problem in the right way. I thought that they were going after individual applications; they were trying to kind of support each [use case] in a sort of Swiss Army knife protocol," Vitalik explained.

## Building the Future

The Ethereum project launched in 2015, and has since become the foundation for thousands of decentralized applications, DeFi protocols, and NFT projects. The platform has processed billions of dollars in transactions and enabled countless innovations.

## Philosophy and Impact

Vitalik's approach combines deep technical knowledge with a philosophical understanding of decentralization and its societal implications. He continues to be actively involved in Ethereum's development and broader blockchain research.

His work has inspired a generation of developers and entrepreneurs to build decentralized systems that challenge traditional power structures and create new possibilities for global cooperation and innovation.
      `
    }
  };

  const currentFounder = founderData[founderId] || founderData['vitalik-buterin'];

  const relatedStories = [
    {
      category: 'Founders',
      categorySlug: 'founders',
      time: '5 days ago',
      title: 'Changpeng Zhao: Building Binance from Zero to Industry Leader',
      tags: ['Leadership', 'Success'],
      image: asianBusinessmanImage,
      slug: 'changpeng-zhao'
    },
    {
      category: 'Founders',
      categorySlug: 'founders',
      time: '1 week ago',
      title: 'Anatoly Yakovenko: Engineering Excellence at Solana',
      tags: ['Innovation', 'Technology'],
      image: founderImage1,
      slug: 'anatoly-yakovenko'
    },
    {
      category: 'Founders',
      categorySlug: 'founders',
      time: '2 weeks ago',
      title: 'Hayden Adams: From Unemployment to Uniswap Founder',
      tags: ['Challenge', 'Success'],
      image: solanaImage,
      slug: 'hayden-adams'
    },
    {
      category: 'Founders',
      categorySlug: 'founders',
      time: '2 weeks ago',
      title: 'Stani Kulechov: Revolutionizing DeFi Lending with Aave',
      tags: ['DeFi', 'Innovation'],
      image: phoneImage,
      slug: 'stani-kulechov'
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
            <BreadcrumbLink onClick={() => onNavigate('founders')} className="cursor-pointer">
              Founders
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentFounder.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Article Header */}
      <div className="max-w-4xl mx-auto">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-600/20 rounded-lg mb-4">
          <span className="text-yellow-900 dark:text-yellow-400 text-sm">FOUNDER STORY</span>
        </div>
        
        <h1 className="text-gray-800 dark:text-gray-100 mb-4">{currentFounder.name}</h1>
        <h2 className="text-gray-600 dark:text-gray-400 mb-6">{currentFounder.role}</h2>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{currentFounder.readTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Published {currentFounder.date}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {currentFounder.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <ShareSaveButtons title={currentFounder.name} />
      </div>

      {/* Featured Image */}
      <div className="max-w-4xl mx-auto">
        <div className="aspect-[16/9] rounded-xl md:rounded-2xl overflow-hidden">
          <img 
            src={currentFounder.image} 
            alt={currentFounder.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2">
          <div className="prose prose-lg max-w-none">
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
              {currentFounder.content.split('\n\n').map((paragraph: string, idx: number) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={idx} className="text-gray-800 dark:text-gray-100 mt-8 mb-4 first:mt-0">{paragraph.replace('## ', '')}</h2>;
                } else if (paragraph.startsWith('"')) {
                  return (
                    <blockquote key={idx} className="border-l-4 border-blue-600 dark:border-blue-400 pl-6 my-6 italic text-gray-700 dark:text-gray-300">
                      {paragraph.replace(/"/g, '')}
                    </blockquote>
                  );
                } else if (paragraph.trim()) {
                  return <p key={idx} className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{paragraph}</p>;
                }
                return null;
              })}
            </div>

            {/* Founder Insights Section */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 rounded-xl md:rounded-2xl p-6 md:p-8 mt-8 border border-purple-100 dark:border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Quote className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-gray-800 dark:text-gray-100">Founder Insights</h3>
              </div>
              <div className="space-y-6">
                {currentFounder.insights?.map((insight: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-[#1A1A1C] rounded-lg p-6 border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-700 dark:text-gray-300 italic mb-3">"{insight.quote}"</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">— {insight.context}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Achievements */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/10 rounded-xl md:rounded-2xl p-6 md:p-8 mt-8 border border-blue-100 dark:border-blue-500/20">
              <h3 className="text-gray-800 dark:text-gray-100 mb-4">Key Achievements</h3>
              <ul className="space-y-3">
                {currentFounder.achievements?.map((achievement: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <CommentSection />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Founder Profile Card */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-gray-100 mb-4">About {currentFounder.name.split(' ')[0]}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Role</div>
                  <div className="text-gray-800 dark:text-gray-200">{currentFounder.role}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Project</div>
                  <div className="text-gray-800 dark:text-gray-200">{currentFounder.project}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Category</div>
                  <div className="text-gray-800 dark:text-gray-200">{currentFounder.category}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Region</div>
                  <div className="text-gray-800 dark:text-gray-200">{currentFounder.region}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Ecosystem</div>
                  <div className="text-gray-800 dark:text-gray-200">{currentFounder.ecosystem}</div>
                </div>
              </div>

              {/* Social Links */}
              {currentFounder.socialLinks && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-3">Connect</div>
                  <div className="flex items-center gap-3">
                    {currentFounder.socialLinks.twitter && (
                      <a href={currentFounder.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <Twitter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </a>
                    )}
                    {currentFounder.socialLinks.website && (
                      <a href={currentFounder.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </a>
                    )}
                    {currentFounder.socialLinks.github && (
                      <a href={currentFounder.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Projects & Related Links */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-gray-100 mb-4">Projects</h3>
              <div className="space-y-4">
                {currentFounder.projects?.map((project: any, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => onNavigate(`founders/${founderId}/projects/${project.slug}`)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="text-gray-800 dark:text-gray-200 mb-1 flex items-center justify-between">
                      {project.name}
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{project.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cross-Platform Links */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-gray-100 mb-4">Explore More</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => onNavigate('learn/ethereum')}
                  className="w-full text-left text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Learn about {currentFounder.project}
                </button>
                <button 
                  onClick={() => onNavigate('news/blockchain')}
                  className="w-full text-left text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Latest {currentFounder.project} news
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Stories */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-600/20 rounded-lg">
            <span className="text-yellow-900 dark:text-yellow-400 text-xs md:text-sm">RELATED STORIES</span>
          </div>
          <button 
            onClick={() => onNavigate('founders')}
            className="text-xs md:text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {relatedStories.map((story, idx) => (
            <TrendingCard 
              key={idx}
              category={story.category}
              categorySlug={story.categorySlug}
              time={story.time}
              title={story.title}
              tags={story.tags}
              image={story.image}
              articleSlug={story.slug}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
