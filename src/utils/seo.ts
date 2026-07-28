/**
 * SEO Utility Functions for CrypLounge
 * Comprehensive SEO optimization with meta tags, Open Graph, Twitter Cards, and JSON-LD structured data
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noindex?: boolean;
  nofollow?: boolean;
}

export interface StructuredDataArticle {
  '@context': 'https://schema.org';
  '@type': 'Article' | 'NewsArticle' | 'BlogPosting';
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage?: {
    '@type': 'WebPage';
    '@id': string;
  };
}

export interface StructuredDataCourse {
  '@context': 'https://schema.org';
  '@type': 'Course';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization';
    name: string;
    sameAs: string;
  };
  hasCourseInstance?: {
    '@type': 'CourseInstance';
    courseMode: string;
    courseWorkload?: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    ratingCount: number;
  };
}

export interface StructuredDataEvent {
  '@context': 'https://schema.org';
  '@type': 'Event';
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: {
    '@type': 'Place';
    name: string;
    address?: string;
  };
  organizer?: {
    '@type': 'Organization';
    name: string;
    url?: string;
  };
  image?: string;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}

export interface StructuredDataPerson {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  description?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
  sameAs?: string[];
}

export interface StructuredDataOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  description?: string;
  url: string;
  logo: {
    '@type': 'ImageObject';
    url: string;
  };
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface StructuredDataBreadcrumb {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

// Site-wide constants
export const SITE_NAME = 'CrypLounge';
export const SITE_DESCRIPTION = 'Your comprehensive cryptocurrency news and learning platform. Stay updated with the latest crypto news, market insights, blockchain education, and web3 innovations.';
export const SITE_URL = 'https://cryplounge.com';
export const SITE_LOGO = `${SITE_URL}/logo.png`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;
export const TWITTER_HANDLE = '@CrypLounge';

/**
 * Generate comprehensive SEO meta tags
 */
export function generateSEOTags(config: SEOConfig): string {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
    twitterCard = 'summary_large_image',
    article,
    noindex = false,
    nofollow = false,
  } = config;

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical || SITE_URL;

  const metaTags: string[] = [
    `<title>${fullTitle}</title>`,
    `<meta name="description" content="${description}" />`,
  ];

  // Keywords
  if (keywords.length > 0) {
    metaTags.push(`<meta name="keywords" content="${keywords.join(', ')}" />`);
  }

  // Robots
  const robotsContent: string[] = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length > 0) {
    metaTags.push(`<meta name="robots" content="${robotsContent.join(', ')}" />`);
  }

  // Canonical URL
  metaTags.push(`<link rel="canonical" href="${canonicalUrl}" />`);

  // Open Graph
  metaTags.push(
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:title" content="${fullTitle}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:image:alt" content="${title}" />`
  );

  // Article-specific Open Graph
  if (article && ogType === 'article') {
    if (article.publishedTime) {
      metaTags.push(`<meta property="article:published_time" content="${article.publishedTime}" />`);
    }
    if (article.modifiedTime) {
      metaTags.push(`<meta property="article:modified_time" content="${article.modifiedTime}" />`);
    }
    if (article.author) {
      metaTags.push(`<meta property="article:author" content="${article.author}" />`);
    }
    if (article.section) {
      metaTags.push(`<meta property="article:section" content="${article.section}" />`);
    }
    if (article.tags) {
      article.tags.forEach(tag => {
        metaTags.push(`<meta property="article:tag" content="${tag}" />`);
      });
    }
  }

  // Twitter Card
  metaTags.push(
    `<meta name="twitter:card" content="${twitterCard}" />`,
    `<meta name="twitter:site" content="${TWITTER_HANDLE}" />`,
    `<meta name="twitter:title" content="${fullTitle}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`
  );

  return metaTags.join('\n  ');
}

/**
 * Generate JSON-LD structured data for articles
 */
