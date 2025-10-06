import { motion } from 'framer-motion';
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  { id: 'home', label: 'Inicio', icon: HomeIcon },
  { id: 'inventory', label: 'Inventario', icon: CubeIcon },
  { id: 'sales', label: 'Ventas', icon: ShoppingCartIcon },
  { id: 'reports', label: 'Reportes', icon: ChartBarIcon },
  { id: 'settings', label: 'Configuración', icon: Cog6ToothIcon },
];

export const Sidebar = ({ active, onNavigate }) => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white w-64 min-h-screen shadow-sm py-6"
    >
      <nav className="space-y-1 px-3">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              active === id
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </motion.aside>
  );
};