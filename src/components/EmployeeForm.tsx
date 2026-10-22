import React, { useState } from 'react';
import { Employee, Department } from '../db/database';

interface EmployeeFormProps {
  departments: Department[];
  employee?: Employee | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function EmployeeForm({ departments, employee, onSave, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    full_name: employee?.full_name || '',
    gender: employee?.gender || 'male' as 'male' | 'female',
    department_id: employee?.department_id || null,
    position: employee?.position || '',
    employee_type: employee?.employee_type || 'staff' as 'staff' | 'external' | 'contractor',
    phone: employee?.phone || '',
    email: employee?.email || '',
    work_mode: employee?.work_mode || 'office' as 'office' | 'remote' | 'hybrid',
    city: employee?.city || '',
    timezone: employee?.timezone || 'Europe/Moscow',
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
            {employee ? '✏️ Редактирование сотрудника' : '➕ Добавить сотрудника'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пол</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип сотрудника</label>
              <select
                value={formData.employee_type}
                onChange={(e) => setFormData({ ...formData, employee_type: e.target.value as 'staff' | 'external' | 'contractor' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="staff">👤 Штатный</option>
                <option value="external">🌐 Внешний</option>
                <option value="contractor">📝 Подрядчик</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подразделение</label>
              <select
                value={formData.department_id || ''}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Не указано</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Введите должность"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="example@company.ru"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Режим работы</label>
              <select
                value={formData.work_mode}
                onChange={(e) => setFormData({ ...formData, work_mode: e.target.value as 'office' | 'remote' | 'hybrid' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="office">🏢 В офисе</option>
                <option value="remote">🏠 Удалённо</option>
                <option value="hybrid">🔄 Гибрид</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Введите город"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <optgroup label="Россия">
                <option value="Europe/Kaliningrad">Калининград (UTC+2)</option>
                <option value="Europe/Moscow">Москва (UTC+3)</option>
                <option value="Europe/Samara">Самара (UTC+4)</option>
                <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                <option value="Asia/Omsk">Омск (UTC+6)</option>
                <option value="Asia/Krasnoyarsk">Красноярск (UTC+7)</option>
                <option value="Asia/Irkutsk">Иркутск (UTC+8)</option>
                <option value="Asia/Yakutsk">Якутск (UTC+9)</option>
                <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
                <option value="Asia/Magadan">Магадан (UTC+11)</option>
                <option value="Asia/Kamchatka">Камчатка (UTC+12)</option>
              </optgroup>
              <optgroup label="Европа">
                <option value="Europe/London">Лондон (UTC+0)</option>
                <option value="Europe/Paris">Париж (UTC+1)</option>
                <option value="Europe/Berlin">Берлин (UTC+1)</option>
                <option value="Europe/Rome">Рим (UTC+1)</option>
                <option value="Europe/Madrid">Мадрид (UTC+1)</option>
                <option value="Europe/Warsaw">Варшава (UTC+1)</option>
                <option value="Europe/Kiev">Киев (UTC+2)</option>
                <option value="Europe/Minsk">Минск (UTC+3)</option>
                <option value="Europe/Istanbul">Стамбул (UTC+3)</option>
              </optgroup>
              <optgroup label="Азия">
                <option value="Asia/Dubai">Дубай (UTC+4)</option>
                <option value="Asia/Tehran">Тегеран (UTC+3:30)</option>
                <option value="Asia/Karachi">Карачи (UTC+5)</option>
                <option value="Asia/Kolkata">Калькутта (UTC+5:30)</option>
                <option value="Asia/Dhaka">Дакка (UTC+6)</option>
                <option value="Asia/Bangkok">Бангкок (UTC+7)</option>
                <option value="Asia/Singapore">Сингапур (UTC+8)</option>
                <option value="Asia/Shanghai">Шанхай (UTC+8)</option>
                <option value="Asia/Tokyo">Токио (UTC+9)</option>
                <option value="Asia/Seoul">Сеул (UTC+9)</option>
              </optgroup>
              <optgroup label="СНГ и Центральная Азия">
                <option value="Asia/Almaty">Алматы (UTC+6)</option>
                <option value="Asia/Tashkent">Ташкент (UTC+5)</option>
                <option value="Asia/Bishkek">Бишкек (UTC+6)</option>
                <option value="Asia/Dushanbe">Душанбе (UTC+5)</option>
                <option value="Asia/Ashgabat">Ашхабад (UTC+5)</option>
                <option value="Asia/Baku">Баку (UTC+4)</option>
                <option value="Asia/Yerevan">Ереван (UTC+4)</option>
                <option value="Asia/Tbilisi">Тбилиси (UTC+4)</option>
              </optgroup>
              <optgroup label="Америка">
                <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                <option value="America/Chicago">Чикаго (UTC-6)</option>
                <option value="America/Denver">Денвер (UTC-7)</option>
                <option value="America/Los_Angeles">Лос-Анджелес (UTC-8)</option>
                <option value="America/Anchorage">Анкоридж (UTC-9)</option>
                <option value="Pacific/Honolulu">Гонолулу (UTC-10)</option>
                <option value="America/Toronto">Торонто (UTC-5)</option>
                <option value="America/Vancouver">Ванкувер (UTC-8)</option>
                <option value="America/Mexico_City">Мехико (UTC-6)</option>
                <option value="America/Sao_Paulo">Сан-Паулу (UTC-3)</option>
                <option value="America/Buenos_Aires">Буэнос-Айрес (UTC-3)</option>
              </optgroup>
              <optgroup label="Австралия и Океания">
                <option value="Australia/Perth">Перт (UTC+8)</option>
                <option value="Australia/Adelaide">Аделаида (UTC+9:30)</option>
                <option value="Australia/Sydney">Сидней (UTC+10)</option>
                <option value="Australia/Brisbane">Брисбен (UTC+10)</option>
                <option value="Pacific/Auckland">Окленд (UTC+12)</option>
                <option value="Pacific/Fiji">Фиджи (UTC+12)</option>
              </optgroup>
              <optgroup label="Африка">
                <option value="Africa/Cairo">Каир (UTC+2)</option>
                <option value="Africa/Johannesburg">Йоханнесбург (UTC+2)</option>
                <option value="Africa/Lagos">Лагос (UTC+1)</option>
                <option value="Africa/Nairobi">Найроби (UTC+3)</option>
                <option value="Africa/Casablanca">Касабланка (UTC+1)</option>
              </optgroup>
            </select>
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
