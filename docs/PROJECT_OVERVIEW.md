# CrypLounge - Complete Project Overview

**Platform:** Cryptocurrency News & Education Platform  
**Status:** Frontend UI complete; NestJS/Prisma backend built; frontend-backend integration in progress  
**Last Updated:** 2026-08-01

---

## 🎯 Executive Summary

CrypLounge is a comprehensive cryptocurrency news and education platform featuring:
- **News Section:** Multi-category crypto news with AI-powered auto-fetch
- **Learn Section:** Global crypto education + ecosystem-specific learning paths
- **Yellow Page:** Founder stories and project profiles
- **Events:** Crypto events calendar with detailed analytics
- **Admin CMS:** Full content management with analytics and user behavior tracking

The platform is built with React, TypeScript, and Tailwind CSS v4.0, featuring complete dark/light mode, XP gamification, referral system, and production-grade security.

---

## 🏗️ Architecture Overview

### **Frontend Architecture**

The frontend is a Next.js 15 (App Router) application under `src/app`, not the
single `App.tsx` router this document originally described:

```
┌─────────────────────────────────────────────────────────────┐
│                       src/app/**                              │
│              (File-system routing, Server Components)         │
└─────────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
    │ Contexts │        │  Views  │        │Components│
    │ (Global  │        │(Route   │        │(Reusable)│
    │  State)  │        │ screens)│        │          │
    └─────────┘        └─────────┘        └──────────┘
         │                   │                   │
    ┌────▼────────────┐ ┌───▼──────────┐  ┌────▼─────┐
    │ - Auth          │ │ - News       │  │ - Header │
    │ - Theme         │ │ - Ecosystem  │  │ - Footer │
    │ - XP            │ │ - Founders   │  │ - Cards  │
    │ - Categories    │ │ - Events     │  │ - Forms  │
    │ - Ecosystems    │ │ - Admin      │  │ - UI Kit │
    └─────────────────┘ └──────────────┘  └──────────┘
```

### **Data Flow**

```
User Interaction
      ↓
UI Components (src/app routes / src/components)
      ↓
Context Providers (Global State)
      ↓
Services (src/services — API client)
      ↓
NestJS API (server/) → PostgreSQL via Prisma
      ↓
Context State Update
      ↓
UI Re-render
```

The backend (`server/`) is a separate NestJS 11 + Prisma + PostgreSQL API,
documented in `server/docs/DEPLOYMENT.md`. It is not mock data — every
content type, auth flow, and the AI agent/webhook layer described later in
this document is a real, running API under `/api/v1`.

**As of this writing, `src/services/*` (e.g. `news.ts`) still reads from
`src/data/*` mock data, not from `server/`'s API.** The data flow diagram
above is the target state, not the current one — wiring the services layer
to the real backend is the main outstanding integration task.

There is also a second, smaller, older backend surface living inside the
frontend app itself: `src/app/api/*` (Next.js Route Handlers for articles
and auth) backed by a separate `prisma/schema.prisma` at the repo root. That
root schema is a strict subset of `server/prisma/schema.prisma` — it has no
roles/permissions, no AI agents, no webhooks, and no analytics tables. This
looks like an earlier, interim implementation that predates `server/` and
should be treated as legacy: new backend work belongs in `server/`, not
`src/app/api/` or the root `prisma/` directory.

---

## 📂 Complete File Structure & Purpose

> ⚠️ **Legacy section.** The page names below (`HomePage.tsx`, `/pages/...`,
> `App.tsx`) describe the original Figma-generated prototype. The real
> frontend uses Next.js App Router file-system routing under `src/app`
> instead — e.g. what's listed here as `CategoryPage.tsx` at
> `/news/{category}` is `src/app/news/[category]/page.tsx`, and
> `NewsListPage.tsx` is `src/app/admin/news/page.tsx`. Treat the tree below
> as a map of *what each screen does*, not as real file paths — check
> `src/app/` and `src/views/` for the current ones.

### **Root Level**

```
/App.tsx
├─ Main application component
├─ Handles all routing logic
├─ Wraps app with context providers
├─ Implements navigation system
└─ Manages route-based analytics

/styles/globals.css
├─ Tailwind CSS v4.0 base styles
├─ Custom typography settings
├─ Dark mode CSS variables
├─ Brand color definitions
└─ Global component styles
```

### **/pages/ - All Page Components**

#### **Public Pages**
```
HomePage.tsx              → Landing page with featured content
SearchPage.tsx            → Universal search across all content
AboutPage.tsx             → About CrypLounge
ContactPage.tsx           → Contact form
CareersPage.tsx          → Career opportunities
AdvertisePage.tsx        → Advertising information
PrivacyPage.tsx          → Privacy policy
TermsPage.tsx            → Terms of service
SubmitStoryPage.tsx      → Submit founder story form
SubmitEventPage.tsx      → Submit event form
```

#### **News Pages**
```
CategoryPage.tsx          
├─ Route: /news/{category}
├─ Displays news by category
├─ Filters: trending, latest, tags
├─ Infinite scroll pagination
└─ SEO-optimized

ArticleDetailPage.tsx     
├─ Route: /news/{category}/{slug}
├─ Full article view
├─ Related articles
├─ Comment section
├─ Share & save functionality
└─ Reading progress tracker
```

