import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
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

  // Verificar sesión existente al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('vitasport_user');
    const savedAuth = localStorage.getItem('vitasport_auth');
    
    if (savedUser && savedAuth === 'true') {
      setUsername(savedUser);
      setIsAuthenticated(true);
      console.info('✅ Sesión restaurada:', savedUser);
    }
  }, []);

  /**
   * Intenta iniciar sesión con las credenciales proporcionadas
   * 
   * @param username - Nombre de usuario
   * @param password - Contraseña
   * @returns true si las credenciales son correctas, false si no
   */
  const login = (username: string, password: string): boolean => {
    // TODO: En el futuro, verificar contra la base de datos
    // Por ahora, credenciales hardcodeadas
    if (username === 'admin' && password === 'admin') {
      setUsername(username);
      setIsAuthenticated(true);
      
      // Guardar sesión en localStorage
      localStorage.setItem('vitasport_user', username);
      localStorage.setItem('vitasport_auth', 'true');
      
      console.info('✅ Inicio de sesión exitoso:', username);
      return true;
    }
    
    console.warn('❌ Credenciales incorrectas');
    return false;
  };

  /**
   * Cierra la sesión del usuario actual
   */
  const logout = () => {
    setUsername(null);
    setIsAuthenticated(false);
    
    // Limpiar localStorage
    localStorage.removeItem('vitasport_user');
    localStorage.removeItem('vitasport_auth');
    
    console.info('👋 Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
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
