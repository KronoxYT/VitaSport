import { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';
import StatCard from '../components/StatCard';
import { invoke } from '@tauri-apps/api';

interface Product {
  id?: number;
  name: string;
  min_stock?: number;
}

interface Sale {
  sale_price: number;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalSales: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Carga los datos del dashboard desde la base de datos
   * 
   * Esta función maneja dos escenarios:
   * 1. Modo desarrollo (npm run dev): Sin backend Tauri, usa datos vacíos
   * 2. Modo producción (npm run tauri:dev): Con backend Tauri completo
   * 
   * Esto permite desarrollar el frontend sin compilar Rust cada vez
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Verificar si Tauri está disponible (modo producción)
      // En desarrollo solo con Vite, __TAURI__ no existe
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        // MODO TAURI: Cargar datos reales desde SQLite
        const [products, sales] = await Promise.all([
          invoke<Product[]>('get_products'),
          invoke<Sale[]>('get_sales'),
        ]);

        // Calcular estadísticas desde los datos reales
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.name).length;
        const lowStockProducts = products.filter(p => (p.min_stock || 0) <= 5).length;
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.sale_price, 0);

        setStats({
          totalProducts,
          activeProducts,
          lowStockProducts,
          totalSales,
          totalRevenue,
        });
      } else {
        // MODO DESARROLLO: Sin Tauri, usar datos vacíos
        // Esto evita errores en la consola durante el desarrollo
        console.info('🚀 Modo desarrollo: Ejecutando sin backend Tauri');
        console.info('💡 Para ver datos reales, ejecuta: npm run tauri:dev');
        
        setStats({
          totalProducts: 0,
          activeProducts: 0,
          lowStockProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
        });
      }
    } catch (error) {
      // Si hay error, mostrar información útil en consola
      console.error('❌ Error cargando datos del dashboard:', error);
      console.info('💡 Asegúrate de que el backend Tauri esté corriendo');
      
      // Mantener el estado actual o usar valores por defecto
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con mejor espaciado y modo oscuro */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Panel de Control</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Resumen general de tu inventario y ventas</p>
      </div>
      
      {/* Stats Cards con espaciado optimizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Productos"
          value={loading ? '...' : stats.totalProducts.toString()}
          icon={Package}
          trend={{ value: 0, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Ingresos Totales"
          value={loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 0, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Ventas Realizadas"
          value={loading ? '...' : stats.totalSales.toString()}
          icon={ShoppingCart}
          trend={{ value: 0, isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Stock Bajo"
          value={loading ? '...' : stats.lowStockProducts.toString()}
          icon={AlertTriangle}
          trend={{ value: 0, isPositive: false }}
          color="orange"
        />
      </div>

      {/* Gráficos con diseño más limpio y modo oscuro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ventas por Producto</h2>
            <TrendingUp className="text-gray-400 dark:text-gray-500" size={20} />
          </div>
          <div className="h-56 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Package className="mx-auto mb-2 text-blue-400 dark:text-blue-500" size={32} />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gráfico de Barras</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Próximamente</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Tendencia de Ventas</h2>
            <DollarSign className="text-gray-400 dark:text-gray-500" size={20} />
          </div>
          <div className="h-56 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 text-green-400 dark:text-green-500" size={32} />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gráfico de Líneas</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Próximamente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas con diseño mejorado y modo oscuro */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notificaciones</h2>
          <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
            {stats.lowStockProducts}
          </span>
        </div>
        <div className="space-y-3">
          {stats.lowStockProducts > 0 ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="text-amber-500 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-300 text-sm">Stock Bajo Detectado</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    {stats.lowStockProducts} {stats.lowStockProducts === 1 ? 'producto tiene' : 'productos tienen'} stock por debajo del mínimo
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
              <div className="flex items-start">
                <Package className="text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-300 text-sm">Todo en Orden</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    No hay productos con stock bajo en este momento
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {stats.totalProducts === 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
              <div className="flex items-start">
                <Package className="text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-300 text-sm">Comienza a Agregar Productos</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    Dirígete a Inventario para agregar tus primeros productos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
