import { LayoutDashboard, Pill, Plus, Download, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ViewTab } from '@/types';

interface DesktopSidebarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

const navItems: { key: ViewTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'medicines', label: 'Medicines', icon: Pill },
  { key: 'add', label: 'Add Medicine', icon: Plus },
  { key: 'export', label: 'Export', icon: Download },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-60 flex-col border-r border-slate-700/20 bg-[#151D2E] md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-slate-700/20 px-4">
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

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`relative flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-all ${
                isActive
                  ? 'border border-[rgba(94,234,212,0.12)] bg-[rgba(21,29,46,0.6)] text-teal-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="desktopTabIndicator"
                  className="absolute left-0 h-1.5 w-1.5 rounded-full bg-teal-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-700/20 p-4">
        <p className="text-xs text-slate-600">v1.0.0 — Offline</p>
      </div>
    </aside>
  );
}
