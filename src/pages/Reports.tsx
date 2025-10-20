import { FileText, Download, Calendar } from 'lucide-react';
import Button from '../components/Button';

export default function Reports() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
        <Button icon={Download}>Exportar Reportes</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[
          { title: 'Reporte de Ventas', description: 'Análisis detallado de ventas por período', icon: FileText },
          { title: 'Reporte de Inventario', description: 'Estado actual del inventario', icon: FileText },
          { title: 'Productos Más Vendidos', description: 'Top 10 productos por ventas', icon: FileText },
          { title: 'Análisis de Rentabilidad', description: 'Márgenes y ganancias por producto', icon: FileText },
          { title: 'Movimientos de Stock', description: 'Historial de entradas y salidas', icon: FileText },
          { title: 'Reporte Financiero', description: 'Resumen financiero mensual', icon: FileText },
        ].map((report, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <report.icon className="text-primary-600" size={24} />
              </div>
              <Button variant="secondary" icon={Download} className="!p-2">
                <span className="sr-only">Descargar</span>
              </Button>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{report.title}</h3>
            <p className="text-sm text-gray-500">{report.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Generar Reporte Personalizado</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option>Ventas</option>
              <option>Inventario</option>
              <option>Financiero</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        <Button icon={FileText}>Generar Reporte</Button>
      </div>
    </div>
  );
}
