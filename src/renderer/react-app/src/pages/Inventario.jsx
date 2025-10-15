import React, { useState, useEffect } from 'react'
import { getProductos } from '../api'

export default function Inventario() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await getProductos()
        setProductos(res.success ? res.productos : [])
      } catch (e) { setProductos([]) }
    }
    load()
  }, [])

  return (
    <div className="container mt-4">
      <h2>Inventario</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
