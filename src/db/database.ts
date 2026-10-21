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
  categories: [
    { id: 1, name: 'Компьютеры', icon: '💻', description: 'Компьютерная техника', parent_id: null },
    { id: 2, name: 'Периферия', icon: '🖨️', description: 'Периферийное оборудование', parent_id: null },
  ],
  equipment: [],
  employees: [],
  departments: [
    { id: 1, name: 'Руководство', parent_id: null, head_employee_id: null, created_at: new Date().toISOString() },
    { id: 2, name: 'Все сотрудники', parent_id: null, head_employee_id: null, created_at: new Date().toISOString() },
    { id: 3, name: 'Вне штата', parent_id: null, head_employee_id: null, created_at: new Date().toISOString() },
  ],
  locations: [
    { id: 1, name: 'Главный офис', description: 'Центральный офис компании', parent_id: null, created_at: new Date().toISOString() },
    { id: 2, name: 'Вне офиса', description: 'Оборудование вне офиса', parent_id: null, created_at: new Date().toISOString() },
  ],
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
  nextCategoryId: 3,
  nextEquipmentId: 1,
  nextEmployeeId: 1,
  nextDepartmentId: 4,
  nextLocationId: 3,
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
      
      // Миграция: добавляем системные категории если их нет
      if (!db.categories.find(c => c.id === 1)) {
        db.categories.unshift({
          id: 1,
          name: 'Компьютеры',
          icon: '💻',
          description: 'Компьютерная техника',
          parent_id: null,
        });
      }
      if (!db.categories.find(c => c.id === 2)) {
        const idx = db.categories.findIndex(c => c.id === 1);
        db.categories.splice(idx + 1, 0, {
          id: 2,
          name: 'Периферия',
          icon: '🖨️',
          description: 'Периферийное оборудование',
          parent_id: null,
        });
      }
      
      // Миграция: обновляем nextCategoryId если нужно
      if (db.nextCategoryId < 3) {
        db.nextCategoryId = 3;
      }
      
      // Миграция: добавляем системные подразделения если их нет
      if (!db.departments.find(d => d.id === 1)) {
        db.departments.unshift({
          id: 1,
          name: 'Руководство',
          parent_id: null,
          head_employee_id: null,
          created_at: new Date().toISOString(),
        });
      }
      if (!db.departments.find(d => d.id === 2)) {
        const idx = db.departments.findIndex(d => d.id === 1);
        db.departments.splice(idx + 1, 0, {
          id: 2,
          name: 'Все сотрудники',
          parent_id: null,
          head_employee_id: null,
          created_at: new Date().toISOString(),
        });
      }
      if (!db.departments.find(d => d.id === 3)) {
        const idx = db.departments.findIndex(d => d.id === 2);
        db.departments.splice(idx + 1, 0, {
          id: 3,
          name: 'Вне штата',
          parent_id: null,
          head_employee_id: null,
          created_at: new Date().toISOString(),
        });
      }
      
      // Миграция: обновляем nextDepartmentId если нужно
      if (db.nextDepartmentId < 4) {
        db.nextDepartmentId = 4;
      }
      
      // Миграция: добавляем системные местоположения если их нет
      if (!db.locations.find(l => l.id === 1)) {
        db.locations.unshift({
          id: 1,
          name: 'Главный офис',
          description: 'Центральный офис компании',
          parent_id: null,
          created_at: new Date().toISOString(),
        });
      }
      if (!db.locations.find(l => l.id === 2)) {
        const idx = db.locations.findIndex(l => l.id === 1);
        db.locations.splice(idx + 1, 0, {
          id: 2,
          name: 'Вне офиса',
          description: 'Оборудование вне офиса',
          parent_id: null,
          created_at: new Date().toISOString(),
        });
      }
      
      // Миграция: обновляем nextLocationId если нужно
      if (db.nextLocationId < 3) {
        db.nextLocationId = 3;
      }
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
  if (isSystemCategory(id)) {
    return { success: false, message: 'Нельзя удалить системную категорию' };
  }
  const equipment = db.equipment.filter(eq => eq.category_id === id);
  if (equipment.length > 0) {
    return { success: false, message: `Нельзя удалить: к категории привязано ${equipment.length} единиц оборудования` };
  }
  db.categories = db.categories.filter(c => c.id !== id);
  saveDatabase();
  return { success: true, message: 'Категория удалена' };
}

