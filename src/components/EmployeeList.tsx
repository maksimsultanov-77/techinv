import React, { useState } from 'react';
import { Employee, Department, EMPLOYEE_TYPES, getDepartmentName } from '../db/database';

interface EmployeeListProps {
  employees: Employee[];
  departments: Department[];
  onEdit: (emp: Employee) => void;
  onDelete: (id: number) => void;
  onView: (emp: Employee) => void;
}

const workModeLabels: Record<string, { label: string; icon: string; color: string }> = {
  office: { label: 'В офисе', icon: '🏢', color: 'bg-blue-100 text-blue-800' },
  remote: { label: 'Удалённо', icon: '🏠', color: 'bg-green-100 text-green-800' },
  hybrid: { label: 'Гибрид', icon: '🔄', color: 'bg-purple-100 text-purple-800' },
};

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, departments, onEdit, onDelete, onView }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  if (!employees.length) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-medium text-gray-500 mb-2">Сотрудники не найдены</h3>
        <p className="text-gray-400">Добавьте первого сотрудника или измените параметры поиска</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {employees.map(emp => {
        const modeInfo = workModeLabels[emp.work_mode] || workModeLabels.office;
        const genderIcon = emp.gender === 'female' ? '👩' : '👨';
        const typeInfo = EMPLOYEE_TYPES.find(t => t.value === emp.employee_type) || EMPLOYEE_TYPES[0];
        const deptName = getDepartmentName(emp.department_id);

        return (
          <div
            key={emp.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="text-3xl flex-shrink-0">{genderIcon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                      onClick={() => onView(emp)}
                    >
                      {emp.full_name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${modeInfo.color}`}>
                      {modeInfo.icon} {modeInfo.label}
                    </span>
                    {emp.employee_type !== 'staff' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    {emp.department_id && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded">🏢 {deptName}</span>
                    )}
                    {emp.position && <span>💼 {emp.position}</span>}
                    {emp.city && <span>📍 {emp.city}</span>}
                    {emp.phone && <span>📞 {emp.phone}</span>}
                    {emp.email && <span>✉️ {emp.email}</span>}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    ID: {emp.id}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-2">
                <button
                  onClick={() => onView(emp)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Просмотр"
                >
                  👁️
                </button>
                <button
                  onClick={() => onEdit(emp)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setDeleteConfirm(emp.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>

            {deleteConfirm === emp.id && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <span className="text-sm text-red-700">Удалить этого сотрудника?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => { onDelete(emp.id); setDeleteConfirm(null); }}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EmployeeList;
