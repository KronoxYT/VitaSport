import React, { useEffect, useState } from 'react'
import { get } from '../api'

export default function Dashboard() {
  const [productosCount, setProductosCount] = useState('--')
  const [ventasCount, setVentasCount] = useState('--')
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const p = await get('/api/productos')
        setProductosCount(p.success ? p.productos.length : '--')
      } catch (e) { setProductosCount('--') }

      try {
        const v = await get('/api/ventas')
        setVentasCount(v.success ? v.ventas.length : '--')
      } catch (e) { setVentasCount('--') }

      try {
        const a = await get('/api/alertas/stock-bajo')
        setAlertas(a.success ? a.alertas : [])
      } catch (e) { setAlertas([]) }
    }
    load()
  }, [])

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>
      <div className="row mt-3">
        <div className="col-sm-4">
          <div className="card p-3">
            <h6>Productos Totales</h6>
            <div style={{fontSize:24,fontWeight:600}}>{productosCount}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card p-3">
            <h6>Ventas Totales (Unidades)</h6>
            <div style={{fontSize:24,fontWeight:600}}>{ventasCount}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card p-3">
            <h6>Alertas de Stock Bajo</h6>
            <div>{alertas.length} items</div>
          </div>
        </div>
      </div>

    </div>
  )
}