#### **Learn Pages**
```
LearnPage.tsx             
├─ Route: /learn
├─ Hub page for all learning
├─ Links to Cryp Learn & Ecosystem Learn
└─ Featured courses

CrypLearnPage.tsx         
├─ Route: /learn/crypto
├─ Global blockchain education
├─ Category filtering
├─ Beginner to advanced courses
└─ Progress tracking

EcosystemLearnPage.tsx    
├─ Route: /learn/{ecosystem}
├─ Ecosystem-specific learning
├─ Technical deep-dives
└─ Project-specific tutorials

EcosystemLearnHubPage.tsx 
├─ Route: /learn/ecosystem
├─ Overview of all ecosystems
└─ Navigation to specific ecosystems

CourseDetailPage.tsx      
├─ Route: /learn/{...}/{courseId}
├─ Full course content
├─ Video/text lessons
├─ Quizzes & assessments
├─ XP rewards on completion
└─ Certificate generation
```

#### **Yellow Page (Founders) Pages**
```
FoundersPage.tsx          
├─ Route: /yellow-page
├─ Grid of founder stories
├─ Filter by category/ecosystem
└─ Featured founders

FounderDetailPage.tsx     
├─ Route: /yellow-page/{founderId}
├─ Full founder biography
├─ Project highlights
├─ Timeline & achievements
└─ Related projects

FounderProjectPage.tsx    
├─ Route: /yellow-page/{founderId}/projects/{slug}
├─ Detailed project view
├─ Team information
├─ Project statistics
└─ Related news & learn content
```

#### **Events Pages**
```
EventsPage.tsx            
├─ Route: /events
├─ Calendar view of events
├─ Filter by date/type/location
├─ Upcoming & past events
└─ Search functionality

EventDetailPage.tsx       
├─ Route: /events/{eventSlug}
├─ Full event details
├─ Registration/RSVP
├─ Location & schedule
├─ Related events
└─ Share functionality
```

#### **Ecosystem Hub Pages**
```
EcosystemOverviewPage.tsx 
├─ Route: /ecosystem/{ecosystemSlug}
├─ Ecosystem overview
├─ Key statistics
├─ Featured projects
└─ Latest news & tutorials

EcosystemProjectPage.tsx  
├─ Route: /ecosystem/{ecosystemSlug}/projects/{projectSlug}
├─ Individual project details
├─ Technical documentation
└─ Team & community links

EcosystemCategoryPage.tsx 
├─ Route: /ecosystem/{ecosystemSlug}/{category}
├─ Filtered project view
└─ Category-specific content

EcosystemTutorialsPage.tsx
├─ Route: /ecosystem/{ecosystemSlug}/tutorials
├─ Tutorial listings
└─ Step-by-step guides
```

#### **Authentication Pages**
```
LoginPage.tsx             
├─ Route: /login
├─ Email/password login
├─ Social auth options
├─ Remember me functionality
└─ Links to signup & password reset

SignupPage.tsx            
├─ Route: /signup
├─ User registration
├─ Email verification
├─ Referral code support
└─ XP bonus for signup

ForgotPasswordPage.tsx    
├─ Route: /forgot-password
├─ Password reset request
└─ Email confirmation

ProfilePage.tsx           
├─ Route: /profile
├─ User profile management
├─ XP & level display
├─ Referral dashboard
├─ Saved articles
├─ Course progress
└─ Account settings
```

### **/pages/admin/ - Admin Panel Pages**

#### **Dashboard & Auth**
```
AdminDashboardPage.tsx    
├─ Route: /admin
├─ Overview statistics
├─ Recent activity
├─ Quick actions
└─ Analytics widgets

AdminLoginPage.tsx        
├─ Route: /admin/login
├─ Admin authentication
├─ 2FA support
└─ Session management

AdminProfilePage.tsx      
├─ Route: /admin/profile
└─ Admin user settings
```

#### **News Management**
```
NewsListPage.tsx          
├─ All articles table
├─ Search & filter
├─ Bulk actions
├─ Status indicators
└─ Quick edit

NewsCreatePage.tsx        
├─ Rich text editor
├─ Category selection
├─ Tag management
├─ Ecosystem tags
├─ Hero image upload
├─ SEO settings
├─ Publish scheduling
└─ AI optimization

NewsEditPage.tsx          
├─ Edit existing articles
├─ Version history
├─ Preview mode
└─ Update tracking

NewsAnalyticsPage.tsx     
├─ Article performance metrics
├─ Read time analytics
├─ Engagement rates
├─ Popular categories
└─ Traffic sources

NewsDetailAnalyticsPage.tsx
├─ Single article deep-dive
├─ View trends
├─ User engagement
├─ Share analytics
└─ Comments activity

NewsAutoFetchPage.tsx     
├─ RSS feed management
├─ API integrations
├─ Auto-import settings
├─ Content filters
└─ Schedule configuration

NewsSourcesPage.tsx       
├─ Content source management
├─ API credentials
├─ Source priority
└─ Quality scoring

NewsModerationQueuePage.tsx
├─ Pending articles review
├─ AI-flagged content
├─ Approve/reject workflow
└─ Spam filtering

NewsCategoriesPage.tsx    
├─ Category management
├─ Add/edit/delete
├─ SEO per category
└─ Display ordering

NewsAISettingsPage.tsx    
├─ AI optimization config
├─ Content suggestions
├─ Auto-tagging rules
└─ Quality checks
```

