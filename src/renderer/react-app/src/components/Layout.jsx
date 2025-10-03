import React, { useContext } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useContext(AuthContext)
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">VitaSport</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/inventario">Inventario</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/ventas">Ventas</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/usuarios">Usuarios</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/reportes">Reportes</Link></li>
            </ul>
            <div className="d-flex">
              <span className="me-2">{user ? `${user.username}` : ''}</span>
              <button className="btn btn-outline-secondary" onClick={logout}>Salir</button>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
