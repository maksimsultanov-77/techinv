import React, { useState } from 'react';
import { Employee, Department } from '../db/database';

interface EmployeeFormProps {
  departments: Department[];
  employee?: Employee | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function EmployeeForm({ departments, employee, onSave, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    full_name: employee?.full_name || '',
    gender: employee?.gender || 'male',
    department_id: employee?.department_id || null,
    position: employee?.position || '',
    employee_type: employee?.employee_type || 'staff',
    phone: employee?.phone || '',
    email: employee?.email || '',
    work_mode: employee?.work_mode || 'office',
    city: employee?.city || '',
    timezone: employee?.timezone || 'Europe/Moscow',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {employee ? '✏️ Редактирование сотрудника' : '➕ Добавить сотрудника'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
            <select
              value={formData.department_id || ''}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Не указано</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg">
              Отмена
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
