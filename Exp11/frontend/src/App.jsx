import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Leaves from './pages/Leaves'
import api, { setAuthToken, getUserFromStorage, saveAuth } from './api/client'
import ManagerApprovals from './pages/ManagerApprovals'
import AdminUsers from './pages/AdminUsers'
import AdminApprovals from './pages/AdminApprovals'

function ProtectedRoute({ children }) {
  const user = getUserFromStorage()
  if (!user?.token) return <Navigate to="/login" replace />
  return children
}

function NavBar() {
  const [user, setUser] = useState(getUserFromStorage())
  const navigate = useNavigate()

  useEffect(() => {
    const onStorage = () => setUser(getUserFromStorage())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const logout = () => {
    localStorage.removeItem('auth')
    setAuthToken(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="bg-white border-b">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-blue-700">LeaveMS</Link>
          {user?.token && (
            <>
              <Link to="/" className="text-sm text-gray-700 hover:text-gray-900">Dashboard</Link>
              <Link to="/leaves" className="text-sm text-gray-700 hover:text-gray-900">Leaves</Link>
              {user?.user?.role === 'team_manager' && (
                <>
                  <Link to="/manager/approvals" className="text-sm text-gray-700 hover:text-gray-900">Approvals</Link>
                </>
              )}
              {user?.user?.role === 'general_manager' && (
                <>
                  <Link to="/admin/users" className="text-sm text-gray-700 hover:text-gray-900">Users</Link>
                  <Link to="/admin/approvals" className="text-sm text-gray-700 hover:text-gray-900">Approvals</Link>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user?.user?.name && <span className="text-sm text-gray-600">{user.user.name}</span>}
          {user?.token ? (
            <button className="btn" onClick={logout}>Logout</button>
          ) : (
            <Link className="btn" to="/login">Login</Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    const auth = getUserFromStorage()
    if (auth?.token) setAuthToken(auth.token)
  }, [])

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="container py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute><Leaves /></ProtectedRoute>} />
          {/* Manager routes */}
          <Route path="/manager/approvals" element={<ProtectedRoute><ManagerApprovals /></ProtectedRoute>} />
          {/* Admin routes */}
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute><AdminApprovals /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
