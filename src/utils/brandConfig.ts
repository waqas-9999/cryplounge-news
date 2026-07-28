/**
 * CrypLounge Brand Identity Configuration
 * Based on official brand guidelines v1.0
 */

export const BRAND_CONFIG = {
  // Brand Name
  name: 'CrypLounge',
  tagline: 'Your Crypto News & Learning Hub',
  
  // Brand Colors (from brand guide)
  colors: {
    primary: '#FFD200',      // Brand Yellow (Primary CTA, buttons, icons)
    accent: '#F1EFA',        // Accent color (light backgrounds)
    white: '#FFFFFF',        // Brand White
    surface: '#E9EBE5',      // Surface (light mode)
    surfaceDark: '#0D0D0E',  // Surface (dark mode)
    
    // Legacy aliases for backward compatibility
    yellow: '#FFD200',
    softYellow: '#F1EFA'
  },
  
  // Typography (from brand guide)
  fonts: {
    primary: 'DM Sans',      // Primary font
    secondary: 'Inter',      // Secondary font
    optional: 'JetBrains Mono' // Optional mono font
  },
  
  // Brand personality
  personality: {
    traits: ['Tech-forward', 'Precise', 'Energetic'],
    tone: ['Neutral', 'Lean', 'Minimalist']
  },
  
  // Social media
  social: {
    twitter: 'https://twitter.com/cryplounge',
    telegram: 'https://t.me/cryplounge'
  },
  
  // SEO defaults
  seo: {
    siteName: 'CrypLounge',
    defaultTitle: 'CrypLounge - Latest Cryptocurrency News & Blockchain Insights',
    defaultDescription: 'Your trusted source for cryptocurrency news covering finance, technology, geopolitics, and business. Stay updated with Bitcoin, Ethereum, and blockchain innovations.',
    keywords: ['cryptocurrency', 'blockchain', 'bitcoin', 'ethereum', 'crypto news', 'defi', 'web3']
  }
} as const;

// Utility function to get brand color with dark mode variant
export function getBrandColor(colorName: keyof typeof BRAND_CONFIG.colors, isDark: boolean = false): string {
  const color = BRAND_CONFIG.colors[colorName];
  if (isDark && colorName === 'primary') {
    return `${color}/20`; // 20% opacity for dark mode
  }
  return color;
}
