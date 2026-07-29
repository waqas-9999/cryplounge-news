'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead 
        title="Contact CrypLounge - Get in Touch"
        description="Have questions or feedback? Contact the CrypLounge team. We're here to help with news tips, partnerships, advertising, and general inquiries."
        canonical="/contact"
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
            Contact Us
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl text-lg">
            Have a question, news tip, or partnership inquiry? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
              <h2 className="text-gray-900 dark:text-white mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 border border-[#EFB81A]/30 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-[#EFB81A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Thank you for contacting us. We'll get back to you within 24-48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                        placeholder="John Doe"
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
                        className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    >
                      <option value="">Select a subject</option>
                      <option value="news-tip">News Tip</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="advertising">Advertising</option>
                      <option value="press-release">Press Release Submission</option>
                      <option value="technical">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
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
                      className="w-full px-4 py-3 bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#EFB81A]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                    <a href="mailto:contact@cryplounge.com" className="text-gray-900 dark:text-white hover:text-[#EFB81A] transition-colors">
                      contact@cryplounge.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#EFB81A]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Press Inquiries</div>
                    <a href="mailto:press@cryplounge.com" className="text-gray-900 dark:text-white hover:text-[#EFB81A] transition-colors">
                      press@cryplounge.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#EFB81A]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Advertising</div>
                    <a href="mailto:ads@cryplounge.com" className="text-gray-900 dark:text-white hover:text-[#EFB81A] transition-colors">
                      ads@cryplounge.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#EFB81A]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</div>
                    <div className="text-gray-900 dark:text-white">
                      Global Headquarters<br />
                      Remote-First Company
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F9D96A] to-[#EFB81A] rounded-xl p-6">
              <h3 className="text-white mb-4">Quick Response Times</h3>
              <p className="text-white/90 text-sm mb-4">
                We typically respond to all inquiries within 24-48 hours during business days.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-sm text-white/80 mb-1">Average Response Time</div>
                <div className="text-2xl text-white">~18 hours</div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white mb-4">Frequently Asked</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <button 
                    onClick={() => onNavigate('advertise')}
                    className="text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors text-left"
                  >
                    → Advertising opportunities
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('careers')}
                    className="text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors text-left"
                  >
                    → Career opportunities
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('submit-story')}
                    className="text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors text-left"
                  >
                    → Submit founder story
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('submit-story')}
                    className="text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors text-left"
                  >
                    → Submit an event
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