export function generateArticleStructuredData(data: Partial<StructuredDataArticle>): StructuredDataArticle {
  return {
    '@context': 'https://schema.org',
    '@type': data['@type'] || 'Article',
    headline: data.headline || '',
    description: data.description || '',
    image: data.image || DEFAULT_OG_IMAGE,
    datePublished: data.datePublished || new Date().toISOString(),
    dateModified: data.dateModified || new Date().toISOString(),
    author: data.author || {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: SITE_LOGO,
      },
    },
    mainEntityOfPage: data.mainEntityOfPage || {
      '@type': 'WebPage',
      '@id': SITE_URL,
    },
  };
}

/**
 * Generate JSON-LD structured data for courses
 */
export function generateCourseStructuredData(data: Partial<StructuredDataCourse>): StructuredDataCourse {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: data.name || '',
    description: data.description || '',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    hasCourseInstance: data.hasCourseInstance,
    aggregateRating: data.aggregateRating,
  };
}

/**
 * Generate JSON-LD structured data for events
 */
export function generateEventStructuredData(data: Partial<StructuredDataEvent>): StructuredDataEvent {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.name || '',
    description: data.description || '',
    startDate: data.startDate || '',
    endDate: data.endDate,
    location: data.location || { '@type': 'Place', name: 'Virtual' },
    organizer: data.organizer,
    image: data.image,
    offers: data.offers,
  };
}

/**
 * Generate JSON-LD structured data for persons (founders)
 */
export function generatePersonStructuredData(data: Partial<StructuredDataPerson>): StructuredDataPerson {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name || '',
    description: data.description,
    image: data.image,
    jobTitle: data.jobTitle,
    worksFor: data.worksFor,
    sameAs: data.sameAs,
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationStructuredData(): StructuredDataOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: SITE_LOGO,
    },
    sameAs: [
      'https://twitter.com/CrypLounge',
      'https://linkedin.com/company/cryplounge',
      'https://github.com/cryplounge',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@cryplounge.com',
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]): StructuredDataBreadcrumb {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate SEO-friendly URL slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get page-specific SEO configuration
 */
export function getPageSEO(page: string, params?: Record<string, string>): SEOConfig {
  // Home page
  if (page === 'home') {
    return {
      title: 'CrypLounge - Cryptocurrency News, Market Insights & Blockchain Education',
      description: SITE_DESCRIPTION,
      keywords: ['cryptocurrency', 'crypto news', 'blockchain', 'bitcoin', 'ethereum', 'defi', 'nft', 'web3', 'crypto education', 'market analysis'],
      canonical: SITE_URL,
      ogType: 'website',
    };
  }

  // News pages
  if (page.startsWith('news/')) {
    const category = params?.category || '';
    const categoryNames: Record<string, string> = {
      finance: 'Finance',
      tech: 'Technology',
      policy: 'Policy & Regulation',
      investment: 'Investment',
      blockchain: 'Blockchain',
      defi: 'DeFi',
      nfts: 'NFTs',
      gaming: 'Gaming',
      exchanges: 'Exchanges',
      startups: 'Startups',
      'web3-ai': 'Web3 & AI',
      'security-hacks': 'Security & Hacks',
    };

    return {
      title: `${categoryNames[category] || 'News'} - Latest Cryptocurrency News`,
      description: `Stay updated with the latest ${categoryNames[category]?.toLowerCase() || 'cryptocurrency'} news, analysis, and insights from the crypto world.`,
      keywords: ['crypto news', category, 'cryptocurrency', 'blockchain news', 'latest updates'],
      canonical: `${SITE_URL}/news/${category}`,
      ogType: 'website',
    };
  }

  // Market pages
  if (page.startsWith('market')) {
    return {
      title: 'Cryptocurrency Market Data - Live Prices & Analysis',
      description: 'Track real-time cryptocurrency prices, market cap, trading volume, and comprehensive market analysis across multiple blockchain ecosystems.',
      keywords: ['crypto market', 'cryptocurrency prices', 'live crypto prices', 'market cap', 'trading volume', 'crypto analysis'],
      canonical: `${SITE_URL}/market`,
      ogType: 'website',
    };
  }

  // Learn pages
  if (page.startsWith('learn')) {
    return {
      title: 'Learn Cryptocurrency & Blockchain - Free Crypto Education',
      description: 'Comprehensive cryptocurrency and blockchain education platform. Learn about DeFi, NFTs, protocols, and ecosystem-specific knowledge with hands-on courses.',
      keywords: ['crypto education', 'blockchain learning', 'learn cryptocurrency', 'defi tutorial', 'nft guide', 'web3 courses'],
      canonical: `${SITE_URL}/learn`,
      ogType: 'website',
    };
  }

  // Founders pages
  if (page.startsWith('founders')) {
    return {
      title: 'Crypto Founders & Innovators Directory',
      description: 'Discover the visionaries behind leading cryptocurrency projects, blockchain startups, and web3 innovations.',
      keywords: ['crypto founders', 'blockchain entrepreneurs', 'web3 innovators', 'cryptocurrency leaders'],
      canonical: `${SITE_URL}/founders`,
      ogType: 'website',
    };
  }

  // Events pages
  if (page.startsWith('events')) {
    return {
      title: 'Cryptocurrency Events & Conferences',
      description: 'Discover upcoming cryptocurrency conferences, blockchain events, web3 meetups, and industry gatherings worldwide.',
      keywords: ['crypto events', 'blockchain conferences', 'web3 meetups', 'cryptocurrency summit'],
      canonical: `${SITE_URL}/events`,
      ogType: 'website',
    };
  }

  // Default
  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    canonical: SITE_URL,
    ogType: 'website',
  };
}

