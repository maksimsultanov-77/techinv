import React, { useState, useEffect, useCallback } from 'react';
import {
  initDatabase,
  getCategories,
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  getStats,
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  getAllDepartments,
  addDepartment,
  deleteDepartment,
  getDepartmentTree,
  getAllLocations,
  addLocation,
  deleteLocation,
  getAllStatuses,
  addStatus,
  deleteStatus,
  getAllCategories,
  addCategory,
  deleteCategory,
  getCategoryTree,
  getEquipmentByEmployee,
  getEquipmentByDepartment,
  getEquipmentByStatus,
  getEquipmentByCategory,
  getEquipmentByLocation,
  getDepartmentName,
  getLocationFullPath,
  getCategoryFullPath,
  isSystemDepartment,
  isSystemLocation,
  isSystemStatus,
  isSystemCategory,
  authenticateUser,
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
import { useSettings } from './contexts/SettingsContext';

type ViewMode = 'equipment' | 'employees' | 'structure' | 'locations' | 'statuses' | 'categories' | 'logs' | 'settings';

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
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [empStats, setEmpStats] = useState<any>({ total: 0, byDepartment: [], byWorkMode: [], byGender: [], byType: [] });

  // Structure state
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptParent, setNewDeptParent] = useState<string>('');

  // Locations state
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocForm, setShowLocForm] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [newLocParent, setNewLocParent] = useState<string>('');

  // Statuses state
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#10b981');
  const [newStatusIcon, setNewStatusIcon] = useState('✓');
  const [newStatusDesc, setNewStatusDesc] = useState('');

  // Categories state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState<string>('');

  const [loading, setLoading] = useState(true);

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
    loadAllEmployees();
    showToast('Сотрудник добавлен', 'success');
  };

  const handleEditEmployee = (data: any) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
      setEditingEmployee(null);
      loadEmployees();
      loadAllEmployees();
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
    loadAllEmployees();
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
    loadAllEmployees();
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{settings.organizationName}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{currentUser.fullName}</span>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button onClick={() => setActiveView('structure')} className={`px-4 py-2 ${activeView === 'structure' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            Оргструктура
          </button>
          <button onClick={() => setActiveView('employees')} className={`px-4 py-2 ${activeView === 'employees' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            Сотрудники
          </button>
          <button onClick={() => setActiveView('equipment')} className={`px-4 py-2 ${activeView === 'equipment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            Оборудование
          </button>
          <button onClick={() => setActiveView('locations')} className={`px-4 py-2 ${activeView === 'locations' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            Местоположения
          </button>
          <button onClick={() => setActiveView('statuses')} className={`px-4 py-2 ${activeView === 'statuses' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            Статусы
          </button>
          <button onClick={() => setActiveView('categories')} className={`px-4 py-2 ${activeView === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            Категории
          </button>
          <button onClick={() => setActiveView('logs')} className={`px-4 py-2 ${activeView === 'logs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            Логи
          </button>
          <button onClick={() => setActiveView('settings')} className={`px-4 py-2 ${activeView === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            Настройки
          </button>
        </div>

        {activeView === 'structure' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Оргструктура</h2>
            <button onClick={() => setShowDeptForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">
              ➕ Добавить подразделение
            </button>
            <div className="space-y-3">
              {getDepartmentTree().map(dept => (
                <div key={dept.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{dept.name}</h3>
                    {!isSystemDepartment(dept.id) && (
                      <button onClick={() => handleDeleteDepartment(dept.id)} className="text-red-600 hover:text-red-800">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'employees' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Сотрудники</h2>
            <button onClick={() => setShowEmpForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">
              ➕ Добавить сотрудника
            </button>
            <EmployeeList
              employees={employees}
              departments={departments}
              onEdit={(emp) => { setEditingEmployee(emp); setShowEmpForm(false); }}
              onDelete={handleDeleteEmployee}
              onView={(emp) => setViewingEmployee(emp)}
            />
          </div>
        )}

        {activeView === 'equipment' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Оборудование</h2>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">
              ➕ Добавить оборудование
            </button>
            <EquipmentList
              equipment={equipment}
              statuses={statuses}
              employees={allEmployees}
              currentUserRole={currentUser.role}
              onEdit={(item) => { setEditingItem(item); setShowForm(false); }}
              onDelete={handleDelete}
              onView={(item) => setViewingItem(item)}
              onViewEmployee={(emp) => setViewingEmployee(emp)}
            />
          </div>
        )}

        {activeView === 'locations' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Местоположения</h2>
            <button onClick={() => setShowLocForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">
              ➕ Добавить местоположение
            </button>
            <div className="space-y-3">
              {locations.map(loc => (
                <div key={loc.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{loc.name}</h3>
                    {!isSystemLocation(loc.id) && (
                      <button onClick={() => handleDeleteLocation(loc.id)} className="text-red-600 hover:text-red-800">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'statuses' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Статусы</h2>
            <button onClick={() => setShowStatusForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">
              ➕ Добавить статус
            </button>
            <div className="space-y-3">
              {statuses.map(status => (
                <div key={status.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{status.icon} {status.name}</h3>
                    {!isSystemStatus(status.id) && (
                      <button onClick={() => handleDeleteStatus(status.id)} className="text-red-600 hover:text-red-800">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'categories' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Категории</h2>
            <button onClick={() => setShowCategoryForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">
              ➕ Добавить категорию
            </button>
            <div className="space-y-3">
              {getCategoryTree().map(cat => (
                <div key={cat.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{cat.icon} {cat.name}</h3>
                    {!isSystemCategory(cat.id) && (
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:text-red-800">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'logs' && (
          <LogViewer showToast={showToast} currentUser={currentUser} />
        )}

        {activeView === 'settings' && (
          <Settings showToast={showToast} />
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
  );
}

export default App;
