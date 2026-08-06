'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Star,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface ProjectsListPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface AdminProject {
  id: string;
  name: string;
  tagline: string;
  status: 'PENDING' | 'LIVE' | 'BETA' | 'TESTNET' | 'DEPRECATED';
  blockchain: string;
  category: { slug: string; name: string } | null;
  createdAt: string;
  featured: boolean;
  trending: boolean;
  editorsPick: boolean;
}

const PER_PAGE = 15;

export function ProjectsListPage({ currentPage, onNavigate, onLogout }: ProjectsListPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setState('loading');
    apiClient
      .getPaginated<AdminProject>('projects/admin', {
        query: {
          search: searchQuery || undefined,
          status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
          page,
          perPage: PER_PAGE,
        },
      })
      .then(({ items, pagination }) => {
        setProjects(items);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [searchQuery, filterStatus, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This can be restored later by an administrator.`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`projects/${id}`);
      toast.success('Project deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete project'));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleApprove(id: string) {
    try {
      await apiClient.patch(`projects/${id}`, { status: 'LIVE', verified: true });
      toast.success('Project approved and listed');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to approve project'));
    }
  }

  async function handleReject(id: string) {
    if (!window.confirm('Reject this submission? It will be deleted.')) return;
    try {
      await apiClient.delete(`projects/${id}`);
      toast.success('Submission rejected');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to reject submission'));
    }
  }

  async function handleToggle(id: string, field: 'featured' | 'trending' | 'editorsPick', value: boolean) {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
    try {
      await apiClient.patch(`projects/${id}`, { [field]: value });
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update project'));
      setProjects(prev => prev.map(p => (p.id === id ? { ...p, [field]: !value } : p)));
    }
  }

  const getStatusBadge = (status: AdminProject['status']) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Live
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'BETA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Beta
          </span>
        );
      case 'TESTNET':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Testnet
          </span>
        );
      case 'DEPRECATED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs">
            Deprecated
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader title="Ecosystem Projects" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between">
            <div className="flex-1 flex gap-3">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setPage(1);
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                  />
                </div>
              </div>

              <select
                value={filterStatus}
                onChange={e => {
                  setPage(1);
                  setFilterStatus(e.target.value);
                }}
                className="px-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="live">Live</option>
                <option value="beta">Beta</option>
                <option value="testnet">Testnet</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>

            <button
              onClick={() => onNavigate('admin/projects/create')}
              className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>

          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {state === 'loading' ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
              </div>
            ) : state === 'error' ? (
              <div className="py-24 text-center text-sm text-gray-500 dark:text-gray-400">
                Couldn&apos;t load projects. Please try again.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Name</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Blockchain</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Category</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Placement</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Submitted</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(project => (
                        <tr key={project.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{project.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{project.tagline}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{project.blockchain}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                              {project.category?.name ?? 'Uncategorized'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(project.status)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggle(project.id, 'featured', !project.featured)}
                                title="Featured Projects"
                                className={`p-1.5 rounded transition-colors ${project.featured ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                              >
                                <Star className={`w-4 h-4 ${project.featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                              </button>
                              <button
                                onClick={() => handleToggle(project.id, 'trending', !project.trending)}
                                title="Trending Projects"
                                className={`p-1.5 rounded transition-colors ${project.trending ? 'bg-green-100 dark:bg-green-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                              >
                                <TrendingUp className={`w-4 h-4 ${project.trending ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                              </button>
                              <button
                                onClick={() => handleToggle(project.id, 'editorsPick', !project.editorsPick)}
                                title="Editor's Picks"
                                className={`p-1.5 rounded transition-colors ${project.editorsPick ? 'bg-purple-100 dark:bg-purple-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                              >
                                <Sparkles className={`w-4 h-4 ${project.editorsPick ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {project.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(project.id)}
                                    className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                                    title="Approve & List"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(project.id)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => onNavigate(`admin/projects/edit/${project.id}`)}
                                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(project.id, project.name)}
                                disabled={deletingId === project.id}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {projects.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            No projects match these filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {projects.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{(page - 1) * PER_PAGE + projects.length} of {total} projects
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg text-sm hover:bg-yellow-500 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
