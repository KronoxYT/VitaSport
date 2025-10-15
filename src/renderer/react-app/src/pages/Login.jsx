import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    try {
      const data = await login(username, password)
      if (data.success) {
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('user', JSON.stringify(data.user || {}))
        nav('/')
      } else {
        setError(data.message || 'Credenciales inválidas')
      }
    } catch (err) {
      setError(err.message || 'Error de conexión')
    }
  }

  return (
    <div className="container mt-5">
      <div className="card mx-auto" style={{ maxWidth: 420 }}>
        <div className="card-body">
          <h3 className="card-title text-center">VitaSport</h3>
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Usuario</label>
              <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button className="btn btn-primary w-100" type="submit">Iniciar Sesión</button>
          </form>
        </div>
      </div>
    </div>
  )
}
