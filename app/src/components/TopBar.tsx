import { Moon, Sun } from 'lucide-react';
import { useSettingsContext } from '@/context/SettingsContext';
import type { ViewTab } from '@/types';

interface TopBarProps {
  activeTab: ViewTab;
}

const tabTitles: Record<ViewTab, string> = {
  dashboard: 'Dashboard',
  medicines: 'Medicines',
  add: 'Add Medicine',
  export: 'Export',
  settings: 'Settings',
};

export function TopBar({ activeTab }: TopBarProps) {
  const { toggleTheme, isDark } = useSettingsContext();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-slate-700/20 bg-[#0B1120]/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-teal-400">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-slate-100">HomeMed</span>
            <span className="text-base font-normal text-teal-400">Cabinet</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-slate-400 sm:block">
            {tabTitles[activeTab]}
          </span>
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-all hover:bg-slate-700 hover:text-teal-400"
            aria-label="Toggle theme"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
