// Database types
export interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
  parent_id: number | null;
}

export interface Equipment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  name: string;
  serial_number: string;
  inventory_number: string;
  manufacturer: string;
  model: string;
  location_id: number;
  responsible_person: string;
  responsible_employee_id: number | null;
  status_id: number;
  purchase_date: string;
  purchase_price: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  full_name: string;
  gender: 'male' | 'female';
  department_id: number | null;
  position: string;
  employee_type: 'staff' | 'external' | 'contractor';
  phone: string;
  email: string;
  work_mode: 'office' | 'remote' | 'hybrid';
  city: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  parent_id: number | null;
  head_employee_id: number | null;
  created_at: string;
}

export interface Location {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  created_at: string;
}

export interface Status {
  id: number;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  role: 'superadmin' | 'admin' | 'user' | 'observer';
  employee_id?: number | null;
  createdAt: string;
}

// Database instance
const DB_KEY = 'equipment_inventory_db';

interface DatabaseSchema {
  categories: Category[];
  equipment: Equipment[];
  employees: Employee[];
  departments: Department[];
  locations: Location[];
  statuses: Status[];
  users: User[];
  nextCategoryId: number;
  nextEquipmentId: number;
  nextEmployeeId: number;
  nextDepartmentId: number;
  nextLocationId: number;
  nextStatusId: number;
  nextUserId: number;
}

// Initialize database with default values
const defaultDb: DatabaseSchema = {
  categories: [],
  equipment: [],
  employees: [],
  departments: [],
  locations: [],
  statuses: [
    { id: 1, name: 'В работе', color: '#10b981', icon: '✓', description: 'Оборудование работает нормально' },
    { id: 2, name: 'Неисправно', color: '#ef4444', icon: '✗', description: 'Оборудование неисправно' },
    { id: 3, name: 'В ремонте', color: '#f59e0b', icon: '⚙', description: 'Оборудование находится в ремонте' },
  ],
  users: [
    {
      id: 1,
      username: 'admin',
      password: 'admin',
      fullName: 'Суперадминистратор',
      role: 'superadmin',
      createdAt: new Date().toISOString(),
    },
  ],
  nextCategoryId: 1,
  nextEquipmentId: 1,
  nextEmployeeId: 1,
  nextDepartmentId: 1,
  nextLocationId: 1,
  nextStatusId: 4,
  nextUserId: 2,
};

let db: DatabaseSchema = defaultDb;

// Initialize database
export function initDatabase(): void {
  const savedDb = localStorage.getItem(DB_KEY);
  if (savedDb) {
    try {
      db = JSON.parse(savedDb);
    } catch (e) {
      console.error('Error loading database:', e);
      db = defaultDb;
      saveDatabase();
    }
  } else {
    db = defaultDb;
    saveDatabase();
  }
}

function saveDatabase(): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Categories
export function getCategories(): Category[] {
  return db.categories;
}

export function getAllCategories(): Category[] {
  return db.categories;
}

export function getCategoryTree(): any[] {
  return db.categories.filter(c => c.parent_id === null).map(cat => ({
    ...cat,
    children: db.categories.filter(c => c.parent_id === cat.id),
  }));
}

export function addCategory(name: string, icon: string, description: string, parentId: number | null): number {
  const newCategory: Category = {
    id: db.nextCategoryId++,
    name,
    icon,
    description,
    parent_id: parentId,
  };
  db.categories.push(newCategory);
  saveDatabase();
  return newCategory.id;
}

export function deleteCategory(id: number): { success: boolean; message: string } {
  const equipment = db.equipment.filter(eq => eq.category_id === id);
  if (equipment.length > 0) {
    return { success: false, message: `Нельзя удалить: к категории привязано ${equipment.length} единиц оборудования` };
  }
  db.categories = db.categories.filter(c => c.id !== id);
  saveDatabase();
  return { success: true, message: 'Категория удалена' };
}

export function isSystemCategory(id: number): boolean {
  return false;
}

// Equipment
export function getAllEquipment(searchQuery?: string, categoryId?: number, statusId?: number, locationId?: number): Equipment[] {
  let result = [...db.equipment];
  if (categoryId) result = result.filter(eq => eq.category_id === categoryId);
  if (statusId) result = result.filter(eq => eq.status_id === statusId);
  if (locationId) result = result.filter(eq => eq.location_id === locationId);
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(eq => eq.name.toLowerCase().includes(query));
  }
  return result;
}

