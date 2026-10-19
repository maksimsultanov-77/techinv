import { useState, useEffect, useCallback } from 'react';
import {
  getCategories,
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  bulkUpdateEquipment,
  bulkDeleteEquipment,
  getStats,
  generateTestData,
  clearAllEquipment,
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  bulkUpdateEmployee,
  bulkDeleteEmployee,
  getEmployeeStats,
  generateTestEmployees,
  clearAllEmployees,
  getAllDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentTree,
  getDepartmentName,
  getEquipmentByDepartment,
  getEquipmentByEmployee,
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
  getCategoryFullPath,
  getAllStatuses,
  addStatus,
  deleteStatus,
  clearAllStatuses,
  isSystemStatus,
  getEquipmentCountByStatus,
  getEquipmentByStatus,
  getEquipmentByCategory,
  getEquipmentByLocation,
  getAllCategories,
  addCategory,
  deleteCategory,
  clearAllCategories,
  isSystemCategory,
  getEquipmentCountByCategory,
  getCategoryTree,
  Category,
  Equipment,
  Employee,
  Department,
  Location,
  Status,
} from './db/database';
import { EmployeeStats, LocationTreeNode, WorkMode } from './types';
import EquipmentForm from './components/EquipmentForm';
import EquipmentList from './components/EquipmentList';
import EquipmentDetail from './components/EquipmentDetail';
import { EmployeeForm } from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';
import { Modal } from './components/Modal';
import { LogViewer } from './components/LogViewer';
import { BulkEditEquipment } from './components/BulkEditEquipment';
import { BulkEditEmployee } from './components/BulkEditEmployee';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { useSettings } from './contexts/SettingsContext';
import { User } from './db/database';

type ViewMode = 'equipment' | 'employees' | 'structure' | 'locations' | 'statuses' | 'categories' | 'logs' | 'settings' | 'users';

