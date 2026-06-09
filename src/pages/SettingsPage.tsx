import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Shield, UserX, HardDrive, Brain, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { useSettingsContext } from '@/context/SettingsContext';
import { useMedicineContext } from '@/context/MedicineContext';
import { useToastContext } from '@/context/ToastContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function SettingsPage() {
  const { settings, toggleTheme, setExportFormat, toggleIncludeNotes, toggleIncludeImages, resetAllData } = useSettingsContext();
  const { medicines } = useMedicineContext();
  const { addToast } = useToastContext();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const isDark = settings.theme === 'dark';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-slate-100">Settings</h2>
        <p className="mt-1 text-sm text-slate-400">Customize your HomeMed Cabinet experience</p>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <h3 className="mb-4 text-base font-semibold text-slate-100">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">Dark Mode</p>
                <p className="text-xs text-slate-500">Toggle between dark and light theme</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative h-[26px] w-[48px] rounded-full transition-colors duration-200 ${
                isDark ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <motion.div
                className="absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-md"
                animate={{ left: isDark ? 25 : 3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Export Preferences */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <h3 className="mb-4 text-base font-semibold text-slate-100">Export Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300">Default Export Format</label>
              <div className="relative">
                <select
                  value={settings.defaultExportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'txt' | 'json')}
                  className="h-9 rounded-lg border-none bg-slate-800 py-1.5 pl-3 pr-8 text-sm text-slate-300 outline-none"
                >
                  <option value="pdf">PDF</option>
                  <option value="txt">Text</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-slate-700/30" />

            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-slate-300">Include Notes in Export</span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
                  settings.includeNotes ? 'bg-teal-500' : 'border-2 border-slate-600'
                }`}
                onClick={toggleIncludeNotes}
              >
                {settings.includeNotes && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </label>

            <div className="h-px bg-slate-700/30" />

            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-slate-300">Include Images in Export</span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
                  settings.includeImages ? 'bg-teal-500' : 'border-2 border-slate-600'
                }`}
                onClick={toggleIncludeImages}
              >
                {settings.includeImages && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </label>
          </div>
        </GlassCard>
      </motion.div>

      {/* Privacy & Data */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <h3 className="mb-4 text-base font-semibold text-slate-100">Privacy & Data</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-[18px] w-[18px] flex-shrink-0 text-teal-400" />
              <div>
                <p className="text-sm text-slate-200">No Cloud Storage</p>
                <p className="text-xs text-slate-500">Your data never leaves your device</p>
              </div>
            </div>
            <div className="h-px bg-slate-700/30" />
            <div className="flex items-center gap-3">
              <UserX className="h-[18px] w-[18px] flex-shrink-0 text-teal-400" />
              <div>
                <p className="text-sm text-slate-200">No Account Required</p>
                <p className="text-xs text-slate-500">Use the app without signing up</p>
              </div>
            </div>
            <div className="h-px bg-slate-700/30" />
            <div className="flex items-center gap-3">
              <HardDrive className="h-[18px] w-[18px] flex-shrink-0 text-teal-400" />
              <div>
                <p className="text-sm text-slate-200">Data Stays on Device</p>
                <p className="text-xs text-slate-500">Stored locally in your browser</p>
              </div>
            </div>
            <div className="h-px bg-slate-700/30" />
            <div className="flex items-center gap-3">
              <Brain className="h-[18px] w-[18px] flex-shrink-0 text-teal-400" />
              <div>
                <p className="text-sm text-slate-200">No Built-in AI Analysis</p>
                <p className="text-xs text-slate-500">Export data for use with any AI you trust</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
        <GlassCard className="border-red-500/20">
          <h3 className="mb-3 text-base font-semibold text-red-400">Danger Zone</h3>
          <p className="mb-4 text-sm text-slate-400">
            This will permanently delete all your medicine data. This action cannot be undone.
          </p>
          <p className="mb-4 text-xs text-slate-500">
            You currently have {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} stored.
          </p>
          <button
            onClick={() => setShowResetDialog(true)}
            className="flex h-10 items-center gap-2 rounded-xl border border-red-500/30 px-4 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete All Medicines
          </button>
        </GlassCard>
      </motion.div>

      {/* Reset Dialog */}
      {showResetDialog && (
        <ConfirmationDialog
          title="Delete All Data"
          message={`This will permanently delete all ${medicines.length} medicine(s). This action cannot be undone.`}
          onConfirm={() => {
            resetAllData();
            addToast('All data has been deleted', 'warning');
            setShowResetDialog(false);
          }}
          onCancel={() => setShowResetDialog(false)}
          confirmText="Delete Everything"
          variant="danger"
        />
      )}
    </motion.div>
  );
}
