import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, getSettings, updateSettings as dbUpdateSettings, initDatabase } from '../db/database';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isLoaded: boolean;
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
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from database after initialization
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await initDatabase();
        const loadedSettings = getSettings();
        setSettings(loadedSettings);
        
        // Apply theme
        if (loadedSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Apply title
        document.title = `${loadedSettings.organizationName} - Учет техники`;
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadSettings();
  }, []);

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⚙️</div>
          <p className="text-gray-600 text-lg">Загрузка настроек...</p>
        </div>
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings: handleUpdateSettings, isLoaded }}>
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