export function addEquipment(data: any): number {
  const newEquipment: Equipment = {
    id: db.nextEquipmentId++,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.equipment.push(newEquipment);
  saveDatabase();
  return newEquipment.id;
}

export function updateEquipment(id: number, data: any): void {
  const index = db.equipment.findIndex(eq => eq.id === id);
  if (index !== -1) {
    db.equipment[index] = { ...db.equipment[index], ...data, updated_at: new Date().toISOString() };
    saveDatabase();
  }
}

export function deleteEquipment(id: number): void {
  db.equipment = db.equipment.filter(eq => eq.id !== id);
  saveDatabase();
}

export function bulkUpdateEquipment(ids: number[], updates: Partial<Equipment>): void {
  ids.forEach(id => {
    const index = db.equipment.findIndex(eq => eq.id === id);
    if (index !== -1) {
      db.equipment[index] = { ...db.equipment[index], ...updates, updated_at: new Date().toISOString() };
    }
  });
  saveDatabase();
}

export function bulkDeleteEquipment(ids: number[]): void {
  db.equipment = db.equipment.filter(eq => !ids.includes(eq.id));
  saveDatabase();
}

export function clearAllEquipment(): void {
  db.equipment = [];
  saveDatabase();
}

export function generateTestData(): number {
  const count = Math.floor(Math.random() * 50) + 10;
  for (let i = 0; i < count; i++) {
    addEquipment({
      name: `Тестовое оборудование ${i + 1}`,
      category_id: db.categories[0]?.id || 1,
      status_id: 1,
      location_id: db.locations[0]?.id || 1,
      responsible_employee_id: db.employees[0]?.id || null,
      responsible_person: db.employees[0]?.full_name || '',
      serial_number: `SN${Date.now()}${i}`,
      inventory_number: `INV${Date.now()}${i}`,
      manufacturer: 'Test Manufacturer',
      model: 'Test Model',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: Math.floor(Math.random() * 100000) + 10000,
      notes: 'Тестовая запись',
    });
  }
  return count;
}

export function getStats(): any {
  return {
    total: db.equipment.length,
    byCategory: db.categories.map(cat => ({
      name: cat.name,
      icon: cat.icon,
      count: db.equipment.filter(eq => eq.category_id === cat.id).length,
    })),
  };
}

// Employees
export function getAllEmployees(searchQuery?: string, departmentId?: number, workMode?: string, employeeType?: string): Employee[] {
  let result = [...db.employees];
  if (departmentId) result = result.filter(emp => emp.department_id === departmentId);
  if (workMode) result = result.filter(emp => emp.work_mode === workMode);
  if (employeeType) result = result.filter(emp => emp.employee_type === employeeType);
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(emp => emp.full_name.toLowerCase().includes(query));
  }
  return result;
}

export function addEmployee(data: any): number {
  const newEmployee: Employee = {
    id: db.nextEmployeeId++,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.employees.push(newEmployee);
  saveDatabase();
  return newEmployee.id;
}

export function updateEmployee(id: number, data: any): void {
  const index = db.employees.findIndex(emp => emp.id === id);
  if (index !== -1) {
    db.employees[index] = { ...db.employees[index], ...data, updated_at: new Date().toISOString() };
    saveDatabase();
  }
}

export function deleteEmployee(id: number): { success: boolean; message: string } {
  const equipment = db.equipment.filter(eq => eq.responsible_employee_id === id);
  if (equipment.length > 0) {
    return { success: false, message: `Нельзя удалить: за сотрудником закреплено ${equipment.length} единиц оборудования` };
  }
  db.employees = db.employees.filter(emp => emp.id !== id);
  saveDatabase();
  return { success: true, message: 'Сотрудник удалён' };
}

export function bulkUpdateEmployee(ids: number[], updates: Partial<Employee>): void {
  ids.forEach(id => {
    const index = db.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      db.employees[index] = { ...db.employees[index], ...updates, updated_at: new Date().toISOString() };
    }
  });
  saveDatabase();
}

export function bulkDeleteEmployee(ids: number[]): void {
  db.employees = db.employees.filter(emp => !ids.includes(emp.id));
  saveDatabase();
}

export function clearAllEmployees(): void {
  db.employees = [];
  saveDatabase();
}

