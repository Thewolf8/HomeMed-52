import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MedicineProvider } from '@/context/MedicineContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/Toast';
import { AmbientGlow } from '@/components/AmbientGlow';
import { TopBar } from '@/components/TopBar';
import { MobileNav } from '@/components/MobileNav';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { Dashboard } from '@/pages/Dashboard';
import { MedicineList } from '@/pages/MedicineList';
import { AddMedicine } from '@/pages/AddMedicine';
import { ExportPage } from '@/pages/ExportPage';
import { SettingsPage } from '@/pages/SettingsPage';
import type { ViewTab } from '@/types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [editId, setEditId] = useState<string | null>(null);

  const handleNavigate = useCallback((tab: ViewTab) => {
    setActiveTab(tab);
    if (tab !== 'add') {
      setEditId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditId(id);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B1120]">
      <AmbientGlow />

      {/* Desktop Sidebar */}
      <DesktopSidebar activeTab={activeTab} onTabChange={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:ml-60">
        {/* Top Bar */}
        <TopBar activeTab={activeTab} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6">
          <div className="mx-auto max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + (editId || '')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
                {activeTab === 'medicines' && <MedicineList onNavigate={handleNavigate} onEdit={handleEdit} />}
                {activeTab === 'add' && <AddMedicine onNavigate={handleNavigate} editId={editId} />}
                {activeTab === 'export' && <ExportPage onNavigate={handleNavigate} />}
                {activeTab === 'settings' && <SettingsPage />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav activeTab={activeTab} onTabChange={handleNavigate} />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <MedicineProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </MedicineProvider>
    </SettingsProvider>
  );
}
