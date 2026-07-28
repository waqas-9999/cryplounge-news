import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  category?: string;
}

export function SEOHead({
  title = 'CrypLounge - Cryptocurrency News & Blockchain Insights',
  description = 'Stay informed with the latest cryptocurrency and blockchain news. Coverage of finance, technology, geopolitics, and business in the digital asset ecosystem.',
  keywords = 'cryptocurrency, blockchain, bitcoin, ethereum, crypto news, DeFi, NFT, Web3, digital assets, crypto finance',
  image = '/og-image.png',
  url = '',
  type = 'website',
  publishedTime,
  author = 'CrypLounge Editorial Team',
  category
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const metaTags: Record<string, string> = {
      'description': description,
      'keywords': keywords,
      
      // Open Graph
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:type': type,
      'og:site_name': 'CrypLounge',
      
      // Twitter Card
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:site': '@cryplounge',
      'twitter:creator': '@cryplounge',
    };

    if (url) {
      metaTags['og:url'] = url;
      metaTags['canonical'] = url;
    }

    if (publishedTime && type === 'article') {
      metaTags['article:published_time'] = publishedTime;
    }

    if (author && type === 'article') {
      metaTags['article:author'] = author;
    }

    if (category && type === 'article') {
      metaTags['article:section'] = category;
    }

    // Update existing or create new meta tags
    Object.entries(metaTags).forEach(([name, content]) => {
      const property = name.startsWith('og:') || name.startsWith('article:') ? 'property' : 'name';
      let meta = document.querySelector(`meta[${property}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(property, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });

    // Add canonical link if URL provided
    if (url) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    }
  }, [title, description, keywords, image, url, type, publishedTime, author, category]);

  return null;
}

export function generateSEO(page: string, params?: any) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cryplounge.com';
  
  const seoData: Record<string, Partial<SEOHeadProps>> = {
    home: {
      title: 'CrypLounge - Latest Cryptocurrency News & Blockchain Insights',
      description: 'Your trusted source for cryptocurrency news covering finance, technology, geopolitics, and business. Stay updated with Bitcoin, Ethereum, DeFi, NFTs and more.',
      keywords: 'cryptocurrency news, blockchain, bitcoin news, ethereum, crypto finance, DeFi, NFT, Web3, digital assets',
      url: baseUrl,
    },
    finance: {
      title: 'Crypto Finance News - Markets, Trading, DeFi | CrypLounge',
      description: 'Latest cryptocurrency finance news including market analysis, trading insights, DeFi updates, and institutional investment trends.',
      keywords: 'crypto finance, bitcoin price, ethereum price, DeFi, crypto trading, digital asset markets, crypto investing',
      url: `${baseUrl}/news/finance`,
      category: 'Finance',
    },
    technology: {
      title: 'Blockchain Technology News - AI, Web3, Innovation | CrypLounge',
      description: 'Breaking blockchain technology news covering AI, Web3, smart contracts, layer 2 solutions, and technological innovations.',
      keywords: 'blockchain technology, Web3, smart contracts, layer 2, crypto AI, blockchain innovation, decentralization',
      url: `${baseUrl}/news/technology`,
      category: 'Technology',
    },
    geopolitics: {
      title: 'Crypto Geopolitics & Regulation News | CrypLounge',
      description: 'Global cryptocurrency regulation, CBDC developments, government policies, and international crypto adoption news.',
      keywords: 'crypto regulation, CBDC, crypto policy, government crypto, international crypto law, crypto adoption',
      url: `${baseUrl}/news/geopolitics`,
      category: 'Geopolitics',
    },
    business: {
      title: 'Crypto Business News - Enterprise, Adoption, Partnerships | CrypLounge',
      description: 'Corporate cryptocurrency adoption, blockchain business partnerships, enterprise solutions, and institutional crypto news.',
      keywords: 'crypto business, enterprise blockchain, corporate crypto, institutional adoption, crypto partnerships',
      url: `${baseUrl}/news/business`,
      category: 'Business',
    },
    about: {
      title: 'About CrypLounge - Your Trusted Crypto News Source',
      description: 'Learn about CrypLounge, our mission to provide accurate cryptocurrency and blockchain news, and our editorial standards.',
      url: `${baseUrl}/about`,
    },
    contact: {
      title: 'Contact CrypLounge - Get in Touch',
      description: 'Contact the CrypLounge team for inquiries, partnerships, press releases, or editorial submissions.',
      url: `${baseUrl}/contact`,
    },
  };

  return seoData[page] || seoData.home;
}