export function isSystemCategory(id: number): boolean {
  return id === 1 || id === 2;
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

export function generateTestData(): { success: boolean; message: string; count?: number } {
  // Проверка на наличие сотрудников
  if (db.employees.length === 0) {
    return { 
      success: false, 
      message: 'Невозможно создать тестовое оборудование: сначала добавьте сотрудников' 
    };
  }
  
  const count = Math.floor(Math.random() * 50) + 10;
  for (let i = 0; i < count; i++) {
    // Случайно привязываем к существующему сотруднику (70% шанс)
    let responsibleEmployeeId: number | null = null;
    let responsibleName = '';
    if (db.employees.length > 0 && Math.random() > 0.3) {
      const randomEmp = db.employees[Math.floor(Math.random() * db.employees.length)];
      responsibleEmployeeId = randomEmp.id;
      responsibleName = randomEmp.full_name;
    }
    
    addEquipment({
      name: `Тестовое оборудование ${i + 1}`,
      category_id: db.categories[0]?.id || 1,
      status_id: 1,
      location_id: db.locations[0]?.id || 1,
      responsible_employee_id: responsibleEmployeeId,
      responsible_person: responsibleName,
      serial_number: `SN${Date.now()}${i}`,
      inventory_number: `INV${Date.now()}${i}`,
      manufacturer: 'Test Manufacturer',
      model: 'Test Model',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: Math.floor(Math.random() * 100000) + 10000,
      notes: 'Тестовая запись',
    });
  }
  return { success: true, message: `Создано ${count} единиц тестового оборудования`, count };
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

export function bulkDeleteEmployee(ids: number[]): { success: boolean; message: string; deletedCount: number } {
  // Проверяем, есть ли оборудование, привязанное к удаляемым сотрудникам
  const linkedEquipment = db.equipment.filter(eq => 
    eq.responsible_employee_id && ids.includes(eq.responsible_employee_id)
  );
  
  if (linkedEquipment.length > 0) {
    return { 
      success: false, 
      message: `Нельзя удалить: за выбранными сотрудниками закреплено ${linkedEquipment.length} единиц оборудования`,
      deletedCount: 0
    };
  }
  
  const deletedCount = ids.length;
  db.employees = db.employees.filter(emp => !ids.includes(emp.id));
  saveDatabase();
  return { success: true, message: `Удалено ${deletedCount} сотрудников`, deletedCount };
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
  const buildTree = (parentId: number | null): any[] => {
    return db.departments
      .filter(d => d.parent_id === parentId)
      .map(dept => ({
        ...dept,
        children: buildTree(dept.id),
        employeeCount: db.employees.filter(emp => emp.department_id === dept.id).length,
      }));
  };
  
  return buildTree(null);
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
  if (isSystemDepartment(id)) {
    return { success: false, message: 'Нельзя удалить системное подразделение' };
  }
  db.departments = db.departments.filter(d => d.id !== id);
  saveDatabase();
  return { success: true, message: 'Подразделение удалено' };
}

export function clearAllDepartments(): { success: boolean; message: string } {
  const userDepartments = db.departments.filter(d => !isSystemDepartment(d.id));
  if (userDepartments.length === 0) {
    return { success: false, message: 'Нет пользовательских подразделений для очистки' };
  }
  
  db.departments = db.departments.filter(d => isSystemDepartment(d.id));
  saveDatabase();
  return { success: true, message: `Очищено ${userDepartments.length} подразделений (системные сохранены)` };
}

export function generateTestDepartments(): number {
  const deptNames = ['ИТ-отдел', 'Бухгалтерия', 'Отдел кадров', 'Отдел продаж', 'Маркетинг', 'Юридический отдел', 'Отдел логистики', 'Финансовый отдел'];
  let count = 0;
  deptNames.forEach(name => {
    // Проверяем, не существует ли уже такое подразделение
    if (!db.departments.find(d => d.name === name)) {
      addDepartment(name, null);
      count++;
    }
  });
  return count;
}

export function isSystemDepartment(id: number): boolean {
  return id === 1 || id === 2 || id === 3;
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
  if (isSystemLocation(id)) {
    return { success: false, message: 'Нельзя удалить системное местоположение' };
  }
  db.locations = db.locations.filter(l => l.id !== id);
  saveDatabase();
  return { success: true, message: 'Местоположение удалено' };
}

export function clearAllLocations(): { success: boolean; message: string } {
  const userLocations = db.locations.filter(l => !isSystemLocation(l.id));
  if (userLocations.length === 0) {
    return { success: false, message: 'Нет пользовательских местоположений для очистки' };
  }
  
  db.locations = db.locations.filter(l => isSystemLocation(l.id));
  saveDatabase();
  return { success: true, message: `Очищено ${userLocations.length} местоположений (системные сохранены)` };
}

export function generateTestLocations(): number {
  const locNames = ['Филиал Север', 'Филиал Юг', 'Склад №1', 'Склад №2'];
  let count = 0;
  locNames.forEach(name => {
    // Проверяем, не существует ли уже такое местоположение
    if (!db.locations.find(l => l.name === name)) {
      addLocation(name, '', null);
      count++;
    }
  });
  return count;
}

export function isSystemLocation(id: number): boolean {
  return id === 1 || id === 2;
}

export function getLocationFullPath(id: number): string {
  const loc = db.locations.find(l => l.id === id);
  if (!loc) return 'Не указано';
  
  if (loc.parent_id) {
    const parentPath = getLocationFullPath(loc.parent_id);
    return `${parentPath} - ${loc.name}`;
  }
  
  return loc.name;
}

export function getEquipmentByLocation(locId: number, includeChildren: boolean = true): Equipment[] {
  if (!includeChildren) {
    return db.equipment.filter(eq => eq.location_id === locId);
  }
  
  // Получаем все дочерние местоположения
  const getChildLocationIds = (parentId: number): number[] => {
    const children = db.locations.filter(l => l.parent_id === parentId);
    const childIds = children.map(l => l.id);
    const allChildIds = [...childIds];
    
    // Рекурсивно получаем всех потомков
    for (const childId of childIds) {
      allChildIds.push(...getChildLocationIds(childId));
    }
    
    return allChildIds;
  };
  
  const allLocationIds = [locId, ...getChildLocationIds(locId)];
  return db.equipment.filter(eq => allLocationIds.includes(eq.location_id));
}

export function getEquipmentCountByLocation(locId: number): number {
  return getEquipmentByLocation(locId, true).length;
}

export function getLocationTree(): any[] {
  return db.locations.filter(l => l.parent_id === null).map(loc => ({
    ...loc,
    children: db.locations.filter(l => l.parent_id === loc.id),
    equipmentCount: getEquipmentCountByLocation(loc.id),
  }));
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
  if (isSystemStatus(id)) {
    return { success: false, message: 'Нельзя удалить системный статус' };
  }
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

export function generateTestStatuses(): number {
  const testStatuses = [
    { name: 'Списано', color: '#6b7280', icon: '🗑️', description: 'Оборудование списано и выведено из эксплуатации' },
    { name: 'На складе', color: '#3b82f6', icon: '📦', description: 'Оборудование находится на складе' },
    { name: 'В пути', color: '#f59e0b', icon: '🚚', description: 'Оборудование в процессе доставки' },
    { name: 'Зарезервировано', color: '#8b5cf6', icon: '🔒', description: 'Оборудование зарезервировано для сотрудника' },
  ];
  
  let count = 0;
  testStatuses.forEach(status => {
    // Проверяем, не существует ли уже такой статус
    if (!db.statuses.find(s => s.name === status.name)) {
      addStatus(status.name, status.color, status.icon, status.description);
      count++;
    }
  });
  return count;
}

export function getEquipmentByCategory(catId: number): Equipment[] {
  return db.equipment.filter(eq => eq.category_id === catId);
}

export function getEquipmentCountByCategory(catId: number): number {
  return db.equipment.filter(eq => eq.category_id === catId).length;
}

export function clearAllCategories(): void {
  db.categories = db.categories.filter(c => isSystemCategory(c.id));
  saveDatabase();
}

export function getCategoryFullPath(id: number): string {
  const cat = db.categories.find(c => c.id === id);
  return cat?.name || 'Не указано';
}

export function generateTestCategories(): number {
  const testCategories = [
    { name: 'Ноутбуки', icon: '💻', description: 'Портативные компьютеры', parent_id: 1 },
    { name: 'Настольные ПК', icon: '🖥️', description: 'Стационарные компьютеры', parent_id: 1 },
    { name: 'Серверы', icon: '🖲️', description: 'Серверное оборудование', parent_id: 1 },
    { name: 'Принтеры', icon: '🖨️', description: 'Печатающие устройства', parent_id: 2 },
    { name: 'Сканеры', icon: '📠', description: 'Сканирующие устройства', parent_id: 2 },
    { name: 'Мониторы', icon: '🖵', description: 'Экраны и дисплеи', parent_id: 2 },
  ];
  
  let count = 0;
  testCategories.forEach(cat => {
    // Проверяем, не существует ли уже такая категория
    if (!db.categories.find(c => c.name === cat.name && c.parent_id === cat.parent_id)) {
      addCategory(cat.name, cat.icon, cat.description, cat.parent_id);
      count++;
    }
  });
  return count;
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
