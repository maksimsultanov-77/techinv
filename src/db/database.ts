import initSqlJs, { Database, SqlValue } from 'sql.js';

let db: Database | null = null;

const DB_KEY = 'equipment_inventory_db';

export async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`
  });

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem(DB_KEY);
  if (savedDb) {
    const buf = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0));
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      description TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      serial_number TEXT,
      inventory_number TEXT,
      manufacturer TEXT,
      model TEXT,
      location TEXT,
      responsible_person TEXT,
      status TEXT DEFAULT 'active',
      purchase_date TEXT,
      purchase_price REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  // Insert default categories if empty
  const countResult = db.exec("SELECT COUNT(*) FROM categories");
  const count = countResult[0]?.values[0][0] as number;
  
  if (count === 0) {
    const categories = [
      { name: 'ПК', icon: '🖥️', description: 'Настольные компьютеры' },
      { name: 'Моноблоки', icon: '🖥️', description: 'Компьютеры моноблок' },
      { name: 'Ноутбуки', icon: '💻', description: 'Ноутбуки' },
      { name: 'Планшеты', icon: '📱', description: 'Планшетные компьютеры' },
      { name: 'Телефоны', icon: '📞', description: 'Мобильные телефоны и смартфоны' },
      { name: 'Камеры', icon: '📷', description: 'Веб-камеры и камеры видеонаблюдения' },
      { name: 'МФУ/Принтеры', icon: '🖨️', description: 'Многофункциональные устройства и принтеры' },
      { name: 'Сетевое оборудование', icon: '🌐', description: 'Роутеры, коммутаторы, точки доступа' },
      { name: 'Мониторы', icon: '🖥️', description: 'Мониторы и дисплеи' },
      { name: 'Серверы', icon: '🗄️', description: 'Серверное оборудование' },
      { name: 'ИБП', icon: '🔋', description: 'Источники бесперебойного питания' },
      { name: 'Прочее', icon: '📦', description: 'Другое оборудование' },
    ];

    for (const cat of categories) {
      db.run(
        "INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)",
        [cat.name, cat.icon, cat.description]
      );
    }
    saveDatabase();
  }

  return db;
}

export function getDatabase(): Database {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Array.from(data) as number[];
  const binary = buffer.map(b => String.fromCharCode(b)).join('');
  localStorage.setItem(DB_KEY, btoa(binary));
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

export function getCategories(): Category[] {
  const result = db!.exec("SELECT id, name, icon, description FROM categories ORDER BY id");
  if (!result.length) return [];
  return result[0].values.map((row: SqlValue[]) => ({
    id: row[0] as number,
    name: row[1] as string,
    icon: row[2] as string,
    description: row[3] as string,
  }));
}

export function getAllEquipment(searchQuery?: string, categoryId?: number): Equipment[] {
  let query = `
    SELECT e.id, e.category_id, c.name as category_name, c.icon as category_icon,
           e.name, e.serial_number, e.inventory_number, e.manufacturer, e.model,
           e.location, e.responsible_person, e.status, e.purchase_date,
           e.purchase_price, e.notes, e.created_at, e.updated_at
    FROM equipment e
    JOIN categories c ON e.category_id = c.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (searchQuery) {
    query += ` AND (
      e.name LIKE ? OR e.serial_number LIKE ? OR e.inventory_number LIKE ? 
      OR e.manufacturer LIKE ? OR e.model LIKE ? OR e.location LIKE ?
      OR e.responsible_person LIKE ? OR e.notes LIKE ?
    )`;
    const likeQuery = `%${searchQuery}%`;
    for (let i = 0; i < 8; i++) {
      params.push(likeQuery);
    }
  }

  if (categoryId) {
    query += ` AND e.category_id = ?`;
    params.push(categoryId);
  }

  query += ` ORDER BY e.updated_at DESC`;

  const result = db!.exec(query, params);
  if (!result.length) return [];
  
  return result[0].values.map((row: SqlValue[]) => ({
    id: row[0] as number,
    category_id: row[1] as number,
    category_name: row[2] as string,
    category_icon: row[3] as string,
    name: row[4] as string,
    serial_number: (row[5] as string) || '',
    inventory_number: (row[6] as string) || '',
    manufacturer: (row[7] as string) || '',
    model: (row[8] as string) || '',
    location: (row[9] as string) || '',
    responsible_person: (row[10] as string) || '',
    status: (row[11] as string) || 'active',
    purchase_date: (row[12] as string) || '',
    purchase_price: (row[13] as number) || 0,
    notes: (row[14] as string) || '',
    created_at: (row[15] as string) || '',
    updated_at: (row[16] as string) || '',
  }));
}

