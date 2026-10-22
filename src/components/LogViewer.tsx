import React, { useState, useEffect, useMemo } from 'react';
import { User, LogEntry, getAllLogs, deleteLog, clearAllLogs } from '../db/database';

interface LogViewerProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  currentUser?: User;
}

export function LogViewer({ showToast, currentUser }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Фильтры
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterEntityType, setFilterEntityType] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setLogs(getAllLogs());
  };

  // Фильтрация логов
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Фильтр по действию
      if (filterAction && log.action !== filterAction) return false;
      
      // Фильтр по типу сущности
      if (filterEntityType && log.entityType !== filterEntityType) return false;
      
      // Фильтр по дате от
      if (filterDateFrom) {
        const logDate = new Date(log.timestamp);
        const fromDate = new Date(filterDateFrom);
        if (logDate < fromDate) return false;
      }
      
      // Фильтр по дате до
      if (filterDateTo) {
        const logDate = new Date(log.timestamp);
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (logDate > toDate) return false;
      }
      
      // Текстовый поиск
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          log.entityName,
          log.details,
          log.userName,
          log.entityType
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }
      
      return true;
    });
  }, [logs, filterAction, filterEntityType, filterDateFrom, filterDateTo, searchQuery]);

  const handleResetFilters = () => {
    setFilterAction('');
    setFilterEntityType('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchQuery('');
  };

  // Получить уникальные типы сущностей из логов
  const entityTypes = useMemo(() => {
    const types = new Set(logs.map(log => log.entityType));
    return Array.from(types).sort();
  }, [logs]);

  const handleDeleteLog = (id: number) => {
    const result = deleteLog(id);
    if (result.success) {
      loadLogs();
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleClearAllLogs = () => {
    const result = clearAllLogs();
    if (result.success) {
      loadLogs();
      setShowClearConfirm(false);
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      'create': '➕',
      'update': '✏️',
      'delete': '🗑️',
      'clear': '🧹',
      'generate': '🎲',
      'login': '🔐',
      'logout': '🚪',
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'create': 'bg-green-100 text-green-800',
      'update': 'bg-blue-100 text-blue-800',
      'delete': 'bg-red-100 text-red-800',
      'clear': 'bg-orange-100 text-orange-800',
      'generate': 'bg-purple-100 text-purple-800',
      'login': 'bg-indigo-100 text-indigo-800',
      'logout': 'bg-gray-100 text-gray-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Логи</h2>
        {currentUser?.role === 'superadmin' && logs.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            🗑️ Очистить все логи
          </button>
        )}
      </div>

      {/* Панель фильтров */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🔍 Поиск</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Название, детали..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">⚡ Действие</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все действия</option>
              <option value="create">➕ Создание</option>
              <option value="update">✏️ Изменение</option>
              <option value="delete">🗑️ Удаление</option>
              <option value="clear">🧹 Очистка</option>
              <option value="generate">🎲 Генерация</option>
              <option value="login">🔐 Вход</option>
              <option value="logout">🚪 Выход</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📦 Тип сущности</label>
            <select
              value={filterEntityType}
              onChange={(e) => setFilterEntityType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все типы</option>
              {entityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📅 Дата от</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📅 Дата до</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        {(filterAction || filterEntityType || filterDateFrom || filterDateTo || searchQuery) && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Найдено: <strong>{filteredLogs.length}</strong> из {logs.length} логов
            </span>
            <button
              onClick={handleResetFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ✕ Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <p>{logs.length === 0 ? 'Логи отсутствуют' : 'Нет логов, соответствующих фильтрам'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map(log => (
            <div key={log.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getActionIcon(log.action)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>{log.entityType}:</strong> {log.entityName || `ID: ${log.entityId}`}
                  </div>
                  {log.details && (
                    <div className="text-sm text-gray-600 mt-1">{log.details}</div>
                  )}
                  {log.userName && (
                    <div className="text-xs text-gray-500 mt-1">
                      Пользователь: {log.userName}
                    </div>
                  )}
                </div>
                {currentUser?.role === 'superadmin' && (
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-red-600 hover:text-red-800 ml-4"
                    title="Удалить лог"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Очистить все логи?</h3>
            <p className="text-gray-600 mb-6">Все логи будут удалены. Это действие нельзя отменить.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleClearAllLogs}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Очистить все
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
