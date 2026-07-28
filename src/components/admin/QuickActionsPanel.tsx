'use client';

import { Plus, FileText, Calendar, Users, Award } from 'lucide-react';

interface QuickActionsPanelProps {
  onAction: (action: string) => void;
}

export function QuickActionsPanel({ onAction }: QuickActionsPanelProps) {
  const quickActions = [
    { id: 'create-article', label: 'New Article', icon: FileText, color: 'yellow' },
    { id: 'create-event', label: 'New Event', icon: Calendar, color: 'blue' },
    { id: 'create-tutorial', label: 'New Tutorial', icon: Award, color: 'green' },
    { id: 'manage-users', label: 'Manage Users', icon: Users, color: 'purple' },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
      <h3 className="text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            aria-label={`${action.label} - Navigate to create ${action.label.replace('New ', '').toLowerCase()}`}
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all group"
          >
            <action.icon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 mb-2" />
            <span className="text-xs text-gray-700 dark:text-gray-300 text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
