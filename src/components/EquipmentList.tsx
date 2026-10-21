import React, { useState } from 'react';
import { Equipment, Status, Employee } from '../db/database';

interface EquipmentListProps {
  equipment: Equipment[];
  statuses: Status[];
  employees: Employee[];
  currentUserRole?: string;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  onEdit: (item: Equipment) => void;
  onDelete: (id: number) => void;
  onView: (item: Equipment) => void;
  onViewEmployee?: (employee: Employee) => void;
}

export default function EquipmentList({ equipment, statuses, employees, currentUserRole, selectedIds = [], onSelectionChange, onEdit, onDelete, onView, onViewEmployee }: EquipmentListProps) {
  if (!equipment.length) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-medium text-gray-500 mb-2">Оборудование не найдено</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {equipment.map(item => {
        const statusInfo = statuses.find(s => s.id === item.status_id) || { id: 1, name: 'Неизвестно', color: '#6b7280', icon: '?', description: '' };
        const linkedEmployee = item.responsible_employee_id ? employees.find(e => e.id === item.responsible_employee_id) : null;
        
        return (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-3xl">{item.category_icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600" onClick={() => onView(item)}>
                    {item.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}>
                      {statusInfo.icon} {statusInfo.name}
                    </span>
                    {linkedEmployee && (
                      <span className="flex items-center gap-1">
                        👤 {linkedEmployee.full_name}
                        {onViewEmployee && (
                          <button onClick={() => onViewEmployee(linkedEmployee)} className="text-blue-500 hover:text-blue-700">🔗</button>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onView(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">👁️</button>
                {currentUserRole !== 'observer' && currentUserRole !== 'user' && (
                  <>
                    <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">✏️</button>
                    <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
