import React from 'react';
import { getStats, getEmployeeStats, getAllDepartments, getAllLocations, getAllStatuses, getAllCategories } from '../db/database';

interface DashboardProps {
  currentUser: any;
}

export default function Dashboard({ currentUser }: DashboardProps) {
  const stats = getStats();
  const empStats = getEmployeeStats();
  const departments = getAllDepartments();
  const locations = getAllLocations();
  const statuses = getAllStatuses();
  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📊 Главная панель</h2>
        <p className="text-gray-600">Общая статистика системы</p>
      </div>

      {/* Основные карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🖥️</div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Активно
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">Единиц оборудования</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">👥</div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Всего
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{empStats.total}</div>
          <div className="text-sm text-gray-600">Сотрудников</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🏢</div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              Структура
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{departments.length}</div>
          <div className="text-sm text-gray-600">Подразделений</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📍</div>
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Локации
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{locations.length}</div>
          <div className="text-sm text-gray-600">Местоположений</div>
        </div>
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статусы оборудования */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🏷️ Оборудование по статусам</h3>
          <div className="space-y-3">
            {statuses.map(status => {
              const count = stats.byStatus?.[status.id] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={status.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{status.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{status.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%`, backgroundColor: status.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Категории оборудования */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📁 Оборудование по категориям</h3>
          <div className="space-y-3">
            {categories.map(category => {
              const count = stats.byCategory?.[category.id] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Типы сотрудников */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">👤 Сотрудники по типам</h3>
          <div className="space-y-3">
            {empStats.byType?.map((typeStat: any) => {
              const percentage = empStats.total > 0 ? (typeStat.count / empStats.total) * 100 : 0;
              return (
                <div key={typeStat.type}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{typeStat.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{typeStat.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">{typeStat.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Режимы работы */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🏠 Сотрудники по режиму работы</h3>
          <div className="space-y-3">
            {empStats.byWorkMode?.map((modeStat: any) => {
              const percentage = empStats.total > 0 ? (modeStat.count / empStats.total) * 100 : 0;
              return (
                <div key={modeStat.mode}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{modeStat.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{modeStat.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">{modeStat.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Информация о системе */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">ℹ️ Информация о системе</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1">Версия системы</div>
            <div className="font-medium text-gray-800">1.0.0</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Последнее обновление</div>
            <div className="font-medium text-gray-800">{new Date().toLocaleDateString('ru-RU')}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Текущий пользователь</div>
            <div className="font-medium text-gray-800">{currentUser.fullName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
