// Простая база данных на основе localStorage
// Имитирует SQL-подобный интерфейс для работы с данными

const DB_KEY = 'equipment_inventory_db';

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
  location: string;
  responsible_person: string;
  responsible_employee_id: number | null;
  status: string;
  purchase_date: string;
  purchase_price: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
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

export const TIMEZONES = [
  { value: 'Europe/Kaliningrad', label: 'Калининград (UTC+2)' },
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Europe/Samara', label: 'Самара (UTC+4)' },
  { value: 'Asia/Yekaterinburg', label: 'Екатеринбург (UTC+5)' },
  { value: 'Asia/Omsk', label: 'Омск (UTC+6)' },
  { value: 'Asia/Krasnoyarsk', label: 'Красноярск (UTC+7)' },
  { value: 'Asia/Irkutsk', label: 'Иркутск (UTC+8)' },
  { value: 'Asia/Yakutsk', label: 'Якутск (UTC+9)' },
  { value: 'Asia/Vladivostok', label: 'Владивосток (UTC+10)' },
  { value: 'Asia/Magadan', label: 'Магадан (UTC+11)' },
  { value: 'Asia/Kamchatka', label: 'Камчатка (UTC+12)' },
  { value: 'Europe/Kiev', label: 'Киев (UTC+2)' },
  { value: 'Europe/Minsk', label: 'Минск (UTC+3)' },
  { value: 'Asia/Almaty', label: 'Алматы (UTC+6)' },
  { value: 'Asia/Tashkent', label: 'Ташкент (UTC+5)' },
  { value: 'Asia/Baku', label: 'Баку (UTC+4)' },
  { value: 'Asia/Dubai', label: 'Дубай (UTC+4)' },
  { value: 'Europe/Berlin', label: 'Берлин (UTC+1)' },
  { value: 'Europe/Warsaw', label: 'Варшава (UTC+1)' },
  { value: 'America/New_York', label: 'Нью-Йорк (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Лос-Анджелес (UTC-8)' },
];

interface DatabaseSchema {
  categories: Category[];
  equipment: Equipment[];
  employees: Employee[];
  departments: Department[];
  nextCategoryId: number;
  nextEquipmentId: number;
  nextEmployeeId: number;
  nextDepartmentId: number;
}

export const EMPLOYEE_TYPES = [
  { value: 'staff', label: 'Штатный сотрудник', icon: '👤' },
  { value: 'external', label: 'Внешний сотрудник', icon: '🌐' },
  { value: 'contractor', label: 'Подрядчик', icon: '📝' },
];

let db: DatabaseSchema;

const defaultCategories: Category[] = [
  { id: 1, name: 'ПК', icon: '🖥️', description: 'Настольные компьютеры' },
  { id: 2, name: 'Моноблоки', icon: '🖥️', description: 'Компьютеры моноблок' },
  { id: 3, name: 'Ноутбуки', icon: '💻', description: 'Ноутбуки' },
  { id: 4, name: 'Планшеты', icon: '📱', description: 'Планшетные компьютеры' },
  { id: 5, name: 'Телефоны', icon: '📞', description: 'Мобильные телефоны и смартфоны' },
  { id: 6, name: 'Камеры', icon: '📷', description: 'Веб-камеры и камеры видеонаблюдения' },
  { id: 7, name: 'МФУ/Принтеры', icon: '🖨️', description: 'Многофункциональные устройства и принтеры' },
  { id: 8, name: 'Сетевое оборудование', icon: '🌐', description: 'Роутеры, коммутаторы, точки доступа' },
  { id: 9, name: 'Мониторы', icon: '🖥️', description: 'Мониторы и дисплеи' },
  { id: 10, name: 'Серверы', icon: '🗄️', description: 'Серверное оборудование' },
  { id: 11, name: 'ИБП', icon: '🔋', description: 'Источники бесперебойного питания' },
  { id: 12, name: 'Прочее', icon: '📦', description: 'Другое оборудование' },
];

