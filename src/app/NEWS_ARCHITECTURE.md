# CrypLounge News Section - Architecture Overview

## Complete Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER (All Pages)                       │
│  Logo | News ▼ | Market | Learn | Research | Founder | Events   │
│         ├─ Finance                                               │
│         ├─ Tech                                                  │
│         ├─ Policy                                                │
│         ├─ Investment                                            │
│         ├─ Blockchain                                            │
│         ├─ DeFi                                                  │
│         ├─ NFTs                                                  │
│         ├─ Gaming                                                │
│         ├─ Exchanges                                             │
│         ├─ Startups                                              │
│         ├─ Web3 & AI                                             │
│         └─ Security & Hacks                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CategoryPage.tsx                              │
│                  /news/{category}                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────┐  ┌──────────────────┐  │
│  │  [Yellow Badge: Finance News]      │  │   TRENDING       │  │
│  │  Breaking: Major Developments...   │  ├──────────────────┤  │
│  │  #Finance #News #Crypto            │  │ • Article 1      │  │
│  │  [Read article] →                  │  │ • Article 2      │  │
│  │  [HERO IMAGE]                      │  │ • Article 3      │  │
│  └────────────────────────────────────┘  └──────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ LATEST IN FINANCE                                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • Revolutionary Update [THUMB] → Click                   │  │
│  │ • Major Growth Prediction [THUMB] → Click                │  │
│  │ • Industry Leaders Conference [THUMB] → Click            │  │
│  │ • Adoption Report [THUMB] → Click                        │  │
│  │ • Investment Allocation [THUMB] → Click                  │  │
│  └──────────────────────────────────────────────────────────┘  ��
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ MORE FINANCE ARTICLES                                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ [Card 1] [Card 2] [Card 3] [Card 4]                     │  │
│  │ [Card 5] [Card 6] [Card 7] [Card 8]                     │  │
│  │         [◀] [1] [2] [3] [▶]                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Click any article card
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ArticleDetailPage.tsx (STICKY TOP BAR)              │
│  [◀ Back]  Article Title...  [♥ 14] [💬 2]                     │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                /news/{category}/{article-slug}                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────┐  ┌──────────────────┐  │
│  │ Blockchain News • 4 hours ago      │  │ RELATED ARTICLES │  │
│  │                                    │  ├──────────────────┤  │
│  │ Over 65% of Crypto-Related         │  │ Article 1 [IMG]  │  │
│  │ Tweets and 84% of Conversations    │  │ Article 2 [IMG]  │  │
│  │ on Reddit Were Positive in 2023    │  │ Article 3 [IMG]  │  │
│  │                                    │  │ Article 4 [IMG]  │  │
│  │ #Ethereum #Analytics               │  │                  │  │
│  │                                    │  │ BEST OF THE MONT │  │
│  │ [🐦] [📘] [📷] [↗]                │  ├──────────────────┤  │
│  │                                    │  │ Article 5 [IMG]  │  │
│  │ [FEATURED HERO IMAGE]              │  │                  │  │
│  │                                    │  └──────────────────┘  │
│  │ Pseudonymous analyst Pentoshi      │                        │
│  │ tells his 727,600 followers...     │                        │
│  │                                    │                        │
│  │ Earlier this year, multiple asset  │                        │
│  │ management firms including...      │                        │
│  │                                    │                        │
│  │ ┌────────────────────────────────┐ │                        │
│  │ │ "We've been bull tweeting the  │ │                        │
│  │ │ BTC ETF since $25,000-$28,000. │ │                        │
│  │ │ Soon, we get to do this all    │ │                        │
│  │ │ again with the ETH ETF..."     │ │                        │
│  │ └────────────────────────────────┘ │                        │
│  │                                    │                        │
│  │ ### Pentoshi is 🚀                 │                        │
│  │                                    │                        │
│  │ Pentoshi is not the only crypto    │                        │
│  │ strategist who believes 2024...    │                        │
│  │                                    │                        │
│  │ [CHART/IMAGE]                      │                        │
│  │                                    │                        │
│  │ ### Pentoshi is not the only...    │                        │
│  │                                    │                        │
│  │ More article content here...       │                        │
│  │                                    │                        │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ [◀ Previous]              [Next ▶]                   │ │  │
│  │ │ Over 65% of Crypto...     STX Price Prediction...    │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────┘                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [MORE NEWS]                                              │  │
│  │ [Ethereum] [NFT] [DeFi] [Altcoin] [Blockchain]...       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 💬 Comments (3)                                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ [Join the discussion...]                                 │  │
│  │                                          [Post Comment]   │  │
│  │                                                          │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ [SC] Sarah Chen • 2 hours ago                      │  │  │
│  │ │ Great article! This really helped me understand... │  │  │
│  │ │ [👍 24] [↩ Reply]                                  │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │ ┌─────────────────────────────────���──────────────────┐  │  │
│  │ │ [MR] Michael Rodriguez • 5 hours ago               │  │  │
│  │ │ Could you elaborate more on the technical...       │  │  │
│  │ │ [👍 15] [↩ Reply]                                  │  │  │
│  │ │   ┌──────────────────────────────────────────────┐ │  │  │
│  │ │   │ [AD] Admin • 4 hours ago                     │ │  │  │
│  │ │   │ Thanks for the feedback! We'll be...         │ │  │  │
│  │ │   │ [👍 8]                                       │ │  │  │
│  │ │   └──────────────────────────────────────────────┘ │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ [ET] Emma Thompson • 1 day ago                     │  │  │
│  │ │ Bookmarked for future reference. The step-by...    │  │  │
│  │ │ [👍 32] [↩ Reply]                                  │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App.tsx
├── ThemeProvider
│   ├── Header (with News dropdown)
│   │   └── News Categories (12 items)
│   │
│   ├── CategoryPage (/news/{category})
│   │   ├── Category Header Badge
│   │   ├── Featured Article Card
│   │   │   └── Read article button → Navigate
│   │   ├── Latest Articles Section
│   │   │   └── LatestNewsCard (5x) → Navigate
│   │   ├── Trending Sidebar
│   │   │   └── Article Cards (3x) → Navigate
│   │   └── More Articles Grid
│   │       └── TrendingCard (8x) → Navigate
│   │
│   ├── ArticleDetailPage (/news/{category}/{slug})
│   │   ├── Sticky Top Bar
│   │   │   ├── Back Button
│   │   │   ├── Article Title
│   │   │   ├── Like Counter (interactive)
│   │   │   └── Comment Counter
│   │   ├── Main Content (2/3)
│   │   │   ├── Article Metadata
│   │   │   ├── Headline
│   │   │   ├── Tags
│   │   │   ├── Social Share Buttons
│   │   │   ├── Hero Image
│   │   │   ├── Article Body
│   │   │   │   ├── Paragraphs
│   │   │   │   ├── Block Quotes
│   │   │   │   ├── Subheadings
│   │   │   │   └── Images/Charts
│   │   │   └── Prev/Next Navigation
│   │   ├── Sidebar (1/3)
│   │   │   ├── Related Articles (4x)
│   │   │   └── Best of Month Section
│   │   ├── More News Tags
│   │   └── CommentSection
│   │       ├── Comment Input Form
│   │       ├── Comment List (3x)
│   │       │   ├── Comment Avatar
│   │       │   ├── Comment Content
│   │       │   ├── Like Button
│   │       │   ├── Reply Button
│   │       ���   └── Nested Replies
│   │       └── Reply Forms (toggle)
│   │
│   └── Footer
```

## Data Flow

### Navigation Flow
```
User clicks category in header
    ↓
