import { useState } from 'react';
import Button from './Button';

interface ProductFormData {
  sku?: string;
  name: string;
  brand?: string;
  category?: string;
  presentation?: string;
  flavor?: string;
  weight?: string;
  sale_price?: number;
  expiry_date?: string;
  lot_number?: string;
  min_stock?: number;
  location?: string;
  status?: string;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

export default function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialData || {
    name: '',
    sku: '',
    brand: '',
    category: '',
    presentation: '',
    flavor: '',
    weight: '',
    sale_price: 0,
    expiry_date: '',
    lot_number: '',
    min_stock: 5,
    location: '',
    status: 'Activo',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Formulario enviado con datos:', formData);
    
    // Validación: nombre es requerido
    if (!formData.name || formData.name.trim() === '') {
      alert('⚠️ El campo "Nombre" es obligatorio');
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sale_price' || name === 'min_stock' ? Number(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Ej: PROT-001"
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Nombre del producto"
          />
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: Optimum Nutrition"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Seleccionar categoría</option>
            <option value="Suplementos">Suplementos</option>
            <option value="Proteínas">Proteínas</option>
            <option value="Aminoácidos">Aminoácidos</option>
            <option value="Energéticos">Energéticos</option>
            <option value="Vitaminas">Vitaminas</option>
            <option value="Snacks">Snacks</option>
            <option value="Accesorios">Accesorios</option>
          </select>
        </div>

        {/* Presentación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Presentación
          </label>
          <input
            type="text"
            name="presentation"
            value={formData.presentation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: Polvo, Cápsulas, Líquido"
          />
        </div>

        {/* Sabor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sabor
          </label>
          <input
            type="text"
            name="flavor"
            value={formData.flavor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: Chocolate, Vainilla"
          />
        </div>

        {/* Peso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peso
          </label>
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: 2kg, 500g"
          />
        </div>

        {/* Precio de Venta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio de Venta
          </label>
          <input
            type="number"
            name="sale_price"
            value={formData.sale_price}
            onChange={handleChange}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        {/* Vencimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vencimiento
          </label>
          <input
            type="date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Lote */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lote
          </label>
          <input
            type="text"
            name="lot_number"
            value={formData.lot_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Número de lote"
          />
        </div>

        {/* Stock Mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Mínimo
          </label>
          <input
            type="number"
            name="min_stock"
            value={formData.min_stock}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="5"
          />
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: Estante A1"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Descontinuado">Descontinuado</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Guardar
        </Button>
      </div>
    </form>
  );
}