#### **Learn Management**
```
LearnListPage.tsx         
├─ All courses table
├─ Search & filter
├─ Difficulty levels
├─ XP rewards
└─ Enrollment stats

LearnCreatePage.tsx       
├─ Course creation
├─ Lesson builder
├─ Video upload
├─ Quiz creation
├─ XP configuration
└─ Prerequisites setup

LearnEditPage.tsx         
├─ Edit courses
├─ Update content
└─ Reorder lessons

LearnCategoriesPage.tsx   
├─ Category management
├─ Ecosystem linking
└─ Difficulty tags

LearnCrossPromotionPage.tsx
├─ Related content setup
├─ Cross-linking rules
├─ Promotion widgets
└─ Conversion tracking
```

#### **Founders Management**
```
FoundersListPage.tsx      
├─ All founder stories
├─ Status tracking
├─ Featured toggle
└─ Analytics preview

FoundersCreatePage.tsx    
├─ New founder story
├─ Biography editor
├─ Project linking
├─ Timeline builder
└─ Media gallery
```

#### **Events Management**
```
EventsListPage.tsx        
├─ Events calendar view
├─ Upcoming/past filter
├─ RSVP tracking
└─ Bulk operations

EventsCreatePage.tsx      
├─ Event creation
├─ Date/time picker
├─ Location setup
├─ Registration settings
└─ Email notifications

EventsEditPage.tsx        
├─ Edit events
├─ Update details
└─ Attendee management

EventsAnalyticsPage.tsx   
├─ Event performance
├─ Registration stats
├─ Attendance rates
└─ Engagement metrics

EventDetailAnalyticsPage.tsx
├─ Single event analytics
├─ Attendee demographics
└─ Conversion tracking
```

#### **Ecosystem Management**
```
EcosystemHubManagementPage.tsx
├─ Ecosystem administration
├─ Project management
├─ Category organization
├─ Content linking
└─ Statistics overview
```

#### **User & XP Management**
```
UsersListPage.tsx         
├─ User database
├─ Search & filter
├─ Ban/suspend actions
├─ Role assignment
└─ Activity history

UserAnalyticsPage.tsx     
├─ User behavior metrics
├─ Engagement patterns
├─ Demographics
├─ Retention rates
└─ Conversion funnels

XPSystemPage.tsx          
├─ XP rules configuration
├─ Level thresholds
├─ Reward multipliers
├─ Action XP values
└─ Leaderboard settings

ReferralSystemPage.tsx    
├─ Referral code management
├─ Reward configuration
├─ Claim approval
├─ Analytics dashboard
├─ Fraud detection
└─ Payout tracking
```

#### **Analytics & Tracking**
```
BehaviorTrackingPage.tsx  
├─ User journey mapping
├─ Heatmaps
├─ Click tracking
├─ Session recordings
├─ Funnel analysis
└─ A/B testing results

ReportsExportPage.tsx     
├─ Data export tools
├─ CSV generation
├─ Custom reports
├─ Scheduled exports
└─ Format options
```

#### **System Management**
```
AILogsPage.tsx            
├─ AI operation logs
├─ Optimization history
├─ Error tracking
└─ Performance metrics

RolesPermissionsPage.tsx  
├─ Role management
├─ Permission assignment
├─ Access control
└─ Audit logs

SystemSettingsPage.tsx    
├─ General settings
├─ Platform configuration
└─ Feature toggles
```

#### **Settings Pages** (`/pages/admin/settings/`)
```
GeneralSettingsPage.tsx   → Site name, logo, timezone
APISettingsPage.tsx       → API keys, webhooks
APIIntegrationsPage.tsx   → Third-party integrations
SEOSettingsPage.tsx       → Meta defaults, sitemap
EmailSettingsPage.tsx     → SMTP, templates
SecuritySettingsPage.tsx  → Auth rules, rate limits
AppearanceSettingsPage.tsx→ Theme customization
BackupSettingsPage.tsx    → Backup schedule, restore
```

### **/components/ - Reusable Components**

