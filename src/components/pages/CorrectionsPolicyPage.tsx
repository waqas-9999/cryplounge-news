'use client';

import { ArrowLeft } from 'lucide-react';

interface CorrectionsPolicyPageProps {
  onNavigate: (page: string) => void;
}

export default function CorrectionsPolicyPage({ onNavigate }: CorrectionsPolicyPageProps) {
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

        <h1 className="text-gray-900 dark:text-white mb-8">Corrections Policy</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Our Commitment to Transparency</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              At CrypLounge, we take accuracy seriously. When errors occur, we correct them promptly and transparently. This policy outlines how we handle corrections to maintain trust with our readers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Types of Corrections</h2>
            
            <h3 className="text-gray-800 dark:text-gray-200 mb-3">Significant Errors</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Errors that materially affect the meaning or understanding of a story are corrected immediately and noted prominently:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Factual inaccuracies (names, dates, numbers, quotes, technical details)</li>
              <li>Misleading statements or implications</li>
              <li>Incorrect attribution of information or quotes</li>
              <li>Errors in financial data or market information</li>
            </ul>

            <h3 className="text-gray-800 dark:text-gray-200 mb-3">Minor Errors</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Minor errors such as typos, grammatical mistakes, or formatting issues that don't affect the content's meaning are corrected without notation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Correction Process</h2>
            <ol className="list-decimal pl-6 text-gray-600 dark:text-gray-400 space-y-3">
              <li>
                <strong className="text-gray-700 dark:text-gray-300">Identification:</strong> Errors can be identified internally or reported by readers
              </li>
              <li>
                <strong className="text-gray-700 dark:text-gray-300">Verification:</strong> Our editorial team verifies the error and determines the appropriate correction
              </li>
              <li>
                <strong className="text-gray-700 dark:text-gray-300">Implementation:</strong> The correction is made to the article immediately
              </li>
              <li>
                <strong className="text-gray-700 dark:text-gray-300">Notation:</strong> A clear correction notice is added to the article
              </li>
              <li>
                <strong className="text-gray-700 dark:text-gray-300">Social Media:</strong> If the error was shared on social media, we post a correction there as well
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Correction Notation</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Corrections are noted in one of the following ways:
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong className="text-gray-700 dark:text-gray-300">At the top of the article (for significant errors):</strong>
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                "Correction [Date]: An earlier version of this article [description of error and correction]. The article has been updated."
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong className="text-gray-700 dark:text-gray-300">At the bottom of the article (for minor corrections):</strong>
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                "Update [Date]: This article has been updated to [description of correction]."
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Clarifications vs. Corrections</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong className="text-gray-700 dark:text-gray-300">Corrections</strong> address factual errors in published content.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong className="text-gray-700 dark:text-gray-300">Clarifications</strong> address content that, while not factually incorrect, could be misleading or requires additional context for better understanding.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Reporting Errors</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you notice an error in our coverage, please report it to us:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Email: <a href="mailto:cryploungeofficial@gmail.com" className="text-[#EFB81A] hover:underline">cryploungeofficial@gmail.com</a></li>
              <li>Include the article URL, description of the error, and supporting information</li>
              <li>We review all submissions and respond within 24-48 hours</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Archive Access</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We maintain the integrity of our article archive. Corrected articles remain accessible and are never deleted to hide errors. The correction notation provides full transparency about what changed and when.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              For questions about our corrections policy, please contact{' '}
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
