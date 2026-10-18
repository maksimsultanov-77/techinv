import React, { useState } from 'react';
import { Equipment, Status, getLocationFullPath, getStatusById } from '../db/database';
import { LabelPrint } from './LabelPrint';

interface EquipmentListProps {
  equipment: Equipment[];
  statuses: Status[];
  onEdit: (item: Equipment) => void;
  onDelete: (id: number) => void;
  onView: (item: Equipment) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ equipment, statuses, onEdit, onDelete, onView }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [printingItem, setPrintingItem] = useState<Equipment | null>(null);

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
      {equipment.map(item => {
        const statusInfo = getStatusById(item.status_id) || { id: 1, name: 'Неизвестно', color: '#6b7280', icon: '?', description: '' };
        return (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
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
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{item.category_name}</span>
                    {item.manufacturer && <span>🏭 {item.manufacturer}</span>}
                    {item.model && <span>📋 {item.model}</span>}
                    <span>📍 {getLocationFullPath(item.location_id)}</span>
                    {item.responsible_person && (
                      <span className="flex items-center gap-1">
                        👤 {item.responsible_person}
                        {item.responsible_employee_id && (
                          <span className="text-xs text-blue-500" title="Связан с сотрудником">🔗</span>
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
