import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText,
  Users
} from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/inventory', icon: Package, label: 'Inventario' },
  { path: '/sales', icon: ShoppingCart, label: 'Ventas' },
  { path: '/reports', icon: FileText, label: 'Reportes' },
  { path: '/users', icon: Users, label: 'Usuarios' },
];

/**
 * Layout principal de la aplicación
 * Incluye sidebar con navegación y modo oscuro automático
 */
export default function Layout() {
  const location = useLocation();
  // Detectar modo oscuro del sistema automáticamente
  useDarkMode();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar con soporte para modo oscuro */}
      <aside className="w-64 bg-gray-800 dark:bg-gray-950 shadow-lg">
        <div className="p-6 border-b border-gray-700 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-white">VitaSport</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Sistema de Inventario</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-gray-700 dark:bg-gray-800 text-white font-medium'
                    : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content con soporte para modo oscuro */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