#### **Main Components**
```
Header.tsx                
├─ Top navigation bar
├─ Main menu (News, Learn, Yellow Page, Events)
├─ Search bar
├─ User dropdown
├─ Dark mode toggle
└─ Mobile hamburger menu

Footer.tsx                
├─ Footer navigation
├─ Newsletter signup
├─ Social media links
└─ Copyright info

ArticleCardSmall.tsx      → Compact article preview
HeroArticle.tsx           → Featured article banner
LatestNewsCard.tsx        → Latest news item
TrendingCard.tsx          → Trending content card
RecommendedCard.tsx       → Recommended content

CourseProgressCard.tsx    → Course with progress bar
WelcomeLearnCard.tsx      → Learn section hero
LatestLearnSection.tsx    → Recent courses
RelatedLearnSection.tsx   → Related course recommendations

BestOfMonthSection.tsx    → Top content of month
FeaturedNewsSection.tsx   → Featured news carousel

CommentSection.tsx        
├─ Article comments
├─ Nested replies
├─ Like/dislike
└─ Moderation

ShareSaveButtons.tsx      
├─ Social sharing
├─ Save for later
└─ Copy link

SEOHead.tsx               
├─ Dynamic meta tags
├─ Open Graph
├─ Twitter cards
└─ Structured data

XPWidget.tsx              
├─ XP display
├─ Level progress
├─ Quick stats
└─ Leaderboard link

EmptyState.tsx            → No data placeholder
ErrorBoundary.tsx         → Error catching wrapper
LoadingSkeletons.tsx      → Loading state skeletons
FilterBar.tsx             → Content filtering UI
```

#### **Animation Components**
```
LearnHeroAnimation.tsx         → Learn hub hero
CrypLearnHeroAnimation.tsx     → Cryp Learn hero
EcosystemLearnHeroAnimation.tsx→ Ecosystem Learn hero
```

#### **Admin Components** (`/components/admin/`)
```
AdminHeader.tsx           
├─ Admin panel header
├─ Breadcrumbs
├─ Quick actions
└─ Notifications

AdminSidebar.tsx          
├─ Admin navigation menu
├─ Collapsible sections
├─ Active state tracking
└─ Role-based visibility

CustomDatePicker.tsx      
├─ Custom date input
├─ Range selection
└─ Timezone handling
```

#### **UI Components** (`/components/ui/`) - shadcn/ui
```
30+ production-ready components:

Forms:
  - button.tsx          → Button variants
  - input.tsx           → Text input
  - textarea.tsx        → Multi-line input
  - select.tsx          → Dropdown select
  - checkbox.tsx        → Checkbox
  - radio-group.tsx     → Radio buttons
  - switch.tsx          → Toggle switch
  - slider.tsx          → Range slider
  - calendar.tsx        → Date picker
  - form.tsx            → Form wrapper with validation

Layout:
  - card.tsx            → Content cards
  - separator.tsx       → Divider lines
  - aspect-ratio.tsx    → Image ratios
  - scroll-area.tsx     → Custom scrollbar
  - resizable.tsx       → Resizable panels
  - sidebar.tsx         → Sidebar layouts

Overlays:
  - dialog.tsx          → Modal dialogs
  - alert-dialog.tsx    → Confirmation dialogs
  - sheet.tsx           → Slide-out panels
  - drawer.tsx          → Bottom drawer
  - popover.tsx         → Popover content
  - tooltip.tsx         → Tooltips
  - hover-card.tsx      → Hover previews
  - context-menu.tsx    → Right-click menus
  - dropdown-menu.tsx   → Dropdown menus

Navigation:
  - tabs.tsx            → Tab navigation
  - navigation-menu.tsx → Nav menus
  - breadcrumb.tsx      → Breadcrumb trails
  - pagination.tsx      → Page navigation
  - menubar.tsx         → Menu bar

Feedback:
  - alert.tsx           → Alert messages
  - sonner.tsx          → Toast notifications
  - progress.tsx        → Progress bars
  - skeleton.tsx        → Loading skeletons
  - badge.tsx           → Status badges

Data:
  - table.tsx           → Data tables
  - chart.tsx           → Recharts integration
  - avatar.tsx          → User avatars
  - carousel.tsx        → Image carousels
  - accordion.tsx       → Collapsible content
  - collapsible.tsx     → Expand/collapse

Specialized:
  - command.tsx         → Command palette
  - toggle.tsx          → Toggle button
  - toggle-group.tsx    → Toggle button group
  - input-otp.tsx       → OTP input
```

### **/contexts/ - Global State Management**

```
AuthContext.tsx           
├─ User authentication state
├─ Login/logout functions
├─ User profile data
├─ Protected route handling
└─ Session management

ThemeContext.tsx          
├─ Dark/light mode toggle
├─ Theme persistence
├─ System preference detection
└─ CSS variable management

XPContext.tsx             
├─ User XP & level
├─ XP earning functions
├─ Level progression
├─ Achievement tracking
└─ Leaderboard data

CategoriesContext.tsx     
├─ News categories state
├─ Category CRUD operations
└─ Active category tracking

LearnCategoriesContext.tsx
├─ Learn categories
├─ Difficulty levels
└─ Category filtering

EcosystemsContext.tsx     
├─ Ecosystem data
├─ Ecosystem projects
└─ Cross-linking

EventsContext.tsx         
├─ Events state
├─ Calendar data
├─ RSVP management
└─ Event filters

FoundersContext.tsx       
├─ Founder stories state
├─ Story CRUD operations
└─ Featured founders
```

### **/data/ - Mock Data & Constants**

