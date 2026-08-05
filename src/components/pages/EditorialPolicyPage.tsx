'use client';

import { ArrowLeft } from 'lucide-react';

interface EditorialPolicyPageProps {
  onNavigate: (page: string) => void;
}

export default function EditorialPolicyPage({ onNavigate }: EditorialPolicyPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors mb-8"
          aria-label="Go back to home page"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-gray-900 dark:text-white mb-8">Editorial Policy</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              CrypLounge is committed to delivering accurate, timely, and unbiased cryptocurrency and blockchain news to our readers. Our editorial policy ensures that all content meets the highest standards of journalism while serving the crypto community's need for reliable information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Editorial Independence</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our editorial team operates independently from our business and advertising departments. No advertiser, sponsor, or external party influences our editorial decisions, story selection, or content presentation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Accuracy and Verification</h2>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>All facts are verified through multiple credible sources before publication</li>
              <li>We cite sources and provide links to original documents when possible</li>
              <li>Financial data and statistics are cross-referenced with reliable industry sources</li>
              <li>Technical claims are reviewed by subject matter experts</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Conflicts of Interest</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We maintain strict policies regarding conflicts of interest:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Writers must disclose any financial holdings in cryptocurrencies or projects they cover</li>
              <li>Staff members are prohibited from trading based on non-public information</li>
              <li>Sponsored content is clearly labeled and separated from editorial content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Editorial Standards</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Every piece of content published on CrypLounge adheres to our editorial standards:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Clear distinction between news reporting, analysis, and opinion</li>
              <li>Balanced coverage that presents multiple perspectives</li>
              <li>Respectful and professional tone in all communications</li>
              <li>Proper attribution of sources and quotes</li>
              <li>Regular updates to developing stories</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">User-Generated Content</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comments and user submissions are moderated to ensure quality discourse. We reserve the right to remove content that violates our community guidelines, including spam, harassment, or misinformation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              For questions about our editorial policy or to report concerns, please contact our editorial team at{' '}
              <a href="mailto:cryploungeofficial@gmail.com" className="text-[#EFB81A] hover:underline">
                cryploungeofficial@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
