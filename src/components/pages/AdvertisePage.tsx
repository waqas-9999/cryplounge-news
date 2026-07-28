'use client';

import React from 'react';
import { ArrowLeft, TrendingUp, Users, Globe, Target, BarChart3, Zap } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';

interface AdvertisePageProps {
  onNavigate: (path: string) => void;
}

const adFormats = [
  {
    title: 'Banner Ads',
    description: 'Display ads in premium positions across our platform',
    sizes: ['728x90', '300x250', '970x250'],
    price: 'From $500/week'
  },
  {
    title: 'Sponsored Articles',
    description: 'Native content written by our editorial team',
    features: ['SEO optimized', 'Social promotion', 'Newsletter inclusion'],
    price: 'From $2,000/article'
  },
  {
    title: 'Newsletter Sponsorship',
    description: 'Reach 50K+ subscribers in our daily newsletter',
    features: ['Banner placement', 'Dedicated section', 'Click tracking'],
    price: 'From $1,500/edition'
  },
  {
    title: 'Video Sponsorship',
    description: 'Sponsor our YouTube videos and podcasts',
    features: ['Pre-roll mention', 'Description link', 'Pinned comment'],
    price: 'From $1,000/video'
  }
];

const stats = [
  { label: 'Monthly Visitors', value: '500K+', icon: Users },
  { label: 'Newsletter Subscribers', value: '50K+', icon: TrendingUp },
  { label: 'Global Reach', value: '150+ Countries', icon: Globe },
  { label: 'Engagement Rate', value: '12%', icon: Target }
];

export default function AdvertisePage({ onNavigate }: AdvertisePageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead 
        title="Advertise with CrypLounge - Reach Crypto Enthusiasts"
        description="Reach 500K+ monthly crypto enthusiasts with CrypLounge advertising. Banner ads, sponsored content, newsletter sponsorships, and more. Premium targeting for blockchain brands."
        canonical="/advertise"
      />
      
      <Header onNavigate={onNavigate} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F9D96A]/20 to-white dark:from-[#EFB81A]/10 dark:to-[#0D0D0D] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <h1 className="text-gray-900 dark:text-white mb-4">
            Advertise with CrypLounge
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl text-lg">
            Reach a highly engaged audience of cryptocurrency enthusiasts, traders, and blockchain professionals.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 dark:text-white mb-4">
            Our Reach
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with a global audience that's actively engaged in the crypto ecosystem
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center">
              <div className="w-12 h-12 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-[#EFB81A]" />
              </div>
              <div className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ad Formats Section */}
      <section className="bg-gray-50 dark:bg-[#1A1A1A] py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">
              Advertising Options
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Flexible formats to suit your marketing goals and budget
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {adFormats.map((format, index) => (
              <div key={index} className="bg-white dark:bg-[#0D0D0D] rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
                <h3 className="text-gray-900 dark:text-white mb-3">{format.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{format.description}</p>
                
                {format.sizes && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Available Sizes:</div>
                    <div className="flex flex-wrap gap-2">
                      {format.sizes.map((size, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {format.features && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Includes:</div>
                    <ul className="space-y-1">
                      {format.features.map((feature, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-[#EFB81A]">{format.price}</div>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-4 py-2 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] transition-colors text-sm"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-gray-900 dark:text-white mb-6">
              Who You'll Reach
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-[#EFB81A]" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-2">Active Traders</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    35% of our audience trades cryptocurrencies daily or weekly
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#EFB81A]" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-2">Early Adopters</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Tech-savvy individuals interested in new projects and innovations
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-[#EFB81A]" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-2">Decision Makers</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Founders, investors, and professionals building in Web3
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#F9D96A] to-[#EFB81A] rounded-2xl p-8 md:p-12">
            <h3 className="text-white mb-6">Audience Demographics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-white mb-2">
                  <span>Age 25-34</span>
                  <span>42%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-white mb-2">
                  <span>Age 35-44</span>
                  <span>31%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '31%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-white mb-2">
                  <span>Age 18-24</span>
                  <span>18%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-white mb-2">
                  <span>Age 45+</span>
                  <span>9%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '9%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 dark:bg-[#1A1A1A] py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Contact our advertising team to discuss custom packages and pricing for your brand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] transition-colors"
            >
              Contact Advertising Team
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="px-8 py-4 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              Learn More About Us
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