```
mockArticles.ts           
├─ Sample news articles
├─ Different categories
├─ Various authors
└─ Realistic content

mockCategories.ts         
├─ News category definitions
├─ Category metadata
└─ SEO data

mockEcosystems.ts         
├─ Blockchain ecosystems
├─ Ecosystem details
└─ Project lists

mockEvents.ts             
├─ Event samples
├─ Different types
└─ Date ranges

mockFounders.ts           
├─ Founder biographies
├─ Project associations
└─ Achievements

mockLearnCategories.ts    
├─ Course categories
├─ Difficulty levels
└─ XP rewards

mockReferrals.ts          
├─ Referral codes
├─ User referrals
└─ Reward data

mockTutorials.ts          
├─ Tutorial content
├─ Step-by-step guides
└─ Code examples

learnData.ts              
├─ Course definitions
├─ Lesson content
├─ Quiz data
└─ Prerequisites

eventsData.ts             
├─ Event helpers
├─ Calendar utilities
└─ RSVP tracking

crossPromotionData.ts     
├─ Related content rules
├─ Promotion widgets
└─ Cross-links

ecosystemHubData.ts       
├─ Ecosystem hub content
├─ Featured projects
└─ Statistics
```

### **/utils/ - Utility Functions**

#### **Core Utilities**
```
routes.ts                 
├─ Route matching functions
├─ URL generation
├─ Route validation
├─ SEO-friendly URLs
└─ Breadcrumb generation

seo.ts                    
├─ Meta tag generation
├─ Structured data
├─ Open Graph tags
├─ Twitter cards
└─ Canonical URLs

sitemap.ts                
├─ Sitemap XML generation
├─ URL priority
├─ Change frequency
└─ Last modified dates

analytics.ts              
├─ Event tracking
├─ Page views
├─ User actions
├─ Conversion tracking
└─ Custom metrics

validation.ts             
├─ Input validation
├─ Form validation
├─ Email validation
├─ URL validation
└─ Sanitization

dataExport.ts             
├─ CSV generation
├─ Excel export
├─ JSON export
├─ PDF generation
└─ Report formatting
```

#### **Security Utilities**
```
adminAuth.ts              
├─ Admin authentication
├─ Role-based access
├─ Session validation
├─ Token management
└─ Permission checks

csrf.ts                   
├─ CSRF token generation
├─ Token validation
├─ Request verification
└─ Double-submit cookies

rateLimiter.ts            
├─ Request rate limiting
├─ IP-based limits
├─ User-based limits
├─ Endpoint-specific limits
└─ Sliding window algorithm

secureStorage.ts          
├─ Encrypted localStorage
├─ Secure sessionStorage
├─ Token storage
├─ Data encryption
└─ XSS prevention
```

#### **Performance Utilities**
```
performance.ts            
├─ Performance monitoring
├─ Metrics collection
├─ Bottleneck detection
├─ Memory usage
└─ Load time tracking

ai-optimization.ts        
├─ AI content optimization
├─ Auto-tagging
├─ Content suggestions
├─ Quality scoring
└─ SEO recommendations

accessibility.ts          
├─ A11y helpers
├─ ARIA labels
├─ Keyboard navigation
├─ Screen reader support
└─ Focus management
```

#### **Feature Utilities**
```
referral.ts               
├─ Referral code generation
├─ Code validation
├─ Reward calculation
├─ Tracking
└─ Fraud detection
```

---

## 🔄 Complete User Flows

### **1. News Reading Flow**
```
User lands on HomePage
      ↓
Sees featured articles in HeroArticle component
      ↓
Clicks category in Header navigation
      ↓
Routed to CategoryPage (/news/{category})
      ↓
Filters by tags/trending/latest
      ↓
Clicks article
      ↓
Routed to ArticleDetailPage (/news/{category}/{slug})
      ↓
Reads article (XP earned for reading time)
      ↓
Sees related articles in sidebar
      ↓
Can comment, share, or save article
      ↓
Related Learn courses suggested
```

### **2. Learning Flow**
```
User clicks "Learn" in Header
      ↓
Routed to LearnPage (hub)
      ↓
Chooses: Cryp Learn (global) or Ecosystem Learn (specific)
      ↓
If Cryp Learn:
  → CrypLearnPage (/learn/crypto)
  → Filter by category/difficulty
  → Click course
  → CourseDetailPage (/learn/crypto/{category}/{courseId})
      ↓
If Ecosystem Learn:
  → EcosystemLearnHubPage (/learn/ecosystem)
  → Choose ecosystem (Ethereum, Solana, etc.)
  → EcosystemLearnPage (/learn/{ecosystem})
  → Filter by category
  → Click course
  → CourseDetailPage (/learn/{ecosystem}/{category}/{courseId})
      ↓
Complete lessons
      ↓
Earn XP for each completed lesson
      ↓
Take quiz
      ↓
Earn XP for passing quiz
      ↓
Get certificate
      ↓
See related courses suggested
```

