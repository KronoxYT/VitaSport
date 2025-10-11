import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Inventario = lazy(() => import('./pages/Inventario'))
const Ventas = lazy(() => import('./pages/Ventas'))
const Usuarios = lazy(() => import('./pages/Usuarios'))
const Reportes = lazy(() => import('./pages/Reportes'))
const Layout = lazy(() => import('./components/Layout'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

function PrivateRoute({ children }) {
  const token = sessionStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
