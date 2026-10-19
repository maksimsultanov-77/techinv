import { useState } from 'react';
import { Equipment, Category, Employee, Location, Status, bulkUpdateEquipment } from '../db/database';

interface BulkEditEquipmentProps {
  selectedIds: number[];
  categories: Category[];
  employees: Employee[];
  locations: Location[];
  statuses: Status[];
  onSave: () => void;
  onCancel: () => void;
}

export function BulkEditEquipment({
  selectedIds,
  categories,
  employees,
  locations,
  statuses,
  onSave,
  onCancel,
}: BulkEditEquipmentProps) {
  const [updates, setUpdates] = useState<Partial<Omit<Equipment, 'id' | 'created_at' | 'updated_at'>>>({});

  const handleChange = (field: string, value: any) => {
    if (value === '' || value === null) {
      const newUpdates = { ...updates };
      delete newUpdates[field as keyof typeof newUpdates];
      setUpdates(newUpdates);
    } else {
      setUpdates({ ...updates, [field]: value });
    }
  };

  const handleSave = () => {
    const count = bulkUpdateEquipment(selectedIds, updates);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            ✏️ Групповое редактирование ({selectedIds.length} единиц)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Заполните поля, которые хотите изменить. Пустые поля будут пропущены.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select
              value={updates.category_id || ''}
              onChange={(e) => handleChange('category_id', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Не изменять —</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение</label>
            <select
              value={updates.location_id || ''}
              onChange={(e) => handleChange('location_id', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Не изменять —</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>📍 {loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={updates.status_id || ''}
              onChange={(e) => handleChange('status_id', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Не изменять —</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.icon} {status.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ответственный</label>
            <select
              value={updates.responsible_employee_id || ''}
              onChange={(e) => handleChange('responsible_employee_id', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Не изменять —</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Производитель</label>
            <input
              type="text"
              value={updates.manufacturer || ''}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="— Не изменять —"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Модель</label>
            <input
              type="text"
              value={updates.model || ''}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="— Не изменять —"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Примечания</label>
            <textarea
              value={updates.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="— Не изменять —"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(updates).length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
