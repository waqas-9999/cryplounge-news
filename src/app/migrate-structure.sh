#!/bin/bash

# CrypLounge Frontend - Automated Structure Migration
# Date: November 14, 2025
# WARNING: This script will move files. Create a backup first!

set -e  # Exit on error

echo "🚀 CrypLounge Frontend Structure Migration"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Confirm before proceeding
read -p "$(echo -e ${YELLOW}⚠️  This will reorganize your entire src/ folder. Continue? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Migration cancelled"
    exit 1
fi

echo ""
echo "📋 Pre-flight checks..."

# Check if we're in the right directory
if [ ! -d "src" ]; then
    echo -e "${RED}❌ Error: src/ directory not found. Are you in the project root?${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Directory structure looks good${NC}"

# Create backup
echo ""
echo "💾 Creating backup..."
if [ -d "src_backup" ]; then
    echo -e "${YELLOW}⚠️  Backup folder already exists. Overwriting...${NC}"
    rm -rf src_backup
fi
cp -r src src_backup
echo -e "${GREEN}✓ Backup created at src_backup/${NC}"

# Create Git checkpoint
echo ""
echo "📌 Creating Git checkpoint..."
git add . 2>/dev/null || true
git commit -m "Pre-reorganization checkpoint (automated backup)" 2>/dev/null || echo "No changes to commit"
echo -e "${GREEN}✓ Git checkpoint created${NC}"

# Create new folder structure
echo ""
echo "📁 Creating new folder structure..."

mkdir -p src/pages/home/components
mkdir -p src/pages/news/components
mkdir -p src/pages/learn/components
mkdir -p src/pages/events/components
mkdir -p src/pages/founders/components
mkdir -p src/pages/search
mkdir -p src/pages/submit
mkdir -p src/pages/profile/components
mkdir -p src/pages/auth
mkdir -p src/pages/static
mkdir -p src/components/layout
mkdir -p src/components/cards
mkdir -p src/components/xp
mkdir -p src/components/comments
mkdir -p src/components/form
mkdir -p docs

echo -e "${GREEN}✓ Folder structure created${NC}"

# Move Pages
echo ""
echo "📄 Migrating page files..."

# Home
[ -f "src/pages/HomePage.tsx" ] && mv src/pages/HomePage.tsx src/pages/home/Home.tsx && echo "  ✓ HomePage → home/Home"

# News
[ -f "src/pages/CategoryPage.tsx" ] && mv src/pages/CategoryPage.tsx src/pages/news/NewsCategory.tsx && echo "  ✓ CategoryPage → news/NewsCategory"
[ -f "src/pages/ArticleDetailPage.tsx" ] && mv src/pages/ArticleDetailPage.tsx src/pages/news/NewsDetail.tsx && echo "  ✓ ArticleDetailPage → news/NewsDetail"

