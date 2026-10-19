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
  addStatus,
  deleteStatus,
  clearAllStatuses,
  isSystemStatus,
  getEquipmentCountByStatus,
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
import { useSettings } from './contexts/SettingsContext';

type ViewMode = 'equipment' | 'employees' | 'structure' | 'locations' | 'statuses' | 'categories' | 'logs' | 'settings';

function App() {
  const { settings, isLoaded } = useSettings();
  const [activeView, setActiveView] = useState<ViewMode>('structure');

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

  // Database is already initialized by SettingsProvider
  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded]);

  const loadEquipment = useCallback(() => {
    try {
      const cats = getCategories();
      setCategories(cats);
      const items = getAllEquipment(searchQuery || undefined, selectedCategory, selectedStatus, selectedLocation);
      setEquipment(items);
      const s = getStats();
      setStats(s);
    } catch (err) {
      console.error('Error loading equipment:', err);
    }
  }, [searchQuery, selectedCategory, selectedStatus, selectedLocation]);

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
    showToast('Сотрудник добавлен', 'success');
  };

  const handleEditEmployee = (data: any) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
      setEditingEmployee(null);
      loadEmployees();
      showToast('Сотрудник обновлён', 'success');
    }
  };

  const handleDeleteEmployee = (id: number) => {
    deleteEmployee(id);
    loadEmployees();
    showToast('Сотрудник удалён', 'success');
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

  const mainContent = (
    <>
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
            {getDepartmentTree().map(dept => {
              const isCollapsed = collapsedDepts.has(dept.id);
              const isSystem = isSystemDepartment(dept.id);
              const bgColor = isSystem ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100';
              
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
                        </div>
                      </div>
                    </div>
                    {!isSystem && (
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  {dept.children.length > 0 && !isCollapsed && (
                    <div className="p-2 space-y-1">
                      {dept.children.map((child: any) => (
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
        </>
      )}

      {/* Остальной контент будет добавлен ниже */}
      {activeView === 'settings' && (
        <Settings showToast={showToast} />
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
                  <button onClick={handleExport} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                    💾 Экспорт
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 mt-4 border-b border-gray-200 -mb-4 overflow-x-auto">
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
                <button
                  onClick={() => setActiveView('equipment')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeView === 'equipment' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🖥️ Оборудование <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{stats.total}</span>
                </button>
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
                <button
                  onClick={() => setActiveView('settings')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeView === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ⚙️ Настройки
                </button>
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
    </div>
  );
}

export default App;