function App() {
  const { settings, isLoaded } = useSettings();
  const [activeView, setActiveView] = useState<ViewMode>('structure');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Equipment state
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<number | undefined>(undefined);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);
  const [showBulkEditEquipment, setShowBulkEditEquipment] = useState(false);
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
  const [empType, setEmpType] = useState<string | undefined>(undefined);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [showBulkEditEmployee, setShowBulkEditEmployee] = useState(false);
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [empStats, setEmpStats] = useState<EmployeeStats>({ total: 0, byDepartment: [], byWorkMode: [], byGender: [], byType: [] });

  // Structure state
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptParent, setNewDeptParent] = useState<string>('');
  const [showClearDeptConfirm, setShowClearDeptConfirm] = useState(false);
  const [collapsedDepts, setCollapsedDepts] = useState<Set<number>>(new Set());
  const [viewingDeptEquipment, setViewingDeptEquipment] = useState<number | null>(null);
  const [viewingDeptEmployees, setViewingDeptEmployees] = useState<number | null>(null);
  const [viewingStatusEquipment, setViewingStatusEquipment] = useState<number | null>(null);
  const [viewingCategoryEquipment, setViewingCategoryEquipment] = useState<number | null>(null);
  const [viewingLocationEquipment, setViewingLocationEquipment] = useState<number | null>(null);

  // Locations state
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocForm, setShowLocForm] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [newLocParent, setNewLocParent] = useState<string>('');
  const [showClearLocConfirm, setShowClearLocConfirm] = useState(false);
  const [collapsedLocations, setCollapsedLocations] = useState<Set<number>>(new Set());

  // Statuses state
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#10b981');
  const [newStatusIcon, setNewStatusIcon] = useState('✓');
  const [newStatusDesc, setNewStatusDesc] = useState('');
  const [showClearStatusConfirm, setShowClearStatusConfirm] = useState(false);

  // Categories state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState<string>('');
  const [showClearCategoryConfirm, setShowClearCategoryConfirm] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());

  // Bulk delete confirmations
  const [showBulkDeleteEquipmentConfirm, setShowBulkDeleteEquipmentConfirm] = useState(false);
  const [showBulkDeleteEmployeeConfirm, setShowBulkDeleteEmployeeConfirm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [showTestConfirm, setShowTestConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEmpTestConfirm, setShowEmpTestConfirm] = useState(false);
  const [showEmpClearConfirm, setShowEmpClearConfirm] = useState(false);
  const [showDeptTestConfirm, setShowDeptTestConfirm] = useState(false);
  const [showLocTestConfirm, setShowLocTestConfirm] = useState(false);

  // Toast notifications
  interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Database is already initialized by SettingsProvider
  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const loadEquipment = useCallback(() => {
    try {
      const cats = getCategories();
      setCategories(cats);
      let items = getAllEquipment(searchQuery || undefined, selectedCategory, selectedStatus, selectedLocation);
      
      // Для роли "user" показываем только оборудование, закреплённое за ним
      if (currentUser?.role === 'user') {
        items = items.filter(item => item.responsible_employee_id === currentUser.id);
      }
      
      setEquipment(items);
      const s = getStats();
      setStats(s);
    } catch (err) {
      console.error('Error loading equipment:', err);
    }
  }, [searchQuery, selectedCategory, selectedStatus, selectedLocation, currentUser]);

  const loadEmployees = useCallback(() => {
    try {
      const items = getAllEmployees(empSearchQuery || undefined, empDepartment, empWorkMode, empType);
      setEmployees(items);
      const s = getEmployeeStats();
      setEmpStats(s);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  }, [empSearchQuery, empDepartment, empWorkMode, empType]);

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

  const loadCategories = useCallback(() => {
    try {
      setCategories(getAllCategories());
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      loadDepartments();
      loadLocations();
      loadStatuses();
      loadCategories();
    }
  }, [isLoaded, loadDepartments, loadLocations, loadStatuses, loadCategories]);

  useEffect(() => {
    if (isLoaded) {
      loadEquipment();
    }
  }, [isLoaded, loadEquipment]);

  useEffect(() => {
    if (isLoaded) {
      loadEmployees();
    }
  }, [isLoaded, loadEmployees]);

  // Equipment handlers
  const handleAdd = (data: any) => {
    addEquipment(data);
    setShowForm(false);
    loadEquipment();
    showToast('Оборудование добавлено', 'success');
  };

  const handleEdit = (data: any) => {
    if (editingItem) {
      updateEquipment(editingItem.id, data);
      setEditingItem(null);
      loadEquipment();
      showToast('Оборудование обновлено', 'success');
    }
  };

  const handleDelete = (id: number) => {
    deleteEquipment(id);
    loadEquipment();
    showToast('Оборудование удалено', 'success');
  };

  // Employee handlers
  const handleAddEmployee = (data: any) => {
    addEmployee(data);
    setShowEmpForm(false);
    loadEmployees();
    loadDepartments();
    showToast('Сотрудник добавлен', 'success');
  };

  const handleEditEmployee = (data: any) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
      setEditingEmployee(null);
      loadEmployees();
      loadDepartments();
      loadEquipment();
      showToast('Сотрудник обновлён', 'success');
    }
  };

  const handleDeleteEmployee = (id: number) => {
    const result = deleteEmployee(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    loadEmployees();
    loadDepartments();
    showToast(result.message, 'success');
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
    showToast('Подразделение добавлено', 'success');
  };

  const handleDeleteDepartment = (id: number) => {
    const result = deleteDepartment(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    loadDepartments();
    showToast('Подразделение удалено', 'success');
  };

  const handleGenerateTestDepartments = () => {
    const count = generateTestDepartments();
    setShowDeptTestConfirm(false);
    loadDepartments();
    loadEmployees();
    showToast(`Создано ${count} подразделений`, 'success');
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
    showToast('Местоположение добавлено', 'success');
  };

  const handleDeleteLocation = (id: number) => {
    const result = deleteLocation(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    loadLocations();
    showToast('Местоположение удалено', 'success');
  };

  const handleGenerateTestLocations = () => {
    const count = generateTestLocations();
    setShowLocTestConfirm(false);
    loadLocations();
    showToast(`Создано ${count} местоположений`, 'success');
  };

  // Status handlers
  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    addStatus(newStatusName.trim(), newStatusColor, newStatusIcon, newStatusDesc.trim());
    setNewStatusName('');
    setNewStatusColor('#10b981');
    setNewStatusIcon('✓');
    setNewStatusDesc('');
    setShowStatusForm(false);
    loadStatuses();
    showToast('Статус добавлен', 'success');
  };

  const handleDeleteStatus = (id: number) => {
    const result = deleteStatus(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    loadStatuses();
    showToast('Статус удалён', 'success');
  };

  // Category handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim(), newCategoryIcon, newCategoryDesc.trim(), newCategoryParent ? Number(newCategoryParent) : null);
    setNewCategoryName('');
    setNewCategoryIcon('📦');
    setNewCategoryDesc('');
    setNewCategoryParent('');
    setShowCategoryForm(false);
    loadCategories();
    showToast('Категория добавлена', 'success');
  };

  const handleDeleteCategory = (id: number) => {
    const result = deleteCategory(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    loadCategories();
    showToast('Категория удалена', 'success');
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
      showToast('Данные экспортированы', 'success');
    }
  };

  const handleGenerateTest = () => {
    try {
      const count = generateTestData();
      setShowTestConfirm(false);
      loadEquipment();
      showToast(`Создано ${count} единиц оборудования`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка', 'error');
    }
  };

  const handleClearAll = () => {
    clearAllEquipment();
    setShowClearConfirm(false);
    loadEquipment();
    showToast('Оборудование очищено', 'success');
  };

  const handleGenerateTestEmployees = () => {
    try {
      const count = generateTestEmployees();
      setShowEmpTestConfirm(false);
      loadEmployees();
      showToast(`Создано ${count} сотрудников`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка', 'error');
    }
  };

  const handleClearAllEmployees = () => {
    clearAllEmployees();
    setShowEmpClearConfirm(false);
    loadEmployees();
    showToast('Сотрудники очищены', 'success');
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

  // Проверка авторизации
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const mainContent = (
    <>
      {/* ============ ОРГСТРУКТУРА ============ */}
      {activeView === 'structure' && (
        <>
          <div className="flex justify-end gap-2 mb-4 flex-wrap">
            {currentUser.role === 'superadmin' && (
              <button
                onClick={() => setShowDeptTestConfirm(true)}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
              >
                🎲 Тестовая структура
              </button>
            )}
            {currentUser.role === 'superadmin' && departments.some(d => !isSystemDepartment(d.id)) && (
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
            {getDepartmentTree().map(dept => {
              const isCollapsed = collapsedDepts.has(dept.id);
              const isSystem = isSystemDepartment(dept.id);
              const bgColor = isSystem ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100';
              const deptEquipmentCount = getEquipmentByDepartment(dept.id).length;
              
              return (
                <div key={dept.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className={`p-4 flex items-center justify-between border-b ${bgColor}`}>
                    <div className="flex items-center gap-3 flex-1">
                      {dept.children.length > 0 && (
                        <button
                          onClick={() => {
                            setCollapsedDepts(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(dept.id)) {
                                newSet.delete(dept.id);
                              } else {
                                newSet.add(dept.id);
                              }
                              return newSet;
                            });
                          }}
                          className="p-1 hover:bg-white/50 rounded transition-colors"
                        >
                          <span className="text-lg">{isCollapsed ? '▶️' : '▼️'}</span>
                        </button>
                      )}
                      {dept.children.length === 0 && <div className="w-7" />}
                      <span className="text-2xl">🏢</span>
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
                          {deptEquipmentCount > 0 && <span>🖥️ {deptEquipmentCount} оборуд.</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {dept.employeeCount > 0 && (
                        <button
                          onClick={() => setViewingDeptEmployees(dept.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Просмотр сотрудников"
                        >
                          👥
                        </button>
                      )}
                      {deptEquipmentCount > 0 && (
                        <button
                          onClick={() => setViewingDeptEquipment(dept.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Просмотр оборудования"
                        >
                          🖥️
                        </button>
                      )}
                      {!isSystem && (
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  {dept.children.length > 0 && !isCollapsed && (
                    <div className="p-2 space-y-1">
                      {dept.children.map((child: any) => {
                        const childEquipmentCount = getEquipmentByDepartment(child.id).length;
                        return (
                          <div key={child.id} className="flex items-center justify-between p-2 ml-6 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📁</span>
                              <div>
                                <span className="text-sm font-medium text-gray-700">{child.name}</span>
                                <span className="text-xs text-gray-400 ml-2">👥 {child.employeeCount}</span>
                                {childEquipmentCount > 0 && (
                                  <span className="text-xs text-gray-400 ml-2">🖥️ {childEquipmentCount}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {child.employeeCount > 0 && (
                                <button
                                  onClick={() => setViewingDeptEmployees(child.id)}
                                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
                                  title="Просмотр сотрудников"
                                >
                                  👥
                                </button>
                              )}
                              {childEquipmentCount > 0 && (
                                <button
                                  onClick={() => setViewingDeptEquipment(child.id)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                  title="Просмотр оборудования"
                                >
                                  🖥️
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteDepartment(child.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ============ СОТРУДНИКИ ============ */}
      {activeView === 'employees' && (
        <>
          <div className="flex justify-end gap-2 mb-4 flex-wrap">
            {currentUser.role === 'superadmin' && (
              <button
                onClick={() => setShowEmpTestConfirm(true)}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
              >
                🎲 Тестовые данные
              </button>
            )}
            {currentUser.role === 'superadmin' && empStats.total > 0 && (
              <button
                onClick={() => setShowEmpClearConfirm(true)}
                className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                value={empSearchQuery}
                onChange={(e) => setEmpSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={empDepartment || ''}
                onChange={(e) => setEmpDepartment(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все подразделения</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
              <select
                value={empType || ''}
                onChange={(e) => setEmpType(e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все типы</option>
                <option value="staff">Штатный</option>
                <option value="external">Внешний</option>
                <option value="contractor">Подрядчик</option>
              </select>
              <select
                value={empWorkMode || ''}
                onChange={(e) => setEmpWorkMode(e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все режимы</option>
                <option value="office">В офисе</option>
                <option value="remote">Удалённо</option>
                <option value="hybrid">Гибрид</option>
              </select>
            </div>
          </div>

          {selectedEmployeeIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  <strong>Выбрано: {selectedEmployeeIds.length}</strong> сотрудников
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBulkEditEmployee(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    onClick={() => setShowBulkDeleteEmployeeConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    🗑️ Удалить
                  </button>
                  <button
                    onClick={() => setSelectedEmployeeIds([])}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          <EmployeeList
            employees={employees}
            departments={departments}
            selectedIds={selectedEmployeeIds}
            onSelectionChange={setSelectedEmployeeIds}
            onEdit={(emp) => { setEditingEmployee(emp); setShowEmpForm(false); }}
            onDelete={handleDeleteEmployee}
            onView={(emp) => setViewingEmployee(emp)}
          />
        </>
      )}

      {/* ============ ОБОРУДОВАНИЕ ============ */}
      {activeView === 'equipment' && (
        <>
          {currentUser.role !== 'user' && (
            <div className="flex justify-end gap-2 mb-4 flex-wrap">
              {currentUser.role === 'superadmin' && (
                <>
                  <button
                    onClick={() => setShowTestConfirm(true)}
                    disabled={employees.length === 0 || locations.length === 0}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors font-medium shadow-sm ${
                      employees.length === 0 || locations.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    🎲 Тестовые данные
                  </button>
                  {currentUser.role === 'superadmin' && stats.total > 0 && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
                </>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все категории</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              <select
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все статусы</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                ))}
              </select>
              <select
                value={selectedLocation || ''}
                onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все местоположения</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>📍 {loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedEquipmentIds.length > 0 && currentUser.role !== 'user' && currentUser.role !== 'observer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  <strong>Выбрано: {selectedEquipmentIds.length}</strong> единиц оборудования
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBulkEditEquipment(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    onClick={() => setShowBulkDeleteEquipmentConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    🗑️ Удалить
                  </button>
                  <button
                    onClick={() => setSelectedEquipmentIds([])}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          <EquipmentList
            equipment={equipment}
            statuses={statuses}
            employees={employees}
            currentUserRole={currentUser.role}
            selectedIds={selectedEquipmentIds}
            onSelectionChange={setSelectedEquipmentIds}
            onEdit={(item) => { setEditingItem(item); setShowForm(false); }}
            onDelete={handleDelete}
            onView={(item) => setViewingItem(item)}
            onViewEmployee={(emp) => setViewingEmployee(emp)}
          />
        </>
      )}

      {/* ============ МЕСТОПОЛОЖЕНИЯ ============ */}
      {activeView === 'locations' && (
        <>
          <div className="flex justify-end gap-2 mb-4 flex-wrap">
            {currentUser.role === 'superadmin' && (
              <button
                onClick={() => setShowLocTestConfirm(true)}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
              >
                🎲 Тестовые данные
              </button>
            )}
            {currentUser.role === 'superadmin' && locations.some(l => !isSystemLocation(l.id)) && (
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

          <div className="space-y-3">
            {(getLocationTree() as LocationTreeNode[]).map(loc => {
              const isCollapsed = collapsedLocations.has(loc.id);
              const isSystem = isSystemLocation(loc.id);
              const bgColor = isSystem ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100';
              
              return (
                <div key={loc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className={`p-4 flex items-center justify-between border-b ${bgColor}`}>
                    <div className="flex items-center gap-3 flex-1">
                      {loc.children.length > 0 && (
                        <button
                          onClick={() => {
                            setCollapsedLocations(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(loc.id)) {
                                newSet.delete(loc.id);
                              } else {
                                newSet.add(loc.id);
                              }
                              return newSet;
                            });
                          }}
                          className="p-1 hover:bg-white/50 rounded transition-colors"
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
                    <div className="flex gap-1">
                      {loc.equipmentCount > 0 && (
                        <button
                          onClick={() => setViewingLocationEquipment(loc.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Просмотр оборудования"
                        >
                          🖥️
                        </button>
                      )}
                      {!isSystem && (
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
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
                          <div className="flex gap-1">
                            {child.equipmentCount > 0 && (
                              <button
                                onClick={() => setViewingLocationEquipment(child.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                title="Просмотр оборудования"
                              >
                                🖥️
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteLocation(child.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ============ СТАТУСЫ ============ */}
      {activeView === 'statuses' && (
        <>
          <div className="flex justify-end gap-2 mb-4 flex-wrap">
            {currentUser.role === 'superadmin' && statuses.some(s => !isSystemStatus(s.id)) && (
              <button
                onClick={() => setShowClearStatusConfirm(true)}
                className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                🗑️ Очистить
              </button>
            )}
            <button
              onClick={() => { setShowStatusForm(true); setNewStatusName(''); setNewStatusColor('#10b981'); setNewStatusIcon('✓'); setNewStatusDesc(''); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              ➕ Добавить статус
            </button>
          </div>

          <div className="space-y-3">
            {statuses.map(status => {
              const eqCount = getEquipmentCountByStatus(status.id);
              const isSystem = isSystemStatus(status.id);
              
              return (
                <div key={status.id} className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${isSystem ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold flex-shrink-0"
                        style={{ backgroundColor: status.color + '20', color: status.color }}
                      >
                        {status.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {status.name}
                          </h3>
                          {isSystem && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              системный
                            </span>
                          )}
                        </div>
                        {status.description && (
                          <p className="text-sm text-gray-500 mt-1">{status.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">🖥️ {eqCount} единиц оборудования</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {eqCount > 0 && (
                        <button
                          onClick={() => setViewingStatusEquipment(status.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Просмотр оборудования"
                        >
                          🖥️
                        </button>
                      )}
                      {!isSystem && (
                        <button
                          onClick={() => handleDeleteStatus(status.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ============ КАТЕГОРИИ ============ */}
      {activeView === 'categories' && (
        <>
          <div className="flex justify-end gap-2 mb-4 flex-wrap">
            {currentUser.role === 'superadmin' && categories.some(c => !isSystemCategory(c.id)) && (
              <button
                onClick={() => setShowClearCategoryConfirm(true)}
                className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                🗑️ Очистить
              </button>
            )}
            <button
              onClick={() => { setShowCategoryForm(true); setNewCategoryName(''); setNewCategoryIcon('📦'); setNewCategoryDesc(''); setNewCategoryParent(''); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              ➕ Добавить категорию
            </button>
          </div>

          <div className="space-y-3">
            {getCategoryTree().map(cat => {
              const isCollapsed = collapsedCategories.has(cat.id);
              const isSystem = isSystemCategory(cat.id);
              const bgColor = isSystem ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100';
              
              return (
                <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className={`p-4 flex items-center justify-between border-b ${bgColor}`}>
                    <div className="flex items-center gap-3 flex-1">
                      {cat.children.length > 0 && (
                        <button
                          onClick={() => {
                            setCollapsedCategories(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(cat.id)) {
                                newSet.delete(cat.id);
                              } else {
                                newSet.add(cat.id);
                              }
                              return newSet;
                            });
                          }}
                          className="p-1 hover:bg-white/50 rounded transition-colors"
                        >
                          <span className="text-lg">{isCollapsed ? '▶️' : '▼️'}</span>
                        </button>
                      )}
                      {cat.children.length === 0 && <div className="w-7" />}
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          {cat.name}
                          {isSystem && (
                            <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600">
                              системная
                            </span>
                          )}
                        </h3>
                        <div className="text-xs text-gray-500 flex gap-3">
                          <span>🖥️ {cat.equipmentCount} ед. оборудования</span>
                          {cat.children.length > 0 && <span>📁 {cat.children.length} вложенных</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {cat.equipmentCount > 0 && (
                        <button
                          onClick={() => setViewingCategoryEquipment(cat.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Просмотр оборудования"
                        >
                          🖥️
                        </button>
                      )}
                      {!isSystem && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  {cat.children.length > 0 && !isCollapsed && (
                    <div className="p-2 space-y-1">
                      {cat.children.map((child: any) => (
                        <div key={child.id} className="flex items-center justify-between p-2 ml-6 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{child.icon}</span>
                            <div>
                              <span className="text-sm font-medium text-gray-700">{child.name}</span>
                              <span className="text-xs text-gray-400 ml-2">🖥️ {child.equipmentCount}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {child.equipmentCount > 0 && (
                              <button
                                onClick={() => setViewingCategoryEquipment(child.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                title="Просмотр оборудования"
                              >
                                🖥️
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCategory(child.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ============ ЛОГИ ============ */}
      {activeView === 'logs' && (
        <LogViewer showToast={showToast} currentUser={currentUser} />
      )}

      {/* ============ НАСТРОЙКИ ============ */}
      {activeView === 'settings' && (
        <Settings showToast={showToast} />
      )}

      {/* ============ ПОЛЬЗОВАТЕЛИ ============ */}
      {activeView === 'users' && (currentUser.role === 'superadmin' || currentUser.role === 'admin') && (
        <UserManagement currentUser={currentUser} showToast={showToast} />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {settings.menuPosition === 'top' ? (
        <>
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🖥️</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{settings.organizationName}</h1>
                    <p className="text-sm text-gray-500">Система управления оборудованием, сотрудниками и оргструктурой</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <span className="text-lg">{currentUser.role === 'superadmin' ? '👑' : currentUser.role === 'admin' ? '🔑' : currentUser.role === 'observer' ? '👁️' : '👤'}</span>
                    <span className="text-sm font-medium text-gray-700">{currentUser.fullName}</span>
                  </div>
                  <button onClick={handleExport} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                    💾 Экспорт
                  </button>
                  <button onClick={handleLogout} className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    🚪 Выйти
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 mt-4 border-b border-gray-200 -mb-4 overflow-x-auto">
                {currentUser.role !== 'user' && (
                  <>
                    <button
                      onClick={() => setActiveView('structure')}
                      className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                        activeView === 'structure' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🏢 Оргструктура <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{departments.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveView('employees')}
                      className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                        activeView === 'employees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      👥 Сотрудники <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{empStats.total}</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveView('equipment')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeView === 'equipment' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🖥️ Оборудование <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{currentUser.role === 'user' ? getEquipmentByEmployee(currentUser.id).length : stats.total}</span>
                </button>
                {currentUser.role !== 'user' && (
                  <>
                    <button
                      onClick={() => setActiveView('locations')}
                      className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                        activeView === 'locations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      📍 Местоположения <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{locations.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveView('statuses')}
                      className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                        activeView === 'statuses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🏷️ Статусы <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{statuses.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveView('categories')}
                      className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                        activeView === 'categories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      📁 Категории <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{categories.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveView('logs')}
                      className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                        activeView === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      📋 Логи
                    </button>
                  </>
                )}
                {currentUser.role !== 'user' && (
                  <button
                    onClick={() => setActiveView('settings')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                      activeView === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ⚙️ Настройки
                  </button>
                )}
                {(currentUser.role === 'superadmin' || currentUser.role === 'admin') && (
                  <button
                    onClick={() => setActiveView('users')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                      activeView === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    👥 Пользователи
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {mainContent}
          </main>
        </>
      ) : (
        <div className="sidebar-layout">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            stats={stats}
            empStats={empStats}
            departments={departments}
            locations={locations}
            statuses={statuses}
            categories={categories}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
          <div className="sidebar-content">
            <main className="p-6">
              {mainContent}
            </main>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
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

      {/* Модальные окна для сотрудников */}
      {showEmpForm && (
        <EmployeeForm
          departments={departments}
          onSave={handleAddEmployee}
          onCancel={() => setShowEmpForm(false)}
        />
      )}
      {editingEmployee && (
        <EmployeeForm
          departments={departments}
          employee={editingEmployee}
          onSave={handleEditEmployee}
          onCancel={() => setEditingEmployee(null)}
        />
      )}
      {viewingEmployee && (
        <EmployeeDetail
          employee={viewingEmployee}
          departments={departments}
          onClose={() => setViewingEmployee(null)}
          onEdit={() => { setEditingEmployee(viewingEmployee); setViewingEmployee(null); }}
        />
      )}
      {showBulkEditEmployee && (
        <BulkEditEmployee
          selectedIds={selectedEmployeeIds}
          departments={departments}
          onSave={() => {
            setShowBulkEditEmployee(false);
            setSelectedEmployeeIds([]);
            loadEmployees();
            loadDepartments();
            loadEquipment();
            showToast('Сотрудники обновлены', 'success');
          }}
          onCancel={() => setShowBulkEditEmployee(false)}
        />
      )}
      {showBulkDeleteEmployeeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Удалить сотрудников?</h3>
            <p className="text-gray-600 text-center mb-4">
              Будет удалено <strong>{selectedEmployeeIds.length}</strong> сотрудников.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeleteEmployeeConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const result = bulkDeleteEmployee(selectedEmployeeIds);
                  if (!result.success) {
                    showToast(result.message, 'error');
                    setShowBulkDeleteEmployeeConfirm(false);
                    return;
                  }
                  setSelectedEmployeeIds([]);
                  setShowBulkDeleteEmployeeConfirm(false);
                  loadEmployees();
                  loadDepartments();
                  showToast(result.message, 'success');
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальные окна для оборудования */}
      {showForm && (
        <EquipmentForm
          categories={categories}
          employees={employees}
          locations={locations}
          statuses={statuses}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}
      {editingItem && (
        <EquipmentForm
          categories={categories}
          employees={employees}
          locations={locations}
          statuses={statuses}
          equipment={editingItem}
          onSave={handleEdit}
          onCancel={() => setEditingItem(null)}
        />
      )}
      {viewingItem && (
        <EquipmentDetail
          equipment={viewingItem}
          employees={employees}
          statuses={statuses}
          onClose={() => setViewingItem(null)}
          onEdit={() => { setEditingItem(viewingItem); setViewingItem(null); }}
          onViewEmployee={(emp) => {
            setViewingItem(null);
            setViewingEmployee(emp);
          }}
        />
      )}
      {showBulkEditEquipment && (
        <BulkEditEquipment
          selectedIds={selectedEquipmentIds}
          categories={categories}
          employees={employees}
          locations={locations}
          statuses={statuses}
          onSave={() => {
            setShowBulkEditEquipment(false);
            setSelectedEquipmentIds([]);
            loadEquipment();
            showToast('Оборудование обновлено', 'success');
          }}
          onCancel={() => setShowBulkEditEquipment(false)}
        />
      )}
      {showBulkDeleteEquipmentConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Удалить оборудование?</h3>
            <p className="text-gray-600 text-center mb-4">
              Будет удалено <strong>{selectedEquipmentIds.length}</strong> единиц оборудования.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeleteEquipmentConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  bulkDeleteEquipment(selectedEquipmentIds);
                  setSelectedEquipmentIds([]);
                  setShowBulkDeleteEquipmentConfirm(false);
                  loadEquipment();
                  showToast('Оборудование удалено', 'success');
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальные окна для местоположений */}
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
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={newLocDesc}
                  onChange={(e) => setNewLocDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Модальные окна для статусов */}
      {showStatusForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">➕ Новый статус</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: На утилизации"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цвет *</label>
                  <input
                    type="color"
                    value={newStatusColor}
                    onChange={(e) => setNewStatusColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Иконка *</label>
                  <input
                    type="text"
                    value={newStatusIcon}
                    onChange={(e) => setNewStatusIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="✓"
                    maxLength={2}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={newStatusDesc}
                  onChange={(e) => setNewStatusDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setShowStatusForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Отмена
                </button>
                <button
                  onClick={handleAddStatus}
                  disabled={!newStatusName.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальные окна для категорий */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">➕ Новая категория</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Ноутбуки"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Иконка *</label>
                  <input
                    type="text"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="📦"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Родительская категория</label>
                  <select
                    value={newCategoryParent}
                    onChange={(e) => setNewCategoryParent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">— Корневая категория —</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setShowCategoryForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Отмена
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждения тестовых данных */}
      {showTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">🎲</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Создать тестовые данные?</h3>
            <p className="text-gray-600 text-center mb-4">Будет сгенерировано оборудование для каждой категории.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowTestConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
              <button onClick={handleGenerateTest} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Создать</button>
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
            <p className="text-gray-600 text-center mb-4">Будет сгенерировано от 10 до 50 сотрудников.</p>
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
            <p className="text-gray-600 text-center mb-4">Будет создано 5–10 корневых подразделений с дочерними отделами.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeptTestConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
              <button onClick={handleGenerateTestDepartments} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Создать</button>
            </div>
          </div>
        </div>
      )}

      {showClearDeptConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Очистить оргструктуру?</h3>
            <p className="text-gray-600 text-center mb-4">
              Удалить все пользовательские подразделения? Системные подразделения будут сохранены.
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

      {showLocTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">🎲</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Создать тестовые местоположения?</h3>
            <p className="text-gray-600 text-center mb-4">Будет создано 15 типичных местоположений.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLocTestConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
              <button onClick={handleGenerateTestLocations} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Создать</button>
            </div>
          </div>
        </div>
      )}

      {showClearLocConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Очистить местоположения?</h3>
            <p className="text-gray-600 text-center mb-4">
              Удалить все пользовательские местоположения? Системные местоположения будут сохранены.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearLocConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const result = clearAllLocations();
                  if (!result.success) {
                    showToast(result.message, 'error');
                  } else {
                    loadLocations();
                    loadEquipment();
                    showToast(result.message, 'success');
                  }
                  setShowClearLocConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearStatusConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Очистить статусы?</h3>
            <p className="text-gray-600 text-center mb-4">
              Удалить все пользовательские статусы? Системные статусы будут сохранены.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearStatusConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const result = clearAllStatuses();
                  if (!result.success) {
                    showToast(result.message, 'error');
                  } else {
                    loadStatuses();
                    loadEquipment();
                    showToast(result.message, 'success');
                  }
                  setShowClearStatusConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearCategoryConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Очистить категории?</h3>
            <p className="text-gray-600 text-center mb-4">
              Удалить все пользовательские категории? Системные категории будут сохранены.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearCategoryConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const result = clearAllCategories();
                  if (!result.success) {
                    showToast(result.message, 'error');
                  } else {
                    loadCategories();
                    loadEquipment();
                    showToast(result.message, 'success');
                  }
                  setShowClearCategoryConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Просмотр оборудования подразделения */}
      {viewingDeptEquipment !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                🖥️ Оборудование подразделения "{getDepartmentName(viewingDeptEquipment)}"
              </h2>
              <button 
                onClick={() => setViewingDeptEquipment(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const deptEquipment = getEquipmentByDepartment(viewingDeptEquipment);
                if (deptEquipment.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-5xl mb-4">📦</div>
                      <p>Нет закреплённого оборудования</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {deptEquipment.map(eq => (
                      <div key={eq.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{eq.category_icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800">{eq.name}</div>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{eq.category_name}</span>
                              {eq.manufacturer && <span>🏭 {eq.manufacturer}</span>}
                              {eq.model && <span>📋 {eq.model}</span>}
                              {eq.inventory_number && <span>📝 {eq.inventory_number}</span>}
                              {eq.serial_number && <span>🔢 {eq.serial_number}</span>}
                            </div>
                            {eq.responsible_employee_id && (
                              <div className="mt-2 text-xs text-gray-400">
                                👤 {employees.find(e => e.id === eq.responsible_employee_id)?.full_name || 'Неизвестно'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewingDeptEquipment(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Просмотр сотрудников подразделения */}
      {viewingDeptEmployees !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                👥 Сотрудники подразделения "{getDepartmentName(viewingDeptEmployees)}"
              </h2>
              <button 
                onClick={() => setViewingDeptEmployees(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const deptEmployees = employees.filter(emp => emp.department_id === viewingDeptEmployees);
                if (deptEmployees.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-5xl mb-4">👥</div>
                      <p>Нет сотрудников в подразделении</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {deptEmployees.map(emp => {
                      const genderIcon = emp.gender === 'female' ? '👩' : '👨';
                      const empEquipmentCount = getEquipmentByEmployee(emp.id).length;
                      return (
                        <div key={emp.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <span className="text-3xl flex-shrink-0">{genderIcon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-semibold text-gray-800">{emp.full_name}</div>
                                {emp.employee_type !== 'staff' && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {emp.employee_type === 'external' ? '🌐 Внешний' : '📝 Подрядчик'}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                {emp.position && <span>💼 {emp.position}</span>}
                                {emp.phone && <span>📞 {emp.phone}</span>}
                                {emp.email && <span>✉️ {emp.email}</span>}
                                {emp.city && <span>📍 {emp.city}</span>}
                                {empEquipmentCount > 0 && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    🖥️ {empEquipmentCount} {empEquipmentCount === 1 ? 'устройство' : empEquipmentCount < 5 ? 'устройства' : 'устройств'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setViewingDeptEmployees(null);
                                setViewingEmployee(emp);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Просмотр карточки"
                            >
                              👁️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewingDeptEmployees(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Просмотр оборудования по статусу */}
      {viewingStatusEquipment !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                🖥️ Оборудование со статусом "{statuses.find(s => s.id === viewingStatusEquipment)?.name}"
              </h2>
              <button 
                onClick={() => setViewingStatusEquipment(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const statusEquipment = getEquipmentByStatus(viewingStatusEquipment);
                if (statusEquipment.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-5xl mb-4">📦</div>
                      <p>Нет оборудования с этим статусом</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {statusEquipment.map(eq => (
                      <div key={eq.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{eq.category_icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800">{eq.name}</div>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{eq.category_name}</span>
                              {eq.manufacturer && <span>🏭 {eq.manufacturer}</span>}
                              {eq.model && <span>📋 {eq.model}</span>}
                              {eq.inventory_number && <span>📝 {eq.inventory_number}</span>}
                              {eq.serial_number && <span>🔢 {eq.serial_number}</span>}
                            </div>
                            {eq.responsible_employee_id && (
                              <div className="mt-2 text-xs text-gray-400">
                                👤 {employees.find(e => e.id === eq.responsible_employee_id)?.full_name || 'Неизвестно'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewingStatusEquipment(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Просмотр оборудования по категории */}
      {viewingCategoryEquipment !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                🖥️ Оборудование в категории "{getCategoryFullPath(viewingCategoryEquipment)}"
              </h2>
              <button 
                onClick={() => setViewingCategoryEquipment(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const categoryEquipment = getEquipmentByCategory(viewingCategoryEquipment, true);
                if (categoryEquipment.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-5xl mb-4">📦</div>
                      <p>Нет оборудования в этой категории</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {categoryEquipment.map(eq => (
                      <div key={eq.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{eq.category_icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800">{eq.name}</div>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{getCategoryFullPath(eq.category_id)}</span>
                              {eq.manufacturer && <span>🏭 {eq.manufacturer}</span>}
                              {eq.model && <span>📋 {eq.model}</span>}
                              {eq.inventory_number && <span>📝 {eq.inventory_number}</span>}
                              {eq.serial_number && <span>🔢 {eq.serial_number}</span>}
                            </div>
                            {eq.responsible_employee_id && (
                              <div className="mt-2 text-xs text-gray-400">
                                👤 {employees.find(e => e.id === eq.responsible_employee_id)?.full_name || 'Неизвестно'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewingCategoryEquipment(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Просмотр оборудования по местоположению */}
      {viewingLocationEquipment !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                🖥️ Оборудование в местоположении "{getLocationFullPath(viewingLocationEquipment)}"
              </h2>
              <button 
                onClick={() => setViewingLocationEquipment(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const locationEquipment = getEquipmentByLocation(viewingLocationEquipment, true);
                if (locationEquipment.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-5xl mb-4">📦</div>
                      <p>Нет оборудования в этом местоположении</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {locationEquipment.map(eq => (
                      <div key={eq.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{eq.category_icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800">{eq.name}</div>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{eq.category_name}</span>
                              <span>📍 {getLocationFullPath(eq.location_id)}</span>
                              {eq.manufacturer && <span>🏭 {eq.manufacturer}</span>}
                              {eq.model && <span>📋 {eq.model}</span>}
                              {eq.inventory_number && <span>📝 {eq.inventory_number}</span>}
                              {eq.serial_number && <span>🔢 {eq.serial_number}</span>}
                            </div>
                            {eq.responsible_employee_id && (
                              <div className="mt-2 text-xs text-gray-400">
                                👤 {employees.find(e => e.id === eq.responsible_employee_id)?.full_name || 'Неизвестно'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewingLocationEquipment(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
