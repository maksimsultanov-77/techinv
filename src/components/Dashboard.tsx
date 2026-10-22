import React from 'react';
import { getStats, getEmployeeStats, getAllDepartments, getAllLocations, getAllStatuses, getAllCategories, getEquipmentByEmployee } from '../db/database';

interface DashboardProps {
  currentUser: {
    id: number;
    username: string;
    fullName: string;
    role: string;
    employee_id?: number | null;
  };
}

export default function Dashboard({ currentUser }: DashboardProps) {
  const stats = getStats();
  const empStats = getEmployeeStats();
  const departments = getAllDepartments();
  const locations = getAllLocations();
  const statuses = getAllStatuses();
  const categories = getAllCategories();
  
  // Получаем оборудование пользователя, если он role === 'user'
  const userEquipment = currentUser.role === 'user' && currentUser.employee_id 
    ? getEquipmentByEmployee(currentUser.employee_id) 
    : [];
  const userEquipmentCount = userEquipment.length;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📊 Главная панель</h2>
        <p className="text-gray-600">
          {currentUser.role === 'user' ? 'Ваша личная статистика' : 'Общая статистика системы'}
        </p>
      </div>

      {/* Основные карточки статистики */}
      {currentUser.role === 'user' ? (
        // Для роли user показываем только его оборудование
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🖥️</div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Ваше
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{userEquipmentCount}</div>
            <div className="text-sm text-gray-600">Единиц закрепленного оборудования</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📍</div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Локации
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {new Set(userEquipment.map(eq => eq.location_id)).size}
            </div>
            <div className="text-sm text-gray-600">Местоположений вашего оборудования</div>
          </div>
        </div>
      ) : (
        // Для других ролей показываем полную статистику
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
      )}

      {/* Детальная статистика */}
      {currentUser.role !== 'user' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Статусы оборудования */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏷️ Оборудование по статусам</h3>
            <div className="space-y-3">
              {stats.byStatus?.map((statusStat: any) => {
                const percentage = stats.total > 0 ? (statusStat.count / stats.total) * 100 : 0;
                return (
                  <div key={statusStat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{statusStat.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{statusStat.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{statusStat.count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: statusStat.color }}
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
              {stats.byCategory?.map((categoryStat: any) => {
                const percentage = stats.total > 0 ? (categoryStat.count / stats.total) * 100 : 0;
                return (
                  <div key={categoryStat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryStat.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{categoryStat.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{categoryStat.count} ({percentage.toFixed(1)}%)</span>
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
      )}

      {/* Для роли user показываем список его оборудования */}
      {currentUser.role === 'user' && userEquipment.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🖥️ Ваше оборудование</h3>
          <div className="space-y-3">
            {userEquipment.map(eq => {
              const location = locations.find(l => l.id === eq.location_id);
              return (
                <div key={eq.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{eq.category_icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{eq.name}</h4>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        {eq.manufacturer && <div>🏭 {eq.manufacturer} {eq.model}</div>}
                        {eq.serial_number && <div>🔢 S/N: {eq.serial_number}</div>}
                        {eq.inventory_number && <div>📋 Инв. №: {eq.inventory_number}</div>}
                        {location && <div>📍 {location.name}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentUser.role === 'user' && userEquipment.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600">У вас нет закрепленного оборудования</p>
        </div>
      )}

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
