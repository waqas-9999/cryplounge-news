import { useState } from 'react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { 
  Search, 
  Eye, 
  Ban, 
  Mail,
  Award,
  TrendingUp,
  Users as UsersIcon,
  UserCheck,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

interface UsersListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function UsersListPage({ currentPage, onNavigate, onLogout }: UsersListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = [
    { label: 'Total Users', value: '42,581', change: '+12.5%', icon: UsersIcon },
    { label: 'Active Today', value: '8,432', change: '+8.2%', icon: UserCheck },
    { label: 'Avg. XP', value: '284', change: '+15.3%', icon: Award },
    { label: 'Engagement', value: '72%', change: '+3.1%', icon: TrendingUp }
  ];

  const users = [
    {
      id: 1,
      username: 'CryptoMaster2024',
      email: 'crypto@example.com',
      country: '🇺🇸 USA',
      device: 'Mobile',
      joined: '2024-01-15',
      xp: 2845,
      level: 28,
      articles: 234,
      courses: 12,
      status: 'active',
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      username: 'BlockchainQueen',
      email: 'blockchain@example.com',
      country: '🇬🇧 UK',
      device: 'Desktop',
      joined: '2024-02-20',
      xp: 1976,
      level: 19,
      articles: 189,
      courses: 8,
      status: 'active',
      lastActive: '5 hours ago'
    },
    {
      id: 3,
      username: 'DeFiWarrior',
      email: 'defi@example.com',
      country: '🇩🇪 Germany',
      device: 'Mobile',
      joined: '2024-01-08',
      xp: 3421,
      level: 34,
      articles: 312,
      courses: 15,
      status: 'active',
      lastActive: '1 day ago'
    },
    {
      id: 4,
      username: 'NFTCollector',
      email: 'nft@example.com',
      country: '🇨🇦 Canada',
      device: 'Tablet',
      joined: '2023-12-10',
      xp: 4567,
      level: 45,
      articles: 456,
      courses: 20,
      status: 'active',
      lastActive: '3 hours ago'
    },
    {
      id: 5,
      username: 'InactiveUser',
      email: 'inactive@example.com',
      country: '🇦🇺 Australia',
      device: 'Desktop',
      joined: '2023-11-05',
      xp: 543,
      level: 5,
      articles: 23,
      courses: 2,
      status: 'inactive',
      lastActive: '30 days ago'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <AdminHeader title="Users Management" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400">{stat.change}</span>
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-3">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">User</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Country</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Device</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Level</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">XP</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Activity</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">{user.username}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{user.country}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                          {user.device === 'Mobile' && <Smartphone className="w-4 h-4" />}
                          {user.device === 'Desktop' && <Monitor className="w-4 h-4" />}
                          {user.device === 'Tablet' && <Smartphone className="w-4 h-4" />}
                          {user.device}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
                          L{user.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-gray-100">
                        {user.xp.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">
                        <div>{user.articles} articles</div>
                        <div>{user.courses} courses</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${
                          user.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded">
                            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">
                            <Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
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
