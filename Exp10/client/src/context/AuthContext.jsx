import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!token) return setUser(null)
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setToken(res.data.token)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    setToken(res.data.token)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const logout = () => {
    setToken('')
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, login, register, logout }), [token, user])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