export function generateTestEmployees(): number {
  const count = Math.floor(Math.random() * 20) + 5;
  const firstNames = ['Иван', 'Пётр', 'Сергей', 'Анна', 'Мария', 'Елена'];
  const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Попов'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    addEmployee({
      full_name: `${lastName} ${firstName} ${firstName}ович`,
      gender: firstName === 'Анна' || firstName === 'Мария' || firstName === 'Елена' ? 'female' : 'male',
      department_id: db.departments[0]?.id || null,
      position: 'Специалист',
      employee_type: 'staff',
      phone: `+7 (9${Math.floor(Math.random() * 99)}) ${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 99)}`,
      email: `${lastName.toLowerCase()}.${firstName.toLowerCase()}@company.ru`,
      work_mode: 'office',
      city: 'Москва',
      timezone: 'Europe/Moscow',
    });
  }
  return count;
}

export function getEmployeeStats(): any {
  return {
    total: db.employees.length,
    byDepartment: [],
    byWorkMode: [],
    byGender: [],
    byType: [],
  };
}

export function getEquipmentByEmployee(employeeId: number): Equipment[] {
  return db.equipment.filter(eq => eq.responsible_employee_id === employeeId);
}

// Departments
export function getAllDepartments(): Department[] {
  return db.departments;
}

export function getDepartmentTree(): any[] {
  return db.departments.filter(d => d.parent_id === null).map(dept => ({
    ...dept,
    children: db.departments.filter(d => d.parent_id === dept.id),
    employeeCount: db.employees.filter(emp => emp.department_id === dept.id).length,
  }));
}

export function addDepartment(name: string, parentId: number | null): number {
  const newDept: Department = {
    id: db.nextDepartmentId++,
    name,
    parent_id: parentId,
    head_employee_id: null,
    created_at: new Date().toISOString(),
  };
  db.departments.push(newDept);
  saveDatabase();
  return newDept.id;
}

export function deleteDepartment(id: number): { success: boolean; message: string } {
  db.departments = db.departments.filter(d => d.id !== id);
  saveDatabase();
  return { success: true, message: 'Подразделение удалено' };
}

export function clearAllDepartments(): void {
  db.departments = [];
  saveDatabase();
}

export function generateTestDepartments(): number {
  const deptNames = ['ИТ-отдел', 'Бухгалтерия', 'Отдел кадров', 'Отдел продаж', 'Маркетинг'];
  deptNames.forEach(name => {
    addDepartment(name, null);
  });
  return deptNames.length;
}

export function isSystemDepartment(id: number): boolean {
  return false;
}

export function getDepartmentName(id: number | null): string {
  if (!id) return 'Не указано';
  const dept = db.departments.find(d => d.id === id);
  return dept?.name || 'Неизвестно';
}

export function getEquipmentByDepartment(deptId: number): Equipment[] {
  const employees = db.employees.filter(emp => emp.department_id === deptId);
  const empIds = employees.map(e => e.id);
  return db.equipment.filter(eq => eq.responsible_employee_id && empIds.includes(eq.responsible_employee_id));
}

// Locations
export function getAllLocations(): Location[] {
  return db.locations;
}

export function addLocation(name: string, description: string, parentId: number | null): number {
  const newLoc: Location = {
    id: db.nextLocationId++,
    name,
    description,
    parent_id: parentId,
    created_at: new Date().toISOString(),
  };
  db.locations.push(newLoc);
  saveDatabase();
  return newLoc.id;
}

export function deleteLocation(id: number): { success: boolean; message: string } {
  db.locations = db.locations.filter(l => l.id !== id);
  saveDatabase();
  return { success: true, message: 'Местоположение удалено' };
}

export function clearAllLocations(): void {
  db.locations = [];
  saveDatabase();
}

export function generateTestLocations(): number {
  const locNames = ['Главный офис', 'Филиал Север', 'Филиал Юг', 'Склад №1', 'Склад №2'];
  locNames.forEach(name => {
    addLocation(name, '', null);
  });
  return locNames.length;
}

export function isSystemLocation(id: number): boolean {
  return false;
}

export function getLocationFullPath(id: number): string {
  const loc = db.locations.find(l => l.id === id);
  return loc?.name || 'Не указано';
}

export function getEquipmentByLocation(locId: number): Equipment[] {
  return db.equipment.filter(eq => eq.location_id === locId);
}

