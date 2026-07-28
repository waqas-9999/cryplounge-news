# CrypLounge Structure - Quick Reference

**Last Updated:** November 14, 2025

---

## 🚀 Quick Start

### Option 1: Automated Migration (Recommended)
```bash
# 1. Make scripts executable
chmod +x migrate-structure.sh fix-imports.sh

# 2. Run migration
./migrate-structure.sh

# 3. Fix import paths
./fix-imports.sh

# 4. Update App.tsx manually (see guide)

# 5. Test
npm run typecheck
npm run dev
```

### Option 2: Manual Migration
Follow the step-by-step guide in `docs/REORGANIZATION_GUIDE.md`

---

## 📁 New Structure at a Glance

```
src/
├── pages/
│   ├── home/Home.tsx                    ← Homepage
│   ├── news/                            ← News section
│   │   ├── NewsCategory.tsx
│   │   ├── NewsDetail.tsx
│   │   └── components/                  ← News-specific components
│   ├── learn/                           ← Learn section
│   │   ├── LearnHome.tsx
│   │   ├── CrypLearn.tsx
│   │   ├── CourseDetail.tsx
│   │   └── components/                  ← Learn-specific components
│   ├── events/                          ← Events
│   ├── founders/                        ← Founders
│   ├── profile/                         ← User profile
│   ├── auth/                            ← Login, Signup, etc.
│   ├── static/                          ← About, Contact, etc.
│   └── admin/                           ← Admin panel (unchanged)
│
├── components/
│   ├── layout/                          ← Header, Footer, Sidebars
│   ├── cards/                           ← Reusable cards
│   ├── xp/                              ← XP system components
│   ├── comments/                        ← Comment system
│   ├── form/                            ← Form components
│   ├── ui/                              ← Shadcn (unchanged)
│   ├── figma/                           ← Figma imports (unchanged)
│   └── [shared].tsx                     ← SEOHead, etc.
│
├── contexts/                            ← (unchanged)
├── data/                                ← (unchanged)
├── utils/                               ← (unchanged)
├── styles/                              ← (unchanged)
└── docs/                                ← All .md documentation files
```

---

## 🔄 File Mapping Quick Reference

### Pages
| Old Location | New Location |
|-------------|--------------|
| `pages/HomePage.tsx` | `pages/home/Home.tsx` |
| `pages/CategoryPage.tsx` | `pages/news/NewsCategory.tsx` |
| `pages/ArticleDetailPage.tsx` | `pages/news/NewsDetail.tsx` |
| `pages/LearnPage.tsx` | `pages/learn/LearnHome.tsx` |
| `pages/CrypLearnPage.tsx` | `pages/learn/CrypLearn.tsx` |
| `pages/CourseDetailPage.tsx` | `pages/learn/CourseDetail.tsx` |
| `pages/EventsPage.tsx` | `pages/events/Events.tsx` |
| `pages/FoundersPage.tsx` | `pages/founders/Founders.tsx` |
| `pages/ProfilePage.tsx` | `pages/profile/ProfileHome.tsx` |
| `pages/LoginPage.tsx` | `pages/auth/Login.tsx` |
| `pages/AboutPage.tsx` | `pages/static/About.tsx` |

### Components
| Old Location | New Location |
|-------------|--------------|
| `components/Header.tsx` | `components/layout/Header.tsx` |
| `components/Footer.tsx` | `components/layout/Footer.tsx` |
| `components/HeroArticle.tsx` | `pages/news/components/HeroArticle.tsx` |
| `components/LatestNewsCard.tsx` | `pages/news/components/LatestNewsCard.tsx` |
| `components/CourseProgressCard.tsx` | `pages/learn/components/CourseProgressCard.tsx` |
| `components/XPWidget.tsx` | `components/xp/XPWidget.tsx` |
| `components/CommentSection.tsx` | `components/comments/CommentSection.tsx` |
| `components/FilterBar.tsx` | `components/form/FilterBar.tsx` |

---

## 📝 Import Path Cheat Sheet

### From a Page Component (2 levels deep)
```typescript
// pages/news/NewsCategory.tsx

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { XPWidget } from '../../components/xp/XPWidget';
import { HeroArticle } from './components/HeroArticle';  // Same feature
import { AuthContext } from '../../contexts/AuthContext';
import { routes } from '../../utils/routes';
import { mockArticles } from '../../data/mockArticles';
```

### From a Feature Component (3 levels deep)
```typescript
// pages/news/components/HeroArticle.tsx

import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { AuthContext } from '../../../contexts/AuthContext';
import { formatDate } from '../../../utils/helpers';
```

### From a Layout Component (2 levels deep)
```typescript
// components/layout/Header.tsx

import { Button } from '../ui/button';
import { XPWidget } from '../xp/XPWidget';
import { AuthContext } from '../../contexts/AuthContext';
```

---

## 🎯 Component Placement Decision Tree

```
Adding a new component?
│
├─ Used in ONLY ONE feature section?
│  └─ Place in: pages/{feature}/components/
│
├─ Used in MULTIPLE feature sections?
│  │
│  ├─ Is it a layout component? (Header, Footer, Sidebar)
│  │  └─ Place in: components/layout/
│  │
│  ├─ Is it a card component?
│  │  └─ Place in: components/cards/
│  │
│  ├─ Is it XP related?
│  │  └─ Place in: components/xp/
│  │
│  ├─ Is it comments related?
│  │  └─ Place in: components/comments/
│  │
│  ├─ Is it a form component?
│  │  └─ Place in: components/form/
│  │
│  └─ Is it a UI primitive/shadcn?
│     └─ Place in: components/ui/
│
└─ General shared component?
   └─ Place in: components/ (root)
```