### **3. Admin Content Management Flow**
```
Admin logs in via AdminLoginPage
      ↓
Authenticated & routed to AdminDashboardPage
      ↓
Clicks "News" in AdminSidebar
      ↓
Views NewsListPage (all articles table)
      ↓
Clicks "Create New Article"
      ↓
NewsCreatePage opens
      ↓
Admin fills form:
  - Title, summary, content
  - Category selection
  - Tags (general + ecosystem + token)
  - Hero image upload
  - SEO settings (meta title, description, slug)
  - Publish settings (draft, scheduled, published)
      ↓
AI optimization runs (auto-tags, suggests improvements)
      ↓
Admin previews article
      ↓
Admin publishes
      ↓
Article appears on frontend
      ↓
Analytics tracked on NewsDetailAnalyticsPage
```

### **4. XP & Referral Flow**
```
New user signs up via SignupPage
      ↓
Optional: Enters referral code
      ↓
Account created
      ↓
Referrer earns XP (if code used)
      ↓
New user earns signup bonus XP
      ↓
XPContext updates user level
      ↓
XPWidget displays progress
      ↓
User performs actions (read, complete course, comment)
      ↓
XP earned for each action
      ↓
Level increases when threshold reached
      ↓
User can view referral dashboard in ProfilePage
      ↓
Generate own referral code
      ↓
Share code with friends
      ↓
Earn rewards when friends sign up
      ↓
Admin can approve/deny claims in ReferralSystemPage
```

---

## 🎨 Design System

### **Brand Colors**

#### **Primary Palette**
```css
Primary Yellow:    #EFB81A    /* Buttons, CTAs, icons, highlights */
Soft Yellow:       #F9D96A    /* Section backgrounds, light accents */
```

#### **Usage Rules** (STRICT)
- ✅ **DO:** Use flat fills only
- ✅ **DO:** Apply to buttons, icons, highlights, CTAs
- ❌ **DON'T:** Add gradients
- ❌ **DON'T:** Add shadows to brand colors
- ❌ **DON'T:** Use on large background areas (except Soft Yellow)

#### **Neutral Palette**
```css
/* Light Mode */
Background:        #FFFFFF
Surface:           #F9FAFB
Border:            #E5E7EB
Text Primary:      #111827
Text Secondary:    #6B7280

/* Dark Mode */
Background:        #0A0A0A
Surface:           #1A1A1C
Border:            #27272A
Text Primary:      #FFFFFF
Text Secondary:    #A1A1AA
```

### **Typography**

Defined in `/styles/globals.css`:
```css
h1: 2.5rem (40px) - Page titles
h2: 2rem (32px) - Section headers
h3: 1.5rem (24px) - Subsection headers
h4: 1.25rem (20px) - Card titles
h5: 1.125rem (18px) - Small headers
h6: 1rem (16px) - Smallest headers
p:  1rem (16px) - Body text

⚠️ Do NOT use Tailwind font size classes unless specifically requested
```

### **Spacing System**
```
xs:  0.25rem (4px)
sm:  0.5rem (8px)
md:  1rem (16px)
lg:  1.5rem (24px)
xl:  2rem (32px)
2xl: 3rem (48px)
```

### **Responsive Breakpoints**
```
sm:  640px  - Mobile landscape
md:  768px  - Tablet
lg:  1024px - Desktop
xl:  1280px - Large desktop
2xl: 1536px - Extra large
```

---

## 🔐 Security Implementation

### **Authentication**
- ✅ Argon2id password hashing (`server/src/modules/auth/auth.service.ts`), not bcrypt
- ✅ JWT access tokens + rotating, hashed refresh tokens (reuse detection revokes the full session chain)
- ✅ Password reset via `changePassword`, which also revokes every existing session

### **Admin Security**
- ✅ Role-based access control, with permission grants stored in the database (`RoleDefinition`/`Permission`), not hardcoded
- ✅ Every admin route closed by default (`JwtAuthGuard` is global; a route must opt into `@Public()`)
- ✅ Per-route permission checks via `@RequirePermissions(...)` and `PermissionsGuard`
- ✅ Append-only audit log (`AuditLog`) for every write

### **Request Security**
- ✅ Rate limiting via `@nestjs/throttler`, applied globally
- ✅ DTO-level input validation (`class-validator`) on every endpoint
- ✅ `helmet` security headers on the API

### **Data Security**
- ✅ Local file uploads restricted to safe raster formats (SVG excluded — see `storageConfig` — to avoid stored XSS via inline `<script>`)
- ✅ Secrets shown once at creation and stored only as hashes (user passwords, AI agent API secrets)
- ✅ Webhook payloads signed with HMAC-SHA256 so receivers can verify origin

### **AI Agents**
- ✅ Agents authenticate with an API key/secret pair (`X-Agent-Key` / `X-Agent-Secret`), never a user session
- ✅ Per-agent permission grants, IP allowlist, and per-minute rate limit
- ✅ Every agent call logged, successful or not (`AgentRequestLog`)

See [SECURITY_COMPLETE.md](./SECURITY_COMPLETE.md) for details on the areas above that predate the backend; treat this section as the current source of truth where the two disagree.

---

## 📊 Analytics & Tracking

### **User Behavior Tracking**
- Page views
- Click tracking
- Session duration
- User journeys
- Heatmaps (ready)
- Funnel analysis

