import { useState, useEffect, useCallback } from 'react';
import {
  initDatabase,
  getCategories,
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  getStats,
  generateTestData,
  clearAllEquipment,
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  DEPARTMENTS,
  Category,
  Equipment,
  Employee,
} from './db/database';
import EquipmentForm from './components/EquipmentForm';
import EquipmentList from './components/EquipmentList';
import EquipmentDetail from './components/EquipmentDetail';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';

type ViewMode = 'equipment' | 'employees';
type EquipmentFormData = Omit<Equipment, 'id' | 'category_name' | 'category_icon' | 'created_at' | 'updated_at'>;
type EmployeeFormData = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('equipment');

  // Equipment state
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [viewingItem, setViewingItem] = useState<Equipment | null>(null);
  const [stats, setStats] = useState<{ total: number; byCategory: { name: string; icon: string; count: number }[] }>({ total: 0, byCategory: [] });

  // Employee state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [empDepartment, setEmpDepartment] = useState<string | undefined>(undefined);
  const [empWorkMode, setEmpWorkMode] = useState<string | undefined>(undefined);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [empStats, setEmpStats] = useState<{
    total: number;
    byDepartment: { name: string; count: number }[];
    byWorkMode: { mode: string; label: string; icon: string; count: number }[];
    byGender: { gender: string; count: number }[];
  }>({ total: 0, byDepartment: [], byWorkMode: [], byGender: [] });

  const [loading, setLoading] = useState(true);
  const [showTestConfirm, setShowTestConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => {
        setDbReady(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Database init error:', err);
        setDbError(err?.message || 'Ошибка инициализации базы данных');
        setLoading(false);
      });
  }, []);

  const loadEquipment = useCallback(() => {
    try {
      const cats = getCategories();
      setCategories(cats);
      const items = getAllEquipment(searchQuery || undefined, selectedCategory);
      setEquipment(items);
      const s = getStats();
      setStats(s);
    } catch (err) {
      console.error('Error loading equipment:', err);
    }
  }, [searchQuery, selectedCategory]);

  const loadEmployees = useCallback(() => {
    try {
      const items = getAllEmployees(empSearchQuery || undefined, empDepartment, empWorkMode);
      setEmployees(items);
      const s = getEmployeeStats();
      setEmpStats(s);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  }, [empSearchQuery, empDepartment, empWorkMode]);

  useEffect(() => {
    if (dbReady) {
      loadEquipment();
      loadEmployees();
    }
  }, [dbReady, loadEquipment, loadEmployees]);

  // Equipment handlers
  const handleAdd = (data: EquipmentFormData) => {
    addEquipment(data);
    setShowForm(false);
    loadEquipment();
  };

  const handleEdit = (data: EquipmentFormData) => {
    if (editingItem) {
      updateEquipment(editingItem.id, data);
      setEditingItem(null);
      loadEquipment();
    }
  };

  const handleDelete = (id: number) => {
    deleteEquipment(id);
    loadEquipment();
  };

  // Employee handlers
  const handleAddEmployee = (data: EmployeeFormData) => {
    addEmployee(data);
    setShowEmpForm(false);
    loadEmployees();
  };

  const handleEditEmployee = (data: EmployeeFormData) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
      setEditingEmployee(null);
      loadEmployees();
    }
  };

  const handleDeleteEmployee = (id: number) => {
    deleteEmployee(id);
    loadEmployees();
  };

  const handleExport = () => {
    const data = localStorage.getItem('equipment_inventory_db');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleGenerateTest = () => {
    const count = generateTestData();
    setShowTestConfirm(false);
    loadEquipment();
    alert(`✅ Создано ${count} единиц тестового оборудования`);
  };

  const handleClearAll = () => {
    clearAllEquipment();
    setShowClearConfirm(false);
    loadEquipment();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⚙️</div>
          <p className="text-gray-600 text-lg">Загрузка базы данных...</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{dbError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🖥️</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Учет техники</h1>
                <p className="text-sm text-gray-500">Система управления оборудованием и сотрудниками</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExport}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                title="Экспорт базы данных"
              >
                💾 Экспорт
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-200 -mb-4">
            <button
              onClick={() => setActiveView('equipment')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeView === 'equipment'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🖥️ Оборудование <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{stats.total}</span>
            </button>
            <button
              onClick={() => setActiveView('employees')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeView === 'employees'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Сотрудники <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{empStats.total}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'equipment' && (
          <>
            {/* Equipment Action Buttons */}
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => setShowTestConfirm(true)}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                title="Создать случайный набор данных"
              >
                🎲 Тестовые данные
              </button>
              {stats.total > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Удалить все записи"
                >
                  🗑️ Очистить
                </button>
              )}
              <button
                onClick={() => { setShowForm(true); setEditingItem(null); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                ➕ Добавить
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              <div
                className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                  !selectedCategory ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:shadow-sm'
                }`}
                onClick={() => { setSelectedCategory(undefined); }}
              >
                <div className="text-2xl mb-1">📊</div>
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-xs text-gray-500">Всего единиц</div>
              </div>
              {stats.byCategory.slice(0, 5).map(cat => (
                <div
                  key={cat.name}
                  className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                    selectedCategory === categories.find(c => c.name === cat.name)?.id
                      ? 'border-blue-500 shadow-md ring-2 ring-blue-100'
                      : 'border-gray-200 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    const catId = categories.find(c => c.name === cat.name)?.id;
                    if (selectedCategory === catId) {
                      setSelectedCategory(undefined);
                    } else {
                      setSelectedCategory(catId);
                    }
                  }}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-2xl font-bold text-gray-800">{cat.count}</div>
                  <div className="text-xs text-gray-500 truncate">{cat.name}</div>
                </div>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по названию, серийному номеру, расположению..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
                >
                  <option value="">Все категории</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>Найдено: <strong>{equipment.length}</strong> записей</span>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory(undefined); }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            </div>

            {/* Equipment List */}
            <EquipmentList
              equipment={equipment}
              onEdit={(item) => { setEditingItem(item); setShowForm(false); }}
              onDelete={handleDelete}
              onView={(item) => setViewingItem(item)}
            />
          </>
        )}

        {activeView === 'employees' && (
          <>
            {/* Employee Action Buttons */}
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => { setShowEmpForm(true); setEditingEmployee(null); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                ➕ Добавить сотрудника
              </button>
            </div>

            {/* Employee Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-2xl font-bold text-gray-800">{empStats.total}</div>
                <div className="text-xs text-gray-500">Всего сотрудников</div>
              </div>
              {empStats.byWorkMode.map(mode => (
                <div
                  key={mode.mode}
                  className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                    empWorkMode === mode.mode
                      ? 'border-blue-500 shadow-md ring-2 ring-blue-100'
                      : 'border-gray-200 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    if (empWorkMode === mode.mode) {
                      setEmpWorkMode(undefined);
                    } else {
                      setEmpWorkMode(mode.mode);
                    }
                  }}
                >
                  <div className="text-2xl mb-1">{mode.icon}</div>
                  <div className="text-2xl font-bold text-gray-800">{mode.count}</div>
                  <div className="text-xs text-gray-500">{mode.label}</div>
                </div>
              ))}
            </div>

            {/* Employee Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    value={empSearchQuery}
                    onChange={(e) => setEmpSearchQuery(e.target.value)}
                    placeholder="Поиск по ФИО, телефону, email, подразделению, городу..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {empSearchQuery && (
                    <button
                      onClick={() => setEmpSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <select
                  value={empDepartment || ''}
                  onChange={(e) => setEmpDepartment(e.target.value || undefined)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
                >
                  <option value="">Все подразделения</option>
                  {DEPARTMENTS.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>Найдено: <strong>{employees.length}</strong> сотрудников</span>
                {(empSearchQuery || empDepartment || empWorkMode) && (
                  <button
                    onClick={() => { setEmpSearchQuery(''); setEmpDepartment(undefined); setEmpWorkMode(undefined); }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            </div>

            {/* Employee List */}
            <EmployeeList
              employees={employees}
              onEdit={(emp) => { setEditingEmployee(emp); setShowEmpForm(false); }}
              onDelete={handleDeleteEmployee}
              onView={(emp) => setViewingEmployee(emp)}
            />
          </>
        )}
      </main>

      {/* Equipment Modals */}
      {showForm && (
        <EquipmentForm
          categories={categories}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingItem && (
        <EquipmentForm
          categories={categories}
          equipment={editingItem}
          onSave={handleEdit}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {viewingItem && (
        <EquipmentDetail
          equipment={viewingItem}
          onClose={() => setViewingItem(null)}
          onEdit={() => {
            setEditingItem(viewingItem);
            setViewingItem(null);
          }}
        />
      )}

      {/* Employee Modals */}
      {showEmpForm && (
        <EmployeeForm
          onSave={handleAddEmployee}
          onCancel={() => setShowEmpForm(false)}
        />
      )}

      {editingEmployee && (
        <EmployeeForm
          employee={editingEmployee}
          onSave={handleEditEmployee}
          onCancel={() => setEditingEmployee(null)}
        />
      )}

      {viewingEmployee && (
        <EmployeeDetail
          employee={viewingEmployee}
          onClose={() => setViewingEmployee(null)}
          onEdit={() => {
            setEditingEmployee(viewingEmployee);
            setViewingEmployee(null);
          }}
        />
      )}

      {/* Test Data Confirm Modal */}
      {showTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-5xl text-center mb-4">🎲</div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                Создать тестовые данные?
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Будет сгенерировано от <strong>10 до 100 единиц</strong> оборудования для каждой из 12 категорий.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-800">
                  💡 <strong>Примечание:</strong> Данные добавятся к существующим записям.
                  Ожидаемое количество: <strong>120–1200 единиц</strong>.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTestConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleGenerateTest}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-5xl text-center mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                Удалить все записи?
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Будет удалено <strong>{stats.total}</strong> единиц оборудования. Это действие нельзя отменить.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Удалить всё
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
