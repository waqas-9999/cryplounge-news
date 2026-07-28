# CrypLounge - Backend Integration Guide

**For Backend Developers & AI Agents**  
**Last Updated:** November 14, 2025

---

## 🎯 Quick Start

This guide helps backend developers understand the frontend architecture and integrate APIs efficiently.

---

## 📚 Required Reading First

1. **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Complete architecture
2. **[PROJECT_MASTER_INDEX.md](./PROJECT_MASTER_INDEX.md)** - Documentation index
3. **[SECURITY_COMPLETE.md](./SECURITY_COMPLETE.md)** - Security requirements

---

## 🏗️ Frontend Architecture Summary

### **Technology Stack**
- **Frontend:** React + TypeScript + Tailwind CSS v4.0
- **State Management:** React Context API
- **UI Components:** shadcn/ui (30+ components)
- **Routing:** Custom routing in App.tsx
- **Security:** CSRF, rate limiting, XSS prevention

### **File Structure**
```
/pages/          - All page components (frontend + admin)
/components/     - Reusable UI components
/contexts/       - Global state (Auth, Theme, XP, etc.)
/data/           - Mock data (replace with API calls)
/utils/          - Utilities (security, validation, analytics)
/styles/         - Global CSS
```

---

## 🔌 API Integration Points

### **1. Authentication APIs**

#### **User Authentication**
```typescript
// Current: /contexts/AuthContext.tsx
// Mock implementation - replace with real API calls

POST /api/auth/register
Body: {
  email: string
  password: string
  username: string
  referralCode?: string
}
Response: {
  user: User
  token: string
  xpBonus: number
}

POST /api/auth/login
Body: {
  email: string
  password: string
  rememberMe: boolean
}
Response: {
  user: User
  token: string
  expiresIn: number
}

POST /api/auth/logout
Headers: { Authorization: "Bearer {token}" }
Response: { success: boolean }

GET /api/auth/me
Headers: { Authorization: "Bearer {token}" }
Response: { user: User }

POST /api/auth/forgot-password
Body: { email: string }
Response: { success: boolean, message: string }

POST /api/auth/reset-password
Body: {
  token: string
  password: string
}
Response: { success: boolean }
```

#### **Admin Authentication**
```typescript
// Current: /utils/adminAuth.ts

POST /api/admin/auth/login
Body: {
  email: string
  password: string
  twoFactorCode?: string
}
Response: {
  admin: AdminUser
  token: string
  permissions: string[]
}

GET /api/admin/auth/validate
Headers: { Authorization: "Bearer {token}" }
Response: {
  valid: boolean
  admin: AdminUser
  permissions: string[]
}
```

### **2. News APIs**

```typescript
// Current: /data/mockArticles.ts
// Replace with real API calls

GET /api/news
Query: {
  category?: string
  tags?: string[]
  ecosystemTags?: string[]
  tokenTags?: string[]
  page?: number
  limit?: number
  sortBy?: 'latest' | 'trending' | 'popular'
}
Response: {
  articles: Article[]
  total: number
  page: number
  totalPages: number
}

GET /api/news/:slug
Response: {
  article: Article
  related: Article[]
}

POST /api/admin/news
Headers: { Authorization: "Bearer {adminToken}" }
Body: {
  title: string
  summary: string
  content: string
  category: string
  tags: string[]
  ecosystemTags: string[]
  tokenTags: string[]
  heroImage: string
  author: string
  seo: {
    metaTitle: string
    metaDescription: string
    slug: string
  }
  status: 'draft' | 'published' | 'scheduled'
  publishDate?: Date
}
Response: { article: Article }

PUT /api/admin/news/:id
PATCH /api/admin/news/:id/status
DELETE /api/admin/news/:id

GET /api/admin/news/analytics
GET /api/admin/news/:id/analytics
```

### **3. Learn (Courses) APIs**

