'use client';

import { AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';

interface Alert {
  type: 'warning' | 'info' | 'success';
  message: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

interface SystemAlertsProps {
  alerts: Alert[];
  onAlertClick: (action: string) => void;
}

export function SystemAlerts({ alerts, onAlertClick }: SystemAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const getAlertStyle = (type: string) => {
    const styles = {
      warning: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30',
      info: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30',
      success: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30',
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  const getAlertIcon = (type: string) => {
    const icons = {
      warning: AlertCircle,
      info: Info,
      success: CheckCircle,
    };
    const Icon = icons[type as keyof typeof icons] || Info;
    return Icon;
  };

  const getIconColor = (type: string) => {
    const colors = {
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const visibleAlerts = alerts.filter((_, idx) => !dismissedAlerts.includes(idx));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert, idx) => {
        const Icon = getAlertIcon(alert.type);
        return (
          <div
            key={idx}
            className={`rounded-lg border p-4 ${getAlertStyle(alert.type)}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 ${getIconColor(alert.type)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                <button
                  onClick={() => onAlertClick(alert.action)}
                  aria-label={`View details for ${alert.message}`}
                  className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline mt-1 inline-flex items-center gap-1"
                >
                  View Details →
                </button>
              </div>
              <button
                onClick={() => setDismissedAlerts([...dismissedAlerts, alerts.indexOf(alert)])}
                aria-label="Dismiss alert"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