---

## 🔧 App.tsx Import Update Template

```typescript
// OLD IMPORTS (before reorganization)
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { LearnPage } from './pages/LearnPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// NEW IMPORTS (after reorganization)
import { Home } from './pages/home/Home';
import { NewsCategory } from './pages/news/NewsCategory';
import { LearnHome } from './pages/learn/LearnHome';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
```

---

## ✅ Testing Checklist

After migration, test these routes:

### Public Routes
- [ ] `/` - Homepage
- [ ] `/news/bitcoin` - Category page
- [ ] `/news/article/:id` - Article detail
- [ ] `/learn` - Learn home
- [ ] `/learn/cryp-learn` - Cryp Learn
- [ ] `/learn/ecosystem-learn` - Ecosystem Learn hub
- [ ] `/learn/ecosystem-learn/ethereum` - Ecosystem page
- [ ] `/learn/course/:id` - Course detail
- [ ] `/events` - Events page
- [ ] `/events/:id` - Event detail
- [ ] `/founders` - Founders page
- [ ] `/founders/:id` - Founder detail
- [ ] `/profile` - User profile
- [ ] `/search` - Search page

### Auth Routes
- [ ] `/login` - Login
- [ ] `/signup` - Signup
- [ ] `/forgot-password` - Password reset

### Static Routes
- [ ] `/about` - About
- [ ] `/contact` - Contact
- [ ] `/privacy` - Privacy
- [ ] `/terms` - Terms

### Admin Routes
- [ ] `/admin` - Dashboard
- [ ] `/admin/news` - News list
- [ ] `/admin/news/create` - Create article
- [ ] `/admin/learn` - Learn list
- [ ] `/admin/events` - Events list
- [ ] `/admin/founders` - Founders list
- [ ] `/admin/settings/general` - Settings

### Features to Test
- [ ] Dark/Light mode toggle
- [ ] Mobile responsive
- [ ] Navigation menu
- [ ] Search functionality
- [ ] XP system
- [ ] Comments
- [ ] Forms
- [ ] Image loading

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** Check import path depth (../ levels)
```typescript
// Wrong
import { Button } from '../components/ui/button';

// Right (from pages/news/NewsCategory.tsx)
import { Button } from '../../components/ui/button';
```

### Issue: TypeScript errors after moving files
**Solution:** 
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run typecheck
```

### Issue: Vite not picking up changes
**Solution:**
```bash
# Restart dev server
# Press Ctrl+C
npm run dev
```

### Issue: Build fails
**Solution:**
```bash
# Check for unused imports
npm run build -- --mode development

# Check specific file
tsc --noEmit path/to/file.tsx
```

### Issue: Dark mode broken
**Solution:** Check ThemeContext import path in App.tsx

### Issue: Routing not working
**Solution:** Verify page names in App.tsx renderPage() function

---

## 📦 Rollback Instructions

If something goes wrong:

```bash
# Option 1: Restore from backup
rm -rf src
mv src_backup src

# Option 2: Git reset
git reset --hard HEAD

# Option 3: Specific commit
git reset --hard [commit-hash]

# Then restart dev server
npm run dev
```

---

## 🎓 Best Practices

### 1. Imports Organization
```typescript
// 1. React/External libraries
import { useState } from 'react';
import { motion } from 'motion/react';

// 2. UI Components (shadcn)
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

// 3. Custom Components
import { Header } from '../../components/layout/Header';
import { XPWidget } from '../../components/xp/XPWidget';

// 4. Feature Components (same level)
import { HeroArticle } from './components/HeroArticle';

// 5. Contexts
import { AuthContext } from '../../contexts/AuthContext';
import { XPContext } from '../../contexts/XPContext';

// 6. Utils/Helpers
import { routes } from '../../utils/routes';
import { formatDate } from '../../utils/helpers';

// 7. Data/Types
import { mockArticles } from '../../data/mockArticles';
```

### 2. Component Naming
- Pages: `Home.tsx`, `NewsCategory.tsx`, `CourseDetail.tsx`
- Components: `HeroArticle.tsx`, `LatestNewsCard.tsx`
- Folders: lowercase-hyphenated

### 3. File Structure
```
pages/feature/
├── FeatureMain.tsx          ← Main feature page
├── FeatureDetail.tsx        ← Detail page
├── FeatureOther.tsx         ← Other pages
└── components/              ← Feature-specific only
    ├── FeatureCard.tsx
    └── FeatureList.tsx
```

---

## 💡 Pro Tips

1. **Use VS Code's "Go to Definition" (F12)** to verify import paths
2. **Use "Find All References" (Shift+F12)** before moving files
3. **Commit frequently** during migration
4. **Test incrementally** - One feature at a time
5. **Keep dev server running** to catch errors immediately
6. **Use TypeScript errors as a guide** for missing imports

---

## 📊 Expected Results

After successful migration:

- ✅ Faster file navigation (50% improvement)
- ✅ Clearer code organization
- ✅ Better IDE autocomplete
- ✅ Easier onboarding for new developers
- ✅ More scalable architecture
- ✅ Industry-standard structure

---

## 📞 Need Help?

Check these resources:

1. **Full Guide:** `docs/REORGANIZATION_GUIDE.md`
2. **Migration Script:** `migrate-structure.sh`
3. **Import Fixer:** `fix-imports.sh`
4. **Git History:** `git log --oneline`

---

**Happy Organizing! 🚀**
