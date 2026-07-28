import { Bell, Search, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface AdminHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 md:h-16 bg-white dark:bg-[#1A1A1C] border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-base md:text-xl text-gray-900 dark:text-gray-100 truncate">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#202225] rounded-lg border border-transparent dark:border-gray-800">
          <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 outline-none w-48"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>


      </div>
    </header>
  );
}