### **Content Analytics**
- Article views
- Read time
- Engagement rate
- Share counts
- Comment activity
- Popular categories

### **User Analytics**
- Active users (DAU/MAU)
- User retention
- Demographics
- Registration sources
- Referral performance

### **XP Analytics**
- XP distribution
- Level progression
- Activity patterns
- Reward effectiveness

---

## 🚀 Feature Highlights

### **News Section**
- ✅ Multi-category news (6+ categories)
- ✅ AI-powered auto-fetch from RSS/APIs
- ✅ Rich text editor
- ✅ Tag system (general + ecosystem + token)
- ✅ Related articles
- ✅ Comment system
- ✅ Share & save functionality
- ✅ Reading progress tracker
- ✅ Deep analytics per article

### **Learn Section**
- ✅ Two-tier system: Cryp Learn + Ecosystem Learn
- ✅ Video & text lessons
- ✅ Quizzes & assessments
- ✅ XP rewards per lesson
- ✅ Progress tracking
- ✅ Certificate generation
- ✅ Cross-promotion with News
- ✅ Difficulty levels
- ✅ Prerequisites system

### **Yellow Page (Founders)**
- ✅ Founder biographies
- ✅ Project associations
- ✅ Timeline of achievements
- ✅ Media gallery
- ✅ Related news & learn content
- ✅ Featured founders

### **Events**
- ✅ Calendar view
- ✅ Event details (date, time, location)
- ✅ RSVP/registration
- ✅ Past & upcoming events
- ✅ Event analytics
- ✅ Email notifications (ready)
- ✅ Related events suggestions

### **XP & Gamification**
- ✅ XP for all actions (read, learn, comment, share)
- ✅ Level system with thresholds
- ✅ Leaderboard
- ✅ Achievement badges (ready)
- ✅ Reward multipliers
- ✅ Admin configurable XP values

### **Referral System**
- ✅ Unique referral codes per user
- ✅ Referral tracking
- ✅ Reward calculation
- ✅ Claim approval workflow
- ✅ Fraud detection
- ✅ Analytics dashboard
- ✅ Payout tracking (ready)

### **Admin CMS**
- ✅ Complete CRUD for all content types
- ✅ Rich analytics dashboards
- ✅ User behavior tracking
- ✅ AI-powered content optimization
- ✅ Auto-fetch news system
- ✅ Moderation queue
- ✅ Role & permission management
- ✅ Data export & reporting
- ✅ System settings

---

## 🔌 API Integration Points

### **News Auto-Fetch**
- RSS feed parsing
- API polling
- Content filtering
- Auto-categorization
- Duplicate detection

### **Third-Party Services** (Ready for integration)
- Email service (SMTP)
- Analytics (Google Analytics, etc.)
- Payment gateway (for premium features)
- CDN (for media)
- Social auth (OAuth)

### **Internal APIs** (Built — NestJS, `server/`, versioned under `/api/v1`)
```
/api/v1/auth/*                - Login, refresh, logout, change password
/api/v1/articles/*             - News CRUD (public read + admin write)
/api/v1/projects, /research,
  /regulations, /events,
  /founders                   - Content-type CRUD, same shape as articles
/api/v1/taxonomy/*             - Categories, tags, labels
/api/v1/authors/*              - Author profiles
/api/v1/media/*                - Media library / uploads
/api/v1/search                 - Full-text search across all content
/api/v1/discovery/*, /home     - Homepage & section content resolution
/api/v1/analytics/*            - View and search analytics (admin)
/api/v1/audit/*                - Audit log (admin)
/api/v1/admin/users, /roles    - Staff accounts and permission grants
/api/v1/admin/site/*           - Settings, navigation, redirects, ad slots
/api/v1/admin/agents/*         - AI agent credentials (admin)
/api/v1/agents/*                - Content submission by AI agents (agent-key auth)
/api/v1/admin/webhooks/*       - Webhook subscriptions (admin)
/health, /health/ready         - Liveness / readiness probes
```
XP and referrals are not implemented in the backend — they exist only as
frontend concepts (`XPContext`, `mockReferrals.ts`) and would need their own
Prisma models and modules if built out.

---

## 📱 Mobile Responsiveness

### **Mobile-First Approach**
- All pages designed mobile-first
- Touch-friendly UI elements
- Responsive images
- Mobile navigation menu
- Optimized performance

### **Breakpoint Strategy**
```
Mobile:    < 640px  - Single column, hamburger menu
Tablet:    640-1024px - 2 columns, adapted layout
Desktop:   > 1024px - Multi-column, full features
```

### **Mobile-Specific Features**
- Hamburger menu in Header
- Bottom sheet drawers
- Swipe gestures (in carousels)
- Touch-optimized buttons
- Lazy loading images

---

## ♿ Accessibility

### **WCAG 2.1 AA Compliance**
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Color contrast ratios
- ✅ Screen reader support
- ✅ Alt text for images
- ✅ Form labels
- ✅ Error messages

### **Utilities**
- `/utils/accessibility.ts` - A11y helper functions
- Focus trap for modals
- Skip navigation links
- Descriptive link text

