# CrypLounge News Section - Testing Guide

## How to Test the Complete News Flow

### Starting Points

#### Option 1: From Header Navigation
1. Click the "News" dropdown in the header
2. Select any category:
   - Finance
   - Tech
   - Policy
   - Investment
   - Blockchain
   - DeFi
   - NFTs
   - Gaming
   - Exchanges
   - Startups
   - Web3 & AI
   - Security & Hacks

#### Option 2: Direct URL Navigation
Navigate directly to any category:
- `/news/blockchain`
- `/news/finance`
- `/news/tech`
- etc.

---

## Test Flow 1: Category Page → Article Detail

### Step 1: On Category Page
You should see:
- ✅ Yellow gradient category header badge
- ✅ Featured article card with large headline
- ✅ "Read article" button on featured card
- ✅ "Latest in Category" section with 5 article cards
- ✅ Sidebar "Trending" section with 3 cards
- ✅ "More Articles" grid at bottom (8 cards)
- ✅ Pagination controls

**Test Actions**:
- Click "Read article" button → Should navigate to article detail page
- Click any article card in "Latest" section → Should navigate to article detail
- Click any trending card in sidebar → Should navigate to article detail
- Click any card in "More Articles" grid → Should navigate to article detail

### Step 2: On Article Detail Page
You should see:

**Top Sticky Bar**:
- ✅ Back button (← Back)
- ✅ Article title (centered, truncated)
- ✅ Heart icon with like count (14)
- ✅ Comment icon with count (2)

