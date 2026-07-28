import { useState } from 'react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  Clock,
  Sparkles,
  Image as ImageIcon,
  FileText,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface AILogsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AILogsPage({ currentPage, onNavigate, onLogout }: AILogsPageProps) {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = [
    { label: 'Total Tasks', value: '12,543', icon: Bot, color: 'blue' },
    { label: 'Successful', value: '11,876', icon: CheckCircle, color: 'green' },
    { label: 'Failed', value: '667', icon: XCircle, color: 'red' },
    { label: 'Processing', value: '23', icon: Clock, color: 'yellow' }
  ];

  const logs = [
    {
      id: 1,
      type: 'Content Rewrite',
      task: 'Rewrite: Bitcoin ETF Approval Impact',
      source: 'CoinDesk API',
      status: 'success',
      similarity: 92,
      timestamp: '2 min ago',
      duration: '1.2s',
      icon: FileText
    },
    {
      id: 2,
      type: 'Image Generation',
      task: 'Generate hero image for DeFi article',
      source: 'AI Image Generator',
      status: 'success',
      similarity: null,
      timestamp: '5 min ago',
      duration: '3.8s',
      icon: ImageIcon
    },
    {
      id: 3,
      type: 'Content Fetch',
      task: 'Fetch latest Ethereum news',
      source: 'The Block API',
      status: 'success',
      similarity: null,
      timestamp: '12 min ago',
      duration: '0.8s',
      icon: RefreshCw
    },
    {
      id: 4,
      type: 'Content Rewrite',
      task: 'Rewrite: NFT Market Analysis',
      source: 'Decrypt API',
      status: 'failed',
      similarity: 45,
      timestamp: '18 min ago',
      duration: '2.1s',
      error: 'Similarity score below threshold',
      icon: FileText
    },
    {
      id: 5,
      type: 'Duplicate Detection',
      task: 'Check duplicates for Solana news',
      source: 'Internal DB',
      status: 'success',
      similarity: 98,
      timestamp: '25 min ago',
      duration: '0.3s',
      icon: Sparkles
    },
    {
      id: 6,
      type: 'Auto Publish',
      task: 'Publish: Layer 2 Comparison Guide',
      source: 'Content Pipeline',
      status: 'processing',
      similarity: null,
      timestamp: '1 min ago',
      duration: '-',
      icon: Bot
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Success
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
            <Clock className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader title="AI Automation Logs" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="rewrite">Content Rewrite</option>
              <option value="image">Image Generation</option>
              <option value="fetch">Content Fetch</option>
              <option value="duplicate">Duplicate Detection</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Task</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Source</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Similarity</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Duration</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <log.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{log.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{log.task}</p>
                        {log.error && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {log.error}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{log.source}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(log.status)}</td>
                      <td className="py-3 px-4 text-center">
                        {log.similarity !== null ? (
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${
                            log.similarity >= 80
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                              : log.similarity >= 60
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          }`}>
                            {log.similarity}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-gray-100">{log.duration}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
