import React, { useEffect, useState } from 'react'
import { get } from '../api'

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  useEffect(() => {
    async function load() {
      try { const res = await get('/api/ventas'); setVentas(res.success ? res.ventas : []) } catch(e){ setVentas([]) }
    }
    load()
  }, [])
  return (
    <div className="container mt-4">
      <h3>Ventas</h3>
      <table className="table"><thead><tr><th>ID</th><th>Producto</th><th>Cantidad</th><th>Fecha</th></tr></thead>
      <tbody>{ventas.map(v=>(<tr key={v.id}><td>{v.id}</td><td>{v.product_name||v.product_id}</td><td>{v.quantity}</td><td>{v.sale_date}</td></tr>))}</tbody></table>
    </div>
  )
}
