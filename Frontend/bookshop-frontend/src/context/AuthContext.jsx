import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
    return user
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'Admin' || 
    (() => {
      try {
        const payload = JSON.parse(atob(token?.split('.')[1] || ''))
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        return role === 'Admin'
      } catch { return false }
    })()

  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ user, token, loading, isLoggedIn, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
