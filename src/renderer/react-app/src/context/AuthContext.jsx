import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react'
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

  // Memoize login function to prevent unnecessary re-renders
  const login = useCallback(async (username, password) => {
    const data = await post('/api/usuarios/login', { username, password })
    if (data.success) {
      setToken(data.token)
      setUser(data.user || { username })
      return { success: true }
    }
    return { success: false, message: data.message }
  }, [])

  // Memoize logout function to prevent unnecessary re-renders
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    sessionStorage.clear()
  }, [])

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token, login, logout]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
