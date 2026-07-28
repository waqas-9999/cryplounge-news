// Dashboard Data Aggregation Utility
// Pulls data from all contexts and mock data files for comprehensive admin dashboard

import { mockArticles } from '../data/mockArticles';
import { mockTutorials } from '../data/mockTutorials';
import { mockEvents } from '../data/mockEvents';
import { mockReferralRecords, mockReferralStats } from '../data/mockReferrals';

// Calculate date ranges
export const getDateRangeData = (filter: string, customStart?: Date, customEnd?: Date) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (filter) {
    case 'Today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'custom':
      startDate = customStart || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = customEnd || now;
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate };
};

// Get overview stats with comparison
export const getOverviewStats = (dateFilter: string, customStart?: Date, customEnd?: Date) => {
  const { startDate, endDate } = getDateRangeData(dateFilter, customStart, customEnd);
  
  // Calculate total views from articles
  const totalViews = mockArticles.reduce((sum, article) => sum + (article.views || 0), 0);
  const previousPeriodViews = Math.floor(totalViews * 0.88); // Mock previous period
  const viewsChange = ((totalViews - previousPeriodViews) / previousPeriodViews * 100).toFixed(1);
  
  // Calculate total users (active + total from referrals)
  const totalUsers = mockReferralRecords.length + 2500;
  const previousUsers = Math.floor(totalUsers * 0.92);
  const usersChange = ((totalUsers - previousUsers) / previousUsers * 100).toFixed(1);
  
  // Calculate total content
  const totalContent = mockArticles.length + mockTutorials.length + mockEvents.length;
  const previousContent = totalContent - 12;
  const contentChange = ((totalContent - previousContent) / previousContent * 100).toFixed(1);
  
  // Calculate engagement rate
  const totalEngagements = mockArticles.reduce((sum, a) => sum + (a.shares || 0) + (a.likes || 0), 0);
  const engagementRate = ((totalEngagements / totalViews) * 100).toFixed(1);
  const previousEngagement = parseFloat(engagementRate) - 2.3;
  const engagementChange = ((parseFloat(engagementRate) - previousEngagement) / previousEngagement * 100).toFixed(1);

  return {
    totalViews,
    viewsChange,
    viewsTrend: parseFloat(viewsChange) > 0 ? 'up' : 'down',
    totalUsers,
    usersChange,
    usersTrend: parseFloat(usersChange) > 0 ? 'up' : 'down',
    totalContent,
    contentChange,
    contentTrend: parseFloat(contentChange) > 0 ? 'up' : 'down',
    engagementRate: parseFloat(engagementRate),
    engagementChange,
    engagementTrend: parseFloat(engagementChange) > 0 ? 'up' : 'down',
  };
};

// Get content pipeline stats
export const getContentPipeline = () => {
  const published = mockArticles.filter(a => a.status === 'published').length;
  const pending = mockArticles.filter(a => a.status === 'pending' || a.status === 'draft').length;
  const scheduled = mockArticles.filter(a => a.status === 'scheduled').length;
  const drafts = mockArticles.filter(a => a.status === 'draft').length;

  return {
    published,
    pending,
    scheduled,
    drafts,
    total: published + pending + scheduled + drafts,
  };
};

