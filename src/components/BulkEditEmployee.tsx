import React, { useState } from 'react';
import { Employee, Department, bulkUpdateEmployee } from '../db/database';

interface BulkEditEmployeeProps {
  selectedIds: number[];
  departments: Department[];
  onSave: () => void;
  onCancel: () => void;
}

export function BulkEditEmployee({
  selectedIds,
  departments,
  onSave,
  onCancel,
}: BulkEditEmployeeProps) {
  const [updates, setUpdates] = useState<Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>>({});

  const handleChange = (field: string, value: any) => {
    // Для select элементов: если выбрано "Не изменять", удаляем поле
    // Для input элементов: сохраняем даже пустые значения
    if ((value === '' || value === null) && (field === 'department_id' || field === 'employee_type' || field === 'work_mode')) {
      const newUpdates = { ...updates };
      delete newUpdates[field as keyof typeof newUpdates];
      setUpdates(newUpdates);
    } else {
      setUpdates({ ...updates, [field]: value });
    }
  };

  const handleSave = () => {
    const count = bulkUpdateEmployee(selectedIds, updates);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            ✏️ Групповое редактирование ({selectedIds.length} сотрудников)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Заполните поля, которые хотите изменить. Пустые поля будут пропущены.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
            <select
              value={updates.department_id || ''}
              onChange={(e) => handleChange('department_id', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Не изменять —</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>🏢 {dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
            <input
              type="text"
              value={updates.position || ''}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="— Не изменять —"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип сотрудника</label>
            <select
              value={updates.employee_type || ''}
              onChange={(e) => handleChange('employee_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Не изменять —</option>
              <option value="staff">👤 Штатный</option>
              <option value="external">🌐 Внешний</option>
              <option value="contractor">📝 Подрядчик</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Режим работы</label>
            <select
              value={updates.work_mode || ''}
              onChange={(e) => handleChange('work_mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Не изменять —</option>
              <option value="office">🏢 В офисе</option>
              <option value="remote">🏠 Удалённо</option>
              <option value="hybrid">🔄 Гибрид</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
            <input
              type="text"
              value={updates.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="— Не изменять —"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(updates).length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