---

## 🧪 Testing Strategy

### **Manual Testing**
- See [NEWS_TESTING_GUIDE.md](./NEWS_TESTING_GUIDE.md)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing (iOS, Android)
- Accessibility testing (screen readers, keyboard-only)

### **Areas to Test**
1. Authentication flows
2. Content creation & editing
3. Navigation & routing
4. XP & referral systems
5. Analytics tracking
6. Dark mode toggle
7. Responsive design
8. Form validation
9. Error handling
10. Performance

---

## 📦 Dependencies

### **Frontend (`/`)**
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4 (no config file)

### **UI Components**
- shadcn/ui (30+ components)
- lucide-react (icons)
- recharts (charts)

### **Utilities**
- react-hook-form (forms)
- sonner (toasts)
- motion/react (animations)

### **Backend (`server/`)**
- NestJS 11, Prisma 6, PostgreSQL
- Passport JWT, Argon2 (password/secret hashing), class-validator
- `@nestjs/schedule` for in-process cron jobs (scheduled publishing, agent log cleanup)

### **Development**
- Standard npm scripts (`npm run dev`, `npm run build`) for the frontend;
  `npm run start:dev`, `npm run db:migrate`, `npm run db:seed` for the
  backend — see `server/package.json` and `server/docs/DEPLOYMENT.md`

---

## 🚢 Deployment Checklist

### **Pre-Deployment**
1. ✅ Environment variables set
2. ✅ API keys configured
3. ✅ Database migrations run
4. ✅ Security measures enabled
5. ✅ Analytics tracking configured
6. ✅ SEO metadata complete
7. ✅ Error boundaries in place
8. ✅ Rate limiting configured
9. ✅ CSRF protection enabled
10. ✅ Content backed up

### **Post-Deployment**
1. ✅ Test all critical flows
2. ✅ Verify analytics tracking
3. ✅ Check error monitoring
4. ✅ Validate SEO (sitemap, robots.txt)
5. ✅ Test email notifications
6. ✅ Verify admin access
7. ✅ Check mobile responsiveness
8. ✅ Test dark mode
9. ✅ Validate security headers
10. ✅ Monitor performance

See [ARTICLE_PAGE_DEPLOYMENT_CHECKLIST.md](./ARTICLE_PAGE_DEPLOYMENT_CHECKLIST.md)

---

## 🔧 Maintenance & Updates

### **Regular Tasks**
- Update dependencies monthly
- Review analytics weekly
- Moderate content daily (via moderation queue)
- Backup data daily
- Review security logs weekly
- Update mock data as needed

### **Monitoring**
- Error rates (via AILogsPage)
- Performance metrics (via performance.ts)
- User analytics (via UserAnalyticsPage)
- Content performance (via NewsAnalyticsPage, etc.)

---

## 📞 Support & Resources

### **For Developers**
1. Start with this document
2. Check [PROJECT_MASTER_INDEX.md](./PROJECT_MASTER_INDEX.md) for links
3. Review [STRUCTURE_QUICK_REFERENCE.md](./STRUCTURE_QUICK_REFERENCE.md)
4. Use [QUICK_ACTION_GUIDE.md](./QUICK_ACTION_GUIDE.md) for tasks

### **For AI Agents**
1. Parse this overview first
2. Reference specific docs via master index
3. Check `/data/` for schemas
4. Use `/utils/` for helpers
5. Follow existing patterns

### **For Backend Engineers**
- Security: `/utils/adminAuth.ts`, `/utils/csrf.ts`, `/utils/validation.ts`
- APIs: See "API Integration Points" section
- Data: Check `/data/` folder for expected schemas
- Auth: Review `/contexts/AuthContext.tsx`

---

## 🎯 Project Status

**Frontend:** UI, routing, and admin screens are largely built against the
design system described above. **Backend:** the NestJS API (`server/`) now
covers content (news, ecosystem, research, regulation, events, founders),
taxonomy, users/roles/permissions, media, site configuration, audit
logging, analytics, AI agents, and webhooks.

### **Not yet built:**
- Frontend wiring to the real API — `src/services/*` (e.g. `news.ts`)
  currently reads `src/data/*` mock data, not `server/`'s API
- A decision on `src/app/api/*` + root `prisma/` (older, partial Next.js
  backend) — likely to retire in favor of `server/`
- XP and referral systems (frontend-only concepts today; no backend models)
- Email service integration
- Payment gateway (if the product needs one)

### **Next Steps:**
1. Wire `src/services/*` to the NestJS API instead of mock data
2. Decide the fate of `src/app/api/*` and root `prisma/`
3. Decide whether XP/referrals ship as real backend modules or are dropped
4. Configure email service for password reset / notifications
5. Deploy via `server/docs/DEPLOYMENT.md` and run `npm run db:seed`
6. Content population and launch

---

**Last Updated:** 2026-08-01
**Status:** Frontend UI complete; backend API built; integration in progress

For detailed information on specific features, consult the [PROJECT_MASTER_INDEX.md](./PROJECT_MASTER_INDEX.md) and linked documentation files.
