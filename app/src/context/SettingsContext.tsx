import { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SettingsContextType {
  settings: AppSettings;
  toggleTheme: () => void;
  setExportFormat: (format: 'pdf' | 'txt' | 'json') => void;
  toggleIncludeNotes: () => void;
  toggleIncludeImages: () => void;
  resetAllData: () => void;
  isDark: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AppSettings>('homemed_settings', DEFAULT_SETTINGS);

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, [setSettings]);

  const setExportFormat = useCallback((format: 'pdf' | 'txt' | 'json') => {
    setSettings((prev) => ({ ...prev, defaultExportFormat: format }));
  }, [setSettings]);

  const toggleIncludeNotes = useCallback(() => {
    setSettings((prev) => ({ ...prev, includeNotes: !prev.includeNotes }));
  }, [setSettings]);

  const toggleIncludeImages = useCallback(() => {
    setSettings((prev) => ({ ...prev, includeImages: !prev.includeImages }));
  }, [setSettings]);

  const resetAllData = useCallback(() => {
    window.localStorage.removeItem('homemed_medicines');
    window.localStorage.removeItem('homemed_filters');
    window.localStorage.removeItem('homemed_draft');
    window.localStorage.removeItem('homemed_deleted');
    setSettings(DEFAULT_SETTINGS);
    window.location.reload();
  }, [setSettings]);

  const isDark = settings.theme === 'dark';

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toggleTheme,
        setExportFormat,
        toggleIncludeNotes,
        toggleIncludeImages,
        resetAllData,
        isDark,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
  return ctx;
}