# Learn
[ -f "src/pages/LearnPage.tsx" ] && mv src/pages/LearnPage.tsx src/pages/learn/LearnHome.tsx && echo "  ✓ LearnPage → learn/LearnHome"
[ -f "src/pages/CrypLearnPage.tsx" ] && mv src/pages/CrypLearnPage.tsx src/pages/learn/CrypLearn.tsx && echo "  ✓ CrypLearnPage → learn/CrypLearn"
[ -f "src/pages/EcosystemLearnHubPage.tsx" ] && mv src/pages/EcosystemLearnHubPage.tsx src/pages/learn/EcosystemLearnHub.tsx && echo "  ✓ EcosystemLearnHubPage → learn/EcosystemLearnHub"
[ -f "src/pages/EcosystemLearnPage.tsx" ] && mv src/pages/EcosystemLearnPage.tsx src/pages/learn/EcosystemLearn.tsx && echo "  ✓ EcosystemLearnPage → learn/EcosystemLearn"
[ -f "src/pages/EcosystemCategoryPage.tsx" ] && mv src/pages/EcosystemCategoryPage.tsx src/pages/learn/EcosystemCategory.tsx && echo "  ✓ EcosystemCategoryPage → learn/EcosystemCategory"
[ -f "src/pages/EcosystemOverviewPage.tsx" ] && mv src/pages/EcosystemOverviewPage.tsx src/pages/learn/EcosystemOverview.tsx && echo "  ✓ EcosystemOverviewPage → learn/EcosystemOverview"
[ -f "src/pages/EcosystemTutorialsPage.tsx" ] && mv src/pages/EcosystemTutorialsPage.tsx src/pages/learn/EcosystemTutorials.tsx && echo "  ✓ EcosystemTutorialsPage → learn/EcosystemTutorials"
[ -f "src/pages/EcosystemProjectPage.tsx" ] && mv src/pages/EcosystemProjectPage.tsx src/pages/learn/EcosystemProject.tsx && echo "  ✓ EcosystemProjectPage → learn/EcosystemProject"
[ -f "src/pages/CourseDetailPage.tsx" ] && mv src/pages/CourseDetailPage.tsx src/pages/learn/CourseDetail.tsx && echo "  ✓ CourseDetailPage → learn/CourseDetail"

# Events
[ -f "src/pages/EventsPage.tsx" ] && mv src/pages/EventsPage.tsx src/pages/events/Events.tsx && echo "  ✓ EventsPage → events/Events"
[ -f "src/pages/EventDetailPage.tsx" ] && mv src/pages/EventDetailPage.tsx src/pages/events/EventDetail.tsx && echo "  ✓ EventDetailPage → events/EventDetail"

# Founders
[ -f "src/pages/FoundersPage.tsx" ] && mv src/pages/FoundersPage.tsx src/pages/founders/Founders.tsx && echo "  ✓ FoundersPage → founders/Founders"
[ -f "src/pages/FounderDetailPage.tsx" ] && mv src/pages/FounderDetailPage.tsx src/pages/founders/FounderDetail.tsx && echo "  ✓ FounderDetailPage → founders/FounderDetail"
[ -f "src/pages/FounderProjectPage.tsx" ] && mv src/pages/FounderProjectPage.tsx src/pages/founders/FounderProject.tsx && echo "  ✓ FounderProjectPage → founders/FounderProject"

# Search
[ -f "src/pages/SearchPage.tsx" ] && mv src/pages/SearchPage.tsx src/pages/search/SearchPage.tsx && echo "  ✓ SearchPage → search/SearchPage"

# Submit
[ -f "src/pages/SubmitStoryPage.tsx" ] && mv src/pages/SubmitStoryPage.tsx src/pages/submit/SubmitStory.tsx && echo "  ✓ SubmitStoryPage → submit/SubmitStory"
[ -f "src/pages/SubmitEventPage.tsx" ] && mv src/pages/SubmitEventPage.tsx src/pages/submit/SubmitEvent.tsx && echo "  ✓ SubmitEventPage → submit/SubmitEvent"

# Profile
[ -f "src/pages/ProfilePage.tsx" ] && mv src/pages/ProfilePage.tsx src/pages/profile/ProfileHome.tsx && echo "  ✓ ProfilePage → profile/ProfileHome"

# Auth
[ -f "src/pages/LoginPage.tsx" ] && mv src/pages/LoginPage.tsx src/pages/auth/Login.tsx && echo "  ✓ LoginPage → auth/Login"
[ -f "src/pages/SignupPage.tsx" ] && mv src/pages/SignupPage.tsx src/pages/auth/Signup.tsx && echo "  ✓ SignupPage → auth/Signup"
[ -f "src/pages/ForgotPasswordPage.tsx" ] && mv src/pages/ForgotPasswordPage.tsx src/pages/auth/Forgot.tsx && echo "  ✓ ForgotPasswordPage → auth/Forgot"
[ -f "src/pages/admin/AdminLoginPage.tsx" ] && mv src/pages/admin/AdminLoginPage.tsx src/pages/auth/AdminLogin.tsx && echo "  ✓ AdminLoginPage → auth/AdminLogin"

