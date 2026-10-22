import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { User, getEquipmentByEmployee } from '../db/database';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
  stats: { total: number };
  empStats: { total: number };
  departments: any[];
  locations: any[];
  statuses: any[];
  categories: any[];
  currentUser: User;
  onLogout: () => void;
}

export function Sidebar({
  activeView,
  setActiveView,
  stats,
  empStats,
  departments,
  locations,
  statuses,
  categories,
  currentUser,
  onLogout,
}: SidebarProps) {
  const { settings } = useSettings();

  const menuItems = [
    { id: 'dashboard', label: '🏠 Главное', count: null },
    ...(currentUser.role !== 'user' ? [
      { id: 'structure', label: '🏢 Оргструктура', count: departments.length },
      { id: 'employees', label: '👥 Сотрудники', count: empStats.total },
    ] : []),
    { id: 'equipment', label: '🖥️ Оборудование', count: currentUser.role === 'user' && currentUser.employee_id ? getEquipmentByEmployee(currentUser.employee_id).length : stats.total },
    ...(currentUser.role !== 'user' ? [
      { id: 'locations', label: '📍 Местоположения', count: locations.length },
      { id: 'statuses', label: '🏷️ Статусы', count: statuses.length },
      { id: 'categories', label: '📁 Категории', count: categories.length },
      { id: 'logs', label: '📋 Логи', count: null },
      { id: 'settings', label: '⚙️ Настройки', count: null },
    ] : []),
    ...(currentUser.role === 'superadmin' || currentUser.role === 'admin' ? [{ id: 'users', label: '👥 Пользователи', count: null }] : []),
  ];

  return (
    <div className={`sidebar ${settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r p-4`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🖥️</span>
          <h1 className={`text-lg font-bold ${settings.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            {settings.organizationName}
          </h1>
        </div>
        <p className={`text-xs ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Система управления оборудованием
        </p>
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
              activeView === item.id
                ? 'bg-blue-600 text-white shadow-md'
                : settings.theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              {item.count !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeView === item.id
                    ? 'bg-blue-500 text-white'
                    : settings.theme === 'dark'
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {item.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>

      <div className={`mt-8 pt-8 border-t ${settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4 px-4">
          <span className="text-2xl">{currentUser.role === 'superadmin' ? '👑' : currentUser.role === 'admin' ? '🔑' : currentUser.role === 'observer' ? '👁️' : '👤'}</span>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium ${settings.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} truncate`}>
              {currentUser.fullName}
            </div>
            <div className={`text-xs ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {currentUser.role === 'superadmin' ? 'Суперадмин' : currentUser.role === 'admin' ? 'Администратор базы' : currentUser.role === 'observer' ? 'Наблюдатель' : 'Пользователь'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🚪 Выйти
        </button>
      </div>
    </div>
  );
}
