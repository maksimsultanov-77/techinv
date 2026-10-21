import React from 'react';
import { Employee, Department, getDepartmentName, getEquipmentByEmployee } from '../db/database';

interface EmployeeDetailProps {
  employee: Employee;
  departments: Department[];
  currentUserRole?: string;
  onClose: () => void;
  onEdit: () => void;
}

export default function EmployeeDetail({ employee, departments, currentUserRole, onClose, onEdit }: EmployeeDetailProps) {
  const deptName = getDepartmentName(employee.department_id);
  const employeeEquipment = getEquipmentByEmployee(employee.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">📋 Информация о сотруднике</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{employee.gender === 'female' ? '👩' : '👨'}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{employee.full_name}</h3>
              <p className="text-sm text-gray-500">{deptName}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-500 w-40">Должность:</span>
              <span className="text-sm text-gray-800">{employee.position || 'Не указана'}</span>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-500 w-40">Тип сотрудника:</span>
              <span className="text-sm text-gray-800">
                {employee.employee_type === 'staff' ? '👤 Штатный' : 
                 employee.employee_type === 'external' ? '🌐 Внешний' : 
                 employee.employee_type === 'contractor' ? '📝 Подрядчик' : 'Не указан'}
              </span>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-500 w-40">Режим работы:</span>
              <span className="text-sm text-gray-800">
                {employee.work_mode === 'office' ? '🏢 В офисе' : 
                 employee.work_mode === 'remote' ? '🏠 Удалённо' : 
                 employee.work_mode === 'hybrid' ? '🔄 Гибрид' : 'Не указан'}
              </span>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-500 w-40">Город:</span>
              <span className="text-sm text-gray-800">{employee.city || 'Не указан'}</span>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-500 w-40">Часовой пояс:</span>
              <span className="text-sm text-gray-800">{employee.timezone || 'Не указан'}</span>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-500 w-40">Телефон:</span>
              <span className="text-sm text-gray-800">{employee.phone || 'Не указан'}</span>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-500 w-40">Email:</span>
              <span className="text-sm text-gray-800">{employee.email || 'Не указан'}</span>
            </div>
          </div>
          {employeeEquipment.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">🖥️ Закреплённое оборудование ({employeeEquipment.length})</h4>
              <div className="space-y-2">
                {employeeEquipment.map(eq => (
                  <div key={eq.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{eq.category_icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{eq.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{eq.category_name}</span>
                          {eq.inventory_number && <span className="ml-2 text-xs">Инв. №: {eq.inventory_number}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Закрыть
            </button>
            {currentUserRole !== 'user' && currentUserRole !== 'observer' && (
              <button onClick={onEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                ✏️ Редактировать
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
