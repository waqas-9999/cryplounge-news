'use client';

import React from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Scale, FileText, Compass, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

const COVERAGE = [
  {
    title: 'News',
    description: 'Breaking developments across markets, exchanges, protocols and the wider industry, reported as they happen.',
  },
  {
    title: 'Markets',
    description: 'Price action, liquidity shifts and the fundamentals behind ecosystem growth — not just charts.',
  },
  {
    title: 'Regulation',
    description: 'Global policy, enforcement actions and compliance changes shaping how the industry operates.',
  },
  {
    title: 'Founder Stories',
    description: 'Interviews and long-form profiles of the people building the protocols, companies and communities.',
  },
  {
    title: 'Events',
    description: 'Conferences, meetups and the moments where the crypto community gathers in person and online.',
  },
];

const PRINCIPLES = [
  {
    icon: CheckCircle2,
    title: 'Accuracy',
    description: 'We verify information before publishing and correct the record openly when we get something wrong.',
  },
  {
    icon: ShieldCheck,
    title: 'Independence',
    description: 'Editorial decisions are made separately from commercial partnerships, sponsors and advertisers.',
  },
  {
    icon: FileText,
    title: 'Transparency',
    description: 'News, analysis and sponsored content are clearly labeled, so readers always know what they are reading.',
  },
  {
    icon: Compass,
    title: 'Context',
    description: "We explain why a development matters, not just what happened. Headlines are a starting point, not the story.",
  },
];

const DIFFERENTIATORS = [
  'News with context, not just headlines',
  'Human-centered reporting on the people behind the industry',
  'Coverage that goes beyond price charts and speculation',
  'A global view of the crypto and blockchain ecosystem',
  'Written for beginners and experienced readers alike',
];

const TEAM = [
  { name: 'Editorial Desk', role: 'Editor', focus: 'Assigns coverage, verifies sourcing, sets standards for every published story.' },
  { name: 'Markets Desk', role: 'Crypto Analyst', focus: 'Tracks price action, on-chain data and the forces moving digital asset markets.' },
  { name: 'Research Desk', role: 'Blockchain Researcher', focus: 'Digs into protocol upgrades, tokenomics and technical developments.' },
  { name: 'Contributing Writers', role: 'Contributor', focus: 'Independent voices covering regulation, founders and the global crypto community.' },
];

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead
        title="About CrypLounge — Independent Crypto Journalism"
        description="CrypLounge is an independent crypto media platform covering breaking news, markets, regulation and the people building the blockchain industry."
        canonical="/about"
      />

      {/* Hero */}
      <section className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-14 md:py-24">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 hover:text-[#FFD200] transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD200]" />
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">About CrypLounge</span>
          </div>

          <h1 className="text-gray-900 dark:text-white text-4xl md:text-6xl leading-[1.1] max-w-3xl mb-6 font-serif">
            Independent crypto news, insights and stories that matter.
          </h1>

          <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg leading-relaxed">
            CrypLounge covers cryptocurrency, blockchain and Web3 — from breaking market moves to
            regulation, founder stories and industry shifts — with reporting readers can rely on.
          </p>

          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-500">
            <span>Editorially independent</span>
            <span>Sourced and fact-checked</span>
            <span>Sponsored content clearly labeled</span>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-16">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">Who We Are</span>
          </div>
          <div className="max-w-2xl">
            <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl mb-6 font-serif">
              Understanding the story behind the headline.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              CrypLounge is a crypto media platform built to help readers make sense of one of the
              fastest-changing industries in the world. We cover breaking crypto news, blockchain
              innovation, market movements, Web3 companies, founder stories and industry analysis.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Our reporters and analysts follow the industry closely — reading filings, tracking
              on-chain activity, and talking to the people building in this space — so readers get
              coverage grounded in facts, not hype.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111112]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-16">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">Our Mission</span>
            </div>
            <div className="max-w-2xl">
              <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl mb-6 font-serif">
                Clear, reliable coverage of the crypto ecosystem.
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our mission is simple: provide clear, reliable and meaningful coverage of the crypto
                ecosystem. We believe readers deserve reporting that explains what is actually
                happening — beyond price charts and marketing — across the technology, the markets
                and the people driving the industry forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Cover */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-serif">What We Cover</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500 hidden md:block">05 Desks</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800">
          {COVERAGE.map((item, i) => (
            <div
              key={item.title}
              className="grid md:grid-cols-[80px_200px_1fr] gap-2 md:gap-8 py-6 border-b border-gray-200 dark:border-gray-800"
            >
              <span className="text-sm text-gray-400 dark:text-gray-600">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xl">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Principles */}
      <section className="border-t border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111112]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
          <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl mb-10 font-serif">Our Editorial Principles</h2>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="flex gap-4">
                <p.icon className="w-5 h-5 text-[#FFD200] shrink-0 mt-1" />
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-2">{p.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CrypLounge */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-16">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">Why CrypLounge</span>
          </div>
          <div className="max-w-2xl">
            <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl mb-6 font-serif">
              We focus on clarity over noise.
            </h2>
            <ul className="space-y-3">
              {DIFFERENTIATORS.map((d) => (
                <li key={d} className="flex items-start gap-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                  <Scale className="w-4 h-4 text-[#FFD200] mt-1 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
          <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl mb-10 font-serif">The Newsroom</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 mb-4" />
                <h3 className="text-gray-900 dark:text-white text-sm mb-1">{member.name}</h3>
                <span className="text-xs text-[#EFB81A] dark:text-[#FFD200] block mb-3">{member.role}</span>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{member.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111112]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl mb-4 font-serif">
                Stay ahead of the crypto conversation.
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Get the latest stories, market insights and blockchain updates delivered directly to
                your inbox.
              </p>
            </div>
            <button
              onClick={() => onNavigate('newsletter')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gray-900 dark:bg-[#FFD200] text-white dark:text-black text-sm rounded-lg hover:opacity-90 transition-opacity shrink-0"
            >
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
