import { LayoutDashboard, Pill, Plus, Download, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ViewTab } from '@/types';

interface MobileNavProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

const tabs: { key: ViewTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { key: 'medicines', label: 'Meds', icon: Pill },
  { key: 'add', label: 'Add', icon: Plus },
  { key: 'export', label: 'Export', icon: Download },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-slate-700/30 bg-[#0B1120]/90 backdrop-blur-xl md:hidden">
      <div className="flex h-full items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          const isAdd = tab.key === 'add';

          if (isAdd) {
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-white shadow-[0_0_24px_rgba(20,184,166,0.3)] transition-all hover:bg-teal-600 active:scale-95"
              >
                <Plus className="h-6 w-6" />
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className="relative flex flex-col items-center gap-1 px-3 py-1"
            >
              <Icon
                className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-teal-400' : 'text-slate-500'
                }`}
              />
              <span
                className={`text-[11px] transition-colors ${
                  isActive ? 'text-teal-400 font-medium' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileTabIndicator"
                  className="absolute -top-0.5 h-0.5 w-6 rounded-full bg-teal-400/50"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
