import React, { useState, useEffect } from 'react'
import { getVentas } from '../api'

export default function Ventas() {
  const [ventas, setVentas] = useState([])

  useEffect(() => {
    async function load() {
      try { 
        const res = await getVentas(); 
        setVentas(res.success ? res.ventas : []) 
      } catch(e){ 
        setVentas([]) 
      }
    }
    load()
  }, [])

  return (
    <div className="container mt-4">
      <h2>Ventas</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.product_name}</td>
                <td>{v.quantity}</td>
                <td>${v.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