// Statuses
export function getAllStatuses(): Status[] {
  return db.statuses;
}

export function getStatusById(id: number): Status | undefined {
  return db.statuses.find(s => s.id === id);
}

export function addStatus(name: string, color: string, icon: string, description: string): number {
  const newStatus: Status = {
    id: db.nextStatusId++,
    name,
    color,
    icon,
    description,
  };
  db.statuses.push(newStatus);
  saveDatabase();
  return newStatus.id;
}

export function deleteStatus(id: number): { success: boolean; message: string } {
  db.statuses = db.statuses.filter(s => s.id !== id);
  saveDatabase();
  return { success: true, message: 'Статус удалён' };
}

export function clearAllStatuses(): void {
  db.statuses = db.statuses.filter(s => s.id <= 3);
  saveDatabase();
}

export function isSystemStatus(id: number): boolean {
  return id <= 3;
}

export function getEquipmentByStatus(statusId: number): Equipment[] {
  return db.equipment.filter(eq => eq.status_id === statusId);
}

export function getEquipmentCountByStatus(statusId: number): number {
  return db.equipment.filter(eq => eq.status_id === statusId).length;
}

export function getEquipmentByCategory(catId: number): Equipment[] {
  return db.equipment.filter(eq => eq.category_id === catId);
}

export function getEquipmentCountByCategory(catId: number): number {
  return db.equipment.filter(eq => eq.category_id === catId).length;
}

export function clearAllCategories(): void {
  db.categories = [];
  saveDatabase();
}

export function getCategoryFullPath(id: number): string {
  const cat = db.categories.find(c => c.id === id);
  return cat?.name || 'Не указано';
}

// Users
export function authenticateUser(username: string, password: string): User | null {
  const user = db.users.find(u => u.username === username && u.password === password);
  return user || null;
}

export function getAllUsers(): User[] {
  return db.users;
}

export function addUser(username: string, password: string, fullName: string, role: 'superadmin' | 'admin' | 'user' | 'observer' = 'user', employee_id?: number | null): { success: boolean; message: string; userId?: number } {
  if (db.users.some(u => u.username === username)) {
    return { success: false, message: 'Пользователь с таким логином уже существует' };
  }
  
  if (employee_id && db.users.some(u => u.employee_id === employee_id)) {
    return { success: false, message: 'Этот сотрудник уже привязан к другому пользователю' };
  }
  
  const newUser: User = {
    id: db.nextUserId++,
    username,
    password,
    fullName,
    role,
    employee_id: employee_id || null,
    createdAt: new Date().toISOString(),
  };
  
  db.users.push(newUser);
  saveDatabase();
  
  return { success: true, message: 'Пользователь создан', userId: newUser.id };
}

export function updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): { success: boolean; message: string } {
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return { success: false, message: 'Пользователь не найден' };
  
  if (updates.username && updates.username !== db.users[index].username) {
    if (db.users.some(u => u.username === updates.username)) {
      return { success: false, message: 'Пользователь с таким логином уже существует' };
    }
  }
  
  if (updates.employee_id && updates.employee_id !== db.users[index].employee_id) {
    if (db.users.some(u => u.employee_id === updates.employee_id && u.id !== id)) {
      return { success: false, message: 'Этот сотрудник уже привязан к другому пользователю' };
    }
  }
  
  db.users[index] = { ...db.users[index], ...updates };
  saveDatabase();
  
  return { success: true, message: 'Пользователь обновлён' };
}

export function deleteUser(id: number): { success: boolean; message: string } {
  const user = db.users.find(u => u.id === id);
  if (!user) return { success: false, message: 'Пользователь не найден' };
  
  if (user.role === 'superadmin') {
    return { success: false, message: 'Нельзя удалить суперадминистратора' };
  }
  
  if (user.role === 'admin') {
    const adminCount = db.users.filter(u => u.role === 'admin').length;
    if (adminCount === 1) {
      return { success: false, message: 'Нельзя удалить последнего администратора базы' };
    }
  }
  
  db.users = db.users.filter(u => u.id !== id);
  saveDatabase();
  
  return { success: true, message: 'Пользователь удалён' };
}

export function changePassword(id: number, newPassword: string): { success: boolean; message: string } {
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return { success: false, message: 'Пользователь не найден' };
  
  db.users[index].password = newPassword;
  saveDatabase();
  
  return { success: true, message: 'Пароль изменён' };
}