/**
 * Update document head with SEO tags
 */
export function updateDocumentHead(config: SEOConfig, structuredData?: any) {
  // Update title
  document.title = config.title.includes(SITE_NAME) ? config.title : `${config.title} | ${SITE_NAME}`;

  // Update or create meta tags
  const updateMetaTag = (name: string, content: string, isProperty = false) => {
    const attribute = isProperty ? 'property' : 'name';
    let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  // Basic meta tags
  updateMetaTag('description', config.description);
  
  if (config.keywords && config.keywords.length > 0) {
    updateMetaTag('keywords', config.keywords.join(', '));
  }

  // Robots
  if (config.noindex || config.nofollow) {
    const robotsContent: string[] = [];
    if (config.noindex) robotsContent.push('noindex');
    if (config.nofollow) robotsContent.push('nofollow');
    updateMetaTag('robots', robotsContent.join(', '));
  }

  // Open Graph
  updateMetaTag('og:type', config.ogType || 'website', true);
  updateMetaTag('og:title', config.title.includes(SITE_NAME) ? config.title : `${config.title} | ${SITE_NAME}`, true);
  updateMetaTag('og:description', config.description, true);
  updateMetaTag('og:url', config.canonical || SITE_URL, true);
  updateMetaTag('og:site_name', SITE_NAME, true);
  updateMetaTag('og:image', config.ogImage || DEFAULT_OG_IMAGE, true);

  // Twitter Card
  updateMetaTag('twitter:card', config.twitterCard || 'summary_large_image');
  updateMetaTag('twitter:site', TWITTER_HANDLE);
  updateMetaTag('twitter:title', config.title.includes(SITE_NAME) ? config.title : `${config.title} | ${SITE_NAME}`);
  updateMetaTag('twitter:description', config.description);
  updateMetaTag('twitter:image', config.ogImage || DEFAULT_OG_IMAGE);

  // Canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', config.canonical || SITE_URL);

  // Structured data
  if (structuredData) {
    let scriptElement = document.querySelector('script[type="application/ld+json"]');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(structuredData);
  }
}
