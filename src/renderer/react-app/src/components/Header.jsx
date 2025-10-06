import { motion } from 'framer-motion';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export const Header = ({ user, onLogout }) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm px-6 py-4"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">VitaSport</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="h-8 w-8 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{user?.name || 'Usuario'}</span>
          </div>
          
          <button
            onClick={onLogout}
            className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </motion.header>
  );
};