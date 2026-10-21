import React, { useState, useEffect } from 'react';
import { User, LogEntry, getAllLogs, deleteLog, clearAllLogs } from '../db/database';

interface LogViewerProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  currentUser?: User;
}

export function LogViewer({ showToast, currentUser }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setLogs(getAllLogs());
  };

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

      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <p>Логи отсутствуют</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
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
