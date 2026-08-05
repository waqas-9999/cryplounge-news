'use client';

import React, { useState } from 'react';
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, Users, Zap, Heart, Trophy } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

interface CareersPageProps {
  onNavigate: (path: string) => void;
}

const jobOpenings = [
  {
    id: 1,
    title: 'Senior Crypto Journalist',
    department: 'Editorial',
    location: 'Remote',
    type: 'Full-time',
    salary: '$60k - $90k',
    description: 'Write breaking news, analysis, and features on cryptocurrency markets and blockchain technology.'
  },
  {
    id: 2,
    title: 'Blockchain Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary: '$80k - $120k',
    description: 'Build and maintain our platform infrastructure, integrate blockchain data sources, and develop new features.'
  },
  {
    id: 3,
    title: 'Content Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    salary: '$50k - $75k',
    description: 'Develop content strategy, manage social media, and grow our community across multiple channels.'
  },
  {
    id: 4,
    title: 'Market Data Analyst',
    department: 'Research',
    location: 'Remote',
    type: 'Full-time',
    salary: '$55k - $85k',
    description: 'Analyze crypto market trends, create data visualizations, and produce market research reports.'
  },
  {
    id: 5,
    title: 'Community Manager',
    department: 'Community',
    location: 'Remote',
    type: 'Part-time',
    salary: '$30k - $45k',
    description: 'Engage with our community, moderate discussions, and organize events and AMAs.'
  },
  {
    id: 6,
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Contract',
    salary: '$70k - $100k',
    description: 'Design intuitive interfaces for our news platform, create design systems, and improve user experience.'
  }
];

const benefits = [
  {
    icon: MapPin,
    title: 'Remote-First',
    description: 'Work from anywhere in the world with flexible hours'
  },
  {
    icon: DollarSign,
    title: 'Competitive Salary',
    description: 'Market-rate compensation plus crypto bonuses'
  },
  {
    icon: Heart,
    title: 'Health Benefits',
    description: 'Comprehensive health, dental, and vision coverage'
  },
  {
    icon: Zap,
    title: 'Learning Budget',
    description: '$2,000 annual budget for courses and conferences'
  },
  {
    icon: Users,
    title: 'Team Retreats',
    description: 'Annual company retreats to crypto conferences'
  },
  {
    icon: Trophy,
    title: 'Performance Bonuses',
    description: 'Quarterly bonuses based on individual and team goals'
  }
];

export default function CareersPage({ onNavigate }: CareersPageProps) {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead 
        title="Careers at CrypLounge - Join Our Team"
        description="Join CrypLounge and help shape the future of cryptocurrency news. We're hiring journalists, developers, designers, and more. Remote-first with competitive benefits."
        canonical="/careers"
      />
      
      
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
            Join Our Team
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl text-lg">
            Help us build the premier destination for cryptocurrency news and education. We're a remote-first team passionate about blockchain and Web3.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 dark:text-white mb-4">
            Why Work at CrypLounge?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We offer a supportive environment where you can grow your career while shaping the crypto narrative
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-[#EFB81A]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Job Openings Section */}
      <section className="bg-gray-50 dark:bg-[#1A1A1A] py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">
              Open Positions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {jobOpenings.length} open positions across {new Set(jobOpenings.map(j => j.department)).size} departments
            </p>
          </div>

          <div className="space-y-4">
            {jobOpenings.map((job) => (
              <div key={job.id} className="bg-white dark:bg-[#0D0D0D] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-gray-900 dark:text-white mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1.5 text-[#EFB81A]">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                      className="px-6 py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] transition-colors whitespace-nowrap"
                    >
                      {selectedJob === job.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {selectedJob === job.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-gray-600 dark:text-gray-400 mb-6">{job.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-gray-900 dark:text-white mb-3">Responsibilities</h4>
                          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Write and publish high-quality content</li>
                            <li>• Collaborate with cross-functional teams</li>
                            <li>• Stay updated on industry trends</li>
                            <li>• Meet deadlines and quality standards</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-gray-900 dark:text-white mb-3">Requirements</h4>
                          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>• 3+ years of relevant experience</li>
                            <li>• Strong knowledge of crypto/blockchain</li>
                            <li>• Excellent communication skills</li>
                            <li>• Self-motivated and remote-ready</li>
                          </ul>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigate('contact')}
                        className="w-full md:w-auto px-8 py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] transition-colors"
                      >
                        Apply for This Position
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="bg-gradient-to-br from-[#F9D96A] to-[#EFB81A] rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-white mb-4">
            Don't See Your Role?
          </h2>
          <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
            We're always looking for talented people who are passionate about crypto. Send us your resume and tell us how you can contribute!
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Send General Application
          </button>
        </div>
      </section>

    </div>
  );
}