export function initDatabase(): Promise<void> {
  return new Promise((resolve) => {
    const savedDb = localStorage.getItem(DB_KEY);
    if (savedDb) {
      try {
        db = JSON.parse(savedDb);
        // Миграция: добавляем поля сотрудников если их нет
        if (!db.employees) db.employees = [];
        if (!db.nextEmployeeId) db.nextEmployeeId = 1;
        if (!db.departments) db.departments = [];
        if (!db.nextDepartmentId) db.nextDepartmentId = 1;
        // Миграция: добавляем city и timezone для существующих сотрудников
        db.employees = db.employees.map(emp => ({
          ...emp,
          city: emp.city || '',
          timezone: emp.timezone || 'Europe/Moscow',
          department_id: emp.department_id ?? null,
          position: emp.position || '',
          employee_type: emp.employee_type || 'staff',
        }));
        // Миграция: добавляем responsible_employee_id для существующего оборудования
        db.equipment = db.equipment.map(eq => ({
          ...eq,
          responsible_employee_id: eq.responsible_employee_id || null,
        }));
      } catch (e) {
        console.error('Error loading database:', e);
        db = createDefaultDatabase();
      }
    } else {
      db = createDefaultDatabase();
    }
    saveDatabase();
    resolve();
  });
}

function createDefaultDatabase(): DatabaseSchema {
  return {
    categories: [...defaultCategories],
    equipment: [],
    employees: [],
    departments: [],
    nextCategoryId: defaultCategories.length + 1,
    nextEquipmentId: 1,
    nextEmployeeId: 1,
    nextDepartmentId: 1,
  };
}

function saveDatabase(): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getCategories(): Category[] {
  return [...db.categories];
}

