import React, { useState } from 'react';
import { AppSettings } from '../db/database';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function Settings({ showToast }: SettingsProps) {
  const { settings, updateSettings } = useSettings();
  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...draftSettings, [key]: value };
    setDraftSettings(newSettings);
    setHasChanges(true);
    
    // Apply settings immediately for certain options
    if (key === 'theme') {
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    if (key === 'organizationName') {
      document.title = `${value} - Учет техники`;
    }
    
    // Menu position is applied immediately through settings context
    // No additional DOM manipulation needed
  };

  const handleSave = () => {
    updateSettings(draftSettings);
    setHasChanges(false);
    showToast('Настройки сохранены и применены', 'success');
  };

  const handleReset = () => {
    setDraftSettings(settings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ⚙️ Настройки приложения
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Настройте параметры приложения под ваши потребности
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Организация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              🏢 Организация
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Наименование организации
              </label>
              <input
                type="text"
                value={draftSettings.organizationName}
                onChange={(e) => handleChange('organizationName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите название организации"
              />
              <p className="text-xs text-gray-500 mt-1">
                Это название будет отображаться в заголовке приложения
              </p>
            </div>
          </div>

          {/* Интерфейс */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              🎨 Интерфейс
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Расположение меню
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChange('menuPosition', 'top')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    draftSettings.menuPosition === 'top'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">⬆️</div>
                  <div className="font-medium text-gray-800">Сверху</div>
                  <div className="text-xs text-gray-500 mt-1">Горизонтальное меню в верхней части</div>
                </button>
                <button
                  onClick={() => handleChange('menuPosition', 'left')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    draftSettings.menuPosition === 'left'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">⬅️</div>
                  <div className="font-medium text-gray-800">Слева</div>
                  <div className="text-xs text-gray-500 mt-1">Вертикальное меню в левой части</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тема оформления
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChange('theme', 'light')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    draftSettings.theme === 'light'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">☀️</div>
                  <div className="font-medium text-gray-800">Светлая</div>
                  <div className="text-xs text-gray-500 mt-1">Светлая тема оформления</div>
                </button>
                <button
                  onClick={() => handleChange('theme', 'dark')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    draftSettings.theme === 'dark'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🌙</div>
                  <div className="font-medium text-gray-800">Тёмная</div>
                  <div className="text-xs text-gray-500 mt-1">Тёмная тема оформления</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Язык интерфейса
              </label>
              <select
                value={draftSettings.language}
                onChange={(e) => handleChange('language', e.target.value as 'ru' | 'en')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ru">🇷🇺 Русский</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </div>

          {/* Отображение */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              📊 Отображение
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Элементов на странице
              </label>
              <select
                value={draftSettings.itemsPerPage}
                onChange={(e) => handleChange('itemsPerPage', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={25}>25 элементов</option>
                <option value={50}>50 элементов</option>
                <option value={100}>100 элементов</option>
                <option value={200}>200 элементов</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Количество элементов, отображаемых на одной странице списков
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftSettings.showDescriptions}
                  onChange={(e) => handleChange('showDescriptions', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-800">Показывать описания</div>
                  <div className="text-xs text-gray-500">
                    Отображать описания для категорий, статусов и других элементов
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Логи */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              📋 Логи
            </h3>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftSettings.autoSaveLogs}
                  onChange={(e) => handleChange('autoSaveLogs', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-800">Автоматическое сохранение логов</div>
                  <div className="text-xs text-gray-500">
                    Автоматически сохранять все действия в журнал
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Сбросить изменения
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💾 Сохранить настройки
          </button>
        </div>
      </div>

      {/* Информация о версии */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Версия приложения: 1.0.0</p>
        <p className="mt-1">Система управления оборудованием и сотрудниками</p>
      </div>
    </div>
  );
}
