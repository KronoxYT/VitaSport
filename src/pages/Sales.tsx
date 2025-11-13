import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api';
import { Plus, DollarSign, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import Button from '../components/Button';

interface Sale {
  id?: number;
  product_id: number;
  quantity: number;
  sale_price: number;
  discount?: number;
  channel?: string;
  sale_date?: string;
  created_by?: number;
}

/**
 * Página de Ventas
 * Muestra el historial de ventas desde la base de datos SQLite
 */
export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    month: 0,
    total: 0,
  });

  useEffect(() => {
    loadSales();
  }, []);

  /**
   * Maneja el clic en "Nueva Venta"
   * TODO: Implementar modal de nueva venta
   */
  const handleNewSale = () => {
    alert('Funcionalidad "Nueva Venta" en desarrollo.\n\nPróximamente podrás:\n- Seleccionar productos\n- Ingresar cantidad\n- Aplicar descuentos\n- Registrar venta');
  };

  /**
   * Carga las ventas desde la base de datos
   * 
   * MODOS DE OPERACIÓN:
   * - Desarrollo (npm run dev): No carga datos, muestra interfaz vacía
   * - Producción (npm run tauri:dev): Carga datos reales desde SQLite
   */
  const loadSales = async () => {
    try {
      setLoading(true);
      
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        // MODO TAURI: Cargar ventas reales
        const result = await invoke<Sale[]>('get_sales');
        setSales(result);
        
        // Calcular estadísticas
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        
        const todaySales = result.filter(s => s.sale_date?.startsWith(today));
        const monthSales = result.filter(s => {
          if (!s.sale_date) return false;
          const saleMonth = new Date(s.sale_date).getMonth();
          return saleMonth === currentMonth;
        });
        
        setStats({
          today: todaySales.reduce((sum, s) => sum + s.sale_price, 0),
          month: monthSales.reduce((sum, s) => sum + s.sale_price, 0),
          total: result.length,
        });
        
        console.info(`✅ ${result.length} ventas cargadas desde SQLite`);
      } else {
        // MODO DESARROLLO: Sin backend
        console.info('🚀 Modo desarrollo: Interfaz lista para registrar ventas');
        console.info('💡 Para backend completo, ejecuta: npm run tauri:dev');
        setSales([]);
        setStats({ today: 0, month: 0, total: 0 });
      }
    } catch (error) {
      console.error('❌ Error cargando ventas:', error);
      setSales([]);
      setStats({ today: 0, month: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con modo oscuro */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Ventas</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Registro de transacciones</p>
        </div>
        <Button icon={Plus} onClick={handleNewSale}>Nueva Venta</Button>
      </div>

      {/* Estadísticas con datos reales y modo oscuro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '...' : `$${stats.today.toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-lg">
              <DollarSign className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Ventas del Mes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '...' : `$${stats.month.toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Total Transacciones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '...' : stats.total}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-lg">
              <ShoppingBag className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de ventas con datos reales y modo oscuro */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Historial de Ventas</h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500 mb-3"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando ventas...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No hay ventas registradas</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Las ventas aparecerán aquí una vez que se registren</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Producto</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Canal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                      #{sale.id}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">
                      Producto #{sale.product_id}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {sale.quantity} unidades
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ${sale.sale_price.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {sale.channel || 'Tienda'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