# Static
[ -f "src/pages/AboutPage.tsx" ] && mv src/pages/AboutPage.tsx src/pages/static/About.tsx && echo "  ✓ AboutPage → static/About"
[ -f "src/pages/ContactPage.tsx" ] && mv src/pages/ContactPage.tsx src/pages/static/Contact.tsx && echo "  ✓ ContactPage → static/Contact"
[ -f "src/pages/PrivacyPage.tsx" ] && mv src/pages/PrivacyPage.tsx src/pages/static/Privacy.tsx && echo "  ✓ PrivacyPage → static/Privacy"
[ -f "src/pages/TermsPage.tsx" ] && mv src/pages/TermsPage.tsx src/pages/static/Terms.tsx && echo "  ✓ TermsPage → static/Terms"
[ -f "src/pages/AdvertisePage.tsx" ] && mv src/pages/AdvertisePage.tsx src/pages/static/Advertise.tsx && echo "  ✓ AdvertisePage → static/Advertise"
[ -f "src/pages/CareersPage.tsx" ] && mv src/pages/CareersPage.tsx src/pages/static/Careers.tsx && echo "  ✓ CareersPage → static/Careers"

echo -e "${GREEN}✓ Pages migrated${NC}"

# Move Components
echo ""
echo "🎨 Migrating component files..."

# Layout
[ -f "src/components/Header.tsx" ] && mv src/components/Header.tsx src/components/layout/Header.tsx && echo "  ✓ Header → layout/Header"
[ -f "src/components/Footer.tsx" ] && mv src/components/Footer.tsx src/components/layout/Footer.tsx && echo "  ✓ Footer → layout/Footer"
[ -f "src/components/admin/AdminHeader.tsx" ] && mv src/components/admin/AdminHeader.tsx src/components/layout/AdminHeader.tsx && echo "  ✓ AdminHeader → layout/AdminHeader"
[ -f "src/components/admin/AdminSidebar.tsx" ] && mv src/components/admin/AdminSidebar.tsx src/components/layout/AdminSidebar.tsx && echo "  ✓ AdminSidebar → layout/AdminSidebar"

# News components to pages
[ -f "src/components/HeroArticle.tsx" ] && mv src/components/HeroArticle.tsx src/pages/news/components/HeroArticle.tsx && echo "  ✓ HeroArticle → news/components"
[ -f "src/components/LatestNewsCard.tsx" ] && mv src/components/LatestNewsCard.tsx src/pages/news/components/LatestNewsCard.tsx && echo "  ✓ LatestNewsCard → news/components"
[ -f "src/components/TrendingCard.tsx" ] && mv src/components/TrendingCard.tsx src/pages/news/components/TrendingCard.tsx && echo "  ✓ TrendingCard → news/components"
[ -f "src/components/FeaturedNewsSection.tsx" ] && mv src/components/FeaturedNewsSection.tsx src/pages/news/components/FeaturedNewsSection.tsx && echo "  ✓ FeaturedNewsSection → news/components"
[ -f "src/components/BestOfMonthSection.tsx" ] && mv src/components/BestOfMonthSection.tsx src/pages/news/components/BestOfMonthSection.tsx && echo "  ✓ BestOfMonthSection → news/components"

