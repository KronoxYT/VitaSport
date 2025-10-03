import React, { useEffect, useState } from 'react'
import { get } from '../api'

export default function Inventario() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await get('/api/productos')
        setProductos(res.success ? res.productos : [])
      } catch (e) { setProductos([]) }
    }
    load()
  }, [])

  return (
    <div className="container mt-4">
      <h3>Inventario</h3>
      <table className="table table-striped">
        <thead><tr><th>ID</th><th>Nombre</th><th>Stock</th><th>Precio</th></tr></thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}><td>{p.id}</td><td>{p.name}</td><td>{p.stock}</td><td>{p.price}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
