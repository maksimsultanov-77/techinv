import React, { useState, useEffect, useCallback } from 'react';
import {
  initDatabase,
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
  getLocationFullPath,
  isSystemLocation,
  getAllStatuses,
  addStatus,
  deleteStatus,
  clearAllStatuses,
  isSystemStatus,
  getEquipmentCountByStatus,
  getEquipmentByStatus,
  generateTestStatuses,
  getAllCategories,
  addCategory,
  deleteCategory,
  clearAllCategories,
  isSystemCategory,
  getEquipmentCountByCategory,
  generateTestCategories,
  getEquipmentByCategory,
  getCategoryTree,
  getCategoryFullPath,
  getEquipmentByEmployee,
  getEquipmentByDepartment,
  getEquipmentByLocation,
  authenticateUser,
  addLog,
  User,
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
import { EmployeeForm } from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';
import { LogViewer } from './components/LogViewer';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { Sidebar } from './components/Sidebar';
import { BulkEditEmployee } from './components/BulkEditEmployee';
import Dashboard from './components/Dashboard';
import { useSettings } from './contexts/SettingsContext';

type ViewMode = 'dashboard' | 'equipment' | 'employees' | 'structure' | 'locations' | 'statuses' | 'categories' | 'logs' | 'settings' | 'users';

function App() {
  const { settings, isLoaded } = useSettings();
  const [activeView, setActiveView] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('activeView');
    return (saved as ViewMode) || 'dashboard';
  });
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
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
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
  const [empStats, setEmpStats] = useState<any>({ total: 0, byDepartment: [], byWorkMode: [], byGender: [], byType: [] });

  // Structure state
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptParent, setNewDeptParent] = useState<string>('');
  const [showClearDeptConfirm, setShowClearDeptConfirm] = useState(false);
  const [collapsedDepts, setCollapsedDepts] = useState<Set<number>>(new Set());
  const [viewingDeptEquipment, setViewingDeptEquipment] = useState<number | null>(null);
  const [viewingDeptEmployees, setViewingDeptEmployees] = useState<number | null>(null);

  // Locations state
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocForm, setShowLocForm] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [newLocParent, setNewLocParent] = useState<string>('');
  const [showClearLocConfirm, setShowClearLocConfirm] = useState(false);
  const [collapsedLocations, setCollapsedLocations] = useState<Set<number>>(new Set());
  const [viewingLocationEquipment, setViewingLocationEquipment] = useState<number | null>(null);

  // Statuses state
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#10b981');
  const [newStatusIcon, setNewStatusIcon] = useState('✓');
  const [newStatusDesc, setNewStatusDesc] = useState('');
  const [showClearStatusConfirm, setShowClearStatusConfirm] = useState(false);
  const [viewingStatusEquipment, setViewingStatusEquipment] = useState<number | null>(null);

  // Categories state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState<string>('');
  const [showClearCategoryConfirm, setShowClearCategoryConfirm] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());
  const [viewingCategoryEquipment, setViewingCategoryEquipment] = useState<number | null>(null);

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
  const [showCatTestConfirm, setShowCatTestConfirm] = useState(false);
  const [showClearCatConfirm, setShowClearCatConfirm] = useState(false);
  const [showStatusTestConfirm, setShowStatusTestConfirm] = useState(false);

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

  // Сохранение activeView в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

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

  // Initialize database on app load
  useEffect(() => {
    initDatabase();
    if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    addLog('login', 'user', user.id, user.fullName, `Пользователь ${user.fullName} вошёл в систему`, user.id, user.fullName);
  };

  const handleLogout = () => {
    if (currentUser) {
      addLog('logout', 'user', currentUser.id, currentUser.fullName, `Пользователь ${currentUser.fullName} вышел из системы`, currentUser.id, currentUser.fullName);
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const loadEquipment = useCallback(() => {
    try {
      const cats = getCategories();
      setCategories(cats);
      let items = getAllEquipment(searchQuery || undefined, selectedCategory, selectedStatus, selectedLocation);
      
      if (currentUser?.role === 'user' && currentUser.employee_id) {
        items = items.filter(item => item.responsible_employee_id === currentUser.employee_id);
      } else if (currentUser?.role === 'user' && !currentUser.employee_id) {
        items = [];
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

  const loadAllEmployees = useCallback(() => {
    try {
      const items = getAllEmployees();
      setAllEmployees(items);
    } catch (err) {
      console.error('Error loading all employees:', err);
    }
  }, []);

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
      loadAllEmployees();
    }
  }, [isLoaded, loadDepartments, loadLocations, loadStatuses, loadCategories, loadAllEmployees]);

  useEffect(() => {
    if (isLoaded) {
      loadEquipment();
      loadAllEmployees();
    }
  }, [isLoaded, loadEquipment, loadAllEmployees]);

  useEffect(() => {
    if (isLoaded) {
      loadEmployees();
    }
  }, [isLoaded, loadEmployees]);

  // Equipment handlers
  const handleAdd = (data: any) => {
    const id = addEquipment(data);
    addLog('create', 'equipment', id, data.name, 'Оборудование добавлено', currentUser?.id, currentUser?.fullName);
    setShowForm(false);
    loadEquipment();
    showToast('Оборудование добавлено', 'success');
  };

  const handleEdit = (data: any) => {
    if (editingItem) {
      updateEquipment(editingItem.id, data);
      addLog('update', 'equipment', editingItem.id, data.name, 'Оборудование обновлено', currentUser?.id, currentUser?.fullName);
      setEditingItem(null);
      loadEquipment();
      showToast('Оборудование обновлено', 'success');
    }
  };

  const handleDelete = (id: number) => {
    if (currentUser?.role === 'user') {
      const item = equipment.find(eq => eq.id === id);
      if (!item || item.responsible_employee_id !== currentUser.employee_id) {
        showToast('Вы можете удалять только закреплённое за вами оборудование', 'error');
        return;
      }
    }
    const item = equipment.find(eq => eq.id === id);
    deleteEquipment(id);
    addLog('delete', 'equipment', id, item?.name, 'Оборудование удалено', currentUser?.id, currentUser?.fullName);
    loadEquipment();
    showToast('Оборудование удалено', 'success');
  };

  // Employee handlers
  const handleAddEmployee = (data: any) => {
    const id = addEmployee(data);
    addLog('create', 'employee', id, data.full_name, 'Сотрудник добавлен', currentUser?.id, currentUser?.fullName);
    setShowEmpForm(false);
    loadEmployees();
    loadAllEmployees();
    showToast('Сотрудник добавлен', 'success');
  };

  const handleEditEmployee = (data: any) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
      addLog('update', 'employee', editingEmployee.id, data.full_name, 'Сотрудник обновлён', currentUser?.id, currentUser?.fullName);
      setEditingEmployee(null);
      loadEmployees();
      loadAllEmployees();
      showToast('Сотрудник обновлён', 'success');
    }
  };

  const handleDeleteEmployee = (id: number) => {
    const employee = employees.find(emp => emp.id === id);
    const result = deleteEmployee(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    addLog('delete', 'employee', id, employee?.full_name, 'Сотрудник удалён', currentUser?.id, currentUser?.fullName);
    loadEmployees();
    loadAllEmployees();
    showToast(result.message, 'success');
  };

  // Department handlers
  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    const id = addDepartment(newDeptName.trim(), newDeptParent ? Number(newDeptParent) : null);
    addLog('create', 'department', id, newDeptName.trim(), 'Подразделение добавлено', currentUser?.id, currentUser?.fullName);
    setNewDeptName('');
    setNewDeptParent('');
    setShowDeptForm(false);
    loadDepartments();
    loadEmployees();
    loadAllEmployees();
    showToast('Подразделение добавлено', 'success');
  };

  const handleDeleteDepartment = (id: number) => {
    const dept = departments.find(d => d.id === id);
    const result = deleteDepartment(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    addLog('delete', 'department', id, dept?.name, 'Подразделение удалено', currentUser?.id, currentUser?.fullName);
    loadDepartments();
    showToast('Подразделение удалено', 'success');
  };

  const handleGenerateTestDepartments = () => {
    const count = generateTestDepartments();
    addLog('generate', 'department', undefined, undefined, `Создано ${count} тестовых подразделений`, currentUser?.id, currentUser?.fullName);
    setShowDeptTestConfirm(false);
    loadDepartments();
    loadEmployees();
    loadAllEmployees();
    showToast(`Создано ${count} подразделений`, 'success');
  };

  // Location handlers
  const handleAddLocation = () => {
    if (!newLocName.trim()) return;
    const id = addLocation(newLocName.trim(), newLocDesc.trim(), newLocParent ? Number(newLocParent) : null);
    addLog('create', 'location', id, newLocName.trim(), 'Местоположение добавлено', currentUser?.id, currentUser?.fullName);
    setNewLocName('');
    setNewLocDesc('');
    setNewLocParent('');
    setShowLocForm(false);
    loadLocations();
    showToast('Местоположение добавлено', 'success');
  };

  const handleDeleteLocation = (id: number) => {
    const loc = locations.find(l => l.id === id);
    const result = deleteLocation(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    addLog('delete', 'location', id, loc?.name, 'Местоположение удалено', currentUser?.id, currentUser?.fullName);
    loadLocations();
    showToast('Местоположение удалено', 'success');
  };

  const handleGenerateTestLocations = () => {
    const count = generateTestLocations();
    addLog('generate', 'location', undefined, undefined, `Создано ${count} тестовых местоположений`, currentUser?.id, currentUser?.fullName);
    setShowLocTestConfirm(false);
    loadLocations();
    showToast(`Создано ${count} местоположений`, 'success');
  };

  // Category handlers
  const handleGenerateTestCategories = () => {
    const count = generateTestCategories();
    addLog('generate', 'category', undefined, undefined, `Создано ${count} тестовых категорий`, currentUser?.id, currentUser?.fullName);
    setShowCatTestConfirm(false);
    loadCategories();
    showToast(`Создано ${count} категорий`, 'success');
  };

  // Status handlers
  const handleGenerateTestStatuses = () => {
    const count = generateTestStatuses();
    addLog('generate', 'status', undefined, undefined, `Создано ${count} тестовых статусов`, currentUser?.id, currentUser?.fullName);
    setShowStatusTestConfirm(false);
    loadStatuses();
    showToast(`Создано ${count} статусов`, 'success');
  };

  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    const id = addStatus(newStatusName.trim(), newStatusColor, newStatusIcon, newStatusDesc.trim());
    addLog('create', 'status', id, newStatusName.trim(), 'Статус добавлен', currentUser?.id, currentUser?.fullName);
    setNewStatusName('');
    setNewStatusColor('#10b981');
    setNewStatusIcon('✓');
    setNewStatusDesc('');
    setShowStatusForm(false);
    loadStatuses();
    showToast('Статус добавлен', 'success');
  };

  const handleDeleteStatus = (id: number) => {
    const status = statuses.find(s => s.id === id);
    const result = deleteStatus(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    addLog('delete', 'status', id, status?.name, 'Статус удалён', currentUser?.id, currentUser?.fullName);
    loadStatuses();
    showToast('Статус удалён', 'success');
  };

  // Category handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const id = addCategory(newCategoryName.trim(), newCategoryIcon, newCategoryDesc.trim(), newCategoryParent ? Number(newCategoryParent) : null);
    addLog('create', 'category', id, newCategoryName.trim(), 'Категория добавлена', currentUser?.id, currentUser?.fullName);
    setNewCategoryName('');
    setNewCategoryIcon('📦');
    setNewCategoryDesc('');
    setNewCategoryParent('');
    setShowCategoryForm(false);
    loadCategories();
    showToast('Категория добавлена', 'success');
  };

  const handleDeleteCategory = (id: number) => {
    const category = categories.find(c => c.id === id);
    const result = deleteCategory(id);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    addLog('delete', 'category', id, category?.name, 'Категория удалена', currentUser?.id, currentUser?.fullName);
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
    const result = generateTestData();
    setShowTestConfirm(false);
    if (result.success) {
      addLog('generate', 'equipment', undefined, undefined, result.message, currentUser?.id, currentUser?.fullName);
      loadEquipment();
      loadAllEmployees();
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleClearAll = () => {
    const count = equipment.length;
    clearAllEquipment();
    addLog('clear', 'equipment', undefined, undefined, `Очищено ${count} единиц оборудования`, currentUser?.id, currentUser?.fullName);
    setShowClearConfirm(false);
    loadEquipment();
    showToast('Оборудование очищено', 'success');
  };

  const handleGenerateTestEmployees = () => {
    try {
      const count = generateTestEmployees();
      addLog('generate', 'employee', undefined, undefined, `Создано ${count} тестовых сотрудников`, currentUser?.id, currentUser?.fullName);
      setShowEmpTestConfirm(false);
      loadEmployees();
      loadAllEmployees();
      showToast(`Создано ${count} сотрудников`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка', 'error');
    }
  };

  const handleClearAllEmployees = () => {
    const count = employees.length;
    clearAllEmployees();
    addLog('clear', 'employee', undefined, undefined, `Очищено ${count} сотрудников`, currentUser?.id, currentUser?.fullName);
    setShowEmpClearConfirm(false);
    loadEmployees();
    loadAllEmployees();
    showToast('Сотрудники очищены', 'success');
  };

  // Apply theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Apply document title
  useEffect(() => {
    document.title = `${settings.organizationName} - Учет техники`;
  }, [settings.organizationName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⚙️</div>
          <p className="text-gray-600 text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {settings.menuPosition === 'left' && (
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
      )}
      
      <div className={settings.menuPosition === 'left' ? 'sidebar-content' : ''}>
        {settings.menuPosition === 'top' && (
          <header className={`${settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🖥️</span>
                  <div>
                    <h1 className={`text-2xl font-bold ${settings.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{settings.organizationName}</h1>
                    <p className={`text-sm ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Система управления оборудованием, сотрудниками и оргструктурой</p>
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
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeView === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏠 Главное
            </button>
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
              🖥️ Оборудование <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{currentUser.role === 'user' ? (currentUser.employee_id ? getEquipmentByEmployee(currentUser.employee_id).length : 0) : stats.total}</span>
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
              </>
            )}
            {(currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'observer') && (
              <button
                onClick={() => setActiveView('logs')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeView === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📋 Логи
              </button>
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
        )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <Dashboard currentUser={currentUser} />
        )}

        {/* Structure View */}
        {activeView === 'structure' && currentUser.role !== 'user' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Оргструктура</h2>
            {currentUser.role !== 'observer' && (
              <div className="flex justify-end gap-2 mb-4">
                {currentUser.role === 'superadmin' && (
                  <>
                    <button onClick={() => setShowDeptTestConfirm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      🎲 Тестовая структура
                    </button>
                    {departments.some(d => !isSystemDepartment(d.id)) && (
                      <button onClick={() => setShowClearDeptConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        🗑️ Очистить
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setShowDeptForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ➕ Добавить подразделение
                </button>
              </div>
            )}
            <div className="space-y-3">
              {getDepartmentTree().map((dept: any) => {
                const DepartmentItem = ({ department, level = 0 }: { department: any; level?: number }) => {
                  const [isExpanded, setIsExpanded] = useState(true);
                  const hasChildren = department.children && department.children.length > 0;
                  
                  return (
                    <div>
                      <div 
                        key={department.id} 
                        className="bg-white rounded-lg p-4 border border-gray-200"
                        style={{ marginLeft: `${level * 20}px` }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {hasChildren && (
                              <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            )}
                            {!hasChildren && <div className="w-4" />}
                            <h3 className="font-semibold">{department.name}</h3>
                          </div>
                          <div className="flex gap-2">
                            {department.employeeCount > 0 && (
                              <button onClick={() => setViewingDeptEmployees(department.id)} className="text-green-600 hover:text-green-800">
                                👥 {department.employeeCount}
                              </button>
                            )}
                            {getEquipmentByDepartment(department.id).length > 0 && (
                              <button onClick={() => setViewingDeptEquipment(department.id)} className="text-blue-600 hover:text-blue-800">
                                🖥️ {getEquipmentByDepartment(department.id).length}
                              </button>
                            )}
                            {!isSystemDepartment(department.id) && currentUser.role !== 'observer' && (
                              <button onClick={() => handleDeleteDepartment(department.id)} className="text-red-600 hover:text-red-800">
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {hasChildren && isExpanded && (
                        <div className="mt-2 space-y-2">
                          {department.children.map((child: any) => (
                            <DepartmentItem key={child.id} department={child} level={level + 1} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                };
                
                return <DepartmentItem key={dept.id} department={dept} />;
              })}
            </div>
          </div>
        )}

        {/* Employees View */}
        {activeView === 'employees' && currentUser.role !== 'user' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Сотрудники</h2>
            {currentUser.role !== 'observer' && (
              <div className="flex justify-end gap-2 mb-4">
                {currentUser.role === 'superadmin' && (
                  <>
                    <button onClick={() => setShowEmpTestConfirm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      🎲 Тестовые данные
                    </button>
                    {employees.length > 0 && (
                      <button onClick={() => setShowEmpClearConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        🗑️ Очистить
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setShowEmpForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ➕ Добавить сотрудника
                </button>
              </div>
            )}
            {/* Фильтры */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🔍 Поиск</label>
                  <input
                    type="text"
                    value={empSearchQuery}
                    onChange={(e) => setEmpSearchQuery(e.target.value)}
                    placeholder="ФИО, должность, email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🏢 Подразделение</label>
                  <select
                    value={empDepartment || ''}
                    onChange={(e) => setEmpDepartment(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Все подразделения</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">👤 Тип сотрудника</label>
                  <select
                    value={empType || ''}
                    onChange={(e) => setEmpType(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Все типы</option>
                    <option value="staff">Штатный</option>
                    <option value="external">Внешний</option>
                    <option value="contractor">Подрядчик</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🏠 Режим работы</label>
                  <select
                    value={empWorkMode || ''}
                    onChange={(e) => setEmpWorkMode(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Все режимы</option>
                    <option value="office">В офисе</option>
                    <option value="remote">Удалённо</option>
                    <option value="hybrid">Гибрид</option>
                  </select>
                </div>
              </div>
              {(empSearchQuery || empDepartment || empType || empWorkMode) && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Найдено: <strong>{employees.length}</strong> сотрудников
                  </span>
                  <button
                    onClick={() => {
                      setEmpSearchQuery('');
                      setEmpDepartment(undefined);
                      setEmpType(undefined);
                      setEmpWorkMode(undefined);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ✕ Сбросить фильтры
                  </button>
                </div>
              )}
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
              currentUserRole={currentUser.role}
              selectedIds={selectedEmployeeIds}
              onSelectionChange={currentUser.role !== 'observer' ? setSelectedEmployeeIds : undefined}
              onEdit={(emp) => { setEditingEmployee(emp); setShowEmpForm(false); }}
              onDelete={handleDeleteEmployee}
              onView={(emp) => setViewingEmployee(emp)}
            />
          </div>
        )}

        {/* Equipment View */}
        {activeView === 'equipment' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Оборудование</h2>
            {currentUser.role !== 'user' && currentUser.role !== 'observer' && (
              <div className="flex justify-end gap-2 mb-4">
                {currentUser.role === 'superadmin' && (
                  <>
                    {employees.length > 0 ? (
                      <button onClick={() => setShowTestConfirm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        🎲 Тестовые данные
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                        ⚠️ Сначала добавьте сотрудников
                      </div>
                    )}
                    {equipment.length > 0 && (
                      <button onClick={() => setShowClearConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        🗑️ Очистить
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ➕ Добавить
                </button>
              </div>
            )}
            
            {/* Фильтры оборудования */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🔍 Поиск</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Название, серийный номер..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📁 Категория</label>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Все категории</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🏷️ Статус</label>
                  <select
                    value={selectedStatus || ''}
                    onChange={(e) => setSelectedStatus(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Все статусы</option>
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📍 Местоположение</label>
                  <select
                    value={selectedLocation || ''}
                    onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Все местоположения</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(searchQuery || selectedCategory || selectedStatus || selectedLocation) && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Найдено: <strong>{equipment.length}</strong> единиц оборудования
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(undefined);
                      setSelectedStatus(undefined);
                      setSelectedLocation(undefined);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ✕ Сбросить фильтры
                  </button>
                </div>
              )}
            </div>

            <EquipmentList
              equipment={equipment}
              statuses={statuses}
              employees={allEmployees}
              currentUserRole={currentUser.role}
              selectedIds={selectedEquipmentIds}
              onSelectionChange={currentUser.role !== 'user' && currentUser.role !== 'observer' ? setSelectedEquipmentIds : undefined}
              onEdit={(item) => { setEditingItem(item); setShowForm(false); }}
              onDelete={handleDelete}
              onView={(item) => setViewingItem(item)}
              onViewEmployee={(emp) => setViewingEmployee(emp)}
            />
          </div>
        )}

        {/* Locations View */}
        {activeView === 'locations' && currentUser.role !== 'user' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Местоположения</h2>
            {currentUser.role !== 'observer' && (
              <div className="flex justify-end gap-2 mb-4">
                {currentUser.role === 'superadmin' && (
                  <>
                    <button onClick={() => setShowLocTestConfirm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      🎲 Тестовые данные
                    </button>
                    {locations.some(l => !isSystemLocation(l.id)) && (
                      <button onClick={() => setShowClearLocConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        🗑️ Очистить
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setShowLocForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ➕ Добавить местоположение
                </button>
              </div>
            )}
            <div className="space-y-3">
              {locations.filter(loc => loc.parent_id === null).map(loc => {
                const LocationItem = ({ location, level = 0 }: { location: any; level?: number }) => {
                  const [isExpanded, setIsExpanded] = useState(true);
                  const children = locations.filter(l => l.parent_id === location.id);
                  const hasChildren = children.length > 0;
                  
                  return (
                    <div>
                      <div 
                        key={location.id} 
                        className="bg-white rounded-lg p-4 border border-gray-200"
                        style={{ marginLeft: `${level * 20}px` }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {hasChildren && (
                              <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            )}
                            {!hasChildren && <div className="w-4" />}
                            <h3 className="font-semibold">{location.name}</h3>
                          </div>
                          <div className="flex gap-2">
                            {getEquipmentByLocation(location.id, false).length > 0 && (
                              <button onClick={() => setViewingLocationEquipment(location.id)} className="text-blue-600 hover:text-blue-800">
                                🖥️ {getEquipmentByLocation(location.id, false).length}
                              </button>
                            )}
                            {!isSystemLocation(location.id) && currentUser.role !== 'observer' && (
                              <button onClick={() => handleDeleteLocation(location.id)} className="text-red-600 hover:text-red-800">
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {hasChildren && isExpanded && (
                        <div className="mt-2 space-y-2">
                          {children.map((child: any) => (
                            <LocationItem key={child.id} location={child} level={level + 1} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                };
                
                return <LocationItem key={loc.id} location={loc} />;
              })}
            </div>
          </div>
        )}

        {/* Statuses View */}
        {activeView === 'statuses' && currentUser.role !== 'user' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Статусы</h2>
            {currentUser.role !== 'observer' && (
              <div className="flex justify-end gap-2 mb-4">
                {currentUser.role === 'superadmin' && (
                  <>
                    <button onClick={() => setShowStatusTestConfirm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      🎲 Тестовые данные
                    </button>
                    {statuses.some(s => !isSystemStatus(s.id)) && (
                      <button onClick={() => setShowClearStatusConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        🗑️ Очистить
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setShowStatusForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ➕ Добавить статус
                </button>
              </div>
            )}
            <div className="space-y-3">
              {statuses.map(status => (
                <div key={status.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{status.icon} {status.name}</h3>
                    <div className="flex gap-2">
                      {getEquipmentCountByStatus(status.id) > 0 && (
                        <button onClick={() => setViewingStatusEquipment(status.id)} className="text-blue-600 hover:text-blue-800">
                          🖥️ {getEquipmentCountByStatus(status.id)}
                        </button>
                      )}
                      {!isSystemStatus(status.id) && currentUser.role !== 'observer' && (
                        <button onClick={() => handleDeleteStatus(status.id)} className="text-red-600 hover:text-red-800">
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories View */}
        {activeView === 'categories' && currentUser.role !== 'user' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Категории</h2>
            {currentUser.role !== 'observer' && (
              <div className="flex justify-end gap-2 mb-4">
                {currentUser.role === 'superadmin' && (
                  <>
                    <button onClick={() => setShowCatTestConfirm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      🎲 Тестовые данные
                    </button>
                    {categories.some(c => !isSystemCategory(c.id)) && (
                      <button onClick={() => setShowClearCatConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        🗑️ Очистить
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setShowCategoryForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ➕ Добавить категорию
                </button>
              </div>
            )}
            <div className="space-y-3">
              {getCategoryTree().map((cat: any) => {
                const CategoryItem = ({ category, level = 0 }: { category: any; level?: number }) => {
                  const [isExpanded, setIsExpanded] = useState(true);
                  const hasChildren = category.children && category.children.length > 0;
                  
                  return (
                    <div>
                      <div 
                        key={category.id} 
                        className="bg-white rounded-lg p-4 border border-gray-200"
                        style={{ marginLeft: `${level * 20}px` }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {hasChildren && (
                              <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            )}
                            {!hasChildren && <div className="w-4" />}
                            <h3 className="font-semibold">{category.icon} {category.name}</h3>
                          </div>
                          <div className="flex gap-2">
                            {getEquipmentByCategory(category.id).length > 0 && (
                              <button onClick={() => setViewingCategoryEquipment(category.id)} className="text-blue-600 hover:text-blue-800">
                                🖥️ {getEquipmentByCategory(category.id).length}
                              </button>
                            )}
                            {!isSystemCategory(category.id) && currentUser.role !== 'observer' && (
                              <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 hover:text-red-800">
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {hasChildren && isExpanded && (
                        <div className="mt-2 space-y-2">
                          {category.children.map((child: any) => (
                            <CategoryItem key={child.id} category={child} level={level + 1} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                };
                
                return <CategoryItem key={cat.id} category={cat} />;
              })}
            </div>
          </div>
        )}

        {/* Logs View */}
        {activeView === 'logs' && (currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'observer') && (
          <LogViewer showToast={showToast} currentUser={currentUser} />
        )}

        {/* Settings View */}
        {activeView === 'settings' && currentUser.role !== 'user' && (
          <Settings showToast={showToast} />
        )}

        {/* Users View */}
        {activeView === 'users' && (currentUser.role === 'superadmin' || currentUser.role === 'admin') && (
          <UserManagement currentUser={currentUser} showToast={showToast} />
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <EquipmentForm
          categories={categories}
          employees={allEmployees}
          locations={locations}
          statuses={statuses}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}
      {editingItem && (
        <EquipmentForm
          categories={categories}
          employees={allEmployees}
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
          employees={allEmployees}
          statuses={statuses}
          currentUserRole={currentUser.role}
          onClose={() => setViewingItem(null)}
          onEdit={() => { setEditingItem(viewingItem); setViewingItem(null); }}
          onViewEmployee={(emp) => {
            setViewingItem(null);
            setViewingEmployee(emp);
          }}
        />
      )}
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
          currentUserRole={currentUser.role}
          onClose={() => setViewingEmployee(null)}
          onEdit={() => { setEditingEmployee(viewingEmployee); setViewingEmployee(null); }}
        />
      )}

      {/* Test Data Confirmation Modals */}
      {showLocTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Создать тестовые местоположения?</h3>
            <p className="text-gray-600 mb-6">Будут созданы тестовые местоположения: Филиал Север, Филиал Юг, Склад №1, Склад №2</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowLocTestConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleGenerateTestLocations} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearLocConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Очистить местоположения?</h3>
            <p className="text-gray-600 mb-6">Все пользовательские местоположения будут удалены. Системные местоположения (Главный офис, Вне офиса) будут сохранены.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClearLocConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button
                onClick={() => {
                  const count = locations.filter(l => !isSystemLocation(l.id)).length;
                  const result = clearAllLocations();
                  if (!result.success) {
                    showToast(result.message, 'error');
                  } else {
                    addLog('clear', 'location', undefined, undefined, `Очищено ${count} местоположений`, currentUser?.id, currentUser?.fullName);
                    loadLocations();
                    loadEquipment();
                    showToast(result.message, 'success');
                  }
                  setShowClearLocConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {showLocForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Добавить местоположение</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название местоположения"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={newLocDesc}
                  onChange={(e) => setNewLocDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите описание (необязательно)"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Родительское местоположение</label>
                <select
                  value={newLocParent}
                  onChange={(e) => setNewLocParent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Нет (корневое местоположение)</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowLocForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleAddLocation} disabled={!newLocName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showCatTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Создать тестовые категории?</h3>
            <p className="text-gray-600 mb-6">Будут созданы тестовые категории: Ноутбуки, Настольные ПК, Серверы, Принтеры, Сканеры, Мониторы</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCatTestConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleGenerateTestCategories} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Добавить категорию</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название категории"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="📦"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Родительская категория</label>
                  <select
                    value={newCategoryParent}
                    onChange={(e) => setNewCategoryParent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Нет (корневая категория)</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите описание (необязательно)"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCategoryForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearCatConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Очистить категории?</h3>
            <p className="text-gray-600 mb-6">Все пользовательские категории будут удалены. Системные категории (Компьютеры, Периферия) будут сохранены.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClearCatConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button
                onClick={() => {
                  const count = categories.filter(c => !isSystemCategory(c.id)).length;
                  const result = clearAllCategories();
                  if (!result.success) {
                    showToast(result.message, 'error');
                  } else {
                    addLog('clear', 'category', undefined, undefined, `Очищено ${count} категорий`, currentUser?.id, currentUser?.fullName);
                    loadCategories();
                    loadEquipment();
                    showToast(result.message, 'success');
                  }
                  setShowClearCatConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmpTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Создать тестовых сотрудников?</h3>
            <p className="text-gray-600 mb-6">Будут созданы тестовые сотрудники (от 5 до 25 человек) со случайными данными</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowEmpTestConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleGenerateTestEmployees} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmpClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Удалить всех сотрудников?</h3>
            <p className="text-gray-600 mb-6">Будут удалены все сотрудники. Это действие нельзя отменить.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowEmpClearConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleClearAllEmployees} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Удалить всех
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Создать тестовое оборудование?</h3>
            <p className="text-gray-600 mb-6">Будет создано от 10 до 60 единиц тестового оборудования со случайными данными.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowTestConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleGenerateTest} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Удалить всё оборудование?</h3>
            <p className="text-gray-600 mb-6">Будет удалено всё оборудование. Это действие нельзя отменить.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleClearAll} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Удалить всё
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeptForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Добавить подразделение</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название подразделения"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Родительское подразделение</label>
                <select
                  value={newDeptParent}
                  onChange={(e) => setNewDeptParent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Нет (корневое подразделение)</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeptForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleAddDepartment} disabled={!newDeptName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeptForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Добавить подразделение</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название подразделения"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Родительское подразделение</label>
                <select
                  value={newDeptParent}
                  onChange={(e) => setNewDeptParent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Нет (корневое подразделение)</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeptForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleAddDepartment} disabled={!newDeptName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeptForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Добавить подразделение</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название подразделения"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Родительское подразделение</label>
                <select
                  value={newDeptParent}
                  onChange={(e) => setNewDeptParent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Нет (корневое подразделение)</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeptForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleAddDepartment} disabled={!newDeptName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeptForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Добавить подразделение</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название подразделения"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Родительское подразделение</label>
                <select
                  value={newDeptParent}
                  onChange={(e) => setNewDeptParent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Нет (корневое подразделение)</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeptForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleAddDepartment} disabled={!newDeptName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeptTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Создать тестовую структуру?</h3>
            <p className="text-gray-600 mb-6">Будут созданы тестовые подразделения: ИТ-отдел, Бухгалтерия, Отдел кадров, Отдел продаж, Маркетинг</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeptTestConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleGenerateTestDepartments} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearDeptConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Очистить оргструктуру?</h3>
            <p className="text-gray-600 mb-6">Все пользовательские подразделения будут удалены. Системные подразделения (Руководство, Все сотрудники, Вне штата) будут сохранены.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClearDeptConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button
                onClick={() => {
                  const result = clearAllDepartments();
                  if (!result.success) {
                    showToast(result.message, 'error');
                  } else {
                    addLog('clear', 'department', undefined, undefined, result.message, currentUser?.id, currentUser?.fullName);
                    loadDepartments();
                    loadEmployees();
                    loadAllEmployees();
                    showToast(result.message, 'success');
                  }
                  setShowClearDeptConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteEmployeeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Удалить выбранных сотрудников?</h3>
            <p className="text-gray-600 mb-6">Будут удалены {selectedEmployeeIds.length} сотрудников. Это действие нельзя отменить.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowBulkDeleteEmployeeConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button
                onClick={() => {
                  const result = bulkDeleteEmployee(selectedEmployeeIds);
                  if (!result.success) {
                    showToast(result.message, 'error');
                  } else {
                    setSelectedEmployeeIds([]);
                    setShowBulkDeleteEmployeeConfirm(false);
                    loadEmployees();
                    loadAllEmployees();
                    showToast(result.message, 'success');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkEditEmployee && (
        <BulkEditEmployee
          selectedIds={selectedEmployeeIds}
          departments={departments}
          onSave={() => {
            setShowBulkEditEmployee(false);
            setSelectedEmployeeIds([]);
            loadEmployees();
            loadAllEmployees();
            showToast('Сотрудники обновлены', 'success');
          }}
          onCancel={() => setShowBulkEditEmployee(false)}
        />
      )}

      {showStatusTestConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Создать тестовые статусы?</h3>
            <p className="text-gray-600 mb-6">Будут созданы тестовые статусы: Списано, На складе, В пути, Зарезервировано</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowStatusTestConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleGenerateTestStatuses} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearStatusConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Очистить статусы?</h3>
            <p className="text-gray-600 mb-6">Все пользовательские статусы будут удалены. Системные статусы (В работе, Неисправно, В ремонте) будут сохранены.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClearStatusConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button
                onClick={() => {
                  const count = statuses.filter(s => !isSystemStatus(s.id)).length;
                  const result = clearAllStatuses();
                  if (!result.success) {
                    showToast(result.message, 'error');
                  } else {
                    addLog('clear', 'status', undefined, undefined, `Очищено ${count} статусов`, currentUser?.id, currentUser?.fullName);
                    loadStatuses();
                    loadEquipment();
                    showToast(result.message, 'success');
                  }
                  setShowClearStatusConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Добавить статус</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название статуса"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите описание (необязательно)"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowStatusForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleAddStatus} disabled={!newStatusName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg text-white ${
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
      </div>
    </div>
  );
}

export default App;
