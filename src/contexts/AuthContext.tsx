import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface User {
  id?: number;
  username: string;
  role: string;
  fullname?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor de autenticación para la aplicación
 * 
 * CREDENCIALES POR DEFECTO:
 * - Usuario: admin
 * - Contraseña: admin
 * 
 * La sesión se mantiene en localStorage
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Verificar sesión existente al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('vitasport_user');
    const savedUserData = localStorage.getItem('vitasport_user_data');
    const savedAuth = localStorage.getItem('vitasport_auth');
    
    if (savedUser && savedAuth === 'true' && savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        setUsername(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.info('✅ Sesión restaurada:', savedUser);
      } catch (e) {
        console.error('Error restaurando sesión:', e);
        localStorage.clear();
      }
    }
  }, []);

  /**
   * Intenta iniciar sesión con las credenciales proporcionadas
   * Verifica contra la base de datos SQLite usando bcrypt
   * 
   * @param username - Nombre de usuario
   * @param password - Contraseña
   * @returns Promise<boolean> - true si las credenciales son correctas, false si no
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Verificar si Tauri está disponible
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        // Verificar credenciales contra la base de datos
        const userData = await invoke<User>('verify_login', { username, password });
        
        setUsername(userData.username);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Guardar sesión en localStorage
        localStorage.setItem('vitasport_user', userData.username);
        localStorage.setItem('vitasport_user_data', JSON.stringify(userData));
        localStorage.setItem('vitasport_auth', 'true');
        
        console.info('✅ Inicio de sesión exitoso:', userData.username);
        return true;
      } else {
        // Modo desarrollo: credenciales hardcodeadas
        if (username === 'admin' && password === 'admin') {
          const mockUser: User = { username: 'admin', role: 'Administrador', fullname: 'Administrador' };
          setUsername(username);
          setUser(mockUser);
          setIsAuthenticated(true);
          
          localStorage.setItem('vitasport_user', username);
          localStorage.setItem('vitasport_user_data', JSON.stringify(mockUser));
          localStorage.setItem('vitasport_auth', 'true');
          
          console.info('✅ Inicio de sesión exitoso (modo desarrollo):', username);
          return true;
        }
        
        console.warn('❌ Credenciales incorrectas');
        return false;
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      return false;
    }
  };

  /**
   * Cierra la sesión del usuario actual
   */
  const logout = () => {
    setUsername(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Limpiar localStorage
    localStorage.removeItem('vitasport_user');
    localStorage.removeItem('vitasport_user_data');
    localStorage.removeItem('vitasport_auth');
    
    console.info('👋 Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
