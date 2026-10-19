import React, { useState } from 'react';
import { Equipment, Employee, Status, getDepartmentName, getLocationFullPath, getStatusById, getCategoryFullPath } from '../db/database';
import { LabelPrint } from './LabelPrint';

interface EquipmentDetailProps {
  equipment: Equipment;
  employees: Employee[];
  statuses: Status[];
  currentUserRole?: 'superadmin' | 'admin' | 'user' | 'observer';
  onClose: () => void;
  onEdit: () => void;
  onViewEmployee?: (employee: Employee) => void;
}

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({ equipment, employees, statuses, currentUserRole, onClose, onEdit, onViewEmployee }) => {
  const [showLabelPrint, setShowLabelPrint] = useState(false);
  const statusInfo = getStatusById(equipment.status_id) || { id: 1, name: 'Неизвестно', color: '#6b7280', icon: '?', description: '' };

  // Получаем информацию о сотруднике если есть связь
  const linkedEmployee = equipment.responsible_employee_id 
    ? employees.find(emp => emp.id === equipment.responsible_employee_id) || null
    : null;

  const fields = [
    { label: 'Категория', value: getCategoryFullPath(equipment.category_id) },
    { label: 'Название', value: equipment.name },
    { label: 'Серийный номер', value: equipment.serial_number },
    { label: 'Инвентарный номер', value: equipment.inventory_number },
    { label: 'Производитель', value: equipment.manufacturer },
    { label: 'Модель', value: equipment.model },
    { label: 'Местоположение', value: getLocationFullPath(equipment.location_id) },
    { label: 'Ответственный', value: equipment.responsible_person + (linkedEmployee ? ' 🔗' : '') },
    { label: 'Статус', value: `${statusInfo.icon} ${statusInfo.name}`, isStatus: true, statusColor: statusInfo.color },
    { label: 'Дата покупки', value: equipment.purchase_date },
    { label: 'Цена', value: equipment.purchase_price ? `${equipment.purchase_price.toLocaleString()} ₽` : '' },
    { label: 'Примечания', value: equipment.notes },
    { label: 'Создано', value: equipment.created_at },
    { label: 'Обновлено', value: equipment.updated_at },
  ];

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
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium`} style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}>
                {statusInfo.icon} {statusInfo.name}
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

          {linkedEmployee && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                🔗 Связанный сотрудник
                {onViewEmployee && (
                  <button
                    onClick={() => onViewEmployee(linkedEmployee)}
                    className="ml-auto text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    👁️ Просмотр карточки
                  </button>
                )}
              </h4>
              <div className="space-y-1 text-sm">
                <p><strong>ФИО:</strong> {linkedEmployee.full_name}</p>
                <p><strong>Подразделение:</strong> {getDepartmentName(linkedEmployee.department_id)}</p>
                {linkedEmployee.position && <p><strong>Должность:</strong> {linkedEmployee.position}</p>}
                {linkedEmployee.phone && <p><strong>Телефон:</strong> {linkedEmployee.phone}</p>}
                {linkedEmployee.email && <p><strong>Email:</strong> {linkedEmployee.email}</p>}
                {linkedEmployee.city && <p><strong>Город:</strong> {linkedEmployee.city}</p>}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Закрыть
            </button>
            {currentUserRole !== 'user' && currentUserRole !== 'observer' && (
              <>
                <button
                  onClick={() => setShowLabelPrint(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  🏷️ Печать этикетки
                </button>
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ✏️ Редактировать
                </button>
              </>
            )}
          </div>

          {showLabelPrint && (
            <LabelPrint
              equipment={equipment}
              onClose={() => setShowLabelPrint(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
