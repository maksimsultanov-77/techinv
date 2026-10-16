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

export function addEquipment(data: Omit<Equipment, 'id' | 'category_name' | 'category_icon' | 'created_at' | 'updated_at'>): number {
  const category = db.categories.find(c => c.id === data.category_id);
  const now = new Date().toISOString();
  
  const newEquipment: Equipment = {
    id: db.nextEquipmentId++,
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

export function getStats(): { total: number; byCategory: { name: string; icon: string; count: number }[] } {
  const total = db.equipment.length;
  
  const byCategory = db.categories.map(cat => ({
    name: cat.name,
    icon: cat.icon,
    count: db.equipment.filter(eq => eq.category_id === cat.id).length,
  })).sort((a, b) => b.count - a.count);

  return { total, byCategory };
}