Header.onNavigate('news/blockchain')
    ↓
App.handleNavigate updates currentPage state
    ↓
App.renderPage matches route → CategoryPage
    ↓
User clicks article card
    ↓
CategoryPage.onNavigate('news/blockchain/article-slug')
    ↓
App.handleNavigate updates currentPage state
    ↓
App.renderPage matches route → ArticleDetailPage
```

### State Management
```
ThemeContext
├── theme: 'light' | 'dark'
└── toggleTheme()

ArticleDetailPage
├── likes: number (useState)
├── isLiked: boolean (useState)
└── toggleLike()

CommentSection
├── newComment: string (useState)
├── showReply: string | null (useState)
└── comments: Comment[] (default data)
```

## File Structure

```
/
├── App.tsx                          # Main routing logic
├── contexts/
│   └── ThemeContext.tsx             # Dark/light mode provider
├── components/
│   ├── Header.tsx                   # Navigation with News dropdown
│   ├── Footer.tsx                   # Footer
│   ├── LatestNewsCard.tsx           # List-style article card
│   ├── TrendingCard.tsx             # Grid-style article card
│   └── CommentSection.tsx           # Comments with replies
├── pages/
│   ├── HomePage.tsx                 # Landing page
│   ├── CategoryPage.tsx             # News category listing
│   └── ArticleDetailPage.tsx        # Full article view
└── styles/
    └── globals.css                  # Dark mode color tokens
```

## Color System (Dark Mode)

```css
/* Background Layers */
--bg-primary: #0F0F10;      /* Main page background */
--bg-secondary: #1E1E20;    /* Cards, content areas */
--bg-tertiary: #161618;     /* Navigation bar */
--bg-input: #202225;        /* Form inputs */

/* Text Layers */
--text-primary: #F3F3F5;    /* Headings, main text */
--text-secondary: #A0A0A5;  /* Descriptions, metadata */
--text-muted: #6B6B70;      /* Disabled, placeholder */

/* Border Layers */
--border-subtle: rgba(255,255,255,0.08);
--border-medium: rgba(255,255,255,0.12);
--border-strong: rgba(255,255,255,0.2);

/* Accent - Yellow System */
--accent-text: #FACC15;           /* yellow-400 */
--accent-bg: rgba(250,204,21,0.2);
--accent-border: rgba(250,204,21,0.3);
--accent-glow: rgba(250,204,21,0.1);
```

## Responsive Breakpoints

```
Mobile:   < 768px   (sm)
Tablet:   768-1024px (md-lg)
Desktop:  > 1024px  (lg+)

max-width: 1400px (content container)
```

## API / Data Structure

### Article Interface
```typescript
interface Article {
  id: string;
  category: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  timestamp: string;
  image: string;
  tags: string[];
  likes: number;
  comments: number;
}
```

### Comment Interface
```typescript
interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}
```

## Performance Considerations

- ✅ Images loaded via ImageWithFallback (fallback support)
- ✅ Smooth scrolling with `scroll-behavior: smooth`
- ✅ Sticky positioning optimized with `position: sticky`
- ✅ Transitions use transform/opacity (GPU accelerated)
- ✅ Dark mode uses CSS variables (no JS overhead)
- ✅ Component state isolated (no unnecessary re-renders)

## Accessibility

- ✅ Semantic HTML (main, section, article, nav)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Focus rings visible (yellow in dark mode)
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Touch targets min 44x44px (mobile)
