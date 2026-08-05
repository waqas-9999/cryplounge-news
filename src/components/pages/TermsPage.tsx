'use client';

import React from 'react';
import { ArrowLeft, Shield, FileText, AlertCircle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export default function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead 
        title="Terms of Service - CrypLounge"
        description="Read CrypLounge's Terms of Service. Learn about user responsibilities, content guidelines, and platform usage terms."
        canonical="/terms"
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
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#EFB81A]" />
            </div>
            <h1 className="text-gray-900 dark:text-white">
              Terms of Service
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Last Updated: November 13, 2025
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-[900px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/* Agreement to Terms */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              By accessing or using CrypLounge ("the Platform"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Platform.
            </p>
            <div className="bg-[#F9D96A]/10 dark:bg-[#EFB81A]/5 border border-[#EFB81A]/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#EFB81A] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Important:</strong> These terms constitute a legally binding agreement between you and CrypLounge.
              </div>
            </div>
          </div>

          {/* Use of Platform */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">2. Use of Platform</h2>
            <h3 className="text-gray-900 dark:text-white mb-3">2.1 Permitted Use</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You may use the Platform to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Read and access news articles and educational content</li>
              <li>View market data and cryptocurrency information</li>
              <li>Create an account and manage your profile</li>
              <li>Submit content subject to our editorial review</li>
              <li>Participate in community discussions</li>
            </ul>

            <h3 className="text-gray-900 dark:text-white mb-3">2.2 Prohibited Use</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Submit false, misleading, or defamatory content</li>
              <li>Attempt to hack, disrupt, or damage the Platform</li>
              <li>Use automated systems to scrape or harvest data</li>
              <li>Impersonate other users or entities</li>
              <li>Share your account credentials with others</li>
            </ul>
          </div>

          {/* User Accounts */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for any activities or actions under your account.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, false, or violates these Terms of Service.
            </p>
          </div>

          {/* Content */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">4. Content</h2>
            <h3 className="text-gray-900 dark:text-white mb-3">4.1 Our Content</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All content published on CrypLounge, including but not limited to text, graphics, logos, images, and software, is the property of CrypLounge or its content suppliers and is protected by copyright laws.
            </p>

            <h3 className="text-gray-900 dark:text-white mb-3">4.2 User-Generated Content</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              By submitting content to CrypLounge, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and publish your content. You retain ownership of your content but give us permission to use it on our Platform.
            </p>

            <h3 className="text-gray-900 dark:text-white mb-3">4.3 Content Standards</h3>
            <p className="text-gray-600 dark:text-gray-400">
              All user-generated content must be accurate, respectful, and comply with applicable laws. We reserve the right to remove any content that violates these standards.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">5. Disclaimer</h2>
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <strong>NOT FINANCIAL ADVICE:</strong> The information provided on CrypLounge is for informational and educational purposes only. Nothing on this Platform constitutes financial, investment, legal, or tax advice.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Cryptocurrency investments are highly volatile and risky. You should conduct your own research and consult with qualified professionals before making any investment decisions.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                CrypLounge and its contributors are not responsible for any losses or damages resulting from your use of information on this Platform.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To the maximum extent permitted by law, CrypLounge shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">7. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by updating the "Last Updated" date at the top of this page. Your continued use of the Platform after any changes constitutes acceptance of the new Terms.
            </p>
          </div>

          {/* Governing Law */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">8. Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-400">
              These Terms shall be governed by and construed in accordance with international laws, without regard to its conflict of law provisions.
            </p>
          </div>

          {/* Contact */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">9. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Email: <a href="mailto:cryploungeofficial@gmail.com" className="text-[#EFB81A] hover:underline">cryploungeofficial@gmail.com</a>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Or visit our{' '}
                <button onClick={() => onNavigate('contact')} className="text-[#EFB81A] hover:underline">
                  contact page
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-gray-900 dark:text-white mb-4">Related Documents</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('privacy')}
              className="px-6 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="px-6 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
