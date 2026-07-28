import { ArrowLeft } from 'lucide-react';

interface FactCheckPolicyPageProps {
  onNavigate: (page: string) => void;
}

export default function FactCheckPolicyPage({ onNavigate }: FactCheckPolicyPageProps) {
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

        <h1 className="text-gray-900 dark:text-white mb-8">Fact-Check Policy</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Our Commitment to Accuracy</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              In the rapidly evolving cryptocurrency space, accurate information is critical. CrypLounge is committed to rigorous fact-checking processes to ensure our readers receive trustworthy and verified information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Verification Process</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our fact-checking process includes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Primary source verification: We seek out original documents, official announcements, and direct statements</li>
              <li>Multiple source confirmation: Significant claims require verification from at least two independent, credible sources</li>
              <li>Expert consultation: Technical and financial claims are reviewed by subject matter experts</li>
              <li>Data verification: All statistics and numerical data are verified against reliable databases and official sources</li>
              <li>Blockchain verification: On-chain data is verified using multiple blockchain explorers and analytics tools</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Source Evaluation</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We evaluate sources based on:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Track record and credibility in the cryptocurrency space</li>
              <li>Transparency of information and data sources</li>
              <li>Potential conflicts of interest or biases</li>
              <li>Consistency with information from other reliable sources</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Handling Uncertainty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When information cannot be fully verified:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>We clearly label unverified claims as "alleged" or "reported"</li>
              <li>We provide context about the source and why complete verification isn't possible</li>
              <li>We update stories as more information becomes available</li>
              <li>We may choose not to publish if verification is insufficient</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Price and Market Data</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Cryptocurrency prices and market data are sourced from reputable aggregators and exchanges. We acknowledge that prices can vary across platforms and always specify our data sources.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Correcting Errors</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When errors are identified, we promptly correct them and clearly note the correction at the top or bottom of the article. See our{' '}
              <button
                onClick={() => onNavigate('corrections-policy')}
                className="text-[#EFB81A] hover:underline"
              >
                Corrections Policy
              </button>{' '}
              for more details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Reader Contributions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We encourage readers to alert us to potential errors or questionable claims. Reports can be submitted to{' '}
              <a href="mailto:factcheck@cryplounge.com" className="text-[#EFB81A] hover:underline">
                factcheck@cryplounge.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-gray-900 dark:text-white mb-4">Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              For questions about our fact-checking process, please contact{' '}
              <a href="mailto:factcheck@cryplounge.com" className="text-[#EFB81A] hover:underline">
                factcheck@cryplounge.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
