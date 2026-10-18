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
  generateTestEmployees,
  clearAllEmployees,
  getAllDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentTree,
  getDepartmentName,
  generateTestDepartments,
  clearAllDepartments,
  isSystemDepartment,
  getAllLocations,
  addLocation,
  deleteLocation,
  generateTestLocations,
  clearAllLocations,
  getLocationName,
  getEquipmentCountByLocation,
  getLocationTree,
  getLocationFullPath,
  isSystemLocation,
  getAllStatuses,
  Category,
  Equipment,
  Employee,
  Department,
  Location,
  Status,
} from './db/database';
import EquipmentForm from './components/EquipmentForm';
import EquipmentList from './components/EquipmentList';
import EquipmentDetail from './components/EquipmentDetail';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';

type ViewMode = 'equipment' | 'employees' | 'structure' | 'locations';
type EquipmentFormData = Omit<Equipment, 'id' | 'category_name' | 'category_icon' | 'created_at' | 'updated_at'>;
type EmployeeFormData = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('structure');

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [empDepartment, setEmpDepartment] = useState<number | undefined>(undefined);
  const [empWorkMode, setEmpWorkMode] = useState<string | undefined>(undefined);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [empStats, setEmpStats] = useState<any>({ total: 0, byDepartment: [], byWorkMode: [], byGender: [], byType: [] });

  // Structure state
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptParent, setNewDeptParent] = useState<string>('');
  const [collapsedDepts, setCollapsedDepts] = useState<Set<number>>(new Set());

  // Locations state
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocForm, setShowLocForm] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [newLocParent, setNewLocParent] = useState<string>('');
  const [showLocTestConfirm, setShowLocTestConfirm] = useState(false);
  const [showClearLocConfirm, setShowClearLocConfirm] = useState(false);
  const [collapsedLocations, setCollapsedLocations] = useState<Set<number>>(new Set());

  // Statuses state
  const [statuses, setStatuses] = useState<Status[]>([]);

  const [loading, setLoading] = useState(true);
  const [showTestConfirm, setShowTestConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearDeptConfirm, setShowClearDeptConfirm] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };
  const [showEmpTestConfirm, setShowEmpTestConfirm] = useState(false);
  const [showEmpClearConfirm, setShowEmpClearConfirm] = useState(false);
  const [showDeptTestConfirm, setShowDeptTestConfirm] = useState(false);

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
      setDepartments(getAllDepartments());
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  }, [empSearchQuery, empDepartment, empWorkMode]);

  const loadDepartments = useCallback(() => {
    try {
      setDepartments(getAllDepartments());
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  }, []);

  const loadLocations = useCallback(() => {
    try {
      setLocations(getAllLocations());
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  }, []);

  const loadStatuses = useCallback(() => {
    try {
      setStatuses(getAllStatuses());
    } catch (err) {
      console.error('Error loading statuses:', err);
    }
  }, []);

  useEffect(() => {
    if (dbReady) {
      loadEquipment();
      loadEmployees();
      loadDepartments();
      loadLocations();
      loadStatuses();
    }
  }, [dbReady, loadEquipment, loadEmployees, loadDepartments, loadLocations, loadStatuses]);

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

  // Department handlers
  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    addDepartment(newDeptName.trim(), newDeptParent ? Number(newDeptParent) : null);
    setNewDeptName('');
    setNewDeptParent('');
    setShowDeptForm(false);
    loadDepartments();
    loadEmployees();
  };

  const handleDeleteDepartment = (id: number) => {
    const result = deleteDepartment(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    loadDepartments();
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
    try {
      const count = generateTestData();
      setShowTestConfirm(false);
      loadEquipment();
      showToast(`✅ Создано ${count} единиц тестового оборудования`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка при создании тестовых данных', 'error');
    }
  };

  const handleClearAll = () => {
    clearAllEquipment();
    setShowClearConfirm(false);
    loadEquipment();
  };

  const handleGenerateTestEmployees = () => {
    try {
      const count = generateTestEmployees();
      setShowEmpTestConfirm(false);
      loadEmployees();
      showToast(`✅ Создано ${count} тестовых сотрудников`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка', 'error');
    }
  };

  const handleClearAllEmployees = () => {
    clearAllEmployees();
    setShowEmpClearConfirm(false);
    loadEmployees();
  };

  const handleGenerateTestDepartments = () => {
    const count = generateTestDepartments();
    setShowDeptTestConfirm(false);
    loadDepartments();
    loadEmployees();
    showToast(`✅ Создано ${count} подразделений`, 'success');
  };

  const toggleDeptCollapse = (id: number) => {
    setCollapsedDepts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Location handlers
  const handleAddLocation = () => {
    if (!newLocName.trim()) return;
    addLocation(newLocName.trim(), newLocDesc.trim(), newLocParent ? Number(newLocParent) : null);
    setNewLocName('');
    setNewLocDesc('');
    setNewLocParent('');
    setShowLocForm(false);
    loadLocations();
  };

  const handleDeleteLocation = (id: number) => {
    const result = deleteLocation(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    loadLocations();
  };

  const handleGenerateTestLocations = () => {
    const count = generateTestLocations();
    setShowLocTestConfirm(false);
    loadLocations();
    showToast(`✅ Создано ${count} местоположений`, 'success');
  };

  const handleClearLocations = () => {
    const result = clearAllLocations();
    if (!result.success) {
      showToast(result.message, 'error');
    } else {
      loadLocations();
      loadEquipment();
      showToast(result.message, 'success');
    }
    setShowClearLocConfirm(false);
  };

  const toggleLocationCollapse = (id: number) => {
    setCollapsedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  type DeptTreeNode = Department & { children: DeptTreeNode[]; employeeCount: number };
  const deptTree = getDepartmentTree() as DeptTreeNode[];

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
                <p className="text-sm text-gray-500">Система управления оборудованием, сотрудниками и оргструктурой</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleExport} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                💾 Экспорт
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-200 -mb-4">
            <button
              onClick={() => setActiveView('structure')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeView === 'structure' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏢 Оргструктура <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{departments.length}</span>
            </button>
            <button
              onClick={() => setActiveView('employees')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeView === 'employees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Сотрудники <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{empStats.total}</span>
            </button>
            <button
              onClick={() => setActiveView('equipment')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeView === 'equipment' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🖥️ Оборудование <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{stats.total}</span>
            </button>
            <button
              onClick={() => setActiveView('locations')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeView === 'locations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📍 Местоположения <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{locations.length}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ============ ОРГСТРУКТУРА ============ */}
        {activeView === 'structure' && (
          <>
            <div className="flex justify-end gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setShowDeptTestConfirm(true)}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
              >
                🎲 Тестовая структура
              </button>
              {departments.some(d => !isSystemDepartment(d.id)) && (
                <button
                  onClick={() => setShowClearDeptConfirm(true)}
                  className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  🗑️ Очистить
                </button>
              )}
              <button
                onClick={() => { setShowDeptForm(true); setNewDeptName(''); setNewDeptParent(''); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                ➕ Добавить подразделение
              </button>
            </div>

            <div className="space-y-3">
              {deptTree.map(dept => {
                const isCollapsed = collapsedDepts.has(dept.id);
                const isSystem = dept.id === 1 || dept.id === 2 || dept.id === 3;
                const icon = isSystem 
                  ? (dept.id === 1 ? '👥' : dept.id === 2 ? '📝' : '🌐') 
                  : '🏢';
                const bgColor = isSystem ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100';
                
                return (
                  <div key={dept.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Root department */}
                    <div className={`p-4 flex items-center justify-between border-b ${bgColor}`}>
                      <div className="flex items-center gap-3 flex-1">
                        {dept.children.length > 0 && (
                          <button
                            onClick={() => toggleDeptCollapse(dept.id)}
                            className="p-1 hover:bg-white/50 rounded transition-colors"
                            title={isCollapsed ? 'Развернуть' : 'Свернуть'}
                          >
                            <span className="text-lg">{isCollapsed ? '▶️' : '▼️'}</span>
                          </button>
                        )}
                        {dept.children.length === 0 && <div className="w-7" />}
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            {dept.name}
                            {isSystem && (
                              <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600">
                                системное
                              </span>
                            )}
                          </h3>
                          <div className="text-xs text-gray-500 flex gap-3">
                            <span>👥 {dept.employeeCount} сотр.</span>
                            {dept.children.length > 0 && <span>📁 {dept.children.length} подразд.</span>}
                          </div>
                        </div>
                      </div>
                      {!isSystem && (
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    {/* Children */}
                    {dept.children.length > 0 && !isCollapsed && (
                      <div className="p-2 space-y-1">
                        {dept.children.map(child => (
                          <div key={child.id} className="flex items-center justify-between p-2 ml-6 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📁</span>
                              <div>
                                <span className="text-sm font-medium text-gray-700">{child.name}</span>
                                <span className="text-xs text-gray-400 ml-2">👥 {child.employeeCount}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteDepartment(child.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                              title="Удалить"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Department Form Modal */}
            {showDeptForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">➕ Новое подразделение</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                      <input
                        type="text"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Например: ИТ-отдел"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Родительское подразделение</label>
                      <select
                        value={newDeptParent}
                        onChange={(e) => setNewDeptParent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">— Корневое подразделение —</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button onClick={() => setShowDeptForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Отмена
                      </button>
                      <button
                        onClick={handleAddDepartment}
                        disabled={!newDeptName.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Создать
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dept Test Confirm Modal */}
            {showDeptTestConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="p-6">
                    <div className="text-5xl text-center mb-4">🎲</div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Создать тестовую оргструктуру?</h3>
                    <p className="text-gray-600 text-center mb-4">
                      Будет создано <strong>5–10 корневых</strong> подразделений с дочерними отделами.
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowDeptTestConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Отмена
                      </button>
                      <button onClick={handleGenerateTestDepartments} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                        Создать
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============ СОТРУДНИКИ ============ */}
        {activeView === 'employees' && (
          <>
            <div className="flex justify-end gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setShowEmpTestConfirm(true)}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                title="Создать тестовых сотрудников"
              >
                🎲 Тестовые данные
              </button>
              {empStats.total > 0 && (
                <button onClick={() => setShowEmpClearConfirm(true)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                  🗑️ Очистить
                </button>
              )}
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
              {empStats.byWorkMode?.map((mode: any) => (
                <div
                  key={mode.mode}
                  className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                    empWorkMode === mode.mode ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:shadow-sm'
                  }`}
                  onClick={() => setEmpWorkMode(empWorkMode === mode.mode ? undefined : mode.mode)}
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
                    placeholder="Поиск по ФИО, телефону, email, должности, городу..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {empSearchQuery && (
                    <button onClick={() => setEmpSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
                  )}
                </div>
                <select
                  value={empDepartment || ''}
                  onChange={(e) => setEmpDepartment(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
                >
                  <option value="">Все подразделения</option>
                  {departments.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.name}</option>
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

            <EmployeeList
              employees={employees}
              departments={departments}
              onEdit={(emp) => { setEditingEmployee(emp); setShowEmpForm(false); }}
              onDelete={handleDeleteEmployee}
              onView={(emp) => setViewingEmployee(emp)}
            />
          </>
        )}

        {/* ============ ОБОРУДОВАНИЕ ============ */}
        {activeView === 'equipment' && (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => setShowTestConfirm(true)}
                disabled={employees.length === 0 || locations.length === 0}
                className={`px-3 py-2 text-sm rounded-lg transition-colors font-medium shadow-sm ${
                  employees.length === 0 || locations.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
                title={employees.length === 0 || locations.length === 0 ? 'Сначала добавьте сотрудников и местоположения' : 'Создать случайный набор данных'}
              >
                🎲 Тестовые данные
              </button>
              {stats.total > 0 && (
                <button onClick={() => setShowClearConfirm(true)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
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
            {(employees.length === 0 || locations.length === 0) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <span className="text-amber-600">⚠️</span>
                <div className="text-sm text-amber-800">
                  <strong>Невозможно создать тестовые данные.</strong> Сначала добавьте сотрудников и местоположения.
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              <div
                className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                  !selectedCategory ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:shadow-sm'
                }`}
                onClick={() => setSelectedCategory(undefined)}
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
                      ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    const catId = categories.find(c => c.name === cat.name)?.id;
                    setSelectedCategory(selectedCategory === catId ? undefined : catId);
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
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
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

            <EquipmentList
              equipment={equipment}
              statuses={statuses}
              onEdit={(item) => { setEditingItem(item); setShowForm(false); }}
              onDelete={handleDelete}
              onView={(item) => setViewingItem(item)}
            />
          </>
        )}

        {/* ============ МЕСТОПОЛОЖЕНИЯ ============ */}
        {activeView === 'locations' && (
          <>
            <div className="flex justify-end gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setShowLocTestConfirm(true)}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
              >
                🎲 Тестовые данные
              </button>
              {locations.some(l => !isSystemLocation(l.id)) && (
                <button
                  onClick={() => setShowClearLocConfirm(true)}
                  className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  🗑️ Очистить
                </button>
              )}
              <button
                onClick={() => { setShowLocForm(true); setNewLocName(''); setNewLocDesc(''); setNewLocParent(''); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                ➕ Добавить местоположение
              </button>
            </div>

            {locations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-xl font-medium text-gray-500 mb-2">Местоположения не созданы</h3>
                <p className="text-gray-400 mb-4">Добавьте местоположения вручную или сгенерируйте тестовые данные</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(getLocationTree() as (Location & { children: Location[]; equipmentCount: number })[]).map(loc => {
                  const isCollapsed = collapsedLocations.has(loc.id);
                  const isSystem = isSystemLocation(loc.id);
                  const bgColor = isSystem ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100';
                  
                  return (
                    <div key={loc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {/* Root location */}
                      <div className={`p-4 flex items-center justify-between border-b ${bgColor}`}>
                        <div className="flex items-center gap-3 flex-1">
                          {loc.children.length > 0 && (
                            <button
                              onClick={() => toggleLocationCollapse(loc.id)}
                              className="p-1 hover:bg-white/50 rounded transition-colors"
                              title={isCollapsed ? 'Развернуть' : 'Свернуть'}
                            >
                              <span className="text-lg">{isCollapsed ? '▶️' : '▼️'}</span>
                            </button>
                          )}
                          {loc.children.length === 0 && <div className="w-7" />}
                          <span className="text-2xl">📍</span>
                          <div>
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                              {loc.name}
                              {isSystem && (
                                <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600">
                                  системное
                                </span>
                              )}
                            </h3>
                            <div className="text-xs text-gray-500 flex gap-3">
                              <span>🖥️ {loc.equipmentCount} ед. оборудования</span>
                              {loc.children.length > 0 && <span>📁 {loc.children.length} вложенных</span>}
                            </div>
                          </div>
                        </div>
                        {!isSystem && (
                          <button
                            onClick={() => handleDeleteLocation(loc.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Удалить"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      {/* Children */}
                      {loc.children.length > 0 && !isCollapsed && (
                        <div className="p-2 space-y-1">
                          {loc.children.map((child: any) => (
                            <div key={child.id} className="flex items-center justify-between p-2 ml-6 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📁</span>
                                <div>
                                  <span className="text-sm font-medium text-gray-700">{child.name}</span>
                                  <span className="text-xs text-gray-400 ml-2">🖥️ {child.equipmentCount}</span>
                                </div>
                              </div>
                              {!isSystemLocation(child.id) && (
                                <button
                                  onClick={() => handleDeleteLocation(child.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                                  title="Удалить"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Location Form Modal */}
            {showLocForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">➕ Новое местоположение</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                      <input
                        type="text"
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Например: Кабинет 301"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Родительское местоположение</label>
                      <select
                        value={newLocParent}
                        onChange={(e) => setNewLocParent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">— Корневое местоположение —</option>
                        {locations.filter(l => !isSystemLocation(l.id)).map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Выберите родительское местоположение для создания вложенного</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                      <textarea
                        value={newLocDesc}
                        onChange={(e) => setNewLocDesc(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Необязательное описание"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button onClick={() => setShowLocForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Отмена
                      </button>
                      <button
                        onClick={handleAddLocation}
                        disabled={!newLocName.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Создать
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location Test Confirm Modal */}
            {showLocTestConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                  <div className="text-5xl text-center mb-4">🎲</div>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Создать тестовые местоположения?</h3>
                  <p className="text-gray-600 text-center mb-4">Будет создано 15 типичных местоположений (офисы, склады, кабинеты).</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowLocTestConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
                    <button onClick={handleGenerateTestLocations} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Создать</button>
                  </div>
                </div>
              </div>
            )}

            {/* Clear Locations Confirm Modal */}
            {showClearLocConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                  <div className="text-5xl text-center mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Очистить местоположения?</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Удалить все пользовательские местоположения? Системные местоположения (Главный офис, Вне офиса) будут сохранены.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowClearLocConfirm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleClearLocations}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Очистить
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Equipment Modals */}
      {showForm && (
        <EquipmentForm categories={categories} employees={employees} locations={locations} statuses={statuses} onSave={handleAdd} onCancel={() => setShowForm(false)} onError={(msg) => showToast(msg, 'error')} />
      )}
      {editingItem && (
        <EquipmentForm categories={categories} employees={employees} locations={locations} statuses={statuses} equipment={editingItem} onSave={handleEdit} onCancel={() => setEditingItem(null)} onError={(msg) => showToast(msg, 'error')} />
      )}
      {viewingItem && (
        <EquipmentDetail
          equipment={viewingItem}
          employees={employees}
          statuses={statuses}
          onClose={() => setViewingItem(null)}
          onEdit={() => { setEditingItem(viewingItem); setViewingItem(null); }}
        />
      )}

      {/* Employee Modals */}
      {showEmpForm && (
        <EmployeeForm departments={departments} onSave={handleAddEmployee} onCancel={() => setShowEmpForm(false)} onError={(msg) => showToast(msg, 'error')} />
      )}
      {editingEmployee && (
        <EmployeeForm departments={departments} employee={editingEmployee} onSave={handleEditEmployee} onCancel={() => setEditingEmployee(null)} onError={(msg) => showToast(msg, 'error')} />
      )}
      {viewingEmployee && (
        <EmployeeDetail
          employee={viewingEmployee}
          departments={departments}
          onClose={() => setViewingEmployee(null)}
          onEdit={() => { setEditingEmployee(viewingEmployee); setViewingEmployee(null); }}
        />
      )}

      {/* Test Data Confirm Modals */}
      {showTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">🎲</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Создать тестовые данные?</h3>
            <p className="text-gray-600 text-center mb-4">Будет сгенерировано от <strong>10 до 100 единиц</strong> оборудования для каждой категории.</p>
            {employees.length === 0 || locations.length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">⚠️ <strong>Невозможно.</strong> Сначала добавьте сотрудников и местоположения.</p>
              </div>
            ) : (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-800">💡 Сотрудников: <strong>{employees.length}</strong>, Местоположений: <strong>{locations.length}</strong></p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowTestConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
              <button onClick={handleGenerateTest} disabled={employees.length === 0 || locations.length === 0} className={`flex-1 px-4 py-2 rounded-lg font-medium ${employees.length === 0 || locations.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>Создать</button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Удалить все записи?</h3>
            <p className="text-gray-600 text-center mb-4">Будет удалено <strong>{stats.total}</strong> единиц оборудования.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
              <button onClick={handleClearAll} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Удалить всё</button>
            </div>
          </div>
        </div>
      )}

      {showEmpTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">🎲</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Создать тестовых сотрудников?</h3>
            <p className="text-gray-600 text-center mb-4">Будет сгенерировано от <strong>10 до 50 сотрудников</strong>.</p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-purple-800">💡 Подразделений: <strong>{departments.length}</strong></p>
              <p className="text-xs text-purple-600 mt-1">Сотрудники будут распределены по подразделениям. Если оргструктура не создана, все попадут в «Штат».</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEmpTestConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
              <button onClick={handleGenerateTestEmployees} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Создать</button>
            </div>
          </div>
        </div>
      )}

      {showEmpClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Удалить всех сотрудников?</h3>
            <p className="text-gray-600 text-center mb-4">Будет удалено <strong>{empStats.total}</strong> сотрудников.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowEmpClearConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
              <button onClick={handleClearAllEmployees} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Удалить всех</button>
            </div>
          </div>
        </div>
      )}

      {showDeptTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">🎲</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Создать тестовую оргструктуру?</h3>
            <p className="text-gray-600 text-center mb-4">Будет создано <strong>5–10 корневых</strong> подразделений с дочерними отделами.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeptTestConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
              <button onClick={handleGenerateTestDepartments} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Создать</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in ${
                toast.type === 'success' ? 'bg-green-600' :
                toast.type === 'error' ? 'bg-red-600' :
                'bg-blue-600'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}

      {/* Clear Departments Confirm Modal */}
      {showClearDeptConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Очистить оргструктуру?</h3>
            <p className="text-gray-600 text-center mb-4">
              Удалить все пользовательские подразделения? Системные подразделения (Штат, Подрядчики, Вне штата) будут сохранены.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearDeptConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const result = clearAllDepartments();
                  if (!result.success) {
                    showToast(result.message, 'error');
                  } else {
                    loadDepartments();
                    loadEmployees();
                    showToast(result.message, 'success');
                  }
                  setShowClearDeptConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
