import { FileText, Calendar, GraduationCap, Users, Award, Clock } from 'lucide-react';

interface Activity {
  type: string;
  title: string;
  time: string;
  user: string;
  icon: string;
  action?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick?: (action: string) => void;
}

export function ActivityFeed({ activities, onActivityClick }: ActivityFeedProps) {
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      FileText,
      Calendar,
      GraduationCap,
      Users,
      Award,
    };
    return icons[iconName] || FileText;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      article: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      event: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      tutorial: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      user: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    };
    return colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
      <h3 className="text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        {activities.map((activity, idx) => {
          const Icon = getIcon(activity.icon);
          const isClickable = activity.action && onActivityClick;
          const Component = isClickable ? 'button' : 'div';
          
          return (
            <Component
              key={idx}
              onClick={isClickable ? () => onActivityClick!(activity.action!) : undefined}
              aria-label={isClickable ? `View ${activity.title}` : undefined}
              className={`flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-800/50 last:border-0 w-full text-left ${
                isClickable ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(activity.type)}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{activity.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{activity.user}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </span>
                </div>
              </div>
            </Component>
          );
        })}
      </div>
    </div>
  );
}
