export const InventoryTable = ({ 
  data, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-card shadow-card">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-content-primary">Inventario</h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-content-light uppercase tracking-wider">
              Producto
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-content-light uppercase tracking-wider">
              Categoría
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-content-light uppercase tracking-wider">
              Stock
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-content-light uppercase tracking-wider">
              Precio
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-content-light uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr 
              key={item.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-content-primary">
                      {item.name}
                    </div>
                    <div className="text-sm text-content-light">
                      SKU: {item.sku}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                {item.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                {item.stock}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                ${item.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`
                  px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${item.stock > 10 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                  }
                `}>
                  {item.stock > 10 ? 'En Stock' : 'Stock Bajo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-primary-500 hover:text-primary-700 mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};