```typescript
// Current: /data/learnData.ts

GET /api/learn/courses
Query: {
  type?: 'crypto' | 'ecosystem'
  ecosystem?: string
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  page?: number
  limit?: number
}
Response: {
  courses: Course[]
  total: number
}

GET /api/learn/courses/:id
Response: {
  course: Course
  lessons: Lesson[]
  quizzes: Quiz[]
  userProgress?: Progress
}

POST /api/learn/courses/:id/enroll
Headers: { Authorization: "Bearer {token}" }
Response: { enrolled: boolean }

POST /api/learn/lessons/:id/complete
Headers: { Authorization: "Bearer {token}" }
Response: {
  completed: boolean
  xpEarned: number
  newLevel?: number
}

POST /api/learn/quizzes/:id/submit
Body: { answers: Answer[] }
Response: {
  score: number
  passed: boolean
  xpEarned: number
  certificate?: Certificate
}

GET /api/users/me/courses/progress
Headers: { Authorization: "Bearer {token}" }
Response: {
  enrolled: Course[]
  completed: Course[]
  inProgress: Course[]
}
```

### **4. Events APIs**

```typescript
// Current: /data/eventsData.ts

GET /api/events
Query: {
  startDate?: Date
  endDate?: Date
  type?: string
  location?: string
  page?: number
  limit?: number
}
Response: {
  events: Event[]
  total: number
}

GET /api/events/:slug
Response: { event: Event }

POST /api/events/:id/rsvp
Headers: { Authorization: "Bearer {token}" }
Body: {
  attending: boolean
  guests?: number
}
Response: { rsvp: RSVP }

POST /api/admin/events
PUT /api/admin/events/:id
DELETE /api/admin/events/:id
```

### **5. Founders (Yellow Page) APIs**

```typescript
// Current: /data/mockFounders.ts

GET /api/founders
Query: {
  category?: string
  ecosystem?: string
  featured?: boolean
  page?: number
}
Response: {
  founders: Founder[]
  total: number
}

GET /api/founders/:id
Response: {
  founder: Founder
  projects: Project[]
  timeline: TimelineEvent[]
}

GET /api/founders/:id/projects/:projectSlug
Response: { project: Project }

POST /api/admin/founders
PUT /api/admin/founders/:id
DELETE /api/admin/founders/:id
```

### **6. XP System APIs**

```typescript
// Current: /contexts/XPContext.tsx

GET /api/users/me/xp
Headers: { Authorization: "Bearer {token}" }
Response: {
  currentXP: number
  level: number
  nextLevelXP: number
  totalXP: number
}

POST /api/xp/earn
Headers: { Authorization: "Bearer {token}" }
Body: {
  action: 'read_article' | 'complete_lesson' | 'pass_quiz' | 'comment' | 'share'
  resourceId: string
  amount?: number
}
Response: {
  xpEarned: number
  newXP: number
  leveledUp: boolean
  newLevel?: number
}

GET /api/xp/leaderboard
Query: {
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time'
  limit?: number
}
Response: {
  leaderboard: LeaderboardEntry[]
}

GET /api/admin/xp/settings
PUT /api/admin/xp/settings
Body: {
  actions: {
    read_article: number
    complete_lesson: number
    pass_quiz: number
    comment: number
    share: number
  }
  levelThresholds: number[]
}
```

### **7. Referral System APIs**

```typescript
// Current: /utils/referral.ts

GET /api/users/me/referral-code
Headers: { Authorization: "Bearer {token}" }
Response: {
  code: string
  totalReferrals: number
  pendingRewards: number
  claimedRewards: number
}

POST /api/referrals/validate
Body: { code: string }
Response: {
  valid: boolean
  referrer?: User
  reward?: number
}

GET /api/users/me/referrals
Headers: { Authorization: "Bearer {token}" }
Response: {
  referrals: Referral[]
  stats: ReferralStats
}

POST /api/referrals/claim
Headers: { Authorization: "Bearer {token}" }
Body: { referralIds: string[] }
Response: {
  claimed: number
  totalReward: number
}

GET /api/admin/referrals
PUT /api/admin/referrals/:id/approve
PUT /api/admin/referrals/:id/deny
```

### **8. Analytics APIs**

```typescript
// Current: /utils/analytics.ts

POST /api/analytics/track
Body: {
  event: string
  properties: object
  userId?: string
  sessionId: string
}
Response: { tracked: boolean }

GET /api/admin/analytics/overview
Query: {
  startDate: Date
  endDate: Date
}
Response: {
  pageViews: number
  uniqueVisitors: number
  avgSessionDuration: number
  bounceRate: number
}

GET /api/admin/analytics/content
Query: {
  type: 'news' | 'learn' | 'events' | 'founders'
  startDate: Date
  endDate: Date
}
Response: {
  topContent: ContentAnalytics[]
  engagementRate: number
  avgReadTime: number
}

GET /api/admin/analytics/users
Response: {
  totalUsers: number
  activeUsers: number
  newUsers: number
  retentionRate: number
  demographics: Demographics
}

GET /api/admin/analytics/behavior
Response: {
  userJourneys: Journey[]
  clickHeatmap: HeatmapData
  conversionFunnels: Funnel[]
}
```

