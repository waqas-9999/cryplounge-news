#!/bin/bash

# CrypLounge - Automated Import Path Fixer
# Fixes import paths after structure reorganization
# Run AFTER migrate-structure.sh

set -e

echo "🔧 CrypLounge Import Path Fixer"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if files have been moved
if [ ! -f "src/pages/home/Home.tsx" ]; then
    echo -e "${RED}❌ Error: Files haven't been migrated yet. Run migrate-structure.sh first!${NC}"
    exit 1
fi

echo -e "${BLUE}This script will automatically fix import paths in moved files.${NC}"
echo ""
read -p "$(echo -e ${YELLOW}Continue? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🔍 Analyzing and fixing imports..."
echo ""

# Function to fix imports in a file
fix_imports() {
    local file=$1
    local depth=$2  # How many levels deep from src/
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    echo "  Fixing: $file"
    
    # Calculate relative path to components based on depth
    local to_components=""
    local to_contexts=""
    local to_utils=""
    local to_data=""
    
    for ((i=0; i<depth; i++)); do
        to_components+="../"
        to_contexts+="../"
        to_utils+="../"
        to_data+="../"
    done
    
    # Fix layout component imports
    sed -i.bak "s|from ['\"]\.\.\/components\/Header['\"]|from '${to_components}components/layout/Header'|g" "$file"
    sed -i.bak "s|from ['\"]\.\.\/components\/Footer['\"]|from '${to_components}components/layout/Footer'|g" "$file"
    sed -i.bak "s|from ['\"]\.\.\/components\/admin\/AdminHeader['\"]|from '${to_components}components/layout/AdminHeader'|g" "$file"
    sed -i.bak "s|from ['\"]\.\.\/components\/admin\/AdminSidebar['\"]|from '${to_components}components/layout/AdminSidebar'|g" "$file"
    
    # Fix XP component imports
    sed -i.bak "s|from ['\"]\.\.\/components\/XPWidget['\"]|from '${to_components}components/xp/XPWidget'|g" "$file"
    
    # Fix card component imports
    sed -i.bak "s|from ['\"]\.\.\/components\/ArticleCardSmall['\"]|from '${to_components}components/cards/ArticleCardSmall'|g" "$file"
    sed -i.bak "s|from ['\"]\.\.\/components\/RecommendedCard['\"]|from '${to_components}components/cards/RecommendedCard'|g" "$file"
    
    # Fix comment component imports
    sed -i.bak "s|from ['\"]\.\.\/components\/CommentSection['\"]|from '${to_components}components/comments/CommentSection'|g" "$file"
    
    # Fix form component imports
    sed -i.bak "s|from ['\"]\.\.\/components\/FilterBar['\"]|from '${to_components}components/form/FilterBar'|g" "$file"
    sed -i.bak "s|from ['\"]\.\.\/components\/admin\/CustomDatePicker['\"]|from '${to_components}components/form/CustomDatePicker'|g" "$file"
    
    # Remove backup file
    rm -f "${file}.bak"
}

# Fix imports in page components (depth 2: pages/feature/Page.tsx)
echo "📄 Fixing page component imports..."

fix_imports "src/pages/home/Home.tsx" 2
fix_imports "src/pages/news/NewsCategory.tsx" 2
fix_imports "src/pages/news/NewsDetail.tsx" 2
fix_imports "src/pages/learn/LearnHome.tsx" 2
fix_imports "src/pages/learn/CrypLearn.tsx" 2
fix_imports "src/pages/learn/EcosystemLearnHub.tsx" 2
fix_imports "src/pages/learn/EcosystemLearn.tsx" 2
fix_imports "src/pages/learn/EcosystemCategory.tsx" 2
fix_imports "src/pages/learn/EcosystemOverview.tsx" 2
fix_imports "src/pages/learn/EcosystemTutorials.tsx" 2
fix_imports "src/pages/learn/EcosystemProject.tsx" 2
fix_imports "src/pages/learn/CourseDetail.tsx" 2
fix_imports "src/pages/events/Events.tsx" 2
fix_imports "src/pages/events/EventDetail.tsx" 2
fix_imports "src/pages/founders/Founders.tsx" 2
fix_imports "src/pages/founders/FounderDetail.tsx" 2
fix_imports "src/pages/founders/FounderProject.tsx" 2
fix_imports "src/pages/search/SearchPage.tsx" 2
fix_imports "src/pages/submit/SubmitStory.tsx" 2
fix_imports "src/pages/submit/SubmitEvent.tsx" 2
fix_imports "src/pages/profile/ProfileHome.tsx" 2
fix_imports "src/pages/auth/Login.tsx" 2
fix_imports "src/pages/auth/Signup.tsx" 2
fix_imports "src/pages/auth/Forgot.tsx" 2
fix_imports "src/pages/auth/AdminLogin.tsx" 2
fix_imports "src/pages/static/About.tsx" 2
fix_imports "src/pages/static/Contact.tsx" 2
fix_imports "src/pages/static/Privacy.tsx" 2
fix_imports "src/pages/static/Terms.tsx" 2
fix_imports "src/pages/static/Advertise.tsx" 2
fix_imports "src/pages/static/Careers.tsx" 2

echo ""
echo "🎨 Fixing feature component imports..."

