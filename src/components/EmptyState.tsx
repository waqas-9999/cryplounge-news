'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 md:py-16 px-4 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-[#EFB81A]" />
        </div>
      )}
      
      <h3 className="text-gray-900 dark:text-white mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
