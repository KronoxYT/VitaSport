import React, { createContext, useEffect, useState } from 'react'
import { post } from '../api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = sessionStorage.getItem('user')
    return s ? JSON.parse(s) : null
  })
  const [token, setToken] = useState(() => sessionStorage.getItem('token'))

  useEffect(() => {
    if (token) sessionStorage.setItem('token', token)
    else sessionStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) sessionStorage.setItem('user', JSON.stringify(user))
    else sessionStorage.removeItem('user')
  }, [user])

  async function login(username, password) {
    const data = await post('/api/usuarios/login', { username, password })
    if (data.success) {
      setToken(data.token)
      setUser(data.user || { username })
      return { success: true }
    }
    return { success: false, message: data.message }
  }

  function logout() {
    setToken(null)
    setUser(null)
    sessionStorage.clear()
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
