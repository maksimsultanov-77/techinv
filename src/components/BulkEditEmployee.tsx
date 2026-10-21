import React, { useState } from 'react';
import { Employee, Department, bulkUpdateEmployee } from '../db/database';

interface BulkEditEmployeeProps {
  selectedIds: number[];
  departments: Department[];
  onSave: () => void;
  onCancel: () => void;
}

export function BulkEditEmployee({ selectedIds, departments, onSave, onCancel }: BulkEditEmployeeProps) {
  const [updates, setUpdates] = useState<Partial<Employee>>({});

  const handleChange = (field: keyof Employee, value: any) => {
    setUpdates(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    bulkUpdateEmployee(selectedIds, updates);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Массовое редактирование</h3>
        <p className="text-gray-600 mb-6">Выбрано сотрудников: {selectedIds.length}</p>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
            <input
              type="text"
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Оставьте пустым, чтобы не менять"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
            <select
              onChange={(e) => handleChange('department_id', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Не менять</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип сотрудника</label>
            <select
              onChange={(e) => handleChange('employee_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Не менять</option>
              <option value="staff">Штатный</option>
              <option value="external">Внешний</option>
              <option value="contractor">Подрядчик</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Режим работы</label>
            <select
              onChange={(e) => handleChange('work_mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Не менять</option>
              <option value="office">В офисе</option>
              <option value="remote">Удалённо</option>
              <option value="hybrid">Гибрид</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
            <input
              type="text"
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Оставьте пустым, чтобы не менять"
            />
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Отмена
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