export function getEquipmentById(id: number): Equipment | null {
  const result = db!.exec(`
    SELECT e.id, e.category_id, c.name as category_name, c.icon as category_icon,
           e.name, e.serial_number, e.inventory_number, e.manufacturer, e.model,
           e.location, e.responsible_person, e.status, e.purchase_date,
           e.purchase_price, e.notes, e.created_at, e.updated_at
    FROM equipment e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `, [id]);
  
  if (!result.length || !result[0].values.length) return null;
  const row = result[0].values[0];
  return {
    id: row[0] as number,
    category_id: row[1] as number,
    category_name: row[2] as string,
    category_icon: row[3] as string,
    name: row[4] as string,
    serial_number: row[5] as string,
    inventory_number: row[6] as string,
    manufacturer: row[7] as string,
    model: row[8] as string,
    location: row[9] as string,
    responsible_person: row[10] as string,
    status: row[11] as string,
    purchase_date: row[12] as string,
    purchase_price: row[13] as number,
    notes: row[14] as string,
    created_at: row[15] as string,
    updated_at: row[16] as string,
  };
}

export function addEquipment(data: Omit<Equipment, 'id' | 'category_name' | 'category_icon' | 'created_at' | 'updated_at'>): number {
  db!.run(`
    INSERT INTO equipment (category_id, name, serial_number, inventory_number, manufacturer, model, location, responsible_person, status, purchase_date, purchase_price, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.category_id, data.name, data.serial_number || null,
    data.inventory_number || null, data.manufacturer || null,
    data.model || null, data.location || null,
    data.responsible_person || null, data.status || 'active',
    data.purchase_date || null, data.purchase_price || null,
    data.notes || null
  ]);
  saveDatabase();
  const result = db!.exec("SELECT last_insert_rowid()");
  return result[0].values[0][0] as number;
}

export function updateEquipment(id: number, data: Omit<Equipment, 'id' | 'category_name' | 'category_icon' | 'created_at' | 'updated_at'>): void {
  db!.run(`
    UPDATE equipment 
    SET category_id = ?, name = ?, serial_number = ?, inventory_number = ?, 
        manufacturer = ?, model = ?, location = ?, responsible_person = ?,
        status = ?, purchase_date = ?, purchase_price = ?, notes = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `, [
    data.category_id, data.name, data.serial_number || null,
    data.inventory_number || null, data.manufacturer || null,
    data.model || null, data.location || null,
    data.responsible_person || null, data.status || 'active',
    data.purchase_date || null, data.purchase_price || null,
    data.notes || null, id
  ]);
  saveDatabase();
}

export function deleteEquipment(id: number): void {
  db!.run("DELETE FROM equipment WHERE id = ?", [id]);
  saveDatabase();
}

export function getStats(): { total: number; byCategory: { name: string; icon: string; count: number }[] } {
  const totalResult = db!.exec("SELECT COUNT(*) FROM equipment");
  const total = totalResult.length ? (totalResult[0].values[0][0] as number) : 0;
  
  const categoryResult = db!.exec(`
    SELECT c.name, c.icon, COUNT(e.id) as count
    FROM categories c
    LEFT JOIN equipment e ON c.id = e.category_id
    GROUP BY c.id
    ORDER BY count DESC
  `);
  
  const byCategory = categoryResult.length 
    ? categoryResult[0].values.map((row: SqlValue[]) => ({
        name: row[0] as string,
        icon: row[1] as string,
        count: row[2] as number,
      }))
    : [];

  return { total, byCategory };
}
