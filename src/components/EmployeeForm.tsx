import React, { useState } from 'react';
import { Employee, Department, TIMEZONES, EMPLOYEE_TYPES, getDepartmentName } from '../db/database';

interface EmployeeFormProps {
  departments: Department[];
  employee?: Employee | null;
  onSave: (data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ departments, employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: employee?.full_name || '',
    gender: employee?.gender || 'male' as 'male' | 'female',
    department_id: employee?.department_id ? String(employee.department_id) : '',
    position: employee?.position || '',
    employee_type: employee?.employee_type || 'staff' as 'staff' | 'external' | 'contractor',
    phone: employee?.phone || '',
    email: employee?.email || '',
    work_mode: employee?.work_mode || 'office' as 'office' | 'remote' | 'hybrid',
    city: employee?.city || '',
    timezone: employee?.timezone || 'Europe/Moscow',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка: для штатных сотрудников подразделение обязательно
    if (formData.employee_type === 'staff' && !formData.department_id) {
      alert('Для штатного сотрудника необходимо выбрать подразделение');
      return;
    }
    
    onSave({
      ...formData,
      department_id: formData.department_id ? Number(formData.department_id) : null,
    });
  };
  
  // Определяем, обязательно ли подразделение
  const isDepartmentRequired = formData.employee_type === 'staff';

  // Строим дерево подразделений для select
  const rootDepts = departments.filter(d => d.parent_id === null);
  
  const renderDeptOptions = (parentId: number | null, level: number = 0) => {
    const children = departments.filter(d => d.parent_id === parentId);
    return children.map(dept => (
      <React.Fragment key={dept.id}>
        <option value={dept.id}>
          {'—'.repeat(level)} {dept.name}
        </option>
        {renderDeptOptions(dept.id, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Иванов Иван Иванович"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пол *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип сотрудника *</label>
              <select
                name="employee_type"
                value={formData.employee_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {EMPLOYEE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Подразделение {isDepartmentRequired && '*'}
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">— Не указано —</option>
                {rootDepts.map(dept => (
                  <React.Fragment key={dept.id}>
                    <option value={dept.id}>{dept.name}</option>
                    {renderDeptOptions(dept.id, 1)}
                  </React.Fragment>
                ))}
              </select>
              {departments.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Сначала создайте оргструктуру</p>
              )}
              {!isDepartmentRequired && (
                <p className="text-xs text-gray-500 mt-1">Необязательно для внешних сотрудников и подрядчиков</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ведущий специалист"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Режим работы *</label>
              <select
                name="work_mode"
                value={formData.work_mode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="office">🏢 В офисе</option>
                <option value="remote">🏠 Удалённо</option>
                <option value="hybrid">🔄 Гибрид</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Москва"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ivanov@company.ru"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {employee ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