# Fix imports in feature components (depth 3: pages/feature/components/Component.tsx)
fix_imports_deep() {
    local file=$1
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    echo "  Fixing: $file"
    
    # For components 3 levels deep (pages/feature/components/File.tsx)
    # Need ../../../ to reach src/
    
    sed -i.bak "s|from ['\"]\.\.\/components\/ui\/|from '../../../components/ui/|g" "$file"
    sed -i.bak "s|from ['\"]\.\.\/\.\.\/components\/ui\/|from '../../../components/ui/|g" "$file"
    sed -i.bak "s|from ['\"]\.\/\.\.\/components\/ui\/|from '../../../components/ui/|g" "$file"
    
    # Fix context imports
    sed -i.bak "s|from ['\"]\.\.\/contexts\/|from '../../../contexts/|g" "$file"
    sed -i.bak "s|from ['\"]\.\.\/\.\.\/contexts\/|from '../../../contexts/|g" "$file"
    
    # Fix utils imports
    sed -i.bak "s|from ['\"]\.\.\/utils\/|from '../../../utils/|g" "$file"
    sed -i.bak "s|from ['\"]\.\.\/\.\.\/utils\/|from '../../../utils/|g" "$file"
    
    # Fix data imports
    sed -i.bak "s|from ['\"]\.\.\/data\/|from '../../../data/|g" "$file"
    sed -i.bak "s|from ['\"]\.\.\/\.\.\/data\/|from '../../../data/|g" "$file"
    
    rm -f "${file}.bak"
}

# News components
fix_imports_deep "src/pages/news/components/HeroArticle.tsx"
fix_imports_deep "src/pages/news/components/LatestNewsCard.tsx"
fix_imports_deep "src/pages/news/components/TrendingCard.tsx"
fix_imports_deep "src/pages/news/components/FeaturedNewsSection.tsx"
fix_imports_deep "src/pages/news/components/BestOfMonthSection.tsx"

# Learn components
fix_imports_deep "src/pages/learn/components/CourseProgressCard.tsx"
fix_imports_deep "src/pages/learn/components/LatestLearnSection.tsx"
fix_imports_deep "src/pages/learn/components/WelcomeLearnCard.tsx"
fix_imports_deep "src/pages/learn/components/LearnHeroAnimation.tsx"
fix_imports_deep "src/pages/learn/components/CrypLearnHeroAnimation.tsx"
fix_imports_deep "src/pages/learn/components/EcosystemLearnHeroAnimation.tsx"

echo ""
echo "🔧 Fixing layout component imports..."

# Fix imports in layout components (depth 2: components/layout/Component.tsx)
fix_imports "src/components/layout/Header.tsx" 2
fix_imports "src/components/layout/Footer.tsx" 2
fix_imports "src/components/layout/AdminHeader.tsx" 2
fix_imports "src/components/layout/AdminSidebar.tsx" 2

echo ""
echo "📦 Fixing other component imports..."

# Fix imports in other moved components (depth 2: components/type/Component.tsx)
fix_imports "src/components/cards/ArticleCardSmall.tsx" 2
fix_imports "src/components/cards/RecommendedCard.tsx" 2
fix_imports "src/components/xp/XPWidget.tsx" 2
fix_imports "src/components/comments/CommentSection.tsx" 2
fix_imports "src/components/form/FilterBar.tsx" 2
fix_imports "src/components/form/CustomDatePicker.tsx" 2

echo ""
echo "🎯 Fixing cross-component imports..."

# Fix news pages importing their own components
for file in src/pages/news/*.tsx; do
    if [ -f "$file" ]; then
        sed -i.bak "s|from ['\"]\.\.\/components\/HeroArticle['\"]|from './components/HeroArticle'|g" "$file"
        sed -i.bak "s|from ['\"]\.\.\/components\/LatestNewsCard['\"]|from './components/LatestNewsCard'|g" "$file"
        sed -i.bak "s|from ['\"]\.\.\/components\/TrendingCard['\"]|from './components/TrendingCard'|g" "$file"
        sed -i.bak "s|from ['\"]\.\.\/components\/FeaturedNewsSection['\"]|from './components/FeaturedNewsSection'|g" "$file"
        sed -i.bak "s|from ['\"]\.\.\/components\/BestOfMonthSection['\"]|from './components/BestOfMonthSection'|g" "$file"
        rm -f "${file}.bak"
        echo "  Fixed: $file"
    fi
done

# Fix learn pages importing their own components
for file in src/pages/learn/*.tsx; do
    if [ -f "$file" ]; then
        sed -i.bak "s|from ['\"]\.\.\/components\/CourseProgressCard['\"]|from './components/CourseProgressCard'|g" "$file"
        sed -i.bak "s|from ['\"]\.\.\/components\/LatestLearnSection['\"]|from './components/LatestLearnSection'|g" "$file"
        sed -i.bak "s|from ['\"]\.\.\/components\/WelcomeLearnCard['\"]|from './components/WelcomeLearnCard'|g" "$file"
        sed -i.bak "s|from ['\"]\.\.\/components\/LearnHeroAnimation['\"]|from './components/LearnHeroAnimation'|g" "$file"
        sed -i.bak "s|from ['\"]\.\.\/components\/CrypLearnHeroAnimation['\"]|from './components/CrypLearnHeroAnimation'|g" "$file"
        sed -i.bak "s|from ['\"]\.\.\/components\/EcosystemLearnHeroAnimation['\"]|from './components/EcosystemLearnHeroAnimation'|g" "$file"
        rm -f "${file}.bak"
        echo "  Fixed: $file"
    fi
done

echo ""
echo -e "${GREEN}✅ Import path fixing complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "  1. Update App.tsx imports (manual step)"
echo "  2. Run: npm run typecheck"
echo "  3. Check for any remaining import errors"
echo "  4. Run: npm run dev"
echo ""
echo -e "${BLUE}💡 Tip: If you see import errors, check the depth (../) in the import path${NC}"
echo ""
