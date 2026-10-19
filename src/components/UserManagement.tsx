import { useState, useEffect } from 'react';
import { User, Employee, getAllUsers, addUser, updateUser, deleteUser, changePassword, getAllEmployees } from '../db/database';

interface UserManagementProps {
  currentUser: User;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function UserManagement({ currentUser, showToast }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'superadmin' | 'admin' | 'user' | 'observer'>('user');
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
    loadEmployees();
  }, []);

  const loadUsers = () => {
    setUsers(getAllUsers());
  };

  const loadEmployees = () => {
    setEmployees(getAllEmployees());
  };

  const handleAdd = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setFullName('');
    setRole('user');
    setEmployeeId(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword('');
    setFullName(user.fullName);
    setRole(user.role);
    setEmployeeId(user.employee_id || null);
    setShowForm(true);
  };

  const handleChangePassword = (userId: number) => {
    setPasswordUserId(userId);
    setPassword('');
    setShowPasswordForm(true);
  };

  const handleSave = () => {
    if (!username.trim() || !fullName.trim()) {
      showToast('Заполните все обязательные поля', 'error');
      return;
    }

    // Для роли "user" обязательно должен быть выбран сотрудник
    if (role === 'user' && !employeeId) {
      showToast('Для роли "Пользователь" необходимо выбрать сотрудника', 'error');
      return;
    }

    if (editingUser) {
      const updates: Partial<Omit<User, 'id' | 'createdAt'>> = {
        username: username.trim(),
        fullName: fullName.trim(),
        role,
        employee_id: employeeId,
      };
      
      if (password) {
        updates.password = password;
      }

      const result = updateUser(editingUser.id, updates);
      if (result.success) {
        showToast(result.message, 'success');
        setShowForm(false);
        loadUsers();
      } else {
        showToast(result.message, 'error');
      }
    } else {
      if (!password) {
        showToast('Пароль обязателен для нового пользователя', 'error');
        return;
      }

      const result = addUser(username.trim(), password, fullName.trim(), role, employeeId);
      if (result.success) {
        showToast(result.message, 'success');
        setShowForm(false);
        loadUsers();
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  const handleSavePassword = () => {
    if (!passwordUserId || !password) {
      showToast('Введите новый пароль', 'error');
      return;
    }

    const result = changePassword(passwordUserId, password);
    if (result.success) {
      showToast(result.message, 'success');
      setShowPasswordForm(false);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser.id) {
      showToast('Нельзя удалить текущего пользователя', 'error');
      return;
    }

    if (user.role === 'superadmin') {
      showToast('Нельзя удалить суперадминистратора', 'error');
      return;
    }

    if (!confirm(`Удалить пользователя "${user.fullName}"?`)) {
      return;
    }

    const result = deleteUser(user.id);
    if (result.success) {
      showToast(result.message, 'success');
      loadUsers();
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                👥 Управление пользователями
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Управление учётными записями системы
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              ➕ Добавить пользователя
            </button>
          </div>
        </div>

        <div className="p-6">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">👥</div>
              <p>Нет пользователей</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">
                        {user.role === 'superadmin' ? '👑' : user.role === 'admin' ? '🔑' : user.role === 'observer' ? '👁️' : '👤'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{user.fullName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'superadmin' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'observer'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'superadmin' ? 'Суперадмин' : user.role === 'admin' ? 'Администратор базы' : user.role === 'observer' ? 'Наблюдатель' : 'Пользователь'}
                          </span>
                          {user.id === currentUser.id && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Вы
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          <span>🔑 {user.username}</span>
                          <span className="mx-2">•</span>
                          <span>📅 {new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
                          {user.employee_id && (
                            <>
                              <span className="mx-2">•</span>
                              <span>👤 {employees.find(e => e.id === user.employee_id)?.full_name || 'Сотрудник не найден'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleChangePassword(user.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Изменить пароль"
                      >
                        🔑
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingUser ? '✏️ Редактирование пользователя' : '➕ Новый пользователь'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Иванов Иван Иванович"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Логин *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ivanov"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль {editingUser ? '(оставьте пустым, чтобы не менять)' : '*'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'superadmin' | 'admin' | 'user' | 'observer')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">👤 Пользователь</option>
                  <option value="observer">👁️ Наблюдатель</option>
                  <option value="admin">🔑 Администратор базы</option>
                  <option value="superadmin">👑 Суперадминистратор</option>
                </select>
              </div>
              {(role === 'user' || role === 'observer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Привязка к сотруднику {role === 'user' ? '*' : '(опционально)'}
                  </label>
                  <select
                    value={employeeId || ''}
                    onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">— Не привязан —</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </option>
                    ))}
                  </select>
                  {role === 'user' && !employeeId && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Для роли "Пользователь" необходимо выбрать сотрудника
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Форма изменения пароля */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">🔑 Изменение пароля</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSavePassword}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Изменить пароль
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
