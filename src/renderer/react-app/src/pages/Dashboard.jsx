import React, { useState, useEffect } from 'react'
import { getProductos, getVentas, getDashboardKPIs } from '../api'

export default function Dashboard() {
  const [productosCount, setProductosCount] = useState('--')
  const [ventasCount, setVentasCount] = useState('--')
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const p = await getProductos()
        setProductosCount(p.success ? p.productos.length : '--')
      } catch (e) { setProductosCount('--') }

      try {
        const v = await getVentas()
        setVentasCount(v.success ? v.ventas.length : '--')
      } catch (e) { setVentasCount('--') }

      try {
        const kpis = await getDashboardKPIs()
        setAlertas(kpis.success ? kpis.alertas : [])
      } catch (e) { setAlertas([]) }
    }
    load()
  }, [])

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Productos</h5>
              <h2 className="text-primary">{productosCount}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Ventas</h5>
              <h2 className="text-success">{ventasCount}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Alertas</h5>
              <h2 className="text-warning">{alertas.length}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
