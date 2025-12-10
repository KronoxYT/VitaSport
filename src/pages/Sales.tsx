import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api';
import { Plus, DollarSign, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';

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

interface Product {
  id?: number;
  name: string;
  sale_price?: number;
}

interface CashMovement {
  id?: number;
  movement_type: string;
  amount: number;
  category?: string;
  description?: string;
  movement_date?: string;
  created_by?: number;
}

interface CashSummary {
  total_income: number;
  total_expense: number;
  balance: number;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<{ product_id: number; quantity: number; sale_price: number; discount?: number; channel?: string }>(
    { product_id: 0, quantity: 1, sale_price: 0, discount: 0, channel: 'Tienda' }
  );
  const [cashSummary, setCashSummary] = useState<CashSummary | null>(null);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [cashForm, setCashForm] = useState<{ movement_type: 'ingreso' | 'egreso'; amount: number; category: string; description: string }>(
    { movement_type: 'egreso', amount: 0, category: '', description: '' }
  );

  useEffect(() => {
    loadSales();
  }, []);

  const handleNewSale = async () => {
    setIsModalOpen(true);
    try {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const result = await invoke<Product[]>('get_products');
        setProducts(result);
        const first = result[0];
        setForm(prev => ({ ...prev, product_id: first?.id || 0, sale_price: first?.sale_price || 0 }));
      } else {
        setProducts([]);
      }
    } catch (e) {
      setProducts([]);
    }
  };

  const handleOpenCashMovement = () => {
    setCashForm({ movement_type: 'egreso', amount: 0, category: '', description: '' });
    setIsCashModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'product_id') {
      const pid = Number(value);
      const p = products.find(pr => pr.id === pid);
      setForm(prev => ({ ...prev, product_id: pid, sale_price: p?.sale_price || 0 }));
    } else if (name === 'quantity' || name === 'sale_price' || name === 'discount') {
      setForm(prev => ({ ...prev, [name]: Number(value) } as any));
    } else {
      setForm(prev => ({ ...prev, [name]: value } as any));
    }
  };

  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      setCashForm(prev => ({ ...prev, amount: Number(value) }));
    } else if (name === 'movement_type') {
      setCashForm(prev => ({ ...prev, movement_type: value === 'ingreso' ? 'ingreso' : 'egreso' }));
    } else {
      setCashForm(prev => ({ ...prev, [name]: value } as any));
    }
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.quantity <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    if (form.sale_price <= 0) {
      alert('El precio por unidad debe ser mayor a 0');
      return;
    }
    const discPct = Math.max(0, Math.min(100, Number(form.discount) || 0));
    try {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const unit = Number(form.sale_price) || 0;
        const qty = Number(form.quantity) || 0;
        const subtotal = unit * qty;
        const total = Math.max(0, Math.round(subtotal * (1 - discPct / 100)));
        const payload = {
          product_id: form.product_id,
          quantity: form.quantity,
          sale_price: total,
          discount: discPct,
          channel: form.channel,
          sale_date: new Date().toISOString(),
          created_by: null,
        };
        await invoke('add_sale', { sale: payload });
        setIsModalOpen(false);
        await loadSales();
        alert('Venta registrada');
      } else {
        alert('Ejecuta la app con backend para registrar ventas');
      }
    } catch (error) {
      const msg = typeof error === 'string'
        ? error
        : (error as any)?.message || (error as any)?.toString?.() || 'Error registrando venta';
      alert(msg);
    }
  };

  const handleSubmitCashMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cashForm.amount <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }
    try {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const payload = {
          movement_type: cashForm.movement_type,
          amount: cashForm.amount,
          category: cashForm.category || null,
          description: cashForm.description || null,
          movement_date: new Date().toISOString(),
          created_by: null,
        };
        await invoke('add_cash_movement', { movement: payload });
        setIsCashModalOpen(false);
        await loadSales();
        alert('Movimiento de caja registrado');
      } else {
        alert('Ejecuta la app con backend para registrar movimientos de caja');
      }
    } catch (error) {
      const msg = typeof error === 'string'
        ? error
        : (error as any)?.message || (error as any)?.toString?.() || 'Error registrando movimiento de caja';
      alert(msg);
    }
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
        const [result, summary, movements] = await Promise.all([
          invoke<Sale[]>('get_sales'),
          invoke<CashSummary>('get_cash_summary'),
          invoke<CashMovement[]>('get_cash_movements'),
        ]);
        setSales(result);
        setCashSummary(summary);
        setCashMovements(movements);

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
        setCashSummary({ total_income: 0, total_expense: 0, balance: 0 });
        setCashMovements([]);
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
      <Modal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        title="Nuevo Movimiento de Caja"
        size="md"
      >
        <form onSubmit={handleSubmitCashMovement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <select
                name="movement_type"
                value={cashForm.movement_type}
                onChange={handleCashChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Gasto / Egreso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={cashForm.amount}
                onChange={handleCashChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categor</label>
            <input
              type="text"
              name="category"
              value={cashForm.category}
              onChange={handleCashChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="Alquiler, Servicios, Sueldo, Otros"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripcion</label>
            <input
              type="text"
              name="description"
              value={cashForm.description}
              onChange={handleCashChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="Detalle del gasto o ingreso"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCashModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Registrar Movimiento</Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Venta"
        size="md"
      >
        <form onSubmit={handleSubmitSale} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Producto</label>
            <select name="product_id" value={form.product_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio x Unidad</label>
              <input type="number" step="0.01" name="sale_price" value={form.sale_price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descuento (%)</label>
              <input type="number" step="0.01" min="0" max="100" name="discount" value={form.discount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canal</label>
            <select name="channel" value={form.channel} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
              <option value="Tienda">Tienda</option>
              <option value="Online">Online</option>
              <option value="Redes">Redes</option>
            </select>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Subtotal</span>
              <span>${((Number(form.sale_price) || 0) * (Number(form.quantity) || 0)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400 mt-1">
              <span>Descuento</span>
              <span>{Math.max(0, Math.min(100, Number(form.discount) || 0)).toLocaleString()}%</span>
            </div>
            <div className="flex justify-between text-gray-900 dark:text-gray-100 font-semibold mt-2">
              <span>Total</span>
              <span>{(() => {
                const unit = Number(form.sale_price) || 0;
                const qty = Number(form.quantity) || 0;
                const subtotal = unit * qty;
                const disc = Math.max(0, Math.min(100, Number(form.discount) || 0));
                const total = Math.max(0, Math.round(subtotal * (1 - disc / 100)));
                return `$${total.toLocaleString()}`;
              })()}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Registrar Venta</Button>
          </div>
        </form>
      </Modal>
      {/* Header con modo oscuro */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Ventas</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Registro de transacciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleOpenCashMovement}>Movimiento de Caja</Button>
          <Button icon={Plus} onClick={handleNewSale}>Nueva Venta</Button>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading || !cashSummary ? '...' : `$${cashSummary.total_income.toLocaleString()}`}
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
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Gastos / Egresos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading || !cashSummary ? '...' : `$${cashSummary.total_expense.toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg">
              <DollarSign className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Balance Caja</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading || !cashSummary ? '...' : `$${cashSummary.balance.toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Movimientos de Caja</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500 mb-3"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando movimientos de caja...</p>
            </div>
          ) : cashMovements.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No hay movimientos de caja registrados</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Los ingresos, egresos y gastos aparecerán aqu una vez que se registren</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Monto</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Categor</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Descripcion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {cashMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {m.movement_date ? new Date(m.movement_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${m.movement_type === 'ingreso' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {m.movement_type === 'ingreso' ? 'Ingreso' : 'Gasto / Egreso'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ${m.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {m.category || '-'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {m.description || '-'}
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
