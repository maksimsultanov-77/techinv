import React from 'react';
import { Equipment, Employee, Status, getDepartmentName, getLocationFullPath, getStatusById, getCategoryFullPath } from '../db/database';

interface EquipmentDetailProps {
  equipment: Equipment;
  employees: Employee[];
  statuses: Status[];
  currentUserRole?: string;
  onClose: () => void;
  onEdit: () => void;
  onViewEmployee?: (employee: Employee) => void;
}

export default function EquipmentDetail({ equipment, employees, statuses, currentUserRole, onClose, onEdit, onViewEmployee }: EquipmentDetailProps) {
  const statusInfo = getStatusById(equipment.status_id) || { id: 1, name: 'Неизвестно', color: '#6b7280', icon: '?', description: '' };
  const linkedEmployee = equipment.responsible_employee_id ? employees.find(emp => emp.id === equipment.responsible_employee_id) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">📋 Информация</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{equipment.category_icon}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{equipment.name}</h3>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}>
                {statusInfo.icon} {statusInfo.name}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-500 w-40">Категория:</span>
              <span className="text-sm text-gray-800">{getCategoryFullPath(equipment.category_id)}</span>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-2">
              <span className="text-sm font-medium text-gray-500 w-40">Местоположение:</span>
              <span className="text-sm text-gray-800">{getLocationFullPath(equipment.location_id)}</span>
            </div>
            {linkedEmployee && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  🔗 Связанный сотрудник
                  {onViewEmployee && (
                    <button onClick={() => onViewEmployee(linkedEmployee)} className="ml-auto text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                      👁️ Просмотр карточки
                    </button>
                  )}
                </h4>
                <div className="space-y-1 text-sm">
                  <p><strong>ФИО:</strong> {linkedEmployee.full_name}</p>
                  <p><strong>Подразделение:</strong> {getDepartmentName(linkedEmployee.department_id)}</p>
                </div>
              </div>
            )}
          </div>
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
