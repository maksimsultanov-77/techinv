import React, { useState } from 'react';
import { Equipment, Employee } from '../db/database';

interface EquipmentFormProps {
  categories: { id: number; name: string; icon: string }[];
  employees: Employee[];
  equipment?: Equipment | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: 'active', label: 'В работе', color: 'bg-green-100 text-green-800' },
  { value: 'repair', label: 'В ремонте', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'reserved', label: 'Зарезервировано', color: 'bg-blue-100 text-blue-800' },
  { value: 'written_off', label: 'Списано', color: 'bg-red-100 text-red-800' },
  { value: 'storage', label: 'На складе', color: 'bg-gray-100 text-gray-800' },
];

const EquipmentForm: React.FC<EquipmentFormProps> = ({ categories, employees, equipment, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category_id: equipment?.category_id || (categories[0]?.id || 1),
    name: equipment?.name || '',
    serial_number: equipment?.serial_number || '',
    manufacturer: equipment?.manufacturer || '',
    model: equipment?.model || '',
    location: equipment?.location || '',
    responsible_person: equipment?.responsible_person || '',
    responsible_employee_id: equipment?.responsible_employee_id ? String(equipment.responsible_employee_id) : '',
    status: equipment?.status || 'active',
    purchase_date: equipment?.purchase_date || '',
    purchase_price: equipment?.purchase_price || '',
    notes: equipment?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = e.target.value;
    const employee = empId ? employees.find(emp => emp.id === Number(empId)) : null;
    setFormData(prev => ({
      ...prev,
      responsible_employee_id: empId,
      responsible_person: employee ? employee.full_name : '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      category_id: Number(formData.category_id),
      responsible_employee_id: formData.responsible_employee_id ? Number(formData.responsible_employee_id) : null,
      purchase_price: formData.purchase_price ? Number(formData.purchase_price) : null,
    };
    // При редактировании сохраняем существующий инвентарный номер
    if (equipment) {
      onSave({ ...submitData, inventory_number: equipment.inventory_number });
    } else {
      // При создании инвентарный номер будет сгенерирован автоматически
      onSave(submitData);
    }
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
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Расположение</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Кабинет 301, этаж 3"
              />
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
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.department})
                  </option>
                ))}
              </select>
              {employees.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Сначала добавьте сотрудников в соответствующем разделе</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
};

export default EquipmentForm;
export { statusOptions };
