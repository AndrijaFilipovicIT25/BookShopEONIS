import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return null
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