### **9. Search API**

```typescript
// Current: /pages/SearchPage.tsx

GET /api/search
Query: {
  q: string
  type?: 'all' | 'news' | 'learn' | 'founders' | 'events'
  page?: number
  limit?: number
}
Response: {
  results: {
    news: Article[]
    learn: Course[]
    founders: Founder[]
    events: Event[]
  }
  total: number
}
```

### **10. User Profile APIs**

```typescript
GET /api/users/me
Headers: { Authorization: "Bearer {token}" }
Response: {
  user: User
  stats: UserStats
}

PUT /api/users/me
Headers: { Authorization: "Bearer {token}" }
Body: {
  username?: string
  email?: string
  avatar?: string
  bio?: string
}
Response: { user: User }

GET /api/users/me/saved
Headers: { Authorization: "Bearer {token}" }
Response: {
  articles: Article[]
  courses: Course[]
}

POST /api/users/me/saved/:type/:id
DELETE /api/users/me/saved/:type/:id
```

### **11. Comments API**

```typescript
GET /api/articles/:id/comments
Response: {
  comments: Comment[]
  total: number
}

POST /api/articles/:id/comments
Headers: { Authorization: "Bearer {token}" }
Body: {
  content: string
  parentId?: string
}
Response: { comment: Comment }

PUT /api/comments/:id
DELETE /api/comments/:id

POST /api/comments/:id/like
POST /api/comments/:id/dislike
```

### **12. Admin User Management APIs**

```typescript
GET /api/admin/users
Query: {
  search?: string
  status?: 'active' | 'suspended' | 'banned'
  page?: number
  limit?: number
}
Response: {
  users: User[]
  total: number
}

GET /api/admin/users/:id
PUT /api/admin/users/:id
DELETE /api/admin/users/:id

PUT /api/admin/users/:id/suspend
PUT /api/admin/users/:id/unsuspend
PUT /api/admin/users/:id/ban
PUT /api/admin/users/:id/role
Body: { role: 'user' | 'moderator' | 'admin' }
```

### **13. File Upload API**

```typescript
POST /api/upload
Headers: {
  Authorization: "Bearer {token}"
  Content-Type: "multipart/form-data"
}
Body: FormData { file: File }
Response: {
  url: string
  filename: string
  size: number
  type: string
}

// Used for:
// - Article hero images
// - Course lesson videos
// - Founder profile photos
// - Event images
// - User avatars
```

### **14. Auto-Fetch News API**

```typescript
GET /api/admin/news/sources
Response: {
  sources: NewsSource[]
}

POST /api/admin/news/sources
Body: {
  name: string
  url: string
  type: 'rss' | 'api'
  category: string
  enabled: boolean
  fetchInterval: number
}

PUT /api/admin/news/sources/:id
DELETE /api/admin/news/sources/:id

POST /api/admin/news/fetch-now
Body: { sourceId?: string }
Response: {
  fetched: number
  articles: Article[]
}

GET /api/admin/news/moderation-queue
Response: {
  pending: Article[]
}

PUT /api/admin/news/moderation/:id/approve
PUT /api/admin/news/moderation/:id/reject
```

### **15. Data Export API**

```typescript
// Current: /utils/dataExport.ts

POST /api/admin/export
Headers: { Authorization: "Bearer {adminToken}" }
Body: {
  type: 'users' | 'news' | 'learn' | 'events' | 'founders' | 'analytics'
  format: 'csv' | 'json' | 'xlsx'
  filters?: object
  startDate?: Date
  endDate?: Date
}
Response: {
  downloadUrl: string
  expiresIn: number
}

GET /api/admin/export/:id/download
Response: File
```

---

## 🔐 Security Requirements

### **1. Authentication & Authorization**

#### **JWT Token Structure**
```typescript
{
  userId: string
  email: string
  role: 'user' | 'moderator' | 'admin'
  iat: number
  exp: number
}
```

#### **Token Placement**
- Frontend sends tokens in: `Authorization: Bearer {token}`
- Token stored in: `secureStorage.ts` (encrypted localStorage)
- Token expiry: 24 hours (configurable)
- Refresh token: 30 days (recommended)

