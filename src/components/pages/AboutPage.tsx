'use client';

import React from 'react';
import { ArrowLeft, Users, Target, Heart, Zap } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead 
        title="About CrypLounge - Your Premier Cryptocurrency News Source"
        description="Learn about CrypLounge's mission to deliver accurate, timely cryptocurrency news, market data, and educational content to the global crypto community."
        canonical="/about"
      />
      
      <Header onNavigate={onNavigate} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F9D96A]/20 to-white dark:from-[#EFB81A]/10 dark:to-[#0D0D0D] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-20">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <h1 className="text-gray-900 dark:text-white mb-4">
            About CrypLounge
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl text-lg md:text-xl">
            Your trusted source for cryptocurrency news, market insights, and blockchain education since 2024.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-full mb-6">
              <Target className="w-4 h-4 text-[#EFB81A]" />
              <span className="text-sm text-gray-900 dark:text-white">Our Mission</span>
            </div>
            <h2 className="text-gray-900 dark:text-white mb-6">
              Empowering the Crypto Community
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              At CrypLounge, we believe in the transformative power of blockchain technology and cryptocurrencies. Our mission is to provide accurate, timely, and unbiased news coverage that helps our readers make informed decisions.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              We're committed to breaking down complex topics, covering breaking news as it happens, and fostering a community of informed crypto enthusiasts, traders, and investors.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#F9D96A] to-[#EFB81A] rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl md:text-4xl text-white mb-2">10K+</div>
                <div className="text-white/80 text-sm">Articles Published</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl md:text-4xl text-white mb-2">500K+</div>
                <div className="text-white/80 text-sm">Monthly Readers</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl md:text-4xl text-white mb-2">24/7</div>
                <div className="text-white/80 text-sm">News Coverage</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl md:text-4xl text-white mb-2">100+</div>
                <div className="text-white/80 text-sm">Expert Contributors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 dark:bg-[#1A1A1A] py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              These principles guide everything we do at CrypLounge
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#0D0D0D] rounded-xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#EFB81A]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">Speed & Accuracy</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We deliver breaking news fast without compromising on fact-checking and accuracy. Every story is verified before publication.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0D0D0D] rounded-xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#EFB81A]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">Community First</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Our readers are at the heart of everything we do. We listen to feedback and continuously improve our content and platform.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0D0D0D] rounded-xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#EFB81A]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">Transparency</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We maintain editorial independence and clearly disclose any sponsored content, partnerships, or potential conflicts of interest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Cover Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 dark:text-white mb-4">
            What We Cover
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive cryptocurrency coverage across multiple categories
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h4 className="text-gray-900 dark:text-white mb-3">News</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Breaking news, market updates, regulatory changes, and industry developments.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h4 className="text-gray-900 dark:text-white mb-3">Market Data</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Real-time prices, charts, market analysis, and trading insights for thousands of tokens.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h4 className="text-gray-900 dark:text-white mb-3">Learn Hub</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Educational content, tutorials, guides, and courses for all experience levels.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h4 className="text-gray-900 dark:text-white mb-3">Yellow Page</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Founder stories, project profiles, and the people building the crypto future.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h4 className="text-gray-900 dark:text-white mb-3">Events</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Global crypto conferences, meetups, hackathons, and virtual events calendar.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#F9D96A] to-[#EFB81A] py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Stay updated with the latest crypto news, market insights, and educational content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Create Free Account
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
