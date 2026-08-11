'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { apiClient } from '@/lib/api-client';
import { siteConfig } from '@/config/site';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

const REASONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'news-tip', label: 'News Submission' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'press', label: 'Press Request' },
  { value: 'contributor', label: 'Contributor Application' },
];

const PURPOSE_CARDS = [
  {
    title: 'General Inquiries',
    description: 'Website questions, reader feedback and suggestions for the newsroom.',
    reason: 'general',
    note: null as string | null,
  },
  {
    title: 'News Tips',
    description: 'Breaking news tips, industry announcements and research submissions.',
    reason: 'news-tip',
    note: 'We welcome valuable insights from the crypto community.',
  },
  {
    title: 'Press & Media',
    description: 'Interview requests, media coverage and journalist inquiries.',
    reason: 'press',
    note: null,
  },
  {
    title: 'Partnerships',
    description: 'Sponsored content, brand partnerships and advertising opportunities.',
    reason: 'advertising',
    note: null,
  },
  {
    title: 'Contribute',
    description: 'Writers, analysts, researchers and contributors looking to publish with us.',
    reason: 'contributor',
    note: null,
  },
];

const FAQS = [
  {
    q: 'How can I submit a crypto news tip?',
    a: 'Use the contact form below and select "News Submission" as your reason for contact. Include as much verifiable detail as possible — our editorial desk reviews every tip.',
  },
  {
    q: 'Do you accept guest contributions?',
    a: 'Yes. Select "Contributor Application" in the form and tell us about your background and the topics you cover. We review writing samples before publishing.',
  },
  {
    q: 'How can companies advertise with Cryplounge?',
    a: 'Select "Advertising" as your reason for contact and outline your goals. Our partnerships desk will follow up with available formats and rates.',
  },
  {
    q: 'How long does it take to receive a response?',
    a: 'Most inquiries receive a reply within 24–48 hours during business days. Press and partnership requests may take slightly longer during high-volume periods.',
  },
];

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    reason: 'general',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const reasonLabel = REASONS.find(r => r.value === formData.reason)?.label ?? 'General Inquiry';
      const message = formData.company
        ? `Organization: ${formData.company}\n\n${formData.message}`
        : formData.message;
      await apiClient.post('contact', {
        name: formData.name,
        email: formData.email,
        subject: `[${reasonLabel}] ${formData.subject}`,
        message,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', reason: 'general', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 6000);
    } catch {
      setError("Couldn't send your message. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const selectReason = (reason: string) => {
    setFormData(prev => ({ ...prev, reason }));
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead
        title="Contact CrypLounge — Connect With Our Crypto Newsroom"
        description="Reach the CrypLounge editorial team for news tips, press inquiries, partnerships and contributor applications."
        canonical="/contact"
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
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Contact</span>
          </div>

          <h1 className="text-gray-900 dark:text-white text-4xl md:text-6xl leading-[1.1] max-w-3xl mb-6 font-serif">
            Connect with our crypto newsroom.
          </h1>

          <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg leading-relaxed">
            Whether you have a story idea, partnership opportunity, press inquiry or feedback,
            our editorial team would like to hear from you.
          </p>
        </div>
      </section>

      {/* Purpose cards */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-serif">Reach the Right Desk</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PURPOSE_CARDS.map((card) => (
            <div
              key={card.title}
              className="group border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-[#FFD200] dark:hover:border-[#FFD200] transition-colors"
            >
              <h3 className="text-gray-900 dark:text-white mb-2">{card.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{card.description}</p>
              {card.note && (
                <p className="text-xs text-[#EFB81A] dark:text-[#FFD200] mb-4">{card.note}</p>
              )}
              <button
                onClick={() => selectReason(card.reason)}
                className="text-sm text-gray-900 dark:text-white inline-flex items-center gap-1.5 group-hover:text-[#FFD200] transition-colors"
              >
                Contact Team →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Form + info */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111112]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div id="contact-form" className="lg:col-span-2">
              <div className="bg-white dark:bg-[#0D0D0D] rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-gray-900 dark:text-white text-xl mb-6 font-serif">Send a Message</h2>

                {submitted ? (
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                    <CheckCircle2 className="w-10 h-10 text-[#FFD200] mx-auto mb-4" />
                    <h3 className="text-gray-900 dark:text-white mb-2">Message sent</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Thank you for reaching out. Our team typically responds within 24–48 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-lg p-4 text-sm text-red-700 dark:text-red-400">
                        {error}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                          placeholder="Jane Smith"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                          placeholder="jane@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="company" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <label htmlFor="reason" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Reason for Contact *
                        </label>
                        <select
                          id="reason"
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                        >
                          {REASONS.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        maxLength={200}
                        className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
                        placeholder="Brief summary of your message"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        maxLength={5000}
                        className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD200] resize-none"
                        placeholder="Share the details of your inquiry…"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-4 bg-gray-900 dark:bg-[#FFD200] text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Newsroom info */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0D0D0D] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-gray-900 dark:text-white mb-6 text-sm uppercase tracking-[0.15em]">Newsroom</h3>
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-[#FFD200] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-gray-900 dark:text-white hover:text-[#FFD200] transition-colors break-all"
                    >
                      {siteConfig.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0D0D0D] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-[0.15em]">More Ways to Reach Us</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <button
                      onClick={() => onNavigate('careers')}
                      className="text-gray-600 dark:text-gray-400 hover:text-[#FFD200] transition-colors text-left"
                    >
                      → Career opportunities
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('submit-story')}
                      className="text-gray-600 dark:text-gray-400 hover:text-[#FFD200] transition-colors text-left"
                    >
                      → Submit a founder story
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('events/submit')}
                      className="text-gray-600 dark:text-gray-400 hover:text-[#FFD200] transition-colors text-left"
                    >
                      → Submit an event
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-16">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">Why Reach Out</span>
          </div>
          <div className="max-w-2xl">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              From breaking crypto developments to founder stories and industry insights,
              CrypLounge works with the global blockchain community to share meaningful stories.
            </p>
            <ul className="space-y-3">
              {[
                'Independent crypto coverage',
                'Community-driven insights',
                'Global blockchain perspective',
                'Professional editorial standards',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-[#FFD200] mt-1 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111112]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
          <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl mb-10 font-serif">Common Questions</h2>
          <div className="border-t border-gray-200 dark:border-gray-800">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-gray-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pb-5 max-w-2xl">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl mb-4 font-serif">
              Stay connected with crypto trends.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Subscribe to CrypLounge for market updates, blockchain insights and important
              industry stories.
            </p>
          </div>
          <button
            onClick={() => onNavigate('newsletter')}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gray-900 dark:bg-[#FFD200] text-white dark:text-black text-sm rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            Subscribe Newsletter
          </button>
        </div>
      </section>
    </div>
  );
}