// Get category performance with real data
export const getCategoryPerformance = () => {
  const categories: { [key: string]: { views: number; articles: number } } = {};
  
  mockArticles.forEach(article => {
    const cat = article.category || 'Uncategorized';
    if (!categories[cat]) {
      categories[cat] = { views: 0, articles: 0 };
    }
    categories[cat].views += article.views || 0;
    categories[cat].articles += 1;
  });

  const maxViews = Math.max(...Object.values(categories).map(c => c.views));

  return Object.entries(categories)
    .map(([name, data]) => ({
      name,
      views: data.views,
      articles: data.articles,
      engagement: Math.round((data.views / maxViews) * 100),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);
};

// Get top performing articles
export const getTopArticles = (limit = 10) => {
  return mockArticles
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit)
    .map(article => ({
      id: article.id,
      title: article.title,
      views: article.views || 0,
      ctr: ((article.shares || 0) / (article.views || 1) * 100).toFixed(1),
      engagement: (article.likes || 0) + (article.shares || 0),
      category: article.category,
    }));
};

// Get top countries (mock data with realistic distribution)
export const getTopCountries = () => {
  return [
    { name: 'United States', flag: '🇺🇸', users: 2845, percentage: 32.5 },
    { name: 'United Kingdom', flag: '🇬🇧', users: 1823, percentage: 20.8 },
    { name: 'Germany', flag: '🇩🇪', users: 1456, percentage: 16.6 },
    { name: 'Canada', flag: '🇨🇦', users: 982, percentage: 11.2 },
    { name: 'Australia', flag: '🇦🇺', users: 756, percentage: 8.6 },
    { name: 'Netherlands', flag: '🇳🇱', users: 543, percentage: 6.2 },
  ];
};

// Get user breakdown by device/theme
export const getUserBreakdown = (totalUsers: number) => {
  return {
    desktop: Math.floor(totalUsers * 0.58),
    mobile: Math.floor(totalUsers * 0.35),
    tablet: Math.floor(totalUsers * 0.07),
    darkMode: Math.floor(totalUsers * 0.68),
    lightMode: Math.floor(totalUsers * 0.32),
  };
};

// Get traffic sources
export const getTrafficSources = () => {
  return [
    { source: 'Direct', visitors: 4532, percentage: 42.3, change: '+8.2%', trend: 'up' },
    { source: 'Search', visitors: 3215, percentage: 30.1, change: '+12.5%', trend: 'up' },
    { source: 'Social', visitors: 1876, percentage: 17.5, change: '-3.1%', trend: 'down' },
    { source: 'Referral', visitors: 1089, percentage: 10.1, change: '+5.8%', trend: 'up' },
  ];
};

// Get Learn section metrics
export const getLearnMetrics = () => {
  const totalTutorials = mockTutorials.length;
  const totalCompletions = mockTutorials.reduce((sum, t) => sum + (t.enrollments || 0), 0);
  const avgProgress = mockTutorials.reduce((sum, t) => sum + (t.completionRate || 0), 0) / totalTutorials;

  const categoryStats = mockTutorials.reduce((acc: any, tutorial) => {
    const cat = tutorial.category || 'General';
    if (!acc[cat]) {
      acc[cat] = { count: 0, enrollments: 0 };
    }
    acc[cat].count += 1;
    acc[cat].enrollments += tutorial.enrollments || 0;
    return acc;
  }, {});

  return {
    totalTutorials,
    totalCompletions,
    avgProgress: avgProgress.toFixed(1),
    categories: Object.entries(categoryStats).map(([name, data]: [string, any]) => ({
      name,
      count: data.count,
      enrollments: data.enrollments,
    })),
  };
};

// Get Events metrics
export const getEventsMetrics = () => {
  const now = new Date();
  const upcoming = mockEvents.filter(e => new Date(e.date) > now).length;
  const totalRegistrations = mockEvents.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);
  const avgAttendance = mockEvents.length > 0 ? Math.floor(totalRegistrations / mockEvents.length) : 0;

  return {
    upcoming,
    total: mockEvents.length,
    totalRegistrations,
    avgAttendance,
    topEvent: mockEvents.sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0))[0],
  };
};

// Get XP system overview
export const getXPOverview = () => {
  // Calculate from referral system (includes XP data)
  const totalXP = mockReferralStats.totalXPEarned + 15000;
  const todayXP = Math.floor(totalXP * 0.05);
  
  return {
    totalXP,
    todayXP,
    topEarners: [
      { name: 'Alex Chen', xp: 2340, avatar: 'AC' },
      { name: 'Sarah Miller', xp: 1895, avatar: 'SM' },
      { name: 'Mike Johnson', xp: 1654, avatar: 'MJ' },
    ],
  };
};

