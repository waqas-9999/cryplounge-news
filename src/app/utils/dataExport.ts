/**
 * Data Export Utility
 * Handles exporting data to CSV and Excel formats
 */

export type ExportFormat = 'csv' | 'xlsx' | 'json';

export interface ExportOptions {
  filename: string;
  format: ExportFormat;
  dateRange?: {
    start: Date;
    end: Date;
  };
  columns?: string[]; // Specific columns to export
  includeHeaders?: boolean;
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], columns?: string[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers
  const headers = columns || Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      
      // Handle special cases
      if (value === null || value === undefined) {
        return '';
      }
      
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    });
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Download file to user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], options: ExportOptions): void {
  const csv = convertToCSV(data, options.columns);
  const filename = `${options.filename}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON
 */
export function exportToJSON(data: any[], options: ExportOptions): void {
  const json = JSON.stringify(data, null, 2);
  const filename = `${options.filename}.json`;
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * Export data to Excel (basic implementation using CSV)
 * Note: For production, consider using a library like xlsx or exceljs
 */
export function exportToExcel(data: any[], options: ExportOptions): void {
  // For now, export as CSV with .xlsx extension
  // In production, use a proper Excel library
  const csv = convertToCSV(data, options.columns);
  const filename = `${options.filename}.xlsx`;
  
  // Add BOM for proper Excel UTF-8 encoding
  const BOM = '\uFEFF';
  const content = BOM + csv;
  
  downloadFile(content, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;');
}

/**
 * Main export function
 */
export function exportData(data: any[], options: ExportOptions): void {
  // Filter by date range if provided
  let filteredData = data;
  
  if (options.dateRange) {
    filteredData = data.filter(item => {
      const itemDate = new Date(item.createdAt || item.date || item.publishedAt);
      return itemDate >= options.dateRange!.start && itemDate <= options.dateRange!.end;
    });
  }
  
  // Export based on format
  switch (options.format) {
    case 'csv':
      exportToCSV(filteredData, options);
      break;
    case 'xlsx':
      exportToExcel(filteredData, options);
      break;
    case 'json':
      exportToJSON(filteredData, options);
      break;
    default:
      exportToCSV(filteredData, options);
  }
}

/**
 * Format data for export with common transformations
 */
export function formatDataForExport(data: any[], type: string): any[] {
  return data.map(item => {
    // Create a clean copy
    const formatted: any = {};
    
    // Add common fields
    if (item.id) formatted.ID = item.id;
    if (item.title) formatted.Title = item.title;
    if (item.name) formatted.Name = item.name;
    if (item.email) formatted.Email = item.email;
    if (item.status) formatted.Status = item.status;
    if (item.category) formatted.Category = item.category;
    
    // Add dates
    if (item.createdAt) formatted['Created At'] = new Date(item.createdAt).toLocaleString();
    if (item.updatedAt) formatted['Updated At'] = new Date(item.updatedAt).toLocaleString();
    if (item.publishedAt) formatted['Published At'] = new Date(item.publishedAt).toLocaleString();
    if (item.date) formatted.Date = new Date(item.date).toLocaleString();
    
    // Type-specific fields
    switch (type) {
      case 'news':
        if (item.author) formatted.Author = item.author;
        if (item.views) formatted.Views = item.views;
        if (item.likes) formatted.Likes = item.likes;
        if (item.comments) formatted.Comments = item.comments;
        if (item.shares) formatted.Shares = item.shares;
        if (item.readTime) formatted['Read Time'] = item.readTime;
        break;
        
      case 'learn':
        if (item.difficulty) formatted.Difficulty = item.difficulty;
        if (item.duration) formatted.Duration = item.duration;
        if (item.enrolled) formatted.Enrolled = item.enrolled;
        if (item.completed) formatted.Completed = item.completed;
        if (item.rating) formatted.Rating = item.rating;
        break;
        
      case 'events':
        if (item.location) formatted.Location = item.location;
        if (item.startDate) formatted['Start Date'] = new Date(item.startDate).toLocaleString();
        if (item.endDate) formatted['End Date'] = new Date(item.endDate).toLocaleString();
        if (item.attendees) formatted.Attendees = item.attendees;
        if (item.maxAttendees) formatted['Max Attendees'] = item.maxAttendees;
        break;
        
      case 'users':
        if (item.username) formatted.Username = item.username;
        if (item.role) formatted.Role = item.role;
        if (item.xp) formatted.XP = item.xp;
        if (item.level) formatted.Level = item.level;
        if (item.lastActive) formatted['Last Active'] = new Date(item.lastActive).toLocaleString();
        break;
        
      case 'xp':
        if (item.userId) formatted['User ID'] = item.userId;
        if (item.action) formatted.Action = item.action;
        if (item.xpEarned) formatted['XP Earned'] = item.xpEarned;
        if (item.totalXP) formatted['Total XP'] = item.totalXP;
        if (item.level) formatted.Level = item.level;
        break;
        
      case 'referrals':
        if (item.referrerId) formatted['Referrer ID'] = item.referrerId;
        if (item.referredUserId) formatted['Referred User ID'] = item.referredUserId;
        if (item.xpEarned) formatted['XP Earned'] = item.xpEarned;
        if (item.xpClaimed) formatted['XP Claimed'] = item.xpClaimed ? 'Yes' : 'No';
        break;
    }
    
    return formatted;
  });
}

/**
 * Generate XP transaction history export
 */
export function generateXPTransactionReport(userId?: string): any[] {
  // Get XP history from localStorage
  const allHistory = [];
  
  // If userId specified, get that user's history
  if (userId) {
    const userHistory = localStorage.getItem(`xp_history_${userId}`);
    if (userHistory) {
      const history = JSON.parse(userHistory);
      allHistory.push(...history);
    }
  } else {
    // Get all users' XP history
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('xp_history_')) {
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        const userId = key.replace('xp_history_', '');
        allHistory.push(...history.map((h: any) => ({ ...h, userId })));
      }
    }
  }
  
  return formatDataForExport(allHistory, 'xp');
}

/**
 * Generate analytics summary report
 */
export function generateAnalyticsSummary(dateRange?: { start: Date; end: Date }): any {
  const summary = {
    reportGenerated: new Date().toLocaleString(),
    dateRange: dateRange ? {
      start: dateRange.start.toLocaleDateString(),
      end: dateRange.end.toLocaleDateString()
    } : 'All Time',
    
    // Metrics will be populated from actual data
    totalUsers: 0,
    totalArticles: 0,
    totalTutorials: 0,
    totalEvents: 0,
    totalViews: 0,
    totalXPAwarded: 0,
    
    // Activity metrics
    activeUsers: 0,
    newSignups: 0,
    publishedContent: 0,
    userEngagement: 0,
  };
  
  return summary;
}

/**
 * Prepare news articles for export
 */
export function prepareNewsExport(articles: any[]): any[] {
  return formatDataForExport(articles, 'news');
}

/**
 * Prepare learn tutorials for export
 */
export function prepareLearnExport(tutorials: any[]): any[] {
  return formatDataForExport(tutorials, 'learn');
}

/**
 * Prepare events for export
 */
export function prepareEventsExport(events: any[]): any[] {
  return formatDataForExport(events, 'events');
}

/**
 * Prepare users for export
 */
export function prepareUsersExport(users: any[]): any[] {
  return formatDataForExport(users, 'users');
}

/**
 * Prepare referrals for export
 */
export function prepareReferralsExport(referrals: any[]): any[] {
  return formatDataForExport(referrals, 'referrals');
}

/**
 * Get current date/time for filename
 */
export function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

/**
 * Export service for easy use
 */
export const DataExportService = {
  exportData,
  exportToCSV,
  exportToExcel,
  exportToJSON,
  
  // Specific exports
  exportXPTransactions: (userId?: string, format: ExportFormat = 'xlsx') => {
    const data = generateXPTransactionReport(userId);
    const timestamp = getTimestamp();
    const filename = userId 
      ? `xp-transactions-${userId}-${timestamp}`
      : `xp-transactions-all-${timestamp}`;
    
    exportData(data, { filename, format });
  },
  
  exportNews: (articles: any[], format: ExportFormat = 'xlsx') => {
    const data = prepareNewsExport(articles);
    const timestamp = getTimestamp();
    exportData(data, { filename: `news-articles-${timestamp}`, format });
  },
  
  exportLearn: (tutorials: any[], format: ExportFormat = 'xlsx') => {
    const data = prepareLearnExport(tutorials);
    const timestamp = getTimestamp();
    exportData(data, { filename: `learn-tutorials-${timestamp}`, format });
  },
  
  exportEvents: (events: any[], format: ExportFormat = 'xlsx') => {
    const data = prepareEventsExport(events);
    const timestamp = getTimestamp();
    exportData(data, { filename: `events-${timestamp}`, format });
  },
  
  exportUsers: (users: any[], format: ExportFormat = 'xlsx') => {
    const data = prepareUsersExport(users);
    const timestamp = getTimestamp();
    exportData(data, { filename: `users-${timestamp}`, format });
  },
  
  exportReferrals: (referrals: any[], format: ExportFormat = 'xlsx') => {
    const data = prepareReferralsExport(referrals);
    const timestamp = getTimestamp();
    exportData(data, { filename: `referrals-${timestamp}`, format });
  },
  
  // Utility functions
  getTimestamp,
  formatDataForExport,
};
