import { useState, Fragment } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Equipment, Employee, Location, Status, Category, getDepartmentName, getLocationFullPath, getCategoryTree } from '../db/database';

interface EquipmentFormProps {
  categories: { id: number; name: string; icon: string }[];
  employees: Employee[];
  locations: Location[];
  statuses: Status[];
  equipment?: Equipment | null;
  onSave: (data: Omit<Equipment, 'id' | 'category_name' | 'category_icon' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  onError?: (message: string) => void;
}

export function EquipmentForm({ categories, employees, locations, statuses, equipment, onSave, onCancel, onError }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    category_id: equipment?.category_id || (categories[0]?.id || 1),
    name: equipment?.name || '',
    serial_number: equipment?.serial_number || '',
    manufacturer: equipment?.manufacturer || '',
    model: equipment?.model || '',
    location_id: equipment?.location_id ? String(equipment.location_id) : '',
    responsible_person: equipment?.responsible_person || '',
    responsible_employee_id: equipment?.responsible_employee_id ? String(equipment.responsible_employee_id) : '',
    status_id: equipment?.status_id ? String(equipment.status_id) : '1',
    purchase_date: equipment?.purchase_date || '',
    purchase_price: equipment?.purchase_price || '',
    notes: equipment?.notes || '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const empId = e.target.value;
    const employee = empId ? employees.find(emp => emp.id === Number(empId)) : null;
    setFormData(prev => ({
      ...prev,
      responsible_employee_id: empId,
      responsible_person: employee ? employee.full_name : '',
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Проверка: местоположение обязательно
    if (!formData.location_id) {
      if (onError) {
        onError('Необходимо выбрать местоположение');
      }
      return;
    }
    
    const submitData: Omit<Equipment, 'id' | 'category_name' | 'category_icon' | 'created_at' | 'updated_at'> = {
      category_id: Number(formData.category_id),
      name: formData.name,
      serial_number: formData.serial_number,
      manufacturer: formData.manufacturer,
      model: formData.model,
      location_id: Number(formData.location_id),
      responsible_person: formData.responsible_person,
      responsible_employee_id: formData.responsible_employee_id ? Number(formData.responsible_employee_id) : null,
      status_id: Number(formData.status_id),
      purchase_date: formData.purchase_date,
      purchase_price: formData.purchase_price ? Number(formData.purchase_price) : 0,
      notes: formData.notes,
      inventory_number: equipment?.inventory_number || '',
    };
    onSave(submitData);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {getCategoryTree().map(cat => (
                  <Fragment key={cat.id}>
                    <option value={cat.id}>{cat.icon} {cat.name}</option>
                    {cat.children.map(child => (
                      <option key={child.id} value={child.id}>
                        └─ {child.icon} {child.name}
                      </option>
                    ))}
                  </Fragment>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Рабочий ПК бухгалтерия"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Серийный номер</label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SN-XXXXXXXX"
              />
            </div>

            {equipment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Инвентарный номер</label>
                <input
                  type="text"
                  value={equipment.inventory_number}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Присваивается автоматически</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Производитель</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="HP, Dell, Lenovo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Модель</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Model name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение *</label>
              <select
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">— Выберите местоположение —</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{getLocationFullPath(loc.id)}</option>
                ))}
              </select>
              {locations.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Сначала создайте местоположения</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ответственный (сотрудник)</label>
              <select
                name="responsible_employee_id"
                value={formData.responsible_employee_id}
                onChange={handleEmployeeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">— Не указан —</option>
                {employees.map(emp => {
                  const deptName = emp.department_id ? getDepartmentName(emp.department_id) : '';
                  const deptLabel = deptName && deptName !== 'Не указано' ? ` (${deptName})` : '';
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}{deptLabel}
                    </option>
                  );
                })}
              </select>
              {employees.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Сначала добавьте сотрудников в соответствующем разделе</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                name="status_id"
                value={formData.status_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата покупки</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена покупки (₽)</label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Примечания</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Дополнительная информация..."
            />
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
              {equipment ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EquipmentForm;