// Get Referral system stats
export const getReferralStats = () => {
  const totalReferrals = mockReferralStats.totalReferrals;
  const successfulReferrals = mockReferralStats.completedReferrals;
  const conversionRate = totalReferrals > 0 ? ((successfulReferrals / totalReferrals) * 100).toFixed(1) : '0';
  const pendingRewards = mockReferralRecords.filter(r => !r.xpClaimed && r.xpEarned > 0).length;

  return {
    totalReferrals,
    successfulReferrals,
    conversionRate: parseFloat(conversionRate),
    pendingRewards,
    topReferrers: mockReferralRecords
      .filter(r => r.status === 'completed')
      .sort((a, b) => b.xpEarned - a.xpEarned)
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        referrerName: r.referredUserName,
        totalReferrals: 1,
        successfulReferrals: r.status === 'completed' ? 1 : 0,
        xpEarned: r.xpEarned,
      })),
  };
};

// Get content health metrics
export const getContentHealth = () => {
  // AI quality scores distribution
  const qualityScores = mockArticles.map(a => a.qualityScore || 75);
  const avgQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
  
  const excellent = qualityScores.filter(s => s >= 90).length;
  const good = qualityScores.filter(s => s >= 75 && s < 90).length;
  const fair = qualityScores.filter(s => s >= 60 && s < 75).length;
  const poor = qualityScores.filter(s => s < 60).length;

  return {
    avgQuality: avgQuality.toFixed(1),
    distribution: { excellent, good, fair, poor },
    totalArticles: mockArticles.length,
  };
};

// Get system alerts
export const getSystemAlerts = () => {
  const contentPipeline = getContentPipeline();
  const referralStats = getReferralStats();

  const alerts = [];

  if (contentPipeline.pending > 5) {
    alerts.push({
      type: 'warning',
      message: `${contentPipeline.pending} articles pending moderation`,
      action: 'moderation-queue',
      priority: 'high',
    });
  }

  if (referralStats.pendingRewards > 10) {
    alerts.push({
      type: 'info',
      message: `${referralStats.pendingRewards} referral rewards pending`,
      action: 'referral-system',
      priority: 'medium',
    });
  }

  if (contentPipeline.scheduled > 0) {
    alerts.push({
      type: 'success',
      message: `${contentPipeline.scheduled} articles scheduled for publishing`,
      action: 'scheduled-posts',
      priority: 'low',
    });
  }

  return alerts;
};

// Get recent activity timeline
export const getRecentActivity = () => {
  const activities = [];

  // Mix of different activity types
  const recentArticles = mockArticles.slice(0, 3);
  const recentEvents = mockEvents.slice(0, 2);
  const recentTutorials = mockTutorials.slice(0, 2);

  recentArticles.forEach(article => {
    activities.push({
      type: 'article',
      title: `New article published: ${article.title}`,
      time: '2 hours ago',
      user: article.author,
      icon: 'FileText',
      action: 'news-list',
    });
  });

  recentEvents.forEach(event => {
    activities.push({
      type: 'event',
      title: `Event created: ${event.title}`,
      time: '5 hours ago',
      user: 'Admin',
      icon: 'Calendar',
      action: 'events-list',
    });
  });

  recentTutorials.forEach(tutorial => {
    activities.push({
      type: 'tutorial',
      title: `Tutorial published: ${tutorial.title}`,
      time: '1 day ago',
      user: 'Learn Team',
      icon: 'GraduationCap',
      action: 'learn-list',
    });
  });

  return activities.slice(0, 10);
};

// Get engagement details
export const getEngagementDetails = () => {
  const totalComments = mockArticles.reduce((sum, a) => sum + (a.comments || 0), 0);
  const totalShares = mockArticles.reduce((sum, a) => sum + (a.shares || 0), 0);
  const totalLikes = mockArticles.reduce((sum, a) => sum + (a.likes || 0), 0);
  const totalViews = mockArticles.reduce((sum, a) => sum + (a.views || 0), 0);

  return {
    comments: totalComments,
    shares: totalShares,
    likes: totalLikes,
    saves: Math.floor(totalViews * 0.08),
    avgTimeOnSite: '4:32',
    bounceRate: '32.5%',
  };
};
