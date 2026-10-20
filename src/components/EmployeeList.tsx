import React, { useState } from 'react';
import { Employee, Department, getDepartmentName, getEquipmentByEmployee } from '../db/database';

interface EmployeeListProps {
  employees: Employee[];
  departments: Department[];
  onEdit: (emp: Employee) => void;
  onDelete: (id: number) => void;
  onView: (emp: Employee) => void;
}

export default function EmployeeList({ employees, departments, onEdit, onDelete, onView }: EmployeeListProps) {
  if (!employees.length) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-medium text-gray-500 mb-2">Сотрудники не найдены</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {employees.map(emp => {
        const deptName = getDepartmentName(emp.department_id);
        const equipmentCount = getEquipmentByEmployee(emp.id).length;
        
        return (
          <div key={emp.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-3xl">{emp.gender === 'female' ? '👩' : '👨'}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600" onClick={() => onView(emp)}>
                    {emp.full_name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                    {emp.department_id && <span className="bg-gray-100 px-2 py-0.5 rounded">🏢 {deptName}</span>}
                    {emp.position && <span>💼 {emp.position}</span>}
                    {equipmentCount > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        🖥️ {equipmentCount} устройств
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onView(emp)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">👁️</button>
                <button onClick={() => onEdit(emp)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">✏️</button>
                <button onClick={() => onDelete(emp.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
