import { Package, ArrowUp, ArrowDown, History } from 'lucide-react';
import Button from '../components/Button';

export default function Inventory() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Inventario</h1>
        <div className="flex gap-3">
          <Button variant="secondary" icon={ArrowUp}>Entrada</Button>
          <Button variant="secondary" icon={ArrowDown}>Salida</Button>
          <Button icon={History}>Historial</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Stock Total</p>
              <p className="text-3xl font-bold text-gray-800">1,247</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Productos Únicos</p>
              <p className="text-3xl font-bold text-gray-800">248</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Stock Crítico</p>
              <p className="text-3xl font-bold text-gray-800">12</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Package className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Movimientos Recientes</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { type: 'entrada', product: 'Proteína Whey 2kg', quantity: 50, date: '2024-10-19 14:30' },
              { type: 'salida', product: 'Creatina Monohidrato', quantity: 15, date: '2024-10-19 12:15' },
              { type: 'entrada', product: 'BCAA 400g', quantity: 30, date: '2024-10-19 10:00' },
              { type: 'salida', product: 'Pre-Workout 300g', quantity: 8, date: '2024-10-18 16:45' },
            ].map((movement, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {movement.type === 'entrada' ? (
                      <ArrowUp className="text-green-600" size={20} />
                    ) : (
                      <ArrowDown className="text-red-600" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{movement.product}</p>
                    <p className="text-sm text-gray-500">{movement.date}</p>
                  </div>
                </div>
                <div className={`font-semibold ${
                  movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {movement.type === 'entrada' ? '+' : '-'}{movement.quantity} unidades
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