#### **Admin Routes**
- Require `role: 'admin'` or `role: 'moderator'`
- Validate permissions for specific actions
- Log all admin actions

### **2. CSRF Protection**

```typescript
// Current: /utils/csrf.ts

// Backend must:
1. Generate CSRF token on login
2. Include token in responses: { csrfToken: string }
3. Validate token in all state-changing requests (POST, PUT, DELETE)
4. Reject requests with invalid/missing tokens

// Frontend sends:
Headers: {
  'X-CSRF-Token': csrfToken
}
```

### **3. Rate Limiting**

```typescript
// Current: /utils/rateLimiter.ts

// Backend must implement:

// Per User
POST /api/auth/login          - 5 attempts / 15 min
POST /api/auth/register       - 3 attempts / hour
POST /api/comments            - 10 / minute
POST /api/xp/earn             - 100 / hour

// Per IP
GET /api/news                 - 100 / minute
GET /api/learn/courses        - 100 / minute
POST /api/upload              - 10 / hour

// Per Admin
POST /api/admin/news          - 50 / minute
POST /api/admin/export        - 5 / hour
```

### **4. Input Validation**

```typescript
// Current: /utils/validation.ts

// Backend must validate all inputs:

// Email
- Format: RFC 5322
- Max length: 255 chars
- Unique: true

// Password
- Min length: 8 chars
- Requires: uppercase, lowercase, number, special char
- Max length: 128 chars

// Content (articles, comments)
- Max length: defined per field
- Sanitize HTML: strip dangerous tags
- Check for spam: rate limit + content filters

// File uploads
- Max size: 10MB images, 500MB videos
- Allowed types: jpg, png, webp, mp4, mov
- Scan for malware
- Rename files to prevent path traversal
```

### **5. XSS Prevention**

```typescript
// Backend must:
1. Sanitize all HTML content before storing
2. Escape output in APIs
3. Set Content-Security-Policy headers
4. Use HttpOnly cookies for sensitive data
5. Validate and sanitize all user inputs

// CSP Header (example):
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  font-src 'self' data:;
```

### **6. SQL Injection Prevention**

```typescript
// Always use parameterized queries:

// ❌ Bad
query = `SELECT * FROM users WHERE email = '${email}'`

// ✅ Good
query = db.prepare("SELECT * FROM users WHERE email = ?")
result = query.execute([email])
```

---

## 📊 Database Schema (Recommended)

### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  bio TEXT,
  role ENUM('user', 'moderator', 'admin') DEFAULT 'user',
  status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_referral_code ON users(referral_code);
```

### **Articles Table**
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  hero_image VARCHAR(500),
  category VARCHAR(50) NOT NULL,
  author VARCHAR(100),
  status ENUM('draft', 'published', 'scheduled') DEFAULT 'draft',
  published_at TIMESTAMP,
  views INTEGER DEFAULT 0,
  read_time INTEGER,
  seo_meta_title VARCHAR(255),
  seo_meta_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at);
```

### **Article Tags Tables**
```sql
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag VARCHAR(50),
  PRIMARY KEY (article_id, tag)
);

CREATE TABLE article_ecosystem_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  ecosystem VARCHAR(50),
  PRIMARY KEY (article_id, ecosystem)
);

CREATE TABLE article_token_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  token VARCHAR(50),
  PRIMARY KEY (article_id, token)
);
```

