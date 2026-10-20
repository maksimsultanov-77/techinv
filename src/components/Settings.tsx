import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function Settings({ showToast }: SettingsProps) {
  const { settings, updateSettings } = useSettings();

  const handleChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
    showToast('Настройки сохранены', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Настройки</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Название организации</label>
          <input
            type="text"
            value={settings.organizationName}
            onChange={(e) => handleChange('organizationName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Расположение меню</label>
          <select
            value={settings.menuPosition}
            onChange={(e) => handleChange('menuPosition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="top">Сверху</option>
            <option value="left">Слева</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тема</label>
          <select
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>
      </div>
    </div>
  );
}
