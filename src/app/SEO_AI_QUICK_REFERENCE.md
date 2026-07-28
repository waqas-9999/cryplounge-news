# CrypLounge - SEO & AI Quick Reference Guide

## 🚀 Quick Start

### Adding SEO to a New Page

```typescript
import { SEOHead } from '../components/SEOHead';
import { getPageSEO } from '../utils/seo';

function MyPage() {
  const seoConfig = getPageSEO('your-page-path');
  
  return (
    <>
      <SEOHead config={seoConfig} />
      {/* Your page content */}
    </>
  );
}
```

### Adding Structured Data

```typescript
import { generateArticleStructuredData } from '../utils/seo';

const structuredData = generateArticleStructuredData({
  headline: 'Bitcoin Reaches New ATH',
  description: 'Bitcoin price analysis...',
  datePublished: '2025-11-12T10:00:00Z',
  author: { '@type': 'Person', name: 'John Doe' },
});

<SEOHead config={seoConfig} structuredData={structuredData} />
```

---

## 🎯 SEO Checklist for Every Page

- [ ] Unique page title (50-60 characters)
- [ ] Meta description (150-160 characters)
- [ ] Keywords array (5-10 relevant keywords)
- [ ] Canonical URL
- [ ] Open Graph image (1200x630px recommended)
- [ ] Structured data (if applicable)
- [ ] Breadcrumb navigation (if nested)

---

## 🤖 AI Features

### Track User Interest

```typescript
import { recommendationEngine } from '../utils/ai-optimization';

// When user views content
recommendationEngine.updateInterest('category', 'defi', 0.1);
recommendationEngine.updateInterest('ecosystem', 'ethereum', 0.15);
```

### Get Personalized Recommendations

```typescript
const recommendations = recommendationEngine.getRecommendations(
  allCourses,
  10 // number of items
);
```

### Enable Smart Prefetching

```typescript
import { smartPrefetcher } from '../utils/ai-optimization';

// Record navigation (automatic in App.tsx)
smartPrefetcher.recordNavigation('home', 'news/defi');

// Prefetch predicted pages (automatic)
smartPrefetcher.prefetchPredictedPages('news/defi');
```

### Find Similar Content

```typescript
import { similarityEngine } from '../utils/ai-optimization';

const similarArticles = similarityEngine.findSimilar(
  currentArticle,
  allArticles,
  { category: 2, topics: 3, ecosystem: 1.5 }, // weights
  5 // limit
);
```

---

## 📊 Analytics Tracking

### Track Page Views (Automatic)
```typescript
// Automatically tracked in App.tsx on navigation
analytics.trackPageView(page, title, path);
```

### Track User Interactions

```typescript
import { analytics } from '../utils/analytics';

// Button clicks
analytics.trackInteraction('click', 'subscribe-button');

// Searches
analytics.trackSearch('bitcoin', resultsCount);

// Filters
analytics.trackFilter('ecosystem', 'ethereum');

// Conversions
analytics.trackConversion('newsletter-signup', 1);
```

### Track Learning Events

```typescript
// Course enrollment
analytics.trackCourseEnrollment('eth-101', 'Ethereum Basics');

// XP earned
analytics.trackXPEarned('lesson-complete', 50);

// Course completion
analytics.trackCourseCompletion('eth-101', 'Ethereum Basics', 3600);
```

---

## ⚡ Performance Optimization

### Image Optimization

```typescript
import { optimizeImageUrl } from '../utils/performance';

const optimizedUrl = optimizeImageUrl(
  originalUrl,
  800, // width
  80   // quality
);

<img src={optimizedUrl} alt="..." />
```

### Lazy Loading

```typescript
import { LazyLoader } from '../utils/performance';

const loader = new LazyLoader((entry) => {
  const img = entry.target as HTMLImageElement;
  img.src = img.dataset.src!;
});

loader.observe(imageElement);
```

### Caching

```typescript
import { memoryCache, storageCache } from '../utils/performance';

// Memory cache (session-based)
memoryCache.set('key', data, 300000); // 5 minutes
const cached = memoryCache.get('key');

// Storage cache (persistent)
storageCache.set('user-prefs', preferences, 86400000); // 24 hours
const prefs = storageCache.get('user-prefs');
```

### Debounce & Throttle

```typescript
import { debounce, throttle } from '../utils/performance';

// Debounce search (wait for user to stop typing)
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300);

// Throttle scroll (limit execution rate)
const throttledScroll = throttle(() => {
  handleScroll();
}, 100);
```

---

## 🗺️ Routing Reference

### News Routes
```
/news                          → All news
/news/finance                  → Finance category
/news/finance/article-slug     → Article detail
```

### Market Routes
```
/market                              → Market overview
/market/ethereum                     → Ethereum ecosystem
/market/ethereum/defi                → DeFi category
/market/ethereum/defi/uniswap        → Token detail
```

### Learn Routes
```
/learn                                    → Learn hub
/learn/crypto                             → Cryp Learn (global)
/learn/ecosystem                          → Ecosystem hub
/learn/ethereum                           → Ethereum learn
/learn/ethereum/overview                  → Overview
/learn/ethereum/tutorials                 → Tutorials
/learn/ethereum/defi                      → DeFi category
/learn/ethereum/defi/uniswap-basics       → Course detail
/learn/ethereum/projects/uniswap          → Project page
```

