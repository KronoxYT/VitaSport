import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar y aplicar modo oscuro automático
 * 
 * Detecta la preferencia del sistema operativo y actualiza automáticamente
 * cuando el usuario cambia entre modo claro/oscuro en su OS
 * 
 * @returns {boolean} true si está en modo oscuro, false si está en modo claro
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Detectar preferencia inicial del sistema
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Crear media query para detectar cambios
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Handler para cuando cambia la preferencia del sistema
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      console.info(`🌙 Modo ${e.matches ? 'oscuro' : 'claro'} activado`);
    };

    // Escuchar cambios en la preferencia del sistema
    mediaQuery.addEventListener('change', handleChange);

    // Aplicar clase al HTML para Tailwind
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDark]);

  return isDark;
}
