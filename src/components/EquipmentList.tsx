import React, { useState } from 'react';
import { Equipment, Status, Employee, getLocationFullPath, getStatusById, getCategoryFullPath } from '../db/database';
import { LabelPrint } from './LabelPrint';

interface EquipmentListProps {
  equipment: Equipment[];
  statuses: Status[];
  employees: Employee[];
  currentUserRole?: 'superadmin' | 'admin' | 'user' | 'observer';
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  onEdit: (item: Equipment) => void;
  onDelete: (id: number) => void;
  onView: (item: Equipment) => void;
  onViewEmployee?: (employee: Employee) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ equipment, statuses, employees, currentUserRole, selectedIds = [], onSelectionChange, onEdit, onDelete, onView, onViewEmployee }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [printingItem, setPrintingItem] = useState<Equipment | null>(null);

  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (selectedIds.length === equipment.length) {
        onSelectionChange([]);
      } else {
        onSelectionChange(equipment.map(item => item.id));
      }
    }
  };

  const handleSelectItem = (id: number) => {
    if (onSelectionChange) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter(sid => sid !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    }
  };

  if (!equipment.length) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-medium text-gray-500 mb-2">Оборудование не найдено</h3>
        <p className="text-gray-400">Добавьте первое устройство или измените параметры поиска</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {onSelectionChange && (
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedIds.length === equipment.length && equipment.length > 0}
            onChange={handleSelectAll}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            {selectedIds.length === equipment.length && equipment.length > 0 ? 'Снять выделение' : 'Выбрать все'}
          </span>
        </div>
      )}
      {equipment.map(item => {
        const statusInfo = getStatusById(item.status_id) || { id: 1, name: 'Неизвестно', color: '#6b7280', icon: '?', description: '' };
        const isSelected = selectedIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={`bg-white border rounded-xl p-4 hover:shadow-md transition-shadow ${
              isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {onSelectionChange && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(item.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                )}
                <div className="text-3xl flex-shrink-0">{item.category_icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                      onClick={() => onView(item)}
                    >
                      {item.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}>
                      {statusInfo.icon} {statusInfo.name}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{getCategoryFullPath(item.category_id)}</span>
                    {item.manufacturer && <span>🏭 {item.manufacturer}</span>}
                    {item.model && <span>📋 {item.model}</span>}
                    <span>📍 {getLocationFullPath(item.location_id)}</span>
                    {item.responsible_person && (
                      <span className="flex items-center gap-1">
                        👤 {item.responsible_person}
                        {item.responsible_employee_id && onViewEmployee && (
                          <button
                            onClick={() => {
                              const employee = employees.find(e => e.id === item.responsible_employee_id);
                              if (employee) onViewEmployee(employee);
                            }}
                            className="text-xs text-blue-500 hover:text-blue-700"
                            title="Просмотр карточки сотрудника"
                          >
                            🔗
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    {item.serial_number && <span>S/N: {item.serial_number}</span>}
                    {item.inventory_number && <span>INV: {item.inventory_number}</span>}
                    {item.purchase_date && <span>📅 {item.purchase_date}</span>}
                    {item.purchase_price ? <span>💰 {item.purchase_price.toLocaleString()} ₽</span> : null}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-2">
                <button
                  onClick={() => onView(item)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Просмотр"
                >
                  👁️
                </button>
                {currentUserRole !== 'observer' && (
                  <>
                    <button
                      onClick={() => setPrintingItem(item)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Печать этикетки"
                    >
                      🏷️
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>

            {deleteConfirm === item.id && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <span className="text-sm text-red-700">Удалить это оборудование?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => { onDelete(item.id); setDeleteConfirm(null); }}
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

      {printingItem && (
        <LabelPrint
          equipment={printingItem}
          onClose={() => setPrintingItem(null)}
        />
      )}
    </div>
  );
};

export default EquipmentList;
