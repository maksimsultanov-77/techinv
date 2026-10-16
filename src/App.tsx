import React, { useState, useEffect, useCallback } from 'react';
import {
  initDatabase,
  getCategories,
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  getStats,
  Category,
  Equipment,
} from './db/database';
import EquipmentForm from './components/EquipmentForm';
import EquipmentList from './components/EquipmentList';
import EquipmentDetail from './components/EquipmentDetail';

type ViewMode = 'list' | 'stats';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [viewingItem, setViewingItem] = useState<Equipment | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [stats, setStats] = useState<{ total: number; byCategory: { name: string; icon: string; count: number }[] }>({ total: 0, byCategory: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDatabase().then(() => {
      setDbReady(true);
      setLoading(false);
    });
  }, []);

  const loadData = useCallback(() => {
    const cats = getCategories();
    setCategories(cats);
    const items = getAllEquipment(searchQuery || undefined, selectedCategory);
    setEquipment(items);
    const s = getStats();
    setStats(s);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (dbReady) {
      loadData();
    }
  }, [dbReady, loadData]);

  const handleAdd = (data: any) => {
    addEquipment(data);
    setShowForm(false);
    loadData();
  };

  const handleEdit = (data: any) => {
    if (editingItem) {
      updateEquipment(editingItem.id, data);
      setEditingItem(null);
      loadData();
    }
  };

  const handleDelete = (id: number) => {
    deleteEquipment(id);
    loadData();
  };

  const handleExport = () => {
    const data = localStorage.getItem('equipment_inventory_db');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `equipment_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🖥️</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Учет техники</h1>
                <p className="text-sm text-gray-500">Система управления оборудованием</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                title="Экспорт базы данных"
              >
                💾 Экспорт
              </button>
              <button
                onClick={() => { setShowForm(true); setEditingItem(null); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                ➕ Добавить
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div
            className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
              viewMode === 'stats' && !selectedCategory ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:shadow-sm'
            }`}
            onClick={() => { setSelectedCategory(undefined); setViewMode('list'); }}
          >
            <div className="text-2xl mb-1">📊</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500">Всего</div>
          </div>
          {stats.byCategory.slice(0, 5).map(cat => (
            <div
              key={cat.name}
              className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                selectedCategory === categories.find(c => c.name === cat.name)?.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:shadow-sm'
              }`}
              onClick={() => {
                const catId = categories.find(c => c.name === cat.name)?.id;
                if (selectedCategory === catId) {
                  setSelectedCategory(undefined);
                } else {
                  setSelectedCategory(catId);
                }
                setViewMode('list');
              }}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{cat.count}</div>
              <div className="text-xs text-gray-500 truncate">{cat.name}</div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, серийному номеру, расположению, ответственному..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
            >
              <option value="">Все категории</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>Найдено: {equipment.length} записей</span>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory(undefined); }}
                className="text-blue-600 hover:text-blue-700"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>

        {/* Equipment List */}
        <EquipmentList
          equipment={equipment}
          onEdit={(item) => { setEditingItem(item); setShowForm(false); }}
          onDelete={handleDelete}
          onView={(item) => setViewingItem(item)}
        />
      </main>

      {/* Modals */}
      {showForm && (
        <EquipmentForm
          categories={categories}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingItem && (
        <EquipmentForm
          categories={categories}
          equipment={editingItem}
          onSave={handleEdit}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {viewingItem && (
        <EquipmentDetail
          equipment={viewingItem}
          onClose={() => setViewingItem(null)}
          onEdit={() => {
            setEditingItem(viewingItem);
            setViewingItem(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