### Founders Routes
```
/founders                              → Founders directory
/founders/vitalik-buterin              → Founder profile
/founders/vitalik-buterin/projects/ethereum → Project page
```

### Events Routes
```
/events                    → Events listing
/events/consensus-2025     → Event detail
```

---

## 🎨 Brand Colors

```css
/* Light Mode */
--bg-light: #FFFEF9;
--text-light: #1A1A1C;
--accent: linear-gradient(135deg, #FCD34D, #F59E0B);

/* Dark Mode */
--bg-dark: #0F0F10 to #1A1A1C;
--text-dark: #F5F5F5;
--accent: linear-gradient(135deg, #FCD34D, #F59E0B);
```

---

## 🔍 SEO URL Best Practices

✅ **Good URLs**:
- `/news/defi/uniswap-launches-v4`
- `/learn/ethereum/defi/introduction-to-defi`
- `/founders/vitalik-buterin`

❌ **Bad URLs**:
- `/news/12345`
- `/article?id=abc123`
- `/page.php?cat=news&post=123`

### URL Slug Generation

```typescript
import { generateSlug } from '../utils/seo';

const slug = generateSlug('Bitcoin Reaches $100,000!');
// Result: "bitcoin-reaches-100000"
```

---

## 📈 Performance Metrics

### Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Monitoring (Automatic)
```typescript
// Performance Observer automatically tracks:
// - First Contentful Paint (FCP)
// - Largest Contentful Paint (LCP)
// - First Input Delay (FID)
```

---

## 🛠️ Common Tasks

### 1. Add New News Category
```typescript
// In /utils/routes.ts
export const NEWS_CATEGORIES = [
  // ... existing
  'your-new-category',
];

// In /utils/seo.ts (getPageSEO function)
const categoryNames: Record<string, string> = {
  // ... existing
  'your-new-category': 'Display Name',
};
```

### 2. Add New Ecosystem
```typescript
// In /utils/routes.ts
export const MARKET_ECOSYSTEMS = [
  // ... existing
  'your-ecosystem',
];

export const LEARN_ECOSYSTEMS = MARKET_ECOSYSTEMS;
```

### 3. Add New Category Type
```typescript
// In /utils/routes.ts
export const MARKET_CATEGORIES = [
  // ... existing
  'your-category',
];

export const LEARN_CATEGORIES = MARKET_CATEGORIES;
```

---

## 🐛 Debugging

### Check SEO Tags
```javascript
// In browser console:
console.log(document.title);
console.log(document.querySelector('meta[name="description"]'));
console.log(document.querySelector('script[type="application/ld+json"]'));
```

### Check User Profile
```typescript
import { recommendationEngine } from '../utils/ai-optimization';

const summary = recommendationEngine.getInterestSummary();
console.log('User Interests:', summary);
```

### Check Navigation Patterns
```typescript
import { smartPrefetcher } from '../utils/ai-optimization';

const predictions = smartPrefetcher.getPredictedPages('current-page');
console.log('Predicted next pages:', predictions);
```

### Check Cache Status
```typescript
import { memoryCache, storageCache } from '../utils/performance';

console.log('Memory cache size:', memoryCache.size());
console.log('User profile:', storageCache.get('user_profile'));
```

---

## 📚 File Reference

| File | Purpose | Key Exports |
|------|---------|-------------|
| `/utils/seo.ts` | SEO utilities | `getPageSEO`, `updateDocumentHead`, `generate*StructuredData` |
| `/utils/routes.ts` | Route matching | `RouteMatche`, `*_CATEGORIES`, `*_ECOSYSTEMS` |
| `/utils/analytics.ts` | User tracking | `analytics`, `setupScrollTracking`, `setupClickTracking` |
| `/utils/performance.ts` | Performance | `debounce`, `throttle`, `memoryCache`, `storageCache` |
| `/utils/ai-optimization.ts` | AI features | `recommendationEngine`, `smartPrefetcher`, `similarityEngine` |
| `/components/SEOHead.tsx` | SEO component | `SEOHead` |

---

## 🎯 Pro Tips

1. **Always use SEOHead**: Every page should have unique SEO metadata
2. **Track user interactions**: More data = better AI recommendations
3. **Use structured data**: Helps search engines understand your content
4. **Optimize images**: Always use `optimizeImageUrl` for Unsplash images
5. **Leverage caching**: Don't recompute expensive operations
6. **Monitor analytics**: Check console logs for performance insights
7. **Test mobile**: Theme color and mobile meta tags are important
8. **Keep URLs clean**: Use descriptive, hyphenated slugs

---

## 🚨 Common Mistakes to Avoid

❌ Missing SEOHead component
❌ Duplicate page titles
❌ Generic meta descriptions
❌ Not tracking important interactions
❌ Forgetting to update user interests
❌ Hardcoded image sizes (use optimization)
❌ Not using canonical URLs
❌ Missing structured data for rich results

---

## ✅ Pre-Launch Checklist

- [ ] All pages have unique SEO metadata
- [ ] Structured data implemented for content types
- [ ] Analytics tracking setup
- [ ] User interest tracking enabled
- [ ] Image optimization in place
- [ ] Caching configured
- [ ] Performance monitoring active
- [ ] Mobile optimization complete
- [ ] Accessibility features verified
- [ ] 404 fallback working

---

*For detailed documentation, see: `/OPTIMIZATION_COMPLETE.md`*
