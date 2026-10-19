import { useSettings } from '../contexts/SettingsContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
  stats: { total: number };
  empStats: { total: number };
  departments: any[];
  locations: any[];
  statuses: any[];
  categories: any[];
}

export function Sidebar({
  activeView,
  setActiveView,
  stats,
  empStats,
  departments,
  locations,
  statuses,
  categories,
}: SidebarProps) {
  const { settings } = useSettings();

  const menuItems = [
    { id: 'structure', label: '🏢 Оргструктура', count: departments.length },
    { id: 'employees', label: '👥 Сотрудники', count: empStats.total },
    { id: 'equipment', label: '🖥️ Оборудование', count: stats.total },
    { id: 'locations', label: '📍 Местоположения', count: locations.length },
    { id: 'statuses', label: '🏷️ Статусы', count: statuses.length },
    { id: 'categories', label: '📁 Категории', count: categories.length },
    { id: 'logs', label: '📋 Логи', count: null },
    { id: 'settings', label: '⚙️ Настройки', count: null },
  ];

  return (
    <div className="sidebar">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🖥️</span>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {settings.organizationName}
          </h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Система управления оборудованием
        </p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
              activeView === item.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              {item.count !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeView === item.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {item.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}
