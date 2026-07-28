'use client';

import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, Cookie, UserCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export default function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead 
        title="Privacy Policy - CrypLounge"
        description="Learn how CrypLounge collects, uses, and protects your personal information. Read our comprehensive privacy policy and data protection practices."
        canonical="/privacy"
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
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#EFB81A]" />
            </div>
            <h1 className="text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Last Updated: November 13, 2025
          </p>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <div className="bg-[#F9D96A]/10 dark:bg-[#EFB81A]/5 border border-[#EFB81A]/20 rounded-xl p-6 md:p-8">
          <h2 className="text-gray-900 dark:text-white mb-4">Your Privacy Matters</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            At CrypLounge, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#EFB81A] flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Secure Data Storage</span>
            </div>
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-[#EFB81A] flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Transparent Practices</span>
            </div>
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-[#EFB81A] flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">User Control</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-[900px] mx-auto px-4 md:px-8 pb-12 md:pb-16">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {/* Information We Collect */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-[#EFB81A]" />
              </div>
              <h2 className="text-gray-900 dark:text-white mb-0">1. Information We Collect</h2>
            </div>

            <h3 className="text-gray-900 dark:text-white mb-3">1.1 Information You Provide</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When you create an account or use our services, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Name and email address</li>
              <li>Username and password</li>
              <li>Profile information (optional)</li>
              <li>Content you submit (articles, comments, submissions)</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-gray-900 dark:text-white mb-3">1.2 Automatically Collected Information</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We automatically collect certain information when you use CrypLounge:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Pages viewed and links clicked</li>
              <li>Time and date of visits</li>
              <li>Referring website addresses</li>
            </ul>
          </div>

          {/* How We Use Information */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li><strong>Service Delivery:</strong> To provide and maintain our Platform</li>
              <li><strong>Personalization:</strong> To customize content and recommendations</li>
              <li><strong>Communication:</strong> To send newsletters, updates, and notifications</li>
              <li><strong>Analytics:</strong> To understand how users interact with our Platform</li>
              <li><strong>Security:</strong> To detect and prevent fraud and abuse</li>
              <li><strong>Improvement:</strong> To enhance and optimize our services</li>
            </ul>
          </div>

          {/* Cookies */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-[#EFB81A]" />
              </div>
              <h2 className="text-gray-900 dark:text-white mb-0">3. Cookies and Tracking</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We use cookies and similar tracking technologies to enhance your experience. Cookies help us:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Remember your preferences and settings</li>
              <li>Keep you signed in</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Serve relevant advertisements</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400">
              You can control cookies through your browser settings. Note that disabling cookies may limit some functionality of the Platform.
            </p>
          </div>

          {/* Data Sharing */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li><strong>Service Providers:</strong> With third-party vendors who assist in operating our Platform</li>
              <li><strong>Legal Compliance:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#EFB81A]" />
              </div>
              <h2 className="text-gray-900 dark:text-white mb-0">5. Data Security</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Restricted access to personal information</li>
              <li>Secure password hashing</li>
            </ul>
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-0">
                <strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">6. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Object:</strong> Object to processing of your data for certain purposes</li>
            </ul>
          </div>

          {/* Data Retention */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">8. Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-400">
              CrypLounge is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </div>

          {/* International Users */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">9. International Data Transfers</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </div>

          {/* Changes to Policy */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this page. We encourage you to review this policy periodically.
            </p>
          </div>

          {/* Contact */}
          <div className="mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">11. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Email: <a href="mailto:privacy@cryplounge.com" className="text-[#EFB81A] hover:underline">privacy@cryplounge.com</a>
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
              onClick={() => onNavigate('terms')}
              className="px-6 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              Terms of Service
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

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
