# CrypLounge Dark Mode Refinement - Color System Update

## Design Philosophy
Dark Mode now uses refined neutral grays with warm undertones instead of navy blue tones, while maintaining the signature yellow gradient accents for brand consistency across both Light and Dark modes.

## Color Mapping Reference

### Background Colors
- `dark:bg-gray-900` → `dark:bg-[#0F0F10]` (Main background - deep neutral gray)
- `dark:bg-gray-800` → `dark:bg-[#1E1E20]` (Cards & primary surfaces)
- `dark:bg-gray-700` → `dark:bg-[#202225]` (Secondary surfaces & hover states)
- `dark:bg-gray-600` → `dark:bg-[#28282C]` (Tertiary surfaces)

### Navigation & Sidebar
- Navigation bar: `dark:bg-[#161618]` (Slate gray tone)
- Sidebar: `dark:bg-[#161618]`

### Borders
- `dark:border-gray-700` → `dark:border-white/[0.08]` (Subtle borders with low contrast)
- `dark:border-gray-600` → `dark:border-white/[0.12]` (Medium contrast borders)

### Text Colors
- `dark:text-gray-200` → `dark:text-[#F3F3F5]` (Primary text - off-white)
- `dark:text-gray-300` → `dark:text-[#E5E5E7]` (Secondary primary text)
- `dark:text-gray-400` → `dark:text-[#A0A0A5]` (Secondary/muted text)
- `dark:text-gray-500` → `dark:text-[#808085]` (Tertiary text)

### Interactive Elements
- `dark:hover:text-blue-400` → `dark:hover:text-yellow-400` (Link hovers - yellow accent)
- `dark:hover:bg-blue-600` → `dark:hover:bg-yellow-500` (Button hovers)
- `dark:focus:ring-blue-500` → `dark:focus:ring-yellow-500` (Focus rings)

### Yellow Accent System (CONSISTENT IN BOTH MODES)
- Badge background: `dark:bg-yellow-500/20` (was `dark:bg-yellow-900/30`)
- Badge text: `dark:text-yellow-300` (was `dark:text-yellow-200`)
- Badge border: `dark:border-yellow-500/30`
- **Hero gradients**: Keep same yellow gradient in both modes
  - `dark:from-yellow-400/20 dark:via-yellow-500/15 dark:to-yellow-600/10`

### Shadow & Glow Effects
- `dark:hover:shadow-gray-900/50` → `dark:hover:shadow-yellow-500/10` (Subtle yellow glow on hover)
- Cards: `dark:shadow-lg` with optional `dark:shadow-yellow-500/10`

## Components Updated

### ✅ Completed
1. **globals.css** - Core color system
2. **Header.tsx** - Navigation bar, dropdowns, search
3. **Footer.tsx** - Footer links, subscribe form, social icons
4. **HeroArticle.tsx** - Hero card with yellow gradient
5. **ArticleCardSmall.tsx** - Small article cards
6. **TrendingCard.tsx** - Trending article cards with images (+ onClick navigation)
7. **RecommendedCard.tsx** - Sidebar recommended cards
8. **LatestNewsCard.tsx** - Latest news list items (+ onClick navigation)
9. **FeaturedNewsSection.tsx** - Featured section with yellow sidebar
10. **LatestLearnSection.tsx** - Latest learn carousel
11. **BestOfMonthSection.tsx** - Best of month grid
12. **ReadersChoiceSection.tsx** - Readers choice with yellow phone mockup
13. **HomePage.tsx** - Home page sections
14. **CategoryPage.tsx** - News category listing pages with full navigation flow
15. **ArticleDetailPage.tsx** - Full article detail page with sidebar, social sharing, prev/next navigation
16. **CommentSection.tsx** - Interactive comments with nested replies, refined dark mode

### 🔄 To Be Updated
- CategoryPage.tsx (All news category pages)
- MarketPage.tsx (Main market page)
- TokenDetailPage.tsx (Token detail pages)
- CategoryMarketPage.tsx (Market category pages)
- EcosystemMarketPage.tsx (Ecosystem market pages)
- EcosystemOverviewPage.tsx
- EcosystemProjectPage.tsx
- LearnPage.tsx
- GlobalLearnPage.tsx
- EcosystemLearnPage.tsx
- EcosystemTutorialsPage.tsx
- ResearchPage.tsx
- FounderStoryPage.tsx
- FounderStoryDetailPage.tsx
- EventsPage.tsx
- FilterBar.tsx
- ShareSaveButtons.tsx
- CommentSection.tsx

## Key Design Principles

1. **Yellow Gradient Consistency**: All yellow gradients (hero cards, badges, highlights) remain the SAME in both Light and Dark modes
2. **Neutral Gray Foundation**: Dark mode uses deep neutral grays (#0F0F10 to #202225) instead of blue-tinted grays
3. **Soft Borders**: Use `white/[0.08]` for subtle, non-distracting borders
4. **Yellow Hover States**: Links and interactive elements use yellow-400 on hover in dark mode
5. **Accessible Contrast**: Primary text uses #F3F3F5, secondary text uses #A0A0A5 for WCAG AA compliance
6. **Consistent Brand Identity**: Both modes should feel like the same visual identity with different tonal depths

## Next Steps

All pages need to be updated following the mapping reference above. The yellow gradient system must be preserved everywhere it appears to maintain brand consistency.