export function getAllEquipment(searchQuery?: string, categoryId?: number): Equipment[] {
  let result = [...db.equipment];

  if (categoryId) {
    result = result.filter(eq => eq.category_id === categoryId);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(eq => 
      eq.name.toLowerCase().includes(query) ||
      eq.serial_number.toLowerCase().includes(query) ||
      eq.inventory_number.toLowerCase().includes(query) ||
      eq.manufacturer.toLowerCase().includes(query) ||
      eq.model.toLowerCase().includes(query) ||
      eq.location.toLowerCase().includes(query) ||
      eq.responsible_person.toLowerCase().includes(query) ||
      eq.notes.toLowerCase().includes(query)
    );
  }

  return result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function getEquipmentById(id: number): Equipment | null {
  return db.equipment.find(eq => eq.id === id) || null;
}

function generateInventoryNumber(): string {
  // Находим максимальный номер в базе
  let maxNum = 0;
  db.equipment.forEach(eq => {
    const match = eq.inventory_number.match(/^INV-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  // Генерируем следующий номер с 4 цифрами
  const nextNum = maxNum + 1;
  return `INV-${String(nextNum).padStart(4, '0')}`;
}

export function addEquipment(data: Omit<Equipment, 'id' | 'category_name' | 'category_icon' | 'inventory_number' | 'created_at' | 'updated_at'>): number {
  const category = db.categories.find(c => c.id === data.category_id);
  const now = new Date().toISOString();
  const inventoryNumber = generateInventoryNumber();
  
  const newEquipment: Equipment = {
    id: db.nextEquipmentId++,
    category_id: data.category_id,
    category_name: category?.name || '',
    category_icon: category?.icon || '',
    name: data.name,
    serial_number: data.serial_number || '',
    inventory_number: inventoryNumber,
    manufacturer: data.manufacturer || '',
    model: data.model || '',
    location: data.location || '',
    responsible_person: data.responsible_person || '',
    responsible_employee_id: data.responsible_employee_id || null,
    status: data.status || 'active',
    purchase_date: data.purchase_date || '',
    purchase_price: data.purchase_price || 0,
    notes: data.notes || '',
    created_at: now,
    updated_at: now,
  };

  db.equipment.push(newEquipment);
  saveDatabase();
  return newEquipment.id;
}

export function updateEquipment(id: number, data: Omit<Equipment, 'id' | 'category_name' | 'category_icon' | 'created_at' | 'updated_at'>): void {
  const index = db.equipment.findIndex(eq => eq.id === id);
  if (index === -1) return;

  const category = db.categories.find(c => c.id === data.category_id);
  const existing = db.equipment[index];

  db.equipment[index] = {
    ...existing,
    category_id: data.category_id,
    category_name: category?.name || '',
    category_icon: category?.icon || '',
    name: data.name,
    serial_number: data.serial_number || '',
    inventory_number: data.inventory_number || '',
    manufacturer: data.manufacturer || '',
    model: data.model || '',
    location: data.location || '',
    responsible_person: data.responsible_person || '',
    responsible_employee_id: data.responsible_employee_id || null,
    status: data.status || 'active',
    purchase_date: data.purchase_date || '',
    purchase_price: data.purchase_price || 0,
    notes: data.notes || '',
    updated_at: new Date().toISOString(),
  };

  saveDatabase();
}

export function deleteEquipment(id: number): void {
  db.equipment = db.equipment.filter(eq => eq.id !== id);
  saveDatabase();
}

// Генерация тестовых данных
const manufacturersByCategory: Record<number, string[]> = {
  1: ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI'], // ПК
  2: ['HP', 'Lenovo', 'ASUS', 'Dell', 'Apple'], // Моноблоки
  3: ['Lenovo', 'HP', 'Dell', 'ASUS', 'Acer', 'Apple', 'MSI', 'Huawei'], // Ноутбуки
  4: ['Apple', 'Samsung', 'Lenovo', 'Huawei', 'Xiaomi'], // Планшеты
  5: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Google', 'OnePlus'], // Телефоны
  6: ['Logitech', 'Microsoft', 'Hikvision', 'Dahua', 'Axis'], // Камеры
  7: ['HP', 'Canon', 'Epson', 'Brother', 'Xerox', 'Kyocera', 'Samsung'], // МФУ/Принтеры
  8: ['Cisco', 'MikroTik', 'TP-Link', 'Ubiquiti', 'D-Link', 'Huawei', 'Zyxel'], // Сетевое
  9: ['Dell', 'Samsung', 'LG', 'ASUS', 'AOC', 'BenQ', 'HP', 'Lenovo'], // Мониторы
  10: ['Dell', 'HP', 'Lenovo', 'Supermicro', 'Cisco'], // Серверы
  11: ['APC', 'Eaton', 'Powercom', 'IPPON', 'CyberPower'], // ИБП
  12: ['Razer', 'SteelSeries', 'Logitech', 'JBL', 'Sony'], // Прочее
};

const locations = [
  'Кабинет 101', 'Кабинет 102', 'Кабинет 201', 'Кабинет 202', 'Кабинет 203',
  'Кабинет 301', 'Кабинет 302', 'Кабинет 303', 'Кабинет 304', 'Кабинет 305',
  'Серверная', 'Бухгалтерия', 'Отдел кадров', 'Приёмная', 'Склад',
  'Переговорная 1', 'Переговорная 2', 'Зал совещаний', 'Опен-спейс А', 'Опен-спейс Б',
];

const firstNames = ['Иван', 'Пётр', 'Сергей', 'Алексей', 'Дмитрий', 'Андрей', 'Михаил', 'Николай', 'Владимир', 'Олег', 'Анна', 'Мария', 'Елена', 'Ольга', 'Татьяна', 'Наталья'];
const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев'];

const statuses = ['active', 'active', 'active', 'active', 'repair', 'reserved', 'storage'];

const modelNames: Record<number, string[]> = {
  1: ['OptiPlex 7090', 'ProDesk 400', 'ThinkCentre M70q', 'ROG Strix', 'Veriton'],
  2: ['ProOne 440', 'ThinkCentre AIO', 'Zen AiO', 'OptiPlex AIO'],
  3: ['ThinkPad T14', 'ProBook 450', 'Latitude 5520', 'VivoBook 15', 'Aspire 3', 'MacBook Pro 14', 'MateBook D15'],
  4: ['iPad Air', 'Galaxy Tab S8', 'Tab M10', 'MatePad 11', 'Redmi Pad'],
  5: ['iPhone 14', 'Galaxy S23', 'Redmi Note 12', 'P50 Pro', 'Pixel 7'],
  6: ['C920', 'LifeCam HD-3000', 'DS-2CD2143G2', 'DH-IPC-HDW2431T', 'M3064-V'],
  7: ['LaserJet Pro M404', 'imageCLASS MF269dw', 'EcoTank L3250', 'HL-L2350DW', 'WorkCentre 3345'],
  8: ['Catalyst 9200', 'hEX S', 'Archer AX73', 'UniFi AP', 'DIR-878', 'AX3 Pro'],
  9: ['P2422H', 'S24D300', '27MK430H', 'VG249Q', '24B1XH', 'GW2480', 'E24 G5', 'ThinkVision T24i'],
  10: ['PowerEdge R740', 'ProLiant DL380', 'ThinkSystem SR650', 'X11DPH-T'],
  11: ['Smart-UPS 1500', '5PX 3000', 'AP755', 'Ups 1000VA', 'CP1500EPFCLCD'],
  12: ['BlackShark V2', 'Arctis 7', 'G Pro X', 'Flip 6', 'WH-1000XM5'],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSerial(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const date = new Date(start + Math.random() * (end - start));
  return date.toISOString().slice(0, 10);
}

export function generateTestData(): number {
  // Проверка: нельзя генерировать без сотрудников
  if (db.employees.length === 0) {
    throw new Error('Невозможно создать тестовые данные: сначала добавьте сотрудников');
  }
  
  let count = 0;
  const now = new Date().toISOString();
  
  for (const category of db.categories) {
    const countForCategory = Math.floor(Math.random() * 91) + 10; // 10..100
    const manufacturers = manufacturersByCategory[category.id] || ['Generic'];
    const models = modelNames[category.id] || ['Model X'];
    
    for (let i = 0; i < countForCategory; i++) {
      const manufacturer = randomFrom(manufacturers);
      const model = randomFrom(models);
      const currentId = db.nextEquipmentId++;
      const inventoryNumber = `INV-${String(currentId).padStart(4, '0')}`;
      const fullName = `${randomFrom(lastNames)} ${randomFrom(firstNames)} ${randomFrom(firstNames).charAt(0)}.`;
      
      // Случайно привязываем к существующему сотруднику (70% шанс)
      let responsibleEmployeeId: number | null = null;
      let responsibleName = fullName;
      if (db.employees.length > 0 && Math.random() > 0.3) {
        const randomEmp = randomFrom(db.employees);
        responsibleEmployeeId = randomEmp.id;
        responsibleName = randomEmp.full_name;
      }
      
      const newEquipment: Equipment = {
        id: currentId,
        category_id: category.id,
        category_name: category.name,
        category_icon: category.icon,
        name: `${category.name} ${manufacturer} ${model} #${i + 1}`,
        serial_number: randomSerial(),
        inventory_number: inventoryNumber,
        manufacturer: manufacturer,
        model: model,
        location: randomFrom(locations),
        responsible_person: responsibleName,
        responsible_employee_id: responsibleEmployeeId,
        status: randomFrom(statuses),
        purchase_date: randomDate(2018, 2025),
        purchase_price: Math.floor(Math.random() * 300000) + 5000,
        notes: '',
        created_at: now,
        updated_at: now,
      };
      
      db.equipment.push(newEquipment);
      count++;
    }
  }
  
  saveDatabase();
  return count;
}

export function clearAllEquipment(): void {
  db.equipment = [];
  db.nextEquipmentId = 1;
  saveDatabase();
}

export function getStats(): { total: number; byCategory: { name: string; icon: string; count: number }[] } {
  const total = db.equipment.length;
  
  const byCategory = db.categories.map(cat => ({
    name: cat.name,
    icon: cat.icon,
    count: db.equipment.filter(eq => eq.category_id === cat.id).length,
  })).sort((a, b) => b.count - a.count);

  return { total, byCategory };
}

// ============ СОТРУДНИКИ ============

export function getAllEmployees(searchQuery?: string, departmentId?: number, workMode?: string, employeeType?: string): Employee[] {
  let result = [...db.employees];

  if (departmentId !== undefined) {
    result = result.filter(emp => emp.department_id === departmentId);
  }

  if (workMode) {
    result = result.filter(emp => emp.work_mode === workMode);
  }

  if (employeeType) {
    result = result.filter(emp => emp.employee_type === employeeType);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(emp => {
      const dept = emp.department_id ? db.departments.find(d => d.id === emp.department_id) : null;
      const deptName = dept ? dept.name.toLowerCase() : '';
      return emp.full_name.toLowerCase().includes(query) ||
        emp.phone.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        deptName.includes(query) ||
        emp.position.toLowerCase().includes(query) ||
        emp.city.toLowerCase().includes(query);
    });
  }

  return result.sort((a, b) => a.full_name.localeCompare(b.full_name, 'ru'));
}

export function getEmployeeById(id: number): Employee | null {
  return db.employees.find(emp => emp.id === id) || null;
}

export function addEmployee(data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): number {
  const now = new Date().toISOString();
  const newEmployee: Employee = {
    id: db.nextEmployeeId++,
    full_name: data.full_name,
    gender: data.gender,
    department_id: data.department_id || null,
    position: data.position || '',
    employee_type: data.employee_type || 'staff',
    phone: data.phone || '',
    email: data.email || '',
    work_mode: data.work_mode || 'office',
    city: data.city || '',
    timezone: data.timezone || 'Europe/Moscow',
    created_at: now,
    updated_at: now,
  };
  db.employees.push(newEmployee);
  saveDatabase();
  return newEmployee.id;
}

export function updateEmployee(id: number, data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): void {
  const index = db.employees.findIndex(emp => emp.id === id);
  if (index === -1) return;
  const existing = db.employees[index];
  db.employees[index] = {
    ...existing,
    full_name: data.full_name,
    gender: data.gender,
    department_id: data.department_id || null,
    position: data.position || '',
    employee_type: data.employee_type || 'staff',
    phone: data.phone || '',
    email: data.email || '',
    work_mode: data.work_mode || 'office',
    city: data.city || '',
    timezone: data.timezone || 'Europe/Moscow',
    updated_at: new Date().toISOString(),
  };
  saveDatabase();
}

export function deleteEmployee(id: number): void {
  db.employees = db.employees.filter(emp => emp.id !== id);
  // Очищаем связь в оборудовании
  db.equipment = db.equipment.map(eq => 
    eq.responsible_employee_id === id 
      ? { ...eq, responsible_employee_id: null }
      : eq
  );
  saveDatabase();
}

export function getEmployeeStats(): {
  total: number;
  byDepartment: { id: number; name: string; count: number }[];
  byWorkMode: { mode: string; label: string; icon: string; count: number }[];
  byGender: { gender: string; count: number }[];
  byType: { type: string; label: string; icon: string; count: number }[];
} {
  const total = db.employees.length;

  const byDepartment = db.departments.map(dep => ({
    id: dep.id,
    name: dep.name,
    count: db.employees.filter(e => e.department_id === dep.id).length,
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

  const modeLabels: Record<string, { label: string; icon: string }> = {
    office: { label: 'В офисе', icon: '🏢' },
    remote: { label: 'Удалённо', icon: '🏠' },
    hybrid: { label: 'Гибрид', icon: '🔄' },
  };
  const byWorkMode = (['office', 'remote', 'hybrid'] as const).map(mode => ({
    mode,
    label: modeLabels[mode].label,
    icon: modeLabels[mode].icon,
    count: db.employees.filter(e => e.work_mode === mode).length,
  }));

  const byGender = [
    { gender: 'male', count: db.employees.filter(e => e.gender === 'male').length },
    { gender: 'female', count: db.employees.filter(e => e.gender === 'female').length },
  ];

  const typeLabels: Record<string, { label: string; icon: string }> = {
    staff: { label: 'Штатный', icon: '👤' },
    external: { label: 'Внешний', icon: '🌐' },
    contractor: { label: 'Подрядчик', icon: '📝' },
  };
  const byType = (['staff', 'external', 'contractor'] as const).map(type => ({
    type,
    label: typeLabels[type].label,
    icon: typeLabels[type].icon,
    count: db.employees.filter(e => e.employee_type === type).length,
  }));

  return { total, byDepartment, byWorkMode, byGender, byType };
}

// Генерация тестовых сотрудников
export function generateTestEmployees(): number {
  // Проверка: нельзя генерировать без подразделений
  if (db.departments.length === 0) {
    throw new Error('Невозможно создать тестовых сотрудников: сначала создайте оргструктуру');
  }
  
  const count = Math.floor(Math.random() * 41) + 10; // 10..50
  const now = new Date().toISOString();

  const maleFirstNames = ['Иван', 'Пётр', 'Сергей', 'Алексей', 'Дмитрий', 'Андрей', 'Михаил', 'Николай', 'Владимир', 'Олег', 'Артём', 'Максим', 'Евгений', 'Александр', 'Константин'];
  const femaleFirstNames = ['Анна', 'Мария', 'Елена', 'Ольга', 'Татьяна', 'Наталья', 'Ирина', 'Светлана', 'Екатерина', 'Юлия', 'Оксана', 'Виктория', 'Дарья', 'Анастасия', 'Полина'];
  const maleLastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Козлов', 'Степанов', 'Николаев', 'Орлов', 'Андреев'];
  const femaleLastNames = ['Иванова', 'Петрова', 'Сидорова', 'Смирнова', 'Кузнецова', 'Попова', 'Васильева', 'Соколова', 'Михайлова', 'Новикова', 'Фёдорова', 'Морозова', 'Волкова', 'Алексеева', 'Лебедева', 'Козлова', 'Степанова', 'Николаева', 'Орлова', 'Андреева'];
  const middleNames = ['Иванович', 'Петрович', 'Сергеевич', 'Александрович', 'Михайлович', 'Николаевич', 'Владимирович', 'Андреевич', 'Дмитриевич', 'Евгеньевич'];
  const femaleMiddleNames = ['Ивановна', 'Петровна', 'Сергеевна', 'Александровна', 'Михайловна', 'Николаевна', 'Владимировна', 'Андреевна', 'Дмитриевна', 'Евгеньевна'];
  
  const positions = ['Директор', 'Заместитель директора', 'Начальник отдела', 'Руководитель группы', 'Ведущий специалист', 'Старший специалист', 'Специалист', 'Младший специалист', 'Стажёр', 'Менеджер', 'Инженер', 'Аналитик', 'Бухгалтер', 'Юрист', 'HR-менеджер'];
  const employeeTypes: ('staff' | 'external' | 'contractor')[] = ['staff', 'staff', 'staff', 'staff', 'external', 'contractor'];
  const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону', 'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград', 'Краснодар', 'Саратов', 'Тюмень', 'Тольятти', 'Ижевск'];
  const workModes: ('office' | 'remote' | 'hybrid')[] = ['office', 'office', 'office', 'remote', 'remote', 'hybrid'];

  for (let i = 0; i < count; i++) {
    const gender: 'male' | 'female' = Math.random() > 0.5 ? 'female' : 'male';
    const firstName = gender === 'male' 
      ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
      : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
    const lastName = gender === 'male'
      ? maleLastNames[Math.floor(Math.random() * maleLastNames.length)]
      : femaleLastNames[Math.floor(Math.random() * femaleLastNames.length)];
    const middleName = gender === 'male'
      ? middleNames[Math.floor(Math.random() * middleNames.length)]
      : femaleMiddleNames[Math.floor(Math.random() * femaleMiddleNames.length)];
    
    const fullName = `${lastName} ${firstName} ${middleName}`;
    const department = db.departments[Math.floor(Math.random() * db.departments.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const employeeType = employeeTypes[Math.floor(Math.random() * employeeTypes.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const timezone = TIMEZONES[Math.floor(Math.random() * TIMEZONES.length)].value;
    const workMode = workModes[Math.floor(Math.random() * workModes.length)];
    
    // Генерация телефона
    const phoneCode = ['903', '905', '906', '909', '910', '915', '916', '917', '919', '920', '921', '925', '926', '927', '929', '930', '936', '937', '938', '939'][Math.floor(Math.random() * 20)];
    const phoneNum = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
    const phone = `+7 (${phoneCode}) ${phoneNum.slice(0, 3)}-${phoneNum.slice(3, 5)}-${phoneNum.slice(5)}`;
    
    // Генерация email
    const translit: Record<string, string> = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya' };
    const toTranslit = (s: string) => s.toLowerCase().split('').map(c => translit[c] || c).join('');
    const emailName = toTranslit(lastName) + '.' + toTranslit(firstName).charAt(0);
    const domains = ['company.ru', 'corp.ru', 'office.ru', 'firm.ru', 'work.ru'];
    const email = `${emailName}@${domains[Math.floor(Math.random() * domains.length)]}`;

    const newEmployee: Employee = {
      id: db.nextEmployeeId++,
      full_name: fullName,
      gender,
      department_id: department.id,
      position,
      employee_type: employeeType,
      phone,
      email,
      work_mode: workMode,
      city,
      timezone,
      created_at: now,
      updated_at: now,
    };

    db.employees.push(newEmployee);
  }

  saveDatabase();
  return count;
}

export function clearAllEmployees(): void {
  db.employees = [];
  db.nextEmployeeId = 1;
  saveDatabase();
}

// ============ ОРГСТРУКТУРА (ПОДРАЗДЕЛЕНИЯ) ============

export function getAllDepartments(): Department[] {
  return [...db.departments].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function getDepartmentById(id: number): Department | null {
  return db.departments.find(d => d.id === id) || null;
}

export function getDepartmentName(id: number | null): string {
  if (!id) return 'Не указано';
  const dept = db.departments.find(d => d.id === id);
  return dept ? dept.name : 'Неизвестное подразделение';
}

export function getDepartmentTree(): (Department & { children: Department[]; employeeCount: number })[] {
  const rootDepts = db.departments.filter(d => d.parent_id === null);
  
  return rootDepts.map(dept => {
    const children = db.departments
      .filter(d => d.parent_id === dept.id)
      .map(child => ({
        ...child,
        children: [],
        employeeCount: db.employees.filter(e => e.department_id === child.id).length,
      }));
    
    return {
      ...dept,
      children,
      employeeCount: db.employees.filter(e => e.department_id === dept.id).length,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function addDepartment(name: string, parentId: number | null = null): number {
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

export function updateDepartment(id: number, name: string, parentId: number | null, headEmployeeId: number | null): void {
  const index = db.departments.findIndex(d => d.id === id);
  if (index === -1) return;
  db.departments[index] = {
    ...db.departments[index],
    name,
    parent_id: parentId,
    head_employee_id: headEmployeeId,
  };
  saveDatabase();
}

export function deleteDepartment(id: number): { success: boolean; message: string } {
  // Проверяем, есть ли дочерние подразделения
  const children = db.departments.filter(d => d.parent_id === id);
  if (children.length > 0) {
    return { success: false, message: `Нельзя удалить: есть ${children.length} дочерних подразделений` };
  }
  
  // Проверяем, есть ли сотрудники
  const employees = db.employees.filter(e => e.department_id === id);
  if (employees.length > 0) {
    return { success: false, message: `Нельзя удалить: в подразделении ${employees.length} сотрудников` };
  }
  
  db.departments = db.departments.filter(d => d.id !== id);
  saveDatabase();
  return { success: true, message: 'Подразделение удалено' };
}

export function getSubDepartments(parentId: number | null): Department[] {
  return db.departments.filter(d => d.parent_id === parentId);
}

export function generateTestDepartments(): number {
  const count = Math.floor(Math.random() * 6) + 5; // 5..10 корневых
  const now = new Date().toISOString();
  let created = 0;

  const rootNames = [
    'Руководство', 'ИТ-департамент', 'Финансовый отдел', 'Отдел продаж',
    'Отдел маркетинга', 'Отдел кадров', 'Юридический отдел', 'Отдел логистики',
    'Производственный отдел', 'Отдел разработки', 'Служба безопасности', 'Бухгалтерия',
  ];

  const subDeptNames: Record<string, string[]> = {
    'ИТ-департамент': ['Сетевой отдел', 'Отдел разработки', 'Техподдержка', 'Отдел информационной безопасности'],
    'Финансовый отдел': ['Бюджетирование', 'Казначейство', 'Финансовый анализ'],
    'Отдел продаж': ['Отдел корпоративных продаж', 'Отдел розничных продаж', 'Отдел работы с клиентами'],
    'Руководство': ['Совет директоров', 'Стратегическое планирование'],
    'Производственный отдел': ['Цех №1', 'Цех №2', 'Отдел контроля качества'],
  };

  // Создаём корневые подразделения
  const rootIds: number[] = [];
  for (let i = 0; i < Math.min(count, rootNames.length); i++) {
    const dept: Department = {
      id: db.nextDepartmentId++,
      name: rootNames[i],
      parent_id: null,
      head_employee_id: null,
      created_at: now,
    };
    db.departments.push(dept);
    rootIds.push(dept.id);
    created++;
  }

  // Создаём дочерние подразделения
  for (const rootName of Object.keys(subDeptNames)) {
    const parentDept = db.departments.find(d => d.name === rootName && d.parent_id === null);
    if (!parentDept) continue;
    
    const subs = subDeptNames[rootName];
    for (const subName of subs) {
      const dept: Department = {
        id: db.nextDepartmentId++,
        name: subName,
        parent_id: parentDept.id,
        head_employee_id: null,
        created_at: now,
      };
      db.departments.push(dept);
      created++;
    }
  }

  saveDatabase();
  return created;
}

export function clearAllDepartments(): { success: boolean; message: string } {
  if (db.employees.length > 0) {
    return { success: false, message: 'Нельзя очистить: есть привязанные сотрудники' };
  }
  db.departments = [];
  db.nextDepartmentId = 1;
  saveDatabase();
  return { success: true, message: 'Оргструктура очищена' };
}
