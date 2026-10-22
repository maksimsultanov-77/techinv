import React, { useState } from 'react';
import { Equipment, Employee, Location, Status, Category } from '../db/database';

interface EquipmentFormProps {
  categories: Category[];
  employees: Employee[];
  locations: Location[];
  statuses: Status[];
  equipment?: Equipment | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function EquipmentForm({ categories, employees, locations, statuses, equipment, onSave, onCancel }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    category_id: equipment?.category_id || (categories[0]?.id || 1),
    name: equipment?.name || '',
    serial_number: equipment?.serial_number || '',
    manufacturer: equipment?.manufacturer || '',
    model: equipment?.model || '',
    location_id: equipment?.location_id || (locations[0]?.id || 1),
    responsible_person: equipment?.responsible_person || '',
    responsible_employee_id: equipment?.responsible_employee_id || null,
    status_id: equipment?.status_id || 1,
    purchase_date: equipment?.purchase_date || '',
    purchase_price: equipment?.purchase_price || 0,
    notes: equipment?.notes || '',
    inventory_number: equipment?.inventory_number || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {equipment ? '✏️ Редактирование оборудования' : '➕ Добавить оборудование'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                value={formData.status_id}
                onChange={(e) => setFormData({ ...formData, status_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Инвентарный номер</label>
              <input
                type="text"
                value={formData.inventory_number}
                onChange={(e) => setFormData({ ...formData, inventory_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="INV-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Серийный номер</label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="SN-123456"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Производитель</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="HP, Dell, Lenovo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Модель</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Model X100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение</label>
            <select
              value={formData.location_id}
              onChange={(e) => setFormData({ ...formData, location_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ответственный сотрудник</label>
            <select
              value={formData.responsible_employee_id || ''}
              onChange={(e) => setFormData({ ...formData, responsible_employee_id: e.target.value ? Number(e.target.value) : null, responsible_person: e.target.value ? employees.find(emp => emp.id === Number(e.target.value))?.full_name || '' : '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Не выбран</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата покупки</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label>
              <input
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Примечания</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Дополнительная информация об оборудовании"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg">
              Отмена
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
