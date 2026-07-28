import { ArrowRight, ExternalLink, Calendar, TrendingUp, Users, Rocket, Target, Globe } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../components/ui/breadcrumb';
import { ShareSaveButtons } from '../components/ShareSaveButtons';

interface FounderProjectPageProps {
  founderId: string;
  projectSlug: string;
  images: any;
  onNavigate: (page: string) => void;
}

export function FounderProjectPage({ founderId, projectSlug, images, onNavigate }: FounderProjectPageProps) {
  const { businessmanImage, solanaImage, phoneImage } = images;

  // Mock project data - in real app this would be fetched based on founderId and projectSlug
  const projectData: Record<string, any> = {
    'ethereum': {
      name: 'Ethereum',
      founder: 'Vitalik Buterin',
      founderId: 'vitalik-buterin',
      tagline: 'Leading Smart Contract Platform',
      description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality. It is the most actively used blockchain with the largest developer community.',
      image: solanaImage,
      category: 'Layer 1',
      ecosystem: 'Ethereum',
      launched: '2015',
      website: 'https://ethereum.org',
      status: 'Live',
      vision: 'Vitalik Buterin envisioned Ethereum as a "world computer" - a global, decentralized platform where anyone could build and deploy applications that run exactly as programmed without possibility of downtime, censorship, fraud or third-party interference.',
      whyBuilt: [
        'Bitcoin was too limited - it could only handle simple value transfers',
        'Each new application required its own blockchain',
        'Need for a programmable blockchain that could support any type of decentralized application',
        'Vision of decentralized finance, governance, and social coordination'
      ],
      keyFeatures: [
        {
          title: 'Smart Contracts',
          description: 'Self-executing contracts with terms directly written into code'
        },
        {
          title: 'EVM',
          description: 'Ethereum Virtual Machine enables Turing-complete programmability'
        },
        {
          title: 'Proof of Stake',
          description: 'Transitioned to energy-efficient consensus mechanism'
        },
        {
          title: 'DeFi Ecosystem',
          description: 'Home to the largest decentralized finance ecosystem'
        }
      ],
      roadmap: [
        {
          phase: 'The Merge',
          status: 'Completed',
          date: 'September 2022',
          description: 'Transition from Proof of Work to Proof of Stake'
        },
        {
          phase: 'The Surge',
          status: 'In Progress',
          date: '2024-2025',
          description: 'Scaling through sharding and Layer 2 solutions'
        },
        {
          phase: 'The Scourge',
          status: 'Planned',
          date: 'Future',
          description: 'MEV mitigation and protocol improvements'
        },
        {
          phase: 'The Verge',
          status: 'Planned',
          date: 'Future',
          description: 'Verkle trees for efficient state management'
        }
      ],
      metrics: {
        marketCap: '$450B+',
        dailyTransactions: '1.2M+',
        developers: '4,000+',
        dApps: '3,000+'
      }
    }
  };

  const currentProject = projectData[projectSlug] || projectData['ethereum'];

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
            <BreadcrumbLink onClick={() => onNavigate(`founders/${currentProject.founderId}`)} className="cursor-pointer">
              {currentProject.founder}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentProject.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Project Header */}
      <div>
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-600/20 rounded-lg mb-4">
          <span className="text-yellow-900 dark:text-yellow-400 text-sm">PROJECT DEEP DIVE</span>
        </div>
        
        <h1 className="text-gray-800 dark:text-gray-100 mb-3">{currentProject.name}</h1>
        <h2 className="text-gray-600 dark:text-gray-400 mb-6">{currentProject.tagline}</h2>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm">{currentProject.category}</span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg text-sm">{currentProject.status}</span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm">Founded {currentProject.launched}</span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => onNavigate(`founders/${currentProject.founderId}`)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            By {currentProject.founder} →
          </button>
          {currentProject.website && (
            <a 
              href={currentProject.website}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Visit Website <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <ShareSaveButtons title={currentProject.name} />
      </div>

      {/* Hero Image */}
      <div className="aspect-[16/7] rounded-xl md:rounded-2xl overflow-hidden">
        <img 
          src={currentProject.image} 
          alt={currentProject.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-100 dark:border-gray-800">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
          <div className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl mb-1">{currentProject.metrics.marketCap}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Market Cap</div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-100 dark:border-gray-800">
          <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
          <div className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl mb-1">{currentProject.metrics.dailyTransactions}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Daily Transactions</div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-100 dark:border-gray-800">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
          <div className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl mb-1">{currentProject.metrics.developers}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Active Developers</div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-100 dark:border-gray-800">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
          <div className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl mb-1">{currentProject.metrics.dApps}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">dApps Built</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-4">About {currentProject.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{currentProject.description}</p>
          </div>

          {/* Founder's Vision */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-xl md:rounded-2xl p-6 md:p-8 border border-blue-100 dark:border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-800 dark:text-gray-100">Why {currentProject.founder} Built This</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 italic">{currentProject.vision}</p>
            <ul className="space-y-2">
              {currentProject.whyBuilt.map((reason: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Features */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
            <h3 className="text-gray-800 dark:text-gray-100 mb-6">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentProject.keyFeatures.map((feature: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-gray-800 dark:text-gray-100 mb-2">{feature.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap & Milestones */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-gray-800 dark:text-gray-100">Roadmap & Milestones</h3>
            </div>
            <div className="space-y-4">
              {currentProject.roadmap.map((milestone: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.status === 'Completed' ? 'bg-green-500' : 
                      milestone.status === 'In Progress' ? 'bg-blue-500' : 
                      'bg-gray-300 dark:bg-gray-600'
                    }`}></div>
                    {idx < currentProject.roadmap.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-gray-800 dark:text-gray-100">{milestone.phase}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        milestone.status === 'Completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 
                        milestone.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{milestone.date}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Quick Links */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-gray-100 mb-4">Explore in CrypLounge</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => onNavigate(`learn/${projectSlug}`)}
                  className="w-full text-left p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors group"
                >
                  <div className="text-blue-600 dark:text-blue-400 mb-1 flex items-center justify-between">
                    Learn Section
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Tutorials & guides</div>
                </button>

                <button 
                  onClick={() => onNavigate('news/blockchain')}
                  className="w-full text-left p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors group"
                >
                  <div className="text-purple-600 dark:text-purple-400 mb-1 flex items-center justify-between">
                    Latest News
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Updates & announcements</div>
                </button>
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-gray-100 mb-4">Project Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Founder</div>
                  <button 
                    onClick={() => onNavigate(`founders/${currentProject.founderId}`)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {currentProject.founder}
                  </button>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Category</div>
                  <div className="text-gray-800 dark:text-gray-200">{currentProject.category}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Ecosystem</div>
                  <div className="text-gray-800 dark:text-gray-200">{currentProject.ecosystem}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Launched</div>
                  <div className="text-gray-800 dark:text-gray-200">{currentProject.launched}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 mb-1">Status</div>
                  <div className="text-gray-800 dark:text-gray-200">{currentProject.status}</div>
                </div>
              </div>
            </div>

            {/* Submit Updates CTA */}
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-600/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-500/30">
              <h4 className="text-gray-800 dark:text-gray-100 mb-2">Project Updates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you part of this project? Submit updates and milestones.
              </p>
              <button className="w-full px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors text-sm">
                Submit Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
