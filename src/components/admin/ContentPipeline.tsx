'use client';

import { FileCheck, Clock, Calendar, FileEdit } from 'lucide-react';

interface ContentPipelineProps {
  published: number;
  pending: number;
  scheduled: number;
  drafts: number;
  total: number;
}

export function ContentPipeline({ published, pending, scheduled, drafts, total }: ContentPipelineProps) {
  const stages = [
    { label: 'Published', value: published, icon: FileCheck, color: 'green' },
    { label: 'Pending Review', value: pending, icon: Clock, color: 'yellow' },
    { label: 'Scheduled', value: scheduled, icon: Calendar, color: 'blue' },
    { label: 'Drafts', value: drafts, icon: FileEdit, color: 'gray' },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
      <h3 className="text-gray-900 dark:text-gray-100 mb-4">Content Pipeline</h3>
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.label}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <stage.icon className={`w-4 h-4 text-${stage.color}-600 dark:text-${stage.color}-400`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{stage.label}</span>
              </div>
              <span className="text-sm text-gray-900 dark:text-gray-100">{stage.value}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${stage.color}-500`}
                style={{ width: `${(stage.value / total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Content</span>
          <span className="text-gray-900 dark:text-gray-100">{total}</span>
        </div>
      </div>
    </div>
  );
}
