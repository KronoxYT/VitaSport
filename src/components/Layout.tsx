import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  FileText, 
  Settings 
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Productos' },
  { path: '/inventory', icon: Warehouse, label: 'Inventario' },
  { path: '/sales', icon: ShoppingCart, label: 'Ventas' },
  { path: '/reports', icon: FileText, label: 'Reportes' },
  { path: '/settings', icon: Settings, label: 'Configuración' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-600">VitaSport</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Inventario</p>
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
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
