import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, getSettings, updateSettings as dbUpdateSettings } from '../db/database';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  organizationName: 'Моя Организация',
  menuPosition: 'top',
  theme: 'light',
  language: 'ru',
  itemsPerPage: 50,
  showDescriptions: true,
  autoSaveLogs: true,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      return getSettings();
    } catch {
      return defaultSettings;
    }
  });

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    dbUpdateSettings(updatedSettings);
    
    // Apply theme immediately
    if (newSettings.theme) {
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // Apply title immediately
    if (newSettings.organizationName) {
      document.title = `${newSettings.organizationName} - Учет техники`;
    }
  };

  // Apply theme on mount
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.title = `${settings.organizationName} - Учет техники`;
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings: handleUpdateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
