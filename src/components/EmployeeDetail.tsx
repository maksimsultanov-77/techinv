import React from 'react';
import { Employee } from '../db/database';

interface EmployeeDetailProps {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
}

const workModeLabels: Record<string, { label: string; icon: string; color: string }> = {
  office: { label: 'В офисе', icon: '🏢', color: 'bg-blue-100 text-blue-800' },
  remote: { label: 'Удалённо', icon: '🏠', color: 'bg-green-100 text-green-800' },
  hybrid: { label: 'Гибрид', icon: '🔄', color: 'bg-purple-100 text-purple-800' },
};

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, onClose, onEdit }) => {
  const modeInfo = workModeLabels[employee.work_mode] || workModeLabels.office;
  const genderIcon = employee.gender === 'female' ? '👩' : '👨';
  const genderLabel = employee.gender === 'female' ? 'Женский' : 'Мужской';

  const fields = [
    { label: 'ID', value: String(employee.id) },
    { label: 'ФИО', value: employee.full_name },
    { label: 'Пол', value: `${genderIcon} ${genderLabel}` },
    { label: 'Подразделение', value: employee.department },
    { label: 'Телефон', value: employee.phone },
    { label: 'Email', value: employee.email },
    { label: 'Режим работы', value: `${modeInfo.icon} ${modeInfo.label}` },
    { label: 'Создано', value: employee.created_at },
    { label: 'Обновлено', value: employee.updated_at },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">📋 Информация о сотруднике</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{genderIcon}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{employee.full_name}</h3>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${modeInfo.color}`}>
                {modeInfo.icon} {modeInfo.label}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {fields.filter(f => f.value).map((field, idx) => (
              <div key={idx} className="flex items-start border-b border-gray-100 pb-2">
                <span className="text-sm font-medium text-gray-500 w-40 flex-shrink-0">{field.label}:</span>
                <span className="text-sm text-gray-800">{field.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Закрыть
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ✏️ Редактировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