# Learn components to pages
[ -f "src/components/CourseProgressCard.tsx" ] && mv src/components/CourseProgressCard.tsx src/pages/learn/components/CourseProgressCard.tsx && echo "  ✓ CourseProgressCard → learn/components"
[ -f "src/components/LatestLearnSection.tsx" ] && mv src/components/LatestLearnSection.tsx src/pages/learn/components/LatestLearnSection.tsx && echo "  ✓ LatestLearnSection → learn/components"
[ -f "src/components/WelcomeLearnCard.tsx" ] && mv src/components/WelcomeLearnCard.tsx src/pages/learn/components/WelcomeLearnCard.tsx && echo "  ✓ WelcomeLearnCard → learn/components"
[ -f "src/components/LearnHeroAnimation.tsx" ] && mv src/components/LearnHeroAnimation.tsx src/pages/learn/components/LearnHeroAnimation.tsx && echo "  ✓ LearnHeroAnimation → learn/components"
[ -f "src/components/CrypLearnHeroAnimation.tsx" ] && mv src/components/CrypLearnHeroAnimation.tsx src/pages/learn/components/CrypLearnHeroAnimation.tsx && echo "  ✓ CrypLearnHeroAnimation → learn/components"
[ -f "src/components/EcosystemLearnHeroAnimation.tsx" ] && mv src/components/EcosystemLearnHeroAnimation.tsx src/pages/learn/components/EcosystemLearnHeroAnimation.tsx && echo "  ✓ EcosystemLearnHeroAnimation → learn/components"

# Cards
[ -f "src/components/ArticleCardSmall.tsx" ] && mv src/components/ArticleCardSmall.tsx src/components/cards/ArticleCardSmall.tsx && echo "  ✓ ArticleCardSmall → cards"
[ -f "src/components/RecommendedCard.tsx" ] && mv src/components/RecommendedCard.tsx src/components/cards/RecommendedCard.tsx && echo "  ✓ RecommendedCard → cards"

# XP
[ -f "src/components/XPWidget.tsx" ] && mv src/components/XPWidget.tsx src/components/xp/XPWidget.tsx && echo "  ✓ XPWidget → xp"

# Comments
[ -f "src/components/CommentSection.tsx" ] && mv src/components/CommentSection.tsx src/components/comments/CommentSection.tsx && echo "  ✓ CommentSection → comments"

# Form
[ -f "src/components/FilterBar.tsx" ] && mv src/components/FilterBar.tsx src/components/form/FilterBar.tsx && echo "  ✓ FilterBar → form"
[ -f "src/components/admin/CustomDatePicker.tsx" ] && mv src/components/admin/CustomDatePicker.tsx src/components/form/CustomDatePicker.tsx && echo "  ✓ CustomDatePicker → form"

echo -e "${GREEN}✓ Components migrated${NC}"

# Clean up empty directories
echo ""
echo "🧹 Cleaning up..."
[ -d "src/components/admin" ] && rmdir src/components/admin 2>/dev/null && echo "  ✓ Removed empty admin folder"

# Move documentation
echo ""
echo "📚 Migrating documentation..."
mv *.md docs/ 2>/dev/null || true
[ -f "docs/README.md" ] && mv docs/README.md . && echo "  ✓ Kept README.md in root"
echo -e "${GREEN}✓ Documentation migrated${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Migration Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo ""
echo "1. Update App.tsx imports (see REORGANIZATION_GUIDE.md)"
echo "2. Fix import paths in moved files"
echo "3. Run: npm run typecheck"
echo "4. Run: npm run dev"
echo "5. Test all routes"
echo ""
echo -e "${YELLOW}📋 Checklist:${NC}"
echo "  [ ] Update App.tsx imports"
echo "  [ ] Fix component imports in pages"
echo "  [ ] Test all public routes"
echo "  [ ] Test all admin routes"
echo "  [ ] Check dark mode"
echo "  [ ] Check mobile responsive"
echo "  [ ] Run build: npm run build"
echo ""
echo -e "${GREEN}💾 Backup location:${NC} src_backup/"
echo -e "${GREEN}📖 Full guide:${NC} docs/REORGANIZATION_GUIDE.md"
echo ""
echo -e "${YELLOW}🚨 If something breaks:${NC}"
echo "  Restore from backup: rm -rf src && mv src_backup src"
echo "  OR git reset: git reset --hard HEAD"
echo ""
echo "Happy coding! 🚀"
