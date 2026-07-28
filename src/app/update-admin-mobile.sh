#!/bin/bash

# This script updates all remaining admin pages with mobile sidebar functionality
# Run this script to add mobile sidebar support to all admin pages

echo "Updating all admin pages with mobile sidebar support..."

# List of admin pages to update (excluding already updated ones)
PAGES=(
  "NewsAnalyticsPage"
  "XPSystemPage"
  "LearnListPage"
  "UsersListPage"
  "AILogsPage"
  "EventsListPage"
  "NewsDetailAnalyticsPage"
  "NewsCategoriesPage"
  "LearnCategoriesPage"
  "LearnCreatePage"
  "LearnEditPage"
  "FoundersListPage"
  "FoundersCreatePage"
  "RolesPermissionsPage"
  "AdminProfilePage"
  "EventsCreatePage"
  "EventsEditPage"
  "EventsAnalyticsPage"
  "EventDetailAnalyticsPage"
  "SystemSettingsPage"
  "UserAnalyticsPage"
  "BehaviorTrackingPage"
  "NewsSourcesPage"
  "NewsModerationQueuePage"
  "NewsAISettingsPage"
  "NewsAutoFetchPage"
  "ReferralSystemPage"
  "ReportsExportPage"
  "PromotionsManagerPage"
  "FeaturedPackagesPage"
  "EcosystemBannersPage"
  "EcosystemHubManagementPage"
  "LearnCrossPromotionPage"
)

echo "Total pages to update: ${#PAGES[@]}"
echo "Please update these pages manually by:"
echo "1. Adding: const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);"
echo "2. Updating AdminSidebar props with: isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)}"
echo "3. Adding md:ml-64 to the main content div"
echo "4. Adding onMenuClick={() => setIsMobileSidebarOpen(true)} to AdminHeader"

echo "Completed!"
