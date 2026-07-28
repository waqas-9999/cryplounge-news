import { useState } from 'react';
import { AdminSidebar } from '../../../components/admin/AdminSidebar';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import { Database, Save } from 'lucide-react';
import { toast } from 'sonner';

interface BackupSettingsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function BackupSettingsPage({ currentPage, onNavigate, onLogout }: BackupSettingsPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupRetention, setBackupRetention] = useState('30');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Backup settings saved successfully!');
    }, 1000);
  };

  const createManualBackup = () => {
    toast.success('Backup created successfully');
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
        <AdminHeader 
          title="Backup & Maintenance"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-[#EFB81A]" />
              <h1 className="text-2xl text-gray-900 dark:text-gray-100">Backup & Maintenance</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Configure automatic backups and maintenance settings</p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoBackup}
                      onChange={(e) => setAutoBackup(e.target.checked)}
                      className="w-4 h-4 text-[#EFB81A] border-gray-300 rounded focus:ring-[#EFB81A]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Enable Automatic Backups
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={backupFrequency}
                    onChange={(e) => setBackupFrequency(e.target.value)}
                    disabled={!autoBackup}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] disabled:opacity-50"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Backup Retention (days)
                  </label>
                  <input
                    type="number"
                    value={backupRetention}
                    onChange={(e) => setBackupRetention(e.target.value)}
                    disabled={!autoBackup}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="w-4 h-4 text-[#EFB81A] border-gray-300 rounded focus:ring-[#EFB81A]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Maintenance Mode
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 ml-6">
                    Site will be unavailable to users
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={createManualBackup}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Create Manual Backup
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}