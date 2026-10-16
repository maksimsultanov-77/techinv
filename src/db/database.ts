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

interface DatabaseSchema {
  categories: Category[];
  equipment: Equipment[];
  nextCategoryId: number;
  nextEquipmentId: number;
}

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
    nextCategoryId: defaultCategories.length + 1,
    nextEquipmentId: 1,
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
        responsible_person: fullName,
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
