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

export function isSystemStatus(id: number): boolean {
  return id <= 3;
}

export function getEquipmentByStatus(statusId: number): Equipment[] {
  return db.equipment.filter(eq => eq.status_id === statusId);
}

export function getEquipmentByCategory(catId: number): Equipment[] {
  return db.equipment.filter(eq => eq.category_id === catId);
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