**Main Content Area**:
- ✅ Category badge and timestamp
- ✅ Large article headline
- ✅ Tags (#Ethereum, #Analytics)
- ✅ Social share buttons (Twitter, Facebook, Instagram, Share)
- ✅ Featured hero image
- ✅ Article body paragraphs
- ✅ Block quote with yellow/blue left border
- ✅ Subheadings
- ✅ Additional chart/image placeholder
- ✅ More body content

**Right Sidebar**:
- ✅ 4 related articles with thumbnails
- ✅ "BEST OF THE MONT" badge
- ✅ Best of month articles

**Bottom Sections**:
- ✅ Previous/Next article navigation
- ✅ "MORE NEWS" badge
- ✅ Category filter pill buttons
- ✅ Comments section

**Test Actions**:
- Click "Back" button → Should return to category page
- Click heart icon → Like count should increment/decrement
- Hover over social buttons → Should see hover effect
- Hover over related articles → Should see hover effect
- Click Previous/Next buttons → Should navigate between articles

---

## Test Flow 2: Comments Interaction

### On Article Detail Page, scroll to Comments Section

You should see:
- ✅ "Comments (3)" header with message icon
- ✅ Comment input textarea
- ✅ "Post Comment" button
- ✅ 3 existing comments displayed
- ✅ Each comment has avatar, username, timestamp
- ✅ Like button with count on each comment
- ✅ Reply button on each comment

**Test Actions**:

1. **Test Comment Input**:
   - Click in textarea
   - Type some text
   - See focus ring (blue in light mode, yellow in dark mode)

2. **Test Reply Button**:
   - Click "Reply" on the second comment
   - Reply form should slide in below comment
   - Should see reply textarea
   - Should see "Cancel" and "Reply" buttons
   - Click "Cancel" → Reply form should close

3. **Test Like Button**:
   - Hover over thumbs up icon
   - Should see blue hover (light) or yellow hover (dark)
   - Should see like count next to icon

4. **Test Nested Replies**:
   - Second comment should have 1 reply visible
   - Reply should be indented with left border
   - Reply should have yellow avatar background
   - Reply should show "Admin" as author

---

## Test Flow 3: Dark Mode Toggle

### Starting on Category Page

1. **Click theme toggle** (sun/moon icon in header)

2. **Category Page Dark Mode Check**:
   - ✅ Background: Deep gray (#0F0F10)
   - ✅ Cards: Neutral gray (#1E1E20)
   - ✅ Category badge: Yellow accent with transparency
   - ✅ Text: Light gray (#F3F3F5)
   - ✅ Featured hero: Yellow gradient preserved
   - ✅ Borders: Subtle white transparency
   - ✅ Hover effects: Yellow glow and borders

3. **Navigate to Article Detail**

4. **Article Detail Dark Mode Check**:
   - ✅ Sticky bar: Dark gray (#161618)
   - ✅ Back button: Light text with yellow hover
   - ✅ Heart icon: Red when liked
   - ✅ Main content cards: #1E1E20
   - ✅ Block quote: Left yellow border
   - ✅ Category badges: Yellow text
   - ✅ Social buttons: Dark with white borders
   - ✅ Related articles: Hover yellow effect
   - ✅ "MORE NEWS" pills: Yellow hover

5. **Comments Section Dark Mode Check**:
   - ✅ Comment card: #1E1E20 background
   - ✅ Textarea: #202225 background
   - ✅ Text: Light gray
   - ✅ Avatars: Transparent blue/yellow backgrounds
   - ✅ Buttons: Yellow background
   - ✅ Reply borders: Subtle white transparency

---

## Test Flow 4: Responsive Design

### Desktop (> 1024px)
- Category page: 3-column layout (2/3 content + 1/3 sidebar)
- Article detail: 3-column layout (2/3 content + 1/3 sidebar)
- More articles grid: 4 columns
- Full navigation bar visible

### Tablet (768px - 1024px)
- Category page: Sidebar moves below content
- Article detail: Sidebar moves below content
- More articles grid: 3 columns
- Navigation bar visible

### Mobile (< 768px)
- Single column layout throughout
- Sticky bar compact with icons only
- More articles grid: 1 column
- Hamburger menu for navigation
- Smaller images and spacing

---

## Test Flow 5: All Categories

Test each category to ensure consistent behavior:

1. `/news/blockchain` → BlockchainNews
2. `/news/finance` → Finance News
3. `/news/tech` → Tech News
4. `/news/policy` → Policy News
5. `/news/investment` → Investment News
6. `/news/defi` → DeFi News
7. `/news/nfts` → NFTs News
8. `/news/gaming` → Gaming News
9. `/news/exchanges` → Exchanges News
10. `/news/startups` → Startups News
11. `/news/web3-ai` → Web3 & AI News
12. `/news/security-hacks` → Security & Hacks News

Each should:
- ✅ Display category name in badge
- ✅ Show category-specific content
- ✅ Navigate to article detail when clicked
- ✅ Maintain consistent styling

---

## Test Flow 6: Navigation Patterns

### Test Back Navigation
1. Home → News/Blockchain → Article Detail
2. Click "Back" button → Should return to News/Blockchain
3. Click browser back → Should work correctly

### Test Deep Linking
1. Paste `/news/blockchain/expert-analysis` directly in browser
2. Should load article detail page correctly
3. Should be able to click "Back" to return to category

### Test Previous/Next Navigation
1. On article detail page
2. Click "Next" button
3. Should navigate to next article (URL changes)
4. Content updates
5. Click "Previous" button
6. Should navigate to previous article

---

## Expected Color Values (Dark Mode)

Use browser DevTools to verify:

```css
/* Backgrounds */
body: #0F0F10
cards: #1E1E20
nav-bar: #161618
inputs: #202225

/* Text */
primary: #F3F3F5
secondary: #A0A0A5
muted: rgba(255,255,255,0.5)

/* Borders */
subtle: rgba(255,255,255,0.08)
medium: rgba(255,255,255,0.12)

/* Accents */
yellow-text: rgb(250, 204, 21) // yellow-400
yellow-bg: rgba(250, 204, 21, 0.2)
yellow-border: rgba(250, 204, 21, 0.3)
```

---

## Common Issues to Check

### Issue 1: Navigation Not Working
- ✅ Verify `onNavigate` prop is passed to CategoryPage
- ✅ Check `handleNavigate` function in App.tsx
- ✅ Ensure route matching regex is correct

### Issue 2: Dark Mode Colors Wrong
- ✅ Check `dark:` prefix on all Tailwind classes
- ✅ Verify ThemeProvider wraps entire app
- ✅ Confirm no hard-coded light mode colors

### Issue 3: Comments Not Interactive
- ✅ Check React state for `showReply`
- ✅ Verify onClick handlers on buttons
- ✅ Test in both light and dark mode

### Issue 4: Images Not Loading
- ✅ Confirm Unsplash URLs are valid
- ✅ Check ImageWithFallback component
- ✅ Verify image props passed correctly

---

## Success Criteria

✅ All 12 news categories accessible from header  
✅ Category pages display correctly in light & dark mode  
✅ All article cards are clickable and navigate properly  
✅ Article detail page loads with all sections  
✅ Sticky top bar remains visible on scroll  
✅ Comments section displays with proper styling  
✅ Like and reply buttons are interactive  
✅ Previous/Next navigation works  
✅ Dark mode uses refined neutral grays  
✅ Yellow accents consistent throughout  
✅ Responsive design works on all breakpoints  
✅ Back button returns to correct category page  

---

## Need Help?

Refer to:
- `/NEWS_FLOW_COMPLETE.md` - Complete implementation details
- `/NEWS_SECTION_DESIGN.md` - Design specifications
- `/DARK_MODE_UPDATES.md` - Color mapping reference