### **Courses Table**
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  type ENUM('crypto', 'ecosystem') NOT NULL,
  ecosystem VARCHAR(50),
  category VARCHAR(50),
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  duration_minutes INTEGER,
  xp_reward INTEGER DEFAULT 0,
  status ENUM('draft', 'published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);
```

### **Lessons Table**
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  video_url VARCHAR(500),
  order_index INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **User Progress Table**
```sql
CREATE TABLE user_course_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  PRIMARY KEY (user_id, course_id, lesson_id)
);
```

### **Events Table**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(500),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location VARCHAR(255),
  type VARCHAR(50),
  url VARCHAR(500),
  status ENUM('draft', 'published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Founders Table**
```sql
CREATE TABLE founders (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  bio TEXT,
  photo VARCHAR(500),
  project VARCHAR(100),
  ecosystem VARCHAR(50),
  category VARCHAR(50),
  featured BOOLEAN DEFAULT FALSE,
  status ENUM('draft', 'published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Comments Table**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **XP Transactions Table**
```sql
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Referrals Table**
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  reward_amount INTEGER DEFAULT 0,
  status ENUM('pending', 'approved', 'denied', 'claimed') DEFAULT 'pending',
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Analytics Events Table**
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  properties JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
```

---

## 🚀 Implementation Steps

### **Phase 1: Core Backend Setup**
1. Set up database (PostgreSQL recommended)
2. Create database schema
3. Implement authentication system (JWT)
4. Set up CSRF protection
5. Implement rate limiting
6. Configure CORS for frontend domain

### **Phase 2: Content APIs**
1. Implement News CRUD APIs
2. Implement Learn CRUD APIs
3. Implement Events CRUD APIs
4. Implement Founders CRUD APIs
5. Add file upload handling
6. Add search functionality

### **Phase 3: User Features**
1. Implement XP system APIs
2. Implement referral system APIs
3. Add user profile APIs
4. Add comments system
5. Add save/bookmark functionality

### **Phase 4: Admin Features**
1. Admin authentication & roles
2. Admin analytics APIs
3. Auto-fetch news system
4. Moderation queue APIs
5. Data export functionality
6. System settings APIs

### **Phase 5: Analytics & Optimization**
1. Analytics tracking APIs
2. Behavior tracking
3. Performance monitoring
4. Error logging
5. Email notifications

---

## 🔗 Frontend Integration Points

### **Where to Replace Mock Data**

1. **`/contexts/AuthContext.tsx`**
   - Replace `mockLogin()`, `mockRegister()`, `mockLogout()`
   - Call real `/api/auth/*` endpoints

2. **`/data/mockArticles.ts`**
   - Replace with `GET /api/news` calls
   - Used in: HomePage, CategoryPage, SearchPage

3. **`/data/learnData.ts`**
   - Replace with `GET /api/learn/courses` calls
   - Used in: LearnPage, CrypLearnPage, EcosystemLearnPage

4. **`/data/eventsData.ts`**
   - Replace with `GET /api/events` calls
   - Used in: EventsPage, HomePage

5. **`/data/mockFounders.ts`**
   - Replace with `GET /api/founders` calls
   - Used in: FoundersPage, FounderDetailPage

6. **`/contexts/XPContext.tsx`**
   - Replace `earnXP()` with `POST /api/xp/earn`
   - Call `GET /api/users/me/xp` on load

7. **`/utils/referral.ts`**
   - Replace mock functions with real API calls
   - Connect to `/api/referrals/*` endpoints

8. **`/utils/analytics.ts`**
   - Replace `mockTrack()` with `POST /api/analytics/track`

9. **Admin Pages**
   - All `/pages/admin/*` pages use mock data
   - Replace with corresponding `/api/admin/*` calls

---

## 📦 Environment Variables

```env
# Backend API
REACT_APP_API_URL=https://api.cryplounge.com
REACT_APP_WS_URL=wss://api.cryplounge.com

# Authentication
REACT_APP_JWT_SECRET=your-secret-key
REACT_APP_TOKEN_EXPIRY=86400

# File Upload
REACT_APP_UPLOAD_URL=https://api.cryplounge.com/upload
REACT_APP_MAX_FILE_SIZE=10485760

# Analytics
REACT_APP_ANALYTICS_ID=your-analytics-id

# External Services
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_...
REACT_APP_GOOGLE_CLIENT_ID=...
```

---

## 🧪 Testing Backend Integration

### **Test Checklist**
- [ ] User registration & login
- [ ] Password reset flow
- [ ] Admin authentication
- [ ] News CRUD operations
- [ ] Course enrollment & progress
- [ ] Event RSVP
- [ ] XP earning & leveling
- [ ] Referral code validation
- [ ] Comment posting
- [ ] File uploads
- [ ] Search functionality
- [ ] Analytics tracking
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Error handling
- [ ] Data export

---

## 📞 Support

### **Questions?**
- Review [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
- Check [SECURITY_COMPLETE.md](./SECURITY_COMPLETE.md)
- See [API_INTEGRATIONS_COMPLETE.md](./API_INTEGRATIONS_COMPLETE.md)

### **Found Issues?**
- Check error logs in `/utils/` functions
- Verify token authentication
- Check CORS configuration
- Validate request payloads

---

**Ready for Backend Integration:** ✅  
**Last Updated:** November 14, 2025

For frontend-specific details, see [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md).
