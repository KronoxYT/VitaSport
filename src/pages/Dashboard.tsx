import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Productos"
          value="248"
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Valor Inventario"
          value="$45,231"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Ventas del Mes"
          value="$12,894"
          icon={TrendingUp}
          trend={{ value: 23, isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Stock Bajo"
          value="12"
          icon={AlertTriangle}
          trend={{ value: 3, isPositive: false }}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium text-gray-800">Producto actualizado</p>
                  <p className="text-sm text-gray-500">Hace 2 horas</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Inventario
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Productos más Vendidos</h2>
          <div className="space-y-4">
            {[
              { name: 'Proteína Whey 2kg', sales: 45, stock: 28 },
              { name: 'Creatina Monohidrato', sales: 38, stock: 15 },
              { name: 'BCAA 400g', sales: 32, stock: 42 },
              { name: 'Pre-Workout 300g', sales: 28, stock: 8 },
            ].map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-sm text-gray-500">Ventas: {product.sales}</span>
                    <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
