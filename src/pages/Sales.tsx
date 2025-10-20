import { Plus, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import Button from '../components/Button';

export default function Sales() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Ventas</h1>
        <Button icon={Plus}>Nueva Venta</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Ventas Hoy</p>
              <p className="text-3xl font-bold text-gray-800">$2,847</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Ventas del Mes</p>
              <p className="text-3xl font-bold text-gray-800">$45,231</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Transacciones</p>
              <p className="text-3xl font-bold text-gray-800">142</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ShoppingBag className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Últimas Ventas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { id: 'VEN-001', date: '19/10/2024', client: 'Juan Pérez', items: 3, total: 125000, status: 'Completada' },
                { id: 'VEN-002', date: '19/10/2024', client: 'María García', items: 2, total: 76000, status: 'Completada' },
                { id: 'VEN-003', date: '18/10/2024', client: 'Carlos López', items: 1, total: 45000, status: 'Completada' },
                { id: 'VEN-004', date: '18/10/2024', client: 'Ana Martínez', items: 4, total: 152000, status: 'Pendiente' },
              ].map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sale.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sale.client}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sale.items} productos</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${sale.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sale.status === 'Completada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
