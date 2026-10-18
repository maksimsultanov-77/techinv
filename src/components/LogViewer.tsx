import React, { useState, useMemo } from 'react';
import { LogEntry, getAllLogs, clearAllLogs, exportLogs, getLogStats } from '../db/database';

interface LogViewerProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function LogViewer({ showToast }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>(getAllLogs());
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterEntityType, setFilterEntityType] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stats = useMemo(() => getLogStats(), [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterAction && log.action !== filterAction) return false;
      if (filterEntityType && log.entityType !== filterEntityType) return false;
      if (filterDateFrom && new Date(log.timestamp) < new Date(filterDateFrom)) return false;
      if (filterDateTo && new Date(log.timestamp) > new Date(filterDateTo + 'T23:59:59')) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.entityName?.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          log.entityType.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [logs, filterAction, filterEntityType, filterDateFrom, filterDateTo, searchQuery]);

  const handleClearLogs = () => {
    if (confirm('Вы уверены, что хотите удалить все логи?')) {
      clearAllLogs();
      setLogs(getAllLogs());
      showToast('Логи очищены', 'success');
    }
  };

  const handleExportJSON = () => {
    const data = exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Логи экспортированы в JSON', 'success');
  };

  const handleExportCSV = () => {
    const headers = ['Дата', 'Действие', 'Тип', 'ID', 'Название', 'Детали'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString('ru-RU'),
      log.action,
      log.entityType,
      log.entityId || '',
      log.entityName || '',
      log.details,
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Логи экспортированы в CSV', 'success');
  };

  const handleResetFilters = () => {
    setFilterAction('');
    setFilterEntityType('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchQuery('');
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, { label: string; color: string; icon: string }> = {
      create: { label: 'Создание', color: 'bg-green-100 text-green-800', icon: '➕' },
      update: { label: 'Изменение', color: 'bg-blue-100 text-blue-800', icon: '✏️' },
      delete: { label: 'Удаление', color: 'bg-red-100 text-red-800', icon: '🗑️' },
      clear: { label: 'Очистка', color: 'bg-orange-100 text-orange-800', icon: '🧹' },
      generate: { label: 'Генерация', color: 'bg-purple-100 text-purple-800', icon: '🎲' },
    };
    return labels[action] || { label: action, color: 'bg-gray-100 text-gray-800', icon: '❓' };
  };

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      equipment: 'Оборудование',
      employee: 'Сотрудник',
      department: 'Подразделение',
      location: 'Местоположение',
      status: 'Статус',
      category: 'Категория',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Всего записей</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        {Object.entries(stats.byAction).map(([action, count]) => {
          const actionInfo = getActionLabel(action);
          return (
            <div key={action} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500">{actionInfo.icon} {actionInfo.label}</div>
              <div className="text-2xl font-bold text-gray-800">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Фильтры</h3>
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Сбросить фильтры
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Название или детали..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Действие</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все действия</option>
              <option value="create">Создание</option>
              <option value="update">Изменение</option>
              <option value="delete">Удаление</option>
              <option value="clear">Очистка</option>
              <option value="generate">Генерация</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип объекта</label>
            <select
              value={filterEntityType}
              onChange={(e) => setFilterEntityType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все типы</option>
              <option value="equipment">Оборудование</option>
              <option value="employee">Сотрудник</option>
              <option value="department">Подразделение</option>
              <option value="location">Местоположение</option>
              <option value="status">Статус</option>
              <option value="category">Категория</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата с</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата по</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-3">
        <button
          onClick={handleExportJSON}
          disabled={filteredLogs.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          📥 Экспорт JSON
        </button>
        <button
          onClick={handleExportCSV}
          disabled={filteredLogs.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          📊 Экспорт CSV
        </button>
        <button
          onClick={handleClearLogs}
          disabled={logs.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed ml-auto"
        >
          🗑️ Очистить логи
        </button>
      </div>

      {/* Список логов */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Логи ({filteredLogs.length} из {logs.length})
          </h3>
        </div>
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {logs.length === 0 ? 'Логи отсутствуют' : 'Нет записей, соответствующих фильтрам'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredLogs.map(log => {
              const actionInfo = getActionLabel(log.action);
              return (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${actionInfo.color}`}>
                        {actionInfo.icon} {actionInfo.label}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {getEntityTypeLabel(log.entityType)}
                        </span>
                        {log.entityName && (
                          <span className="text-sm text-gray-700">
                            — {log.entityName}
                          </span>
                        )}
                        {log.entityId && (
                          <span className="text-xs text-gray-500">
                            (ID: {log.entityId})
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <div className="text-sm text-gray-600 mb-1">
                          {log.details}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
